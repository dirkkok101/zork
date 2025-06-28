/**
 * Unit tests for SceneDataLoader.loadAllScenes() method
 * Tests batch loading of all scenes with error handling and performance
 */

import { SceneDataLoader } from '@/data_loaders';
import { 
  SceneDataLoaderTestHelper, 
  SceneValidationTestHelper,
  ErrorTestHelper
} from '@testing/utils/test_helpers';
import { 
  createMockSceneIndex, 
  SceneDataFactory,
  InvalidSceneDataFactory
} from '@testing/utils/mock_factories';

describe('SceneDataLoader.loadAllScenes()', () => {
  let loader: SceneDataLoader;
  let testHelper: SceneDataLoaderTestHelper;

  beforeEach(() => {
    loader = new SceneDataLoader('test-path/');
    testHelper = new SceneDataLoaderTestHelper();
  });

  describe('Success scenarios', () => {
    it('should load all scenes from index', async () => {
      // Arrange
      const mockScenes = {
        'forest.json': SceneDataFactory.outdoor({ id: 'forest' }),
        'cave.json': SceneDataFactory.underground({ id: 'cave' }),
        'house.json': SceneDataFactory.indoor({ id: 'house' }),
        'maze.json': SceneDataFactory.maze({ id: 'maze' })
      };

      const mockIndex = createMockSceneIndex({
        scenes: Object.keys(mockScenes),
        total: 4
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        ...mockScenes
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(4);
      expect(result.map(s => s.id)).toEqual(['forest', 'cave', 'house', 'maze']);
      
      result.forEach(scene => {
        SceneValidationTestHelper.validateSceneStructure(scene);
      });
    });

    it('should load scenes of different types correctly', async () => {
      // Arrange
      const sceneTypes = [
        { factory: SceneDataFactory.outdoor, type: 'outdoor' },
        { factory: SceneDataFactory.underground, type: 'underground' },
        { factory: SceneDataFactory.indoor, type: 'indoor' },
        { factory: SceneDataFactory.maze, type: 'maze' }
      ];

      const mockScenes: Record<string, any> = {};
      const sceneFiles: string[] = [];

      sceneTypes.forEach(({ factory, type }, index) => {
        const sceneId = `${type}_scene_${index}`;
        const fileName = `${sceneId}.json`;
        mockScenes[fileName] = factory({ id: sceneId });
        sceneFiles.push(fileName);
      });

      const mockIndex = createMockSceneIndex({
        scenes: sceneFiles,
        total: sceneFiles.length
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        ...mockScenes
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(sceneTypes.length);
      
      sceneTypes.forEach(({ type }, index) => {
        const scene = result.find(s => s.id === `${type}_scene_${index}`)!;
        expect(scene).toBeDefined();
        // Verify the scene was properly converted from SceneData to Scene (pure data structure)
        expect(typeof scene.description).toBe('string'); // Description is data, not a function
        expect(Array.isArray(scene.exits)).toBe(true);
        expect(scene.id).toBe(`${type}_scene_${index}`);
      });
    });

    it('should handle empty scene list', async () => {
      // Arrange
      const mockIndex = createMockSceneIndex({
        scenes: [],
        total: 0
      });

      testHelper.mockFileRead('index.json', mockIndex);

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toEqual([]);
    });

    it('should continue loading after individual scene errors', async () => {
      // Arrange
      const goodScene1 = SceneDataFactory.outdoor({ id: 'good_scene_1' });
      const goodScene2 = SceneDataFactory.indoor({ id: 'good_scene_2' });
      
      const mockIndex = createMockSceneIndex({
        scenes: ['good_scene_1.json', 'bad_scene.json', 'good_scene_2.json'],
        total: 3
      });

      testHelper.mockMixedFileReads(
        {
          'index.json': mockIndex,
          'good_scene_1.json': goodScene1,
          'good_scene_2.json': goodScene2
        },
        {
          'bad_scene.json': new Error('Failed to load scene')
        }
      );

      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toEqual(['good_scene_1', 'good_scene_2']);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from bad_scene.json'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });


  describe('Error handling', () => {
    it('should handle index file errors', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('ENOENT'));

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should handle malformed index file', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', '{ invalid json }');

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should skip scenes with invalid data', async () => {
      // Arrange
      const validScene = SceneDataFactory.outdoor({ id: 'valid_scene_123' });
      const invalidScene = InvalidSceneDataFactory.missingRequiredFields();
      
      const mockIndex = createMockSceneIndex({
        scenes: ['valid_scene_123.json', 'invalid_scene_456.json'],
        total: 2
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'valid_scene_123.json': validScene,
        'invalid_scene_456.json': invalidScene
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('valid_scene_123');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Arrange
      const scenes = [
        { id: 'scene1', data: SceneDataFactory.outdoor({ id: 'scene1' }) },
        { id: 'scene2', error: new Error('File not found') },
        { id: 'scene3', data: SceneDataFactory.indoor({ id: 'scene3' }) },
        { id: 'scene4', data: InvalidSceneDataFactory.wrongTypes() },
        { id: 'scene5', data: SceneDataFactory.underground({ id: 'scene5' }) }
      ];

      const mockFiles: Record<string, any> = { 'index.json': createMockSceneIndex({ scenes: scenes.map(s => `${s.id}.json`) }) };
      const errorFiles: Record<string, Error> = {};

      scenes.forEach(scene => {
        const fileName = `${scene.id}.json`;
        if ('error' in scene) {
          errorFiles[fileName] = scene.error;
        } else {
          mockFiles[fileName] = scene.data;
        }
      });

      testHelper.mockMixedFileReads(mockFiles, errorFiles);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(3); // Only valid scenes
      expect(result.map(s => s.id)).toEqual(['scene1', 'scene3', 'scene5']);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4); // 2 errors each for scene2 and scene4 (loadSceneFromFile + loadAllScenes)

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data integrity', () => {
    it('should preserve all scene properties during bulk load', async () => {
      // Arrange
      const complexScene = SceneDataFactory.complexExits({
        id: 'complex_scene',
        atmosphere: ['Sound 1', 'Sound 2'],
        entryActions: [{ action: 'test', message: 'Test message' }]
      });

      const mockIndex = createMockSceneIndex({
        scenes: ['complex_scene.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'complex_scene.json': complexScene
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      const loadedScene = result[0]!;
      
      expect(loadedScene.id).toBe('complex_scene');
      expect(loadedScene.atmosphere).toEqual(['Sound 1', 'Sound 2']);
      expect(loadedScene.entryActions).toHaveLength(1);
      expect(loadedScene.exits).toHaveLength(4);
    });

    it('should maintain scene order from index', async () => {
      // Arrange
      const sceneOrder = ['scene_c', 'scene_a', 'scene_b', 'scene_d'];
      const mockScenes: Record<string, any> = {};

      sceneOrder.forEach(id => {
        mockScenes[`${id}.json`] = SceneDataFactory.outdoor({ id });
      });

      const mockIndex = createMockSceneIndex({
        scenes: sceneOrder.map(id => `${id}.json`)
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        ...mockScenes
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result.map(s => s.id)).toEqual(sceneOrder);
    });
  });
});
