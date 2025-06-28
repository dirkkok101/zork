/**
 * Unit tests for SceneDataLoader scene data validation
 * Tests validation of scene data structure and required fields
 */

import { SceneDataLoader } from '../../../../../src/data_loaders/SceneDataLoader';
import { 
  SceneDataLoaderTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockSceneIndex,
  SceneDataFactory,
  createMockSceneData
} from '../../../../utils/mock_factories';

describe('SceneDataLoader - Scene Data Validation', () => {
  let loader: SceneDataLoader;
  let testHelper: SceneDataLoaderTestHelper;

  beforeEach(() => {
    loader = new SceneDataLoader('test-path/');
    testHelper = new SceneDataLoaderTestHelper();
  });

  describe('Required fields validation', () => {
    const requiredFields = [
      'id', 'title', 'description', 'exits', 'items', 'monsters', 
      'state', 'lighting', 'tags'
    ];

    requiredFields.forEach(field => {
      it(`should require ${field} field`, async () => {
        // Arrange
        const validData = createMockSceneData({ id: 'test_scene' });
        const invalidData = { ...validData };
        delete (invalidData as any)[field];

        const mockIndex = createMockSceneIndex({
          scenes: ['test_scene.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'test_scene.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from test_scene.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
      });
    });

    it('should accept valid scene with all required fields', async () => {
      // Arrange
      const validData = createMockSceneData({ id: 'valid_scene' });
      const mockIndex = createMockSceneIndex({
        scenes: ['valid_scene.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'valid_scene.json': validData
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_scene');
    });
  });

  describe('Field type validation', () => {
    it('should validate that id is a non-empty string', async () => {
      // Arrange
      const testCases = [
        { id: '', error: 'Scene ID must be a non-empty string' },
        { id: 123, error: 'Scene ID must be a non-empty string' },
        { id: null, error: 'Scene ID must be a non-empty string' },
        { id: [], error: 'Scene ID must be a non-empty string' },
        { id: {}, error: 'Scene ID must be a non-empty string' }
      ];

      for (const testCase of testCases) {
        const invalidData = createMockSceneData();
        (invalidData as any).id = testCase.id;

        const mockIndex = createMockSceneIndex({
          scenes: ['invalid_scene.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'invalid_scene.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from invalid_scene.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });

    it('should validate that exits is an object', async () => {
      // Arrange
      const invalidExitsValues = [
        'not an object',
        123,
        null
      ];

      for (const exitsValue of invalidExitsValues) {
        const invalidData = createMockSceneData({ id: 'exits_test' });
        (invalidData as any).exits = exitsValue;

        const mockIndex = createMockSceneIndex({
          scenes: ['exits_test.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'exits_test.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from exits_test.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });

    it('should validate that items is an array', async () => {
      // Arrange
      const invalidItemsValues = [
        'not an array',
        123,
        {},
        null
      ];

      for (const itemsValue of invalidItemsValues) {
        const invalidData = createMockSceneData({ id: 'items_test' });
        (invalidData as any).items = itemsValue;

        const mockIndex = createMockSceneIndex({
          scenes: ['items_test.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'items_test.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from items_test.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });

    it('should validate that monsters is an array', async () => {
      // Arrange
      const invalidMonstersValues = [
        'not an array',
        123,
        {},
        null
      ];

      for (const monstersValue of invalidMonstersValues) {
        const invalidData = createMockSceneData({ id: 'monsters_test' });
        (invalidData as any).monsters = monstersValue;

        const mockIndex = createMockSceneIndex({
          scenes: ['monsters_test.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'monsters_test.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from monsters_test.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });

    it('should validate that tags is an array', async () => {
      // Arrange
      const invalidTagsValues = [
        'not an array',
        123,
        {},
        null
      ];

      for (const tagsValue of invalidTagsValues) {
        const invalidData = createMockSceneData({ id: 'tags_test' });
        (invalidData as any).tags = tagsValue;

        const mockIndex = createMockSceneIndex({
          scenes: ['tags_test.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'tags_test.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from tags_test.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });
  });

  describe('Lighting validation', () => {
    it('should accept valid lighting conditions', async () => {
      // Arrange
      const validLightingValues = ['daylight', 'lit', 'dark', 'pitchBlack'];

      for (const lighting of validLightingValues) {
        const validData = createMockSceneData({ 
          id: `lighting_${lighting}`,
          lighting 
        });

        const mockIndex = createMockSceneIndex({
          scenes: [`lighting_${lighting}.json`]
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          [`lighting_${lighting}.json`]: validData
        });

        // Act
        const result = await loader.loadAllScenes();

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0]?.lighting).toBe(lighting);

        testHelper.clearMocks();
      }
    });

    it('should reject invalid lighting conditions', async () => {
      // Arrange
      const invalidLightingValues = [
        'bright',
        'dim',
        'twilight',
        'DAYLIGHT', // Wrong case
        'invalid',
        '',
        123,
        null,
        []
      ];

      for (const lighting of invalidLightingValues) {
        const invalidData = createMockSceneData({ 
          id: 'invalid_lighting',
          lighting: lighting as any
        });

        const mockIndex = createMockSceneIndex({
          scenes: ['invalid_lighting.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'invalid_lighting.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from invalid_lighting.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });
  });

  describe('Data structure validation', () => {
    it('should reject non-object data', async () => {
      // Arrange
      const invalidDataValues = [
        'string',
        123,
        null,
        true
      ];

      for (const invalidData of invalidDataValues) {
        const mockIndex = createMockSceneIndex({
          scenes: ['invalid_data.json']
        });

        testHelper.mockMultipleFileReads({
          'index.json': mockIndex,
          'invalid_data.json': invalidData
        });

        // Act & Assert - loadAllScenes should log error and continue
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await loader.loadAllScenes();
        expect(result).toHaveLength(0); // No valid scenes loaded
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load scene from invalid_data.json'),
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();

        testHelper.clearMocks();
      }
    });

    it('should handle complex valid scene structures', async () => {
      // Arrange
      const complexScene = SceneDataFactory.complexExits({
        id: 'complex_validation_test',
        firstVisitDescription: 'Complex first visit',
        region: 'test_region',
        atmosphere: ['Sound 1', 'Sound 2'],
        entryActions: [
          {
            action: 'test_action',
            condition: 'test_condition',
            message: 'Test message',
            once: true,
            payload: { key: 'value' }
          }
        ]
      });

      const mockIndex = createMockSceneIndex({
        scenes: ['complex_validation_test.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'complex_validation_test.json': complexScene
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      const scene = result[0];
      expect(scene?.id).toBe('complex_validation_test');
      expect(scene?.firstVisitDescription).toBe('Complex first visit');
      expect(scene?.region).toBe('test_region');
      expect(scene?.atmosphere).toEqual(['Sound 1', 'Sound 2']);
    });
  });

  describe('Edge cases', () => {
    it('should handle scenes with minimal valid data', async () => {
      // Arrange
      const minimalScene = {
        id: 'minimal',
        title: 'Minimal Scene',
        description: 'Basic description',
        exits: {},
        items: [],
        monsters: [],
        state: {},
        lighting: 'daylight',
        tags: []
      };

      const mockIndex = createMockSceneIndex({
        scenes: ['minimal.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'minimal.json': minimalScene
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      const scene = result[0];
      expect(scene?.id).toBe('minimal');
      expect(scene?.exits).toEqual([]);
      expect(scene?.items).toEqual([]);
      expect(scene?.monsters).toEqual([]);
      expect(scene?.tags).toEqual([]);
    });

    it('should handle scenes with all optional fields present', async () => {
      // Arrange
      const fullScene = createMockSceneData({
        id: 'full_scene',
        firstVisitDescription: 'First visit description',
        region: 'full_region',
        atmosphere: ['Atmospheric sound 1', 'Atmospheric sound 2'],
        entryActions: [
          {
            action: 'entry_action',
            condition: 'entry_condition',
            message: 'Entry message',
            once: true
          }
        ]
      });

      const mockIndex = createMockSceneIndex({
        scenes: ['full_scene.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'full_scene.json': fullScene
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      const scene = result[0];
      expect(scene?.firstVisitDescription).toBe('First visit description');
      expect(scene?.region).toBe('full_region');
      expect(scene?.atmosphere).toEqual(['Atmospheric sound 1', 'Atmospheric sound 2']);
    });

    it('should handle empty arrays and objects in valid scenes', async () => {
      // Arrange
      const emptyFieldsScene = {
        id: 'empty_fields',
        title: 'Empty Fields Scene',
        description: 'Scene with empty collections',
        exits: {},
        items: [],
        monsters: [],
        state: {},
        lighting: 'daylight',
        tags: [],
        atmosphere: [],
        entryActions: []
      };

      const mockIndex = createMockSceneIndex({
        scenes: ['empty_fields.json']
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'empty_fields.json': emptyFieldsScene
      });

      // Act
      const result = await loader.loadAllScenes();

      // Assert
      expect(result).toHaveLength(1);
      const scene = result[0];
      expect(scene?.exits).toEqual([]);
      expect(scene?.items).toEqual([]);
      expect(scene?.monsters).toEqual([]);
      expect(scene?.tags).toEqual([]);
      expect(scene?.atmosphere).toEqual([]);
    });
  });
});