/**
 * Integration tests for ItemDataLoader error handling with missing files
 * Tests handling of missing item files and corrupted index data
 * No mocking - tests real file system error scenarios
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Missing Files Error Handling', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Missing Item File Handling', () => {
        test('should throw appropriate error for non-existent item', async () => {
            await expect(loader.loadItem('totally_nonexistent_item'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should handle missing item gracefully with descriptive error', async () => {
            const nonExistentIds = [
                'missing_treasure',
                'fake_tool',
                'nonexistent_weapon',
                'phantom_container'
            ];

            for (const itemId of nonExistentIds) {
                await expect(loader.loadItem(itemId))
                    .rejects
                    .toThrow(expect.stringMatching(new RegExp(itemId, 'i')));
            }
        });

        test('should continue loading valid items after missing item error', async () => {
            // Try to load a missing item
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Should still be able to load valid items
            const validItem = await loader.loadItem('lamp');
            expect(validItem.id).toBe('lamp');
            expect(validItem.name).toBeTruthy();
        });

        test('should handle case-sensitive item IDs correctly', async () => {
            // Test that case matters for item IDs
            await expect(loader.loadItem('LAMP'))
                .rejects
                .toThrow(/not found/i);

            await expect(loader.loadItem('Lamp'))
                .rejects
                .toThrow(/not found/i);

            // But correct case should work
            const validItem = await loader.loadItem('lamp');
            expect(validItem.id).toBe('lamp');
        });
    });

    describe('Category Resilience', () => {
        test('should continue loading other items in category if one item fails', async () => {
            // This test validates the error handling behavior mentioned in getItemsByCategory
            // where individual item loading errors don't fail the entire category

            const treasures = await loader.getItemsByCategory('treasures');
            
            // Should load all expected treasures
            expect(treasures).toHaveLength(106);
            
            // All loaded items should be valid
            treasures.forEach(treasure => {
                expect(treasure.id).toBeTruthy();
                expect(treasure.name).toBeTruthy();
                expect(treasure.type).toBe(ItemType.TREASURE);
            });
        });

        test('should handle partial category loading gracefully', async () => {
            // Test all categories load correctly despite potential individual file issues
            const categories = await loader.getCategories();
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                
                expect(categoryItems.length).toBeGreaterThan(0);
                
                categoryItems.forEach(item => {
                    expect(item.id).toBeTruthy();
                    expect(item.name).toBeTruthy();
                    expect(Object.values(ItemType)).toContain(item.type);
                });
            }
        });
    });

    describe('Invalid Path Handling', () => {
        test('should handle invalid data path gracefully', async () => {
            const invalidLoader = new ItemDataLoader('invalid/path/');
            
            await expect(invalidLoader.loadItem('lamp'))
                .rejects
                .toThrow();

            await expect(invalidLoader.getCategories())
                .rejects
                .toThrow();

            await expect(invalidLoader.loadAllItems())
                .rejects
                .toThrow();
        });

        test('should handle empty data path', async () => {
            const emptyPathLoader = new ItemDataLoader('');
            
            await expect(emptyPathLoader.loadItem('lamp'))
                .rejects
                .toThrow();
        });

        test('should handle relative vs absolute path issues', async () => {
            // Test with different path formats
            const relativeLoader = new ItemDataLoader('./data/items/');
            const absoluteLoader = new ItemDataLoader(join(process.cwd(), 'data/items/'));
            
            // Both should work (or both should fail consistently)
            try {
                const relativeItem = await relativeLoader.loadItem('lamp');
                const absoluteItem = await absoluteLoader.loadItem('lamp');
                
                expect(relativeItem.id).toBe(absoluteItem.id);
                expect(relativeItem.name).toBe(absoluteItem.name);
            } catch (error) {
                // If one fails, both should fail
                await expect(relativeLoader.loadItem('lamp')).rejects.toThrow();
                await expect(absoluteLoader.loadItem('lamp')).rejects.toThrow();
            }
        });
    });

    describe('Index File Error Handling', () => {
        test('should handle missing index file scenario', async () => {
            // Test with a path that doesn't have index.json
            const noIndexLoader = new ItemDataLoader('src/'); // Directory without index.json
            
            await expect(noIndexLoader.getCategories())
                .rejects
                .toThrow(/index/i);

            await expect(noIndexLoader.getTotalCount())
                .rejects
                .toThrow(/index/i);
        });

        test('should validate index loading is prerequisite for other operations', async () => {
            // Create loader with invalid path to ensure index fails
            const badLoader = new ItemDataLoader('nonexistent/');
            
            // All operations that depend on index should fail
            await expect(badLoader.loadAllItems()).rejects.toThrow();
            await expect(badLoader.getCategories()).rejects.toThrow();
            await expect(badLoader.getTotalCount()).rejects.toThrow();
            await expect(badLoader.getItemsByCategory('treasures')).rejects.toThrow();
        });
    });

    describe('Concurrent Error Handling', () => {
        test('should handle concurrent requests with mixed valid/invalid items', async () => {
            const mixedRequests = [
                loader.loadItem('lamp'),      // valid
                loader.loadItem('sword'),     // valid
                loader.loadItem('missing1'),  // invalid
                loader.loadItem('coin'),      // valid
                loader.loadItem('missing2'),  // invalid
                loader.loadItem('rope')       // valid
            ];

            const results = await Promise.allSettled(mixedRequests);
            
            expect(results).toHaveLength(6);
            
            // Valid items should succeed
            expect(results[0].status).toBe('fulfilled');
            expect(results[1].status).toBe('fulfilled');
            expect(results[3].status).toBe('fulfilled');
            expect(results[5].status).toBe('fulfilled');
            
            // Invalid items should fail
            expect(results[2].status).toBe('rejected');
            expect(results[4].status).toBe('rejected');

            // Successful items should have valid data
            if (results[0].status === 'fulfilled') {
                expect(results[0].value.id).toBe('lamp');
            }
            if (results[1].status === 'fulfilled') {
                expect(results[1].value.id).toBe('sword');
            }
        });

        test('should handle concurrent category loads with error resilience', async () => {
            const categoryPromises = [
                loader.getItemsByCategory('treasures'),
                loader.getItemsByCategory('tools'),
                loader.getItemsByCategory('invalid_category'),
                loader.getItemsByCategory('containers'),
                loader.getItemsByCategory('another_invalid')
            ];

            const results = await Promise.allSettled(categoryPromises);
            
            // Valid categories should succeed
            expect(results[0].status).toBe('fulfilled');
            expect(results[1].status).toBe('fulfilled');
            expect(results[3].status).toBe('fulfilled');
            
            // Invalid categories should fail
            expect(results[2].status).toBe('rejected');
            expect(results[4].status).toBe('rejected');
        });
    });

    describe('Cache Behavior During Errors', () => {
        test('should not cache failed item lookups', async () => {
            // First attempt should fail
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Second attempt should also fail (not return cached error)
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Should still be able to load valid items
            const validItem = await loader.loadItem('lamp');
            expect(validItem.id).toBe('lamp');
        });

        test('should maintain cache integrity after errors', async () => {
            // Load a valid item first
            const item1 = await loader.loadItem('lamp');
            
            // Try to load invalid item
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Original cached item should still be accessible
            const item2 = await loader.loadItem('lamp');
            expect(item1).toBe(item2); // Should be same cached reference
            expect(item2.id).toBe('lamp');
        });

        test('should handle cache state after category loading errors', async () => {
            // Load valid category first
            const treasures = await loader.getItemsByCategory('treasures');
            expect(treasures).toHaveLength(106);
            
            // Try invalid category
            await expect(loader.getItemsByCategory('invalid_category'))
                .rejects
                .toThrow();

            // Original category should still be cached
            const treasures2 = await loader.getItemsByCategory('treasures');
            expect(treasures2).toEqual(treasures);
        });
    });

    describe('Error Message Quality', () => {
        test('should provide helpful error messages for missing items', async () => {
            const missingId = 'definitely_missing_item';
            
            try {
                await loader.loadItem(missingId);
                fail('Should have thrown an error');
            } catch (error) {
                const errorMessage = (error as Error).message;
                
                // Error should mention the missing item ID
                expect(errorMessage.toLowerCase()).toContain(missingId.toLowerCase());
                
                // Error should indicate it's a "not found" issue
                expect(errorMessage.toLowerCase()).toContain('not found');
                
                // Error should be informative
                expect(errorMessage.length).toBeGreaterThan(10);
            }
        });

        test('should provide helpful error messages for missing categories', async () => {
            const missingCategory = 'invalid_category';
            
            try {
                await loader.getItemsByCategory(missingCategory);
                fail('Should have thrown an error');
            } catch (error) {
                const errorMessage = (error as Error).message;
                
                // Error should mention the missing category
                expect(errorMessage.toLowerCase()).toContain(missingCategory.toLowerCase());
                
                // Error should indicate category issue
                expect(errorMessage.toLowerCase()).toContain('category');
                
                // Error should be informative
                expect(errorMessage.length).toBeGreaterThan(10);
            }
        });
    });

    describe('Recovery and Resilience', () => {
        test('should allow normal operation after encountering errors', async () => {
            // Cause some errors first
            await expect(loader.loadItem('missing1')).rejects.toThrow();
            await expect(loader.loadItem('missing2')).rejects.toThrow();
            await expect(loader.getItemsByCategory('invalid')).rejects.toThrow();

            // Should still be able to perform normal operations
            const allItems = await loader.loadAllItems();
            expect(allItems).toHaveLength(214);

            const categories = await loader.getCategories();
            expect(categories).toHaveLength(5);

            const treasure = await loader.loadItem('coin');
            expect(treasure.id).toBe('coin');
        });

        test('should maintain consistent state across error scenarios', async () => {
            // Get baseline state
            const totalCount1 = await loader.getTotalCount();
            const categories1 = await loader.getCategories();

            // Cause some errors
            await expect(loader.loadItem('missing')).rejects.toThrow();
            await expect(loader.getItemsByCategory('invalid')).rejects.toThrow();

            // State should remain consistent
            const totalCount2 = await loader.getTotalCount();
            const categories2 = await loader.getCategories();

            expect(totalCount1).toBe(totalCount2);
            expect(categories1).toEqual(categories2);
        });
    });
});