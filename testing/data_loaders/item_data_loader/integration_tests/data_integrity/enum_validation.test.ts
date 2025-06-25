/**
 * Integration tests for ItemDataLoader enum validation with real data
 * Tests that all enum values in actual data files are valid
 * No mocking - validates enum consistency across all 214 items
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Enum Validation', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('ItemType Enum Validation', () => {
        test('should validate all items have valid ItemType enum values', async () => {
            const allItems = await loader.loadAllItems();
            const validTypes = Object.values(ItemType);
            
            allItems.forEach(item => {
                expect(validTypes).toContain(item.type);
            });
            
            console.log('All 214 items have valid ItemType enum values');
        });

        test('should catalog all ItemType values used in dataset', async () => {
            const allItems = await loader.loadAllItems();
            const usedTypes = new Set(allItems.map(item => item.type));
            
            console.log('ItemType values found in dataset:', Array.from(usedTypes));
            
            // Verify each used type is a valid enum value
            usedTypes.forEach(type => {
                expect(Object.values(ItemType)).toContain(type);
            });
            
            // Should use main enum values (complete coverage)
            expect(usedTypes.has(ItemType.TOOL)).toBe(true);
            expect(usedTypes.has(ItemType.TOOL)).toBe(true);
            expect(usedTypes.has(ItemType.CONTAINER)).toBe(true);
            expect(usedTypes.has(ItemType.WEAPON)).toBe(true);
        });

        test('should validate ItemType distribution makes sense', async () => {
            const allItems = await loader.loadAllItems();
            const typeDistribution = allItems.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            console.log('ItemType distribution:', typeDistribution);
            
            // Validate expected patterns
            expect(typeDistribution[ItemType.TOOL]).toBeGreaterThan(100); // Many tools (164)
            expect(typeDistribution[ItemType.CONTAINER]).toBe(36); // Exactly 36 containers
            expect(typeDistribution[ItemType.WEAPON]).toBe(5); // Exactly 5 weapons
            expect(typeDistribution[ItemType.FOOD]).toBe(7); // Exactly 7 food items
            expect(typeDistribution[ItemType.LIGHT_SOURCE]).toBe(2); // Exactly 2 light sources
            
            // TREASURE type has 0 items in the actual data
            expect(typeDistribution[ItemType.TREASURE] || 0).toBe(0);
            
            // Total should be 214
            const total = Object.values(typeDistribution).reduce((sum, count) => sum + count, 0);
            expect(total).toBe(214);
        });
    });

    describe('Size Enum Validation', () => {
        test('should validate all items have valid Size enum values', async () => {
            const allItems = await loader.loadAllItems();
            const validSizes = Object.values(Size);
            
            allItems.forEach(item => {
                expect(validSizes).toContain(item.size);
            });
            
            console.log('All 214 items have valid Size enum values');
        });

        test('should catalog all Size values used in dataset', async () => {
            const allItems = await loader.loadAllItems();
            const usedSizes = new Set(allItems.map(item => item.size));
            
            console.log('Size values found in dataset:', Array.from(usedSizes));
            
            // Verify each used size is a valid enum value
            usedSizes.forEach(size => {
                expect(Object.values(Size)).toContain(size);
            });
            
            // Should use multiple size values (variety expected)
            expect(usedSizes.size).toBeGreaterThan(2);
        });

        test('should validate Size distribution is reasonable', async () => {
            const allItems = await loader.loadAllItems();
            const sizeDistribution = allItems.reduce((acc, item) => {
                acc[item.size] = (acc[item.size] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            console.log('Size distribution:', sizeDistribution);
            
            // Should have items across multiple sizes
            const usedSizes = Object.keys(sizeDistribution);
            expect(usedSizes.length).toBeGreaterThan(2);
            
            // Each size should have at least one item
            Object.values(sizeDistribution).forEach(count => {
                expect(count).toBeGreaterThan(0);
            });
            
            // Total should be 214
            const total = Object.values(sizeDistribution).reduce((sum, count) => sum + count, 0);
            expect(total).toBe(214);
        });
    });

    describe('Enum Consistency Across Types', () => {
        test('should validate ItemType consistency within types', async () => {
            const itemTypes = Object.values(ItemType);
            
            for (const itemType of itemTypes) {
                const typeItems = await loader.getItemsByType(itemType);
                
                typeItems.forEach(item => {
                    expect(Object.values(ItemType)).toContain(item.type);
                    expect(item.type).toBe(itemType);
                });
                
                console.log(`${itemType} type: ${typeItems.length} items`);
            }
        });

        test('should validate Size consistency within types', async () => {
            const itemTypes = Object.values(ItemType);
            
            for (const itemType of itemTypes) {
                const typeItems = await loader.getItemsByType(itemType);
                
                typeItems.forEach(item => {
                    expect(Object.values(Size)).toContain(item.size);
                });
                
                // Log type size distribution
                const sizeDistribution = typeItems.reduce((acc, item) => {
                    acc[item.size] = (acc[item.size] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                console.log(`${itemType} type - size distribution:`, sizeDistribution);
            }
        });
    });

    describe('Type-Size Relationships', () => {
        test('should validate reasonable Size-Weight relationships', async () => {
            const allItems = await loader.loadAllItems();
            
            // Group items by size and analyze weights
            const sizeGroups = allItems.reduce((acc, item) => {
                if (!acc[item.size]) acc[item.size] = [];
                acc[item.size]!.push(item.weight);
                return acc;
            }, {} as Record<string, number[]>);
            
            Object.entries(sizeGroups).forEach(([size, weights]) => {
                const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
                const maxWeight = Math.max(...weights);
                const minWeight = Math.min(...weights);
                
                console.log(`${size}: avg=${avgWeight.toFixed(1)}, min=${minWeight}, max=${maxWeight}, count=${weights.length}`);
                
                // Basic sanity checks
                expect(minWeight).toBeGreaterThanOrEqual(0);
                expect(maxWeight).toBeGreaterThan(0);
                expect(avgWeight).toBeGreaterThan(0);
            });
        });

        test('should validate ItemType-Size relationships make sense', async () => {
            const allItems = await loader.loadAllItems();
            
            // Analyze size distribution by type
            const typeAnalysis = Object.values(ItemType).map(type => {
                const typeItems = allItems.filter(item => item.type === type);
                const sizeDistribution = typeItems.reduce((acc, item) => {
                    acc[item.size] = (acc[item.size] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                return { type, count: typeItems.length, sizes: sizeDistribution };
            });
            
            typeAnalysis.forEach(analysis => {
                console.log(`${analysis.type} (${analysis.count} items):`, analysis.sizes);
                
                if (analysis.count === 0) {
                    // Skip validation for types with no items
                    expect(Object.keys(analysis.sizes).length).toBe(0);
                    return;
                }
                
                // Each type with items should have at least one size
                expect(Object.keys(analysis.sizes).length).toBeGreaterThan(0);
                
                // Size counts should sum to type count
                const sizeTotal = Object.values(analysis.sizes).reduce((sum, count) => sum + count, 0);
                expect(sizeTotal).toBe(analysis.count);
            });
        });
    });

    describe('Enum Validation in Special Cases', () => {
        test('should validate enums in special character items', async () => {
            const specialItems = ['!!!!!', '*bun*'];
            
            for (const itemId of specialItems) {
                const item = await loader.loadItem(itemId);
                
                expect(Object.values(ItemType)).toContain(item.type);
                expect(Object.values(Size)).toContain(item.size);
                
                console.log(`${itemId}: type=${item.type}, size=${item.size}`);
            }
        });

        test('should validate enums across all known edge cases', async () => {
            const allItems = await loader.loadAllItems();
            
            // Find items that might be edge cases
            const edgeCases = allItems.filter(item => 
                item.id.length <= 2 || // Very short IDs
                item.id.length >= 10 || // Very long IDs
                /[^a-zA-Z0-9]/.test(item.id) || // Special characters
                item.weight === 0 || // Zero weight
                item.weight > 100 // Very heavy
            );
            
            console.log(`Found ${edgeCases.length} potential edge case items`);
            
            edgeCases.forEach(item => {
                expect(Object.values(ItemType)).toContain(item.type);
                expect(Object.values(Size)).toContain(item.size);
            });
        });
    });

    describe('Enum Data Integrity', () => {
        test('should validate no undefined or null enum values', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(item.type).toBeDefined();
                expect(item.type).not.toBeNull();
                expect(item.size).toBeDefined();
                expect(item.size).not.toBeNull();
                
                expect(typeof item.type).toBe('string');
                expect(typeof item.size).toBe('string');
                
                expect(item.type.length).toBeGreaterThan(0);
                expect(item.size.length).toBeGreaterThan(0);
            });
        });

        test('should validate enum case sensitivity', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                // Enum values should match exactly (case sensitive)
                expect(Object.values(ItemType)).toContain(item.type);
                expect(Object.values(Size)).toContain(item.size);
                
                // Should be uppercase enum values
                expect(item.type).toBe(item.type.toUpperCase());
                expect(item.size).toBe(item.size.toUpperCase());
            });
        });

        test('should validate enum parsing consistency', async () => {
            // Test that enum parsing is consistent across multiple loads
            const itemId = 'lamp';
            
            const item1 = await loader.loadItem(itemId);
            const item2 = await loader.loadItem(itemId);
            
            expect(item1.type).toBe(item2.type);
            expect(item1.size).toBe(item2.size);
            
            // Should have the same content (value equality)
            expect(item1).toEqual(item2);
        });
    });

    describe('Complete Dataset Enum Coverage', () => {
        test('should document complete enum usage across dataset', async () => {
            const allItems = await loader.loadAllItems();
            
            // Generate complete enum usage report
            const enumReport = {
                totalItems: allItems.length,
                itemTypes: {} as Record<string, number>,
                sizes: {} as Record<string, number>,
                combinations: {} as Record<string, number>
            };
            
            allItems.forEach(item => {
                // Count types
                enumReport.itemTypes[item.type] = (enumReport.itemTypes[item.type] || 0) + 1;
                
                // Count sizes
                enumReport.sizes[item.size] = (enumReport.sizes[item.size] || 0) + 1;
                
                // Count type-size combinations
                const combo = `${item.type}-${item.size}`;
                enumReport.combinations[combo] = (enumReport.combinations[combo] || 0) + 1;
            });
            
            console.log('Complete Enum Usage Report:', enumReport);
            
            // Validate totals
            const typeTotal = Object.values(enumReport.itemTypes).reduce((sum, count) => sum + count, 0);
            const sizeTotal = Object.values(enumReport.sizes).reduce((sum, count) => sum + count, 0);
            
            expect(typeTotal).toBe(214);
            expect(sizeTotal).toBe(214);
            expect(enumReport.totalItems).toBe(214);
        });
    });
});