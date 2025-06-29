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
 * Inventory Command
 * 
 * Displays the player's current inventory:
 * - "inventory" / "i" / "inv" - Show all items currently carried
 * - Does not count as a move (utility command)
 * - Provides formatted list of carried items or empty message
 * 
 * This is a core utility command from original Zork.
 */
export class InventoryCommand extends BaseCommand {
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
      'inventory',
      ['i', 'inv'],
      'inventory',
      'Display the items you are currently carrying.',
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
   * Execute the inventory command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing inventory command: "${input}"`);

    // 1. Parse input - inventory command should not have arguments
    const args = this.getArgs(input);
    if (args.length > 0) {
      this.logger.debug(`Inventory command received unexpected arguments: ${args.join(' ')}`);
      // Still show inventory but warn about extra arguments being ignored
    }

    // 2. Get formatted inventory description from InventoryService
    const inventoryDescription = this.inventory.getInventoryDescription();

    // 3. Return success with inventory information
    // Inventory display does not count as a move (utility command like score/save)
    return this.success(inventoryDescription, false);
  }
}