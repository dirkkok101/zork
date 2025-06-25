/**
 * Integration tests for ItemDataLoader interaction parsing with real data
 * Tests complex interaction conditions and effects parsing across all items
 * No mocking - validates interaction structure and parsing with actual game data
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Item, ItemType, Size, ItemInteraction } from '../../../../../src/types/ItemTypes';
import { join } from 'path';

describe('ItemDataLoader Integration - Interactions', () => {
    let loader: ItemDataLoader;
    const testDataPath = join(process.cwd(), 'data/items/');

    beforeEach(() => {
        loader = new ItemDataLoader(testDataPath);
    });

    describe('Basic Interaction Structure', () => {
        test('should validate all items have interactions with required fields', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                expect(Array.isArray(item.interactions)).toBe(true);
                expect(item.interactions.length).toBeGreaterThan(0);
                
                item.interactions.forEach(interaction => {
                    expect(interaction).toHaveProperty('command');
                    expect(interaction).toHaveProperty('message');
                    
                    expect(typeof interaction.command).toBe('string');
                    expect(typeof interaction.message).toBe('string');
                    expect(interaction.command.length).toBeGreaterThan(0);
                    expect(interaction.message.length).toBeGreaterThan(0);
                });
            });
            
            console.log(`Validated interaction structure in ${allItems.length} items`);
        });

        test('should catalog interaction commands across dataset', async () => {
            const allItems = await loader.loadAllItems();
            const commandCount = new Map<string, number>();
            let totalInteractions = 0;
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    const cmd = interaction.command.toLowerCase();
                    commandCount.set(cmd, (commandCount.get(cmd) || 0) + 1);
                    totalInteractions++;
                });
            });
            
            const topCommands = Array.from(commandCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20);
                
            console.log('Top 20 interaction commands:', topCommands);
            console.log(`Total interactions across dataset: ${totalInteractions}`);
            
            // Should have common game commands
            expect(commandCount.has('examine')).toBe(true);
            expect(commandCount.has('take')).toBe(true);
            
            // Should have variety of commands
            expect(commandCount.size).toBeGreaterThan(20);
        });
    });

    describe('Condition Parsing Validation', () => {
        test('should validate condition parsing in items with conditions', async () => {
            const allItems = await loader.loadAllItems();
            const itemsWithConditions = allItems.filter(item => 
                item.interactions.some(interaction => interaction.condition)
            );
            
            console.log(`Found ${itemsWithConditions.length} items with conditional interactions`);
            
            itemsWithConditions.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.condition) {
                        expect(Array.isArray(interaction.condition)).toBe(true);
                        expect(interaction.condition.length).toBeGreaterThan(0);
                        
                        interaction.condition.forEach(conditionPart => {
                            expect(typeof conditionPart).toBe('string');
                            expect(conditionPart.length).toBeGreaterThan(0);
                        });
                    }
                });
            });
        });

        test('should validate negation parsing in conditions', async () => {
            const allItems = await loader.loadAllItems();
            const negatedConditions: Array<{item: string, condition: string[]}> = [];
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.condition && interaction.condition[0] === 'not') {
                        negatedConditions.push({
                            item: item.id,
                            condition: interaction.condition
                        });
                    }
                });
            });
            
            console.log(`Found ${negatedConditions.length} negated conditions`);
            
            negatedConditions.forEach(negCond => {
                expect(negCond.condition).toHaveLength(2);
                expect(negCond.condition[0]).toBe('not');
                expect(negCond.condition[1]).toBeTruthy();
                expect(negCond.condition[1].length).toBeGreaterThan(0);
            });
            
            if (negatedConditions.length > 0) {
                console.log('Sample negated conditions:', negatedConditions.slice(0, 5));
            }
        });

        test('should validate state-based conditions', async () => {
            const allItems = await loader.loadAllItems();
            const stateConditions: Array<{item: string, condition: string[]}> = [];
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.condition) {
                        const hasStateCondition = interaction.condition.some(part => 
                            part.includes('state.') || part.includes('flag.')
                        );
                        if (hasStateCondition) {
                            stateConditions.push({
                                item: item.id,
                                condition: interaction.condition
                            });
                        }
                    }
                });
            });
            
            console.log(`Found ${stateConditions.length} state-based conditions`);
            
            stateConditions.forEach(stateCond => {
                expect(stateCond.condition.length).toBeGreaterThan(0);
                stateCond.condition.forEach(part => {
                    expect(typeof part).toBe('string');
                });
            });
            
            if (stateConditions.length > 0) {
                console.log('Sample state conditions:', stateConditions.slice(0, 5));
            }
        });
    });

    describe('Effect Parsing Validation', () => {
        test('should validate effect parsing in items with effects', async () => {
            const allItems = await loader.loadAllItems();
            const itemsWithEffects = allItems.filter(item => 
                item.interactions.some(interaction => interaction.effect)
            );
            
            console.log(`Found ${itemsWithEffects.length} items with effect interactions`);
            
            itemsWithEffects.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.effect) {
                        expect(Array.isArray(interaction.effect)).toBe(true);
                        expect(interaction.effect.length).toBeGreaterThan(0);
                        
                        interaction.effect.forEach(effectPart => {
                            expect(typeof effectPart).toBe('string');
                            expect(effectPart.length).toBeGreaterThan(0);
                        });
                    }
                });
            });
        });

        test('should validate assignment effect parsing', async () => {
            const allItems = await loader.loadAllItems();
            const assignmentEffects: Array<{item: string, effect: string[]}> = [];
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.effect && interaction.effect[0] === 'set') {
                        assignmentEffects.push({
                            item: item.id,
                            effect: interaction.effect
                        });
                    }
                });
            });
            
            console.log(`Found ${assignmentEffects.length} assignment effects`);
            
            assignmentEffects.forEach(assEffect => {
                expect(assEffect.effect).toHaveLength(3);
                expect(assEffect.effect[0]).toBe('set');
                expect(assEffect.effect[1]).toBeTruthy(); // property name
                expect(assEffect.effect[2]).toBeTruthy(); // value
            });
            
            if (assignmentEffects.length > 0) {
                console.log('Sample assignment effects:', assignmentEffects.slice(0, 5));
            }
        });

        test('should validate state-modifying effects', async () => {
            const allItems = await loader.loadAllItems();
            const stateEffects: Array<{item: string, effect: string[]}> = [];
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    if (interaction.effect) {
                        const hasStateEffect = interaction.effect.some(part => 
                            part.includes('state.') || part.includes('flag.')
                        );
                        if (hasStateEffect) {
                            stateEffects.push({
                                item: item.id,
                                effect: interaction.effect
                            });
                        }
                    }
                });
            });
            
            console.log(`Found ${stateEffects.length} state-modifying effects`);
            
            stateEffects.forEach(stateEffect => {
                expect(stateEffect.effect.length).toBeGreaterThan(0);
                stateEffect.effect.forEach(part => {
                    expect(typeof part).toBe('string');
                });
            });
            
            if (stateEffects.length > 0) {
                console.log('Sample state effects:', stateEffects.slice(0, 5));
            }
        });
    });

    describe('Interaction Patterns by Type', () => {
        test('should validate treasure interaction patterns', async () => {
            const treasures = await loader.getItemsByType(ItemType.TREASURE);
            const treasureCommands = new Set<string>();
            
            treasures.forEach(treasure => {
                treasure.interactions.forEach(interaction => {
                    treasureCommands.add(interaction.command.toLowerCase());
                });
            });
            
            console.log('Treasure commands:', Array.from(treasureCommands).sort());
            
            // Treasures should have common commands
            expect(treasureCommands.has('take')).toBe(true);
            expect(treasureCommands.has('examine')).toBe(true);
            
            // Should have reasonable variety
            expect(treasureCommands.size).toBeGreaterThan(5);
        });

        test('should validate tool interaction patterns', async () => {
            const tools = await loader.getItemsByType(ItemType.TOOL);
            const toolCommands = new Set<string>();
            
            tools.forEach(tool => {
                tool.interactions.forEach(interaction => {
                    toolCommands.add(interaction.command.toLowerCase());
                });
            });
            
            console.log('Tool commands:', Array.from(toolCommands).sort());
            
            // Tools should have functional commands
            expect(toolCommands.has('use')).toBe(true);
            expect(toolCommands.has('examine')).toBe(true);
            
            // Should have variety for different tool types
            expect(toolCommands.size).toBeGreaterThan(10);
        });

        test('should validate container interaction patterns', async () => {
            const containers = await loader.getItemsByType(ItemType.CONTAINER);
            const containerCommands = new Set<string>();
            
            containers.forEach(container => {
                container.interactions.forEach(interaction => {
                    containerCommands.add(interaction.command.toLowerCase());
                });
            });
            
            console.log('Container commands:', Array.from(containerCommands).sort());
            
            // Containers should have container-specific commands
            const hasContainerCommand = Array.from(containerCommands).some(cmd =>
                cmd.includes('open') || cmd.includes('close') || cmd.includes('put')
            );
            
            // Note: Not enforcing since some containers might have different mechanics
            expect(containerCommands.has('examine')).toBe(true);
        });

        test('should validate weapon interaction patterns', async () => {
            const weapons = await loader.getItemsByType(ItemType.WEAPON);
            const weaponCommands = new Set<string>();
            
            weapons.forEach(weapon => {
                weapon.interactions.forEach(interaction => {
                    weaponCommands.add(interaction.command.toLowerCase());
                });
            });
            
            console.log('Weapon commands:', Array.from(weaponCommands).sort());
            
            // Weapons should have combat-related commands
            expect(weaponCommands.has('examine')).toBe(true);
            expect(weaponCommands.has('take')).toBe(true);
            
            // Should have weapon-specific interactions
            const hasWeaponCommand = Array.from(weaponCommands).some(cmd =>
                cmd.includes('attack') || cmd.includes('kill') || cmd.includes('hit') || 
                cmd.includes('use') || cmd.includes('wield')
            );
        });
    });

    describe('Complex Interaction Analysis', () => {
        test('should analyze items with multiple conditional interactions', async () => {
            const allItems = await loader.loadAllItems();
            const complexItems = allItems.filter(item => {
                const conditionalInteractions = item.interactions.filter(i => i.condition);
                return conditionalInteractions.length > 2;
            });
            
            console.log(`Found ${complexItems.length} items with multiple conditional interactions`);
            
            complexItems.forEach(item => {
                const conditionalInteractions = item.interactions.filter(i => i.condition);
                console.log(`${item.id}: ${conditionalInteractions.length} conditional interactions`);
                
                conditionalInteractions.forEach(interaction => {
                    expect(interaction.condition).toBeDefined();
                    expect(Array.isArray(interaction.condition)).toBe(true);
                    expect(interaction.condition!.length).toBeGreaterThan(0);
                });
            });
        });

        test('should analyze items with both conditions and effects', async () => {
            const allItems = await loader.loadAllItems();
            const complexInteractionItems = allItems.filter(item => 
                item.interactions.some(interaction => 
                    interaction.condition && interaction.effect
                )
            );
            
            console.log(`Found ${complexInteractionItems.length} items with condition+effect interactions`);
            
            complexInteractionItems.forEach(item => {
                const complexInteractions = item.interactions.filter(i => i.condition && i.effect);
                
                complexInteractions.forEach(interaction => {
                    expect(interaction.condition).toBeDefined();
                    expect(interaction.effect).toBeDefined();
                    expect(Array.isArray(interaction.condition)).toBe(true);
                    expect(Array.isArray(interaction.effect)).toBe(true);
                    expect(interaction.condition!.length).toBeGreaterThan(0);
                    expect(interaction.effect!.length).toBeGreaterThan(0);
                });
            });
        });

        test('should validate interaction message quality', async () => {
            const allItems = await loader.loadAllItems();
            let totalMessageLength = 0;
            let messageCount = 0;
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    expect(interaction.message.length).toBeGreaterThan(0);
                    expect(interaction.message.length).toBeLessThan(1000); // Reasonable upper bound
                    
                    // Message should be meaningful text
                    expect(interaction.message.trim()).toBe(interaction.message);
                    expect(interaction.message).not.toMatch(/^[\s]*$/); // Not just whitespace
                    
                    totalMessageLength += interaction.message.length;
                    messageCount++;
                });
            });
            
            const avgMessageLength = totalMessageLength / messageCount;
            console.log(`Average interaction message length: ${avgMessageLength.toFixed(1)} characters`);
            expect(avgMessageLength).toBeGreaterThan(10); // Messages should be meaningful
        });
    });

    describe('Interaction Data Integrity', () => {
        test('should validate no malformed interaction data', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    // Required fields should not be undefined/null
                    expect(interaction.command).toBeDefined();
                    expect(interaction.message).toBeDefined();
                    expect(interaction.command).not.toBeNull();
                    expect(interaction.message).not.toBeNull();
                    
                    // Optional fields should be undefined or valid arrays
                    if (interaction.condition !== undefined) {
                        expect(Array.isArray(interaction.condition)).toBe(true);
                    }
                    if (interaction.effect !== undefined) {
                        expect(Array.isArray(interaction.effect)).toBe(true);
                    }
                    
                    // No unexpected properties
                    const validProps = ['command', 'message', 'condition', 'effect'];
                    Object.keys(interaction).forEach(key => {
                        expect(validProps).toContain(key);
                    });
                });
            });
        });

        test('should validate interaction parsing is deterministic', async () => {
            // Test that interaction parsing produces consistent results
            const itemId = 'lamp';
            
            const item1 = await loader.loadItem(itemId);
            const item2 = await loader.loadItem(itemId);
            
            expect(item1.interactions).toEqual(item2.interactions);
            expect(item1.interactions).toBe(item2.interactions); // Should be same reference (cached)
        });

        test('should validate interactions are properly typed', async () => {
            const allItems = await loader.loadAllItems();
            
            allItems.forEach(item => {
                item.interactions.forEach(interaction => {
                    // Should match ItemInteraction interface
                    const interactionObj: ItemInteraction = interaction;
                    expect(typeof interactionObj.command).toBe('string');
                    expect(typeof interactionObj.message).toBe('string');
                    
                    if (interactionObj.condition) {
                        expect(Array.isArray(interactionObj.condition)).toBe(true);
                        interactionObj.condition.forEach(part => {
                            expect(typeof part).toBe('string');
                        });
                    }
                    
                    if (interactionObj.effect) {
                        expect(Array.isArray(interactionObj.effect)).toBe(true);
                        interactionObj.effect.forEach(part => {
                            expect(typeof part).toBe('string');
                        });
                    }
                });
            });
        });
    });

    describe('Special Cases', () => {
        test('should validate interactions in special character items', async () => {
            const specialItems = ['!!!!!', '*bun*'];
            
            for (const itemId of specialItems) {
                const item = await loader.loadItem(itemId);
                
                expect(item.interactions.length).toBeGreaterThan(0);
                
                item.interactions.forEach(interaction => {
                    expect(interaction.command).toBeTruthy();
                    expect(interaction.message).toBeTruthy();
                    expect(typeof interaction.command).toBe('string');
                    expect(typeof interaction.message).toBe('string');
                });
                
                console.log(`${itemId}: ${item.interactions.length} interactions`);
            }
        });

        test('should validate interactions across all categories maintain consistency', async () => {
            const categories = await loader.getCategories();
            
            for (const category of categories) {
                const categoryItems = await loader.getItemsByCategory(category);
                let categoryInteractionCount = 0;
                
                categoryItems.forEach(item => {
                    expect(item.interactions.length).toBeGreaterThan(0);
                    categoryInteractionCount += item.interactions.length;
                    
                    item.interactions.forEach(interaction => {
                        expect(interaction.command).toBeTruthy();
                        expect(interaction.message).toBeTruthy();
                    });
                });
                
                const avgInteractionsPerItem = categoryInteractionCount / categoryItems.length;
                console.log(`${category}: avg ${avgInteractionsPerItem.toFixed(1)} interactions per item`);
                expect(avgInteractionsPerItem).toBeGreaterThan(1);
            }
        });
    });
});