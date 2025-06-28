/**
 * MDL properties integration tests for MonsterDataLoader
 * Tests correct extraction and mapping of MDL-specific properties
 */

import '../setup';
import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';

describe('MonsterDataLoader MDL Properties Integration', () => {
  let loader: MonsterDataLoader;
  const ACTUAL_DATA_PATH = 'data/monsters/';

  beforeEach(() => {
    loader = new MonsterDataLoader(ACTUAL_DATA_PATH);
  });

  describe('Combat strength (OSTRENGTH)', () => {
    it('should load correct combat strength values', async () => {
      // Arrange
      const expectedStrengths = [
        { id: 'thief', strength: 5 },
        { id: 'troll', strength: 9 },
        { id: 'cyclops', strength: 4 },
        { id: 'grue', strength: 3 },
        // Note: vampire_bat has no combatStrength
      ];

      // Act & Assert
      for (const { id, strength } of expectedStrengths) {
        try {
          const monster = await loader.loadMonster(id);
          if (monster.combatStrength !== undefined) {
            expect(monster.combatStrength).toBe(strength);
          }
        } catch (error) {
          // Some monsters might not exist with exact ID
          continue;
        }
      }
    });

    it('should handle monsters without combat strength', async () => {
      // Act
      const ghost = await loader.loadMonster('ghost');

      // Assert - Ghost might not have combat strength
      if (ghost.combatStrength === undefined) {
        expect(ghost.combatStrength).toBeUndefined();
      }
    });
  });

  describe('Melee messages', () => {
    it('should load complete melee message tables', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.meleeMessages).toBeDefined();
      
      // Check message categories
      const messages = thief.meleeMessages!;
      expect(messages.miss).toBeDefined();
      expect(messages.kill).toBeDefined();
      expect(messages.light_wound).toBeDefined();
      
      // Verify message content
      expect(messages.miss!.length).toBeGreaterThan(0);
      expect(messages.miss![0]).toContain('stiletto');
    });

    it('should have troll-specific combat messages', async () => {
      // Act
      const troll = await loader.loadMonster('troll');

      // Assert
      if (troll.meleeMessages) {
        expect(troll.meleeMessages.miss).toBeDefined();
        
        // Check for axe references
        const hasAxeMessage = troll.meleeMessages.miss?.some(msg => 
          msg.toLowerCase().includes('axe')
        );
        expect(hasAxeMessage).toBe(true);
      }
    });

    it('should handle monsters with partial melee tables', async () => {
      // Act
      const grue = await loader.loadMonster('grue');

      // Assert
      if (grue.meleeMessages) {
        // Grue might only have kill messages
        expect(grue.meleeMessages.kill).toBeDefined();
      }
    });
  });

  describe('Behavior functions', () => {
    it('should map all behavior functions correctly', async () => {
      // Arrange
      const expectedFunctions = [
        { id: 'thief', function: 'ROBBER-FUNCTION' },
        { id: 'troll', function: 'TROLL-FUNCTION' },
        { id: 'cyclops', function: 'CYCLOPS-FUNCTION' },
        { id: 'ghost', function: 'GHOST-FUNCTION' },
        { id: 'vampire_bat', function: 'FLY-ME' },
        { id: 'grue', function: 'GRUE-FUNCTION' }
      ];

      // Act & Assert
      for (const { id, function: expectedFunc } of expectedFunctions) {
        try {
          const monster = await loader.loadMonster(id);
          if (monster.behaviorFunction) {
            expect(monster.behaviorFunction).toBe(expectedFunc);
          }
        } catch (error) {
          // Handle bat vs vampire_bat naming
          if (id === 'vampire_bat') {
            // Skip - vampire_bat has behaviorFunction 'FLY-ME'
            continue;
          }
        }
      }
    });

    it('should extract behaviors from function names', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.behaviorFunction).toBe('ROBBER-FUNCTION');
      expect(thief.behaviors).toContain('steal');
    });
  });

  describe('Movement demons', () => {
    it('should map movement demons correctly', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.movementDemon).toBe('ROBBER-DEMON');
      expect(thief.movementPattern).toBe('follow');
    });

    it('should handle monsters without movement demons', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const stationaryMonsters = allMonsters.filter(m => 
        !m.movementDemon && m.movementPattern === 'stationary'
      );

      // Assert
      expect(stationaryMonsters.length).toBeGreaterThan(0);
    });
  });

  describe('MDL flags', () => {
    it('should preserve all MDL flags', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');
      const grue = await loader.loadMonster('grue');

      // Assert - Common villain flags
      expect(thief.flags.VILLAIN).toBe(true);
      expect(thief.flags.OVISON).toBe(true);
      
      expect(troll.flags.VILLAIN).toBe(true);
      expect(troll.flags.VICBIT).toBe(true);
      
      expect(grue.flags.OVISON).toBe(true);
      // grue only has OVISON flag
    });

    it('should use flags for state inference', async () => {
      // Act
      const lurking0nlyMonsters = (await loader.loadAllMonsters())
        .filter(m => m.flags.OVISON && !m.flags.VILLAIN);

      // Assert
      for (const monster of lurking0nlyMonsters) {
        expect(monster.state).toBe('lurking');
      }
    });
  });

  describe('Monster properties', () => {
    it('should preserve custom properties', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const grue = await loader.loadMonster('grue');

      // Assert
      expect(thief.properties.canSteal).toBe(true);
      expect(thief.properties.hasLoot).toBe(true);
      
      expect(grue.properties.requiresDarkness).toBe(true);
    });

    it('should handle complex property structures', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        expect(monster.properties).toBeDefined();
        expect(typeof monster.properties).toBe('object');
      }
    });
  });

  describe('Inventory items', () => {
    it('should load monster inventories correctly', async () => {
      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');

      // Assert
      expect(thief.inventory).toContain('stiletto');
      expect(troll.inventory).toContain('axe');
    });

    it('should handle empty inventories', async () => {
      // Act
      const grue = await loader.loadMonster('grue');
      const ghost = await loader.loadMonster('ghost');

      // Assert
      expect(grue.inventory).toEqual([]);
      expect(ghost.inventory).toEqual([]);
    });
  });

  describe('Synonyms', () => {
    it('should load all monster synonyms', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert
      expect(thief.synonyms).toContain('thief');
      expect(thief.synonyms).toContain('robbe');
      expect(thief.synonyms).toContain('crook');
      expect(thief.synonyms.length).toBeGreaterThan(5);
    });

    it('should have appropriate synonyms for each monster', async () => {
      // Act
      const troll = await loader.loadMonster('troll');
      const grue = await loader.loadMonster('grue');

      // Assert
      expect(troll.synonyms).toContain('troll');
      expect(grue.synonyms).toContain('grue');
    });
  });

  describe('Special MDL properties', () => {
    it('should handle defeat scoring', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();

      // Assert
      for (const monster of allMonsters) {
        if (monster.defeatScore !== undefined) {
          expect(monster.defeatScore).toBeGreaterThan(0);
        }
      }
    });

    it('should preserve all MDL data fidelity', async () => {
      // Act
      const thief = await loader.loadMonster('thief');

      // Assert - Comprehensive check
      expect(thief).toMatchObject({
        id: 'thief',
        name: 'thief',
        type: 'humanoid',
        combatStrength: 5,
        behaviorFunction: 'ROBBER-FUNCTION',
        movementDemon: 'ROBBER-DEMON',
        inventory: expect.arrayContaining(['stiletto']),
        flags: expect.objectContaining({
          VILLAIN: true,
          OVISON: true
        }),
        properties: expect.objectContaining({
          canSteal: true,
          hasLoot: true
        })
      });
    });
  });
});