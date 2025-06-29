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
} from '../services/interfaces';
import log from 'loglevel';

/**
 * Drop Command
 * 
 * Handles simple dropping of items to current scene:
 * - "drop <object>" - Drop item to current scene  
 * - "drop <object> down" - Same as drop
 * 
 * For advanced placement operations like "drop <object> in <container>",
 * the player should use the PUT command instead.
 * 
 * Based on authentic Zork behavior where simple DROP routes to DROPPER function.
 */
export class DropCommand extends BaseCommand {
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
      'drop',
      ['place', 'leave'],
      'drop <object>',
      'Drop an item from your inventory to the current location.',
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
   * Execute the drop command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing drop command: "${input}"`);

    const args = this.getArgs(input);
    if (args.length === 0) {
      return this.failure('Drop what?');
    }

    // Check for prepositions that should route to PUT command
    const prepositions = ['in', 'on', 'under'];
    const hasPreposition = prepositions.some(prep => 
      args.some(arg => arg.toLowerCase() === prep)
    );
    
    if (hasPreposition) {
      return this.failure('For putting items in containers or on objects, use the PUT command instead.');
    }

    // Parse item name, handling "drop <item> down" syntax
    let itemName: string;
    if (args[args.length - 1]?.toLowerCase() === 'down') {
      itemName = args.slice(0, -1).join(' ').toLowerCase();
    } else {
      itemName = args.join(' ').toLowerCase();
    }

    if (!itemName) {
      return this.failure('Drop what?');
    }

    // Find the item in inventory
    const itemId = this.findItemInInventory(itemName);
    if (!itemId) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    const item = this.gameState.getItem(itemId);
    if (!item) {
      return this.failure(`You don't have ${this.getArticle(itemName)} ${itemName}.`);
    }

    // Use InventoryService to remove item properly
    const removeSuccess = this.inventory.removeItem(itemId);
    if (!removeSuccess) {
      return this.failure(`You can't drop the ${item.name} right now.`);
    }

    // Add item to current scene
    const currentSceneId = this.gameState.getCurrentScene();
    this.scene.addItemToScene(currentSceneId, itemId);
    
    return this.success(`You drop the ${item.name}.`, true, 0);
  }
}