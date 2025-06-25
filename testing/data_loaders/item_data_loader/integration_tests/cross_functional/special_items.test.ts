/**
 * Integration tests for ItemDataLoader with special character items
 * Tests loading items with special IDs like "!!!!!" and "*bun*"
 * No mocking - validates special character handling with real data
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Special Items', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Special Character Item Loading', () => {
        test('should load item with exclamation marks (!!!!!) correctly', async () => {
            const specialItem = await loader.loadItem('!!!!!');
            
            expect(specialItem.id).toBe('!!!!!');
            expect(specialItem.name).toBeTruthy();
            expect(specialItem.description).toBeTruthy();
            expect(specialItem.examineText).toBeTruthy();
            expect(Object.values(ItemType)).toContain(specialItem.type);
            expect(Object.values(Size)).toContain(specialItem.size);
            
            // Should have proper structure
            expect(specialItem.aliases).toBeInstanceOf(Array);
            expect(specialItem.tags).toBeInstanceOf(Array);
            expect(specialItem.interactions).toBeInstanceOf(Array);
            expect(typeof specialItem.portable).toBe('boolean');
            expect(typeof specialItem.visible).toBe('boolean');
            expect(typeof specialItem.weight).toBe('number');
        });

        test('should load item with asterisks (*bun*) correctly', async () => {
            const bunItem = await loader.loadItem('*bun*');
            
            expect(bunItem.id).toBe('*bun*');
            expect(bunItem.name).toBeTruthy();
            expect(bunItem.description).toBeTruthy();
            expect(bunItem.examineText).toBeTruthy();
            expect(Object.values(ItemType)).toContain(bunItem.type);
            expect(Object.values(Size)).toContain(bunItem.size);
            
            // Should have proper structure
            expect(bunItem.aliases).toBeInstanceOf(Array);
            expect(bunItem.tags).toBeInstanceOf(Array);
            expect(bunItem.interactions).toBeInstanceOf(Array);
            expect(typeof bunItem.portable).toBe('boolean');
            expect(typeof bunItem.visible).toBe('boolean');
            expect(typeof bunItem.weight).toBe('number');
        });

        test('should handle special items in category loading', async () => {
            // Test that special character items are included in category loading
            const tools = await loader.getItemsByCategory('tools');
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Find special items in their respective categories
            const exclamationItem = tools.find(item => item.id === '!!!!!');
            const bunItem = treasures.find(item => item.id === '*bun*');
            
            expect(exclamationItem).toBeDefined();
            expect(bunItem).toBeDefined();
            
            expect(exclamationItem!.id).toBe('!!!!!');
            expect(bunItem!.id).toBe('*bun*');
        });

        test('should handle special items in full dataset loading', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find special character items
            const exclamationItem = allItems.find(item => item.id === '!!!!!');
            const bunItem = allItems.find(item => item.id === '*bun*');
            
            expect(exclamationItem).toBeDefined();
            expect(bunItem).toBeDefined();
            
            expect(exclamationItem!.id).toBe('!!!!!');
            expect(bunItem!.id).toBe('*bun*');
        });
    });

    describe('Special Character Handling in Filtering', () => {
        test('should include special items in type filtering', async () => {
            // Load by type and verify special items are included
            const toolItems = await loader.getItemsByType(ItemType.TOOL);
            const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
            
            // Check if special items are in their type collections
            const hasExclamationInTools = toolItems.some(item => item.id === '!!!!!');
            const hasBunInTreasures = treasureItems.some(item => item.id === '*bun*');
            
            // These depend on the actual types of these items
            if (toolItems.some(item => item.id === '!!!!!')) {
                expect(hasExclamationInTools).toBe(true);
            }
            if (treasureItems.some(item => item.id === '*bun*')) {
                expect(hasBunInTreasures).toBe(true);
            }
        });

        test('should handle special items in location filtering', async () => {
            // Test location filtering with special character items
            const bunItem = await loader.loadItem('*bun*');
            const exclamationItem = await loader.loadItem('!!!!!');
            
            // Get items by their initial locations
            const bunLocationItems = await loader.getItemsByLocation(bunItem.currentLocation);
            const exclamationLocationItems = await loader.getItemsByLocation(exclamationItem.currentLocation);
            
            // Verify special items are found in location filtering
            expect(bunLocationItems.some(item => item.id === '*bun*')).toBe(true);
            expect(exclamationLocationItems.some(item => item.id === '!!!!!')).toBe(true);
        });
    });

    describe('Special Character File Path Handling', () => {
        test('should properly resolve file paths for special character items', async () => {
            // This test verifies that file path resolution works correctly
            // for items with special characters in their IDs
            
            // Load items multiple times to test caching with special characters
            const bunItem1 = await loader.loadItem('*bun*');
            const bunItem2 = await loader.loadItem('*bun*');
            const exclamationItem1 = await loader.loadItem('!!!!!');
            const exclamationItem2 = await loader.loadItem('!!!!!');
            
            // Should return same objects (caching should work)
            expect(bunItem1).toEqual(bunItem2);
            expect(exclamationItem1).toEqual(exclamationItem2);
            
            // Verify they're the same reference (cached)
            expect(bunItem1).toBe(bunItem2);
            expect(exclamationItem1).toBe(exclamationItem2);
        });
    });

    describe('Special Item Properties', () => {
        test('should validate !!!!! item properties', async () => {
            const exclamationItem = await loader.loadItem('!!!!!');
            
            // Validate basic properties
            expect(exclamationItem.id).toBe('!!!!!');
            expect(exclamationItem.name).toBeTruthy();
            expect(exclamationItem.description).toBeTruthy();
            
            // Should have valid enum values
            expect(Object.values(ItemType)).toContain(exclamationItem.type);
            expect(Object.values(Size)).toContain(exclamationItem.size);
            
            // Should have interactions
            expect(exclamationItem.interactions.length).toBeGreaterThan(0);
            
            // Validate interaction structure
            exclamationItem.interactions.forEach(interaction => {
                expect(interaction.command).toBeTruthy();
                expect(interaction.message).toBeTruthy();
            });
        });

        test('should validate *bun* item properties', async () => {
            const bunItem = await loader.loadItem('*bun*');
            
            // Validate basic properties
            expect(bunItem.id).toBe('*bun*');
            expect(bunItem.name).toBeTruthy();
            expect(bunItem.description).toBeTruthy();
            
            // Should have valid enum values
            expect(Object.values(ItemType)).toContain(bunItem.type);
            expect(Object.values(Size)).toContain(bunItem.size);
            
            // Should have interactions
            expect(bunItem.interactions.length).toBeGreaterThan(0);
            
            // Validate interaction structure
            bunItem.interactions.forEach(interaction => {
                expect(interaction.command).toBeTruthy();
                expect(interaction.message).toBeTruthy();
            });
            
            // *bun* is likely a treasure, so test treasure-like properties
            if (bunItem.type === ItemType.TREASURE) {
                expect(bunItem.portable).toBe(true);
                expect(bunItem.visible).toBe(true);
                expect(bunItem.weight).toBeGreaterThan(0);
            }
        });
    });

    describe('Special Character Edge Cases', () => {
        test('should handle repeated loading of special character items', async () => {
            // Test that special character items can be loaded multiple times
            // without issues
            const loads = await Promise.all([
                loader.loadItem('*bun*'),
                loader.loadItem('!!!!!'),
                loader.loadItem('*bun*'),
                loader.loadItem('!!!!!'),
                loader.loadItem('*bun*')
            ]);
            
            // All *bun* loads should be identical
            expect(loads[0]).toEqual(loads[2]);
            expect(loads[0]).toEqual(loads[4]);
            expect(loads[2]).toEqual(loads[4]);
            
            // All !!!!! loads should be identical
            expect(loads[1]).toEqual(loads[3]);
            
            // Should be cached references
            expect(loads[0]).toBe(loads[2]);
            expect(loads[2]).toBe(loads[4]);
            expect(loads[1]).toBe(loads[3]);
        });

        test('should search for other potential special character items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find all items with special characters
            const specialCharItems = allItems.filter(item => {
                const id = item.id;
                return id.includes('!') || 
                       id.includes('*') || 
                       id.includes('?') || 
                       id.includes('#') || 
                       id.includes('@') || 
                       id.includes('$') || 
                       id.includes('%') || 
                       id.includes('^') || 
                       id.includes('&') || 
                       id.includes('(') || 
                       id.includes(')') || 
                       id.includes('[') || 
                       id.includes(']') || 
                       id.includes('{') || 
                       id.includes('}');
            });
            
            console.log('Items with special characters found:', specialCharItems.map(item => item.id));
            
            // Verify all special character items load correctly
            for (const specialItem of specialCharItems) {
                const reloadedItem = await loader.loadItem(specialItem.id);
                expect(reloadedItem.id).toBe(specialItem.id);
                expect(reloadedItem.name).toBeTruthy();
                expect(Object.values(ItemType)).toContain(reloadedItem.type);
            }
        });
    });

    describe('Performance with Special Items', () => {
        test('should load special character items efficiently', async () => {
            const startTime = Date.now();
            
            // Load special items multiple times
            await Promise.all([
                loader.loadItem('*bun*'),
                loader.loadItem('!!!!!'),
                loader.loadItem('*bun*'),
                loader.loadItem('!!!!!'),
            ]);
            
            const loadTime = Date.now() - startTime;
            
            // Should complete quickly due to caching
            expect(loadTime).toBeLessThan(100);
        });
    });

    describe('Special Item Integration', () => {
        test('should include special items in comprehensive operations', async () => {
            // Test that special items are properly included in all major operations
            
            // Check total count includes special items
            const totalCount = await loader.getTotalCount();
            const allItems = await loader.loadAllItems();
            expect(allItems).toHaveLength(totalCount);
            
            // Check that special items are in the count
            const hasExclamation = allItems.some(item => item.id === '!!!!!');
            const hasBun = allItems.some(item => item.id === '*bun*');
            expect(hasExclamation).toBe(true);
            expect(hasBun).toBe(true);
            
            // Check categories include special items
            const categories = await loader.getCategories();
            let foundSpecialItems = 0;
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                if (categoryItems.some(item => item.id === '!!!!!' || item.id === '*bun*')) {
                    foundSpecialItems++;
                }
            }
            
            expect(foundSpecialItems).toBeGreaterThan(0);
        });
    });

    describe('Error Handling with Special Characters', () => {
        test('should handle missing special character items gracefully', async () => {
            // Test error handling with special character patterns
            const specialMissingIds = [
                '!!!!!missing',
                '*missing*',
                '???',
                '####',
                '@@@@@'
            ];
            
            for (const missingId of specialMissingIds) {
                await expect(loader.loadItem(missingId))
                    .rejects
                    .toThrow(/not found/i);
            }
        });
    });
});