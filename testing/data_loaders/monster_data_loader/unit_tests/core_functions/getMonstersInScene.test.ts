/**
 * Unit tests for MonsterDataLoader.getMonstersInScene() method
 * Tests scene-based monster filtering
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
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

describe('MonsterDataLoader.getMonstersInScene()', () => {
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
    it('should load monsters in a specific scene', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'treasure_room',
        startingSceneId: 'treasure_room'
      });
      const trollData = MonsterDataFactory.guardian({ 
        id: 'troll',
        currentSceneId: 'troll_room',
        startingSceneId: 'troll_room' 
      });
      const grueData = MonsterDataFactory.creature({ 
        id: 'grue',
        currentSceneId: 'dark_cave',
        startingSceneId: 'dark_cave'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll', 'grue'],
        total: 3
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData,
        'troll.json': trollData,
        'grue.json': grueData
      });

      // Act
      const result = await loader.getMonstersInScene('treasure_room');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('thief');
      expect(result[0]!.currentSceneId).toBe('treasure_room');
    });

    it('should return multiple monsters in the same scene', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'dungeon',
        startingSceneId: 'treasure_room' // Different from current
      });
      const trollData = MonsterDataFactory.guardian({ 
        id: 'troll',
        currentSceneId: 'dungeon',
        startingSceneId: 'dungeon'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief', 'troll'],
        total: 2
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData,
        'troll.json': trollData
      });

      // Act
      const result = await loader.getMonstersInScene('dungeon');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('thief');
      expect(result[1]!.id).toBe('troll');
      expect(result.every(m => m.currentSceneId === 'dungeon')).toBe(true);
    });

    it('should return empty array for scene with no monsters', async () => {
      // Arrange
      const thiefData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'treasure_room'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': thiefData
      });

      // Act
      const result = await loader.getMonstersInScene('empty_room');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle currentSceneId override of startingSceneId', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        startingSceneId: 'treasure_room',
        currentSceneId: 'different_room' // Override
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const treasureRoomResult = await loader.getMonstersInScene('treasure_room');
      const differentRoomResult = await loader.getMonstersInScene('different_room');

      // Assert
      expect(treasureRoomResult).toHaveLength(0);
      expect(differentRoomResult).toHaveLength(1);
      expect(differentRoomResult[0]!.id).toBe('thief');
    });

    it('should use startingSceneId when currentSceneId is not set', async () => {
      // Arrange
      const monsterData = {
        ...MonsterDataFactory.humanoid({ 
          id: 'thief',
          startingSceneId: 'treasure_room'
        })
      };
      delete monsterData.currentSceneId; // Not set

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result = await loader.getMonstersInScene('treasure_room');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('thief');
      expect(result[0]!.currentSceneId).toBe('treasure_room');
    });
  });

  describe('Performance', () => {
    it('should complete within performance requirement', async () => {
      // Arrange
      const monsters = Array.from({ length: 10 }, (_, i) => 
        MonsterDataFactory.humanoid({ 
          id: `monster_${i}`,
          currentSceneId: i < 3 ? 'target_room' : `room_${i}`
        })
      );

      const mockIndex = createMockMonsterIndex({
        monsters: monsters.map(m => m.id),
        total: monsters.length
      });

      const fileMap: Record<string, any> = { 'index.json': mockIndex };
      monsters.forEach(m => {
        fileMap[`${m.id}.json`] = m;
      });

      testHelper.mockMultipleFileReads(fileMap);

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getMonstersInScene('target_room')
      );

      // Assert
      expect(duration).toBeLessThan(150);
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
        'thief.json': MonsterDataFactory.humanoid({ 
          id: 'thief',
          currentSceneId: 'room1'
        })
      });

      // Act
      await loader.getMonstersInScene('room1');

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not cache results between calls', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'room1'
      });
      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result1 = await loader.getMonstersInScene('room1');
      const result2 = await loader.getMonstersInScene('room1');

      // Assert
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different arrays
      expect(result1[0]).not.toBe(result2[0]); // Different objects
    });
  });

  describe('Error handling', () => {
    it('should continue filtering despite individual load failures', async () => {
      // Arrange
      const validMonster = MonsterDataFactory.humanoid({ 
        id: 'valid',
        currentSceneId: 'target_room'
      });
      
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
      const result = await loader.getMonstersInScene('target_room');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('valid');
    });

    it('should throw error when index fails to load', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('ENOENT'));

      // Act & Assert
      await expect(loader.getMonstersInScene('any_room'))
        .rejects.toThrow('Failed to load monster index');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty scene ID', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: ''
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result = await loader.getMonstersInScene('');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('thief');
    });

    it('should handle special characters in scene IDs', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'room_with-special.chars!'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const result = await loader.getMonstersInScene('room_with-special.chars!');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('thief');
    });

    it('should be case-sensitive for scene IDs', async () => {
      // Arrange
      const monsterData = MonsterDataFactory.humanoid({ 
        id: 'thief',
        currentSceneId: 'Treasure_Room'
      });

      const mockIndex = createMockMonsterIndex({
        monsters: ['thief'],
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'thief.json': monsterData
      });

      // Act
      const upperResult = await loader.getMonstersInScene('Treasure_Room');
      const lowerResult = await loader.getMonstersInScene('treasure_room');

      // Assert
      expect(upperResult).toHaveLength(1);
      expect(lowerResult).toHaveLength(0);
    });
  });
});