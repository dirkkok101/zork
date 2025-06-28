/**
 * Unit tests for MonsterDataLoader.getTotalCount() method
 * Tests total monster count retrieval from index
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { 
  MonsterDataLoaderTestHelper,
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockMonsterIndex,
  MonsterPerformanceFactory
} from '../../../../utils/mock_factories';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader.getTotalCount()', () => {
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
    it('should return correct total count from index', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(3);
    });

    it('should return 0 for empty monster list', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: [],
        total: 0
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(0);
    });

    it('should match actual Zork monster count', async () => {
      // Arrange - 9 monsters in actual Zork data
      const mockIndex = createMockMonsterIndex({
        monsters: [
          'thief', 'troll', 'cyclops', 'grue', 'ghost',
          'volcano_gnome', 'gnome_of_zurich', 'guardian_of_zork', 'vampire_bat'
        ],
        total: 9
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(9);
    });

    it('should handle large monster counts', async () => {
      // Arrange
      const largeCount = 1000;
      const mockIndex = MonsterPerformanceFactory.createLargeMonsterIndex(largeCount);

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(largeCount);
    });

    it('should return same count on multiple calls', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll'],
        total: 2
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result1 = await loader.getTotalCount();
      const result2 = await loader.getTotalCount();
      const result3 = await loader.getTotalCount();

      // Assert
      expect(result1).toBe(2);
      expect(result2).toBe(2);
      expect(result3).toBe(2);
    });
  });

  describe('Error scenarios', () => {
    it('should throw error when index loading fails', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('ENOENT: no such file'));

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Failed to load monster index');
    });

    it('should throw error for malformed index JSON', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', '{ invalid json }');

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Failed to load monster index');
    });

    it('should throw error when index is missing total field', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief', 'troll']
        // Missing total field
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have total number');
    });

    it('should throw error when total is not a number', async () => {
      // Arrange
      const invalidIndex = {
        monsters: ['thief', 'troll'],
        total: 'two', // Should be number
        types: {}
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.getTotalCount())
        .rejects.toThrow('Index data must have total number');
    });
  });

  describe('Performance', () => {
    it('should complete within performance requirement', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getTotalCount()
      );

      // Assert
      expect(duration).toBeLessThan(10); // Should be very fast
    });

    it('should reload index on each call (stateless)', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      await loader.getTotalCount();
      const firstCallCount = testHelper.getFileReadCallCount();

      await loader.getTotalCount();
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondCallCount).toBe(firstCallCount * 2); // No caching
    });
  });

  describe('Data consistency', () => {
    it('should match monsters array length', async () => {
      // Arrange
      const monsters = ['thief', 'troll', 'cyclops', 'grue'];
      const mockIndex = createMockMonsterIndex({
        monsters: monsters,
        total: monsters.length
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(monsters.length);
    });

    it('should handle mismatch between total and array length', async () => {
      // Arrange - This tests what happens if index is inconsistent
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll'],
        total: 5 // Doesn't match array length
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(5); // Returns the total field value
    });

    it('should handle index with type distribution', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'grue', 'ghost'],
        total: 4,
        types: {
          humanoid: ['thief', 'troll'],
          creature: ['ghost'],
          environmental: ['grue']
        }
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getTotalCount();

      // Assert
      expect(result).toBe(4);
      
      // Verify type distribution adds up
      const typeCount = 
        mockIndex.types.humanoid.length + 
        mockIndex.types.creature.length + 
        mockIndex.types.environmental.length;
      expect(typeCount).toBe(result);
    });
  });
});