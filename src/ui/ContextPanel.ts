/**
 * Context Panel Component
 *
 * Displays current game context in a sidebar:
 * - Current location
 * - Available exits
 * - Items in current scene
 * - Player inventory
 */

import { IGameStateService, ISceneService } from '../services/interfaces';
import { Scene, Exit } from '../types/SceneTypes';
import { Item } from '../types/ItemTypes';
import * as log from 'loglevel';

export class ContextPanel {
    private panelElement: HTMLElement;
    private gameStateService!: IGameStateService;
    private sceneService!: ISceneService;
    private logger: log.Logger;
    private onItemClick: (itemName: string) => void;
    private isCollapsed = false;

    // Sub-elements
    private locationElement!: HTMLElement;
    private exitsElement!: HTMLElement;
    private itemsElement!: HTMLElement;
    private inventoryElement!: HTMLElement;
    private collapseButton!: HTMLElement;

    constructor(
        onItemClick: (itemName: string) => void,
        logger?: log.Logger
    ) {
        this.onItemClick = onItemClick;
        this.logger = logger || log.getLogger('ContextPanel');
        this.panelElement = this.createPanelElement();
        this.setupEventListeners();
    }

    /**
     * Create the panel DOM structure
     */
    private createPanelElement(): HTMLElement {
        const panel = document.createElement('aside');
        panel.id = 'context-panel';
        panel.className = 'context-panel';

        // Collapse button
        const collapseBtn = document.createElement('button');
        collapseBtn.id = 'collapse-button';
        collapseBtn.className = 'collapse-button';
        collapseBtn.title = 'Toggle sidebar (Ctrl+B)';
        collapseBtn.innerHTML = '◀';
        this.collapseButton = collapseBtn;

        // Location section
        const locationSection = document.createElement('div');
        locationSection.className = 'context-section location-section';
        locationSection.innerHTML = `
            <h3 class="context-heading">LOCATION</h3>
            <div id="context-location" class="context-content"></div>
        `;
        this.locationElement = locationSection.querySelector('#context-location')!;

        // Exits section
        const exitsSection = document.createElement('div');
        exitsSection.className = 'context-section exits-section';
        exitsSection.innerHTML = `
            <h3 class="context-heading">EXITS</h3>
            <div id="context-exits" class="context-content"></div>
        `;
        this.exitsElement = exitsSection.querySelector('#context-exits')!;

        // Items section
        const itemsSection = document.createElement('div');
        itemsSection.className = 'context-section items-section';
        itemsSection.innerHTML = `
            <h3 class="context-heading">ITEMS HERE</h3>
            <div id="context-items" class="context-content"></div>
        `;
        this.itemsElement = itemsSection.querySelector('#context-items')!;

        // Inventory section
        const inventorySection = document.createElement('div');
        inventorySection.className = 'context-section inventory-section';
        inventorySection.innerHTML = `
            <h3 class="context-heading">INVENTORY</h3>
            <div id="context-inventory" class="context-content"></div>
        `;
        this.inventoryElement = inventorySection.querySelector('#context-inventory')!;

        // Assemble panel
        panel.appendChild(collapseBtn);
        panel.appendChild(locationSection);
        panel.appendChild(exitsSection);
        panel.appendChild(itemsSection);
        panel.appendChild(inventorySection);

        return panel;
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Collapse button
        this.collapseButton.addEventListener('click', () => {
            this.toggle();
        });

        // Keyboard shortcut (Ctrl+B)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Initialize the panel with game state service
     */
    initialize(gameStateService: IGameStateService, sceneService: ISceneService, containerElement: HTMLElement): void {
        this.gameStateService = gameStateService;
        this.sceneService = sceneService;
        containerElement.appendChild(this.panelElement);
        this.update();
        this.logger.debug('Context panel initialized');
    }

    /**
     * Update the panel with current game state
     */
    update(): void {
        if (!this.gameStateService) {
            this.logger.warn('Cannot update context panel: game state service not initialized');
            return;
        }

        try {
            const gameState = this.gameStateService.getGameState();
            const currentScene = gameState.scenes[gameState.currentSceneId];

            if (!currentScene) {
                this.logger.error(`Current scene not found: ${gameState.currentSceneId}`);
                return;
            }

            this.updateLocation(currentScene);
            this.updateExits(currentScene);
            this.updateItems(currentScene, gameState.currentSceneId);
            this.updateInventory(gameState.inventory);

            this.logger.debug('Context panel updated');
        } catch (error) {
            this.logger.error('Error updating context panel:', error);
        }
    }

    /**
     * Update location display
     */
    private updateLocation(scene: Scene): void {
        this.locationElement.textContent = scene.title || 'Unknown Location';
    }

    /**
     * Update exits display
     */
    private updateExits(scene: Scene): void {
        this.exitsElement.innerHTML = '';

        // Get contextually available exits (respects doors, locks, conditions)
        const availableExits = this.sceneService.getAvailableExits(scene.id);

        if (availableExits.length === 0) {
            this.exitsElement.innerHTML = '<div class="empty-state">No obvious exits</div>';
            return;
        }

        const exitList = document.createElement('ul');
        exitList.className = 'exit-list';

        availableExits.forEach(exit => {
            const exitItem = document.createElement('li');
            exitItem.className = 'exit-item clickable';
            exitItem.dataset.direction = exit.direction;

            const directionSpan = document.createElement('span');
            directionSpan.className = 'exit-direction';
            directionSpan.textContent = `${this.getDirectionArrow(exit.direction)} ${this.capitalizeFirst(exit.direction)}`;

            // Add destination hint if available
            if (exit.to) {
                const gameState = this.gameStateService.getGameState();
                const destScene = gameState.scenes[exit.to];
                if (destScene && gameState.sceneStates[exit.to]?.visited) {
                    const destHint = document.createElement('span');
                    destHint.className = 'exit-destination';
                    destHint.textContent = ` (${destScene.title})`;
                    directionSpan.appendChild(destHint);
                }
            }

            exitItem.appendChild(directionSpan);

            // Click handler
            exitItem.addEventListener('click', () => {
                this.onItemClick(exit.direction);
            });

            exitList.appendChild(exitItem);
        });

        this.exitsElement.appendChild(exitList);
    }

    /**
     * Update items display
     */
    private updateItems(scene: Scene, currentSceneId: string): void {
        this.itemsElement.innerHTML = '';

        // Get visible items from SceneService
        const itemsInScene: string[] = this.sceneService.getSceneItems(currentSceneId);

        if (itemsInScene.length === 0) {
            this.itemsElement.innerHTML = '<div class="empty-state">Nothing of interest</div>';
            return;
        }

        const gameState = this.gameStateService.getGameState();
        const itemList = document.createElement('ul');
        itemList.className = 'item-list';

        itemsInScene.forEach(itemId => {
            const item = gameState.items[itemId];
            if (!item) return;

            const itemElement = document.createElement('li');
            itemElement.className = 'item clickable';
            itemElement.dataset.itemId = itemId;

            const itemSpan = document.createElement('span');
            itemSpan.className = 'item-name';
            itemSpan.textContent = `• ${item.name}`;

            itemElement.appendChild(itemSpan);

            // Click handler
            itemElement.addEventListener('click', () => {
                this.onItemClick(`examine ${item.name}`);
            });

            itemList.appendChild(itemElement);
        });

        this.itemsElement.appendChild(itemList);
    }

    /**
     * Update inventory display
     */
    private updateInventory(inventoryItemIds: string[]): void {
        this.inventoryElement.innerHTML = '';

        if (inventoryItemIds.length === 0) {
            this.inventoryElement.innerHTML = '<div class="empty-state">Empty</div>';
            return;
        }

        const gameState = this.gameStateService.getGameState();
        const inventoryList = document.createElement('ul');
        inventoryList.className = 'inventory-list';

        inventoryItemIds.forEach(itemId => {
            const item = gameState.items[itemId];
            if (!item) return;

            const itemElement = document.createElement('li');
            itemElement.className = 'inventory-item clickable';
            itemElement.dataset.itemId = itemId;

            const itemSpan = document.createElement('span');
            itemSpan.className = 'inventory-item-name';
            itemSpan.textContent = `◆ ${item.name}`;

            // Add state indicator if item has interesting state
            if (item.state && Object.keys(item.state).length > 0) {
                const stateSpan = document.createElement('span');
                stateSpan.className = 'item-state';

                // Common state indicators
                if (item.state.on === true) {
                    stateSpan.textContent = ' (on)';
                } else if (item.state.on === false) {
                    stateSpan.textContent = ' (off)';
                } else if (item.state.open === true) {
                    stateSpan.textContent = ' (open)';
                } else if (item.state.open === false) {
                    stateSpan.textContent = ' (closed)';
                }

                itemSpan.appendChild(stateSpan);
            }

            itemElement.appendChild(itemSpan);

            // Click handler
            itemElement.addEventListener('click', () => {
                this.onItemClick(item.name);
            });

            inventoryList.appendChild(itemElement);
        });

        this.inventoryElement.appendChild(inventoryList);
    }

    /**
     * Toggle panel visibility
     */
    toggle(): void {
        this.isCollapsed = !this.isCollapsed;
        this.panelElement.classList.toggle('collapsed', this.isCollapsed);
        this.collapseButton.innerHTML = this.isCollapsed ? '▶' : '◀';
        this.logger.debug(`Context panel ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
    }

    /**
     * Get arrow for direction
     */
    private getDirectionArrow(direction: string): string {
        const arrows: Record<string, string> = {
            'north': '↑',
            'south': '↓',
            'east': '→',
            'west': '←',
            'up': '⇧',
            'down': '⇩',
            'in': '→',
            'out': '←'
        };
        return arrows[direction.toLowerCase()] || '→';
    }

    /**
     * Capitalize first letter
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Destroy the panel
     */
    destroy(): void {
        this.panelElement.remove();
    }
}
