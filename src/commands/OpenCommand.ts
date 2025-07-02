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
 * Open Command
 * 
 * Handles opening containers, doors, and other openable objects:
 * - "open <object>" - Open a container or door
 * - "open <container> with <key>" - Open locked container with a key
 * 
 * The command can target:
 * - Containers (boxes, chests, coffins, etc.)
 * - Doors and gates
 * - Books and other openable items
 * - Items in inventory or current scene
 */
export class OpenCommand extends BaseCommand {
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
      'open',
      [],
      'open <object> [with <key>]',
      'Open a container, door, or other openable object.',
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

  execute(input: string): CommandResult {
    this.logger.debug(`Executing open command: "${input}"`);

    const args = this.getArgs(input);
    if (args.length === 0) {
      return this.failure('What do you want to open?', true);
    }

    // Parse "open <object> [with <key>]"
    const result = this.parseOpenCommand(args);
    if (!result.success) {
      return this.failure(result.message, true);
    }

    const { targetName, keyName } = result;

    // Find the target item
    const targetId = this.findItemId(targetName!);
    if (!targetId) {
      return this.failure(`You don't see ${this.getArticle(targetName!)} ${targetName!} here.`, true);
    }

    // Validate key if specified
    let keyId: string | undefined;
    if (keyName) {
      keyId = this.findKeyItem(keyName);
      if (!keyId) {
        return this.failure(`You don't have ${this.getArticle(keyName)} ${keyName}.`, true);
      }
    }

    // Check if this is a door or container
    const item = this.gameState.getItem(targetId);
    if (!item) {
      return this.failure(`You don't see ${this.getArticle(targetName!)} ${targetName!} here.`, true);
    }

    // If item is tagged as a door, delegate to SceneService
    if (item.tags && item.tags.includes('door')) {
      const currentScene = this.gameState.getCurrentScene();
      const doorResult = this.scene.openDoor(currentScene, targetId);
      
      return doorResult.success 
        ? this.success(doorResult.message, true, 0)
        : this.failure(doorResult.message, true);
    }

    // Otherwise, delegate to ItemService for containers
    const openResult = this.items.openItem(targetId, keyId);
    
    if (openResult.success && this.items.isContainer(targetId)) {
      // For containers, append contents information
      const contents = this.items.getContainerContents(targetId);
      let message = openResult.message;
      
      if (contents.length > 0) {
        const contentItems = contents
          .map(id => {
            const item = this.gameState.getItem(id);
            // Handle test items that might not have full data
            return item?.name || id;
          })
          .filter(name => name !== undefined) as string[];
        const formattedList = this.formatItemList(contentItems);
        message += ` It contains ${formattedList}.`;
      } else {
        message += " It is empty.";
      }
      
      return this.success(message, true, 0);
    }
    
    return openResult.success 
      ? this.success(openResult.message, true, 0)
      : this.failure(openResult.message, true);
  }

  /**
   * Parse open command variations
   */
  private parseOpenCommand(args: string[]): { success: boolean; message: string; targetName?: string; keyName?: string } {
    // Check for "with" keyword first (before checking args.length)
    const withIndex = args.findIndex(arg => arg.toLowerCase() === 'with');
    
    if (withIndex === args.length - 1) {
      // Invalid: ends with "with" - handles both "open with" and "open box with"
      return {
        success: false,
        message: "With what?"
      };
    }

    if (withIndex === 0) {
      // Invalid: starts with "with" but doesn't end with it - shouldn't happen in normal usage
      return {
        success: false,
        message: "I don't understand that. Try 'open <object>' or 'open <object> with <key>'."
      };
    }

    // Check for malformed commands (command keywords in target name)
    const commandKeywords = ['open', 'close', 'take', 'drop', 'look', 'examine', 'go', 'move', 'get', 'put'];
    const hasCommandKeyword = args.some(arg => commandKeywords.includes(arg.toLowerCase()));
    
    if (hasCommandKeyword) {
      return {
        success: false,
        message: "I don't understand that. Try 'open <object>' or 'open <object> with <key>'."
      };
    }

    // "open <object>"
    if (args.length === 1) {
      return {
        success: true,
        message: '',
        targetName: args[0]!
      };
    }

    if (withIndex === -1) {
      // "open <multi-word object>" (no "with")
      return {
        success: true,
        message: '',
        targetName: args.join(' ')
      };
    }

    // "open <object> with <key>"
    return {
      success: true,
      message: '',
      targetName: args.slice(0, withIndex).join(' '),
      keyName: args.slice(withIndex + 1).join(' ')
    };
  }

  /**
   * Find key item in inventory only (keys must be in inventory to use)
   */
  private findKeyItem(keyName: string): string | undefined {
    const inventoryItems = this.inventory.getItems();
    for (const itemId of inventoryItems) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, keyName.toLowerCase())) {
        return itemId;
      }
    }
    return undefined;
  }
}