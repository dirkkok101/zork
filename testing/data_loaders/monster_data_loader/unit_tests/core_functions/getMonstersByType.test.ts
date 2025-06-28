/**
 * Unit tests for MonsterDataLoader.getMonstersByType() method
 * Tests type-based monster filtering
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType } from '../../../../../src/types/MonsterTypes';
import { 
  MonsterDataLoaderTestHelper,
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockMonsterIndex,
  MonsterDataFactory
} from '../../../../utils/mock_factories';

// Mock fs/promises
jest.mock('fs/promises');

describe('MonsterDataLoader.getMonstersByType()', () => {
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
    it('should load all humanoid monsters', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ id: 'thief', type: 'humanoid' });
      const trollData = MonsterDataFactory.guardian({ id: 'troll', type: 'humanoid' });
      const grueData = MonsterDataFactory.creature({ id: 'grue', type: 'environmental' });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'grue'],
        total: 3,
        types: {
          humanoid: ['thief', 'troll'],
          creature: [],
          environmental: ['grue']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData,
        'troll.json': trollData,
        'grue.json': grueData
      });

      // Act
      const result = await loader.getMonstersByType(MonsterType.HUMANOID);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('thief');
      expect(result[1]?.id).toBe('troll');
      expect(result.every(m => m.type === 'humanoid')).toBe(true);
    });

    it('should load all creature monsters', async () => {
      // Arrange
      const ghostData = MonsterDataFactory.environmental({ 
        id: 'ghost', 
        type: 'creature' 
      });
      const vampireBatData = MonsterDataFactory.creature({ 
        id: 'vampire_bat',
        type: 'creature' 
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['ghost', 'vampire_bat'],
        total: 2,
        types: {
          humanoid: [],
          creature: ['ghost', 'vampire_bat'],
          environmental: []
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'ghost.json': ghostData,
        'vampire_bat.json': vampireBatData
      });

      // Act
      const result = await loader.getMonstersByType(MonsterType.CREATURE);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('ghost');
      expect(result[1]?.id).toBe('vampire_bat');
      expect(result.every(m => m.type === 'creature')).toBe(true);
    });

    it('should load all environmental monsters', async () => {
      // Arrange
      const grueData = MonsterDataFactory.creature({ 
        id: 'grue',
        type: 'environmental' 
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['grue'],
        total: 1,
        types: {
          humanoid: [],
          creature: [],
          environmental: ['grue']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'grue.json': grueData
      });

      // Act
      const result = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('grue');
      expect(result[0]?.type).toBe('environmental');
    });

    it('should return empty array for type with no monsters', async () => {
      // Arrange
      const mockIndex = createMockMonsterIndex({
        monsters: [],
        total: 0,
        types: {
          humanoid: [],
          creature: [],
          environmental: []
        }
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.getMonstersByType(MonsterType.CREATURE);

      // Assert
      expect(result).toEqual([]);
    });

    it('should filter correctly when monsters of all types exist', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ id: 'thief', type: 'humanoid' });
      const ghostData = MonsterDataFactory.environmental({ id: 'ghost', type: 'creature' });
      const grueData = MonsterDataFactory.creature({ id: 'grue', type: 'environmental' });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'ghost', 'grue'],
        total: 3
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData,
        'ghost.json': ghostData,
        'grue.json': grueData
      });

      // Act
      const humanoids = await loader.getMonstersByType(MonsterType.HUMANOID);
      const creatures = await loader.getMonstersByType(MonsterType.CREATURE);
      const environmental = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL);

      // Assert
      expect(humanoids).toHaveLength(1);
      expect(humanoids[0]?.id).toBe('thief');
      
      expect(creatures).toHaveLength(1);
      expect(creatures[0]?.id).toBe('ghost');
      
      expect(environmental).toHaveLength(1);
      expect(environmental[0]?.id).toBe('grue');
    });
  });

  describe('Performance', () => {
    it('should complete within performance requirement', async () => {
      // Arrange
      const monsters = [
        MonsterDataFactory.humanoid({ id: 'thief' }),
        MonsterDataFactory.humanoid({ id: 'troll' }),
        MonsterDataFactory.humanoid({ id: 'cyclops' }),
        MonsterDataFactory.creature({ id: 'ghost', type: 'creature' }),
        MonsterDataFactory.creature({ id: 'grue', type: 'environmental' })
      ];

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'cyclops', 'ghost', 'grue'],
        total: 5
      });

      const fileMap: Record<string, any> = { 'index.json': mockIndex };
      monsters.forEach(m => {
        fileMap[`${m.id}.json`] = m;
      });

      testHelper.mockMultipleFileReads(fileMap);

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getMonstersByType(MonsterType.HUMANOID)
      );

      // Assert
      expect(duration).toBeLessThan(150); // < 150ms requirement
    });

    it('should load all monsters then filter (stateless behavior)', async () => {
      // Arrange
      const spy = jest.spyOn(loader, 'loadAllMonsters');
      
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': MonsterDataFactory.humanoid({ id: 'thief' })
      });

      // Act
      await loader.getMonstersByType(MonsterType.HUMANOID);

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not cache results between calls', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ id: 'thief' });
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result1 = await loader.getMonstersByType(MonsterType.HUMANOID);
      const result2 = await loader.getMonstersByType(MonsterType.HUMANOID);

      // Assert
      expect(result1).toEqual(result2); // Same data
      expect(result1).not.toBe(result2); // Different arrays (no caching)
      expect(result1[0]).not.toBe(result2[0]); // Different objects
    });
  });

  describe('Error handling', () => {
    it('should continue filtering despite individual load failures', async () => {
      // Arrange
      const validMonster = MonsterDataFactory.humanoid({ id: 'valid', type: 'humanoid' });
      
      const mockIndex = createMockMonsterIndex({
        monsters: ['valid', 'invalid'],
        total: 2
      });

      testHelper.mockMixedFileReads(
        {
          'index.json': mockIndex,
          'valid.json': validMonster
        },
        {
          'invalid.json': new Error('Failed to load')
        }
      );

      // Act
      const result = await loader.getMonstersByType(MonsterType.HUMANOID);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid');
    });

    it('should throw error when index fails to load', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('ENOENT'));

      // Act & Assert
      await expect(loader.getMonstersByType(MonsterType.HUMANOID))
        .rejects.toThrow('Failed to load monster index');
    });
  });

  describe('Type distribution validation', () => {
    it('should match actual Zork data distribution', async () => {
      // Arrange - Based on actual data: 5 humanoid, 2 creature, 2 environmental
      const humanoids = ['thief', 'troll', 'cyclops', 'gnome_of_zurich', 'guardian_of_zork']
        .map(id => MonsterDataFactory.humanoid({ id, type: 'humanoid' }));
      
      const creatures = ['ghost', 'volcano_gnome']
        .map(id => MonsterDataFactory.creature({ id, type: 'creature' }));
      
      const environmental = ['grue', 'vampire_bat']
        .map(id => MonsterDataFactory.creature({ id, type: 'environmental' }));

      const allMonsters = [...humanoids, ...creatures, ...environmental];
      const monsterIds = allMonsters.map(m => m.id);

      const mockIndex = createMockMonsterIndex({
        monsters: monsterIds,
        total: 9,
        types: {
          humanoid: humanoids.map(m => m.id),
          creature: creatures.map(m => m.id),
          environmental: environmental.map(m => m.id)
        }
      });

      const fileMap: Record<string, any> = { 'index.json': mockIndex };
      allMonsters.forEach(m => {
        fileMap[`${m.id}.json`] = m;
      });

      testHelper.mockMultipleFileReads(fileMap);

      // Act
      const humanoidResult = await loader.getMonstersByType(MonsterType.HUMANOID);
      const creatureResult = await loader.getMonstersByType(MonsterType.CREATURE);
      const environmentalResult = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL);

      // Assert
      expect(humanoidResult).toHaveLength(5);
      expect(creatureResult).toHaveLength(2);
      expect(environmentalResult).toHaveLength(2);
    });
  });
});