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

    // Attempt to close the item
    const closeResult = this.items.closeItem(targetId);
    
    return closeResult.success 
      ? this.success(closeResult.message, true, 0)
      : this.failure(closeResult.message);
  }

}