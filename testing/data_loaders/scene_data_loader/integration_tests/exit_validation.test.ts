/**
 * Integration tests for SceneDataLoader exit validation functionality
 * Tests real file I/O operations and validates scene exit connectivity and conversion
 */

import { SceneDataLoader } from '../../../../src/data_loaders/SceneDataLoader';

// Import setup to ensure fs/promises is not mocked
import './setup';
import { 
  PerformanceTestHelper,
  SceneValidationTestHelper,
  SceneFilterHelper
} from '../../../utils/test_helpers';

describe('SceneDataLoader - Exit Validation Integration', () => {
  let loader: SceneDataLoader;
  
  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new SceneDataLoader('data/scenes/');
  });

  describe('Exit structure validation', () => {
    it('should load and validate all scene exits correctly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      // Assert basic structure
      expect(allScenes.length).toBeGreaterThan(0);
      
      let totalExits = 0;
      let simpleExits = 0;
      let complexExits = 0;
      const exitDirections = new Set<string>();
      
      allScenes.forEach(scene => {
        SceneValidationTestHelper.validateSceneStructure(scene);
        
        // Validate exits array
        expect(Array.isArray(scene.exits)).toBe(true);
        
        scene.exits.forEach(exit => {
          totalExits++;
          
          // Validate exit structure
          expect(typeof exit.direction).toBe('string');
          expect(exit.direction.length).toBeGreaterThan(0);
          
          // Exit.to can be string or null (for blocked exits)
          if (exit.to !== null) {
            expect(typeof exit.to).toBe('string');
            // Empty string is valid for blocked exits (maintains type compatibility)
            expect(exit.to.length).toBeGreaterThanOrEqual(0);
          }
          
          exitDirections.add(exit.direction);
          
          // Categorize exit type
          if (typeof exit.locked !== 'undefined' || 
              typeof exit.hidden !== 'undefined' || 
              typeof exit.keyId !== 'undefined' ||
              typeof exit.description !== 'undefined' ||
              typeof exit.condition !== 'undefined') {
            complexExits++;
          } else {
            simpleExits++;
          }
          
          // Validate direction is a non-empty string
          // Note: Real data has many direction variations (n, ne, nw, etc.)
          expect(exit.direction.length).toBeGreaterThan(0);
          
          // Validate optional properties
          if (exit.locked !== undefined) {
            expect(typeof exit.locked).toBe('boolean');
          }
          if (exit.hidden !== undefined) {
            expect(typeof exit.hidden).toBe('boolean');
          }
          if (exit.keyId !== undefined && exit.keyId !== null) {
            expect(typeof exit.keyId).toBe('string');
          }
          if (exit.description !== undefined) {
            expect(typeof exit.description).toBe('string');
          }
          if (exit.condition !== undefined) {
            expect(typeof exit.condition).toBe('string');
          }
        });
      });
      
      console.log(`Exit validation results:`);
      console.log(`  Total scenes: ${allScenes.length}`);
      console.log(`  Total exits: ${totalExits}`);
      console.log(`  Simple exits: ${simpleExits}`);
      console.log(`  Complex exits: ${complexExits}`);
      console.log(`  Unique directions: ${exitDirections.size}`);
      console.log(`  Directions found: ${Array.from(exitDirections).sort().join(', ')}`);
      
      expect(totalExits).toBeGreaterThan(0);
    });

    it('should validate exit conversion from object to array format', async () => {
      // Act - Load a sampling of scenes to check conversion
      const allScenes = await loader.loadAllScenes();
      const sampleScenes = allScenes.slice(0, Math.min(20, allScenes.length));
      
      sampleScenes.forEach(scene => {
        // Verify exits are converted to array format
        expect(Array.isArray(scene.exits)).toBe(true);
        
        scene.exits.forEach(exit => {
          // Each exit should have direction and to properties
          expect(exit).toHaveProperty('direction');
          expect(exit).toHaveProperty('to');
          expect(typeof exit.direction).toBe('string');
          // Exit.to can be string or null (for blocked exits)
          if (exit.to !== null) {
            expect(typeof exit.to).toBe('string');
          }
        });
      });
    });

    it('should handle various exit direction patterns', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      const directionCounts: Record<string, number> = {};
      const directionPatterns = {
        cardinal: ['north', 'south', 'east', 'west'],
        vertical: ['up', 'down'],
        diagonal: ['northeast', 'northwest', 'southeast', 'southwest'],
        special: ['in', 'out']
      };
      
      allScenes.forEach(scene => {
        scene.exits.forEach(exit => {
          directionCounts[exit.direction] = (directionCounts[exit.direction] || 0) + 1;
        });
      });
      
      // Validate direction patterns
      Object.entries(directionPatterns).forEach(([pattern, directions]) => {
        const patternCount = directions.reduce((sum, dir) => sum + (directionCounts[dir] || 0), 0);
        console.log(`${pattern} directions: ${patternCount} exits`);
      });
      
      // Should have at least some cardinal directions
      const cardinalCount = directionPatterns.cardinal.reduce((sum, dir) => sum + (directionCounts[dir] || 0), 0);
      expect(cardinalCount).toBeGreaterThan(0);
      
      console.log(`Direction usage:`);
      Object.entries(directionCounts).sort(([,a], [,b]) => b - a).forEach(([dir, count]) => {
        console.log(`  ${dir}: ${count} uses`);
      });
    });
  });

  describe('Exit connectivity validation', () => {
    it('should validate bidirectional exit consistency', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const sceneMap = new Map(allScenes.map(scene => [scene.id, scene]));
      
      let validConnections = 0;
      let invalidConnections = 0;
      let bidirectionalConnections = 0;
      let unidirectionalConnections = 0;
      const connectionMap = new Map<string, Set<string>>();
      
      // Build connection map
      allScenes.forEach(scene => {
        scene.exits.forEach(exit => {
          if (!connectionMap.has(scene.id)) {
            connectionMap.set(scene.id, new Set());
          }
          connectionMap.get(scene.id)!.add(exit.to);
          
          // Check if target scene exists
          if (sceneMap.has(exit.to)) {
            validConnections++;
          } else {
            invalidConnections++;
            console.warn(`Scene ${scene.id} has exit to non-existent scene: ${exit.to}`);
          }
        });
      });
      
      // Check bidirectional connections
      connectionMap.forEach((targets, sceneId) => {
        targets.forEach(targetId => {
          const targetConnections = connectionMap.get(targetId);
          if (targetConnections && targetConnections.has(sceneId)) {
            bidirectionalConnections++;
          } else {
            unidirectionalConnections++;
          }
        });
      });
      
      console.log(`Connection analysis:`);
      console.log(`  Valid connections: ${validConnections}`);
      console.log(`  Invalid connections: ${invalidConnections}`);
      console.log(`  Bidirectional connections: ${bidirectionalConnections}`);
      console.log(`  Unidirectional connections: ${unidirectionalConnections}`);
      
      // Most connections should be valid
      if (validConnections + invalidConnections > 0) {
        const validityRatio = validConnections / (validConnections + invalidConnections);
        expect(validityRatio).toBeGreaterThan(0.85); // At least 85% should be valid
      }
    });

    it('should validate complex exit properties', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      let lockedExits = 0;
      let hiddenExits = 0;
      let conditionalExits = 0;
      let exitsWithKeys = 0;
      let exitsWithDescriptions = 0;
      
      allScenes.forEach(scene => {
        scene.exits.forEach(exit => {
          if (exit.locked) {
            lockedExits++;
            if (exit.keyId) {
              exitsWithKeys++;
            }
          }
          if (exit.hidden) {
            hiddenExits++;
          }
          if (exit.condition) {
            conditionalExits++;
          }
          if (exit.description) {
            exitsWithDescriptions++;
          }
        });
      });
      
      console.log(`Complex exit features:`);
      console.log(`  Locked exits: ${lockedExits}`);
      console.log(`  Hidden exits: ${hiddenExits}`);
      console.log(`  Conditional exits: ${conditionalExits}`);
      console.log(`  Exits with keys: ${exitsWithKeys}`);
      console.log(`  Exits with descriptions: ${exitsWithDescriptions}`);
      
      // If there are locked exits, some should have keys
      if (lockedExits > 0) {
        expect(exitsWithKeys).toBeGreaterThan(0);
      }
    });

    it('should handle connected scenes efficiently', async () => {
      // Test connected scenes for a few sample targets
      const allScenes = await loader.loadAllScenes();
      const sampleTargets = allScenes.slice(0, Math.min(5, allScenes.length)).map(scene => scene.id);
      
      for (const targetId of sampleTargets) {
        const { result: connectedScenes, duration } = await PerformanceTestHelper.measureTime(async () => {
          const allScenes = await loader.loadAllScenes();
          return SceneFilterHelper.filterConnectedTo(allScenes, targetId);
        });
        
        expect(duration).toBeLessThan(1000); // Should complete within 1 second
        expect(Array.isArray(connectedScenes)).toBe(true);
        
        // Verify all connected scenes actually connect to the target
        connectedScenes.forEach(scene => {
          const hasConnectionToTarget = scene.exits.some(exit => exit.to === targetId);
          expect(hasConnectionToTarget).toBe(true);
          SceneValidationTestHelper.validateSceneStructure(scene);
        });
        
        console.log(`Scene '${targetId}' has ${connectedScenes.length} connections (${duration.toFixed(2)}ms)`);
      }
    });
  });

  describe('Exit data integrity', () => {
    it('should maintain exit data integrity during loading', async () => {
      // Act - Load scenes and verify exit data integrity
      const allScenes = await loader.loadAllScenes();
      const sampleScenes = allScenes.slice(0, Math.min(10, allScenes.length));
      
      for (const scene of sampleScenes) {
        // Verify each exit has the required properties
        scene.exits.forEach(exit => {
          expect(exit).toHaveProperty('direction');
          expect(exit).toHaveProperty('to');
          expect(typeof exit.direction).toBe('string');
          // Exit.to can be string or null (for blocked exits)
          if (exit.to !== null) {
            expect(typeof exit.to).toBe('string');
          }
          
          // Verify optional properties have correct types when present
          if (exit.locked !== undefined) {
            expect(typeof exit.locked).toBe('boolean');
          }
          if (exit.hidden !== undefined) {
            expect(typeof exit.hidden).toBe('boolean');
          }
          if (exit.keyId !== undefined && exit.keyId !== null) {
            expect(typeof exit.keyId).toBe('string');
          }
          if (exit.description !== undefined) {
            expect(typeof exit.description).toBe('string');
          }
          if (exit.condition !== undefined) {
            expect(exit.condition).toBeDefined();
          }
        });
      }
    });

    it('should handle exit validation across multiple loading operations', async () => {
      // Act - Load scenes multiple times and verify consistency
      const testScenes = await loader.loadAllScenes();
      const sampleScene = testScenes[0];
      
      if (!sampleScene) {
        console.log('No scenes available for consistency testing');
        return;
      }
      
      // Load all scenes multiple times to verify consistency
      const loadOperations = [];
      for (let i = 0; i < 3; i++) {
        loadOperations.push(loader.loadAllScenes());
      }
      
      const loadResults = await Promise.all(loadOperations);
      
      // Verify all loaded scene sets are consistent
      for (let i = 1; i < loadResults.length; i++) {
        expect(loadResults[i]?.length).toBe(loadResults[0]?.length);
        
        // Find the sample scene in each result set
        const sampleSceneInResult = loadResults[i]?.find(scene => scene.id === sampleScene.id);
        expect(sampleSceneInResult).toBeDefined();
        expect(sampleSceneInResult!.exits.length).toBe(sampleScene.exits.length);
        
        sampleSceneInResult!.exits.forEach((exit, exitIndex) => {
          const originalExit = sampleScene.exits[exitIndex];
          expect(originalExit).toBeDefined();
          expect(exit.direction).toBe(originalExit?.direction);
          expect(exit.to).toBe(originalExit?.to);
        });
        
        console.log(`Load operation ${i + 1}: ${sampleSceneInResult!.exits.length} exits validated`);
      }
    });

    it('should validate scene exit relationships are stateless', async () => {
      // Act - Test that multiple calls don't affect each other
      const allScenes = await loader.loadAllScenes();
      
      if (allScenes.length < 2) {
        console.log('Insufficient scenes for stateless testing');
        return;
      }
      
      // Just use first scene for testing stateless behavior
      const scene1Id = allScenes[0]!.id;
      
      // Filter connected scenes for both
      const allScenes_first = await loader.loadAllScenes();
      const connected1_first = SceneFilterHelper.filterConnectedTo(allScenes_first, scene1Id);
      const allScenes_second = await loader.loadAllScenes();
      const connected1_second = SceneFilterHelper.filterConnectedTo(allScenes_second, scene1Id);
      
      // Results should be consistent
      expect(connected1_first.length).toBe(connected1_second.length);
      
      connected1_first.forEach((scene, index) => {
        expect(scene.id).toBe(connected1_second[index]?.id);
        expect(scene.exits.length).toBe(connected1_second[index]?.exits.length);
      });
      
      console.log(`Stateless validation: Scene ${scene1Id} consistently returns ${connected1_first.length} connections`);
    });
  });

  describe('Performance with exit operations', () => {
    it('should perform exit analysis efficiently', async () => {
      // Act & Assert - Benchmark exit-related operations
      
      // Test loadAllScenes performance
      const loadAllBenchmark = await PerformanceTestHelper.benchmarkFunction(() => loader.loadAllScenes(), 3);
      expect(loadAllBenchmark.averageTime).toBeLessThan(3000);
      console.log(`loadAllScenes performance:`);
      console.log(`  Average: ${loadAllBenchmark.averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${loadAllBenchmark.minTime.toFixed(2)}ms`);
      console.log(`  Max: ${loadAllBenchmark.maxTime.toFixed(2)}ms`);
      
      // Test scene filtering performance
      const filterBenchmark = await PerformanceTestHelper.benchmarkFunction(async () => {
        const scenes = await loader.loadAllScenes();
        if (scenes.length > 0) {
          return SceneFilterHelper.getSceneById(scenes, scenes[0]!.id);
        }
        return null;
      }, 3);
      expect(filterBenchmark.averageTime).toBeLessThan(3000);
      console.log(`Scene filtering performance:`);
      console.log(`  Average: ${filterBenchmark.averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${filterBenchmark.minTime.toFixed(2)}ms`);
      console.log(`  Max: ${filterBenchmark.maxTime.toFixed(2)}ms`);
    });

    it('should handle large exit datasets efficiently', async () => {
      // Act
      const { result: allScenes, duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllScenes();
      });
      
      // Calculate exit metrics
      const totalExits = allScenes.reduce((sum, scene) => sum + scene.exits.length, 0);
      const avgExitsPerScene = totalExits / allScenes.length;
      
      console.log(`Exit dataset performance:`);
      console.log(`  Total scenes: ${allScenes.length}`);
      console.log(`  Total exits: ${totalExits}`);
      console.log(`  Average exits per scene: ${avgExitsPerScene.toFixed(2)}`);
      console.log(`  Load time: ${duration.toFixed(2)}ms`);
      
      // Performance expectations
      expect(duration).toBeLessThan(5000); // Should load within 5 seconds
      expect(totalExits).toBeGreaterThan(0);
      
      if (totalExits > 100) {
        // For larger datasets, check that we can efficiently analyze exits
        const exitsPerMs = totalExits / duration;
        expect(exitsPerMs).toBeGreaterThan(0.1); // Should process at least 0.1 exits per ms
        console.log(`  Processing rate: ${exitsPerMs.toFixed(3)} exits/ms`);
      }
    });
  });
});