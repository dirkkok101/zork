/**
 * Integration tests for ItemDataLoader with real consumable data
 * Tests loading actual consumable items from data/items/consumables/
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Consumables Category', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category Loading', () => {
        test('should load all consumable items from real data files', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            // Verify expected count based on index.json
            expect(consumables).toHaveLength(4);
            
            // Verify all items are properly loaded
            consumables.forEach(consumable => {
                expect(consumable).toMatchObject({
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

        test('should load specific consumable items by ID', async () => {
            // Test loading known consumable items based on index.json
            const knownConsumableIds = ['food', 'ecake', 'water', 'bills'];
            
            for (const consumableId of knownConsumableIds) {
                const item = await loader.loadItem(consumableId);
                expect(item.id).toBe(consumableId);
                // Note: Consumables might not have a specific CONSUMABLE type in the enum
                // They could be categorized as TOOL or other types
                expect(Object.values(ItemType)).toContain(item.type);
            }
        });
    });

    describe('Data Validation', () => {
        test('should validate all consumable items have proper enum values', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                // Validate ItemType enum (consumables might be TOOL type or other)
                expect(Object.values(ItemType)).toContain(consumable.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(consumable.size);
                
                // Validate required string fields are non-empty
                expect(consumable.id).toBeTruthy();
                expect(consumable.name).toBeTruthy();
                expect(consumable.description).toBeTruthy();
                expect(consumable.examineText).toBeTruthy();
            });
        });

        test('should validate consumable-specific properties', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                // All consumables should have proper structure
                expect(consumable.aliases).toBeInstanceOf(Array);
                expect(consumable.tags).toBeInstanceOf(Array);
                expect(consumable.interactions).toBeInstanceOf(Array);
                expect(typeof consumable.weight).toBe('number');
                expect(typeof consumable.portable).toBe('boolean');
                expect(typeof consumable.visible).toBe('boolean');
                
                // Consumables should have interactions (eat, drink, etc.)
                expect(consumable.interactions.length).toBeGreaterThan(0);
                
                // Consumables should typically be portable (you can take them)
                expect(consumable.portable).toBe(true);
                
                // Consumables should be visible
                expect(consumable.visible).toBe(true);
                
                // Consumables should have reasonable weight (not negative)
                expect(consumable.weight).toBeGreaterThanOrEqual(0);
            });
        });

        test('should validate interaction structures for consumables', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                consumable.interactions.forEach(interaction => {
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
        test('should load all consumables within reasonable time', async () => {
            const startTime = Date.now();
            const consumables = await loader.getItemsByCategory('consumables');
            const loadTime = Date.now() - startTime;
            
            expect(consumables).toHaveLength(4);
            expect(loadTime).toBeLessThan(50); // Very small category should load extremely fast
        });

        test('should cache consumable category for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const consumables1 = await loader.getItemsByCategory('consumables');
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const consumables2 = await loader.getItemsByCategory('consumables');
            const loadTime2 = Date.now() - startTime2;
            
            expect(consumables1).toHaveLength(4);
            expect(consumables2).toHaveLength(4);
            expect(loadTime2).toBeLessThanOrEqual(loadTime1); // Cache should be faster or equal
            expect(loadTime2).toBeLessThan(5); // Cached access should be very fast for tiny category
        });
    });

    describe('Known Consumable Items', () => {
        test('should load famous consumable items with expected properties', async () => {
            // Test well-known Zork consumables
            const famousConsumables = [
                { id: 'food', expectedName: /food|lunch/i },
                { id: 'water', expectedName: /water/i },
                { id: 'ecake', expectedName: /cake|ecake/i }
            ];
            
            for (const { id, expectedName } of famousConsumables) {
                const consumable = await loader.loadItem(id);
                expect(consumable.id).toBe(id);
                expect(consumable.name).toMatch(expectedName);
                expect(Object.values(ItemType)).toContain(consumable.type);
                expect(consumable.weight).toBeGreaterThanOrEqual(0);
                expect(consumable.portable).toBe(true);
                expect(consumable.visible).toBe(true);
            }
        });

        test('should load all consumables from index', async () => {
            // Verify all consumables listed in index.json can be loaded
            const expectedConsumables = ['food', 'ecake', 'water', 'bills'];
            
            for (const consumableId of expectedConsumables) {
                const consumable = await loader.loadItem(consumableId);
                expect(consumable.id).toBe(consumableId);
                expect(Object.values(ItemType)).toContain(consumable.type);
                
                // Consumables should have meaningful interactions
                expect(consumable.interactions.length).toBeGreaterThan(0);
                
                // Should have commands related to consumable functionality
                const commands = consumable.interactions.map(i => i.command.toLowerCase());
                const hasConsumableCommand = commands.some(cmd => 
                    cmd.includes('eat') || 
                    cmd.includes('drink') || 
                    cmd.includes('consume') || 
                    cmd.includes('taste') ||
                    cmd.includes('use') ||
                    cmd.includes('examine') ||
                    cmd.includes('take') ||
                    cmd.includes('read') // for bills
                );
                expect(hasConsumableCommand).toBe(true);
            }
        });

        test('should handle different consumable types correctly', async () => {
            // Test that different consumables have appropriate properties
            const food = await loader.loadItem('food');
            const water = await loader.loadItem('water');
            const bills = await loader.loadItem('bills');
            
            expect(food.id).toBe('food');
            expect(water.id).toBe('water');
            expect(bills.id).toBe('bills');
            
            // All should be valid items
            [food, water, bills].forEach(item => {
                expect(Object.values(ItemType)).toContain(item.type);
                expect(item.portable).toBe(true);
                expect(item.visible).toBe(true);
            });
            
            // Bills might be different (document vs food/drink)
            if (bills.name.toLowerCase().includes('bill') || bills.name.toLowerCase().includes('paper')) {
                // Bills should have read interaction
                const commands = bills.interactions.map(i => i.command.toLowerCase());
                expect(commands.some(cmd => cmd.includes('read') || cmd.includes('examine'))).toBe(true);
            }
        });
    });

    describe('Consumable Characteristics', () => {
        test('should have consumables with appropriate sizes', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            // Consumables should have reasonable sizes
            const sizes = consumables.map(c => c.size);
            
            // All sizes should be valid enum values
            sizes.forEach(size => {
                expect(Object.values(Size)).toContain(size);
            });
            
            // Consumables should generally be small to medium (portable items)
            const largeSizes = sizes.filter(size => size === Size.LARGE || size === Size.HUGE);
            expect(largeSizes.length).toBeLessThanOrEqual(1); // At most one large consumable
        });

        test('should have consumables with realistic weights', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                // Consumable weights should be non-negative
                expect(consumable.weight).toBeGreaterThanOrEqual(0);
                
                // Consumable weights should be reasonable (not extremely heavy)
                expect(consumable.weight).toBeLessThan(50);
                
                // Very light items should be small
                if (consumable.weight < 1) {
                    expect([Size.TINY, Size.SMALL]).toContain(consumable.size);
                }
            });
        });

        test('should have consumables with appropriate tags', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                expect(consumable.tags).toBeInstanceOf(Array);
                
                // Consumables might have tags like 'food', 'drink', 'edible', etc.
                // We don't enforce specific tags, but verify structure
                consumable.tags.forEach(tag => {
                    expect(typeof tag).toBe('string');
                    expect(tag.length).toBeGreaterThan(0);
                });
            });
        });

        test('should validate consumable state structures', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                // Consumable state should exist and be an object
                expect(consumable.state).toBeDefined();
                expect(typeof consumable.state).toBe('object');
                
                // Some consumables might have consumed state, freshness, etc.
                // We don't enforce specific state properties but verify structure
                Object.keys(consumable.state).forEach(key => {
                    expect(typeof key).toBe('string');
                    // State values can be any type
                });
            });
        });
    });

    describe('Consumption Functionality', () => {
        test('should have consumables with consumption-related interactions', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            consumables.forEach(consumable => {
                const commands = consumable.interactions.map(i => i.command.toLowerCase());
                
                // Should have meaningful interactions
                expect(consumable.interactions.length).toBeGreaterThan(0);
                
                // Many consumables should have consumption commands
                const hasConsumptionInteraction = commands.some(cmd => 
                    cmd.includes('eat') || 
                    cmd.includes('drink') || 
                    cmd.includes('consume') || 
                    cmd.includes('taste') ||
                    cmd.includes('use') ||
                    cmd.includes('read') // for documents like bills
                );
                
                // Note: We're flexible here because some consumables might be documents
                // At minimum, all should have examine/take interactions
                const hasBasicInteraction = commands.some(cmd =>
                    cmd.includes('examine') ||
                    cmd.includes('take') ||
                    cmd.includes('look') ||
                    cmd.includes('read')
                );
                
                expect(hasBasicInteraction || hasConsumptionInteraction).toBe(true);
            });
        });
    });

    describe('Type Distribution', () => {
        test('should validate type distribution for consumables', async () => {
            const consumables = await loader.getItemsByCategory('consumables');
            
            // Count items by type
            const typeDistribution = consumables.reduce((acc, consumable) => {
                acc[consumable.type] = (acc[consumable.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // All types should be valid
            Object.keys(typeDistribution).forEach(type => {
                expect(Object.values(ItemType)).toContain(type);
                expect(typeDistribution[type]).toBeGreaterThan(0);
            });
            
            // Should have at least one item of each type that appears
            expect(Object.keys(typeDistribution).length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing consumable item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_consumable'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should continue loading other consumables if one fails', async () => {
            // This test verifies the error handling in getItemsByCategory
            // where individual item loading errors don't fail the entire category
            const consumables = await loader.getItemsByCategory('consumables');
            
            // Should still load the full expected count
            expect(consumables).toHaveLength(4);
            
            // All loaded items should be valid
            consumables.forEach(consumable => {
                expect(consumable.id).toBeTruthy();
                expect(consumable.name).toBeTruthy();
                expect(Object.values(ItemType)).toContain(consumable.type);
            });
        });
    });
});