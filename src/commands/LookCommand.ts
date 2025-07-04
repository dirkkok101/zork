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
    scoring: IScoringService,
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
      scoring,
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
    
    // Get score before scene description (for first visit scoring)
    const initialScore = this.gameState.getScore();
    const description = this.scene.getSceneDescription(currentSceneId);
    const finalScore = this.gameState.getScore();
    const scoreChange = finalScore - initialScore;
    
    // Add visible items
    const visibleItems = this.scene.getVisibleItems(currentSceneId);
    let itemsText = '';
    
    if (visibleItems.length > 0) {
      const itemNames = visibleItems
        .map(sceneItem => {
          const item = this.gameState.getItem(sceneItem.itemId);
          if (!item) return null;
          
          // Check if it's an open container with contents
          if (this.items.isContainer(item.id)) {
            const isOpen = this.items.isContainerOpen(item.id);
            const canOpen = this.items.canOpen(item.id);
            const isLocked = this.items.isLocked(item.id);
            
            // Show contents if container is open (or doesn't need opening) and not locked
            if ((isOpen || !canOpen) && !isLocked) {
              const contents = this.items.getContainerContents(item.id);
              if (contents.length > 0) {
                const contentItems = contents
                  .map(itemId => this.gameState.getItem(itemId))
                  .filter(contentItem => contentItem !== undefined)
                  .map(contentItem => contentItem!.name);
                
                if (contentItems.length > 0) {
                  const formattedContents = this.formatItemList(contentItems, false);
                  return `${item.name} (which contains ${formattedContents})`;
                }
              }
            }
          }
          
          return item.name;
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
    
    return this.success(description + itemsText + exitsText, false, scoreChange);
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
      // Special handling for window with state-based description
      if (item.id === 'windo') {
        const isOpen = item.state?.open === true || item.state?.isOpen === true;
        const description = isOpen ? 
          "The window is open, providing a way to the outside." : 
          "The window is closed.";
        return this.success(description, false);
      }
      
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
    if (this.items.canOpen(item.id) && !item.state?.open) {
      return this.failure(`The ${item.name} is closed.`);
    }
    
    // Get contents
    const contents = this.items.getContainerContents(item.id);
    
    if (contents.length === 0) {
      return this.success(`The ${item.name} is empty.`, false);
    }
    
    // Format contents list
    const itemNames = contents
      .map(itemId => {
        const item = this.gameState.getItem(itemId);
        return item?.name || itemId;
      })
      .filter(name => name !== undefined);
    const formattedList = this.formatItemList(itemNames);
    
    return this.success(`The ${item.name} contains ${formattedList}.`, false);
  }



}
