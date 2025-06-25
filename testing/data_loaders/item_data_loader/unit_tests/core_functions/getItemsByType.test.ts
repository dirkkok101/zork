/**
 * Unit tests for ItemDataLoader.getItemsByType() method
 * Tests type-based filtering and cross-category relationships
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';
import { 
  ItemDataLoaderTestHelper, 
  PerformanceTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory
} from '../../../../utils/mock_factories';

describe('ItemDataLoader.getItemsByType()', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('Type filtering functionality', () => {
    it('should filter items by TOOL type correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' }),
        ItemDataFactory.tool({ id: 'tool2', type: 'TOOL' }),
        ItemDataFactory.container({ id: 'container1', type: 'CONTAINER' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/tool1.json', 'mixed/treasure1.json', 'mixed/tool2.json', 'mixed/container1.json']
        },
        total: 4
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach((item) => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByType(ItemType.TOOL);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['tool1', 'tool2']);
      result.forEach(item => {
        expect(item.type).toBe(ItemType.TOOL);
      });
    });

    it('should filter items by TREASURE type correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' }),
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure2', type: 'TREASURE' }),
        ItemDataFactory.treasure({ id: 'treasure3', type: 'TREASURE' })
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
      const result = await loader.getItemsByType(ItemType.TREASURE);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map(item => item.id).sort()).toEqual(['treasure1', 'treasure2', 'treasure3']);
      result.forEach(item => {
        expect(item.type).toBe(ItemType.TREASURE);
      });
    });

    it('should filter items by CONTAINER type correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.container({ id: 'container1', type: 'CONTAINER' }),
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.container({ id: 'container2', type: 'CONTAINER' })
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
      const result = await loader.getItemsByType(ItemType.CONTAINER);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['container1', 'container2']);
      result.forEach(item => {
        expect(item.type).toBe(ItemType.CONTAINER);
      });
    });

    it('should filter items by WEAPON type correctly', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.weapon({ id: 'weapon1', type: 'WEAPON' }),
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.weapon({ id: 'weapon2', type: 'WEAPON' })
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
      const result = await loader.getItemsByType(ItemType.WEAPON);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['weapon1', 'weapon2']);
      result.forEach(item => {
        expect(item.type).toBe(ItemType.WEAPON);
      });
    });
  });

  describe('Cross-category type relationships', () => {
    it('should handle weapons in tools category correctly', async () => {
      // Arrange - Based on actual Zork data where weapons folder contains tools
      const mockItems = [
        ItemDataFactory.weapon({ id: 'sword', type: 'TOOL' }), // Sword classified as TOOL
        ItemDataFactory.weapon({ id: 'knife', type: 'TOOL' }), // Knife classified as TOOL
        ItemDataFactory.weapon({ id: 'axe', type: 'WEAPON' }) // Axe classified as WEAPON
      ];

      const mockIndex = createMockIndexData({
        categories: {
          weapons: ['weapons/sword.json', 'weapons/knife.json', 'weapons/axe.json']
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`weapons/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const toolResults = await loader.getItemsByType(ItemType.TOOL);
      const weaponResults = await loader.getItemsByType(ItemType.WEAPON);

      // Assert
      expect(toolResults.map(item => item.id).sort()).toEqual(['knife', 'sword']);
      expect(weaponResults.map(item => item.id)).toEqual(['axe']);
    });

    it('should handle treasures with TOOL type correctly', async () => {
      // Arrange - Based on actual Zork data where treasures folder contains tools
      const mockItems = [
        ItemDataFactory.treasure({ id: 'diamond', type: 'TOOL' }), // Diamond classified as TOOL
        ItemDataFactory.treasure({ id: 'ruby', type: 'TOOL' }), // Ruby classified as TOOL
        ItemDataFactory.treasure({ id: 'crown', type: 'TREASURE' }) // Crown classified as TREASURE
      ];

      const mockIndex = createMockIndexData({
        categories: {
          treasures: ['treasures/diamond.json', 'treasures/ruby.json', 'treasures/crown.json']
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`treasures/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const toolResults = await loader.getItemsByType(ItemType.TOOL);
      const treasureResults = await loader.getItemsByType(ItemType.TREASURE);

      // Assert
      expect(toolResults.map(item => item.id).sort()).toEqual(['diamond', 'ruby']);
      expect(treasureResults.map(item => item.id)).toEqual(['crown']);
    });

    it('should handle all consumables as TOOL type correctly', async () => {
      // Arrange - Based on actual Zork data where consumables are all classified as TOOL
      const mockItems = [
        ItemDataFactory.consumable({ id: 'sandwich', type: 'TOOL' }),
        ItemDataFactory.consumable({ id: 'water', type: 'TOOL' }),
        ItemDataFactory.consumable({ id: 'cake', type: 'TOOL' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          consumables: ['consumables/sandwich.json', 'consumables/water.json', 'consumables/cake.json']
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`consumables/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const toolResults = await loader.getItemsByType(ItemType.TOOL);

      // Assert
      expect(toolResults).toHaveLength(3);
      expect(toolResults.map(item => item.id).sort()).toEqual(['cake', 'sandwich', 'water']);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for type with no items', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/tool1.json', 'mixed/treasure1.json']
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByType(ItemType.WEAPON);

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle all items having the same type', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.tool({ id: 'tool2', type: 'TOOL' }),
        ItemDataFactory.tool({ id: 'tool3', type: 'TOOL' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          all_tools: mockItems.map(item => `all_tools/${item.id}.json`)
        },
        total: 3
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`all_tools/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const result = await loader.getItemsByType(ItemType.TOOL);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map(item => item.id).sort()).toEqual(['tool1', 'tool2', 'tool3']);
    });
  });

  describe('Performance', () => {
    it('should efficiently filter large datasets', async () => {
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

      // Should complete filtering within reasonable time
      expect(duration).toBeLessThan(50);
    });

    it('should use cached loadAllItems result for filtering', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/tool1.json', 'mixed/treasure1.json']
        },
        total: 2
      });

      const mockFiles: Record<string, any> = { 'index.json': mockIndex };
      mockItems.forEach(item => {
        mockFiles[`mixed/${item.id}.json`] = item;
      });

      testHelper.mockMultipleFileReads(mockFiles);

      // Pre-load all items to populate cache
      await loader.loadAllItems();
      const callCountAfterLoadAll = testHelper.getFileReadCallCount();

      // Act
      await loader.getItemsByType(ItemType.TOOL);
      await loader.getItemsByType(ItemType.TREASURE);
      const finalCallCount = testHelper.getFileReadCallCount();

      // Assert
      expect(finalCallCount).toBe(callCountAfterLoadAll); // No additional file reads
    });
  });

  describe('Integration with category loading', () => {
    it('should provide consistent results with category-based loading', async () => {
      // Arrange
      const mockItems = [
        ItemDataFactory.tool({ id: 'tool1', type: 'TOOL' }),
        ItemDataFactory.tool({ id: 'tool2', type: 'TOOL' }),
        ItemDataFactory.treasure({ id: 'treasure1', type: 'TREASURE' })
      ];

      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/tool1.json', 'tools/tool2.json'],
          treasures: ['treasures/treasure1.json']
        },
        total: 3
      });

      const mockFiles: Record<string, any> = {
        'index.json': mockIndex,
        'tools/tool1.json': mockItems[0],
        'tools/tool2.json': mockItems[1],
        'treasures/treasure1.json': mockItems[2]
      };

      testHelper.mockMultipleFileReads(mockFiles);

      // Act
      const typeResults = await loader.getItemsByType(ItemType.TOOL);
      const categoryResults = await loader.getItemsByCategory('tools');

      // Assert
      expect(typeResults).toHaveLength(2);
      expect(categoryResults).toHaveLength(2);
      
      // Results should contain the same items (though possibly different order)
      const typeIds = typeResults.map(item => item.id).sort();
      const categoryIds = categoryResults.map(item => item.id).sort();
      expect(typeIds).toEqual(categoryIds);

      // Items should be the same objects (cached)
      typeResults.forEach(typeItem => {
        const categoryItem = categoryResults.find(catItem => catItem.id === typeItem.id);
        expect(categoryItem).toBe(typeItem);
      });
    });
  });

  describe('Authentic Zork type distribution', () => {
    it('should handle realistic type distribution based on actual data', async () => {
      // Arrange - Based on actual Zork analysis
      const typeDistribution = {
        TOOL: 115,     // Most common type (includes many treasures and consumables)
        TREASURE: 88,  // Second most common
        CONTAINER: 9,  // Small number
        WEAPON: 2      // Smallest number
      };

      // Create representative sample
      const sampleRatio = 0.1; // 10% sample for performance
      const mockItems: any[] = [];
      const mockFiles: Record<string, any> = {};

      Object.entries(typeDistribution).forEach(([type, count]) => {
        const sampleCount = Math.ceil(count * sampleRatio);
        for (let i = 0; i < sampleCount; i++) {
          const factory = type === 'TOOL' ? ItemDataFactory.tool :
                         type === 'TREASURE' ? ItemDataFactory.treasure :
                         type === 'CONTAINER' ? ItemDataFactory.container :
                         ItemDataFactory.weapon;

          const item = factory({ id: `${type.toLowerCase()}_${i}`, type });
          mockItems.push(item);
          mockFiles[`realistic/${item.id}.json`] = item;
        }
      });

      const mockIndex = createMockIndexData({
        categories: {
          realistic: mockItems.map(item => `realistic/${item.id}.json`)
        },
        total: mockItems.length
      });

      mockFiles['index.json'] = mockIndex;
      testHelper.mockMultipleFileReads(mockFiles);

      // Act & Assert
      for (const [type, expectedCount] of Object.entries(typeDistribution)) {
        const result = await loader.getItemsByType(type as ItemType);
        const sampleCount = Math.ceil(expectedCount * sampleRatio);
        expect(result).toHaveLength(sampleCount);
      }
    });
  });
});