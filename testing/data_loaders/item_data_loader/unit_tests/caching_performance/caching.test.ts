/**
 * Unit tests for ItemDataLoader caching behavior
 * Tests multi-level caching strategy (item, category, index, all items)
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';
import { 
  ItemDataLoaderTestHelper, 
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory,
  PerformanceFactory
} from '../../../../utils/mock_factories';

describe('ItemDataLoader Caching', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Item-level caching', () => {
    it('should cache individual items after first load', async () => {
      // Arrange
      const mockItem = ItemDataFactory.tool({ id: 'cached_item' });
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/cached_item.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/cached_item.json': mockItem
      });

      // Act
      const firstLoad = await loader.loadItem('cached_item');
      const firstCallCount = testHelper.getFileReadCallCount();
      
      const secondLoad = await loader.loadItem('cached_item');
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondLoad).toBe(firstLoad); // Same object reference (cached)
      expect(secondCallCount).toBe(firstCallCount); // No additional file reads
    });

    it('should maintain separate cache entries for different items', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'item1' }),
        ItemDataFactory.tool({ id: 'item2' }),
        ItemDataFactory.tool({ id: 'item3' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/item1.json', 'tools/item2.json', 'tools/item3.json']
        }
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`tools/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const item1First = await loader.loadItem('item1');
      const item2First = await loader.loadItem('item2');
      const item3First = await loader.loadItem('item3');

      const item1Second = await loader.loadItem('item1');
      const item2Second = await loader.loadItem('item2');
      const item3Second = await loader.loadItem('item3');

      // Assert
      expect(item1Second).toBe(item1First);
      expect(item2Second).toBe(item2First);
      expect(item3Second).toBe(item3First);
      
      // All items should be different objects
      expect(item1First).not.toBe(item2First);
      expect(item2First).not.toBe(item3First);
      expect(item1First).not.toBe(item3First);
    });

    it('should not interfere with category caching', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1' }),
        ItemDataFactory.tool({ id: 'tool2' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json', 'tools/tool2.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': mockItems[0],
        'tools/tool2.json': mockItems[1]
      });

      // Act
      const individualItem = await loader.loadItem('tool1');
      const categoryItems = await loader.getItemsByCategory('tools');
      const individualItemAgain = await loader.loadItem('tool1');

      // Assert
      const categoryItem = categoryItems.find(item => item.id === 'tool1');
      expect(individualItem).toBe(categoryItem); // Same cached object
      expect(individualItemAgain).toBe(individualItem); // Still cached
    });
  });

  describe('Category-level caching', () => {
    it('should cache category results after first load', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.treasure({ id: 'treasure1' }),
        ItemDataFactory.treasure({ id: 'treasure2' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/treasure1.json', 'treasures/treasure2.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'treasures/treasure1.json': mockItems[0],
        'treasures/treasure2.json': mockItems[1]
      });

      // Act
      const firstLoad = await loader.getItemsByCategory('treasures');
      const firstCallCount = testHelper.getFileReadCallCount();
      
      const secondLoad = await loader.getItemsByCategory('treasures');
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondLoad).toBe(firstLoad); // Same array reference (cached)
      expect(secondCallCount).toBe(firstCallCount); // No additional file reads
    });

    it('should maintain separate cache entries for different categories', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json'],
          treasures: ['treasures/treasure1.json'],
          containers: ['containers/container1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'treasures/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' }),
        'containers/container1.json': ItemDataFactory.container({ id: 'container1' })
      });

      // Act
      const toolsFirst = await loader.getItemsByCategory('tools');
      const treasuresFirst = await loader.getItemsByCategory('treasures');
      const containersFirst = await loader.getItemsByCategory('containers');

      const toolsSecond = await loader.getItemsByCategory('tools');
      const treasuresSecond = await loader.getItemsByCategory('treasures');
      const containersSecond = await loader.getItemsByCategory('containers');

      // Assert
      expect(toolsSecond).toBe(toolsFirst);
      expect(treasuresSecond).toBe(treasuresFirst);
      expect(containersSecond).toBe(containersFirst);
      
      // Categories should be different arrays
      expect(toolsFirst).not.toBe(treasuresFirst);
      expect(treasuresFirst).not.toBe(containersFirst);
    });

    it('should not invalidate other categories when loading new category', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          category1: ['cat1/item1.json'],
          category2: ['cat2/item2.json'],
          category3: ['cat3/item3.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'cat1/item1.json': ItemDataFactory.tool({ id: 'item1' }),
        'cat2/item2.json': ItemDataFactory.tool({ id: 'item2' }),
        'cat3/item3.json': ItemDataFactory.tool({ id: 'item3' })
      });

      // Act
      const cat1First = await loader.getItemsByCategory('category1');
      const cat2First = await loader.getItemsByCategory('category2');
      const callCountAfterTwo = testHelper.getFileReadCallCount();

      await loader.getItemsByCategory('category3'); // Load new category
      
      const cat1Second = await loader.getItemsByCategory('category1');
      const cat2Second = await loader.getItemsByCategory('category2');
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(cat1Second).toBe(cat1First); // Still cached
      expect(cat2Second).toBe(cat2First); // Still cached
      
      // Only category3 should cause additional file reads
      const additionalReads = finalCallCount - callCountAfterTwo;
      expect(additionalReads).toBeLessThanOrEqual(2); // At most index + category3 item
    });
  });

  describe('Index-level caching', () => {
    it('should cache index data after first load', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/lamp.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Act
      await loader.loadItem('lamp'); // This will load the index
      const indexCallCount = testHelper.getFileReadCallCount();
      
      await loader.getItemsByCategory('tools'); // This should use cached index
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      // Index should not be loaded again
      expect(finalCallCount - indexCallCount).toBeLessThanOrEqual(1); // Only the item file
    });

    it('should reuse cached index across different operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json'],
          treasures: ['treasures/treasure1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'treasures/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' })
      });

      // Act
      await loader.loadItem('tool1');
      
      await loader.getItemsByCategory('treasures');
      const afterSecondOperation = testHelper.getFileReadCallCount();
      
      await loader.loadAllItems();
      const afterThirdOperation = testHelper.getFileReadCallCount();

      // Assert
      // Index should only be loaded once
      const indexReads = afterThirdOperation - afterSecondOperation;
      expect(indexReads).toBe(0); // No additional index reads for loadAllItems
    });
  });

  describe('All items caching', () => {
    it('should cache loadAllItems result', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json'],
          treasures: ['treasures/treasure1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'treasures/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' })
      });

      // Act
      const firstLoadAll = await loader.loadAllItems();
      const firstCallCount = testHelper.getFileReadCallCount();
      
      const secondLoadAll = await loader.loadAllItems();
      const secondCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondLoadAll).toBe(firstLoadAll); // Same array reference (cached)
      expect(secondCallCount).toBe(firstCallCount); // No additional file reads
    });

    it('should provide consistent objects between loadAllItems and individual operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json', 'tools/tool2.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'tools/tool2.json': ItemDataFactory.tool({ id: 'tool2' })
      });

      // Act
      const allItems = await loader.loadAllItems();
      const individualItem = await loader.loadItem('tool1');
      const categoryItems = await loader.getItemsByCategory('tools');

      // Assert
      const allItemsItem = allItems.find(item => item.id === 'tool1');
      const categoryItem = categoryItems.find(item => item.id === 'tool1');
      
      expect(individualItem).toBe(allItemsItem); // Same object reference
      expect(individualItem).toBe(categoryItem); // Same object reference
    });

    it('should use loadAllItems cache for filtering operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/tool1.json', 'mixed/treasure1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'mixed/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'mixed/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' })
      });

      // Act
      await loader.loadAllItems(); // Populate cache
      const callCountAfterLoadAll = testHelper.getFileReadCallCount();
      
      await loader.getItemsByType(ItemType.TOOL); // Should use cache
      await loader.getItemsByLocation('unknown'); // Should use cache
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(finalCallCount).toBe(callCountAfterLoadAll); // No additional file reads
    });
  });

  describe('Cache performance', () => {
    it('should provide significant performance improvement with caching', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          performance: ['performance/item1.json', 'performance/item2.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'performance/item1.json': ItemDataFactory.tool({ id: 'item1' }),
        'performance/item2.json': ItemDataFactory.tool({ id: 'item2' })
      });

      // Act & Assert
      const { duration: firstLoadTime } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.getItemsByCategory('performance');
      });

      const { duration: cachedLoadTime } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.getItemsByCategory('performance');
      });

      // Cached load should be significantly faster
      expect(cachedLoadTime).toBeLessThan(firstLoadTime / 2); // At least 2x faster
      expect(cachedLoadTime).toBeLessThan(10); // Cache hits should be < 10ms
    });

    it('should handle rapid successive calls efficiently', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/lamp.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Act
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const promises = Array.from({ length: 100 }, () => loader.loadItem('lamp'));
        return await Promise.all(promises);
      });

      // Assert
      expect(duration).toBeLessThan(50); // 100 rapid calls should complete in under 50ms
    });
  });

  describe('Memory efficiency', () => {
    it('should not create duplicate objects for same items', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/shared_item.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/shared_item.json': ItemDataFactory.tool({ id: 'shared_item' })
      });

      // Act
      const individual = await loader.loadItem('shared_item');
      const fromCategory = (await loader.getItemsByCategory('tools'))[0];
      const fromAll = (await loader.loadAllItems())[0];

      // Assert
      expect(individual).toBe(fromCategory); // Same object reference
      expect(individual).toBe(fromAll); // Same object reference
      expect(fromCategory).toBe(fromAll); // Same object reference
    });

    it('should manage memory efficiently with large datasets', async () => {
      // Arrange
      const largeDataset = PerformanceFactory.createLargeItemSet(50);
      const mockIndex = createMockIndexData({
        categories: { performance: largeDataset.map((_, i) => `performance/item_${i}.json`) }
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      largeDataset.forEach((item, i) => {
        mockFiles[`performance/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { memoryDelta } = await PerformanceTestHelper.measureMemory(async () => {
        await loader.loadAllItems();
        await loader.loadAllItems(); // Second call should not increase memory significantly
        return null;
      });

      // Memory usage should be reasonable
      expect(memoryDelta).toBeLessThan(5 * 1024 * 1024); // Less than 5MB for test dataset
    });
  });

  describe('Cache invalidation scenarios', () => {
    it('should maintain cache integrity across mixed operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json', 'tools/tool2.json'],
          treasures: ['treasures/treasure1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/tool1.json': ItemDataFactory.tool({ id: 'tool1' }),
        'tools/tool2.json': ItemDataFactory.tool({ id: 'tool2' }),
        'treasures/treasure1.json': ItemDataFactory.treasure({ id: 'treasure1' })
      });

      // Act
      const individual1 = await loader.loadItem('tool1');
      const category1 = await loader.getItemsByCategory('tools');
      const all1 = await loader.loadAllItems();
      const type1 = await loader.getItemsByType(ItemType.TOOL);
      
      // Second round of calls
      const individual2 = await loader.loadItem('tool1');
      const category2 = await loader.getItemsByCategory('tools');
      const all2 = await loader.loadAllItems();
      const type2 = await loader.getItemsByType(ItemType.TOOL);

      // Assert
      expect(individual2).toBe(individual1);
      expect(category2).toBe(category1);
      expect(all2).toBe(all1);
      // Filter results create new arrays, but should contain same object references
      expect(type2).toHaveLength(type1.length);
      type1.forEach((item, index) => {
        expect(type2[index]).toBe(item); // Same object references
      });
    });
  });
});