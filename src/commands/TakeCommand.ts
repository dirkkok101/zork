import { BaseCommand } from './BaseCommand';
import { CommandResult } from '../types/CommandTypes';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService,
  IScoringService
} from '../services/interfaces';
import log from 'loglevel';

/**
 * Take Command
 * 
 * Handles picking up items from the current scene or containers:
 * - "take <object>" / "get <object>" - Pick up an item from scene
 * - "take <object> from <container>" - Take item from specific container
 * - "pick up <object>" / "grab <object>" - Same as take
 * - Moves item from scene/container to player's inventory
 * - Validates item is portable and visible
 * 
 * For dropping items, use the drop command.
 */
export class TakeCommand extends BaseCommand {
  constructor(
    gameState: IGameStateService,
    scene: ISceneService,
    inventory: IInventoryService,
    items: IItemService,
    combat: ICombatService,
    persistence: IPersistenceService,
    output: IOutputService,
    scoring: IScoringService,
    logger?: log.Logger
  ) {
    super(
      'take',
      ['get', 'pick', 'grab'],
      'take <object> [from <container>]',
      'Pick up an object and add it to your inventory.',
      gameState,
      scene,
      inventory,
      items,
      combat,
      persistence,
      output,
      scoring,
      logger
    );
  }

  /**
   * Execute the take command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing take command: "${input}"`);

    // 1. Parse input to handle "take <item> from <container>" syntax
    const parseResult = this.parseTakeCommand(input);
    if (!parseResult.success) {
      return this.failure(parseResult.message);
    }

    const { targetName, containerName } = parseResult;

    // 2. Find item - if container specified, look only in that container
    const targetId = containerName ? 
      this.findItemInContainer(targetName!, containerName) : 
      this.findItemId(targetName!);
      
    if (!targetId) {
      const locationText = containerName ? ` in the ${containerName}` : ' here';
      return this.failure(`You don't see ${this.getArticle(targetName!)} ${targetName!}${locationText}.`);
    }

    // 3. Check if already in inventory using InventoryService
    if (this.inventory.hasItem(targetId)) {
      const item = this.gameState.getItem(targetId);
      return this.failure(`You already have the ${item?.name}.`);
    }

    // 4. Validate take operation using ItemService
    const takeResult = this.items.takeItem(targetId);
    if (!takeResult.success) {
      return this.failure(takeResult.message);
    }

    // 5. Remember current location for potential rollback
    const currentLocation = this.getItemCurrentLocation(targetId);

    // 6. Remove item from current location using appropriate service
    this.removeItemFromCurrentLocation(targetId);

    // 7. Add to inventory using InventoryService with capacity checking
    const addSuccess = this.inventory.addItem(targetId);
    if (!addSuccess) {
      // Rollback: put item back where it was
      this.restoreItemToLocation(targetId, currentLocation);
      return this.failure("You can't carry any more items.");
    }

    // 8. Handle scoring for treasures
    let scoreChange = 0;
    if (this.scoring.isTreasure(targetId)) {
      const treasureScore = this.scoring.calculateTreasureScore(targetId);
      if (treasureScore > 0) {
        scoreChange = treasureScore;
        this.gameState.addScore(treasureScore);
        
        // Mark treasure as found for tracking
        this.scoring.markTreasureFound(targetId);
        
        this.logger.info(`Treasure found! ${targetId} awarded ${treasureScore} points`);
      }
    }

    return this.success(takeResult.message, true, scoreChange);
  }

  /**
   * Parse take command variations including "take <item> from <container>"
   */
  private parseTakeCommand(input: string): { 
    success: boolean; 
    message: string; 
    targetName?: string; 
    containerName?: string 
  } {
    const args = this.getArgs(input);
    if (args.length === 0) {
      return { success: false, message: 'Take what?' };
    }

    // Handle "pick up" as two words
    let startIndex = 0;
    if (args[0] === 'up') {
      startIndex = 1;
      if (args.length === 1) {
        return { success: false, message: 'Pick up what?' };
      }
    }

    // Look for "from" keyword
    const fromIndex = args.findIndex((arg, index) => 
      index >= startIndex && arg.toLowerCase() === 'from'
    );

    if (fromIndex === -1) {
      // Simple "take <item>" or "pick up <item>"
      const targetName = args.slice(startIndex).join(' ').toLowerCase();
      return { success: true, message: '', targetName };
    }

    if (fromIndex === startIndex) {
      // Invalid: "take from" or "pick up from"
      return { success: false, message: 'Take what from where?' };
    }

    if (fromIndex === args.length - 1) {
      // Invalid: ends with "from"
      return { success: false, message: 'Take from what?' };
    }

    // "take <item> from <container>"
    const targetName = args.slice(startIndex, fromIndex).join(' ').toLowerCase();
    const containerName = args.slice(fromIndex + 1).join(' ').toLowerCase();
    
    return { 
      success: true, 
      message: '', 
      targetName, 
      containerName 
    };
  }

  /**
   * Find item specifically within a named container
   */
  private findItemInContainer(itemName: string, containerName: string): string | null {
    // Find the container first
    const containerId = this.findItemId(containerName);
    if (!containerId) {
      return null;
    }

    // Check if it's actually a container
    if (!this.items.isContainer(containerId)) {
      return null;
    }

    // Check if container is accessible (open or doesn't need opening)
    const containerItem = this.gameState.getItem(containerId);
    if (!containerItem) {
      return null;
    }

    const needsOpening = this.items.canOpen(containerId);
    const isOpen = this.items.isContainerOpen(containerId);
    
    if (needsOpening && !isOpen) {
      return null; // Container is closed
    }

    // Get container contents and search for the item
    const contents = this.items.getContainerContents(containerId);
    
    for (const itemId of contents) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, itemName)) {
        return itemId;
      }
    }

    return null;
  }

  /**
   * Get current location of an item for rollback purposes
   */
  private getItemCurrentLocation(itemId: string): { type: 'scene' | 'container'; containerId?: string } {
    const currentSceneId = this.gameState.getCurrentScene();
    
    // Check if item is in a container
    const containerInfo = this.findItemContainer(itemId, currentSceneId);
    if (containerInfo) {
      return { type: 'container', containerId: containerInfo.containerId };
    } else {
      return { type: 'scene' };
    }
  }

  /**
   * Remove item from its current location using appropriate service
   */
  private removeItemFromCurrentLocation(itemId: string): void {
    const currentSceneId = this.gameState.getCurrentScene();
    
    // Check if item is in a container first
    const containerInfo = this.findItemContainer(itemId, currentSceneId);
    if (containerInfo) {
      this.items.removeFromContainer(containerInfo.containerId, itemId);
    } else {
      // Item is directly in the scene
      this.scene.removeItemFromScene(currentSceneId, itemId);
    }
  }

  /**
   * Find which container (if any) contains the specified item
   */
  private findItemContainer(itemId: string, sceneId: string): { containerId: string } | null {
    const sceneItems = this.scene.getSceneItems(sceneId);
    
    for (const sceneItemId of sceneItems) {
      if (this.items.isContainer(sceneItemId)) {
        const container = this.gameState.getItem(sceneItemId);
        const isOpen = container?.state?.open || false;
        
        if (isOpen && this.items.getContainerContents(sceneItemId).includes(itemId)) {
          return { containerId: sceneItemId };
        }
      }
    }
    
    return null;
  }

  /**
   * Restore item to its previous location (for rollback)
   */
  private restoreItemToLocation(itemId: string, location: { type: 'scene' | 'container'; containerId?: string }): void {
    if (location.type === 'container' && location.containerId) {
      this.items.addToContainer(location.containerId, itemId);
    } else {
      const currentSceneId = this.gameState.getCurrentScene();
      this.scene.addItemToScene(currentSceneId, itemId);
    }
  }
}