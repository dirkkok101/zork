/**
 * Integration tests for ItemDataLoader error handling with missing files
 * Tests handling of missing item files and corrupted index data
 * No mocking - tests real file system error scenarios
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';
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
                try {
                    await loader.loadItem(itemId);
                    fail(`Expected loadItem('${itemId}') to throw an error`);
                } catch (error) {
                    const errorMessage = (error as Error).message;
                    expect(errorMessage.toLowerCase()).toContain(itemId.toLowerCase());
                }
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
        test('should continue loading other tool items if individual items exist', async () => {
            // This test validates that tool type loading works correctly
            // (TOOL type has 164 items, while TREASURE has 0)

            const tools = await loader.getItemsByType(ItemType.TOOL);
            
            // Should load many tool items
            expect(tools.length).toBeGreaterThan(100);
            
            // All loaded items should be valid tools
            tools.forEach(tool => {
                expect(tool.id).toBeTruthy();
                expect(tool.name).toBeTruthy();
                expect(tool.type).toBe(ItemType.TOOL);
            });
        });

        test('should handle partial type loading gracefully', async () => {
            // Test item types that have items load correctly despite potential individual file issues
            const itemTypesWithItems = [
                ItemType.TOOL,      // 164 items
                ItemType.CONTAINER, // 36 items
                ItemType.FOOD,      // 7 items
                ItemType.WEAPON,    // 5 items
                ItemType.LIGHT_SOURCE // 2 items
            ];
            
            for (const itemType of itemTypesWithItems) {
                const typeItems = await loader.getItemsByType(itemType);
                
                expect(typeItems.length).toBeGreaterThan(0);
                
                typeItems.forEach(item => {
                    expect(item.id).toBeTruthy();
                    expect(item.name).toBeTruthy();
                    expect(Object.values(ItemType)).toContain(item.type);
                    expect(item.type).toBe(itemType);
                });
            }
            
            // Test that TREASURE type now has items after extractor fix
            const treasures = await loader.getItemsByType(ItemType.TREASURE);
            expect(treasures.length).toBeGreaterThan(0);
        });
    });

    describe('Invalid Path Handling', () => {
        test('should handle invalid data path gracefully', async () => {
            const invalidLoader = new ItemDataLoader('invalid/path/');
            
            await expect(invalidLoader.loadItem('lamp'))
                .rejects
                .toThrow();

            await expect(invalidLoader.getItemsByType(ItemType.TOOL))
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
        test('should handle missing data directory scenario', async () => {
            // Test with a path that doesn't exist
            const noDataLoader = new ItemDataLoader('nonexistent_dir/'); // Directory that doesn't exist
            
            await expect(noDataLoader.loadAllItems())
                .rejects
                .toThrow();

            await expect(noDataLoader.loadItem('lamp'))
                .rejects
                .toThrow();
        });

        test('should validate index loading is prerequisite for other operations', async () => {
            // Create loader with invalid path to ensure index fails
            const badLoader = new ItemDataLoader('nonexistent/');
            
            // All operations should fail with invalid path
            await expect(badLoader.loadAllItems()).rejects.toThrow();
            await expect(badLoader.loadItem('lamp')).rejects.toThrow();
            await expect(badLoader.getItemsByType(ItemType.TOOL)).rejects.toThrow();
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
            expect(results[0]!.status).toBe('fulfilled');
            expect(results[1]!.status).toBe('fulfilled');
            expect(results[3]!.status).toBe('fulfilled');
            expect(results[5]!.status).toBe('fulfilled');
            
            // Invalid items should fail
            expect(results[2]!.status).toBe('rejected');
            expect(results[4]!.status).toBe('rejected');

            // Successful items should have valid data
            if (results[0]!.status === 'fulfilled') {
                expect((results[0] as PromiseFulfilledResult<any>).value.id).toBe('lamp');
            }
            if (results[1]!.status === 'fulfilled') {
                expect((results[1] as PromiseFulfilledResult<any>).value.id).toBe('sword');
            }
        });

        test('should handle concurrent type loads with error resilience', async () => {
            const typePromises = [
                loader.getItemsByType(ItemType.TOOL),
                loader.getItemsByType(ItemType.CONTAINER),
                loader.loadItem('invalid_item'),
                loader.getItemsByType(ItemType.WEAPON),
                loader.loadItem('another_invalid')
            ];

            const results = await Promise.allSettled(typePromises);
            
            // Valid type loads should succeed
            expect(results[0]!.status).toBe('fulfilled');
            expect(results[1]!.status).toBe('fulfilled');
            expect(results[3]!.status).toBe('fulfilled');
            
            // Invalid item loads should fail
            expect(results[2]!.status).toBe('rejected');
            expect(results[4]!.status).toBe('rejected');
        });
    });

    describe('Stateless Behavior During Errors', () => {
        test('should not cache failed item lookups', async () => {
            // First attempt should fail
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Second attempt should also fail (stateless, no caching)
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Should still be able to load valid items
            const validItem = await loader.loadItem('lamp');
            expect(validItem.id).toBe('lamp');
        });

        test('should maintain consistent behavior after errors', async () => {
            // Load a valid item first
            const item1 = await loader.loadItem('lamp');
            
            // Try to load invalid item
            await expect(loader.loadItem('missing_item'))
                .rejects
                .toThrow();

            // Item should still be loadable (stateless behavior)
            const item2 = await loader.loadItem('lamp');
            expect(item1).toEqual(item2); // Should have same content (value equality)
            expect(item2.id).toBe('lamp');
        });

        test('should handle stateless behavior after type loading errors', async () => {
            // ItemDataLoader is stateless, so this test verifies consistent behavior
            // Load valid type first
            const tools = await loader.getItemsByType(ItemType.TOOL);
            expect(tools.length).toBeGreaterThan(100);
            
            // Try invalid item
            await expect(loader.loadItem('invalid_item'))
                .rejects
                .toThrow();

            // Original type should still be accessible (stateless behavior)
            const tools2 = await loader.getItemsByType(ItemType.TOOL);
            expect(tools2.length).toBe(tools.length);
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

        test('should provide helpful error messages for file system errors', async () => {
            const invalidLoader = new ItemDataLoader('invalid/path/');
            
            await expect(invalidLoader.loadItem('lamp'))
                .rejects
                .toThrow();
        });
    });

    describe('Recovery and Resilience', () => {
        test('should allow normal operation after encountering errors', async () => {
            // Cause some errors first
            await expect(loader.loadItem('missing1')).rejects.toThrow();
            await expect(loader.loadItem('missing2')).rejects.toThrow();
            await expect(loader.loadItem('invalid_item')).rejects.toThrow();

            // Should still be able to perform normal operations
            const allItems = await loader.loadAllItems();
            expect(allItems).toHaveLength(214);

            const toolItems = await loader.getItemsByType(ItemType.TOOL);
            expect(toolItems.length).toBeGreaterThan(30);

            const treasure = await loader.loadItem('coin');
            expect(treasure.id).toBe('coin');
        });

        test('should maintain consistent state across error scenarios', async () => {
            // Get baseline state
            const allItems1 = await loader.loadAllItems();
            const treasures1 = await loader.getItemsByType(ItemType.TREASURE);

            // Cause some errors
            await expect(loader.loadItem('missing')).rejects.toThrow();
            await expect(loader.loadItem('invalid_item')).rejects.toThrow();

            // State should remain consistent
            const allItems2 = await loader.loadAllItems();
            const treasures2 = await loader.getItemsByType(ItemType.TREASURE);

            expect(allItems1.length).toBe(allItems2.length);
            expect(treasures1.length).toBe(treasures2.length);
        });
    });
});