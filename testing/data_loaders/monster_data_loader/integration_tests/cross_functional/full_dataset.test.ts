/**
 * Integration tests for MonsterDataLoader with full dataset
 * Tests loading and validation of all 9 Zork monsters
 */

import '../setup';
import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType } from '../../../../../src/types/MonsterTypes';
import { 
  MonsterValidationTestHelper,
  PerformanceTestHelper
} from '../../../../utils/test_helpers';

describe('MonsterDataLoader Full Dataset Integration', () => {
  let loader: MonsterDataLoader;
  const ACTUAL_DATA_PATH = 'data/monsters/';

  beforeEach(() => {
    loader = new MonsterDataLoader(ACTUAL_DATA_PATH);
  });

  describe('Complete dataset loading', () => {
    it('should load all 9 Zork monsters successfully', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      expect(allMonsters).toHaveLength(9);
      
      // Verify all expected monsters are present
      const monsterIds = allMonsters.map(m => m.id).sort();
      expect(monsterIds).toEqual([
        'cyclops',
        'ghost',
        'gnome_of_zurich',
        'grue',
        'guardian_of_zork',
        'thief',
        'troll',
        'vampire_bat',
        'volcano_gnome'
      ]);
    });

    it('should load correct counts by type', async () => {
      // Act
      const humanoids = await loader.getMonstersByType(MonsterType.HUMANOID);
      const creatures = await loader.getMonstersByType(MonsterType.CREATURE);
      const environmental = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL);

      // Assert - Based on actual data distribution
      expect(humanoids).toHaveLength(5);
      expect(humanoids.map(m => m.id).sort()).toEqual([
        'cyclops',
        'gnome_of_zurich',
        'guardian_of_zork',
        'thief',
        'troll'
      ]);

      expect(creatures).toHaveLength(2);
      expect(creatures.map(m => m.id).sort()).toEqual([
        'ghost',
        'volcano_gnome'
      ]);

      expect(environmental).toHaveLength(2);
      expect(environmental.map(m => m.id).sort()).toEqual([
        'grue',
        'vampire_bat'
      ]);
    });

    it('should return correct total count', async () => {
      // Act
      const count = await loader.getTotalCount();

      // Assert
      expect(count).toBe(9);
    });
  });

  describe('Individual monster verification', () => {
    it('should load thief with all MDL properties', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.id).toBe('thief');
      expect(thief.name).toBe('thief');
      expect(thief.type).toBe('humanoid');
      expect(thief.combatStrength).toBe(5);
      expect(thief.behaviorFunction).toBe('ROBBER-FUNCTION');
      expect(thief.movementDemon).toBe('ROBBER-DEMON');
      expect(thief.meleeMessages).toBeDefined();
      expect(thief.meleeMessages?.miss).toBeDefined();
      expect(thief.meleeMessages?.miss!.length).toBeGreaterThan(0);
      expect(thief.inventory).toContain('stiletto');
      expect(thief.startingSceneId).toBe('treasure_room');
    });

    it('should load troll with guardian properties', async () => {
      // Act
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(troll.id).toBe('troll');
      expect(troll.type).toBe('humanoid');
      expect(troll.combatStrength).toBe(2);
      expect(troll.inventory).toContain('axe');
      expect(troll.flags.VILLAIN).toBe(true);
      expect(troll.variables.isGuarding).toBe(true);
      expect(troll.variables.hasBeenPaid).toBe(false);
    });

    it('should load grue with environmental properties', async () => {
      // Act
      const grue = await loader.loadMonster('grue');

      // Assert
      expect(grue.id).toBe('grue');
      expect(grue.type).toBe('environmental');
      expect(grue.combatStrength).toBeUndefined();
      expect(grue.flags.OVISON).toBe(true);
      expect(grue.properties.requiresDarkness).toBe(true);
      expect(grue.state).toBe('lurking'); // Inferred from INVISIBLE flag
    });

    it('should verify all monsters exist', async () => {
      // Arrange
      const expectedMonsters = [
        'thief', 'troll', 'cyclops', 'grue', 'ghost',
        'volcano_gnome', 'gnome_of_zurich', 'guardian_of_zork', 'vampire_bat'
      ];

      // Act & Assert
      for (const monsterId of expectedMonsters) {
        const exists = await loader.monsterExists(monsterId);
        expect(exists).toBe(true);
      }

      // Verify non-existent
      const dragonExists = await loader.monsterExists('dragon');
      expect(dragonExists).toBe(false);
    });
  });

  describe('Monster data integrity', () => {
    it('should have valid structure for all monsters', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        MonsterValidationTestHelper.validateMonsterStructure(monster);
      }
    });

    it('should have unique IDs', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const ids = allMonsters.map(m => m.id);

      // Assert
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid movement patterns', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      const validPatterns = ['stationary', 'random', 'patrol', 'follow', 'flee'];
      for (const monster of allMonsters) {
        expect(validPatterns).toContain(monster.movementPattern);
      }
    });

    it('should have valid states', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      const validStates = ['idle', 'alert', 'hostile', 'fleeing', 'friendly', 
                          'dead', 'guarding', 'wandering', 'lurking', 'sleeping'];
      for (const monster of allMonsters) {
        expect(validStates).toContain(monster.state);
      }
    });
  });

  describe('Scene distribution', () => {
    it('should load monsters by starting scene', async () => {
      // Act
      const treasureRoomMonsters = await loader.getMonstersInScene('treasure_room');
      const trollRoomMonsters = await loader.getMonstersInScene('troll_room');

      // Assert
      expect(treasureRoomMonsters.map(m => m.id)).toContain('thief');
      expect(trollRoomMonsters.map(m => m.id)).toContain('troll');
    });

    it('should handle scenes with no monsters', async () => {
      // Act
      const emptyRoom = await loader.getMonstersInScene('west_of_house');

      // Assert
      expect(emptyRoom).toHaveLength(0);
    });
  });

  describe('Performance with real data', () => {
    it('should load all monsters within performance requirements', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.loadAllMonsters()
      );

      // Assert
      expect(duration).toBeLessThan(100); // < 100ms for 9 monsters
    });

    it('should load individual monsters quickly', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.loadMonster('thief')
      );

      // Assert
      expect(duration).toBeLessThan(10); // < 10ms for single monster
    });

    it('should filter by type efficiently', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getMonstersByType(MonsterType.HUMANOID)
      );

      // Assert
      expect(duration).toBeLessThan(150); // < 150ms for type filtering
    });
  });

  describe('MDL property verification', () => {
    it('should have combat strength for combat-capable monsters', async () => {
      // Act
      const combatMonsters = ['thief', 'troll'];
      
      for (const monsterId of combatMonsters) {
        const monster = await loader.loadMonster(monsterId);
        
        // Assert
        expect(monster.combatStrength).toBeDefined();
        expect(monster.combatStrength).toBeGreaterThan(0);
      }
    });

    it('should have melee messages for monsters with combat', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(thief.meleeMessages).toBeDefined();
      expect(thief.meleeMessages?.miss).toBeDefined();
      expect(thief.meleeMessages?.kill).toBeDefined();

      expect(troll.meleeMessages).toBeDefined();
      expect(troll.meleeMessages?.miss).toBeDefined();
    });

    it('should have behavior functions where applicable', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(thief.behaviorFunction).toBe('ROBBER-FUNCTION');
      expect(troll.behaviorFunction).toBeUndefined();
    });

    it('should have movement demons where applicable', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.movementDemon).toBe('ROBBER-DEMON');
      expect(thief.movementPattern).toBe('follow'); // Inferred from demon
    });
  });

  describe('Special monster properties', () => {
    it('should initialize thief-specific variables', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.variables.hasStolen).toBe(false);
      expect(thief.variables.stolenItems).toEqual([]);
      expect(thief.variables.engagedInCombat).toBe(false);
    });

    it('should initialize cyclops-specific variables', async () => {
      // Act
      const cyclops = await loader.loadMonster('cyclops');

      // Assert
      expect(cyclops.variables.isAsleep).toBe(true);
      expect(cyclops.variables.hasBeenAwakened).toBe(false);
    });

    it('should handle ghost incorporeal properties', async () => {
      // Act
      const ghost = await loader.loadMonster('ghost');

      // Assert
      expect(ghost.type).toBe('creature');
      expect(ghost.flags.OVISON).toBe(true);
      expect(ghost.properties).toEqual({});
    });
  });
});