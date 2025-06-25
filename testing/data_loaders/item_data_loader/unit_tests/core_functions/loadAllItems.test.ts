/**
 * Unit tests for ItemDataLoader.loadAllItems() method
 * Tests aggregation of all items from all categories with caching and error handling
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { 
  ItemDataLoaderTestHelper, 
  PerformanceTestHelper,
  ValidationTestHelper 
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory,
  PerformanceFactory 
} from '../../../../utils/mock_factories';

describe('ItemDataLoader.loadAllItems()', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Success scenarios', () => {
    it('should load all items from all categories successfully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/coin.json', 'treasures/gem.json'],
          tools: ['tools/lamp.json'],
          containers: ['containers/box.json']
        },
        total: 4
      });

      const mockItems = {
        'index.json': mockIndex,
        'treasures/coin.json': ItemDataFactory.treasure({ id: 'coin' }),
        'treasures/gem.json': ItemDataFactory.treasure({ id: 'gem' }),
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' }),
        'containers/box.json': ItemDataFactory.container({ id: 'box' })
      };

      testHelper.mockMultipleFileReads(mockItems);

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(4);
      expect(result.map(item => item.id)).toEqual(['coin', 'gem', 'lamp', 'box']);
      
      // Verify all items have correct structure
      result.forEach(item => {
        ValidationTestHelper.validateItemStructure(item);
      });
    });

    it('should return cached result on subsequent calls', async () => {
      // Arrange
      const mockIndex = createMockIndexData({ total: 1 });
      const mockItems = {
        'index.json': mockIndex,
        'treasures/test_treasure.json': ItemDataFactory.treasure()
      };
      testHelper.mockMultipleFileReads(mockItems);

      // Act
      const firstResult = await loader.loadAllItems();
      const firstCallCount = testHelper.getFileReadCallCount();
      
      const secondResult = await loader.loadAllItems();
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondResult).toBe(firstResult); // Same object reference (cached)
      expect(secondCallCount).toBe(firstCallCount); // No additional file reads
    });

    it('should aggregate items correctly across all categories', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/treasure1.json'],
          tools: ['tools/tool1.json'],
          containers: ['containers/container1.json'],
          weapons: ['weapons/weapon1.json'],
          consumables: ['consumables/consumable1.json']
        },
        total: 5
      });

      const mockItems = {
        'index.json': mockIndex,
        'treasures/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' }),
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'containers/container1.json': ItemDataFactory.container({ id: 'container1' }),
        'weapons/weapon1.json': ItemDataFactory.weapon({ id: 'weapon1' }),
        'consumables/consumable1.json': ItemDataFactory.consumable({ id: 'consumable1' })
      };

      testHelper.mockMultipleFileReads(mockItems);

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(5);
      
      // Verify one item from each category
      const itemIds = result.map(item => item.id);
      expect(itemIds).toContain('treasure1');
      expect(itemIds).toContain('tool1');
      expect(itemIds).toContain('container1');
      expect(itemIds).toContain('weapon1');
      expect(itemIds).toContain('consumable1');
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle individual item loading failures gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/good_item.json', 'treasures/bad_item.json'],
          tools: ['tools/good_tool.json']
        },
        total: 3
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'treasures/good_item.json': ItemDataFactory.treasure({ id: 'good_item' }),
        'tools/good_tool.json': ItemDataFactory.tool({ id: 'good_tool' })
      }, {
        'tools/bad_item.json': new Error('Corrupted file')
      });

      // Act
      const result = await loader.loadAllItems();

      // Assert
      // Should continue loading other items despite one failure
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id)).toEqual(['good_item', 'good_tool']);
    });

    it('should throw descriptive error when index loading fails', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('Index file not found'));

      // Act & Assert
      await expect(loader.loadAllItems()).rejects.toThrow('Failed to load item index');
    });

    it('should handle empty categories gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: [],
          tools: ['tools/lamp.json']
        },
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('lamp');
    });
  });

  describe('Performance requirements', () => {
    it('should complete within 500ms performance requirement', async () => {
      // Arrange
      const largeDataset = PerformanceFactory.createLargeItemSet(50);
      const mockIndex = createMockIndexData({
        categories: { performance: largeDataset.map((_, i) => `performance/item_${i}.json`) },
        total: 50
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      largeDataset.forEach((item, i) => {
        mockFiles[`performance/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllItems();
      });

      expect(duration).toBeLessThan(500);
    });

    it('should cache results for performance optimization', async () => {
      // Arrange
      const mockIndex = createMockIndexData();
      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'treasures/test_treasure.json': ItemDataFactory.treasure()
      });

      // Act
      const { duration: firstLoadTime } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllItems();
      });

      const { duration: cachedLoadTime } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllItems();
      });

      // Assert
      expect(cachedLoadTime).toBeLessThan(firstLoadTime);
      expect(cachedLoadTime).toBeLessThan(1); // Cache hits should be < 1ms
    });
  });

  describe('Data integrity', () => {
    it('should maintain item data integrity during aggregation', async () => {
      // Arrange
      const treasureData = ItemDataFactory.treasure({ 
        id: 'test_treasure',
        name: 'Test Treasure',
        weight: 15 
      });
      
      const mockIndex = createMockIndexData({
        categories: { treasures: ['treasures/test_treasure.json'] },
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'treasures/test_treasure.json': treasureData
      });

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(1);
      const loadedItem = result[0];
      expect(loadedItem).toBeDefined();
      
      expect(loadedItem?.id).toBe(treasureData.id);
      expect(loadedItem?.name).toBe(treasureData.name);
      expect(loadedItem?.weight).toBe(treasureData.weight);
      expect(loadedItem?.currentLocation).toBe(treasureData.initialLocation);
    });

    it('should properly convert types during aggregation', async () => {
      // Arrange
      const itemData = ItemDataFactory.tool({ 
        type: 'TOOL',
        size: 'MEDIUM'
      });
      
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/test_tool.json'] },
        total: 1
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/test_tool.json': itemData
      });

      // Act
      const result = await loader.loadAllItems();

      // Assert
      const loadedItem = result[0];
      expect(loadedItem).toBeDefined();
      expect(loadedItem?.type).toBe('TOOL'); // Converted to enum
      expect(loadedItem?.size).toBe('MEDIUM'); // Converted to enum
      expect(typeof loadedItem?.state).toBe('object');
      expect(typeof loadedItem?.flags).toBe('object');
    });
  });

  describe('Memory usage', () => {
    it('should not exceed memory limits with full dataset', async () => {
      // Arrange
      const largeDataset = PerformanceFactory.createLargeItemSet(100);
      const mockIndex = createMockIndexData({
        categories: { performance: largeDataset.map((_, i) => `performance/item_${i}.json`) },
        total: 100
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      largeDataset.forEach((item, i) => {
        mockFiles[`performance/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const { memoryDelta } = await PerformanceTestHelper.measureMemory(async () => {
        return await loader.loadAllItems();
      });

      // Assert
      // Should not use more than 10MB for test dataset
      expect(memoryDelta).toBeLessThan(10 * 1024 * 1024);
    });
  });
});