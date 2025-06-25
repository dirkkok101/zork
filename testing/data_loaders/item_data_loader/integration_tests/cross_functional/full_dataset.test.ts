/**
 * Integration tests for ItemDataLoader with complete dataset
 * Tests loading all 214 items from all categories
 * No mocking - tests real file system operations and full dataset validation
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Full Dataset', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Complete Dataset Loading', () => {
        test('should load all 214 items from all categories', async () => {
            const allItems = await loader.loadAllItems();
            
            // Verify total count matches index.json
            expect(allItems).toHaveLength(214);
            
            // Verify all items are properly loaded
            allItems.forEach(item => {
                expect(item).toMatchObject({
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

        test('should verify total count matches getTotalCount()', async () => {
            const totalCount = await loader.getTotalCount();
            const allItems = await loader.loadAllItems();
            
            expect(totalCount).toBe(214);
            expect(allItems).toHaveLength(totalCount);
        });

        test('should load items from all expected categories', async () => {
            const allItems = await loader.loadAllItems();
            const categories = await loader.getCategories();
            
            // Verify we have the expected 5 categories
            expect(categories).toHaveLength(5);
            expect(categories).toContain('treasures');
            expect(categories).toContain('tools');
            expect(categories).toContain('containers');
            expect(categories).toContain('weapons');
            expect(categories).toContain('consumables');
            
            // Verify items exist for each category
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                expect(categoryItems.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Dataset Integrity', () => {
        test('should have unique item IDs across all categories', async () => {
            const allItems = await loader.loadAllItems();
            const itemIds = allItems.map(item => item.id);
            const uniqueIds = new Set(itemIds);
            
            expect(uniqueIds.size).toBe(itemIds.length);
            expect(uniqueIds.size).toBe(214);
        });

        test('should validate all items have proper enum values', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                // Validate ItemType enum
                expect(Object.values(ItemType)).toContain(item.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(item.size);
                
                // Validate required fields
                expect(item.id).toBeTruthy();
                expect(item.name).toBeTruthy();
                expect(item.description).toBeTruthy();
                expect(item.examineText).toBeTruthy();
            });
        });

        test('should validate item distribution across types', async () => {
            const allItems = await loader.loadAllItems();
            
            // Count items by type
            const typeDistribution = allItems.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Verify we have items of all types
            expect(typeDistribution[ItemType.TREASURE]).toBeGreaterThan(0);
            expect(typeDistribution[ItemType.TOOL]).toBeGreaterThan(0);
            expect(typeDistribution[ItemType.CONTAINER]).toBeGreaterThan(0);
            expect(typeDistribution[ItemType.WEAPON]).toBeGreaterThan(0);
            
            // Verify reasonable distribution (treasures should be most numerous)
            expect(typeDistribution[ItemType.TREASURE]).toBeGreaterThan(50);
            
            console.log('Type distribution:', typeDistribution);
        });

        test('should validate item distribution across sizes', async () => {
            const allItems = await loader.loadAllItems();
            
            // Count items by size
            const sizeDistribution = allItems.reduce((acc, item) => {
                acc[item.size] = (acc[item.size] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Should have items of multiple sizes
            const sizeCount = Object.keys(sizeDistribution).length;
            expect(sizeCount).toBeGreaterThan(2);
            
            // Verify all sizes are valid
            Object.keys(sizeDistribution).forEach(size => {
                expect(Object.values(Size)).toContain(size);
            });
            
            console.log('Size distribution:', sizeDistribution);
        });
    });

    describe('Performance with Full Dataset', () => {
        test('should load all items within performance threshold', async () => {
            const startTime = Date.now();
            const allItems = await loader.loadAllItems();
            const loadTime = Date.now() - startTime;
            
            expect(allItems).toHaveLength(214);
            expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
            
            console.log(`Loaded 214 items in ${loadTime}ms`);
        });

        test('should cache full dataset for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const allItems1 = await loader.loadAllItems();
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const allItems2 = await loader.loadAllItems();
            const loadTime2 = Date.now() - startTime2;
            
            expect(allItems1).toHaveLength(214);
            expect(allItems2).toHaveLength(214);
            expect(loadTime2).toBeLessThan(loadTime1);
            expect(loadTime2).toBeLessThan(100); // Cached should be very fast
            
            // Verify same data
            expect(allItems1).toEqual(allItems2);
            
            console.log(`First load: ${loadTime1}ms, Cached load: ${loadTime2}ms`);
        });
    });

    describe('Cross-Category Analysis', () => {
        test('should verify category totals sum to total count', async () => {
            const categories = await loader.getCategories();
            let totalItemsFromCategories = 0;
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                totalItemsFromCategories += categoryItems.length;
            }
            
            const allItems = await loader.loadAllItems();
            expect(totalItemsFromCategories).toBe(allItems.length);
            expect(totalItemsFromCategories).toBe(214);
        });

        test('should validate no items appear in multiple categories', async () => {
            const categories = await loader.getCategories();
            const allItemIds = new Set<string>();
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                
                categoryItems.forEach(item => {
                    expect(allItemIds.has(item.id)).toBe(false);
                    allItemIds.add(item.id);
                });
            }
            
            expect(allItemIds.size).toBe(214);
        });

        test('should handle special character items across dataset', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find special character items
            const specialItems = allItems.filter(item => 
                item.id.includes('!') || 
                item.id.includes('*') || 
                item.id.includes('?') ||
                item.id.includes('#')
            );
            
            expect(specialItems.length).toBeGreaterThan(0);
            
            // Verify special items are properly loaded
            specialItems.forEach(item => {
                expect(item.name).toBeTruthy();
                expect(item.description).toBeTruthy();
                expect(Object.values(ItemType)).toContain(item.type);
            });
            
            console.log('Special character items found:', specialItems.map(i => i.id));
        });
    });

    describe('Data Quality Validation', () => {
        test('should validate all items have interactions', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(item.interactions).toBeInstanceOf(Array);
                expect(item.interactions.length).toBeGreaterThan(0);
                
                item.interactions.forEach(interaction => {
                    expect(interaction.command).toBeTruthy();
                    expect(interaction.message).toBeTruthy();
                });
            });
        });

        test('should validate weight and size consistency', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                // Weight should be non-negative
                expect(item.weight).toBeGreaterThanOrEqual(0);
                
                // Size and weight should have some correlation
                if (item.size === Size.HUGE) {
                    expect(item.weight).toBeGreaterThan(0);
                }
                
                if (item.weight > 50) {
                    expect([Size.LARGE, Size.HUGE]).toContain(item.size);
                }
            });
        });

        test('should validate portable items are typically smaller and lighter', async () => {
            const allItems = await loader.loadAllItems();
            const portableItems = allItems.filter(item => item.portable);
            const nonPortableItems = allItems.filter(item => !item.portable);
            
            expect(portableItems.length).toBeGreaterThan(0);
            expect(nonPortableItems.length).toBeGreaterThan(0);
            
            // Portable items should generally be lighter
            const avgPortableWeight = portableItems.reduce((sum, item) => sum + item.weight, 0) / portableItems.length;
            const avgNonPortableWeight = nonPortableItems.reduce((sum, item) => sum + item.weight, 0) / nonPortableItems.length;
            
            console.log(`Average portable weight: ${avgPortableWeight}, non-portable: ${avgNonPortableWeight}`);
            
            // This is a tendency, not a strict rule
            expect(avgPortableWeight).toBeLessThan(avgNonPortableWeight * 2);
        });
    });

    describe('Memory Usage', () => {
        test('should handle full dataset within reasonable memory limits', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Load full dataset
            const allItems = await loader.loadAllItems();
            expect(allItems).toHaveLength(214);
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 50MB for this dataset)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
            
            console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        });
    });

    describe('Error Resilience', () => {
        test('should handle loading all items even if some individual loads might have issues', async () => {
            // This test ensures robustness of the full dataset loading
            const allItems = await loader.loadAllItems();
            
            // Should load exactly 214 items
            expect(allItems).toHaveLength(214);
            
            // All loaded items should be valid
            allItems.forEach(item => {
                expect(item.id).toBeTruthy();
                expect(item.name).toBeTruthy();
                expect(Object.values(ItemType)).toContain(item.type);
                expect(Object.values(Size)).toContain(item.size);
            });
        });
    });
});