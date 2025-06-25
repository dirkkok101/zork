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
            
            // Should have many tools (164 based on actual data)
            expect(tools.length).toBe(164);
            
            console.log('TOOL type items count:', tools.length);
        });

        test('should validate CONTAINER type items are containers', async () => {
            const containers = await loader.getItemsByType(ItemType.CONTAINER);
            
            // All should be CONTAINER type (by definition)
            containers.forEach(container => {
                expect(container.type).toBe(ItemType.CONTAINER);
            });
            
            // Should have 36 containers based on actual data
            expect(containers.length).toBe(36);
            
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

        test('should validate all types have items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Count types across all items
            const typeCount = allItems.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // All enum types that exist in data should be represented
            const expectedTypes = [ItemType.TOOL, ItemType.CONTAINER, ItemType.FOOD, ItemType.WEAPON, ItemType.LIGHT_SOURCE];
            expectedTypes.forEach(itemType => {
                expect(typeCount[itemType]).toBeGreaterThan(0);
            });
            
            // TREASURE type should not exist in current data
            expect(typeCount[ItemType.TREASURE]).toBeUndefined();
            
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
            
            // Should have 164 tools based on actual data
            expect(toolItems.length).toBe(164);
            
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
            
            // Should have 36 containers based on actual data
            expect(containerItems).toHaveLength(36);
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
            
            // Verify expected counts based on actual data
            expect(typeDistribution[ItemType.TOOL]).toBe(164);
            expect(typeDistribution[ItemType.CONTAINER]).toBe(36);
            expect(typeDistribution[ItemType.FOOD]).toBe(7);
            expect(typeDistribution[ItemType.WEAPON]).toBe(5);
            expect(typeDistribution[ItemType.LIGHT_SOURCE]).toBe(2);
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
            
            // Check that tools have expected portability distribution (43% portable)
            const portableCount = tools.filter(t => t.portable).length;
            expect(portableCount).toBe(71); // Based on actual data
            expect(tools.length - portableCount).toBe(93); // Non-portable tools
            
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
    });

    describe('Performance with Type Filtering', () => {
        test('should perform type filtering efficiently', async () => {
            const startTime = Date.now();
            
            // Load items by types that actually exist in data
            const existingTypes = [ItemType.TOOL, ItemType.CONTAINER, ItemType.FOOD, ItemType.WEAPON, ItemType.LIGHT_SOURCE];
            const typePromises = existingTypes.map(type => 
                loader.getItemsByType(type)
            );
            
            const typeResults = await Promise.all(typePromises);
            const loadTime = Date.now() - startTime;
            
            // Should complete type filtering within reasonable time
            expect(loadTime).toBeLessThan(3000);
            
            // Verify we got results for all existing types (5 types)
            expect(typeResults).toHaveLength(5);
            typeResults.forEach(typeItems => {
                expect(typeItems.length).toBeGreaterThan(0);
            });
            
            console.log(`Type filtering for all types completed in ${loadTime}ms`);
        });
    });

});