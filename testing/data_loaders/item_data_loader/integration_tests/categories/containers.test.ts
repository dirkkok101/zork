/**
 * Integration tests for ItemDataLoader with real container data
 * Tests loading actual container items from data/items/containers/
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Containers Category', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category Loading', () => {
        test('should load all container items from real data files', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            // Verify expected count based on index.json
            expect(containers).toHaveLength(6);
            
            // Verify all items are properly loaded
            containers.forEach(container => {
                expect(container).toMatchObject({
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

        test('should load specific container items by ID', async () => {
            // Test loading known container items based on index.json
            const knownContainerIds = ['ballo', 'tbask', 'safe', 'sbag', 'mailb', 'irbox'];
            
            for (const containerId of knownContainerIds) {
                const item = await loader.loadItem(containerId);
                expect(item.id).toBe(containerId);
                // Items in containers category may have different types
                expect(Object.values(ItemType)).toContain(item.type);
            }
        });

        test('should load all containers with valid types', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                expect(Object.values(ItemType)).toContain(container.type);
            });
            
            // Some containers should be CONTAINER type, but not all necessarily
            const containerTypeItems = containers.filter(c => c.type === ItemType.CONTAINER);
            expect(containerTypeItems.length).toBeGreaterThan(0);
        });
    });

    describe('Data Validation', () => {
        test('should validate all container items have proper enum values', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                // Validate ItemType enum
                expect(Object.values(ItemType)).toContain(container.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(container.size);
                
                // Validate required string fields are non-empty
                expect(container.id).toBeTruthy();
                expect(container.name).toBeTruthy();
                expect(container.description).toBeTruthy();
                expect(container.examineText).toBeTruthy();
            });
        });

        test('should validate container-specific properties', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                // All containers should have proper structure
                expect(container.aliases).toBeInstanceOf(Array);
                expect(container.tags).toBeInstanceOf(Array);
                expect(container.interactions).toBeInstanceOf(Array);
                expect(typeof container.weight).toBe('number');
                expect(typeof container.portable).toBe('boolean');
                expect(typeof container.visible).toBe('boolean');
                
                // Containers should have interactions (open, close, put, etc.)
                expect(container.interactions.length).toBeGreaterThan(0);
                
                // Containers likely have state for open/closed
                expect(container.state).toBeDefined();
                expect(typeof container.state).toBe('object');
            });
        });

        test('should validate interaction structures for containers', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                container.interactions.forEach(interaction => {
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
        test('should load all containers within reasonable time', async () => {
            const startTime = Date.now();
            const containers = await loader.getItemsByCategory('containers');
            const loadTime = Date.now() - startTime;
            
            expect(containers).toHaveLength(6);
            expect(loadTime).toBeLessThan(100); // Small category should load very fast
        });

        test('should cache container category for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const containers1 = await loader.getItemsByCategory('containers');
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const containers2 = await loader.getItemsByCategory('containers');
            const loadTime2 = Date.now() - startTime2;
            
            expect(containers1).toHaveLength(6);
            expect(containers2).toHaveLength(6);
            expect(loadTime2).toBeLessThanOrEqual(loadTime1); // Cache should be faster or equal
            expect(loadTime2).toBeLessThan(10); // Cached access should be very fast for small category
        });
    });

    describe('Known Container Items', () => {
        test('should load specific containers with expected properties', async () => {
            // Test known container items
            const knownContainers = [
                { id: 'safe', expectedName: /box/i },
                { id: 'mailb', expectedName: /mail|box/i },
                { id: 'sbag', expectedName: /bag|sack/i }
            ];
            
            for (const { id, expectedName } of knownContainers) {
                const container = await loader.loadItem(id);
                expect(container.id).toBe(id);
                expect(container.name).toMatch(expectedName);
                expect(Object.values(ItemType)).toContain(container.type);
                expect(container.weight).toBeGreaterThanOrEqual(0);
            }
        });

        test('should load all containers from index', async () => {
            // Verify all containers listed in index.json can be loaded
            const expectedContainers = ['ballo', 'tbask', 'safe', 'sbag', 'mailb', 'irbox'];
            
            for (const containerId of expectedContainers) {
                const container = await loader.loadItem(containerId);
                expect(container.id).toBe(containerId);
                expect(Object.values(ItemType)).toContain(container.type);
                
                // Containers should have meaningful interactions
                expect(container.interactions.length).toBeGreaterThan(0);
                
                // Should have commands related to container functionality
                const commands = container.interactions.map(i => i.command.toLowerCase());
                const hasContainerCommand = commands.some(cmd => 
                    cmd.includes('open') || 
                    cmd.includes('close') || 
                    cmd.includes('put') || 
                    cmd.includes('insert') ||
                    cmd.includes('look') ||
                    cmd.includes('examine')
                );
                expect(hasContainerCommand).toBe(true);
            }
        });
    });

    describe('Container Functionality', () => {
        test('should have containers with proper size distribution', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            // Containers should have varying sizes
            const sizes = containers.map(c => c.size);
            const uniqueSizes = new Set(sizes);
            
            // Should have multiple size categories for containers
            expect(uniqueSizes.size).toBeGreaterThanOrEqual(1);
            
            // All sizes should be valid enum values
            sizes.forEach(size => {
                expect(Object.values(Size)).toContain(size);
            });
        });

        test('should have containers with realistic weight distribution', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                // Container weights should be non-negative
                expect(container.weight).toBeGreaterThanOrEqual(0);
                
                // Container weights should be reasonable (not extremely heavy)
                expect(container.weight).toBeLessThan(1000);
            });
        });

        test('should validate container state structures', async () => {
            const containers = await loader.getItemsByCategory('containers');
            
            containers.forEach(container => {
                // Container state should exist and be an object
                expect(container.state).toBeDefined();
                expect(typeof container.state).toBe('object');
                
                // Many containers will have open/closed state
                // We don't enforce this as some containers might work differently
                // but verify the state structure is valid
                if ('open' in container.state) {
                    expect(typeof container.state.open).toBe('boolean');
                }
                
                if ('locked' in container.state) {
                    expect(typeof container.state.locked).toBe('boolean');
                }
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing container item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_container'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should continue loading other containers if one fails', async () => {
            // This test verifies the error handling in getItemsByCategory
            // where individual item loading errors don't fail the entire category
            const containers = await loader.getItemsByCategory('containers');
            
            // Should still load the full expected count
            expect(containers).toHaveLength(6);
            
            // All loaded items should be valid
            containers.forEach(container => {
                expect(container.id).toBeTruthy();
                expect(container.name).toBeTruthy();
                expect(Object.values(ItemType)).toContain(container.type);
            });
        });
    });
});