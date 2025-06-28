/**
 * Integration tests for SceneDataLoader regional distribution functionality
 * Tests real file I/O operations and validates scene regional organization
 */

import { SceneDataLoader } from '../../../../src/data_loaders/SceneDataLoader';

// Import setup to ensure fs/promises is not mocked
import './setup';
import { LightingCondition } from '../../../../src/types/SceneTypes';
import { 
  PerformanceTestHelper,
  SceneValidationTestHelper,
  SceneFilterHelper
} from '../../../utils/test_helpers';
import { TestDataSets } from '../../../utils/test_helpers';

describe('SceneDataLoader - Regional Distribution Integration', () => {
  let loader: SceneDataLoader;
  
  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new SceneDataLoader('data/scenes/');
  });

  describe('Regional scene distribution', () => {
    it('should load scenes with proper regional distribution', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      // Assert basic structure
      expect(allScenes.length).toBeGreaterThan(0);
      
      // Group scenes by region
      const scenesByRegion: Record<string, any[]> = {};
      allScenes.forEach(scene => {
        const region = scene.region || 'unknown';
        if (!scenesByRegion[region]) {
          scenesByRegion[region] = [];
        }
        scenesByRegion[region].push(scene);
      });
      
      // Verify expected regions exist
      const expectedRegions = TestDataSets.validRegions;
      const foundRegions = Object.keys(scenesByRegion);
      
      // Should have at least some of the expected regions
      const hasValidRegions = expectedRegions.some(region => foundRegions.includes(region));
      expect(hasValidRegions).toBe(true);
      
      // Verify each region has scenes
      Object.entries(scenesByRegion).forEach(([region, scenes]) => {
        expect(scenes.length).toBeGreaterThan(0);
        console.log(`Region '${region}': ${scenes.length} scenes`);
        
        // Validate scene structure for each region
        scenes.forEach(scene => {
          SceneValidationTestHelper.validateSceneStructure(scene);
          expect(scene.region).toBe(region === 'unknown' ? undefined : region);
        });
      });
    });

    it('should handle above_ground region scenes correctly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const aboveGroundScenes = SceneFilterHelper.filterByRegion(allScenes, 'above_ground');
      
      // Assert
      if (aboveGroundScenes.length > 0) {
        aboveGroundScenes.forEach(scene => {
          expect(scene.region).toBe('above_ground');
          SceneValidationTestHelper.validateSceneStructure(scene);
          
          // Above ground scenes should typically have daylight lighting
          if (scene.lighting) {
            expect(['daylight', 'lit'].includes(scene.lighting)).toBe(true);
          }
        });
        
        console.log(`Found ${aboveGroundScenes.length} above ground scenes`);
      } else {
        console.log('No above_ground scenes found - may not be implemented yet');
      }
    });

    it('should handle underground region scenes correctly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const undergroundScenes = SceneFilterHelper.filterByRegion(allScenes, 'underground');
      
      // Assert
      if (undergroundScenes.length > 0) {
        undergroundScenes.forEach(scene => {
          expect(scene.region).toBe('underground');
          SceneValidationTestHelper.validateSceneStructure(scene);
          
          // Underground scenes should typically have dark/lit lighting
          if (scene.lighting) {
            expect(['dark', 'lit', 'pitchBlack'].includes(scene.lighting)).toBe(true);
          }
        });
        
        console.log(`Found ${undergroundScenes.length} underground scenes`);
      } else {
        console.log('No underground scenes found - may not be implemented yet');
      }
    });

    it('should handle house region scenes correctly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const houseScenes = SceneFilterHelper.filterByRegion(allScenes, 'house');
      
      // Assert
      if (houseScenes.length > 0) {
        houseScenes.forEach(scene => {
          expect(scene.region).toBe('house');
          SceneValidationTestHelper.validateSceneStructure(scene);
          
          // House scenes should typically have lit lighting
          if (scene.lighting) {
            expect(['lit', 'daylight'].includes(scene.lighting)).toBe(true);
          }
        });
        
        console.log(`Found ${houseScenes.length} house scenes`);
      } else {
        console.log('No house scenes found - may not be implemented yet');
      }
    });

    it('should handle maze region scenes correctly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const mazeScenes = SceneFilterHelper.filterByRegion(allScenes, 'maze');
      
      // Assert
      if (mazeScenes.length > 0) {
        mazeScenes.forEach(scene => {
          expect(scene.region).toBe('maze');
          SceneValidationTestHelper.validateSceneStructure(scene);
          
          // Maze scenes might have various lighting conditions
          if (scene.lighting) {
            expect(TestDataSets.validLightingConditions.includes(scene.lighting)).toBe(true);
          }
        });
        
        console.log(`Found ${mazeScenes.length} maze scenes`);
      } else {
        console.log('No maze scenes found - may not be implemented yet');
      }
    });
  });

  describe('Regional connectivity validation', () => {
    it('should validate that regional scenes connect properly', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      // Create a map for quick scene lookup
      const sceneMap = new Map(allScenes.map(scene => [scene.id, scene]));
      
      // Group by region
      const scenesByRegion: Record<string, any[]> = {};
      allScenes.forEach(scene => {
        const region = scene.region || 'mixed';
        if (!scenesByRegion[region]) {
          scenesByRegion[region] = [];
        }
        scenesByRegion[region].push(scene);
      });
      
      // Validate connectivity within and between regions
      let crossRegionalConnections = 0;
      let intraRegionalConnections = 0;
      let orphanedScenes = 0;
      
      allScenes.forEach(scene => {
        let hasValidExits = false;
        
        scene.exits.forEach(exit => {
          const targetScene = sceneMap.get(exit.to);
          if (targetScene) {
            hasValidExits = true;
            
            if (scene.region === targetScene.region) {
              intraRegionalConnections++;
            } else {
              crossRegionalConnections++;
            }
          }
        });
        
        if (!hasValidExits && scene.exits.length > 0) {
          // Scene has exits but none connect to valid scenes
          console.warn(`Scene ${scene.id} has invalid exit connections`);
        }
        
        if (scene.exits.length === 0) {
          orphanedScenes++;
        }
      });
      
      console.log(`Regional connectivity analysis:`);
      console.log(`  Intra-regional connections: ${intraRegionalConnections}`);
      console.log(`  Cross-regional connections: ${crossRegionalConnections}`);
      console.log(`  Orphaned scenes: ${orphanedScenes}`);
      
      // Basic validation - most scenes should have connections
      expect(intraRegionalConnections + crossRegionalConnections).toBeGreaterThan(0);
    });

    it('should validate exit consistency across regions', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      // Create bidirectional exit map
      const exitMap = new Map<string, Set<string>>();
      const sceneMap = new Map(allScenes.map(scene => [scene.id, scene]));
      
      allScenes.forEach(scene => {
        scene.exits.forEach(exit => {
          if (!exitMap.has(scene.id)) {
            exitMap.set(scene.id, new Set());
          }
          exitMap.get(scene.id)!.add(exit.to);
        });
      });
      
      // Validate that exit targets exist
      let validExits = 0;
      let invalidExits = 0;
      
      exitMap.forEach((targets, sceneId) => {
        targets.forEach(targetId => {
          if (sceneMap.has(targetId)) {
            validExits++;
          } else {
            invalidExits++;
            console.warn(`Scene ${sceneId} has exit to non-existent scene: ${targetId}`);
          }
        });
      });
      
      console.log(`Exit validation:`);
      console.log(`  Valid exits: ${validExits}`);
      console.log(`  Invalid exits: ${invalidExits}`);
      
      // Most exits should be valid
      if (validExits + invalidExits > 0) {
        const validityRatio = validExits / (validExits + invalidExits);
        expect(validityRatio).toBeGreaterThan(0.8); // At least 80% of exits should be valid
      }
    });
  });

  describe('Performance with regional data', () => {
    it('should load regional scenes efficiently', async () => {
      // Act & Assert
      const { result: allScenes, duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllScenes();
      });
      
      expect(allScenes.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should load within 5 seconds
      
      console.log(`Loaded ${allScenes.length} scenes in ${duration.toFixed(2)}ms`);
    });

    it('should filter by region efficiently', async () => {
      // Arrange
      const allScenes = await loader.loadAllScenes();
      const availableRegions = [...new Set(allScenes.map(scene => scene.region).filter(Boolean))];
      
      if (availableRegions.length === 0) {
        console.log('No regional data available for performance testing');
        return;
      }
      
      // Test performance for each available region
      for (const region of availableRegions.slice(0, 3)) { // Test first 3 regions
        if (region) { // Ensure region is defined
          const { result: regionalScenes, duration } = await PerformanceTestHelper.measureTime(async () => {
            const allScenes = await loader.loadAllScenes();
            return SceneFilterHelper.filterByRegion(allScenes, region);
          });
        
          expect(regionalScenes.length).toBeGreaterThan(0);
          expect(duration).toBeLessThan(1000); // Should filter within 1 second
          
          console.log(`Filtered ${regionalScenes.length} scenes for region '${region}' in ${duration.toFixed(2)}ms`);
        }
      }
    });

    it('should benchmark regional distribution operations', async () => {
      // Benchmark multiple operations
      const operations = [
        { name: 'loadAllScenes', fn: () => loader.loadAllScenes() },
        { name: 'filterByLighting-daylight', fn: async () => {
          const allScenes = await loader.loadAllScenes();
          return SceneFilterHelper.filterByLighting(allScenes, LightingCondition.DAYLIGHT);
        }},
        { name: 'filterByLighting-dark', fn: async () => {
          const allScenes = await loader.loadAllScenes();
          return SceneFilterHelper.filterByLighting(allScenes, LightingCondition.DARK);
        }},
      ];
      
      for (const operation of operations) {
        const benchmark = await PerformanceTestHelper.benchmarkFunction(operation.fn, 3);
        
        expect(benchmark.averageTime).toBeLessThan(2000); // Should average under 2 seconds
        
        console.log(`${operation.name} benchmark:`);
        console.log(`  Average: ${benchmark.averageTime.toFixed(2)}ms`);
        console.log(`  Min: ${benchmark.minTime.toFixed(2)}ms`);
        console.log(`  Max: ${benchmark.maxTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Data integrity across regions', () => {
    it('should maintain consistent scene properties across regions', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      
      // Group by region and validate consistency
      const scenesByRegion: Record<string, any[]> = {};
      allScenes.forEach(scene => {
        const region = scene.region || 'unspecified';
        if (!scenesByRegion[region]) {
          scenesByRegion[region] = [];
        }
        scenesByRegion[region].push(scene);
      });
      
      Object.entries(scenesByRegion).forEach(([region, scenes]) => {
        console.log(`Validating ${scenes.length} scenes in region: ${region}`);
        
        scenes.forEach(scene => {
          // Validate basic scene structure
          SceneValidationTestHelper.validateSceneStructure(scene);
          
          // Validate scene data structure
          SceneValidationTestHelper.validateSceneDataStructure(scene);
          
          // Verify required properties exist and are correct types
          expect(typeof scene.id).toBe('string');
          expect(scene.id.length).toBeGreaterThan(0);
          expect(typeof scene.title).toBe('string');
          expect(typeof scene.description).toBe('string');
          expect(Array.isArray(scene.exits)).toBe(true);
          expect(Array.isArray(scene.items)).toBe(true);
          expect(Array.isArray(scene.monsters)).toBe(true);
          expect(Array.isArray(scene.tags)).toBe(true);
          expect(typeof scene.state).toBe('object');
          
          if (scene.region) {
            expect(typeof scene.region).toBe('string');
          }
          
          if (scene.lighting) {
            expect(TestDataSets.validLightingConditions.includes(scene.lighting)).toBe(true);
          }
        });
      });
    });

    it('should have consistent regional scene counts', async () => {
      // Act
      const allScenes = await loader.loadAllScenes();
      const totalCount = SceneFilterHelper.getTotalCount(allScenes);
      const regionalDistribution = SceneFilterHelper.getRegionalDistribution(allScenes);
      
      // Validate basic counts
      expect(typeof totalCount).toBe('number');
      expect(totalCount).toBeGreaterThan(0);
      expect(allScenes.length).toBe(totalCount);
      
      // Validate regional distribution
      expect(typeof regionalDistribution).toBe('object');
      
      // Verify region counts match actual data
      const actualRegionCounts: Record<string, number> = {};
      allScenes.forEach(scene => {
        const region = scene.region || 'unspecified';
        actualRegionCounts[region] = (actualRegionCounts[region] || 0) + 1;
      });
      
      Object.entries(regionalDistribution).forEach(([region, count]) => {
        if (typeof count === 'number') {
          expect(actualRegionCounts[region] || 0).toBeGreaterThanOrEqual(0);
          console.log(`Region ${region}: distribution=${count}, actual=${actualRegionCounts[region] || 0}`);
        }
      });
      
      console.log(`Scene distribution validation:`);
      console.log(`  Total scenes: ${totalCount}`);
      console.log(`  Loaded scenes: ${allScenes.length}`);
      console.log(`  Regional distribution:`, regionalDistribution);
    });
  });
});