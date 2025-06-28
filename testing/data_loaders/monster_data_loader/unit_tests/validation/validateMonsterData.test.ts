/**
 * Unit tests for MonsterDataLoader monster data validation
 * Tests the validateMonsterData private method through public API
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { 
  MonsterDataLoaderTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockMonsterIndex,
  MonsterDataFactory
} from '../../../../utils/mock_factories';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader Monster Data Validation', () => {
  let loader: MonsterDataLoader;
  let testHelper: MonsterDataLoaderTestHelper;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
    testHelper = new MonsterDataLoaderTestHelper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid monster data', () => {
    it('should accept monster with all required fields', async () => {
      // Arrange
      const validMonster = MonsterDataFactory.humanoid();
      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': validMonster
      });

      // Act & Assert - Should not throw
      await expect(loader.loadMonster('test_thief')).resolves.toBeDefined();
    });

    it('should accept monster with minimal required fields', async () => {
      // Arrange
      const minimalMonster = {
        id: 'minimal',
        name: 'Minimal Monster',
        type: 'humanoid',
        description: 'A minimal monster',
        examineText: 'You see a minimal monster',
        startingSceneId: 'room1',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      const mockIndex = createMockMonsterIndex({
        monsters: ['minimal']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'minimal.json': minimalMonster
      });

      // Act & Assert
      await expect(loader.loadMonster('minimal')).resolves.toBeDefined();
    });

    it('should accept monster with all optional MDL properties', async () => {
      // Arrange
      const fullMonster = MonsterDataFactory.humanoid({
        combatStrength: 10,
        meleeMessages: {
          miss: ['Miss'],
          kill: ['Kill'],
          light_wound: ['Light'],
          severe_wound: ['Severe']
        },
        behaviorFunction: 'TEST-FUNCTION',
        movementDemon: 'TEST-DEMON'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': fullMonster
      });

      // Act & Assert
      const result = await loader.loadMonster('test_thief');
      expect(result.combatStrength).toBe(10);
      expect(result.meleeMessages).toBeDefined();
      expect(result.behaviorFunction).toBe('TEST-FUNCTION');
      expect(result.movementDemon).toBe('TEST-DEMON');
    });
  });

  describe('Missing required fields', () => {
    it('should throw error when id is missing', async () => {
      // Arrange
      const missingId = {
        name: 'Monster',
        type: 'humanoid',
        description: 'Desc',
        examineText: 'Examine',
        startingSceneId: 'room',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': missingId
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster data missing required field: id');
    });

    it('should throw error when name is missing', async () => {
      // Arrange
      const missingName = {
        id: 'test',
        type: 'humanoid',
        description: 'Desc',
        examineText: 'Examine',
        startingSceneId: 'room',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': missingName
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster data missing required field: name');
    });

    it('should throw error for each missing required field', async () => {
      // Arrange
      const requiredFields = [
        'id', 'name', 'type', 'description', 'examineText',
        'startingSceneId', 'inventory', 'synonyms', 'flags', 'properties'
      ];

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      for (const fieldToOmit of requiredFields) {
        const invalidData = {
          id: 'test',
          name: 'Test',
          type: 'humanoid',
          description: 'Desc',
          examineText: 'Examine',
          startingSceneId: 'room',
          inventory: [],
          synonyms: [],
          flags: {},
          properties: {}
        };
        
        delete (invalidData as any)[fieldToOmit];

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'test.json': invalidData
        });

        // Act & Assert
        await expect(loader.loadMonster('test'))
          .rejects.toThrow(`Monster data missing required field: ${fieldToOmit}`);
      }
    });
  });

  describe('Invalid field types', () => {
    it('should throw error when id is not a string', async () => {
      // Arrange
      const invalidId = MonsterDataFactory.humanoid({
        id: 123 as any
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': invalidId
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster ID must be a non-empty string');
    });

    it('should throw error when id is empty string', async () => {
      // Arrange
      const emptyId = MonsterDataFactory.humanoid({
        id: ''
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': emptyId
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster ID must be a non-empty string');
    });

    it('should throw error when type is invalid', async () => {
      // Arrange
      const invalidType = MonsterDataFactory.humanoid({
        type: 'INVALID_TYPE' as any
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': invalidType
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Invalid monster type: INVALID_TYPE');
    });

    it('should throw error when inventory is not an array', async () => {
      // Arrange
      const invalidInventory = MonsterDataFactory.humanoid({
        inventory: 'not an array' as any
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': invalidInventory
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster inventory must be an array');
    });

    it('should throw error when synonyms is not an array', async () => {
      // Arrange
      const invalidSynonyms = MonsterDataFactory.humanoid({
        synonyms: { not: 'array' } as any
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': invalidSynonyms
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster synonyms must be an array');
    });
  });

  describe('Valid monster types', () => {
    it('should accept all valid monster types', async () => {
      // Arrange
      const validTypes = ['humanoid', 'creature', 'environmental'];
      const mockIndex = createMockMonsterIndex({
        monsters: validTypes
      });

      for (const type of validTypes) {
        const monster = MonsterDataFactory.humanoid({
          id: type,
          type: type as any
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          [`${type}.json`]: monster
        });

        // Act & Assert
        const result = await loader.loadMonster(type);
        expect(result.type).toBe(type);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle monster data with extra fields', async () => {
      // Arrange
      const monsterWithExtras = {
        ...MonsterDataFactory.humanoid(),
        extraField: 'extra',
        anotherExtra: 123,
        nestedExtra: { foo: 'bar' }
      };

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': monsterWithExtras
      });

      // Act & Assert - Should work, extras ignored
      await expect(loader.loadMonster('test_thief')).resolves.toBeDefined();
    });

    it('should handle empty arrays and objects', async () => {
      // Arrange
      const emptyMonster = MonsterDataFactory.humanoid({
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': emptyMonster
      });

      // Act & Assert
      const result = await loader.loadMonster('test_thief');
      expect(result.inventory).toEqual([]);
      expect(result.synonyms).toEqual([]);
      expect(result.flags).toEqual({});
      expect(result.properties).toEqual({});
    });

    it('should handle very long arrays', async () => {
      // Arrange
      const longArrays = MonsterDataFactory.humanoid({
        inventory: Array(100).fill('item'),
        synonyms: Array(50).fill('synonym')
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['test_thief']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test_thief.json': longArrays
      });

      // Act & Assert
      const result = await loader.loadMonster('test_thief');
      expect(result.inventory).toHaveLength(100);
      expect(result.synonyms).toHaveLength(50);
    });

    it('should validate monster data is an object', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': [] // Array instead of object
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster data must be an object');
    });

    it('should validate monster data is not null', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['test']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test.json': null
      });

      // Act & Assert
      await expect(loader.loadMonster('test'))
        .rejects.toThrow('Monster data must be an object');
    });
  });
});