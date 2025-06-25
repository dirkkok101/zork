/**
 * Integration tests for ItemDataLoader with real weapon data using type-based loading
 * Tests loading actual weapon items from flat data/items/ structure
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Weapons by Type', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Type-Based Loading', () => {
        test('should load all weapon items by type from flat structure', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            // Verify expected count based on actual extracted data
            expect(weapons).toHaveLength(5);
            
            // Verify all items are properly loaded
            weapons.forEach(weapon => {
                expect(weapon.id).toBeDefined();
                expect(weapon.name).toBeDefined();
                expect(weapon.type).toBe(ItemType.WEAPON);
                expect(weapon.portable).toBeDefined();
                expect(weapon.visible).toBeDefined();
            });
        });

        test('should load specific weapon items by ID', async () => {
            const sword = await loader.loadItem('sword');
            const knife = await loader.loadItem('knife');
            
            expect(sword.type).toBe(ItemType.WEAPON);
            expect(knife.type).toBe(ItemType.WEAPON);
            
            expect(sword.id).toBe('sword');
            expect(knife.id).toBe('knife');
        });

        test('should validate weapon types are consistent', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            // All weapons should have WEAPON type
            const weaponTypeItems = weapons.filter(w => w.type === ItemType.WEAPON);
            expect(weaponTypeItems).toHaveLength(weapons.length);
        });
    });

    describe('Data Validation', () => {
        test('should validate all weapon items have proper enum values', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            weapons.forEach(weapon => {
                // Validate type
                expect(Object.values(ItemType)).toContain(weapon.type);
                
                // Validate size  
                expect(Object.values(Size)).toContain(weapon.size);
                
                // Validate required fields
                expect(weapon.id).toBeTruthy();
                expect(weapon.name).toBeTruthy();
                expect(weapon.description).toBeTruthy();
                expect(weapon.examineText).toBeTruthy();
                expect(Array.isArray(weapon.aliases)).toBe(true);
                expect(Array.isArray(weapon.tags)).toBe(true);
                expect(Array.isArray(weapon.interactions)).toBe(true);
            });
        });

        test('should validate weapon-specific properties', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            
            weapons.forEach(weapon => {
                // Weapons should typically be portable (takeable)
                expect(typeof weapon.portable).toBe('boolean');
                
                // Weapons should have reasonable weight
                expect(typeof weapon.weight).toBe('number');
                expect(weapon.weight).toBeGreaterThan(0);
                
                // Weapons should have interactions (at least examine)
                expect(weapon.interactions.length).toBeGreaterThan(0);
                expect(weapon.interactions.some(i => i.command === 'examine')).toBe(true);
            });
        });
    });

    describe('Performance', () => {
        test('should load all weapons within reasonable time', async () => {
            const startTime = Date.now();
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            const loadTime = Date.now() - startTime;
            
            expect(weapons).toHaveLength(5);
            expect(loadTime).toBeLessThan(100); // Should load quickly
        });
    });

    describe('Known Weapon Items', () => {
        test('should load famous weapon items with expected properties', async () => {
            const sword = await loader.loadItem('sword');
            expect(sword.type).toBe(ItemType.WEAPON);
            expect(sword.name.toLowerCase()).toContain('sword');
            
            const knife = await loader.loadItem('knife');
            expect(knife.type).toBe(ItemType.WEAPON);
            expect(knife.name.toLowerCase()).toContain('knife');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing weapon item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_weapon'))
                .rejects.toThrow(/not found/i);
        });
    });
});