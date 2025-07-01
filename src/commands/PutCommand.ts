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
 * Put Command
 * 
 * Handles sophisticated item placement operations:
 * - "put <object> in <container>" - Place item in container
 * - "put <object> on <object>" - Place item on surface
 * - "put <object> under <object>" - Place item under object
 * - "put down <object>" - Same as drop command
 * 
 * Based on authentic Zork behavior where PUT routes to PUTTER function
 * for sophisticated placement operations.
 */
export class PutCommand extends BaseCommand {
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
      'put',
      ['place', 'position', 'set'],
      'put <object> in <container>',
      'Place an item in a container or specific location.',
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
   * Execute the put command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing put command: "${input}"`);

    const args = this.getArgs(input);
    if (args.length === 0) {
      return this.failure('Put what?');
    }

    // Handle "put down <object>" - simple drop behavior
    if (args[0]?.toLowerCase() === 'down' && args.length > 1) {
      return this.handlePutDown(args.slice(1).join(' '));
    }

    // Use BaseCommand helper to parse arguments properly
    const parsed = this.parseArgsWithObjectAndPreposition(args);
    
    if (!parsed.object) {
      return this.failure('Put what?');
    }

    if (!parsed.preposition) {
      return this.failure('Put it where? Try "put <object> in <container>".');
    }

    if (!parsed.target) {
      return this.failure(`Put it ${parsed.preposition} what?`);
    }

    return this.handlePutWithTarget(parsed.object, parsed.preposition, parsed.target);
  }

  /**
   * Handle "put down <object>" - delegates to simple drop behavior
   */
  private handlePutDown(itemName: string): CommandResult {
    const itemId = this.findItemInInventory(itemName);
    if (!itemId) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    const item = this.gameState.getItem(itemId);
    if (!item) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    // Use InventoryService properly
    const removeSuccess = this.inventory.removeItem(itemId);
    if (!removeSuccess) {
      return this.failure(`You can't put down the ${item.name} right now.`);
    }

    // Add to current scene
    const currentSceneId = this.gameState.getCurrentScene();
    this.scene.addItemToScene(currentSceneId, itemId);
    
    return this.success(`You put down the ${item.name}.`, true, 0);
  }

  /**
   * Handle placement with target object
   * 
   * Architecture: This method delegates to ItemService for all placement logic
   * - ItemService: Handles all placement rules, validation, and execution
   * - InventoryService: Manages inventory operations with automatic transaction safety
   */
  private handlePutWithTarget(itemName: string, preposition: string, targetName: string): CommandResult {
    // 1. Find and validate item in inventory
    const itemId = this.findItemInInventory(itemName);
    if (!itemId) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    const item = this.gameState.getItem(itemId);
    if (!item) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    // 2. Find and validate target object (in scene or inventory)
    const targetId = this.findItemId(targetName);
    if (!targetId) {
      return this.failure(`You don't see ${this.getArticle(targetName)} ${targetName} here.`);
    }

    // 3. Let ItemService handle the entire placement operation
    const putResult = this.items.putItem(itemId, targetId, preposition);
    if (!putResult.success) {
      return this.failure(putResult.message);
    }

    // 4. If ItemService succeeded, handle inventory/scene management
    return this.executeItemMovement(itemId, targetId, preposition, putResult.message);
  }

  /**
   * Execute the inventory and scene management after ItemService validates placement
   */
  private executeItemMovement(itemId: string, targetId: string, preposition: string, successMessage: string): CommandResult {
    // Remove from inventory - ItemService already validated the operation
    const removeSuccess = this.inventory.removeItem(itemId);
    if (!removeSuccess) {
      return this.failure(`You can't move that item right now.`);
    }

    // For container placement, the item is already in the container (ItemService handled it)
    // For spatial placement (on/under), add to scene
    if (preposition !== 'in' || !this.items.isContainer(targetId)) {
      const currentSceneId = this.gameState.getCurrentScene();
      this.scene.addItemToScene(currentSceneId, itemId);
    }
    
    // Handle scoring for treasury/trophy case deposits
    let scoreChange = 0;
    if (preposition === 'in' && this.scoring.isTreasure(itemId)) {
      const targetItem = this.gameState.getItem(targetId);
      // Check if target is trophy case (tcase ID in extracted data)
      if (targetItem && (targetId === 'tcase' || targetId === 'case' || targetItem.name?.toLowerCase().includes('trophy'))) {
        const depositScore = this.scoring.calculateDepositScore(itemId);
        if (depositScore > 0) {
          scoreChange = depositScore;
          this.gameState.addScore(depositScore);
          
          // Mark treasure as deposited for tracking
          this.scoring.markTreasureDeposited(itemId);
          
          this.logger.info(`Treasure deposited! ${itemId} awarded ${depositScore} additional points`);
        }
      }
    }
    
    return this.success(successMessage, true, scoreChange);
  }
}