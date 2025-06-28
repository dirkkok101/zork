/**
 * Integration tests for SceneDataLoader performance
 * Tests real-world performance scenarios with actual file operations
 */

import { SceneDataLoader } from '../../../../../src/data_loaders/SceneDataLoader';

// Import setup to ensure fs/promises is not mocked
import '../setup';
import { PerformanceTestHelper, SceneFilterHelper } from '../../../../utils/test_helpers';
import { 
  ScenePerformanceFactory,
  createMockSceneIndex
} from '../../../../utils/mock_factories';
import * as fs from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Import setup to ensure fs/promises is not mocked
import '../setup';

describe('SceneDataLoader - Performance Integration Tests', () => {
  let tempDir: string;
  let loader: SceneDataLoader;

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = join(tmpdir(), `scene-loader-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.mkdir(tempDir, { recursive: true });
    loader = new SceneDataLoader(tempDir + '/');
  });

  afterEach(async () => {
    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Single scene loading performance', () => {
    it('should load a single scene within 50ms', async () => {
      // Arrange
      const scenes = ScenePerformanceFactory.createLargeSceneSet(1);
      const sceneData = scenes[0];
      expect(sceneData).toBeDefined();
      const indexData = createMockSceneIndex({
        scenes: [`${sceneData!.id}.json`],
        total: 1
      });

      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await fs.writeFile(join(tempDir, `${sceneData!.id}.json`), JSON.stringify(sceneData, null, 2));

      // Act & Assert
      const { result, duration } = await PerformanceTestHelper.measureTime(async () => {
        const allScenes = await loader.loadAllScenes();
        return SceneFilterHelper.getSceneById(allScenes, sceneData!.id);
      });

      expect(result?.id).toBe(sceneData!.id);
      expect(duration).toBeLessThan(50);
    });

    it('should load scenes consistently under performance threshold', async () => {
      // Arrange
      const scenes = ScenePerformanceFactory.createLargeSceneSet(1);
      const sceneData = scenes[0];
      expect(sceneData).toBeDefined();
      const indexData = createMockSceneIndex({
        scenes: [`${sceneData!.id}.json`],
        total: 1
      });

      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await fs.writeFile(join(tempDir, `${sceneData!.id}.json`), JSON.stringify(sceneData, null, 2));

      // Act & Assert - Multiple loads for consistency
      const { averageTime, maxTime } = await PerformanceTestHelper.benchmarkFunction(
        async () => {
          const allScenes = await loader.loadAllScenes();
          return SceneFilterHelper.getSceneById(allScenes, sceneData!.id);
        },
        10
      );

      expect(averageTime).toBeLessThan(50);
      expect(maxTime).toBeLessThan(100); // Allow some variation but cap at 100ms
    });
  });

  describe('Bulk loading performance', () => {
    it('should load 25 scenes within 200ms', async () => {
      // Arrange
      const sceneCount = 25;
      const scenesData = ScenePerformanceFactory.createLargeSceneSet(sceneCount);
      const indexData = ScenePerformanceFactory.createLargeSceneIndex(sceneCount);

      // Write files
      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      for (const scene of scenesData) {
        await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
      }

      // Act & Assert
      const { result, duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllScenes();
      });

      expect(result).toHaveLength(sceneCount);
      expect(duration).toBeLessThan(200);
    });

    it('should load 100 scenes within 800ms', async () => {
      // Arrange
      const sceneCount = 100;
      const scenesData = ScenePerformanceFactory.createLargeSceneSet(sceneCount);
      const indexData = ScenePerformanceFactory.createLargeSceneIndex(sceneCount);

      // Write files
      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      for (const scene of scenesData) {
        await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
      }

      // Act & Assert
      const { result, duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllScenes();
      });

      expect(result).toHaveLength(sceneCount);
      expect(duration).toBeLessThan(800);
    });

    it('should demonstrate performance scaling', async () => {
      // Test different scene counts to verify scaling behavior
      const testCases = [10, 25, 50];
      const results: { count: number; duration: number }[] = [];

      for (const sceneCount of testCases) {
        // Clean and recreate temp directory
        await fs.rm(tempDir, { recursive: true, force: true });
        await fs.mkdir(tempDir, { recursive: true });

        // Arrange
        const scenesData = ScenePerformanceFactory.createLargeSceneSet(sceneCount);
        const indexData = ScenePerformanceFactory.createLargeSceneIndex(sceneCount);

        await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
        
        for (const scene of scenesData) {
          await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
        }

        // Act
        const { duration } = await PerformanceTestHelper.measureTime(async () => {
          return await loader.loadAllScenes();
        });

        results.push({ count: sceneCount, duration });
      }

      // Assert - Performance should scale reasonably (not exponentially)
      expect(results).toHaveLength(3);
      expect(results[0]?.duration).toBeLessThan(100); // 10 scenes < 100ms
      expect(results[1]?.duration).toBeLessThan(250); // 25 scenes < 250ms
      expect(results[2]?.duration).toBeLessThan(500); // 50 scenes < 500ms

      // Verify roughly linear scaling (within 50% tolerance)
      const scalingRatio = results[2]!.duration / results[0]!.duration;
      expect(scalingRatio).toBeLessThan(7.5); // 50 scenes shouldn't take >7.5x longer than 10
    });
  });

  describe('Regional loading performance', () => {

    it('should efficiently handle multiple regional queries', async () => {
      // Arrange
      const regions = ['forest', 'cave', 'house', 'maze'];
      const scenesPerRegion = 10;
      const allScenes: any[] = [];
      const regionMap: Record<string, string[]> = {};

      regions.forEach((region) => {
        regionMap[region] = [];
        for (let i = 0; i < scenesPerRegion; i++) {
          const sceneId = `${region}_scene_${i}`;
          const scenes = ScenePerformanceFactory.createLargeSceneSet(1);
          const scene = scenes[0];
          expect(scene).toBeDefined();
          scene!.id = sceneId;
          scene!.region = region;
          allScenes.push(scene);
          regionMap[region].push(`${sceneId}.json`);
        }
      });

      const indexData = createMockSceneIndex({
        scenes: allScenes.map(s => `${s.id}.json`),
        total: allScenes.length,
        regions: regionMap
      });

      // Write files
      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      for (const scene of allScenes) {
        await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
      }

      // Act - Load all regions sequentially
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const allScenes = await loader.loadAllScenes();
        for (const region of regions) {
          const scenes = SceneFilterHelper.filterByRegion(allScenes, region);
          expect(scenes).toHaveLength(scenesPerRegion);
        }
      });

      // Assert
      expect(duration).toBeLessThan(400); // All regions should load quickly
    });
  });

  describe('Memory usage', () => {
    it('should not have excessive memory growth during bulk loading', async () => {
      // Arrange
      const sceneCount = 50;
      const scenesData = ScenePerformanceFactory.createLargeSceneSet(sceneCount);
      const indexData = ScenePerformanceFactory.createLargeSceneIndex(sceneCount);

      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      for (const scene of scenesData) {
        await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
      }

      // Act & Assert
      const { result, memoryDelta } = await PerformanceTestHelper.measureMemory(async () => {
        return await loader.loadAllScenes();
      });

      expect(result).toHaveLength(sceneCount);
      
      // Memory delta should be reasonable (less than 50MB for 50 scenes)
      // This is a rough estimate - actual values may vary by environment
      expect(memoryDelta).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Index operations performance', () => {
    it('should quickly access scene count and existence', async () => {
      // Arrange
      const sceneCount = 200;
      const scenesData = ScenePerformanceFactory.createLargeSceneSet(sceneCount);
      const indexData = ScenePerformanceFactory.createLargeSceneIndex(sceneCount);

      // Write all scene files
      await fs.writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      for (const scene of scenesData) {
        await fs.writeFile(join(tempDir, `${scene.id}.json`), JSON.stringify(scene, null, 2));
      }

      // Act & Assert - getTotalCount
      const { result: allScenes, duration: loadDuration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllScenes();
      });
      
      const count = SceneFilterHelper.getTotalCount(allScenes);
      expect(count).toBe(sceneCount);
      expect(loadDuration).toBeLessThan(1000); // Loading 200 files should complete within 1 second

      // Act & Assert - sceneExists (multiple checks)
      const { duration: existsDuration } = await PerformanceTestHelper.measureTime(async () => {
        SceneFilterHelper.sceneExists(allScenes, 'performance_scene_0');
        SceneFilterHelper.sceneExists(allScenes, 'performance_scene_100');
        SceneFilterHelper.sceneExists(allScenes, 'performance_scene_199');
        SceneFilterHelper.sceneExists(allScenes, 'nonexistent_scene');
      });

      expect(existsDuration).toBeLessThan(10); // Filtering should be very fast

      // Act & Assert - getRegionalDistribution
      const { result: distribution, duration: distributionDuration } = await PerformanceTestHelper.measureTime(async () => {
        return SceneFilterHelper.getRegionalDistribution(allScenes);
      });

      expect(Object.keys(distribution)).toHaveLength(4); // 4 regions in performance factory
      expect(distributionDuration).toBeLessThan(10); // Filtering should be very fast
    });
  });
});