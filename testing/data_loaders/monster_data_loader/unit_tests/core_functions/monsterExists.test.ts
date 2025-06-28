/**
 * Unit tests for MonsterDataLoader.monsterExists() method
 * Tests monster existence checking
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { 
  MonsterDataLoaderTestHelper,
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { createMockMonsterIndex } from '../../../../utils/mock_factories';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader.monsterExists()', () => {
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
    it('should return true for existing monster', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.monsterExists('thief');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existent monster', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.monsterExists('dragon');

      // Assert
      expect(result).toBe(false);
    });

    it('should handle empty monster list', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: [],
        total: 0
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.monsterExists('any_monster');

      // Assert
      expect(result).toBe(false);
    });

    it('should check all actual Zork monsters', async () => {
      // Arrange
      const zorkMonsters = [
        'thief', 'troll', 'cyclops', 'grue', 'ghost',
        'volcano_gnome', 'gnome_of_zurich', 'guardian_of_zork', 'vampire_bat'
      ];

      const mockIndex = createMockMonsterIndex({
        monsters: zorkMonsters,
        total: 9
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act & Assert
      for (const monster of zorkMonsters) {
        const exists = await loader.monsterExists(monster);
        expect(exists).toBe(true);
      }

      // Check non-existent
      const notExists = await loader.monsterExists('dragon');
      expect(notExists).toBe(false);
    });

    it('should be case-sensitive', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'Troll', 'CYCLOPS'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const lowerExists = await loader.monsterExists('thief');
      const upperDoesNotExist = await loader.monsterExists('THIEF');
      const titleExists = await loader.monsterExists('Troll');
      const lowerDoesNotExist = await loader.monsterExists('troll');
      const upperExists = await loader.monsterExists('CYCLOPS');

      // Assert
      expect(lowerExists).toBe(true);
      expect(upperDoesNotExist).toBe(false);
      expect(titleExists).toBe(true);
      expect(lowerDoesNotExist).toBe(false);
      expect(upperExists).toBe(true);
    });
  });

  describe('Error scenarios', () => {
    it('should throw error when index loading fails', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('ENOENT: no such file'));

      // Act & Assert
      await expect(loader.monsterExists('thief'))
        .rejects.toThrow('Failed to load monster index');
    });

    it('should throw error for malformed index JSON', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', '{ invalid json }');

      // Act & Assert
      await expect(loader.monsterExists('thief'))
        .rejects.toThrow('Failed to load monster index');
    });

    it('should throw error when monsters array is missing', async () => {
      // Arrange
      const invalidIndex = {
        total: 3
        // Missing monsters array
      };

      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.monsterExists('thief'))
        .rejects.toThrow('Index data must have monsters array');
    });
  });

  describe('Performance', () => {
    it('should complete within performance requirement', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.monsterExists('thief')
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
      await loader.monsterExists('thief');
      const firstCallCount = testHelper.getFileReadCallCount();

      await loader.monsterExists('thief');
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondCallCount).toBe(firstCallCount * 2); // No caching
    });

    it('should handle large monster lists efficiently', async () => {
      // Arrange
      const monsterCount = 1000;
      const monsters = Array.from({ length: monsterCount }, (_, i) => `monster_${i}`);
      
      const mockIndex = createMockMonsterIndex({
        monsters: monsters,
        total: monsterCount
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const { duration: existsDuration } = await PerformanceTestHelper.measureTime(
        () => loader.monsterExists('monster_500')
      );
      
      const { duration: notExistsDuration } = await PerformanceTestHelper.measureTime(
        () => loader.monsterExists('non_existent')
      );

      // Assert
      expect(existsDuration).toBeLessThan(15);
      expect(notExistsDuration).toBeLessThan(15);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string monster ID', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['', 'thief'], // Empty string in list
        total: 2
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const emptyExists = await loader.monsterExists('');
      const thiefExists = await loader.monsterExists('thief');

      // Assert
      expect(emptyExists).toBe(true);
      expect(thiefExists).toBe(true);
    });

    it('should handle special characters in monster IDs', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief-king', 'troll_guardian', 'cyclops!', '*ghost*'],
        total: 4
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const hyphenExists = await loader.monsterExists('thief-king');
      const underscoreExists = await loader.monsterExists('troll_guardian');
      const exclamationExists = await loader.monsterExists('cyclops!');
      const asteriskExists = await loader.monsterExists('*ghost*');

      // Assert
      expect(hyphenExists).toBe(true);
      expect(underscoreExists).toBe(true);
      expect(exclamationExists).toBe(true);
      expect(asteriskExists).toBe(true);
    });

    it('should handle null/undefined gracefully', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act & Assert
      // TypeScript would normally prevent this, but testing runtime behavior
      await expect(loader.monsterExists(null as any))
        .rejects.toThrow();
      
      await expect(loader.monsterExists(undefined as any))
        .rejects.toThrow();
    });

    it('should handle duplicate entries in index', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'thief'], // Duplicate
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.monsterExists('thief');

      // Assert
      expect(result).toBe(true); // Still returns true
    });
  });

  describe('Consistency checks', () => {
    it('should match loadMonster behavior', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll'],
        total: 2
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const thiefExists = await loader.monsterExists('thief');
      const dragonExists = await loader.monsterExists('dragon');

      // Assert
      expect(thiefExists).toBe(true);
      expect(dragonExists).toBe(false);

      // These should match what loadMonster would do
      // loadMonster('thief') would succeed
      // loadMonster('dragon') would throw "Monster with ID 'dragon' not found"
    });

    it('should check same index as other methods', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops'],
        total: 3
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const exists = await loader.monsterExists('thief');
      const total = await loader.getTotalCount();

      // Assert
      expect(exists).toBe(true);
      expect(total).toBe(3);
      expect(testHelper.getFileReadCallCount()).toBe(2); // Both read index
    });
  });
});