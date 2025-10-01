/**
 * Context-Aware Help System
 *
 * Provides helpful command suggestions and guidance based on current game context
 * without spoiling puzzles or revealing solutions.
 */

import { IGameStateService } from '../services/interfaces';
import { LightingCondition } from '../types/SceneTypes';
import * as log from 'loglevel';

export interface HelpCategory {
    title: string;
    commands: HelpCommand[];
}

export interface HelpCommand {
    command: string;
    description: string;
    examples?: string[];
}

export class HelpSystem {
    private container!: HTMLElement;
    private overlay!: HTMLElement;
    private isVisible = false;
    private logger: log.Logger;
    private gameStateService?: IGameStateService;

    constructor(logger?: log.Logger) {
        this.logger = logger || log.getLogger('HelpSystem');
        this.createHelpPanel();
    }

    /**
     * Initialize with game state service
     */
    initialize(gameStateService: IGameStateService): void {
        this.gameStateService = gameStateService;
        this.logger.debug('Help system initialized');
    }

    /**
     * Create the help panel DOM structure
     */
    private createHelpPanel(): void {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'help-overlay';
        this.overlay.className = 'help-overlay';
        this.overlay.style.display = 'none';

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'help-panel';
        this.container.className = 'help-panel';

        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                e.preventDefault();
                this.hide();
            }
        });

        this.logger.debug('Help panel DOM created');
    }

    /**
     * Show the help panel
     */
    show(): void {
        this.logger.debug('Showing help panel');
        this.updateContent();
        this.overlay.style.display = 'flex';
        this.isVisible = true;
    }

    /**
     * Hide the help panel
     */
    hide(): void {
        this.logger.debug('Hiding help panel');
        this.overlay.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * Toggle help panel visibility
     */
    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Update help content based on current context
     */
    private updateContent(): void {
        const categories = this.getContextualHelp();

        let html = '<div class="help-header">';
        html += '<h2>Help & Commands</h2>';
        html += '<button class="help-close" onclick="document.getElementById(\'help-overlay\').click()">×</button>';
        html += '</div>';

        html += '<div class="help-content">';

        // Add context info if available
        if (this.gameStateService) {
            const gameState = this.gameStateService.getGameState();
            const currentScene = gameState.scenes[gameState.currentSceneId];

            if (currentScene) {
                html += '<div class="help-context">';
                html += `<p><strong>Current Location:</strong> ${this.escapeHtml(currentScene.title)}</p>`;
                html += '</div>';
            }
        }

        // Add categories
        categories.forEach(category => {
            html += `<div class="help-category">`;
            html += `<h3>${this.escapeHtml(category.title)}</h3>`;
            html += '<ul class="help-commands">';

            category.commands.forEach(cmd => {
                html += '<li>';
                html += `<span class="help-command-name">${this.escapeHtml(cmd.command)}</span>`;
                html += `<span class="help-command-desc">${this.escapeHtml(cmd.description)}</span>`;

                if (cmd.examples && cmd.examples.length > 0) {
                    html += '<div class="help-examples">';
                    html += '<span class="help-examples-label">Examples:</span> ';
                    html += cmd.examples.map(ex => `<code>${this.escapeHtml(ex)}</code>`).join(', ');
                    html += '</div>';
                }

                html += '</li>';
            });

            html += '</ul>';
            html += '</div>';
        });

        html += '</div>'; // help-content

        html += '<div class="help-footer">';
        html += '<p>Press <kbd>?</kbd> or <kbd>ESC</kbd> to close • <kbd>Ctrl+B</kbd> for context panel</p>';
        html += '</div>';

        this.container.innerHTML = html;
    }

    /**
     * Get contextual help based on current game state
     */
    private getContextualHelp(): HelpCategory[] {
        const categories: HelpCategory[] = [];

        // Basic commands (always shown)
        categories.push({
            title: 'Basic Commands',
            commands: [
                {
                    command: 'look / l',
                    description: 'Examine your surroundings in detail',
                    examples: ['look', 'l']
                },
                {
                    command: 'examine <item> / x <item>',
                    description: 'Look closely at a specific item',
                    examples: ['examine lamp', 'x mailbox']
                },
                {
                    command: 'inventory / i',
                    description: 'List what you\'re carrying',
                    examples: ['inventory', 'i']
                }
            ]
        });

        // Context-specific commands
        const contextCommands = this.getContextSpecificCommands();
        if (contextCommands.length > 0) {
            categories.push({
                title: 'Useful Here',
                commands: contextCommands
            });
        }

        // Movement commands
        categories.push({
            title: 'Movement',
            commands: [
                {
                    command: 'north / n, south / s, east / e, west / w',
                    description: 'Move in cardinal directions',
                    examples: ['north', 'n', 'go east']
                },
                {
                    command: 'up / u, down / d',
                    description: 'Move vertically',
                    examples: ['up', 'd']
                },
                {
                    command: 'enter / exit',
                    description: 'Enter or leave structures',
                    examples: ['enter house', 'exit']
                }
            ]
        });

        // Item manipulation
        categories.push({
            title: 'Items',
            commands: [
                {
                    command: 'take <item> / get <item>',
                    description: 'Pick up an item',
                    examples: ['take lamp', 'get all']
                },
                {
                    command: 'drop <item>',
                    description: 'Put down an item',
                    examples: ['drop sword', 'drop all']
                },
                {
                    command: 'open <item> / close <item>',
                    description: 'Open or close containers',
                    examples: ['open mailbox', 'close door']
                },
                {
                    command: 'read <item>',
                    description: 'Read written materials',
                    examples: ['read leaflet', 'read inscription']
                }
            ]
        });

        // Advanced commands
        categories.push({
            title: 'Advanced',
            commands: [
                {
                    command: 'turn on/off <item>',
                    description: 'Activate or deactivate items',
                    examples: ['turn on lamp', 'turn off lantern']
                },
                {
                    command: 'put <item> in <container>',
                    description: 'Place items in containers',
                    examples: ['put sword in case']
                },
                {
                    command: 'attack <target> with <weapon>',
                    description: 'Combat actions (use cautiously!)',
                    examples: ['attack troll with sword']
                },
                {
                    command: 'wait / z',
                    description: 'Pass time without moving',
                    examples: ['wait', 'z']
                }
            ]
        });

        // System commands
        categories.push({
            title: 'System',
            commands: [
                {
                    command: 'score',
                    description: 'Show your current score and rank',
                    examples: ['score']
                },
                {
                    command: 'help / ?',
                    description: 'Show this help panel',
                    examples: ['help', '?']
                },
                {
                    command: 'quit',
                    description: 'End the game',
                    examples: ['quit']
                }
            ]
        });

        return categories;
    }

    /**
     * Get commands that are especially useful in the current context
     */
    private getContextSpecificCommands(): HelpCommand[] {
        const commands: HelpCommand[] = [];

        if (!this.gameStateService) {
            return commands;
        }

        try {
            const gameState = this.gameStateService.getGameState();
            const currentScene = gameState.scenes[gameState.currentSceneId];

            if (!currentScene) {
                return commands;
            }

            const sceneState = gameState.sceneStates[gameState.currentSceneId];
            const itemsInScene = sceneState?.items || [];
            const inventory = gameState.inventory || [];

            // Suggest taking items if there are portable items in the scene
            const portableItems = itemsInScene.filter(itemId => {
                const item = gameState.items[itemId];
                return item && item.visible && item.portable;
            });

            if (portableItems.length > 0) {
                const itemNames = portableItems
                    .map(id => gameState.items[id]?.name)
                    .filter(name => name)
                    .slice(0, 3);

                commands.push({
                    command: 'take <item>',
                    description: `Pick up items you see here`,
                    examples: itemNames.map(name => `take ${name}`)
                });
            }

            // Suggest examining items if there are visible items
            const visibleItems = itemsInScene.filter(itemId => {
                const item = gameState.items[itemId];
                return item && item.visible;
            });

            if (visibleItems.length > 0) {
                const itemNames = visibleItems
                    .map(id => gameState.items[id]?.name)
                    .filter(name => name)
                    .slice(0, 2);

                if (itemNames.length > 0) {
                    commands.push({
                        command: 'examine <item>',
                        description: 'Look more closely at things here',
                        examples: itemNames.map(name => `examine ${name}`)
                    });
                }
            }

            // Suggest movement if there are available exits
            const visibleExits = currentScene.exits.filter(exit => !exit.hidden);
            if (visibleExits.length > 0) {
                const exitDirs = visibleExits
                    .map(exit => exit.direction.toLowerCase())
                    .slice(0, 3);

                commands.push({
                    command: '<direction>',
                    description: 'Explore available exits',
                    examples: exitDirs
                });
            }

            // If inventory is getting full, suggest dropping items
            if (inventory.length > 5) {
                commands.push({
                    command: 'drop <item>',
                    description: 'Your inventory is getting full',
                    examples: ['drop <item>']
                });
            }

            // If it's dark, suggest light
            if (currentScene.lighting === LightingCondition.DARK || currentScene.lighting === LightingCondition.PITCH_BLACK) {
                commands.push({
                    command: 'turn on lamp',
                    description: 'It\'s dark here - you might need light',
                    examples: ['turn on lamp']
                });
            }

        } catch (error) {
            this.logger.error('Error getting context-specific commands:', error);
        }

        return commands;
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Check if help panel is currently visible
     */
    get visible(): boolean {
        return this.isVisible;
    }
}
