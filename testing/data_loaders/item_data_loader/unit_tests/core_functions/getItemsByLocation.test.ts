/**
 * Unit tests for ItemDataLoader.getItemsByLocation() method
 * Tests location-based filtering for scene population
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { 
  ItemDataLoaderTestHelper, 
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory
} from '../../../../utils/mock_factories';

describe('ItemDataLoader.getItemsByLocation()', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Location filtering functionality', () => {
    it('should filter items by specific location correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'lamp', initialLocation: 'living_room' }),
        ItemDataFactory.treasure({ id: 'coin', initialLocation: 'treasure_room' }),
        ItemDataFactory.tool({ id: 'rope', initialLocation: 'living_room' }),
        ItemDataFactory.container({ id: 'box', initialLocation: 'attic' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: mockItems.map(item => `mixed/${item.id}.json`)
        },
        total: 4
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByLocation('living_room');

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['lamp', 'rope']);
      result.forEach(item => {
        expect(item.currentLocation).toBe('living_room');
      });
    });

    it('should filter items in inventory correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'portable_lamp', initialLocation: 'inventory' }),
        ItemDataFactory.treasure({ id: 'pocket_coin', initialLocation: 'inventory' }),
        ItemDataFactory.tool({ id: 'fixed_rope', initialLocation: 'cellar' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: mockItems.map(item => `mixed/${item.id}.json`)
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByLocation('inventory');

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['pocket_coin', 'portable_lamp']);
      result.forEach(item => {
        expect(item.currentLocation).toBe('inventory');
      });
    });

    it('should handle unknown location correctly', async () => {
      // Arrange - Based on actual Zork data where all items start at "unknown"
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', initialLocation: 'unknown' }),
        ItemDataFactory.treasure({ id: 'treasure1', initialLocation: 'unknown' }),
        ItemDataFactory.container({ id: 'container1', initialLocation: 'unknown' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: mockItems.map(item => `mixed/${item.id}.json`)
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByLocation('unknown');

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map(item => item.id).sort()).toEqual(['container1', 'tool1', 'treasure1']);
      result.forEach(item => {
        expect(item.currentLocation).toBe('unknown');
      });
    });
  });

  describe('Scene population scenarios', () => {
    it('should support scene population workflow', async () => {
      // Arrange - Simulate items distributed across different scenes
      const sceneDistribution = {
        'west_of_house': [
          ItemDataFactory.tool({ id: 'mailbox', initialLocation: 'west_of_house' })
        ],
        'living_room': [
          ItemDataFactory.tool({ id: 'lamp', initialLocation: 'living_room' }),
          ItemDataFactory.treasure({ id: 'rug', initialLocation: 'living_room' })
        ],
        'kitchen': [
          ItemDataFactory.container({ id: 'sack', initialLocation: 'kitchen' })
        ],
        'treasure_room': [
          ItemDataFactory.treasure({ id: 'trophy_case', initialLocation: 'treasure_room' }),
          ItemDataFactory.treasure({ id: 'gold_coin', initialLocation: 'treasure_room' })
        ]
      };

      const allItems = Object.values(sceneDistribution).flat();
      const mockIndex = createMockIndexData({
        categories: {
          scenes: allItems.map(item => `scenes/${item.id}.json`)
        },
        total: allItems.length
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      allItems.forEach(item => {
        mockFiles[`scenes/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert - Verify each scene gets correct items
      for (const [sceneId, expectedItems] of Object.entries(sceneDistribution)) {
        const result = await loader.getItemsByLocation(sceneId);
        expect(result).toHaveLength(expectedItems.length);
        
        const resultIds = result.map(item => item.id).sort();
        const expectedIds = expectedItems.map(item => item.id).sort();
        expect(resultIds).toEqual(expectedIds);
      }
    });

    it('should handle scenes with no items', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', initialLocation: 'populated_room' }),
        ItemDataFactory.treasure({ id: 'treasure1', initialLocation: 'populated_room' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: mockItems.map(item => `mixed/${item.id}.json`)
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByLocation('empty_room');

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should maintain consistency with scene item management', async () => {
      // Arrange
      const itemsInScene = [
        ItemDataFactory.tool({ id: 'scene_tool', initialLocation: 'test_scene' }),
        ItemDataFactory.treasure({ id: 'scene_treasure', initialLocation: 'test_scene' })
      ];

      const itemsElsewhere = [
        ItemDataFactory.tool({ id: 'other_tool', initialLocation: 'other_scene' }),
        ItemDataFactory.container({ id: 'inventory_item', initialLocation: 'inventory' })
      ];

      const allItems = [...itemsInScene, ...itemsElsewhere];
      const mockIndex = createMockIndexData({
        categories: {
          all: allItems.map(item => `all/${item.id}.json`)
        },
        total: 4
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      allItems.forEach(item => {
        mockFiles[`all/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const sceneItems = await loader.getItemsByLocation('test_scene');
      const otherItems = await loader.getItemsByLocation('other_scene');
      const inventoryItems = await loader.getItemsByLocation('inventory');
      const allLoadedItems = await loader.loadAllItems();

      // Assert
      expect(sceneItems).toHaveLength(2);
      expect(otherItems).toHaveLength(1);
      expect(inventoryItems).toHaveLength(1);
      
      // Total items should match
      const totalFilteredItems = sceneItems.length + otherItems.length + inventoryItems.length;
      expect(totalFilteredItems).toBe(allLoadedItems.length);

      // Items should be the same objects (cached)
      sceneItems.forEach(sceneItem => {
        const fullItem = allLoadedItems.find(item => item.id === sceneItem.id);
        expect(fullItem).toBe(sceneItem);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in location names', async () => {
      // Arrange
      const specialLocations = [
        'scene-with-dashes',
        'scene_with_underscores',
        'scene.with.dots',
        'scene with spaces',
        'scène_with_accents'
      ];

      const mockItems = specialLocations.map((location, i) => 
        ItemDataFactory.tool({ 
          id: `item_${i}`, 
          initialLocation: location 
        })
      );

      const mockIndex = createMockIndexData({
        categories: {
          special: mockItems.map(item => `special/${item.id}.json`)
        },
        total: mockItems.length
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`special/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      for (let i = 0; i < specialLocations.length; i++) {
        const location = specialLocations[i];
        if (location) {
          const result = await loader.getItemsByLocation(location);
          expect(result).toHaveLength(1);
          expect(result[0]?.id).toBe(`item_${i}`);
          expect(result[0]?.currentLocation).toBe(location);
        }
      }
    });

    it('should handle case sensitivity in location names', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'lower_item', initialLocation: 'test_scene' }),
        ItemDataFactory.tool({ id: 'upper_item', initialLocation: 'TEST_SCENE' }),
        ItemDataFactory.tool({ id: 'mixed_item', initialLocation: 'Test_Scene' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          case_test: mockItems.map(item => `case_test/${item.id}.json`)
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`case_test/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const lowerResult = await loader.getItemsByLocation('test_scene');
      const upperResult = await loader.getItemsByLocation('TEST_SCENE');
      const mixedResult = await loader.getItemsByLocation('Test_Scene');

      // Assert
      expect(lowerResult).toHaveLength(1);
      expect(upperResult).toHaveLength(1);
      expect(mixedResult).toHaveLength(1);
      
      expect(lowerResult[0]?.id).toBe('lower_item');
      expect(upperResult[0]?.id).toBe('upper_item');
      expect(mixedResult[0]?.id).toBe('mixed_item');
    });

    it('should handle empty string location', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'empty_location_item', initialLocation: '' }),
        ItemDataFactory.tool({ id: 'normal_item', initialLocation: 'normal_scene' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          edge_case: mockItems.map(item => `edge_case/${item.id}.json`)
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`edge_case/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const emptyResult = await loader.getItemsByLocation('');
      const normalResult = await loader.getItemsByLocation('normal_scene');

      // Assert
      expect(emptyResult).toHaveLength(1);
      expect(emptyResult[0]?.id).toBe('empty_location_item');
      expect(normalResult).toHaveLength(1);
      expect(normalResult[0]?.id).toBe('normal_item');
    });
  });

  describe('Performance', () => {
    it('should efficiently filter large datasets by location', async () => {
      // Arrange
      const itemCount = 100;
      const locationCount = 10;
      const mockItems: any[] = [];
      const mockFiles: Record<string, any> = {};

      // Create items distributed across locations
      for (let i = 0; i < itemCount; i++) {
        const location = `location_${i % locationCount}`;
        const item = ItemDataFactory.tool({ 
          id: `item_${i}`, 
          initialLocation: location 
        });
        mockItems.push(item);
        mockFiles[`performance/item_${i}.json`] = item;
      }

      const mockIndex = createMockIndexData({
        categories: {
          performance: mockItems.map((_, i) => `performance/item_${i}.json`)
        },
        total: itemCount
      });

      mockFiles['index.json'] = mockIndex;
      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.getItemsByLocation('location_0');
      });

      // Should complete filtering within reasonable time
      expect(duration).toBeLessThan(50);
    });

    it('should use cached loadAllItems result for location filtering', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', initialLocation: 'scene1' }),
        ItemDataFactory.treasure({ id: 'treasure1', initialLocation: 'scene2' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          cache_test: mockItems.map(item => `cache_test/${item.id}.json`)
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`cache_test/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Pre-load all items to populate cache
      await loader.loadAllItems();
      const callCountAfterLoadAll = testHelper.getFileReadCallCount();

      // Act
      await loader.getItemsByLocation('scene1');
      await loader.getItemsByLocation('scene2');
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(finalCallCount).toBe(callCountAfterLoadAll); // No additional file reads
    });
  });

  describe('Future scene integration', () => {
    it('should provide data structure suitable for scene population', async () => {
      // Arrange
      const sceneItems = [
        ItemDataFactory.tool({ id: 'lamp', initialLocation: 'dark_room' }),
        ItemDataFactory.treasure({ id: 'key', initialLocation: 'dark_room' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          scene_items: sceneItems.map(item => `scene_items/${item.id}.json`)
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      sceneItems.forEach(item => {
        mockFiles[`scene_items/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByLocation('dark_room');

      // Assert
      expect(result).toHaveLength(2);
      
      // Verify structure is suitable for scene.items population
      const itemIds = result.map(item => item.id);
      expect(itemIds).toContain('lamp');
      expect(itemIds).toContain('key');
      
      // Verify items have all necessary properties for game logic
      result.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('portable');
        expect(item).toHaveProperty('visible');
        expect(item).toHaveProperty('interactions');
        expect(item).toHaveProperty('state');
        expect(item).toHaveProperty('flags');
      });
    });

    it('should maintain currentLocation consistency for game state tracking', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'moveable_item', initialLocation: 'starting_room' }),
        ItemDataFactory.container({ id: 'fixed_item', initialLocation: 'permanent_room' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          tracking: mockItems.map(item => `tracking/${item.id}.json`)
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`tracking/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const startingRoomItems = await loader.getItemsByLocation('starting_room');
      const permanentRoomItems = await loader.getItemsByLocation('permanent_room');

      // Assert
      expect(startingRoomItems).toHaveLength(1);
      expect(permanentRoomItems).toHaveLength(1);
      
      expect(startingRoomItems[0]?.currentLocation).toBe('starting_room');
      expect(permanentRoomItems[0]?.currentLocation).toBe('permanent_room');
      
      // Items should be ready for location updates by game engine
      expect(typeof startingRoomItems[0]?.currentLocation).toBe('string');
      expect(typeof permanentRoomItems[0]?.currentLocation).toBe('string');
    });
  });
});