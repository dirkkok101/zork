/**
 * Performance integration tests for MonsterDataLoader
 * Tests loading performance with real data
 */

import '../setup';
import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType } from '../../../../../src/types/MonsterTypes';
import { PerformanceTestHelper } from '../../../../utils/test_helpers';

describe('MonsterDataLoader Performance Integration', () => {
  let loader: MonsterDataLoader;
  const ACTUAL_DATA_PATH = 'data/monsters/';

  beforeEach(() => {
    loader = new MonsterDataLoader(ACTUAL_DATA_PATH);
  });

  describe('Loading performance benchmarks', () => {
    it('should meet single monster load performance requirement', async () => {
      // Arrange
      const monsterIds = ['thief', 'troll', 'cyclops', 'grue', 'ghost'];

      // Act & Assert
      for (const monsterId of monsterIds) {
        const { duration } = await PerformanceTestHelper.measureTime(
          () => loader.loadMonster(monsterId)
        );
        
        expect(duration).toBeLessThan(10); // < 10ms requirement
      }
    });

    it('should meet all monsters load performance requirement', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.loadAllMonsters()
      );

      // Assert
      expect(duration).toBeLessThan(100); // < 100ms for 9 monsters
    });

    it('should meet type filtering performance requirement', async () => {
      // Act
      const types = [MonsterType.HUMANOID, MonsterType.CREATURE, MonsterType.ENVIRONMENTAL];
      
      for (const type of types) {
        const { duration } = await PerformanceTestHelper.measureTime(
          () => loader.getMonstersByType(type)
        );
        
        expect(duration).toBeLessThan(150); // < 150ms requirement
      }
    });

    it('should meet scene filtering performance requirement', async () => {
      // Arrange
      const sceneIds = ['treasure_room', 'troll_room', 'cyclops_room', 'maze_15'];

      // Act & Assert
      for (const sceneId of sceneIds) {
        const { duration } = await PerformanceTestHelper.measureTime(
          () => loader.getMonstersInScene(sceneId)
        );
        
        expect(duration).toBeLessThan(150);
      }
    });

    it('should handle rapid sequential loads efficiently', async () => {
      // Act
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        await loader.loadMonster('thief');
      }
      
      const totalDuration = performance.now() - startTime;

      // Assert
      expect(totalDuration).toBeLessThan(100); // 10 loads < 100ms total
    });
  });

  describe('Memory usage patterns', () => {
    it('should not accumulate memory with repeated loads (stateless)', async () => {
      // Act
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Load all monsters 5 times
      for (let i = 0; i < 5; i++) {
        await loader.loadAllMonsters();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Assert - Should not accumulate significant memory (stateless)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // < 5MB increase
    });

    it('should use reasonable memory for full dataset', async () => {
      // Act
      const { result, memoryDelta } = await PerformanceTestHelper.measureMemory(
        () => loader.loadAllMonsters()
      );

      // Assert
      expect(result).toHaveLength(9);
      expect(memoryDelta).toBeLessThan(2 * 1024 * 1024); // < 2MB for 9 monsters
    });
  });

  describe('Concurrent operation performance', () => {
    it('should handle concurrent monster loads', async () => {
      // Arrange
      const monsterIds = ['thief', 'troll', 'cyclops', 'grue'];

      // Act
      const startTime = performance.now();
      const promises = monsterIds.map(id => loader.loadMonster(id));
      const results = await Promise.all(promises);
      const duration = performance.now() - startTime;

      // Assert
      expect(results).toHaveLength(4);
      expect(duration).toBeLessThan(40); // Concurrent should be faster
    });

    it('should handle concurrent type queries', async () => {
      // Arrange
      const types = [MonsterType.HUMANOID, MonsterType.CREATURE, MonsterType.ENVIRONMENTAL];

      // Act
      const startTime = performance.now();
      const promises = types.map(type => loader.getMonstersByType(type));
      const results = await Promise.all(promises);
      const duration = performance.now() - startTime;

      // Assert
      expect(results[0]).toHaveLength(5); // Humanoid
      expect(results[1]).toHaveLength(2); // Creature
      expect(results[2]).toHaveLength(2); // Environmental
      expect(duration).toBeLessThan(200); // Concurrent operations
    });
  });

  describe('Performance consistency', () => {
    it('should maintain consistent load times', async () => {
      // Act
      const benchmarks = await PerformanceTestHelper.benchmarkFunction(
        () => loader.loadMonster('thief'),
        10
      );

      // Assert
      expect(benchmarks.averageTime).toBeLessThan(10);
      expect(benchmarks.maxTime).toBeLessThan(15);
      
      // Check consistency (max should not be much higher than average)
      const variance = benchmarks.maxTime / benchmarks.averageTime;
      expect(variance).toBeLessThan(2); // Max < 2x average
    });

    it('should scale linearly with dataset size', async () => {
      // Act
      const singleMonsterTime = await PerformanceTestHelper.measureTime(
        () => loader.loadMonster('thief')
      );
      
      const allMonstersTime = await PerformanceTestHelper.measureTime(
        () => loader.loadAllMonsters()
      );

      // Assert
      // 9 monsters should take less than 15x single monster time
      // (accounting for overhead)
      expect(allMonstersTime.duration).toBeLessThan(singleMonsterTime.duration * 15);
    });
  });

  describe('Edge case performance', () => {
    it('should handle non-existent monsters quickly', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.monsterExists('non_existent_monster')
      );

      // Assert
      expect(duration).toBeLessThan(5); // Should fail fast
    });

    it('should handle empty results efficiently', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getMonstersInScene('empty_room')
      );

      // Assert
      expect(duration).toBeLessThan(100); // Still needs to check all monsters
    });

    it('should handle index operations quickly', async () => {
      // Act
      const { duration } = await PerformanceTestHelper.measureTime(
        () => loader.getTotalCount()
      );

      // Assert
      expect(duration).toBeLessThan(5); // Index read only
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle typical game initialization sequence', async () => {
      // Act - Simulate game startup
      const startTime = performance.now();
      
      // Load total count
      const count = await loader.getTotalCount();
      
      // Load all monsters
      const allMonsters = await loader.loadAllMonsters();
      
      // Check specific scenes
      const treasureRoom = await loader.getMonstersInScene('treasure_room');
      const trollRoom = await loader.getMonstersInScene('troll_room');
      
      const totalDuration = performance.now() - startTime;

      // Assert
      expect(count).toBe(9);
      expect(allMonsters).toHaveLength(9);
      expect(treasureRoom.length).toBeGreaterThan(0);
      expect(trollRoom.length).toBeGreaterThan(0);
      expect(totalDuration).toBeLessThan(200); // Full init < 200ms
    });

    it('should handle combat scenario queries efficiently', async () => {
      // Act - Simulate combat checks
      const startTime = performance.now();
      
      // Load specific monster
      const thief = await loader.loadMonster('thief');
      
      // Check for other monsters in scene
      const sceneMonsters = await loader.getMonstersInScene(thief.currentSceneId || 'treasure_room');
      
      // Load hostile monsters
      const allMonsters = await loader.loadAllMonsters();
      const hostileMonsters = allMonsters.filter(m => m.state === 'hostile');
      
      const totalDuration = performance.now() - startTime;

      // Assert
      expect(thief).toBeDefined();
      expect(sceneMonsters).toBeDefined();
      expect(hostileMonsters).toBeDefined();
      expect(totalDuration).toBeLessThan(150); // Combat queries < 150ms
    });
  });
});