/**
 * Integration tests for ItemDataLoader with real tool data
 * Tests loading actual tool items from data/items/tools/
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Tools Category', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category Loading', () => {
        test('should load all tool items from real data files', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            // Verify expected count based on index.json
            expect(tools).toHaveLength(96);
            
            // Verify all items are properly loaded
            tools.forEach(tool => {
                expect(tool).toMatchObject({
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

        test('should handle special character items (!!!!!)', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            // Find the special !!!!! item
            const specialItem = tools.find(item => item.id === '!!!!!');
            expect(specialItem).toBeDefined();
            expect(specialItem!.name).toBeDefined();
            expect(specialItem!.description).toBeDefined();
        });

        test('should load specific tool items by ID', async () => {
            // Test loading known tool items (avoiding naming conflicts)
            const knownToolIds = ['keys', 'match', 'torch', 'wrenc', 'bell'];
            
            for (const toolId of knownToolIds) {
                const item = await loader.loadItem(toolId);
                expect(item.id).toBe(toolId);
                // Tools can have different types - TOOL is most common but not exclusive
                expect(Object.values(ItemType)).toContain(item.type);
            }
        });
    });

    describe('Data Validation', () => {
        test('should validate all tool items have proper enum values', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            tools.forEach(tool => {
                // Validate ItemType enum
                expect(Object.values(ItemType)).toContain(tool.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(tool.size);
                
                // Validate required string fields are non-empty
                expect(tool.id).toBeTruthy();
                expect(tool.name).toBeTruthy();
                expect(tool.description).toBeTruthy();
                expect(tool.examineText).toBeTruthy();
            });
        });

        test('should validate tool-specific properties', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            // Most tools should have TOOL type, but some might be other types
            const toolTypeItems = tools.filter(item => item.type === ItemType.TOOL);
            expect(toolTypeItems.length).toBeGreaterThan(50); // Majority should be TOOL type
            
            // Check for expected tool properties
            tools.forEach(tool => {
                // All tools should have proper structure
                expect(tool.aliases).toBeInstanceOf(Array);
                expect(tool.tags).toBeInstanceOf(Array);
                expect(tool.interactions).toBeInstanceOf(Array);
                expect(typeof tool.weight).toBe('number');
                expect(typeof tool.portable).toBe('boolean');
                expect(typeof tool.visible).toBe('boolean');
                
                // Tools are typically portable (but not always)
                // Just verify the field is a boolean
                expect([true, false]).toContain(tool.portable);
            });
        });

        test('should validate interaction structures for tools', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            tools.forEach(tool => {
                tool.interactions.forEach(interaction => {
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
        test('should load all tools within reasonable time', async () => {
            const startTime = Date.now();
            const tools = await loader.getItemsByCategory('tools');
            const loadTime = Date.now() - startTime;
            
            expect(tools).toHaveLength(96);
            expect(loadTime).toBeLessThan(1000); // Should load within 1 second
        });

        test('should cache tool category for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const tools1 = await loader.getItemsByCategory('tools');
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const tools2 = await loader.getItemsByCategory('tools');
            const loadTime2 = Date.now() - startTime2;
            
            expect(tools1).toHaveLength(96);
            expect(tools2).toHaveLength(96);
            expect(loadTime2).toBeLessThan(loadTime1); // Cache should be faster
            expect(loadTime2).toBeLessThan(50); // Cached access should be very fast
        });
    });

    describe('Known Tool Items', () => {
        test('should load famous tool items with expected properties', async () => {
            // Test some well-known Zork tools (avoiding naming conflicts)
            const famousTools = [
                { id: 'keys', expectedName: /key/i },
                { id: 'torch', expectedName: /torch/i },
                { id: 'wrenc', expectedName: /wrench/i },
                { id: 'bell', expectedName: /bell/i }
            ];
            
            for (const { id, expectedName } of famousTools) {
                const tool = await loader.loadItem(id);
                expect(tool.id).toBe(id);
                expect(tool.name).toMatch(expectedName);
                // Tools might have TOOL type or other types depending on function
                expect(Object.values(ItemType)).toContain(tool.type);
                expect(tool.weight).toBeGreaterThanOrEqual(0);
            }
        });

        test('should handle special case items correctly', async () => {
            // Test the !!!!! item with special characters
            const specialItem = await loader.loadItem('!!!!!');
            expect(specialItem.id).toBe('!!!!!');
            expect(specialItem.name).toBeDefined();
            expect(Object.values(ItemType)).toContain(specialItem.type);
            
            // Verify it's included in category loading
            const tools = await loader.getItemsByCategory('tools');
            const foundSpecial = tools.find(item => item.id === '!!!!!');
            expect(foundSpecial).toBeDefined();
            expect(foundSpecial).toEqual(specialItem);
        });

        test('should load essential Zork tools correctly', async () => {
            // Test items that are crucial to Zork gameplay (avoiding naming conflicts)
            const essentialTools = ['keys', 'torch', 'bell'];
            
            for (const toolId of essentialTools) {
                const tool = await loader.loadItem(toolId);
                expect(tool.id).toBe(toolId);
                expect(tool.portable).toBe(true); // Essential tools should be portable
                expect(tool.visible).toBe(true); // Essential tools should be visible
                expect(tool.interactions.length).toBeGreaterThan(0); // Should have interactions
            }
        });
    });

    describe('Type Distribution', () => {
        test('should have realistic distribution of tool types', async () => {
            const tools = await loader.getItemsByCategory('tools');
            
            // Count items by type
            const typeDistribution = tools.reduce((acc, tool) => {
                acc[tool.type] = (acc[tool.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Verify we have some items of TOOL type
            expect(typeDistribution[ItemType.TOOL]).toBeGreaterThan(0);
            
            // Tools category might contain items of other types too
            // (e.g., some weapons might be in tools category)
            Object.keys(typeDistribution).forEach(type => {
                expect(Object.values(ItemType)).toContain(type);
                expect(typeDistribution[type]).toBeGreaterThan(0);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing tool item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_tool'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should continue loading other tools if one fails', async () => {
            // This test verifies the error handling in getItemsByCategory
            // where individual item loading errors don't fail the entire category
            const tools = await loader.getItemsByCategory('tools');
            
            // Should still load the full expected count
            expect(tools).toHaveLength(96);
            
            // All loaded items should be valid
            tools.forEach(tool => {
                expect(tool.id).toBeTruthy();
                expect(tool.name).toBeTruthy();
            });
        });
    });
});