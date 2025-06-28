/**
 * Integration tests for ItemDataLoader performance
 * Tests real-world performance scenarios with actual file operations
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';

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

describe('ItemDataLoader - Performance Integration Tests', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new ItemDataLoader('data/items/');
  });

  describe('Basic loading performance', () => {
    it('should load all items within 2 seconds', async () => {
      // Act & Assert
      const { result: allItems, duration } = await measureTime(async () => {
        return await loader.loadAllItems();
      });

      expect(allItems.length).toBeGreaterThan(200);
      expect(duration).toBeLessThan(2000); // Should load within 2 seconds
      
      console.log(`Loaded ${allItems.length} items in ${duration}ms`);
    });

    it('should demonstrate consistent loading performance', async () => {
      // Act & Assert - Multiple loads for consistency
      const { averageTime, maxTime, minTime, results } = await benchmarkFunction(
        async () => {
          return await loader.loadAllItems();
        },
        5
      );

      expect(averageTime).toBeLessThan(2000);
      expect(maxTime).toBeLessThan(3000); // Allow some variation but cap at 3 seconds
      expect(minTime).toBeGreaterThan(0);
      
      // All results should have same count
      const counts = results.map(items => items.length);
      const uniqueCounts = new Set(counts);
      expect(uniqueCounts.size).toBe(1);
      
      console.log(`Performance benchmark (5 runs):`);
      console.log(`  Average: ${averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime.toFixed(2)}ms`);
      console.log(`  Item count: ${results[0]?.length || 0}`);
    });

    it('should load items efficiently without excessive memory usage', async () => {
      // Act & Assert
      const { result: allItems, memoryDelta } = await measureMemory(async () => {
        return await loader.loadAllItems();
      });

      expect(allItems.length).toBeGreaterThan(200);
      
      // Memory delta should be reasonable (less than 20MB for 214 items)
      // This is a rough estimate - actual values may vary by environment
      expect(memoryDelta).toBeLessThan(20 * 1024 * 1024);
      
      console.log(`Memory usage: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB for ${allItems.length} items`);
    });
  });

  describe('Filtering performance', () => {
    it('should filter by type efficiently after loading', async () => {
      // Arrange
      const allItems = await loader.loadAllItems();
      
      // Test filtering performance for each type
      const typeTests = [
        { type: ItemType.TOOL, expectedMin: 50 },
        { type: ItemType.CONTAINER, expectedMin: 10 },
        { type: ItemType.FOOD, expectedMin: 1 },
        { type: ItemType.WEAPON, expectedMin: 1 },
        { type: ItemType.LIGHT_SOURCE, expectedMin: 1 }
      ];

      for (const test of typeTests) {
        const { result: typeItems, duration } = await measureTime(async () => {
          return allItems.filter(item => item.type === test.type);
        });
        
        expect(typeItems.length).toBeGreaterThanOrEqual(test.expectedMin);
        expect(duration).toBeLessThan(10); // Filtering should be very fast
        
        console.log(`Filtered ${typeItems.length} ${test.type} items in ${duration}ms`);
      }
    });

    it('should filter by size efficiently', async () => {
      // Arrange
      const allItems = await loader.loadAllItems();
      
      // Act & Assert - Filter by different sizes
      const sizeTests = ['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE'];
      
      for (const size of sizeTests) {
        const { result: sizeItems, duration } = await measureTime(async () => {
          return allItems.filter(item => item.size === size);
        });
        
        expect(duration).toBeLessThan(10); // Filtering should be very fast
        
        if (sizeItems.length > 0) {
          console.log(`Filtered ${sizeItems.length} ${size} items in ${duration}ms`);
        }
      }
    });

    it('should filter by properties efficiently', async () => {
      // Arrange
      const allItems = await loader.loadAllItems();
      
      // Test various property filters
      const filterTests = [
        { name: 'portable items', filter: (item: any) => item.portable },
        { name: 'visible items', filter: (item: any) => item.visible },
        { name: 'items with interactions', filter: (item: any) => item.interactions.length > 0 },
        { name: 'heavy items (>10)', filter: (item: any) => item.weight > 10 },
        { name: 'items with tags', filter: (item: any) => item.tags.length > 0 }
      ];

      for (const test of filterTests) {
        const { result: filteredItems, duration } = await measureTime(async () => {
          return allItems.filter(test.filter);
        });
        
        expect(duration).toBeLessThan(20); // Complex filtering should still be fast
        
        console.log(`Filtered ${filteredItems.length} ${test.name} in ${duration}ms`);
      }
    });
  });

  describe('Concurrent loading performance', () => {
    it('should handle multiple concurrent loadAllItems calls', async () => {
      // Act - Start multiple loads simultaneously
      const concurrentLoads = 3;
      const loadPromises = Array.from({ length: concurrentLoads }, () => {
        return measureTime(async () => {
          return await loader.loadAllItems();
        });
      });

      const results = await Promise.all(loadPromises);

      // Assert
      results.forEach((result, index) => {
        expect(result.result.length).toBeGreaterThan(200);
        expect(result.duration).toBeLessThan(5000); // Allow more time for concurrent loads
        console.log(`Concurrent load ${index + 1}: ${result.result.length} items in ${result.duration}ms`);
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
              return loader.loadAllItems();
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
      expect(scalabilityResults[0]?.averageTime).toBeLessThan(2000);
      
      // Concurrent loads shouldn't be more than 3x slower
      const singleLoadTime = scalabilityResults[0]?.averageTime || 1000;
      const tripleLoadTime = scalabilityResults[2]?.averageTime || 3000;
      expect(tripleLoadTime).toBeLessThan(singleLoadTime * 3);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle repeated type filtering efficiently', async () => {
      // Simulate a common usage pattern: load once, filter many times
      const allItems = await loader.loadAllItems();
      
      // Perform many filter operations
      const filterOperations = 50;
      const { averageTime } = await benchmarkFunction(
        async () => {
          const results = [];
          for (let i = 0; i < filterOperations; i++) {
            const typeIndex = i % Object.values(ItemType).length;
            const type = Object.values(ItemType)[typeIndex] as ItemType;
            const filtered = allItems.filter(item => item.type === type);
            results.push(filtered.length);
          }
          return results;
        },
        3
      );

      expect(averageTime).toBeLessThan(100); // 50 filter operations should be very fast
      console.log(`${filterOperations} filter operations averaged ${averageTime.toFixed(2)}ms`);
    });

    it('should handle complex query patterns efficiently', async () => {
      // Simulate complex querying patterns
      const allItems = await loader.loadAllItems();
      
      const { duration } = await measureTime(async () => {
        // Complex multi-criteria filtering
        const portableTools = allItems.filter(item => 
          item.type === ItemType.TOOL && 
          item.portable && 
          item.weight < 20
        );
        
        const heavyContainers = allItems.filter(item =>
          item.type === ItemType.CONTAINER &&
          item.weight > 10
        );
        
        const interactiveItems = allItems.filter(item =>
          item.interactions.length > 2 &&
          item.visible
        );
        
        const smallValuableItems = allItems.filter(item =>
          item.size === 'TINY' &&
          item.properties.value &&
          typeof item.properties.value === 'number' &&
          item.properties.value > 5
        );
        
        return {
          portableTools: portableTools.length,
          heavyContainers: heavyContainers.length,
          interactiveItems: interactiveItems.length,
          smallValuableItems: smallValuableItems.length
        };
      });

      expect(duration).toBeLessThan(50); // Complex queries should still be fast
      console.log(`Complex query pattern completed in ${duration}ms`);
    });

    it('should benchmark comprehensive item analysis', async () => {
      // Comprehensive analysis that might be done by game systems
      const { result: analysis, duration } = await measureTime(async () => {
        const allItems = await loader.loadAllItems();
        
        return {
          totalItems: allItems.length,
          typeDistribution: Object.values(ItemType).reduce((acc, type) => {
            acc[type] = allItems.filter(item => item.type === type).length;
            return acc;
          }, {} as Record<ItemType, number>),
          sizeDistribution: ['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE'].reduce((acc, size) => {
            acc[size] = allItems.filter(item => item.size === size).length;
            return acc;
          }, {} as Record<string, number>),
          averageWeight: allItems.reduce((sum, item) => sum + item.weight, 0) / allItems.length,
          portablePercentage: (allItems.filter(item => item.portable).length / allItems.length) * 100,
          interactionComplexity: allItems.reduce((sum, item) => sum + item.interactions.length, 0) / allItems.length,
          uniqueLocations: new Set(allItems.map(item => item.currentLocation).filter(Boolean)).size,
          tagsUsed: new Set(allItems.flatMap(item => item.tags)).size
        };
      });

      expect(analysis.totalItems).toBeGreaterThan(200);
      expect(duration).toBeLessThan(500); // Full analysis should complete within 500ms
      
      console.log(`Comprehensive analysis completed in ${duration}ms:`);
      console.log(`  Total items: ${analysis.totalItems}`);
      console.log(`  Average weight: ${analysis.averageWeight.toFixed(2)}`);
      console.log(`  Portable: ${analysis.portablePercentage.toFixed(1)}%`);
      console.log(`  Avg interactions: ${analysis.interactionComplexity.toFixed(2)}`);
      console.log(`  Unique locations: ${analysis.uniqueLocations}`);
      console.log(`  Tags used: ${analysis.tagsUsed}`);
    });
  });
});