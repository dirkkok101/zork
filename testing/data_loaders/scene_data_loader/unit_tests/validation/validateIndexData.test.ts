/**
 * Unit tests for SceneDataLoader index data validation
 * Tests validation of scene index structure and required fields
 */

import { SceneDataLoader } from '../../../../../src/data_loaders/SceneDataLoader';
import { SceneDataLoaderTestHelper } from '../../../../utils/test_helpers';
import { createMockSceneIndex, SceneDataFactory } from '../../../../utils/mock_factories';

describe('SceneDataLoader - Index Data Validation', () => {
  let loader: SceneDataLoader;
  let testHelper: SceneDataLoaderTestHelper;

  beforeEach(() => {
    loader = new SceneDataLoader('test-path/');
    testHelper = new SceneDataLoaderTestHelper();
  });

  describe('Required fields validation', () => {
    it('should require scenes field in index', async () => {
      // Arrange
      const invalidIndex = {
        total: 2,
        regions: {}
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have scenes array');
    });

    it('should require total field in index', async () => {
      // Arrange
      const invalidIndex = {
        scenes: [],
        regions: {}
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have total number');
    });

    it('should require regions field in index', async () => {
      // Arrange
      const invalidIndex = {
        scenes: [],
        total: 0
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have regions object');
    });

    it('should accept valid index with all required fields', async () => {
      // Arrange
      const validIndex = createMockSceneIndex({
        scenes: ['scene1.json', 'scene2.json'],
        total: 2,
        regions: {
          region1: ['scene1.json'],
          region2: ['scene2.json']
        }
      });

      const scene1 = SceneDataFactory.outdoor({ id: 'scene1' });
      const scene2 = SceneDataFactory.indoor({ id: 'scene2' });

      testHelper.mockMultipleFileReads({
        'index.json': validIndex,
        'scene1.json': scene1,
        'scene2.json': scene2
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id).sort()).toEqual(['scene1', 'scene2']);
    });
  });

  describe('Field type validation', () => {
    it('should validate that scenes is an array', async () => {
      // Arrange
      const invalidIndex = {
        scenes: 'not an array',
        total: 0,
        regions: {}
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have scenes array');
    });

    it('should validate that total is a number', async () => {
      // Arrange
      const invalidIndex = {
        scenes: [],
        total: 'not a number',
        regions: {}
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have total number');
    });

    it('should validate that regions is an object', async () => {
      // Arrange
      const invalidIndex = {
        scenes: [],
        total: 0,
        regions: 'not an object'
      };
      testHelper.mockFileRead('index.json', invalidIndex);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must have regions object');
    });

    it('should accept various valid index structures', async () => {
      // Arrange - Empty but valid
      const emptyIndex = {
        scenes: [],
        total: 0,
        regions: {},
        lastUpdated: '2024-06-25T00:00:00Z'
      };
      testHelper.mockFileRead('index.json', emptyIndex);

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Data structure validation', () => {
    it('should reject non-object index data', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', 'not an object');

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should reject null index data', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', null);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Index data must be an object');
    });

    it('should reject array as index data', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', []);

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });

    it('should handle malformed JSON gracefully', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', '{ invalid json');

      // Act & Assert
      await expect(loader.loadAllScenes())
        .rejects.toThrow('Failed to load scene index');
    });
  });

  describe('Index loading behavior', () => {
    it('should handle missing scene files referenced in index', async () => {
      // Arrange
      const index = createMockSceneIndex({
        scenes: ['exists.json', 'missing.json'],
        total: 2
      });

      testHelper.mockMultipleFileReads({
        'index.json': index,
        'exists.json': SceneDataFactory.outdoor({ id: 'exists' })
        // missing.json not provided
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('exists');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load scene from missing.json'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should ignore extra fields in index', async () => {
      // Arrange
      const indexWithExtras = {
        scenes: ['scene.json'],
        total: 1,
        regions: { main: ['scene.json'] },
        extraField: 'ignored',
        metadata: { version: '1.0' }
      };

      testHelper.mockMultipleFileReads({
        'index.json': indexWithExtras,
        'scene.json': SceneDataFactory.outdoor({ id: 'scene' })
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('scene');
    });
  });
});