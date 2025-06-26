/**
 * Integration tests for ItemDataLoader type mapping functionality
 * Tests relationships between categories and types with real data
 * No mocking - validates type distribution and filtering with actual items
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Type Mapping', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category vs Type Relationships', () => {
        test('should validate TOOL type items are the largest category', async () => {
            const tools = await loader.getItemsByType(ItemType.TOOL);
            
            // All should be TOOL type (by definition)
            tools.forEach(tool => {
                expect(tool.type).toBe(ItemType.TOOL);
            });
            
            // Should have many tools (updated after treasure extraction fix)
            // Some items previously classified as TOOL are now TREASURE
            expect(tools.length).toBeGreaterThan(130);
            expect(tools.length).toBeLessThan(140);
            
            console.log('TOOL type items count:', tools.length);
        });

        test('should validate CONTAINER type items are containers', async () => {
            const containers = await loader.getItemsByType(ItemType.CONTAINER);
            
            // All should be CONTAINER type (by definition)
            containers.forEach(container => {
                expect(container.type).toBe(ItemType.CONTAINER);
            });
            
            // Should have 32 containers based on actual data (some reclassified)
            expect(containers.length).toBe(32);
            
            console.log('CONTAINER type items count:', containers.length);
        });

        test('should validate FOOD type items are food', async () => {
            const foodItems = await loader.getItemsByType(ItemType.FOOD);
            
            // All should be FOOD type (by definition)
            foodItems.forEach(food => {
                expect(food.type).toBe(ItemType.FOOD);
            });
            
            // Should have 7 food items based on actual data
            expect(foodItems.length).toBe(7);
        });

        test('should validate WEAPON type items are weapons', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            // All should be WEAPON type (by definition)
            weapons.forEach(weapon => {
                expect(weapon.type).toBe(ItemType.WEAPON);
            });
            
            // Should have 5 weapons based on actual data
            expect(weapons.length).toBe(5);
        });

        test('should validate LIGHT_SOURCE type items are light sources', async () => {
            const lightSources = await loader.getItemsByType(ItemType.LIGHT_SOURCE);
            
            // All should be LIGHT_SOURCE type (by definition)
            lightSources.forEach(lightSource => {
                expect(lightSource.type).toBe(ItemType.LIGHT_SOURCE);
            });
            
            // Should have 2 light sources based on actual data
            expect(lightSources.length).toBe(2);
        });

        test('should validate TREASURE type items are treasures', async () => {
            const treasures = await loader.getItemsByType(ItemType.TREASURE);
            
            // All should be TREASURE type (by definition)
            treasures.forEach(treasure => {
                expect(treasure.type).toBe(ItemType.TREASURE);
                
                // Treasures should have value and treasurePoints properties
                if (treasure.properties.value !== undefined) {
                    expect(treasure.properties.value).toBeGreaterThan(0);
                }
                if (treasure.properties.treasurePoints !== undefined) {
                    expect(treasure.properties.treasurePoints).toBeGreaterThan(0);
                }
            });
            
            // Should have treasures after extractor fix
            expect(treasures.length).toBeGreaterThan(0);
            
            console.log('TREASURE type items count:', treasures.length);
        });

        test('should validate all types have items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Count types across all items
            const typeCount = allItems.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // All enum types that exist in data should be represented
            const expectedTypes = [ItemType.TOOL, ItemType.CONTAINER, ItemType.FOOD, ItemType.WEAPON, ItemType.LIGHT_SOURCE, ItemType.TREASURE];
            expectedTypes.forEach(itemType => {
                expect(typeCount[itemType]).toBeGreaterThan(0);
            });
            
            // TREASURE type should now exist after extractor fix
            expect(typeCount[ItemType.TREASURE]).toBeGreaterThan(0);
            
            console.log('All item type distribution:', typeCount);
        });
    });

    describe('getItemsByType() Functionality', () => {
        test('should filter LIGHT_SOURCE type items correctly', async () => {
            const lightSourceItems = await loader.getItemsByType(ItemType.LIGHT_SOURCE);
            
            // All returned items should be LIGHT_SOURCE type
            lightSourceItems.forEach(item => {
                expect(item.type).toBe(ItemType.LIGHT_SOURCE);
            });
            
            // Should have 2 light sources based on actual data
            expect(lightSourceItems.length).toBe(2);
            
            // Verify against full dataset
            const allItems = await loader.loadAllItems();
            const expectedLightSources = allItems.filter(item => item.type === ItemType.LIGHT_SOURCE);
            expect(lightSourceItems).toHaveLength(expectedLightSources.length);
        });

        test('should filter TOOL type items correctly', async () => {
            const toolItems = await loader.getItemsByType(ItemType.TOOL);
            
            // All returned items should be TOOL type
            toolItems.forEach(item => {
                expect(item.type).toBe(ItemType.TOOL);
            });
            
            // Should have many tools (updated after treasure extraction fix)
            expect(toolItems.length).toBeGreaterThan(130);
            expect(toolItems.length).toBeLessThan(140);
            
            // Verify against full dataset
            const allItems = await loader.loadAllItems();
            const expectedTools = allItems.filter(item => item.type === ItemType.TOOL);
            expect(toolItems).toHaveLength(expectedTools.length);
        });

        test('should filter CONTAINER type items correctly', async () => {
            const containerItems = await loader.getItemsByType(ItemType.CONTAINER);
            
            // All returned items should be CONTAINER type
            containerItems.forEach(item => {
                expect(item.type).toBe(ItemType.CONTAINER);
            });
            
            // Should have 32 containers based on actual data (some reclassified)
            expect(containerItems).toHaveLength(32);
        });

        test('should filter WEAPON type items correctly', async () => {
            const weaponItems = await loader.getItemsByType(ItemType.WEAPON);
            
            // All returned items should be WEAPON type
            weaponItems.forEach(item => {
                expect(item.type).toBe(ItemType.WEAPON);
            });
            
            // Should have 5 weapons based on actual data
            expect(weaponItems.length).toBe(5);
        });

        test('should filter FOOD type items correctly', async () => {
            const foodItems = await loader.getItemsByType(ItemType.FOOD);
            
            // All returned items should be FOOD type
            foodItems.forEach(item => {
                expect(item.type).toBe(ItemType.FOOD);
            });
            
            // Should have 7 food items based on actual data
            expect(foodItems.length).toBe(7);
            
            // Verify against full dataset
            const allItems = await loader.loadAllItems();
            const expectedFoodItems = allItems.filter(item => item.type === ItemType.FOOD);
            expect(foodItems).toHaveLength(expectedFoodItems.length);
        });

        test('should filter TREASURE type items correctly', async () => {
            const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
            
            // All returned items should be TREASURE type
            treasureItems.forEach(item => {
                expect(item.type).toBe(ItemType.TREASURE);
            });
            
            // Should have treasures after extractor fix
            expect(treasureItems.length).toBeGreaterThan(0);
            
            // Verify against full dataset
            const allItems = await loader.loadAllItems();
            const expectedTreasureItems = allItems.filter(item => item.type === ItemType.TREASURE);
            expect(treasureItems).toHaveLength(expectedTreasureItems.length);
        });
    });

    describe('Cross-Type Analysis', () => {
        test('should verify type consistency across all items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Verify each item has a valid type
            allItems.forEach(item => {
                expect(Object.values(ItemType)).toContain(item.type);
                expect(typeof item.type).toBe('string');
                expect(item.type.length).toBeGreaterThan(0);
            });
            
            // Create type distribution analysis
            const typeDistribution = allItems.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            console.log('Type distribution across all items:', typeDistribution);
            
            // Verify expected counts based on actual data (updated after treasure extraction)
            expect(typeDistribution[ItemType.TOOL]).toBeGreaterThan(130);
            expect(typeDistribution[ItemType.TOOL]).toBeLessThan(140);
            expect(typeDistribution[ItemType.CONTAINER]).toBe(32);
            expect(typeDistribution[ItemType.FOOD]).toBe(7);
            expect(typeDistribution[ItemType.WEAPON]).toBe(5);
            expect(typeDistribution[ItemType.LIGHT_SOURCE]).toBe(2);
            expect(typeDistribution[ItemType.TREASURE]).toBeGreaterThan(0);
            
            console.log('Tool count:', typeDistribution[ItemType.TOOL]);
            console.log('Treasure count:', typeDistribution[ItemType.TREASURE]);
        });

        test('should verify type filtering includes all relevant items', async () => {
            const allItems = await loader.loadAllItems();
            
            // For each type, verify getItemsByType returns all items of that type
            for (const itemType of Object.values(ItemType)) {
                const typeItems = await loader.getItemsByType(itemType);
                const expectedItems = allItems.filter(item => item.type === itemType);
                
                expect(typeItems).toHaveLength(expectedItems.length);
                
                // Verify same items
                const typeIds = typeItems.map(item => item.id).sort();
                const expectedIds = expectedItems.map(item => item.id).sort();
                expect(typeIds).toEqual(expectedIds);
            }
        });

        test('should validate total items equals sum of all types', async () => {
            const allItems = await loader.loadAllItems();
            let totalItemsByType = 0;
            
            for (const itemType of Object.values(ItemType)) {
                const typeItems = await loader.getItemsByType(itemType);
                totalItemsByType += typeItems.length;
            }
            
            expect(totalItemsByType).toBe(allItems.length);
            expect(totalItemsByType).toBe(214);
        });
    });

    describe('Type-Specific Characteristics', () => {
        test('should validate FOOD items have food-like properties', async () => {
            const foodItems = await loader.getItemsByType(ItemType.FOOD);
            
            foodItems.forEach(food => {
                // Food items should be visible
                expect(food.visible).toBe(true);
                
                // Food items typically have positive weight
                expect(food.weight).toBeGreaterThan(0);
                
                // Food items should have interactions
                expect(food.interactions.length).toBeGreaterThan(0);
            });
        });

        test('should validate TOOL items have tool-like properties', async () => {
            const tools = await loader.getItemsByType(ItemType.TOOL);
            
            // Check that tools have reasonable portability distribution
            const portableCount = tools.filter(t => t.portable).length;
            const nonPortableCount = tools.length - portableCount;
            
            // Should have reasonable distribution (updated after treasure extraction)
            expect(portableCount).toBeGreaterThan(40);
            expect(nonPortableCount).toBeGreaterThan(80);
            
            console.log(`Portable tools: ${portableCount}, Non-portable tools: ${nonPortableCount}`);
            
            tools.forEach(tool => {
                // Tools should have interactions
                expect(tool.interactions.length).toBeGreaterThan(0);
            });
        });

        test('should validate CONTAINER items have container-like properties', async () => {
            const containers = await loader.getItemsByType(ItemType.CONTAINER);
            
            containers.forEach(container => {
                // Containers should have interactions (open, close, etc.)
                expect(container.interactions.length).toBeGreaterThan(0);
                
                // Container interactions should include container-specific commands
                // Note: Not all containers might have these exact commands, so we're flexible
            });
        });

        test('should validate WEAPON items have weapon-like properties', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            // Check weapon portability distribution (3 portable, 2 not portable)
            const portableWeapons = weapons.filter(w => w.portable);
            const nonPortableWeapons = weapons.filter(w => !w.portable);
            expect(portableWeapons.length).toBe(3); // knife, rknif, sword
            expect(nonPortableWeapons.length).toBe(2); // axe, still
            
            weapons.forEach(weapon => {
                // Weapons should be visible
                expect(weapon.visible).toBe(true);
                
                // Weapons should have positive weight
                expect(weapon.weight).toBeGreaterThan(0);
                
                // Weapons should have interactions
                expect(weapon.interactions.length).toBeGreaterThan(0);
            });
        });

        test('should validate LIGHT_SOURCE items have light-source-like properties', async () => {
            const lightSources = await loader.getItemsByType(ItemType.LIGHT_SOURCE);
            
            lightSources.forEach(lightSource => {
                // Light sources should be visible
                expect(lightSource.visible).toBe(true);
                
                // Light sources should have positive weight
                expect(lightSource.weight).toBeGreaterThan(0);
                
                // Light sources should have interactions
                expect(lightSource.interactions.length).toBeGreaterThan(0);
            });
        });

        test('should validate TREASURE items have treasure-like properties', async () => {
            const treasures = await loader.getItemsByType(ItemType.TREASURE);
            
            treasures.forEach(treasure => {
                // Most treasures should be visible (but not all)
                // Some treasures might be hidden initially
                
                // Most treasures should be portable (but not all)
                // Some treasures like portraits might not be portable
                
                // Treasures should have positive weight
                expect(treasure.weight).toBeGreaterThan(0);
                
                // Treasures should have value and treasurePoints
                if (treasure.properties.value !== undefined) {
                    expect(treasure.properties.value).toBeGreaterThan(0);
                }
                if (treasure.properties.treasurePoints !== undefined) {
                    expect(treasure.properties.treasurePoints).toBeGreaterThan(0);
                }
                
                // Treasures should have interactions
                expect(treasure.interactions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Performance with Type Filtering', () => {
        test('should perform type filtering efficiently', async () => {
            const startTime = Date.now();
            
            // Load items by types that actually exist in data (updated to include TREASURE)
            const existingTypes = [ItemType.TOOL, ItemType.CONTAINER, ItemType.FOOD, ItemType.WEAPON, ItemType.LIGHT_SOURCE, ItemType.TREASURE];
            const typePromises = existingTypes.map(type => 
                loader.getItemsByType(type)
            );
            
            const typeResults = await Promise.all(typePromises);
            const loadTime = Date.now() - startTime;
            
            // Should complete type filtering within reasonable time
            expect(loadTime).toBeLessThan(3000);
            
            // Verify we got results for all existing types (6 types including TREASURE)
            expect(typeResults).toHaveLength(6);
            typeResults.forEach(typeItems => {
                expect(typeItems.length).toBeGreaterThan(0);
            });
            
            console.log(`Type filtering for all types completed in ${loadTime}ms`);
        });
    });

});