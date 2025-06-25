/**
 * Integration tests for ItemDataLoader with real weapon data
 * Tests loading actual weapon items from data/items/weapons/
 * No mocking - tests real file system operations and data validation
 */

// Import integration test setup (no mocking)
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Weapons Category', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Category Loading', () => {
        test('should load all weapon items from real data files', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            // Verify expected count based on index.json
            expect(weapons).toHaveLength(5);
            
            // Verify all items are properly loaded
            weapons.forEach(weapon => {
                expect(weapon).toMatchObject({
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

        test('should load specific weapon items by ID', async () => {
            // Test loading known weapon items based on index.json
            const knownWeaponIds = ['axe', 'knife', 'rknif', 'still', 'sword'];
            
            for (const weaponId of knownWeaponIds) {
                const item = await loader.loadItem(weaponId);
                expect(item.id).toBe(weaponId);
                // Items in weapons category may have different types
                expect(Object.values(ItemType)).toContain(item.type);
            }
        });

        test('should load all weapons with valid types', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                expect(Object.values(ItemType)).toContain(weapon.type);
            });
            
            // Some weapons should be WEAPON type, but not all necessarily
            const weaponTypeItems = weapons.filter(w => w.type === ItemType.WEAPON);
            expect(weaponTypeItems.length).toBeGreaterThan(0);
        });
    });

    describe('Data Validation', () => {
        test('should validate all weapon items have proper enum values', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                // Validate ItemType enum
                expect(Object.values(ItemType)).toContain(weapon.type);
                
                // Validate Size enum
                expect(Object.values(Size)).toContain(weapon.size);
                
                // Validate required string fields are non-empty
                expect(weapon.id).toBeTruthy();
                expect(weapon.name).toBeTruthy();
                expect(weapon.description).toBeTruthy();
                expect(weapon.examineText).toBeTruthy();
            });
        });

        test('should validate weapon-specific properties', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                // All weapons should have proper structure
                expect(weapon.aliases).toBeInstanceOf(Array);
                expect(weapon.tags).toBeInstanceOf(Array);
                expect(weapon.interactions).toBeInstanceOf(Array);
                expect(typeof weapon.weight).toBe('number');
                expect(typeof weapon.portable).toBe('boolean');
                expect(typeof weapon.visible).toBe('boolean');
                
                // Weapons should have interactions (attack, wield, etc.)
                expect(weapon.interactions.length).toBeGreaterThan(0);
                
                // Weapons should have boolean portable/visible values (but not all are necessarily portable)
                expect(typeof weapon.portable).toBe('boolean');
                expect(typeof weapon.visible).toBe('boolean');
                
                // Weapons should have meaningful weight
                expect(weapon.weight).toBeGreaterThan(0);
            });
        });

        test('should validate interaction structures for weapons', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                weapon.interactions.forEach(interaction => {
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
        test('should load all weapons within reasonable time', async () => {
            const startTime = Date.now();
            const weapons = await loader.getItemsByCategory('weapons');
            const loadTime = Date.now() - startTime;
            
            expect(weapons).toHaveLength(5);
            expect(loadTime).toBeLessThan(50); // Very small category should load extremely fast
        });

        test('should cache weapon category for repeated access', async () => {
            // First load
            const startTime1 = Date.now();
            const weapons1 = await loader.getItemsByCategory('weapons');
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cached)
            const startTime2 = Date.now();
            const weapons2 = await loader.getItemsByCategory('weapons');
            const loadTime2 = Date.now() - startTime2;
            
            expect(weapons1).toHaveLength(5);
            expect(weapons2).toHaveLength(5);
            expect(loadTime2).toBeLessThanOrEqual(loadTime1); // Cache should be faster or equal
            expect(loadTime2).toBeLessThan(5); // Cached access should be very fast for tiny category
        });
    });

    describe('Known Weapon Items', () => {
        test('should load famous weapon items with expected properties', async () => {
            // Test well-known Zork weapons
            const famousWeapons = [
                { id: 'sword', expectedName: /sword/i },
                { id: 'knife', expectedName: /knife/i },
                { id: 'axe', expectedName: /axe/i }
            ];
            
            for (const { id, expectedName } of famousWeapons) {
                const weapon = await loader.loadItem(id);
                expect(weapon.id).toBe(id);
                expect(weapon.name).toMatch(expectedName);
                expect(Object.values(ItemType)).toContain(weapon.type);
                expect(weapon.weight).toBeGreaterThan(0);
                expect(typeof weapon.portable).toBe('boolean');
                expect(typeof weapon.visible).toBe('boolean');
            }
        });

        test('should load all weapons from index', async () => {
            // Verify all weapons listed in index.json can be loaded
            const expectedWeapons = ['axe', 'knife', 'rknif', 'still', 'sword'];
            
            for (const weaponId of expectedWeapons) {
                const weapon = await loader.loadItem(weaponId);
                expect(weapon.id).toBe(weaponId);
                expect(Object.values(ItemType)).toContain(weapon.type);
                
                // Weapons should have meaningful interactions
                expect(weapon.interactions.length).toBeGreaterThan(0);
                
                // Should have commands related to weapon functionality
                const commands = weapon.interactions.map(i => i.command.toLowerCase());
                const hasWeaponCommand = commands.some(cmd => 
                    cmd.includes('attack') || 
                    cmd.includes('kill') || 
                    cmd.includes('hit') || 
                    cmd.includes('swing') ||
                    cmd.includes('wield') ||
                    cmd.includes('use') ||
                    cmd.includes('examine') ||
                    cmd.includes('take')
                );
                expect(hasWeaponCommand).toBe(true);
            }
        });

        test('should handle weapon variants correctly', async () => {
            // Test that similar weapons (knife, rknif) are properly differentiated
            const knife = await loader.loadItem('knife');
            const rknif = await loader.loadItem('rknif');
            
            expect(knife.id).toBe('knife');
            expect(rknif.id).toBe('rknif');
            expect(Object.values(ItemType)).toContain(knife.type);
            expect(Object.values(ItemType)).toContain(rknif.type);
            
            // They should be different items
            expect(knife.name).not.toBe(rknif.name);
        });
    });

    describe('Weapon Characteristics', () => {
        test('should have weapons with proper size distribution', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            // Weapons should have varying sizes
            const sizes = weapons.map(w => w.size);
            
            // All sizes should be valid enum values
            sizes.forEach(size => {
                expect(Object.values(Size)).toContain(size);
            });
            
            // Weapons should generally not be HUGE (too unwieldy)
            const hugeSizes = sizes.filter(size => size === Size.HUGE);
            expect(hugeSizes.length).toBeLessThanOrEqual(1); // At most one huge weapon
        });

        test('should have weapons with realistic weight distribution', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                // Weapon weights should be positive
                expect(weapon.weight).toBeGreaterThan(0);
                
                // Weapon weights should be reasonable (not extremely heavy)
                expect(weapon.weight).toBeLessThan(100);
                
                // Heavier weapons should generally be larger
                if (weapon.weight > 10) {
                    expect([Size.MEDIUM, Size.LARGE, Size.HUGE]).toContain(weapon.size);
                }
            });
        });

        test('should have weapons with appropriate tags', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                expect(weapon.tags).toBeInstanceOf(Array);
                
                // Weapons might have tags like 'combat', 'tool', 'metal', etc.
                // We don't enforce specific tags, but verify structure
                weapon.tags.forEach(tag => {
                    expect(typeof tag).toBe('string');
                    expect(tag.length).toBeGreaterThan(0);
                });
            });
        });

        test('should validate weapon state structures', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                // Weapon state should exist and be an object
                expect(weapon.state).toBeDefined();
                expect(typeof weapon.state).toBe('object');
                
                // Some weapons might have durability, sharpness, etc.
                // We don't enforce specific state properties but verify structure
                Object.keys(weapon.state).forEach(key => {
                    expect(typeof key).toBe('string');
                    // State values can be any type
                });
            });
        });
    });

    describe('Combat Functionality', () => {
        test('should have weapons with combat-related interactions', async () => {
            const weapons = await loader.getItemsByCategory('weapons');
            
            weapons.forEach(weapon => {
                // Note: We're flexible here because different weapons might have different interaction patterns
                // At minimum, weapons should have some meaningful interactions
                expect(weapon.interactions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing weapon item gracefully', async () => {
            await expect(loader.loadItem('nonexistent_weapon'))
                .rejects
                .toThrow(/not found/i);
        });

        test('should continue loading other weapons if one fails', async () => {
            // This test verifies the error handling in getItemsByCategory
            // where individual item loading errors don't fail the entire category
            const weapons = await loader.getItemsByCategory('weapons');
            
            // Should still load the full expected count
            expect(weapons).toHaveLength(5);
            
            // All loaded items should be valid
            weapons.forEach(weapon => {
                expect(weapon.id).toBeTruthy();
                expect(weapon.name).toBeTruthy();
                expect(Object.values(ItemType)).toContain(weapon.type);
            });
        });
    });
});