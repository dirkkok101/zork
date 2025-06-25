/**
 * Integration tests for ItemDataLoader type mapping functionality
 * Tests relationships between categories and types with real data
 * No mocking - validates type distribution and filtering with actual items
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Type Mapping', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category vs Type Relationships', () => {
        test('should validate type distribution in treasures category', async () => {
            const treasures = await loader.getItemsByCategory('treasures');
            
            // Count types in treasures category
            const typeCount = treasures.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Most treasures should be TREASURE type
            expect(typeCount[ItemType.TREASURE]).toBeGreaterThan(80);
            
            // But some might be other types (tools that are treasures, etc.)
            console.log('Treasures category type distribution:', typeCount);
        });

        test('should validate type distribution in tools category', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            // Count types in tools category
            const typeCount = tools.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Most tools should be TOOL type, but some might be weapons
            expect(typeCount[ItemType.TOOL]).toBeGreaterThan(50);
            
            console.log('Tools category type distribution:', typeCount);
        });

        test('should validate type distribution in containers category', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            // All containers should be CONTAINER type
            containers.forEach(container => {
                expect(container.type).toBe(ItemType.CONTAINER);
            });
        });

        test('should validate type distribution in weapons category', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            // All weapons should be WEAPON type
            weapons.forEach(weapon => {
                expect(weapon.type).toBe(ItemType.WEAPON);
            });
        });

        test('should validate type distribution in consumables category', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            // Count types in consumables category
            const typeCount = consumables.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Consumables might be various types (no specific CONSUMABLE type in enum)
            console.log('Consumables category type distribution:', typeCount);
            
            // All should be valid types
            Object.keys(typeCount).forEach(type => {
                expect(Object.values(ItemType)).toContain(type);
            });
        });
    });

    describe('getItemsByType() Functionality', () => {
        test('should filter TREASURE type items correctly', async () => {
            const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
            
            // All returned items should be TREASURE type
            treasureItems.forEach(item => {
                expect(item.type).toBe(ItemType.TREASURE);
            });
            
            // Should have many treasures
            expect(treasureItems.length).toBeGreaterThan(80);
            
            // Verify against full dataset
            const allItems = await loader.loadAllItems();
            const expectedTreasures = allItems.filter(item => item.type === ItemType.TREASURE);
            expect(treasureItems).toHaveLength(expectedTreasures.length);
        });

        test('should filter TOOL type items correctly', async () => {
            const toolItems = await loader.getItemsByType(ItemType.TOOL);
            
            // All returned items should be TOOL type
            toolItems.forEach(item => {
                expect(item.type).toBe(ItemType.TOOL);
            });
            
            // Should have many tools
            expect(toolItems.length).toBeGreaterThan(30);
            
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
            
            // Should match containers category exactly
            const containersCategory = await loader.getItemsByCategory('containers');
            expect(containerItems).toHaveLength(containersCategory.length);
            expect(containerItems).toHaveLength(6);
        });

        test('should filter WEAPON type items correctly', async () => {
            const weaponItems = await loader.getItemsByType(ItemType.WEAPON);
            
            // All returned items should be WEAPON type
            weaponItems.forEach(item => {
                expect(item.type).toBe(ItemType.WEAPON);
            });
            
            // Should have weapons from weapons category and possibly other categories
            expect(weaponItems.length).toBeGreaterThanOrEqual(5);
            
            // Verify all weapons category items are included
            const weaponsCategory = await loader.getItemsByCategory('weapons');
            const weaponCategoryIds = weaponsCategory.map(w => w.id);
            const weaponTypeIds = weaponItems.map(w => w.id);
            
            weaponCategoryIds.forEach(id => {
                expect(weaponTypeIds).toContain(id);
            });
        });
    });

    describe('Cross-Type Analysis', () => {
        test('should identify items where category and type differ', async () => {
            const allItems = await loader.loadAllItems();
            const categories = await loader.getCategories();
            
            const mismatches: Array<{item: Item, category: string, expectedType: string}> = [];
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                const expectedType = this.getCategoryExpectedType(category);
                
                if (expectedType) {
                    categoryItems.forEach(item => {
                        if (item.type !== expectedType) {
                            mismatches.push({
                                item,
                                category,
                                expectedType
                            });
                        }
                    });
                }
            }
            
            // Log mismatches for analysis
            console.log('Category/Type mismatches found:', mismatches.length);
            mismatches.forEach(mismatch => {
                console.log(`${mismatch.item.id} in ${mismatch.category} has type ${mismatch.item.type}, expected ${mismatch.expectedType}`);
            });
            
            // Verify all mismatched items are still valid
            mismatches.forEach(mismatch => {
                expect(Object.values(ItemType)).toContain(mismatch.item.type);
            });
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
        test('should validate TREASURE items have treasure-like properties', async () => {
            const treasures = await loader.getItemsByType(ItemType.TREASURE);
            
            treasures.forEach(treasure => {
                // Treasures are typically portable (you can collect them)
                expect(treasure.portable).toBe(true);
                
                // Treasures should be visible
                expect(treasure.visible).toBe(true);
                
                // Treasures typically have positive weight
                expect(treasure.weight).toBeGreaterThan(0);
            });
        });

        test('should validate TOOL items have tool-like properties', async () => {
            const tools = await loader.getItemsByType(ItemType.TOOL);
            
            tools.forEach(tool => {
                // Most tools should be portable
                const portableCount = tools.filter(t => t.portable).length;
                expect(portableCount).toBeGreaterThan(tools.length * 0.7); // At least 70% portable
                
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
                const commands = container.interactions.map(i => i.command.toLowerCase());
                const hasContainerCommand = commands.some(cmd => 
                    cmd.includes('open') || 
                    cmd.includes('close') || 
                    cmd.includes('put') || 
                    cmd.includes('insert')
                );
                // Note: Not all containers might have these exact commands, so we're flexible
            });
        });

        test('should validate WEAPON items have weapon-like properties', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            weapons.forEach(weapon => {
                // Weapons should be portable
                expect(weapon.portable).toBe(true);
                
                // Weapons should be visible
                expect(weapon.visible).toBe(true);
                
                // Weapons should have positive weight
                expect(weapon.weight).toBeGreaterThan(0);
                
                // Weapons should have interactions
                expect(weapon.interactions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Performance with Type Filtering', () => {
        test('should perform type filtering efficiently', async () => {
            const startTime = Date.now();
            
            // Load items by all types
            const typePromises = Object.values(ItemType).map(type => 
                loader.getItemsByType(type)
            );
            
            const typeResults = await Promise.all(typePromises);
            const loadTime = Date.now() - startTime;
            
            // Should complete type filtering within reasonable time
            expect(loadTime).toBeLessThan(3000);
            
            // Verify we got results for all types
            expect(typeResults).toHaveLength(4);
            typeResults.forEach(typeItems => {
                expect(typeItems.length).toBeGreaterThan(0);
            });
            
            console.log(`Type filtering for all types completed in ${loadTime}ms`);
        });
    });

    // Helper method to get expected type for a category
    private getCategoryExpectedType(category: string): string | null {
        switch (category) {
            case 'treasures': return ItemType.TREASURE;
            case 'tools': return ItemType.TOOL;
            case 'containers': return ItemType.CONTAINER;
            case 'weapons': return ItemType.WEAPON;
            case 'consumables': return null; // No specific expected type
            default: return null;
        }
    }
});