import { BaseCommand } from './BaseCommand';
import { CommandResult } from '../types/CommandTypes';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService
} from '@/services/interfaces';
import log from 'loglevel';

/**
 * Take Command
 * 
 * Handles picking up items from the current scene:
 * - "take <object>" / "get <object>" - Pick up an item
 * - "pick up <object>" / "grab <object>" - Same as take
 * - Moves item from scene to player's inventory
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
    logger?: log.Logger
  ) {
    super(
      'take',
      ['get', 'pick', 'grab'],
      'take <object>',
      'Pick up an object and add it to your inventory.',
      gameState,
      scene,
      inventory,
      items,
      combat,
      persistence,
      output,
      logger
    );
  }

  /**
   * Execute the take command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing take command: "${input}"`);

    // 1. Parse input using existing helper
    const targetName = this.parseTargetName(input);
    if (!targetName) {
      return this.failure('Take what?');
    }

    // 2. Find item using BaseCommand method (handles scene, containers, inventory)
    const targetId = this.findItemId(targetName);
    if (!targetId) {
      return this.failure(`You don't see ${this.getArticle(targetName)} ${targetName} here.`);
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

    return this.success(takeResult.message, true, 0);
  }

  /**
   * Parse target name from input, handling "pick up" syntax
   */
  private parseTargetName(input: string): string | null {
    const args = this.getArgs(input);
    if (args.length === 0) {
      return null;
    }

    // Handle "pick up" as two words
    if (args[0] === 'up' && args.length > 1) {
      return args.slice(1).join(' ').toLowerCase();
    } else {
      return args.join(' ').toLowerCase();
    }
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
        const isOpen = container?.state?.isOpen || (container as any)?.isOpen || false;
        
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