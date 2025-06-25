/**
 * Integration tests for ItemDataLoader performance with real data
 * Tests actual loading times and memory usage with 214 items
 * No mocking - measures real-world performance characteristics
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Performance', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Single Item Loading Performance', () => {
        test('should load individual items within 10ms after cache warm-up', async () => {
            // Warm up the cache
            await loader.loadItem('lamp');
            
            // Test multiple individual loads
            const testItems = ['sword', 'coin', 'rope', 'safe', 'food'];
            const loadTimes: number[] = [];
            
            for (const itemId of testItems) {
                const startTime = Date.now();
                const item = await loader.loadItem(itemId);
                const loadTime = Date.now() - startTime;
                
                expect(item.id).toBe(itemId);
                expect(loadTime).toBeLessThan(10);
                loadTimes.push(loadTime);
            }
            
            const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
            console.log(`Average single item load time: ${avgLoadTime.toFixed(2)}ms`);
            expect(avgLoadTime).toBeLessThan(5);
        });

        test('should handle cold cache loads efficiently', async () => {
            // Test with fresh loader instance (cold cache)
            const freshLoader = new ItemDataLoader(testDataPath);
            
            const startTime = Date.now();
            const item = await freshLoader.loadItem('lamp');
            const loadTime = Date.now() - startTime;
            
            expect(item.id).toBe('lamp');
            expect(loadTime).toBeLessThan(50); // Cold cache should still be reasonable
            
            console.log(`Cold cache single item load time: ${loadTime}ms`);
        });
    });

    describe('Category Loading Performance', () => {
        test('should load small categories (containers, weapons, consumables) under 100ms', async () => {
            const smallCategories = ['containers', 'weapons', 'consumables'];
            
            for (const category of smallCategories) {
                const startTime = Date.now();
                const items = await loader.getItemsByCategory(category);
                const loadTime = Date.now() - startTime;
                
                expect(items.length).toBeGreaterThan(0);
                expect(loadTime).toBeLessThan(100);
                
                console.log(`${category} (${items.length} items) loaded in ${loadTime}ms`);
            }
        });

        test('should load medium categories (tools) under 200ms', async () => {
            const startTime = Date.now();
            const tools = await loader.getItemsByCategory('tools');
            const loadTime = Date.now() - startTime;
            
            expect(tools.length).toBe(97);
            expect(loadTime).toBeLessThan(200);
            
            console.log(`tools (${tools.length} items) loaded in ${loadTime}ms`);
        });

        test('should load large categories (treasures) under 300ms', async () => {
            const startTime = Date.now();
            const treasures = await loader.getItemsByCategory('treasures');
            const loadTime = Date.now() - startTime;
            
            expect(treasures.length).toBe(106);
            expect(loadTime).toBeLessThan(300);
            
            console.log(`treasures (${treasures.length} items) loaded in ${loadTime}ms`);
        });
    });

    describe('Full Dataset Performance', () => {
        test('should load all 214 items under 2 seconds', async () => {
            const startTime = Date.now();
            const allItems = await loader.loadAllItems();
            const loadTime = Date.now() - startTime;
            
            expect(allItems).toHaveLength(214);
            expect(loadTime).toBeLessThan(2000);
            
            console.log(`Full dataset (214 items) loaded in ${loadTime}ms`);
        });

        test('should load index under 50ms', async () => {
            const startTime = Date.now();
            const totalCount = await loader.getTotalCount();
            const loadTime = Date.now() - startTime;
            
            expect(totalCount).toBe(214);
            expect(loadTime).toBeLessThan(50);
            
            console.log(`Index loaded in ${loadTime}ms`);
        });
    });

    describe('Caching Performance', () => {
        test('should demonstrate significant cache performance improvement', async () => {
            // First load (cold cache)
            const startTime1 = Date.now();
            const allItems1 = await loader.loadAllItems();
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (warm cache)
            const startTime2 = Date.now();
            const allItems2 = await loader.loadAllItems();
            const loadTime2 = Date.now() - startTime2;
            
            expect(allItems1).toHaveLength(214);
            expect(allItems2).toHaveLength(214);
            expect(allItems1).toEqual(allItems2);
            
            // Cache should be at least 5x faster
            expect(loadTime2).toBeLessThan(loadTime1 / 5);
            expect(loadTime2).toBeLessThan(100); // Cached should be very fast
            
            console.log(`Cold cache: ${loadTime1}ms, Warm cache: ${loadTime2}ms, Speedup: ${(loadTime1/loadTime2).toFixed(1)}x`);
        });

        test('should cache individual items effectively', async () => {
            const itemId = 'lamp';
            
            // First load
            const startTime1 = Date.now();
            const item1 = await loader.loadItem(itemId);
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const item2 = await loader.loadItem(itemId);
            const loadTime2 = Date.now() - startTime2;
            
            expect(item1.id).toBe(itemId);
            expect(item2.id).toBe(itemId);
            expect(item1).toBe(item2); // Should be same reference
            
            expect(loadTime2).toBeLessThan(loadTime1);
            expect(loadTime2).toBeLessThan(5); // Cached individual items should be instant
            
            console.log(`Individual item - First load: ${loadTime1}ms, Cached load: ${loadTime2}ms`);
        });

        test('should cache categories effectively', async () => {
            const category = 'treasures';
            
            // First load
            const startTime1 = Date.now();
            const items1 = await loader.getItemsByCategory(category);
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const items2 = await loader.getItemsByCategory(category);
            const loadTime2 = Date.now() - startTime2;
            
            expect(items1).toHaveLength(106);
            expect(items2).toHaveLength(106);
            expect(items1).toEqual(items2);
            
            expect(loadTime2).toBeLessThan(loadTime1);
            expect(loadTime2).toBeLessThan(10); // Cached categories should be very fast
            
            console.log(`Category cache - First load: ${loadTime1}ms, Cached load: ${loadTime2}ms`);
        });
    });

    describe('Memory Usage', () => {
        test('should have reasonable memory footprint for full dataset', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Load full dataset
            const allItems = await loader.loadAllItems();
            expect(allItems).toHaveLength(214);
            
            const afterLoadMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = afterLoadMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
            
            console.log(`Memory increase for 214 items: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        });

        test('should have efficient memory usage per item', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            const allItems = await loader.loadAllItems();
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            const memoryPerItem = memoryIncrease / allItems.length;
            
            // Each item should use less than 50KB on average
            expect(memoryPerItem).toBeLessThan(50 * 1024);
            
            console.log(`Memory per item: ${Math.round(memoryPerItem / 1024)}KB`);
        });
    });

    describe('Concurrent Loading Performance', () => {
        test('should handle concurrent item loads efficiently', async () => {
            const itemIds = ['lamp', 'sword', 'coin', 'rope', 'safe', 'food', 'ruby', 'crown'];
            
            const startTime = Date.now();
            const loadPromises = itemIds.map(id => loader.loadItem(id));
            const items = await Promise.all(loadPromises);
            const loadTime = Date.now() - startTime;
            
            expect(items).toHaveLength(itemIds.length);
            items.forEach((item, index) => {
                expect(item.id).toBe(itemIds[index]);
            });
            
            // Concurrent loading should be faster than sequential
            expect(loadTime).toBeLessThan(200);
            
            console.log(`Concurrent loading of ${itemIds.length} items: ${loadTime}ms`);
        });

        test('should handle concurrent category loads efficiently', async () => {
            const categories = ['treasures', 'tools', 'containers', 'weapons', 'consumables'];
            
            const startTime = Date.now();
            const loadPromises = categories.map(category => loader.getItemsByCategory(category));
            const categoryResults = await Promise.all(loadPromises);
            const loadTime = Date.now() - startTime;
            
            expect(categoryResults).toHaveLength(categories.length);
            
            // Verify total items
            const totalItems = categoryResults.reduce((sum, items) => sum + items.length, 0);
            expect(totalItems).toBe(214);
            
            expect(loadTime).toBeLessThan(1000);
            
            console.log(`Concurrent loading of all ${categories.length} categories: ${loadTime}ms`);
        });
    });

    describe('Type Filtering Performance', () => {
        test('should filter by type efficiently', async () => {
            // First, load all items to warm cache
            await loader.loadAllItems();
            
            const startTime = Date.now();
            const typePromises = Object.values(ItemType).map(type => 
                loader.getItemsByType(type)
            );
            const typeResults = await Promise.all(typePromises);
            const loadTime = Date.now() - startTime;
            
            expect(typeResults).toHaveLength(4);
            typeResults.forEach(typeItems => {
                expect(typeItems.length).toBeGreaterThan(0);
            });
            
            // Type filtering should be fast since it operates on loaded data
            expect(loadTime).toBeLessThan(100);
            
            console.log(`Type filtering for all types: ${loadTime}ms`);
        });

        test('should filter by location efficiently', async () => {
            // Test location filtering performance
            const allItems = await loader.loadAllItems();
            
            // Get some locations to test
            const locations = [...new Set(allItems.map(item => item.currentLocation))].slice(0, 5);
            
            const startTime = Date.now();
            const locationPromises = locations.map(location => 
                loader.getItemsByLocation(location)
            );
            const locationResults = await Promise.all(locationPromises);
            const loadTime = Date.now() - startTime;
            
            expect(locationResults).toHaveLength(locations.length);
            
            // Location filtering should be fast
            expect(loadTime).toBeLessThan(50);
            
            console.log(`Location filtering for ${locations.length} locations: ${loadTime}ms`);
        });
    });

    describe('Performance Regression Detection', () => {
        test('should maintain consistent performance across multiple runs', async () => {
            const runs = 5;
            const loadTimes: number[] = [];
            
            for (let i = 0; i < runs; i++) {
                // Use fresh loader for each run to test cold cache performance
                const freshLoader = new ItemDataLoader(testDataPath);
                
                const startTime = Date.now();
                const allItems = await freshLoader.loadAllItems();
                const loadTime = Date.now() - startTime;
                
                expect(allItems).toHaveLength(214);
                loadTimes.push(loadTime);
            }
            
            const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
            const maxLoadTime = Math.max(...loadTimes);
            const minLoadTime = Math.min(...loadTimes);
            
            console.log(`Load times over ${runs} runs: avg=${avgLoadTime.toFixed(0)}ms, min=${minLoadTime}ms, max=${maxLoadTime}ms`);
            
            // Performance should be consistent (max should not be more than 3x min)
            expect(maxLoadTime).toBeLessThan(minLoadTime * 3);
            
            // Average should be reasonable
            expect(avgLoadTime).toBeLessThan(2000);
        });
    });
});