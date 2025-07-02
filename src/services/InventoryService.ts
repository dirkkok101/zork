import { IInventoryService } from './interfaces/IInventoryService';
import { IGameStateService } from './interfaces/IGameStateService';
import log from 'loglevel';

/**
 * Inventory Service
 * Manages the player's inventory and carrying capacity
 */
export class InventoryService implements IInventoryService {
  private logger: log.Logger;
  private maxItems: number = 20; // Default carrying capacity
  private maxWeight: number = 100; // Default weight limit

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('InventoryService');
  }

  /**
   * Get list of item IDs currently carried by the player
   */
  getItems(): string[] {
    // For now, get from game state - in a full implementation this might
    // be stored differently or calculated from item locations
    const currentGameState = this.gameState.getGameState();
    return currentGameState.inventory || [];
  }

  /**
   * Check if player has a specific item
   */
  hasItem(itemId: string): boolean {
    return this.getItems().includes(itemId);
  }

  /**
   * Get current number of items carried
   */
  getItemCount(): number {
    return this.getItems().length;
  }

  /**
   * Add item to player's inventory
   */
  addItem(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      this.logger.warn(`Cannot add non-existent item to inventory: ${itemId}`);
      return false;
    }

    if (this.hasItem(itemId)) {
      this.logger.debug(`Item ${itemId} is already in inventory`);
      return false;
    }

    // Check carrying capacity
    if (!this.canCarryMore()) {
      this.logger.debug(`Cannot add item ${itemId} - at carrying capacity`);
      return false;
    }

    // Check weight limit
    const currentWeight = this.getCurrentWeight();
    if (currentWeight + item.weight > this.maxWeight) {
      this.logger.debug(`Cannot add item ${itemId} - would exceed weight limit`);
      return false;
    }

    // Add to inventory
    const currentGameState = this.gameState.getGameState();
    const newInventory = [...(currentGameState.inventory || []), itemId];
    
    // Update game state
    this.gameState.setGameState({
      ...currentGameState,
      inventory: newInventory
    });

    // Update item location
    this.gameState.updateItemState(itemId, { currentLocation: 'inventory' });
    
    this.logger.debug(`Added item ${itemId} to inventory`);
    return true;
  }

  /**
   * Remove item from player's inventory
   */
  removeItem(itemId: string): boolean {
    if (!this.hasItem(itemId)) {
      this.logger.debug(`Item ${itemId} is not in inventory`);
      return false;
    }

    // Remove from inventory
    const currentGameState = this.gameState.getGameState();
    const newInventory = (currentGameState.inventory || []).filter((id: string) => id !== itemId);
    
    // Update game state
    this.gameState.setGameState({
      ...currentGameState,
      inventory: newInventory
    });

    this.logger.debug(`Removed item ${itemId} from inventory`);
    return true;
  }

  /**
   * Check if player can carry more items
   */
  canCarryMore(): boolean {
    return this.getItemCount() < this.maxItems;
  }

  /**
   * Get formatted inventory description for display
   */
  getInventoryDescription(): string {
    const items = this.getItems();
    
    if (items.length === 0) {
      return "You are empty-handed.";
    }

    const itemNames = items
      .map(itemId => this.gameState.getItem(itemId))
      .filter(item => item !== undefined)
      .map(item => item!.name);

    if (itemNames.length === 0) {
      return "You are empty-handed.";
    }

    if (itemNames.length === 1) {
      return `You are carrying ${itemNames[0]}.`;
    }

    if (itemNames.length === 2) {
      return `You are carrying ${itemNames[0]} and ${itemNames[1]}.`;
    }

    const allButLast = itemNames.slice(0, -1).join(', ');
    return `You are carrying ${allButLast}, and ${itemNames[itemNames.length - 1]}.`;
  }

  /**
   * Get current total weight of carried items
   */
  getCurrentWeight(): number {
    return this.getItems()
      .map(itemId => this.gameState.getItem(itemId))
      .filter(item => item !== undefined)
      .reduce((total, item) => total + (item!.weight || 0), 0);
  }

  /**
   * Check if player has a light load (for narrow passages like attic chimney)
   * Based on original Zork LIGHT-LOAD condition
   */
  hasLightLoad(): boolean {
    const currentWeight = this.getCurrentWeight();
    // Based on analysis: player with 32 weight units was blocked,
    // so threshold should be much lower for "light" load
    const LIGHT_LOAD_THRESHOLD = 15;
    return currentWeight <= LIGHT_LOAD_THRESHOLD;
  }

  /**
   * Check if player is empty-handed (for very narrow passages)
   * Based on original Zork EMPTY-HANDED condition
   */
  isEmptyHanded(): boolean {
    return this.getItems().length === 0;
  }

  /**
   * Set maximum number of items that can be carried
   */
  setMaxItems(maxItems: number): void {
    this.maxItems = maxItems;
    this.logger.debug(`Maximum items set to ${maxItems}`);
  }

  /**
   * Set maximum weight that can be carried
   */
  setMaxWeight(maxWeight: number): void {
    this.maxWeight = maxWeight;
    this.logger.debug(`Maximum weight set to ${maxWeight}`);
  }
}