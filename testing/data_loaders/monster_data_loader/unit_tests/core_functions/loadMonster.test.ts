/**
 * Unit tests for MonsterDataLoader.loadMonster() method
 * Tests individual monster loading with type conversion and error handling
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterState } from '../../../../../src/types/MonsterTypes';
import { 
  MonsterDataLoaderTestHelper,
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockMonsterIndex,
  MonsterDataFactory,
  MonsterEdgeCaseFactory,
  InvalidMonsterDataFactory
} from '../../../../utils/mock_factories';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader.loadMonster()', () => {
  let loader: MonsterDataLoader;
  let testHelper: MonsterDataLoaderTestHelper;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
    testHelper = new MonsterDataLoaderTestHelper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success scenarios', () => {
    it('should load specific monster by ID with correct type conversion', async () => {
      // Arrange
      const mockMonsterData = {
        ...MonsterDataFactory.humanoid({
          id: 'test_thief',
          name: 'thief',
          combatStrength: 5,
          startingSceneId: 'treasure_room',
          flags: {
            VILLAIN: true
          },
          movementDemon: 'ROBBER-DEMON'
        })
      };
      delete mockMonsterData.currentSceneId;

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': mockMonsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.id).toBe('test_thief');
      expect(result.name).toBe('thief');
      expect(result.type).toBe('humanoid');
      expect(result.combatStrength).toBe(5);
      expect(result.currentSceneId).toBe('treasure_room'); // from startingSceneId
      expect(result.state).toBe(MonsterState.HOSTILE); // VILLAIN flag inference
      expect(result.movementPattern).toBe('follow'); // ROBBER-DEMON inference
    });

    it('should return fresh objects on subsequent calls (stateless)', async () => {
      // Arrange
      const mockMonsterData = MonsterDataFactory.creature();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_grue']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_grue.json': mockMonsterData
      });

      // Act
      const monster1 = await loader.loadMonster('test_grue');
      const monster2 = await loader.loadMonster('test_grue');

      // Assert
      expect(monster1).toEqual(monster2); // Same data
      expect(monster1).not.toBe(monster2); // Different objects (stateless)
    });

    it('should handle monsters with MDL properties', async () => {
      // Arrange
      const mockMonsterData = MonsterDataFactory.humanoid({
        combatStrength: 9,
        meleeMessages: {
          miss: ['The monster misses.'],
          kill: ['The monster delivers a fatal blow.']
        },
        behaviorFunction: 'TROLL-FUNCTION',
        movementDemon: 'GUARD-DEMON'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': mockMonsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.combatStrength).toBe(9);
      expect(result.meleeMessages).toBeDefined();
      expect(result.meleeMessages?.miss).toContain('The monster misses.');
      expect(result.behaviorFunction).toBe('TROLL-FUNCTION');
      expect(result.movementDemon).toBe('GUARD-DEMON');
    });

    it('should initialize monster-specific variables', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ id: 'thief' });
      const trollData = MonsterDataFactory.guardian({ id: 'troll' });
      const cyclopData = MonsterDataFactory.humanoid({ 
        id: 'cyclops',
        properties: { isAsleep: true }
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData,
        'troll.json': trollData,
        'cyclops.json': cyclopData
      });

      // Act
      const thief = await loader.loadMonster('thief');
      const troll = await loader.loadMonster('troll');
      const cyclops = await loader.loadMonster('cyclops');

      // Assert
      expect(thief.variables.hasStolen).toBe(false);
      expect(thief.variables.stolenItems).toEqual([]);
      expect(troll.variables.hasBeenPaid).toBe(false);
      expect(troll.variables.isGuarding).toBe(true);
      expect(cyclops.variables.isAsleep).toBe(true);
      expect(cyclops.variables.hasBeenAwakened).toBe(false);
    });

    it('should merge properties.variables with built-in variables', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({
        id: 'thief',
        properties: {
          variables: {
            customVar1: 'value1',
            customVar2: 42,
            hasStolen: true // Should be overridden by built-in
          }
        }
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('thief');

      // Assert
      expect(result.variables.customVar1).toBe('value1');
      expect(result.variables.customVar2).toBe(42);
      expect(result.variables.hasStolen).toBe(true); // Custom value overrides built-in
      expect(result.variables.stolenItems).toEqual([]);
    });
  });

  describe('Error scenarios', () => {
    it('should throw descriptive error for non-existent monster ID', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll']
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act & Assert
      await expect(loader.loadMonster('nonexistent'))
        .rejects.toThrow("Monster with ID 'nonexistent' not found");
    });

    it('should throw error when index loading fails', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('ENOENT: no such file'));

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Failed to load monster index');
    });

    it('should throw error for malformed JSON', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_monster']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_monster.json': '{ invalid json }'
      });

      // Act & Assert
      await expect(loader.loadMonster('test_monster'))
        .rejects.toThrow('Failed to load monster test_monster');
    });

    it('should throw error for missing required fields', async () => {
      // Arrange
      const invalidData = InvalidMonsterDataFactory.missingRequiredFields();
      const mockIndex = createMockMonsterIndex({
        monsters: ['incomplete_monster']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'incomplete_monster.json': invalidData
      });

      // Act & Assert
      await expect(loader.loadMonster('incomplete_monster'))
        .rejects.toThrow('Monster data missing required field');
    });

    it('should throw error for invalid monster type', async () => {
      // Arrange
      const invalidData = InvalidMonsterDataFactory.invalidEnums();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_monster']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_monster.json': invalidData
      });

      // Act & Assert
      await expect(loader.loadMonster('test_monster'))
        .rejects.toThrow('Invalid monster type: INVALID_TYPE');
    });
  });

  describe('Type conversion', () => {
    it('should infer state from flags', async () => {
      // Arrange
      const monsterWithFlags = MonsterEdgeCaseFactory.stateInferenceFlags();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterWithFlags
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.state).toBe(MonsterState.LURKING); // INVISIBLE flag inference
    });

    it('should convert movement pattern from demon name', async () => {
      // Arrange
      const testCases = [
        { demon: 'FOLLOW-DEMON', expected: 'follow' },
        { demon: 'FLEE-DEMON', expected: 'flee' },
        { demon: 'PATROL-DEMON', expected: 'patrol' },
        { demon: 'RANDOM-DEMON', expected: 'random' },
        { demon: undefined, expected: 'stationary' }
      ];

      for (const testCase of testCases) {
        const monsterData = testCase.demon 
          ? MonsterDataFactory.humanoid({ movementDemon: testCase.demon })
          : (() => {
              const data = { ...MonsterDataFactory.humanoid({}) };
              delete data.movementDemon;
              return data;
            })();

        testHelper.mockMultipleFileReads({
          'index.json': createMockMonsterIndex({
            monsters: ['test_thief']
          }),
          'test_thief.json': monsterData
        });

        const result = await loader.loadMonster('test_thief');
        expect(result.movementPattern).toBe(testCase.expected);
      }
    });

    it('should extract behaviors from function names', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({
        behaviorFunction: 'ROBBER-GUARD-VANISH-FUNCTION',
        properties: { behaviors: ['special'] }
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.behaviors).toContain('steal');
      expect(result.behaviors).toContain('guard');
      expect(result.behaviors).toContain('vanish');
      expect(result.behaviors).toContain('special');
    });

    it('should warn and default to idle for invalid state', async () => {
      // Arrange
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const monsterData = MonsterDataFactory.humanoid({
        state: 'INVALID_STATE'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid monster state: INVALID_STATE, defaulting to idle'
      );
      expect(result.state).toBe(MonsterState.IDLE);

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it('should extract allowed scenes from movement pattern data', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({
        movementPattern: {
          type: 'patrol',
          data: {
            validScenes: ['room1', 'room2', 'room3']
          }
        }
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.allowedScenes).toEqual(['room1', 'room2', 'room3']);
      expect(result.movementPattern).toBe('patrol');
    });

    it('should extract allowed scenes from properties if no movement pattern data', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({
        properties: {
          allowedScenes: ['scene1', 'scene2']
        }
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.allowedScenes).toEqual(['scene1', 'scene2']);
    });
  });

  describe('Performance', () => {
    it('should load single monster within performance requirement', async () => {
      // Arrange
      const mockMonsterData = MonsterDataFactory.humanoid();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': mockMonsterData
      });

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.loadMonster('test_thief')
      );

      // Assert
      expect(duration).toBeLessThan(10); // < 10ms requirement
    });

    it('should maintain consistent performance across calls', async () => {
      // Arrange
      const mockMonsterData = MonsterDataFactory.creature();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_grue']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_grue.json': mockMonsterData
      });

      // Act
      const times = await PerformanceTestHelper.benchmarkFunction(
        () => loader.loadMonster('test_grue'),
        5
      );

      // Assert
      expect(times.averageTime).toBeLessThan(10);
      expect(times.maxTime).toBeLessThan(15);
    });
  });

  describe('Edge cases', () => {
    it('should handle monsters with no MDL properties', async () => {
      // Arrange
      const monsterData = MonsterEdgeCaseFactory.noMdlProperties();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.combatStrength).toBeUndefined();
      expect(result.meleeMessages).toBeUndefined();
      expect(result.behaviorFunction).toBeUndefined();
      expect(result.movementDemon).toBeUndefined();
    });

    it('should handle empty inventory and synonyms', async () => {
      // Arrange
      const monsterData = MonsterEdgeCaseFactory.emptyInventory();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.inventory).toEqual([]);
      expect(result.synonyms).toEqual(['test', 'monster', 'creature']);
    });

    it('should handle maximum values', async () => {
      // Arrange
      const monsterData = MonsterEdgeCaseFactory.maximumValues();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterData
      });

      // Act
      const result = await loader.loadMonster('test_thief');

      // Assert
      expect(result.health).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.maxHealth).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.combatStrength).toBe(100);
      expect(result.synonyms.length).toBe(50);
      expect(result.inventory.length).toBe(20);
    });

    it('should handle Unicode characters in monster data', async () => {
      // Arrange
      const unicodeMonster = MonsterDataFactory.humanoid({
        id: 'unicode_monster',
        name: '魔物',
        description: 'Un monstre étrange avec des caractères spéciaux: 🐉',
        examineText: 'Έτσι φαίνεται το τέρας με ειδικούς χαρακτήρες',
        synonyms: ['дракон', 'ドラゴン', '🐲']
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['unicode_monster']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'unicode_monster.json': unicodeMonster
      });

      // Act
      const result = await loader.loadMonster('unicode_monster');

      // Assert
      expect(result.id).toBe('unicode_monster');
      expect(result.name).toBe('魔物');
      expect(result.description).toContain('🐉');
      expect(result.synonyms).toContain('ドラゴン');
      expect(result.synonyms).toContain('🐲');
    });

    it('should handle very long monster IDs and names', async () => {
      // Arrange
      const longId = 'a'.repeat(255);
      const longName = 'Very Long Monster Name '.repeat(20);
      
      const longMonster = MonsterDataFactory.humanoid({
        id: longId,
        name: longName,
        synonyms: Array(100).fill('synonym')
      });

      const mockIndex = createMockMonsterIndex({
        monsters: [longId]
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        [`${longId}.json`]: longMonster
      });

      // Act
      const result = await loader.loadMonster(longId);

      // Assert
      expect(result.id).toBe(longId);
      expect(result.name).toBe(longName);
      expect(result.synonyms.length).toBe(100);
    });

    it('should handle special characters in monster IDs', async () => {
      // Arrange
      const specialIds = [
        'monster-with-dashes',
        'monster_with_underscores',
        'monster.with.dots'
      ];

      for (const specialId of specialIds) {
        const monsterData = MonsterDataFactory.humanoid({
          id: specialId
        });

        const mockIndex = createMockMonsterIndex({
          monsters: [specialId]
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          [`${specialId}.json`]: monsterData
        });

        // Act
        const result = await loader.loadMonster(specialId);

        // Assert
        expect(result.id).toBe(specialId);
      }
    });
  });
});