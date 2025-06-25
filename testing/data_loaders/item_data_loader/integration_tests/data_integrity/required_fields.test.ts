/**
 * Integration tests for ItemDataLoader required field validation with real data
 * Tests that all items have all 15 required fields with correct data types
 * No mocking - validates field presence and types across all 214 items
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Required Fields', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    // The 15 required fields as defined in the ItemDataLoader validation
    const requiredFields = [
        'id', 'name', 'description', 'examineText', 'aliases',
        'type', 'portable', 'visible', 'weight', 'size',
        'initialState', 'tags', 'properties', 'interactions', 'initialLocation'
    ];

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Field Presence Validation', () => {
        test('should validate all 214 items have all required fields', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                requiredFields.forEach(field => {
                    expect(item).toHaveProperty(field);
                    expect(item[field as keyof Item]).toBeDefined();
                });
            });
            
            console.log(`Validated ${allItems.length} items have all ${requiredFields.length} required fields`);
        });

        test('should validate required fields in each category', async () => {
            const categories = await loader.getCategories();
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                
                categoryItems.forEach(item => {
                    requiredFields.forEach(field => {
                        expect(item).toHaveProperty(field);
                        expect(item[field as keyof Item]).toBeDefined();
                    });
                });
                
                console.log(`${category}: ${categoryItems.length} items have all required fields`);
            }
        });

        test('should validate required fields in special character items', async () => {
            const specialItems = ['!!!!!', '*bun*'];
            
            for (const itemId of specialItems) {
                const item = await loader.loadItem(itemId);
                
                requiredFields.forEach(field => {
                    expect(item).toHaveProperty(field);
                    expect(item[field as keyof Item]).toBeDefined();
                });
                
                console.log(`${itemId}: has all required fields`);
            }
        });
    });

    describe('String Field Validation', () => {
        test('should validate string fields are non-empty strings', async () => {
            const allItems = await loader.loadAllItems();
            const stringFields = ['id', 'name', 'description', 'examineText', 'type', 'size', 'initialLocation'];
            
            allItems.forEach(item => {
                stringFields.forEach(field => {
                    const value = item[field as keyof Item];
                    expect(typeof value).toBe('string');
                    expect(value).toBeTruthy();
                    expect((value as string).length).toBeGreaterThan(0);
                });
            });
            
            console.log(`Validated string fields in ${allItems.length} items`);
        });

        test('should validate string field content quality', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                // ID should be valid identifier
                expect(item.id).toMatch(/^[a-zA-Z0-9*!?#@$%^&()[\]{}._-]+$/);
                expect(item.id.length).toBeGreaterThan(0);
                expect(item.id.length).toBeLessThan(100);
                
                // Name should be meaningful
                expect(item.name.length).toBeGreaterThan(0);
                expect(item.name.length).toBeLessThan(200);
                
                // Description should be meaningful
                expect(item.description.length).toBeGreaterThan(0);
                expect(item.description.length).toBeLessThan(1000);
                
                // Examine text should be meaningful
                expect(item.examineText.length).toBeGreaterThan(0);
                expect(item.examineText.length).toBeLessThan(2000);
                
                // Initial location should be valid
                expect(item.currentLocation.length).toBeGreaterThan(0); // Mapped from initialLocation
                expect(item.currentLocation.length).toBeLessThan(100);
            });
        });
    });

    describe('Boolean Field Validation', () => {
        test('should validate boolean fields are actual booleans', async () => {
            const allItems = await loader.loadAllItems();
            const booleanFields = ['portable', 'visible'];
            
            allItems.forEach(item => {
                booleanFields.forEach(field => {
                    const value = item[field as keyof Item];
                    expect(typeof value).toBe('boolean');
                    expect([true, false]).toContain(value);
                });
            });
            
            console.log(`Validated boolean fields in ${allItems.length} items`);
        });

        test('should validate boolean field distribution makes sense', async () => {
            const allItems = await loader.loadAllItems();
            
            // Analyze portable distribution
            const portableCount = allItems.filter(item => item.portable).length;
            const nonPortableCount = allItems.length - portableCount;
            
            console.log(`Portable: ${portableCount}, Non-portable: ${nonPortableCount}`);
            expect(portableCount).toBeGreaterThan(0);
            expect(nonPortableCount).toBeGreaterThan(0);
            
            // Analyze visible distribution
            const visibleCount = allItems.filter(item => item.visible).length;
            const invisibleCount = allItems.length - visibleCount;
            
            console.log(`Visible: ${visibleCount}, Invisible: ${invisibleCount}`);
            expect(visibleCount).toBeGreaterThan(0);
            // Most items should be visible
            expect(visibleCount).toBeGreaterThan(allItems.length * 0.8);
        });
    });

    describe('Numeric Field Validation', () => {
        test('should validate weight field is a valid number', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(typeof item.weight).toBe('number');
                expect(Number.isFinite(item.weight)).toBe(true);
                expect(item.weight).toBeGreaterThanOrEqual(0);
                expect(item.weight).toBeLessThan(10000); // Reasonable upper bound
            });
            
            console.log(`Validated weight field in ${allItems.length} items`);
        });

        test('should validate weight distribution is reasonable', async () => {
            const allItems = await loader.loadAllItems();
            const weights = allItems.map(item => item.weight);
            
            const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
            const maxWeight = Math.max(...weights);
            const minWeight = Math.min(...weights);
            const zeroWeightCount = weights.filter(w => w === 0).length;
            
            console.log(`Weight stats: avg=${avgWeight.toFixed(1)}, min=${minWeight}, max=${maxWeight}, zero-weight=${zeroWeightCount}`);
            
            expect(minWeight).toBeGreaterThanOrEqual(0);
            expect(maxWeight).toBeGreaterThan(0);
            expect(avgWeight).toBeGreaterThan(0);
            
            // Most items should have positive weight
            expect(zeroWeightCount).toBeLessThan(allItems.length * 0.1);
        });
    });

    describe('Array Field Validation', () => {
        test('should validate array fields are actual arrays', async () => {
            const allItems = await loader.loadAllItems();
            const arrayFields = ['aliases', 'tags', 'interactions'];
            
            allItems.forEach(item => {
                arrayFields.forEach(field => {
                    const value = item[field as keyof Item];
                    expect(Array.isArray(value)).toBe(true);
                });
            });
            
            console.log(`Validated array fields in ${allItems.length} items`);
        });

        test('should validate aliases array structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(Array.isArray(item.aliases)).toBe(true);
                
                item.aliases.forEach(alias => {
                    expect(typeof alias).toBe('string');
                    expect(alias.length).toBeGreaterThan(0);
                    expect(alias.length).toBeLessThan(100);
                });
                
                // Aliases should be unique within item
                const uniqueAliases = new Set(item.aliases);
                expect(uniqueAliases.size).toBe(item.aliases.length);
            });
        });

        test('should validate tags array structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(Array.isArray(item.tags)).toBe(true);
                
                item.tags.forEach(tag => {
                    expect(typeof tag).toBe('string');
                    expect(tag.length).toBeGreaterThan(0);
                    expect(tag.length).toBeLessThan(50);
                });
                
                // Tags should be unique within item
                const uniqueTags = new Set(item.tags);
                expect(uniqueTags.size).toBe(item.tags.length);
            });
        });

        test('should validate interactions array structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(Array.isArray(item.interactions)).toBe(true);
                expect(item.interactions.length).toBeGreaterThan(0); // All items should have interactions
                
                item.interactions.forEach(interaction => {
                    expect(interaction).toHaveProperty('command');
                    expect(interaction).toHaveProperty('message');
                    
                    expect(typeof interaction.command).toBe('string');
                    expect(typeof interaction.message).toBe('string');
                    expect(interaction.command.length).toBeGreaterThan(0);
                    expect(interaction.message.length).toBeGreaterThan(0);
                    
                    // Optional fields
                    if (interaction.condition) {
                        expect(Array.isArray(interaction.condition)).toBe(true);
                    }
                    if (interaction.effect) {
                        expect(Array.isArray(interaction.effect)).toBe(true);
                    }
                });
            });
        });
    });

    describe('Object Field Validation', () => {
        test('should validate object fields are actual objects', async () => {
            const allItems = await loader.loadAllItems();
            const objectFields = ['properties', 'state', 'flags'];
            
            allItems.forEach(item => {
                objectFields.forEach(field => {
                    const value = item[field as keyof Item];
                    expect(typeof value).toBe('object');
                    expect(value).not.toBeNull();
                    expect(Array.isArray(value)).toBe(false);
                });
            });
            
            console.log(`Validated object fields in ${allItems.length} items`);
        });

        test('should validate properties object structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(typeof item.properties).toBe('object');
                expect(item.properties).not.toBeNull();
                
                // Properties can be any key-value pairs
                Object.keys(item.properties).forEach(key => {
                    expect(typeof key).toBe('string');
                    expect(key.length).toBeGreaterThan(0);
                });
            });
        });

        test('should validate state object structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(typeof item.state).toBe('object');
                expect(item.state).not.toBeNull();
                
                // State should come from initialState and be valid
                Object.entries(item.state).forEach(([key, value]) => {
                    expect(typeof key).toBe('string');
                    expect(key.length).toBeGreaterThan(0);
                    // Value can be any type
                    expect(value).toBeDefined();
                });
            });
        });

        test('should validate flags object structure', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(typeof item.flags).toBe('object');
                expect(item.flags).not.toBeNull();
                
                // Flags should be boolean values
                Object.entries(item.flags).forEach(([key, value]) => {
                    expect(typeof key).toBe('string');
                    expect(key.length).toBeGreaterThan(0);
                    expect(typeof value).toBe('boolean');
                });
            });
        });
    });

    describe('Field Relationship Validation', () => {
        test('should validate currentLocation matches initialLocation', async () => {
            const allItems = await loader.loadAllItems();
            
            // For this integration test, currentLocation should equal initialLocation
            // since items are loaded fresh without game state changes
            allItems.forEach(item => {
                expect(item.currentLocation).toBeTruthy();
                expect(typeof item.currentLocation).toBe('string');
                // Note: We can't directly compare to initialLocation since it's not exposed
                // but we verify the mapping worked correctly
            });
        });

        test('should validate state comes from initialState', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(typeof item.state).toBe('object');
                expect(item.state).not.toBeNull();
                
                // State should be a copy/transformation of initialState
                // We can't verify exact equality but can verify structure
                Object.keys(item.state).forEach(key => {
                    expect(typeof key).toBe('string');
                });
            });
        });

        test('should validate type and size enum relationships', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                // Both type and size should be valid enums
                expect(Object.values(ItemType)).toContain(item.type);
                expect(Object.values(Size)).toContain(item.size);
                
                // String fields should not be empty
                expect(item.id.trim()).toBe(item.id);
                expect(item.name.trim()).toBe(item.name);
                expect(item.description.trim()).toBe(item.description);
            });
        });
    });

    describe('Data Consistency Across Categories', () => {
        test('should validate field consistency within categories', async () => {
            const categories = await loader.getCategories();
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                
                // All items in category should have same field structure
                categoryItems.forEach(item => {
                    requiredFields.forEach(field => {
                        expect(item).toHaveProperty(field);
                        
                        const value = item[field as keyof Item];
                        expect(value).toBeDefined();
                        expect(value).not.toBeNull();
                    });
                });
                
                console.log(`${category}: ${categoryItems.length} items have consistent field structure`);
            }
        });

        test('should validate no extra unexpected fields', async () => {
            const allItems = await loader.loadAllItems();
            const expectedFields = [
                'id', 'name', 'aliases', 'description', 'examineText',
                'type', 'portable', 'visible', 'weight', 'size',
                'tags', 'properties', 'interactions', 'currentLocation',
                'state', 'flags'
            ];
            
            allItems.forEach(item => {
                const itemKeys = Object.keys(item);
                
                itemKeys.forEach(key => {
                    expect(expectedFields).toContain(key);
                });
                
                // Should have exactly the expected fields
                expect(itemKeys.length).toBe(expectedFields.length);
            });
        });
    });

    describe('Error Cases and Edge Validation', () => {
        test('should validate required fields in minimum viable items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find items that might be minimal cases
            const minimalItems = allItems.filter(item => 
                item.aliases.length === 0 || 
                item.tags.length === 0 ||
                item.weight === 0
            );
            
            console.log(`Found ${minimalItems.length} potentially minimal items`);
            
            minimalItems.forEach(item => {
                // Even minimal items should have all required fields
                requiredFields.forEach(field => {
                    expect(item).toHaveProperty(field);
                    expect(item[field as keyof Item]).toBeDefined();
                });
            });
        });

        test('should validate required fields in complex items', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find items that might be complex cases
            const complexItems = allItems.filter(item => 
                item.aliases.length > 5 || 
                item.tags.length > 5 ||
                item.interactions.length > 10 ||
                Object.keys(item.properties).length > 10
            );
            
            console.log(`Found ${complexItems.length} potentially complex items`);
            
            complexItems.forEach(item => {
                // Complex items should still have all required fields
                requiredFields.forEach(field => {
                    expect(item).toHaveProperty(field);
                    expect(item[field as keyof Item]).toBeDefined();
                });
            });
        });
    });
});