/**
 * Unit tests for ItemDataLoader error handling
 * Tests comprehensive error scenarios and graceful degradation
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { 
  ItemDataLoaderTestHelper, 
  ErrorTestHelper
} from '../../../../utils/test_helpers';
import { 
  createMockIndexData, 
  ItemDataFactory
} from '../../../../utils/mock_factories';

describe('ItemDataLoader Error Handling', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  describe('File system errors', () => {
    it('should handle index file not found error', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('ENOENT'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
      
      await expect(loader.loadItem('any_item'))
        .rejects.toThrow('Failed to load item index');
      
      await expect(loader.getItemsByCategory('any_category'))
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle index file permission denied error', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('EACCES'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle individual item file not found gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          mixed: ['mixed/good_item.json', 'mixed/missing_item.json', 'mixed/another_good_item.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'mixed/good_item.json': ItemDataFactory.tool({ id: 'good_item' }),
        'mixed/another_good_item.json': ItemDataFactory.tool({ id: 'another_good_item' })
      }, {
        'mixed/missing_item.json': ErrorTestHelper.createFileSystemError('ENOENT')
      });

      // Act
      const result = await loader.loadAllItems();

      // Assert
      // Should continue loading other items despite one failure
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id).sort()).toEqual(['another_good_item', 'good_item']);
    });

    it('should handle item file permission errors gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/accessible.json', 'test/restricted.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'test/accessible.json': ItemDataFactory.tool({ id: 'accessible' })
      }, {
        'test/restricted.json': ErrorTestHelper.createFileSystemError('EACCES')
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('accessible');
    });

    it('should handle disk space errors appropriately', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('ENOSPC'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle network timeout errors for remote files', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createNetworkError('ETIMEDOUT'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });
  });

  describe('JSON parsing errors', () => {
    it('should handle malformed index JSON', async () => {
      // Arrange
      testHelper.mockFileRead('index.json', 'invalid json content');

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle malformed item JSON gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/malformed.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' })
      });

      testHelper.mockFileRead('malformed.json', '{ invalid json: content }');

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });

    it('should handle empty JSON files', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/empty.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' })
      });

      testHelper.mockFileRead('empty.json', '');

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });

    it('should handle JSON with unexpected structure', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/unexpected.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' }),
        'test/unexpected.json': { completely: 'different', structure: true }
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });
  });

  describe('Data validation errors', () => {
    it('should handle missing required fields', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/incomplete.json']
        }
      });

      const incompleteData = ItemDataFactory.tool({ id: 'incomplete' });
      delete (incompleteData as any).name; // Remove required field

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' }),
        'test/incomplete.json': incompleteData
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });

    it('should handle invalid enum values', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/invalid_enum.json']
        }
      });

      const invalidEnumData = ItemDataFactory.tool({ 
        id: 'invalid_enum',
        type: 'INVALID_TYPE'
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' }),
        'test/invalid_enum.json': invalidEnumData
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });

    it('should handle invalid field types', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/invalid_types.json']
        }
      });

      const invalidTypeData = ItemDataFactory.tool({ id: 'invalid_types' });
      (invalidTypeData as any).weight = 'not_a_number';
      (invalidTypeData as any).portable = 'not_a_boolean';

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' }),
        'test/invalid_types.json': invalidTypeData
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });

    it('should handle negative weight values', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          test: ['test/valid.json', 'test/negative_weight.json']
        }
      });

      const negativeWeightData = ItemDataFactory.tool({ 
        id: 'negative_weight',
        weight: -10
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'test/valid.json': ItemDataFactory.tool({ id: 'valid_item' }),
        'test/negative_weight.json': negativeWeightData
      });

      // Act
      const result = await loader.getItemsByCategory('test');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('valid_item');
    });
  });

  describe('Index structure errors', () => {
    it('should handle invalid category references', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          valid_category: ['valid/item.json'],
          invalid_category: null as any // Invalid structure
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'valid/item.json': ItemDataFactory.tool({ id: 'valid_item' })
      });

      // Act & Assert
      await expect(loader.getItemsByCategory('invalid_category'))
        .rejects.toThrow('Category \'invalid_category\' must be an array');
    });

    it('should handle non-existent category requests', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          existing_category: ['existing/item.json']
        }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      await expect(loader.getItemsByCategory('nonexistent_category'))
        .rejects.toThrow('Category \'nonexistent_category\' not found');
    });

    it('should handle corrupted index structure', async () => {
      // Arrange
      const corruptedIndex = {
        categories: 'not_an_object',
        total: 'not_a_number'
      };

      testHelper.mockFileRead('index.json', JSON.stringify(corruptedIndex));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Index data field \'categories\' must be an object');
    });

    it('should handle missing index fields', async () => {
      // Arrange
      const incompleteIndex = {
        categories: {
          tools: ['tools/lamp.json']
        }
        // Missing 'total' field
      };

      testHelper.mockFileRead('index.json', JSON.stringify(incompleteIndex));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Index data missing required field: total');
    });
  });

  describe('Item lookup errors', () => {
    it('should handle non-existent item ID requests', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/existing_item.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/existing_item.json': ItemDataFactory.tool({ id: 'existing_item' })
      });

      // Act & Assert
      await expect(loader.loadItem('nonexistent_item'))
        .rejects.toThrow('Item with ID \'nonexistent_item\' not found');
    });

    it('should handle empty string item ID', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/item.json'] }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      await expect(loader.loadItem(''))
        .rejects.toThrow('Item with ID \'\' not found');
    });

    it('should handle null and undefined item IDs', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/item.json'] }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      await expect(loader.loadItem(null as any))
        .rejects.toThrow('Item with ID \'null\' not found');
      
      await expect(loader.loadItem(undefined as any))
        .rejects.toThrow('Item with ID \'undefined\' not found');
    });
  });

  describe('Concurrent operation errors', () => {
    it('should handle errors in concurrent operations gracefully', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          good: ['good/item1.json', 'good/item2.json'],
          bad: ['bad/error_item.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'good/item1.json': ItemDataFactory.tool({ id: 'item1' }),
        'good/item2.json': ItemDataFactory.tool({ id: 'item2' })
      }, {
        'bad/error_item.json': new Error('Simulated error')
      });

      // Act
      const [goodCategory, badCategoryError] = await Promise.allSettled([
        loader.getItemsByCategory('good'),
        loader.getItemsByCategory('bad')
      ]);

      // Assert
      expect(goodCategory.status).toBe('fulfilled');
      if (goodCategory.status === 'fulfilled') {
        expect(goodCategory.value).toHaveLength(2);
      }
      
      expect(badCategoryError.status).toBe('rejected');
    });

    it('should not leak errors between concurrent operations', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          category1: ['cat1/item1.json'],
          category2: ['cat2/item2.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'cat1/item1.json': ItemDataFactory.tool({ id: 'item1' })
      }, {
        'cat2/item2.json': new Error('Category 2 error')
      });

      // Act
      const category1Promise = loader.getItemsByCategory('category1');
      const category2Promise = loader.getItemsByCategory('category2');

      // Assert
      await expect(category1Promise).resolves.toHaveLength(1);
      await expect(category2Promise).rejects.toThrow();
    });
  });

  describe('Memory and resource errors', () => {
    it('should handle out of memory scenarios gracefully', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('JavaScript heap out of memory'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });

    it('should handle extremely large file errors', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', new Error('File too large'));

      // Act & Assert
      await expect(loader.loadAllItems())
        .rejects.toThrow('Failed to load item index');
    });
  });

  describe('Error message quality', () => {
    it('should provide descriptive error messages with context', async () => {
      // Arrange
      testHelper.mockFileReadError('index.json', ErrorTestHelper.createFileSystemError('ENOENT'));

      // Act & Assert
      try {
        await loader.loadItem('test_item');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Failed to load item index');
        expect((error as Error).message).toBeTruthy();
      }
    });

    it('should include item ID in item-specific error messages', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { tools: ['tools/existing.json'] }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      try {
        await loader.loadItem('missing_item');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toContain('missing_item');
        expect((error as Error).message).toContain('not found');
      }
    });

    it('should include category name in category-specific error messages', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: { existing: ['existing/item.json'] }
      });

      testHelper.mockIndexRead(mockIndex);

      // Act & Assert
      try {
        await loader.getItemsByCategory('missing_category');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toContain('missing_category');
        expect((error as Error).message).toContain('not found');
      }
    });
  });

  describe('Error recovery and resilience', () => {
    it('should continue operating after recoverable errors', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          good: ['good/item.json'],
          bad: ['bad/error_item.json']
        }
      });

      testHelper.mockMixedFileReads({
        'index.json': mockIndex,
        'good/item.json': ItemDataFactory.tool({ id: 'good_item' })
      }, {
        'bad/error_item.json': new Error('Temporary error')
      });

      // Act
      // First operation fails
      try {
        await loader.getItemsByCategory('bad');
        fail('Expected error to be thrown');
      } catch (error) {
        // Expected
      }

      // Second operation should still work
      const result = await loader.getItemsByCategory('good');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('good_item');
    });

    it('should maintain cache integrity after errors', async () => {
      // Arrange
      const mockIndex = createMockIndexData({
        categories: {
          tools: ['tools/good_item.json']
        }
      });

      testHelper.mockMultipleFileReads({
        'index.json': mockIndex,
        'tools/good_item.json': ItemDataFactory.tool({ id: 'good_item' })
      });

      // Act
      // Successful operation to populate cache
      const firstResult = await loader.getItemsByCategory('tools');

      // Failed operation
      try {
        await loader.loadItem('nonexistent');
        fail('Expected error to be thrown');
      } catch (error) {
        // Expected
      }

      // Cache should still work
      const secondResult = await loader.getItemsByCategory('tools');

      // Assert
      expect(secondResult).toBe(firstResult); // Same cached object
    });
  });
});