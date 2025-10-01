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
    scoring: IScoringService,
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
      scoring,
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
        return this.failure('Read what?');
      }
      
      const targetName = args.join(' ').toLowerCase();
      this.logger.debug(`Looking for item to read: "${targetName}"`);
      
      // Check for self-reference
      if (this.isSelfReference(targetName)) {
        return this.failure('You can\'t read yourself!');
      }
      
      // Find the item to read
      const itemId = this.findItemId(targetName);
      if (!itemId) {
        return this.failure(`You don't see any ${targetName} here.`);
      }
      
      this.logger.debug(`Found item to read: ${itemId}`);
      
      // Get the readable content (this will handle readability check internally)
      const readableContent = this.items.readItem(itemId);
      
      // ItemService.readItem returns specific error messages for non-readable items
      if (readableContent === "You can't read that." || readableContent === "You don't see that here.") {
        return this.failure(readableContent);
      }
      
      if (readableContent === "There's nothing written on it.") {
        return this.failure('There is nothing written on it.');
      }
      
      // Return the readable content
      const result = this.success(readableContent, false);
      this.logExecutionSuccess(result);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while reading.';
      this.logExecutionError(error as Error, input);
      return this.failure(errorMessage);
    }
  }

  /**
   * Get suggestions for read completion
   */
  override getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const words = input.toLowerCase().trim().split(/\s+/);
    const firstWord = words[0] || '';

    // Only provide suggestions for this command's verb
    if (firstWord !== 'read' && firstWord !== '') {
      return [];
    }

    if (input === '' || firstWord === '') {
      return ['read'];
    }

    // Get readable items from current scene and inventory
    const currentSceneId = this.gameState.getCurrentScene();
    const readableItems = this.items.getReadableItemsInScene(currentSceneId);
    const inventoryItems = this.items.getInventoryItems();

    // Combine scene and inventory items
    const allReadableItems = [...readableItems, ...inventoryItems];

    // Generate suggestions with metadata
    allReadableItems.forEach(item => {
      if (item && item.name) {
        // Check if item is actually readable
        const readResult = this.items.readItem(item.id);
        if (readResult !== "You can't read that." && readResult !== "You don't see that here.") {
          // Build metadata string for parsing in GameInterface
          const metadata: string[] = [];

          // Add item type
          if (item.type) {
            metadata.push(`itemType:${item.type.toLowerCase()}`);
          }

          // Format: "command|metadata1|metadata2"
          const suggestionText = metadata.length > 0
            ? `read ${item.name}|${metadata.join('|')}`
            : `read ${item.name}`;

          suggestions.push(suggestionText);
        }
      }
    });

    return suggestions;
  }
}