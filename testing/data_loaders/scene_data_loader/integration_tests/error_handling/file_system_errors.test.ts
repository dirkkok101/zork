/**
 * Integration tests for SceneDataLoader file system error handling
 * Tests real file system error scenarios
 */

import { SceneDataLoader } from '../../../../../src/data_loaders/SceneDataLoader';

// Import setup to ensure fs/promises is not mocked
import '../setup';
import { SceneDataFactory, createMockSceneIndex } from '../../../../utils/mock_factories';
import { SceneFilterHelper } from '../../../../utils/test_helpers';
import { writeFile, mkdir, rm, chmod } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Import setup to ensure fs/promises is not mocked
import '../setup';

describe('SceneDataLoader - File System Error Integration Tests', () => {
  let tempDir: string;
  let loader: SceneDataLoader;

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = join(tmpdir(), `scene-loader-error-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await mkdir(tempDir, { recursive: true });
    loader = new SceneDataLoader(tempDir + '/');
  });

  afterEach(async () => {
    // Restore permissions and clean up
    try {
      await chmod(tempDir, 0o755);
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Missing files', () => {
    it('should handle missing index file', async () => {
      // Arrange - No index.json file created

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should handle missing scene files gracefully', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['existing.json', 'missing.json', 'also_existing.json'],
        total: 3,
        regions: {
          test_region: ['existing.json', 'missing.json', 'also_existing.json']
        }
      });

      const existingScene1 = SceneDataFactory.outdoor({ id: 'existing', region: 'test_region' });
      const existingScene2 = SceneDataFactory.indoor({ id: 'also_existing', region: 'test_region' });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(join(tempDir, 'existing.json'), JSON.stringify(existingScene1, null, 2));
      await writeFile(join(tempDir, 'also_existing.json'), JSON.stringify(existingScene2, null, 2));
      // missing.json is intentionally not created

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const allScenes = await loader.loadAllScenes();
      const regionScenes = SceneFilterHelper.filterByRegion(allScenes, 'test_region');

      // Assert
      expect(allScenes).toHaveLength(2);
      expect(allScenes.map(s => s.id).sort()).toEqual(['also_existing', 'existing']);
      
      expect(regionScenes).toHaveLength(2);
      expect(regionScenes.map(s => s.id).sort()).toEqual(['also_existing', 'existing']);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from missing.json'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle individual missing scene in loadAllScenes', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['existing.json']
      });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      // Don't create the scene file

      // Act & Assert - loadAllScenes should continue despite missing files
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const allScenes = await loader.loadAllScenes();
      expect(allScenes).toHaveLength(0); // No valid scenes loaded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from existing.json'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Permission errors', () => {
    it('should handle permission denied on directory', async () => {
      // Arrange
      if (process.platform === 'win32') {
        // Skip on Windows where permission testing is more complex
        return;
      }

      await chmod(tempDir, 0o000); // Remove all permissions

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');

      // Restore permissions for cleanup
      await chmod(tempDir, 0o755);
    });

    it('should handle permission denied on index file', async () => {
      // Arrange
      if (process.platform === 'win32') {
        // Skip on Windows where permission testing is more complex
        return;
      }

      const indexData = createMockSceneIndex();
      const indexPath = join(tempDir, 'index.json');
      
      await writeFile(indexPath, JSON.stringify(indexData, null, 2));
      await chmod(indexPath, 0o000); // Remove all permissions

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');

      // Restore permissions for cleanup
      await chmod(indexPath, 0o644);
    });

    it('should handle permission denied on scene file', async () => {
      // Arrange
      if (process.platform === 'win32') {
        // Skip on Windows where permission testing is more complex
        return;
      }

      const indexData = createMockSceneIndex({
        scenes: ['restricted.json']
      });
      const sceneData = SceneDataFactory.outdoor({ id: 'restricted' });
      const scenePath = join(tempDir, 'restricted.json');

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(scenePath, JSON.stringify(sceneData, null, 2));
      await chmod(scenePath, 0o000); // Remove all permissions

      // Act & Assert - loadAllScenes should continue despite permission errors
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const allScenes = await loader.loadAllScenes();
      expect(allScenes).toHaveLength(0); // No valid scenes loaded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from restricted.json'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();

      // Restore permissions for cleanup
      await chmod(scenePath, 0o644);
    });
  });

  describe('Corrupted files', () => {
    it('should handle corrupted index JSON', async () => {
      // Arrange
      await writeFile(join(tempDir, 'index.json'), '{ invalid json content }');

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should handle corrupted scene JSON', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['corrupted.json']
      });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(join(tempDir, 'corrupted.json'), '{ "id": "corrupted", invalid }');

      // Act & Assert - loadAllScenes should continue despite corrupted files
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const allScenes = await loader.loadAllScenes();
      expect(allScenes).toHaveLength(0); // No valid scenes loaded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from corrupted.json'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle empty files', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['empty.json']
      });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(join(tempDir, 'empty.json'), '');

      // Act & Assert - loadAllScenes should continue despite empty files
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const allScenes = await loader.loadAllScenes();
      expect(allScenes).toHaveLength(0); // No valid scenes loaded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from empty.json'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle binary files instead of JSON', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['binary.json']
      });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      // Write binary data instead of JSON
      await writeFile(join(tempDir, 'binary.json'), Buffer.from([0x00, 0x01, 0x02, 0x03]));

      // Act & Assert - loadAllScenes should continue despite binary files
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const allScenes = await loader.loadAllScenes();
      expect(allScenes).toHaveLength(0); // No valid scenes loaded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from binary.json'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Network/IO issues simulation', () => {
    it('should handle large files that might timeout', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['large.json']
      });

      // Create a very large scene with excessive data
      const largeSceneData = SceneDataFactory.outdoor({ id: 'large' });
      largeSceneData.description = 'x'.repeat(1000000); // 1MB description
      largeSceneData.atmosphere = Array(10000).fill('Atmospheric message with lots of content');

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(join(tempDir, 'large.json'), JSON.stringify(largeSceneData, null, 2));

      // Act
      const allScenes = await loader.loadAllScenes();
      const result = SceneFilterHelper.getSceneById(allScenes, 'large');

      // Assert
      expect(result?.id).toBe('large');
      expect(result?.description).toHaveLength(1000000);
    });

    it('should handle concurrent file access', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['concurrent1.json', 'concurrent2.json', 'concurrent3.json']
      });

      const scenes = [
        SceneDataFactory.outdoor({ id: 'concurrent1' }),
        SceneDataFactory.indoor({ id: 'concurrent2' }),
        SceneDataFactory.underground({ id: 'concurrent3' })
      ];

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      for (let i = 0; i < scenes.length; i++) {
        await writeFile(join(tempDir, `concurrent${i + 1}.json`), JSON.stringify(scenes[i], null, 2));
      }

      // Act - Load all scenes via loadAllScenes
      const allScenes = await loader.loadAllScenes();
      const results = [
        SceneFilterHelper.getSceneById(allScenes, 'concurrent1'),
        SceneFilterHelper.getSceneById(allScenes, 'concurrent2'),
        SceneFilterHelper.getSceneById(allScenes, 'concurrent3')
      ].filter(scene => scene !== undefined);

      // Assert
      expect(results).toHaveLength(3);
      expect(results.map(r => r.id).sort()).toEqual(['concurrent1', 'concurrent2', 'concurrent3']);
    });
  });

  describe('Recovery and resilience', () => {
    it('should handle partial failures in batch operations', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['good1.json', 'bad1.json', 'good2.json', 'bad2.json', 'good3.json'],
        regions: {
          mixed_region: ['good1.json', 'bad1.json', 'good2.json', 'bad2.json', 'good3.json']
        }
      });

      const goodScenes = [
        SceneDataFactory.outdoor({ id: 'good1', region: 'mixed_region' }),
        SceneDataFactory.indoor({ id: 'good2', region: 'mixed_region' }),
        SceneDataFactory.underground({ id: 'good3', region: 'mixed_region' })
      ];

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      
      // Write good scenes
      await writeFile(join(tempDir, 'good1.json'), JSON.stringify(goodScenes[0], null, 2));
      await writeFile(join(tempDir, 'good2.json'), JSON.stringify(goodScenes[1], null, 2));
      await writeFile(join(tempDir, 'good3.json'), JSON.stringify(goodScenes[2], null, 2));
      
      // Write bad scenes
      await writeFile(join(tempDir, 'bad1.json'), '{ invalid json }');
      await writeFile(join(tempDir, 'bad2.json'), '{ "id": "bad2", missing_required_fields: true }');

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const allScenes = await loader.loadAllScenes();
      const regionScenes = SceneFilterHelper.filterByRegion(allScenes, 'mixed_region');

      // Assert
      expect(allScenes).toHaveLength(3);
      expect(allScenes.map(s => s.id).sort()).toEqual(['good1', 'good2', 'good3']);
      
      expect(regionScenes).toHaveLength(3);
      expect(regionScenes.map(s => s.id).sort()).toEqual(['good1', 'good2', 'good3']);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // Two bad files

      consoleErrorSpy.mockRestore();
    });

    it('should maintain consistency across multiple operations', async () => {
      // Arrange
      const indexData = createMockSceneIndex({
        scenes: ['stable.json'],
        regions: {
          stable_region: ['stable.json']
        }
      });

      const sceneData = SceneDataFactory.outdoor({ id: 'stable', region: 'stable_region' });

      await writeFile(join(tempDir, 'index.json'), JSON.stringify(indexData, null, 2));
      await writeFile(join(tempDir, 'stable.json'), JSON.stringify(sceneData, null, 2));

      // Act - Multiple operations on same data
      const all1 = await loader.loadAllScenes();
      const count1 = SceneFilterHelper.getTotalCount(all1);
      const exists1 = SceneFilterHelper.sceneExists(all1, 'stable');
      const scene1 = SceneFilterHelper.getSceneById(all1, 'stable');
      const region1 = SceneFilterHelper.filterByRegion(all1, 'stable_region');

      // Verify consistency
      expect(count1).toBe(1);
      expect(exists1).toBe(true);
      expect(scene1?.id).toBe('stable');
      expect(region1).toHaveLength(1);
      expect(region1[0]?.id).toBe('stable');
      expect(all1).toHaveLength(1);
      expect(all1[0]?.id).toBe('stable');

      // Act - Repeat operations (should be consistent)
      const all2 = await loader.loadAllScenes();
      const count2 = SceneFilterHelper.getTotalCount(all2);
      const exists2 = SceneFilterHelper.sceneExists(all2, 'stable');
      const scene2 = SceneFilterHelper.getSceneById(all2, 'stable');

      // Assert consistency
      expect(count2).toBe(count1);
      expect(exists2).toBe(exists1);
      expect(scene2?.id).toBe(scene1?.id);
    });
  });
});