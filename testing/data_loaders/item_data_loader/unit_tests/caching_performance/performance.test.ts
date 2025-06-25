/**
 * Unit tests for ItemDataLoader performance requirements
 * Tests specific timing requirements and performance benchmarks
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

describe('ItemDataLoader Performance', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Individual item loading performance', () => {
    it('should load single item within 10ms requirement', async () => {
      // Arrange
      const mockItem = ItemDataFactory.tool({ id: 'performance_test' });
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/performance_test.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/performance_test.json': mockItem
      });

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadItem('performance_test');
      });

      expect(duration).toBeLessThan(10); // 10ms requirement
    });

    it('should achieve cache hits within 1ms requirement', async () => {
      // Arrange
      const mockItem = ItemDataFactory.tool({ id: 'cache_test' });
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/cache_test.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/cache_test.json': mockItem
      });

      // First load to populate cache
      await loader.loadItem('cache_test');

      // Act & Assert - Test cached load performance
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadItem('cache_test');
      });

      expect(duration).toBeLessThan(1); // 1ms requirement for cache hits
    });

    it('should handle multiple concurrent item loads efficiently', async () => {
      // Arrange
      const mockItems = Array.from({ length: 20 }, (_, i) => 
        ItemDataFactory.tool({ id: `item_${i}` })
      );
      
      const mockIndex = createMockIndexData({
        categories: {
          tools: mockItems.map((_, i) => `tools/item_${i}.json`)
        }
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach((item, i) => {
        mockFiles[`tools/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const promises = mockItems.map(item => loader.loadItem(item.id));
        return await Promise.all(promises);
      });

      expect(duration).toBeLessThan(100); // 20 concurrent loads in under 100ms
    });
  });

  describe('Category loading performance', () => {
    it('should load category within 100ms requirement', async () => {
      // Arrange
      const categoryItems = PerformanceFactory.createLargeItemSet(20);
      const mockIndex = createMockIndexData({
        categories: {
          performance: categoryItems.map((_, i) => `performance/item_${i}.json`)
        }
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

      expect(duration).toBeLessThan(100); // 100ms requirement
    });

    it('should achieve category cache hits within 1ms', async () => {
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

      expect(duration).toBeLessThan(1); // 1ms requirement for cache hits
    });

    it('should handle multiple category loads efficiently', async () => {
      // Arrange
      const categories = ['tools', 'treasures', 'containers', 'weapons', 'consumables'];
      const mockFiles: Record<string, any> = {};
      const categoriesObj: Record<string, string[]> = {};

      categories.forEach(category => {
        const items = Array.from({ length: 5 }, (_, i) => 
          ItemDataFactory.tool({ id: `${category}_${i}` })
        );
        categoriesObj[category] = items.map((_, i) => `${category}/${category}_${i}.json`);
        
        items.forEach((item, i) => {
          mockFiles[`${category}/${category}_${i}.json`] = item;
        });
      });

      const mockIndex = createMockIndexData({ categories: categoriesObj });
      mockFiles['index.json'] = mockIndex;

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const promises = categories.map(category => loader.getItemsByCategory(category));
        return await Promise.all(promises);
      });

      expect(duration).toBeLessThan(200); // 5 categories in under 200ms
    });
  });

  describe('All items loading performance', () => {
    it('should load all items within 500ms requirement', async () => {
      // Arrange
      const largeDataset = PerformanceFactory.createLargeItemSet(50);
      const mockIndex = createMockIndexData({
        categories: { 
          performance: largeDataset.map((_, i) => `performance/item_${i}.json`) 
        },
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

      expect(duration).toBeLessThan(500); // 500ms requirement
    });

    it('should achieve loadAllItems cache hits within 1ms', async () => {
      // Arrange
      const mockIndex = createMockIndexData();
      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'treasures/test_treasure.json': ItemDataFactory.treasure()
      });

      // First load to populate cache
      await loader.loadAllItems();

      // Act & Assert - Test cached load performance
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllItems();
      });

      expect(duration).toBeLessThan(1); // 1ms requirement for cache hits
    });

    it('should handle realistic Zork-sized dataset efficiently', async () => {
      // Arrange - Based on actual Zork data size (214 items)
      const zorkSizeDataset = PerformanceFactory.createLargeItemSet(100); // Sample size
      const mockIndex = createMockIndexData({
        categories: {
          treasures: zorkSizeDataset.slice(0, 50).map((_, i) => `treasures/treasure_${i}.json`),
          tools: zorkSizeDataset.slice(50, 90).map((_, i) => `tools/tool_${i}.json`),
          containers: zorkSizeDataset.slice(90, 95).map((_, i) => `containers/container_${i}.json`),
          weapons: zorkSizeDataset.slice(95, 97).map((_, i) => `weapons/weapon_${i}.json`),
          consumables: zorkSizeDataset.slice(97, 100).map((_, i) => `consumables/consumable_${i}.json`)
        },
        total: 100
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      zorkSizeDataset.forEach((item, i) => {
        const category = i < 50 ? 'treasures' : 
                        i < 90 ? 'tools' : 
                        i < 95 ? 'containers' : 
                        i < 97 ? 'weapons' : 'consumables';
        const categoryIndex = i < 50 ? i : 
                              i < 90 ? i - 50 : 
                              i < 95 ? i - 90 : 
                              i < 97 ? i - 95 : i - 97;
        const fileName = `${category}/${category.slice(0, -1)}_${categoryIndex}.json`;
        mockFiles[fileName] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        return await loader.loadAllItems();
      });

      expect(duration).toBeLessThan(300); // Should handle 100 items in under 300ms
    });
  });

  describe('Filtering operations performance', () => {
    it('should filter items by type within 50ms', async () => {
      // Arrange
      const itemCount = 100;
      const mockItems: any[] = [];
      const mockFiles: Record<string, any> = {};

      // Create mix of item types
      for (let i = 0; i < itemCount; i++) {
        const type = i % 4 === 0 ? 'TOOL' : 
                     i % 4 === 1 ? 'TREASURE' : 
                     i % 4 === 2 ? 'CONTAINER' : 'WEAPON';
        
        const factory = type === 'TOOL' ? ItemDataFactory.tool :
                       type === 'TREASURE' ? ItemDataFactory.treasure :
                       type === 'CONTAINER' ? ItemDataFactory.container :
                       ItemDataFactory.weapon;

        const item = factory({ id: `item_${i}`, type });
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
        return await loader.getItemsByType(ItemType.TOOL);
      });

      expect(duration).toBeLessThan(50); // 50ms requirement for filtering
    });

    it('should filter items by location within 50ms', async () => {
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

      expect(duration).toBeLessThan(50); // 50ms requirement for filtering
    });

    it('should use cached data for repeated filtering operations', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/tool1.json', 'mixed/treasure1.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'mixed/tool1.json': mockItems[0],
        'mixed/treasure1.json': mockItems[1]
      });

      // Pre-load all items to populate cache
      await loader.loadAllItems();

      // Act & Assert - Multiple filtering operations should be very fast
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        await loader.getItemsByType(ItemType.TOOL);
        await loader.getItemsByType(ItemType.TREASURE);
        await loader.getItemsByLocation('unknown');
        await loader.getItemsByCategory('mixed');
      });

      expect(duration).toBeLessThan(5); // Multiple cached operations in under 5ms
    });
  });

  describe('Memory performance', () => {
    it('should not exceed memory limits with full dataset', async () => {
      // Arrange
      const largeDataset = PerformanceFactory.createLargeItemSet(100);
      const mockIndex = createMockIndexData({
        categories: { 
          performance: largeDataset.map((_, i) => `performance/item_${i}.json`) 
        },
        total: 100
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      largeDataset.forEach((item, i) => {
        mockFiles[`performance/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      const { memoryDelta } = await PerformanceTestHelper.measureMemory(async () => {
        return await loader.loadAllItems();
      });

      // Should not use more than 10MB for test dataset
      expect(memoryDelta).toBeLessThan(10 * 1024 * 1024);
    });

    it('should manage memory efficiently with repeated operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/lamp.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Act & Assert
      const { memoryDelta } = await PerformanceTestHelper.measureMemory(async () => {
        // Perform many repeated operations
        for (let i = 0; i < 100; i++) {
          await loader.loadItem('lamp');
          await loader.getItemsByCategory('tools');
          await loader.loadAllItems();
        }
        return null;
      });

      // Memory should not grow significantly with repeated cached operations
      expect(memoryDelta).toBeLessThan(1024 * 1024); // Less than 1MB growth
    });
  });

  describe('Concurrent operation performance', () => {
    it('should handle concurrent mixed operations efficiently', async () => {
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

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const operations = [
          loader.loadItem('tool1'),
          loader.loadItem('tool2'),
          loader.getItemsByCategory('tools'),
          loader.getItemsByCategory('treasures'),
          loader.loadAllItems(),
          loader.getItemsByType(ItemType.TOOL),
          loader.getItemsByLocation('unknown')
        ];
        
        return await Promise.all(operations);
      });

      expect(duration).toBeLessThan(150); // All operations concurrently in under 150ms
    });

    it('should maintain performance under high concurrent load', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/lamp.json'] }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/lamp.json': ItemDataFactory.tool({ id: 'lamp' })
      });

      // Warm up cache
      await loader.loadItem('lamp');

      // Act & Assert
      const { duration } = await PerformanceTestHelper.measureTime(async () => {
        const promises = Array.from({ length: 1000 }, () => loader.loadItem('lamp'));
        return await Promise.all(promises);
      });

      expect(duration).toBeLessThan(100); // 1000 concurrent cached requests in under 100ms
    });
  });

  describe('Benchmarking and regression testing', () => {
    it('should meet baseline performance benchmarks', async () => {
      // Arrange
      const benchmarkDataset = PerformanceFactory.createLargeItemSet(25);
      const mockIndex = createMockIndexData({
        categories: {
          benchmark: benchmarkDataset.map((_, i) => `benchmark/item_${i}.json`)
        }
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      benchmarkDataset.forEach((item, i) => {
        mockFiles[`benchmark/item_${i}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act - Run comprehensive benchmark
      const benchmarkOperations = async () => {
        await loader.loadAllItems();
        await loader.getItemsByCategory('benchmark');
        await loader.getItemsByType(ItemType.TOOL);
        await loader.getItemsByLocation('unknown');
        
        // Individual item loads
        for (let i = 0; i < 5; i++) {
          await loader.loadItem(`item_${i}`);
        }
      };

      const { duration } = await PerformanceTestHelper.measureTime(benchmarkOperations);

      // Assert - Complete benchmark suite should finish quickly
      expect(duration).toBeLessThan(300); // Comprehensive operations in under 300ms
    });
  });
});