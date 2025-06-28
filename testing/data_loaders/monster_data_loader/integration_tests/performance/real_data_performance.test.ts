/**
 * Integration tests for MonsterDataLoader performance
 * Tests real-world performance scenarios with actual file operations
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType, MonsterState } from '../../../../../src/types/MonsterTypes';

// Import setup to ensure fs/promises is not mocked
import '../setup';

// Helper function to measure execution time
const measureTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration };
};

// Helper function to benchmark a function multiple times
const benchmarkFunction = async <T>(
  fn: () => Promise<T>, 
  iterations: number = 5
): Promise<{ averageTime: number; minTime: number; maxTime: number; results: T[] }> => {
  const times: number[] = [];
  const results: T[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const { result, duration } = await measureTime(fn);
    times.push(duration);
    results.push(result);
  }
  
  return {
    averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    results
  };
};

// Helper function to measure memory usage (basic)
const measureMemory = async <T>(fn: () => Promise<T>): Promise<{ result: T; memoryDelta: number }> => {
  const startMemory = process.memoryUsage().heapUsed;
  const result = await fn();
  const endMemory = process.memoryUsage().heapUsed;
  const memoryDelta = endMemory - startMemory;
  return { result, memoryDelta };
};

describe('MonsterDataLoader - Performance Integration Tests', () => {
  let loader: MonsterDataLoader;

  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new MonsterDataLoader('data/monsters/');
  });

  describe('Basic loading performance', () => {
    it('should load all monsters within 100ms', async () => {
      // Act & Assert
      const { result: allMonsters, duration } = await measureTime(async () => {
        return await loader.loadAllMonsters();
      });

      expect(allMonsters.length).toBe(9);
      expect(duration).toBeLessThan(100); // Should load within 100ms (documented requirement)
      
      console.log(`Loaded ${allMonsters.length} monsters in ${duration}ms`);
    });

    it('should demonstrate consistent loading performance', async () => {
      // Act & Assert - Multiple loads for consistency
      const { averageTime, maxTime, minTime, results } = await benchmarkFunction(
        async () => {
          return await loader.loadAllMonsters();
        },
        5
      );

      expect(averageTime).toBeLessThan(100);
      expect(maxTime).toBeLessThan(150); // Allow some variation but cap at 150ms
      expect(minTime).toBeGreaterThanOrEqual(0);
      
      // All results should have same count
      const counts = results.map(monsters => monsters.length);
      const uniqueCounts = new Set(counts);
      expect(uniqueCounts.size).toBe(1);
      
      console.log(`Performance benchmark (5 runs):`);
      console.log(`  Average: ${averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime.toFixed(2)}ms`);
      console.log(`  Monster count: ${results[0]?.length || 0}`);
    });

    it('should load monsters efficiently without excessive memory usage', async () => {
      // Act & Assert
      const { result: allMonsters, memoryDelta } = await measureMemory(async () => {
        return await loader.loadAllMonsters();
      });

      expect(allMonsters.length).toBe(9);
      
      // Memory delta should be reasonable (less than 5MB for 9 monsters)
      // This is a rough estimate - actual values may vary by environment
      expect(memoryDelta).toBeLessThan(5 * 1024 * 1024);
      
      console.log(`Memory usage: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB for ${allMonsters.length} monsters`);
    });
  });

  describe('Filtering performance', () => {
    it('should filter by type efficiently after loading', async () => {
      // Arrange
      const allMonsters = await loader.loadAllMonsters();
      
      // Test filtering performance for each type
      const typeTests = [
        { type: MonsterType.HUMANOID, expectedCount: 5 },
        { type: MonsterType.CREATURE, expectedCount: 2 },
        { type: MonsterType.ENVIRONMENTAL, expectedCount: 2 }
      ];

      for (const test of typeTests) {
        const { result: typeMonsters, duration } = await measureTime(async () => {
          return allMonsters.filter(monster => monster.type === test.type);
        });
        
        expect(typeMonsters.length).toBe(test.expectedCount);
        expect(duration).toBeLessThan(5); // Filtering should be very fast
        
        console.log(`Filtered ${typeMonsters.length} ${test.type} monsters in ${duration}ms`);
      }
    });

    it('should filter by health ranges efficiently', async () => {
      // Arrange
      const allMonsters = await loader.loadAllMonsters();
      
      // Act & Assert - Filter by different health ranges
      const healthTests = [
        { name: 'low health (< 50)', filter: (m: any) => m.health < 50 },
        { name: 'medium health (50-100)', filter: (m: any) => m.health >= 50 && m.health <= 100 },
        { name: 'high health (> 100)', filter: (m: any) => m.health > 100 },
        { name: 'full health (health = maxHealth)', filter: (m: any) => m.health === m.maxHealth }
      ];
      
      for (const test of healthTests) {
        const { result: filteredMonsters, duration } = await measureTime(async () => {
          return allMonsters.filter(test.filter);
        });
        
        expect(duration).toBeLessThan(5); // Filtering should be very fast
        
        console.log(`Filtered ${filteredMonsters.length} ${test.name} in ${duration}ms`);
      }
    });

    it('should filter by properties efficiently', async () => {
      // Arrange
      const allMonsters = await loader.loadAllMonsters();
      
      // Test various property filters
      const filterTests = [
        { name: 'monsters with combat strength', filter: (monster: any) => monster.combatStrength !== undefined },
        { name: 'monsters with behavior function', filter: (monster: any) => monster.behaviorFunction !== undefined },
        { name: 'monsters with movement pattern', filter: (monster: any) => monster.movementPattern !== undefined },
        { name: 'monsters with inventory', filter: (monster: any) => monster.inventory.length > 0 },
        { name: 'monsters with synonyms', filter: (monster: any) => monster.synonyms.length > 0 }
      ];

      for (const test of filterTests) {
        const { result: filteredMonsters, duration } = await measureTime(async () => {
          return allMonsters.filter(test.filter);
        });
        
        expect(duration).toBeLessThan(10); // Complex filtering should still be fast
        
        console.log(`Filtered ${filteredMonsters.length} ${test.name} in ${duration}ms`);
      }
    });
  });

  describe('Concurrent loading performance', () => {
    it('should handle multiple concurrent loadAllMonsters calls', async () => {
      // Act - Start multiple loads simultaneously
      const concurrentLoads = 3;
      const loadPromises = Array.from({ length: concurrentLoads }, () => {
        return measureTime(async () => {
          return await loader.loadAllMonsters();
        });
      });

      const results = await Promise.all(loadPromises);

      // Assert
      results.forEach((result, index) => {
        expect(result.result.length).toBe(9);
        expect(result.duration).toBeLessThan(200); // Allow more time for concurrent loads
        console.log(`Concurrent load ${index + 1}: ${result.result.length} monsters in ${result.duration}ms`);
      });

      // All loads should return same count
      const counts = results.map(r => r.result.length);
      const uniqueCounts = new Set(counts);
      expect(uniqueCounts.size).toBe(1);
    });

    it('should demonstrate loading scalability', async () => {
      // Test different numbers of concurrent loads
      const concurrencyTests = [1, 2, 3];
      const scalabilityResults: { concurrency: number; averageTime: number }[] = [];

      for (const concurrency of concurrencyTests) {
        const { averageTime } = await benchmarkFunction(
          async () => {
            const loadPromises = Array.from({ length: concurrency }, () => {
              return loader.loadAllMonsters();
            });
            return await Promise.all(loadPromises);
          },
          3
        );

        scalabilityResults.push({ concurrency, averageTime });
        console.log(`Concurrency ${concurrency}: ${averageTime.toFixed(2)}ms average`);
      }

      // Verify scalability - time should not increase exponentially
      expect(scalabilityResults).toHaveLength(3);
      
      // Single load should be fastest
      expect(scalabilityResults[0]?.averageTime).toBeLessThan(100);
      
      // Concurrent loads shouldn't be more than 5x slower (allowing for overhead)
      const singleLoadTime = scalabilityResults[0]?.averageTime || 100;
      const tripleLoadTime = scalabilityResults[2]?.averageTime || 300;
      expect(tripleLoadTime).toBeLessThan(singleLoadTime * 5);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle repeated type filtering efficiently', async () => {
      // Simulate a common usage pattern: load once, filter many times
      const allMonsters = await loader.loadAllMonsters();
      
      // Perform many filter operations
      const filterOperations = 30; // Fewer operations since we have fewer monsters
      const { averageTime } = await benchmarkFunction(
        async () => {
          const results = [];
          for (let i = 0; i < filterOperations; i++) {
            const typeIndex = i % Object.values(MonsterType).length;
            const type = Object.values(MonsterType)[typeIndex] as MonsterType;
            const filtered = allMonsters.filter(monster => monster.type === type);
            results.push(filtered.length);
          }
          return results;
        },
        3
      );

      expect(averageTime).toBeLessThan(50); // 30 filter operations should be very fast
      console.log(`${filterOperations} filter operations averaged ${averageTime.toFixed(2)}ms`);
    });

    it('should handle complex query patterns efficiently', async () => {
      // Simulate complex querying patterns
      const allMonsters = await loader.loadAllMonsters();
      
      const { duration } = await measureTime(async () => {
        // Complex multi-criteria filtering
        const combatHumanoids = allMonsters.filter(monster => 
          monster.type === MonsterType.HUMANOID && 
          monster.combatStrength && 
          monster.combatStrength > 5
        );
        
        const healthyCreatures = allMonsters.filter(monster =>
          monster.type === MonsterType.CREATURE &&
          monster.health === monster.maxHealth
        );
        
        const monstersWithBehavior = allMonsters.filter(monster =>
          monster.behaviorFunction &&
          (monster.state === MonsterState.IDLE || 
           monster.state === MonsterState.ALERT ||
           monster.state === MonsterState.GUARDING)
        );
        
        const monstersWithInventory = allMonsters.filter(monster =>
          monster.inventory.length > 0 &&
          monster.type === MonsterType.HUMANOID
        );
        
        return {
          combatHumanoids: combatHumanoids.length,
          healthyCreatures: healthyCreatures.length,
          monstersWithBehavior: monstersWithBehavior.length,
          monstersWithInventory: monstersWithInventory.length
        };
      });

      expect(duration).toBeLessThan(20); // Complex queries should still be fast
      console.log(`Complex query pattern completed in ${duration}ms`);
    });

    it('should benchmark comprehensive monster analysis', async () => {
      // Comprehensive analysis that might be done by game systems
      const { result: analysis, duration } = await measureTime(async () => {
        const allMonsters = await loader.loadAllMonsters();
        
        return {
          totalMonsters: allMonsters.length,
          typeDistribution: Object.values(MonsterType).reduce((acc, type) => {
            acc[type] = allMonsters.filter(monster => monster.type === type).length;
            return acc;
          }, {} as Record<MonsterType, number>),
          stateDistribution: allMonsters.reduce((acc, monster) => {
            acc[monster.state] = (acc[monster.state] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageHealth: allMonsters.reduce((sum, monster) => sum + monster.health, 0) / allMonsters.length,
          combatCapablePercentage: (allMonsters.filter(monster => monster.combatStrength).length / allMonsters.length) * 100,
          behaviorComplexity: allMonsters.reduce((sum, monster) => {
            let complexity = 0;
            if (monster.behaviorFunction) complexity++;
            if (monster.movementPattern) complexity++;
            if (monster.meleeMessages && Object.keys(monster.meleeMessages).length > 0) complexity++;
            return sum + complexity;
          }, 0) / allMonsters.length,
          uniqueStartingLocations: new Set(allMonsters.map(monster => monster.startingSceneId).filter(Boolean)).size,
          totalInventoryItems: allMonsters.reduce((sum, monster) => sum + monster.inventory.length, 0)
        };
      });

      expect(analysis.totalMonsters).toBe(9);
      expect(duration).toBeLessThan(100); // Full analysis should complete within 100ms
      
      console.log(`Comprehensive analysis completed in ${duration}ms:`);
      console.log(`  Total monsters: ${analysis.totalMonsters}`);
      console.log(`  Average health: ${analysis.averageHealth.toFixed(2)}`);
      console.log(`  Combat capable: ${analysis.combatCapablePercentage.toFixed(1)}%`);
      console.log(`  Avg behavior complexity: ${analysis.behaviorComplexity.toFixed(2)}`);
      console.log(`  Unique starting locations: ${analysis.uniqueStartingLocations}`);
      console.log(`  Total inventory items: ${analysis.totalInventoryItems}`);
    });
  });

  describe('Monster-specific performance tests', () => {
    it('should efficiently find specific monsters by ID', async () => {
      // Arrange
      const allMonsters = await loader.loadAllMonsters();
      const testMonsterIds = ['thief', 'grue', 'ghost', 'troll'];
      
      // Act & Assert
      for (const monsterId of testMonsterIds) {
        const { result: monster, duration } = await measureTime(async () => {
          return allMonsters.find(m => m.id === monsterId);
        });
        
        expect(monster).toBeDefined();
        expect(monster!.id).toBe(monsterId);
        expect(duration).toBeLessThan(2); // Finding by ID should be very fast
        
        console.log(`Found ${monsterId} in ${duration}ms`);
      }
    });

    it('should efficiently validate monster properties', async () => {
      // Arrange
      const allMonsters = await loader.loadAllMonsters();
      
      // Act & Assert
      const { duration } = await measureTime(async () => {
        return allMonsters.every(monster => {
          // Validate required properties exist
          return monster.id && 
                 monster.name && 
                 monster.type && 
                 monster.state &&
                 typeof monster.health === 'number' &&
                 typeof monster.maxHealth === 'number' &&
                 Array.isArray(monster.inventory) &&
                 Array.isArray(monster.synonyms) &&
                 typeof monster.flags === 'object' &&
                 typeof monster.properties === 'object';
        });
      });
      
      expect(duration).toBeLessThan(5); // Property validation should be very fast
      console.log(`Validated all monster properties in ${duration}ms`);
    });

    it('should handle rapid successive data access', async () => {
      // Simulate rapid game updates that might access monster data frequently
      const iterations = 100;
      
      const { averageTime } = await benchmarkFunction(
        async () => {
          const allMonsters = await loader.loadAllMonsters();
          
          // Simulate rapid access patterns
          for (let i = 0; i < iterations; i++) {
            const randomIndex = Math.floor(Math.random() * allMonsters.length);
            const monster = allMonsters[randomIndex];
            
            // Access various properties (simulating game logic)
            const isIdle = monster!.state === MonsterState.IDLE;
            const hasHealth = monster!.health > 0;
            const isHumanoid = monster!.type === MonsterType.HUMANOID;
            const hasInventory = monster!.inventory.length > 0;
            
            // Use the values to prevent optimization
            if (isIdle && hasHealth && isHumanoid && hasInventory) {
              // This condition is rarely true, just to use the variables
            }
          }
          
          return allMonsters.length;
        },
        3
      );

      expect(averageTime).toBeLessThan(150); // Should handle rapid access efficiently
      console.log(`${iterations} rapid access operations averaged ${averageTime.toFixed(2)}ms`);
    });
  });
});