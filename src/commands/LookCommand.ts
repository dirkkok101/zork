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
 * Look Command
 * 
 * Handles environment and spatial awareness:
 * - "look" / "l" - Show current scene description
 * - "look around" - Same as "look"
 * - "look at <object>" - Brief description of an object
 * - "look at <exit>" - Description of an exit
 * - "look in <container>" - Show container contents (if open)
 * 
 * For detailed object examination, use the examine command.
 */
export class LookCommand extends BaseCommand {
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
      'look',
      ['l'],
      'look [at <object>] [in <container>]',
      'Look around the current location or at something specific.',
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
   * Execute the look command
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);
    
    try {
      const args = this.getArgs(input);
      this.logger.debug(`Parsed args: [${args.join(', ')}]`);
      
      // Basic "look" or "look around" - show scene description
      if (args.length === 0 || (args.length === 1 && args[0]?.toLowerCase() === 'around')) {
        this.logger.debug('Executing look around');
        const result = this.lookAround();
        this.logExecutionSuccess(result);
        return result;
      }
      
      // Parse preposition and target
      const parsed = this.parseArgsWithPreposition(args);
      this.logger.debug(`Parsed preposition: '${parsed.preposition}', target: '${parsed.target}'`);
      
      let result: CommandResult;
      
      // Handle different prepositions
      switch (parsed.preposition) {
        case 'at':
          this.logger.debug(`Executing look at: '${parsed.target}'`);
          result = this.lookAt(parsed.target);
          break;
        case 'in':
        case 'inside':
          this.logger.debug(`Executing look in: '${parsed.target}'`);
          result = this.lookIn(parsed.target);
          break;
        default:
          // No preposition, assume "look at"
          this.logger.debug(`No preposition, assuming look at: '${parsed.target}'`);
          result = this.lookAt(parsed.target);
          break;
      }
      
      this.logExecutionSuccess(result);
      return result;
      
    } catch (error) {
      this.logExecutionError(error as Error, input);
      return this.failure('An error occurred while looking.');
    }
  }

  /**
   * Look around the current scene
   */
  private lookAround(): CommandResult {
    const currentSceneId = this.gameState.getCurrentScene();
    const description = this.scene.getSceneDescription(currentSceneId);
    
    // Add visible items
    const visibleItems = this.scene.getVisibleItems(currentSceneId);
    let itemsText = '';
    
    if (visibleItems.length > 0) {
      const itemNames = visibleItems
        .map(sceneItem => {
          const item = this.gameState.getItem(sceneItem.itemId);
          return item ? item.name : null;
        })
        .filter(name => name !== null);
      
      if (itemNames.length > 0) {
        itemsText = `\n\nYou can see ${this.formatItemList(itemNames)} here.`;
      }
    }
    
    // Add available exits
    const exits = this.scene.getAvailableExits(currentSceneId);
    let exitsText = '';
    
    if (exits.length > 0) {
      const exitNames = exits.map(exit => exit.direction);
      exitsText = `\n\nExits: ${exitNames.join(', ')}`;
    }
    
    return this.success(description + itemsText + exitsText, false);
  }

  /**
   * Look at a specific target (object or exit)
   */
  private lookAt(target: string | null | undefined): CommandResult {
    if (!target) {
      return this.failure("Look at what?");
    }
    
    // Try to find as an item first
    const item = this.findItem(target);
    if (item) {
      // For "look at", we give a brief description
      return this.success(item.description || `It's ${item.name}.`, false);
    }
    
    // Try to find as an exit
    const exit = this.findExit(target);
    if (exit) {
      const exitDescription = exit.description || `You see an exit to the ${exit.direction}.`;
      return this.success(exitDescription, false);
    }
    
    // Try to find as a monster
    const monster = this.findMonster(target);
    if (monster) {
      return this.success(monster.description || `It's ${monster.name}.`, false);
    }
    
    return this.failure(`You don't see any ${target} here.`);
  }

  /**
   * Look inside a container
   */
  private lookIn(target: string | null | undefined): CommandResult {
    if (!target) {
      return this.failure("Look in what?");
    }
    
    const item = this.findItem(target);
    if (!item) {
      return this.failure(`You don't see any ${target} here.`);
    }
    
    // Check if it's a container
    if (!this.items.isContainer(item.id)) {
      return this.failure(`You can't look inside the ${item.name}.`);
    }
    
    // Check if it's locked
    if (this.items.isLocked(item.id)) {
      return this.failure(`The ${item.name} is locked.`);
    }
    
    // Check if it needs to be opened first
    if (this.items.canOpen(item.id) && !item.isOpen) {
      return this.failure(`The ${item.name} is closed.`);
    }
    
    // Get contents
    const contents = this.items.getContainerContents(item.id);
    
    if (contents.length === 0) {
      return this.success(`The ${item.name} is empty.`, false);
    }
    
    // Format contents list
    const contentItems = contents
      .map(itemId => this.gameState.getItem(itemId))
      .filter(item => item !== undefined);
    
    const itemNames = contentItems.map(item => item!.name);
    const formattedList = this.formatItemList(itemNames);
    
    return this.success(`The ${item.name} contains ${formattedList}.`, false);
  }



}
