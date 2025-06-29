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
 * Read Command
 * 
 * Handles reading textual content on objects:
 * - "read <object>" - Read text written on objects
 * - Shows readable content like text on leaflets, books, signs, etc.
 * - Different from examine - this is specifically for reading text
 * - Only works on items that have readable content
 * 
 * This is the authentic Zork READ command - separate from EXAMINE.
 */
export class ReadCommand extends BaseCommand {
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
      'read',
      [],
      'read <object>',
      'Read text written on an object.',
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
   * Execute the read command
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);
    
    try {
      const args = this.getArgs(input);
      this.logger.debug(`Parsed args: [${args.join(', ')}]`);
      
      // Must have target to read
      if (args.length === 0) {
        return this.failure('Read what?', false);
      }
      
      const targetName = args.join(' ').toLowerCase();
      this.logger.debug(`Looking for item to read: "${targetName}"`);
      
      // Check for self-reference
      if (this.isSelfReference(targetName)) {
        return this.failure('You can\'t read yourself!', false);
      }
      
      // Find the item to read
      const itemId = this.findItemId(targetName);
      if (!itemId) {
        return this.failure(`You don't see any ${targetName} here.`, false);
      }
      
      this.logger.debug(`Found item to read: ${itemId}`);
      
      // Get the readable content (this will handle readability check internally)
      const readableContent = this.items.readItem(itemId);
      
      // ItemService.readItem returns specific error messages for non-readable items
      if (readableContent === "You can't read that." || readableContent === "You don't see that here.") {
        return this.failure(readableContent, false);
      }
      
      if (readableContent === "There's nothing written on it.") {
        return this.failure('There is nothing written on it.', false);
      }
      
      // Return the readable content
      const result = this.success(readableContent, false);
      this.logExecutionSuccess(result);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while reading.';
      this.logExecutionError(error as Error, input);
      return this.failure(errorMessage, false);
    }
  }

  /**
   * Get suggestions for read completion
   */
  override getSuggestions(input: string): string[] {
    if (input === '') {
      return ['read'];
    }

    // Get readable items from current scene and inventory
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    const inventoryItems = this.inventory.getItems();
    const allItems = [...sceneItems, ...inventoryItems];

    const readableItems: string[] = [];
    
    for (const itemId of allItems) {
      // Check if item is readable by testing the readItem result
      const readResult = this.items.readItem(itemId);
      if (readResult !== "You can't read that." && readResult !== "You don't see that here.") {
        const item = this.gameState.getItem(itemId);
        if (item) {
          readableItems.push(item.name);
          if (item.aliases) {
            readableItems.push(...item.aliases);
          }
        }
      }
    }

    // Filter based on input
    const matchingItems = readableItems.filter(name => 
      name.toLowerCase().startsWith(input.toLowerCase())
    );

    return ['read', ...matchingItems];
  }
}