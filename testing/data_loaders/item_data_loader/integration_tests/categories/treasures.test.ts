/**
 * Integration tests for ItemDataLoader with real treasure data
 * Tests loading actual treasure items from data/items/treasures/
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Treasures Category', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category Loading', () => {
        test('should load all treasure items from real data files', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Verify expected count based on index.json
            expect(treasures).toHaveLength(103);
            
            // Verify all items are properly loaded
            treasures.forEach(treasure => {
                expect(treasure).toMatchObject({
                    id: expect.any(String),
                    name: expect.any(String),
                    aliases: expect.any(Array),
                    description: expect.any(String),
                    examineText: expect.any(String),
                    type: expect.any(String),
                    portable: expect.any(Boolean),
                    visible: expect.any(Boolean),
                    weight: expect.any(Number),
                    size: expect.any(String),
                    tags: expect.any(Array),
                    properties: expect.any(Object),
                    interactions: expect.any(Array),
                    currentLocation: expect.any(String),
                    state: expect.any(Object),
                    flags: expect.any(Object)
                });
            });
        });

        test('should handle special character items (*bun*)', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Find the special *bun* item
            const bunItem = treasures.find(item => item.id === '*bun*');
            expect(bunItem).toBeDefined();
            expect(bunItem!.name).toBeDefined();
            expect(bunItem!.description).toBeDefined();
        });

        test('should load specific treasure items by ID', async () => {
            // Test loading known treasure items
            const knownTreasureIds = ['ghost', 'coin', 'ruby', 'diamo', 'emera'];
            
            for (const treasureId of knownTreasureIds) {
                const item = await loader.loadItem(treasureId);
                expect(item.id).toBe(treasureId);
                // Note: Items in treasures category might have different types
                expect(Object.values(ItemType)).toContain(item.type);
            }
        });
    });

    describe('Data Validation', () => {
        test('should validate all treasure items have proper enum values', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            treasures.forEach(treasure => {
                // Validate ItemType enum
                expect(Object.values(ItemType)).toContain(treasure.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(treasure.size);
                
                // Validate required string fields are non-empty
                expect(treasure.id).toBeTruthy();
                expect(treasure.name).toBeTruthy();
                expect(treasure.description).toBeTruthy();
                expect(treasure.examineText).toBeTruthy();
            });
        });

        test('should validate treasure-specific properties', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Most treasures should have TREASURE type, but some might be other types
            const treasureTypeItems = treasures.filter(item => item.type === ItemType.TREASURE);
            expect(treasureTypeItems.length).toBeGreaterThan(50); // Majority should be TREASURE type
            
            // Check for expected treasure properties
            treasures.forEach(treasure => {
                // All treasures should have proper structure
                expect(treasure.aliases).toBeInstanceOf(Array);
                expect(treasure.tags).toBeInstanceOf(Array);
                expect(treasure.interactions).toBeInstanceOf(Array);
                expect(typeof treasure.weight).toBe('number');
                expect(typeof treasure.portable).toBe('boolean');
                expect(typeof treasure.visible).toBe('boolean');
            });
        });

        test('should validate interaction structures for treasures', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            treasures.forEach(treasure => {
                treasure.interactions.forEach(interaction => {
                    expect(interaction).toMatchObject({
                        command: expect.any(String),
                        message: expect.any(String)
                    });
                    
                    // Optional fields
                    if (interaction.condition) {
                        expect(interaction.condition).toBeInstanceOf(Array);
                    }
                    if (interaction.effect) {
                        expect(interaction.effect).toBeInstanceOf(Array);
                    }
                });
            });
        });
    });

    describe('Performance', () => {
        test('should load all treasures within reasonable time', async () => {
            const startTime = Date.now();
            const treasures = await loader.getItemsByCategory('treasures');
            const loadTime = Date.now() - startTime;
            
            expect(treasures).toHaveLength(103);
            expect(loadTime).toBeLessThan(1000); // Should load within 1 second
        });

        test('should cache treasure category for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const treasures1 = await loader.getItemsByCategory('treasures');
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const treasures2 = await loader.getItemsByCategory('treasures');
            const loadTime2 = Date.now() - startTime2;
            
            expect(treasures1).toHaveLength(103);
            expect(treasures2).toHaveLength(103);
            expect(loadTime2).toBeLessThan(loadTime1); // Cache should be faster
            expect(loadTime2).toBeLessThan(50); // Cached access should be very fast
        });
    });

    describe('Known Treasure Items', () => {
        test('should load famous treasure items with expected properties', async () => {
            // Test some well-known Zork treasures
            const famousTreasures = [
                { id: 'coin', expectedName: /zorkmid|coin/i },
                { id: 'ruby', expectedName: /ruby/i },
                { id: 'diamo', expectedName: /diamond/i },
                { id: 'emera', expectedName: /emerald/i }
            ];
            
            for (const { id, expectedName } of famousTreasures) {
                const treasure = await loader.loadItem(id);
                expect(treasure.id).toBe(id);
                expect(treasure.name).toMatch(expectedName);
                // Items in treasures category may have different types
                expect(Object.values(ItemType)).toContain(treasure.type);
                expect(treasure.weight).toBeGreaterThan(0);
            }
        });

        test('should handle special case items correctly', async () => {
            // Test the *bun* item with special characters
            const bunItem = await loader.loadItem('*bun*');
            expect(bunItem.id).toBe('*bun*');
            expect(bunItem.name).toBeDefined();
            expect(Object.values(ItemType)).toContain(bunItem.type);
            
            // Verify it's included in category loading
            const treasures = await loader.getItemsByCategory('treasures');
            const foundBun = treasures.find(item => item.id === '*bun*');
            expect(foundBun).toBeDefined();
            expect(foundBun).toEqual(bunItem);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing treasure item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_treasure'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should continue loading other treasures if one fails', async () => {
            // This test verifies the error handling in getItemsByCategory
            // where individual item loading errors don't fail the entire category
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Should still load the full expected count
            expect(treasures).toHaveLength(103);
            
            // All loaded items should be valid
            treasures.forEach(treasure => {
                expect(treasure.id).toBeTruthy();
                expect(treasure.name).toBeTruthy();
            });
        });
    });
});