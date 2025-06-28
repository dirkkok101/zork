/**
 * Unit tests for MonsterDataLoader index validation
 * Tests the validateIndexData private method through public API
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterDataLoaderTestHelper } from '../../../../utils/test_helpers';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader Index Validation', () => {
  let loader: MonsterDataLoader;
  let testHelper: MonsterDataLoaderTestHelper;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
    testHelper = new MonsterDataLoaderTestHelper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid index structure', () => {
    it('should accept valid index with all required fields', async () => {
      // Arrange
      const validIndex = {
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3,
        types: {
          humanoid: ['thief', 'troll', 'cyclops'],
          creature: [],
          environmental: []
        }
      };

      testHelper.mockFileRead('index.json', validIndex);

      // Act & Assert - Should not throw
      await expect(loader.getTotalCount()).resolves.toBe(3);
    });

    it('should accept empty monster list', async () => {
      // Arrange
      const emptyIndex = {
        monsters: [],
        total: 0,
        types: {
          humanoid: [],
          creature: [],
          environmental: []
        }
      };

      testHelper.mockFileRead('index.json', emptyIndex);

      // Act & Assert
      await expect(loader.getTotalCount()).resolves.toBe(0);
    });

    it('should accept large monster counts', async () => {
      // Arrange
      const largeIndex = {
        monsters: Array(1000).fill('monster'),
        total: 1000,
        types: {
          humanoid: Array(500).fill('monster'),
          creature: Array(300).fill('monster'),
          environmental: Array(200).fill('monster')
        }
      };

      testHelper.mockFileRead('index.json', largeIndex);

      // Act & Assert
      await expect(loader.getTotalCount()).resolves.toBe(1000);
    });
  });

  describe('Invalid index structure', () => {
    it('should throw error when index is not an object', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', []);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must be an object');
    });

    it('should throw error when index is null', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', null);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must be an object');
    });

    it('should throw error when monsters field is missing', async () => {
      // Arrange
      const invalidIndex = {
        total: 3,
        types: {}
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have monsters array');
    });

    it('should throw error when monsters is not an array', async () => {
      // Arrange
      const invalidIndex = {
        monsters: 'not an array',
        total: 3,
        types: {}
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have monsters array');
    });

    it('should throw error when total field is missing', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief'],
        types: {}
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have total number');
    });

    it('should throw error when total is not a number', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief'],
        total: 'three',
        types: {}
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have total number');
    });

    it('should throw error when types field is missing', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief'],
        total: 1
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have types object');
    });

    it('should throw error when types is not an object', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief'],
        total: 1,
        types: []
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have types object');
    });
  });

  describe('Edge cases', () => {
    it('should handle index with extra fields', async () => {
      // Arrange
      const indexWithExtras = {
        monsters: ['thief'],
        total: 1,
        types: {
          humanoid: ['thief'],
          creature: [],
          environmental: []
        },
        version: '1.0',
        lastUpdated: '2024-01-01',
        extra: 'data'
      };

      testHelper.mockFileRead('index.json', indexWithExtras);

      // Act & Assert - Should work, extra fields ignored
      await expect(loader.getTotalCount()).resolves.toBe(1);
    });

    it('should handle inconsistent total vs array length', async () => {
      // Arrange
      const inconsistentIndex = {
        monsters: ['thief', 'troll'],
        total: 5, // Doesn't match array length
        types: {
          humanoid: ['thief', 'troll'],
          creature: [],
          environmental: []
        }
      };

      testHelper.mockFileRead('index.json', inconsistentIndex);

      // Act & Assert - Uses total field value
      await expect(loader.getTotalCount()).resolves.toBe(5);
    });

    it('should handle types with extra categories', async () => {
      // Arrange
      const indexWithExtraTypes = {
        monsters: ['thief'],
        total: 1,
        types: {
          humanoid: ['thief'],
          creature: [],
          environmental: [],
          undead: [], // Extra category
          mechanical: [] // Extra category
        }
      };

      testHelper.mockFileRead('index.json', indexWithExtraTypes);

      // Act & Assert - Should work
      await expect(loader.getTotalCount()).resolves.toBe(1);
    });

    it('should handle negative total', async () => {
      // Arrange
      const negativeIndex = {
        monsters: [],
        total: -5,
        types: {
          humanoid: [],
          creature: [],
          environmental: []
        }
      };

      testHelper.mockFileRead('index.json', negativeIndex);

      // Act & Assert - Accepts negative (validation doesn't check value)
      await expect(loader.getTotalCount()).resolves.toBe(-5);
    });

    it('should handle floating point total', async () => {
      // Arrange
      const floatIndex = {
        monsters: ['thief', 'troll'],
        total: 2.5,
        types: {
          humanoid: ['thief', 'troll'],
          creature: [],
          environmental: []
        }
      };

      testHelper.mockFileRead('index.json', floatIndex);

      // Act & Assert
      await expect(loader.getTotalCount()).resolves.toBe(2.5);
    });
  });

  describe('Type safety', () => {
    it('should validate through TypeScript assertions', async () => {
      // This test verifies that our validation matches TypeScript's type system
      
      // Valid data should pass
      const valid = {
        monsters: ['thief'],
        total: 1,
        types: { humanoid: [], creature: [], environmental: [] }
      };
      
      testHelper.mockFileRead('index.json', valid);
      await expect(loader.getTotalCount()).resolves.toBe(1);

      // Invalid data should fail
      const invalid = { notValid: true };
      testHelper.mockFileRead('index.json', invalid);
      await expect(loader.getTotalCount()).rejects.toThrow();
    });
  });
});