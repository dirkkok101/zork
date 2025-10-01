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
 * Close Command
 * 
 * Handles closing containers, doors, and other closeable objects:
 * - "close <object>" - Close a container or door
 * 
 * The command can target:
 * - Containers (boxes, chests, coffins, etc.)
 * - Doors and gates
 * - Books and other closeable items
 * - Items in inventory or current scene
 */
export class CloseCommand extends BaseCommand {
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
      'close',
      ['shut'],
      'close <object>',
      'Close a container, door, or other closeable object.',
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
    this.logger.debug(`Executing close command: "${input}"`);

    const args = this.getArgs(input);
    if (args.length === 0) {
      return this.failure('What do you want to close?');
    }

    // Parse "close <object>"
    const targetName = args.join(' ');

    // Find the target item
    const targetId = this.findItemId(targetName);
    if (!targetId) {
      return this.failure(`You don't see ${this.getArticle(targetName)} ${targetName} here.`);
    }

    // Check if this is a door or container
    const item = this.gameState.getItem(targetId);
    if (!item) {
      return this.failure(`You don't see ${this.getArticle(targetName)} ${targetName} here.`);
    }

    // If item is tagged as a door, delegate to SceneService
    if (item.tags && item.tags.includes('door')) {
      const currentScene = this.gameState.getCurrentScene();
      const doorResult = this.scene.closeDoor(currentScene, targetId);
      
      return doorResult.success 
        ? this.success(doorResult.message, true, 0)
        : this.failure(doorResult.message);
    }

    // Otherwise, delegate to ItemService for containers
    const closeResult = this.items.closeItem(targetId);

    return closeResult.success
      ? this.success(closeResult.message, true, 0)
      : this.failure(closeResult.message);
  }

  /**
   * Get context-aware suggestions for the close command
   */
  override getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const words = input.toLowerCase().trim().split(/\s+/);
    const firstWord = words[0] || '';

    // Only provide suggestions for this command's verbs
    if (!['close', 'shut'].includes(firstWord)) {
      return [];
    }

    // Get openable items in current scene (only open ones)
    const currentSceneId = this.gameState.getCurrentScene();
    const closeableItems = this.items.getOpenableItemsInScene(currentSceneId, false); // false = must be open

    // Also check inventory for closeable items
    const inventoryItems = this.items.getInventoryItems().filter(item => {
      const canBeOpened = this.items.isContainer(item.id) || item.properties?.openable === true;
      const isOpen = item.state?.open || false;
      return canBeOpened && isOpen;
    });

    // Generate suggestions with metadata
    [...closeableItems, ...inventoryItems].forEach(item => {
      if (item && item.name) {
        // Build metadata string for parsing in GameInterface
        const metadata: string[] = [];

        // Add item type
        if (item.type) {
          metadata.push(`itemType:${item.type.toLowerCase()}`);
        }

        // Add state (these are all open items)
        metadata.push('itemState:open');

        // Format: "command|metadata1|metadata2"
        const suggestionText = metadata.length > 0
          ? `${firstWord} ${item.name}|${metadata.join('|')}`
          : `${firstWord} ${item.name}`;

        suggestions.push(suggestionText);
      }
    });

    return suggestions;
  }

}