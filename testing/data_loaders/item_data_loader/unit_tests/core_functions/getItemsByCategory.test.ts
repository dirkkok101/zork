/**
 * Unit tests for ItemDataLoader.getItemsByCategory() method
 * Tests category-based item loading with caching and error handling
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';
import { 
  ItemDataLoaderTestHelper, 
  PerformanceTestHelper,
  ValidationTestHelper,
  ErrorTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory,
  PerformanceFactory
} from '../../../../utils/mock_factories';

describe('ItemDataLoader.getItemsByCategory()', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Success scenarios', () => {
    it('should load all items from treasures category correctly', async () => {
      // Arrange
      const treasureItems = [
        ItemDataFactory.treasure({ id: 'gold_coin', name: 'Gold Coin' }),
        ItemDataFactory.treasure({ id: 'ruby_gem', name: 'Ruby Gem' }),
        ItemDataFactory.treasure({ id: 'silver_ring', name: 'Silver Ring' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/gold_coin.json', 'treasures/ruby_gem.json', 'treasures/silver_ring.json'],
          tools: ['tools/lamp.json'] // Other category to ensure isolation
        }
      });

      const mockFiles: Record<string, any> = {
        'index.json': mockIndex,
        'treasures/gold_coin.json': treasureItems[0],
        'treasures/ruby_gem.json': treasureItems[1],
        'treasures/silver_ring.json': treasureItems[2],
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      };

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByCategory('treasures');

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map(item => item.id).sort()).toEqual(['gold_coin', 'ruby_gem', 'silver_ring']);
      
      // Verify all items are treasures
      result.forEach(item => {
        expect(item.type).toBe(ItemType.TREASURE);
        ValidationTestHelper.validateItemStructure(item);
      });
    });

    it('should load all items from tools category correctly', async () => {
      // Arrange
      const toolItems = [
        ItemDataFactory.tool({ id: 'magic_lamp', name: 'Magic Lamp' }),
        ItemDataFactory.tool({ id: 'rope', name: 'Rope' }),
        ItemDataFactory.tool({ id: 'shovel', name: 'Shovel' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/magic_lamp.json', 'tools/rope.json', 'tools/shovel.json']
        }
      });

      const mockFiles: Record<string, any> = {
        'index.json': mockIndex,
        'tools/magic_lamp.json': toolItems[0],
        'tools/rope.json': toolItems[1],
        'tools/shovel.json': toolItems[2]
      };

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByCategory('tools');

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map(item => item.id).sort()).toEqual(['magic_lamp', 'rope', 'shovel']);
      
      result.forEach(item => {
        expect(item.type).toBe(ItemType.TOOL);
      });
    });

    it('should load containers category correctly', async () => {
      // Arrange
      const containerItems = [
        ItemDataFactory.container({ id: 'wooden_box', name: 'Wooden Box' }),
        ItemDataFactory.container({ id: 'steel_safe', name: 'Steel Safe' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          containers: ['containers/wooden_box.json', 'containers/steel_safe.json']
        }
      });

      const mockFiles: Record<string, any> = {
        'index.json': mockIndex,
        'containers/wooden_box.json': containerItems[0],
        'containers/steel_safe.json': containerItems[1]
      };

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByCategory('containers');

      // Assert
      expect(result).toHaveLength(2);
      result.forEach(item => {
        expect(item.type).toBe(ItemType.CONTAINER);
      });
    });

    it('should cache category results independently', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/coin.json'],
          tools: ['tools/lamp.json']
        }
      });

      const mockFiles = {
        'index.json': mockIndex,
        'treasures/coin.json': ItemDataFactory.treasure({ id: 'coin' }),
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      };

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const firstTreasuresResult = await loader.getItemsByCategory('treasures');

      const toolsResult = await loader.getItemsByCategory('tools');
      const secondCallCount = testHelper.getFileReadCallCount();

      const secondTreasuresResult = await loader.getItemsByCategory('treasures');
      const thirdCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(secondTreasuresResult).toBe(firstTreasuresResult); // Same object reference (cached)
      expect(thirdCallCount).toBe(secondCallCount); // No additional reads for cached treasures
      expect(toolsResult).toHaveLength(1);
      expect(firstTreasuresResult).toHaveLength(1);
    });

    it('should handle empty category gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          empty_category: [],
          tools: ['tools/lamp.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Act
      const result = await loader.getItemsByCategory('empty_category');

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error handling scenarios', () => {
    it('should throw descriptive error for invalid category', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/coin.json'],
          tools: ['tools/lamp.json']
        }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      await expect(loader.getItemsByCategory('nonexistent_category'))
        .rejects.toThrow("Category 'nonexistent_category' not found");
    });

    it('should continue loading despite individual item failures', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          mixed_category: [
            'mixed/good_item1.json',
            'mixed/bad_item.json',
            'mixed/good_item2.json'
          ]
        }
      });

      const mockFiles = {
        'index.json': mockIndex,
        'mixed/good_item1.json': ItemDataFactory.tool({ id: 'good_item1' }),
        'mixed/good_item2.json': ItemDataFactory.tool({ id: 'good_item2' })
      };

      testHelper.mockMixedFileReads(mockFiles, {
        'mixed/bad_item.json': new Error('Corrupted file')
      });

      // Act
      const result = await loader.getItemsByCategory('mixed_category');

      // Assert
      // Should continue loading other items despite one failure
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['good_item1', 'good_item2']);
    });

    it('should handle index loading failures', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('ENOENT'));

      // Act & Assert
      await expect(loader.getItemsByCategory('any_category'))
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle malformed item files gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test_category: ['test/malformed.json', 'test/good.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'test/good.json': ItemDataFactory.tool({ id: 'good_item' })
      }, {
        'test/malformed.json': new Error('Unexpected token i in JSON at position 0')
      });

      // Act
      const result = await loader.getItemsByCategory('test_category');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('good_item');
    });
  });

  describe('Performance requirements', () => {
    it('should complete category load within 100ms', async () => {
      // Arrange
      const categoryItems = PerformanceFactory.createLargeItemSet(20);
      const fileNames = categoryItems.map((_, i) => `performance/item_${i}.json`);
      
      const mockIndex = createMockIndexData({
        categories: { performance: fileNames }
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      categoryItems.forEach((item, i) => {
        mockFiles[`performance/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.getItemsByCategory('performance');
      });

      expect(duration).toBeLessThan(100);
    });

    it('should achieve fast cache hits for repeated category loads', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { cache_test: ['cache/item.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'cache/item.json': ItemDataFactory.tool({ id: 'cache_item' })
      });

      // First load to populate cache
      await loader.getItemsByCategory('cache_test');

      // Act & Assert - Test cached load performance
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.getItemsByCategory('cache_test');
      });

      expect(duration).toBeLessThan(1);
    });
  });

  describe('Cache independence', () => {
    it('should not invalidate other category caches', async () => {
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
      await loader.getItemsByCategory('category1');
      await loader.getItemsByCategory('category2');
      const callCountAfterTwo = testHelper.getFileReadCallCount();

      await loader.getItemsByCategory('category3');
      await loader.getItemsByCategory('category1'); // Should hit cache
      await loader.getItemsByCategory('category2'); // Should hit cache
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      // Only category3 should cause additional file reads
      expect(finalCallCount - callCountAfterTwo).toBeLessThanOrEqual(2); // index + category3 item
    });

    it('should maintain cache consistency across different access patterns', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          consistent_test: ['test/item1.json', 'test/item2.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/item1.json': ItemDataFactory.tool({ id: 'item1' }),
        'test/item2.json': ItemDataFactory.tool({ id: 'item2' })
      });

      // Act
      const categoryResult = await loader.getItemsByCategory('consistent_test');
      const individualItem1 = await loader.loadItem('item1');
      const individualItem2 = await loader.loadItem('item2');

      // Assert
      expect(categoryResult).toHaveLength(2);
      expect(categoryResult.find(item => item.id === 'item1')).toStrictEqual(individualItem1);
      expect(categoryResult.find(item => item.id === 'item2')).toStrictEqual(individualItem2);
    });
  });

  describe('Category-specific behavior', () => {
    it('should handle authentic Zork category distribution', async () => {
      // Arrange - Based on actual Zork data distribution
      const categories = {
        treasures: Array.from({ length: 119 }, (_, i) => `treasures/treasure_${i}.json`),
        tools: Array.from({ length: 86 }, (_, i) => `tools/tool_${i}.json`),
        containers: Array.from({ length: 6 }, (_, i) => `containers/container_${i}.json`),
        weapons: Array.from({ length: 5 }, (_, i) => `weapons/weapon_${i}.json`),
        consumables: Array.from({ length: 4 }, (_, i) => `consumables/consumable_${i}.json`)
      };

      const mockIndex = createMockIndexData({ categories, total: 220 });
      const mockFiles: Record<string, any> = { 'index.json': mockIndex };

      // Create mock files for each category (subset for performance)
      const testSizes = { treasures: 5, tools: 5, containers: 3, weapons: 2, consumables: 2 };
      
      Object.entries(testSizes).forEach(([category, count]) => {
        for (let i = 0; i < count; i++) {
          const fileName = `${category}/${category.slice(0, -1)}_${i}.json`;
          const factory = category === 'treasures' ? ItemDataFactory.treasure :
                        category === 'tools' ? ItemDataFactory.tool :
                        category === 'containers' ? ItemDataFactory.container :
                        category === 'weapons' ? ItemDataFactory.weapon :
                        ItemDataFactory.consumable;
          
          mockFiles[fileName] = factory({ id: `${category.slice(0, -1)}_${i}` });
        }
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      for (const [category, expectedCount] of Object.entries(testSizes)) {
        const result = await loader.getItemsByCategory(category);
        expect(result).toHaveLength(expectedCount);
      }
    });
  });
});