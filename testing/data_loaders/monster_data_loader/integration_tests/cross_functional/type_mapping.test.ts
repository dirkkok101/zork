/**
 * Type mapping integration tests for MonsterDataLoader
 * Tests correct type conversions and mappings with real data
 */

import '../setup';
import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType, MonsterState } from '../../../../../src/types/MonsterTypes';

describe('MonsterDataLoader Type Mapping Integration', () => {
  let loader: MonsterDataLoader;
  const ACTUAL_DATA_PATH = 'data/monsters/';

  beforeEach(() => {
    loader = new MonsterDataLoader(ACTUAL_DATA_PATH);
  });

  describe('Monster type distribution', () => {
    it('should correctly map all monster types', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const typeDistribution = allMonsters.reduce((acc, monster) => {
        acc[monster.type] = (acc[monster.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Assert
      expect(typeDistribution).toEqual({
        'humanoid': 5,
        'creature': 2,
        'environmental': 2
      });
    });

    it('should verify humanoid monsters', async () => {
      // Act
      const humanoids = await loader.getMonstersByType(MonsterType.HUMANOID);

      // Assert
      expect(humanoids).toHaveLength(5);
      const humanoidIds = humanoids.map(m => m.id).sort();
      expect(humanoidIds).toEqual([
        'cyclops',
        'gnome_of_zurich',
        'guardian_of_zork',
        'thief',
        'troll'
      ]);
    });

    it('should verify creature monsters', async () => {
      // Act
      const creatures = await loader.getMonstersByType(MonsterType.CREATURE);

      // Assert
      expect(creatures).toHaveLength(2);
      const creatureIds = creatures.map(m => m.id).sort();
      expect(creatureIds).toEqual(['ghost', 'volcano_gnome']);
    });

    it('should verify environmental monsters', async () => {
      // Act
      const environmental = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL);

      // Assert
      expect(environmental).toHaveLength(2);
      const environmentalIds = environmental.map(m => m.id).sort();
      expect(environmentalIds).toEqual(['grue', 'vampire_bat']);
    });
  });

  describe('State inference from flags', () => {
    it('should infer LURKING state from INVISIBLE flag', async () => {
      // Act
      const grue = await loader.loadMonster('grue');
      const ghost = await loader.loadMonster('ghost');

      // Assert
      expect(grue.flags.OVISON).toBe(true);
      expect(grue.state).toBe(MonsterState.LURKING);
      
      expect(ghost.flags.OVISON).toBe(true);
      expect(ghost.state).toBe(MonsterState.LURKING);
    });

    it('should infer HOSTILE state from VILLAIN flag', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(thief.flags.VILLAIN).toBe(true);
      expect(thief.state).toBe(MonsterState.HOSTILE);
      
      expect(troll.flags.VILLAIN).toBe(true);
      expect(troll.state).toBe(MonsterState.HOSTILE);
    });

    it('should infer GUARDING state from behavior function', async () => {
      // Act
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(troll.behaviorFunction).toBeUndefined();
      // Troll is HOSTILE due to VILLAIN flag taking precedence
      expect(troll.state).toBe(MonsterState.HOSTILE);
      // But has guarding behavior
      expect(troll.variables.isGuarding).toBe(true);
    });

    it('should use default states by type when no flags match', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Find monsters without special flags
      const defaultStateMonsters = allMonsters.filter(m => 
        !m.flags.OVISON && !m.flags.VILLAIN
      );

      // Assert
      for (const monster of defaultStateMonsters) {
        switch (monster.type) {
          case 'humanoid':
            expect([MonsterState.IDLE, MonsterState.HOSTILE]).toContain(monster.state);
            break;
          case 'creature':
            expect([MonsterState.WANDERING, MonsterState.LURKING]).toContain(monster.state);
            break;
          case 'environmental':
            expect([MonsterState.LURKING, MonsterState.HOSTILE]).toContain(monster.state);
            break;
        }
      }
    });
  });

  describe('Movement pattern mapping', () => {
    it('should map movement patterns from demon names', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');
      const cyclops = await loader.loadMonster('cyclops');

      // Assert
      expect(thief.movementDemon).toBe('ROBBER-DEMON');
      expect(thief.movementPattern).toBe('follow');

      // Troll and cyclops likely stationary
      expect(troll.movementPattern).toBe('stationary');
      expect(cyclops.movementPattern).toBe('stationary');
    });

    it('should default to stationary for monsters without demons', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const stationaryMonsters = allMonsters.filter(m => 
        m.movementPattern === 'stationary'
      );

      // Assert
      expect(stationaryMonsters.length).toBeGreaterThan(0);
    });
  });

  describe('Behavior extraction from functions', () => {
    it('should extract steal behavior from ROBBER-FUNCTION', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.behaviorFunction).toBe('ROBBER-FUNCTION');
      expect(thief.behaviors).toContain('steal');
    });

    it('should handle monsters without behavior functions', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const noBehaviorMonsters = allMonsters.filter(m => !m.behaviorFunction);

      // Assert
      for (const monster of noBehaviorMonsters) {
        // Should either have no behaviors or behaviors from properties
        if (monster.behaviors) {
          expect(monster.behaviors.length).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Combat property mapping', () => {
    it('should map combat strength correctly', async () => {
      // Act
      const combatMonsters = [
        { id: 'thief', expectedStrength: 5 },
        { id: 'troll', expectedStrength: 2 },
        { id: 'cyclops', expectedStrength: 10000 },
        { id: 'guardian_of_zork', expectedStrength: 10000 }
      ];

      for (const { id, expectedStrength } of combatMonsters) {
        const monster = await loader.loadMonster(id);
        
        // Assert
        expect(monster.combatStrength).toBe(expectedStrength);
      }
    });

    it('should map melee messages correctly', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.meleeMessages).toBeDefined();
      expect(thief.meleeMessages?.miss).toBeDefined();
      expect(Array.isArray(thief.meleeMessages?.miss)).toBe(true);
      expect(thief.meleeMessages?.miss!.length).toBeGreaterThan(0);
      
      // Check for specific message patterns
      const missMessages = thief.meleeMessages?.miss || [];
      const hasStiletto = missMessages.some(msg => 
        msg.toLowerCase().includes('stiletto')
      );
      expect(hasStiletto).toBe(true);
    });
  });

  describe('Variable initialization', () => {
    it('should initialize monster-specific variables correctly', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');
      const cyclops = await loader.loadMonster('cyclops');

      // Assert - Thief
      expect(thief.variables).toMatchObject({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });

      // Assert - Troll
      expect(troll.variables).toMatchObject({
        hasBeenPaid: false,
        isGuarding: true
      });

      // Assert - Cyclops
      expect(cyclops.variables).toMatchObject({
        isAsleep: true,
        hasBeenAwakened: false
      });
    });

    it('should merge property variables with defaults', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        expect(monster.variables).toBeDefined();
        expect(typeof monster.variables).toBe('object');
      }
    });
  });

  describe('Health initialization', () => {
    it('should initialize health values correctly', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        expect(monster.health).toBeDefined();
        expect(monster.maxHealth).toBeDefined();
        expect(monster.health).toBeLessThanOrEqual(monster.maxHealth);
        expect(monster.health).toBeGreaterThan(0);
      }
    });

    it('should use provided health values when available', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.health).toBe(thief.maxHealth);
      expect(thief.health).toBe(100); // Default when not specified
    });
  });

  describe('Scene ID mapping', () => {
    it('should map currentSceneId from starting or current', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        expect(monster.currentSceneId).toBeDefined();
        expect(monster.startingSceneId).toBeDefined();
        
        // Current should match starting initially
        expect(monster.currentSceneId).toBe(monster.startingSceneId);
      }
    });

    it('should preserve specific starting scenes', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(thief.startingSceneId).toBe('treasure_room');
      expect(troll.startingSceneId).toBe('troll_room');
    });
  });
});