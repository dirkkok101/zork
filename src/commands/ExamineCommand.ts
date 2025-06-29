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
 * Examine Command
 * 
 * Handles detailed object inspection:
 * - "examine <object>" / "x <object>" - Detailed examination
 * - "inspect <object>" / "study <object>" - Same as examine
 * - Shows more detail than "look at"
 * - Reveals hidden properties, container states, physical details
 * - Does NOT show readable text content (use READ command for that)
 * 
 * For basic environment awareness, use the look command.
 * For reading text content, use the read command.
 */
export class ExamineCommand extends BaseCommand {
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
      'examine',
      ['x', 'inspect', 'study'],
      'examine <object>',
      'Examine an object closely to see detailed information.',
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
   * Execute the examine command
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);
    
    try {
      const args = this.getArgs(input);
      this.logger.debug(`Parsed args: [${args.join(', ')}]`);
      
      if (args.length === 0) {
        const result = this.failure("Examine what?");
        this.logExecutionSuccess(result);
        return result;
      }
      
      const target = args.join(' ').toLowerCase();
      this.logger.debug(`Examining target: '${target}'`);
      
      let result: CommandResult;
      
      // Check for self-reference
      if (this.isSelfReference(target)) {
        this.logger.debug('Examining self');
        result = this.examineSelf();
      } else {
        // Try to find as an item
        const item = this.findItem(target);
        if (item) {
          this.logger.debug(`Found item: ${item.id} (${item.name})`);
          result = this.examineItem(item);
        } else {
          // Try to find as a monster
          const monster = this.findMonster(target);
          if (monster) {
            this.logger.debug(`Found monster: ${monster.id} (${monster.name})`);
            result = this.examineMonster(monster);
          } else {
            this.logger.debug(`Target '${target}' not found`);
            result = this.failure(`You don't see any "${target}" here.`);
          }
        }
      }
      
      this.logExecutionSuccess(result);
      return result;
      
    } catch (error) {
      this.logExecutionError(error as Error, input);
      return this.failure('An error occurred while examining.');
    }
  }

  /**
   * Examine self
   */
  private examineSelf(): CommandResult {
    const inventory = this.inventory.getItems();
    const inventoryText = inventory.length > 0 
      ? `\nYou are carrying ${inventory.length} item${inventory.length !== 1 ? 's' : ''}.`
      : '\nYou are empty-handed.';
    
    return this.success(
      "You are an adventurer exploring the Great Underground Empire." + inventoryText,
      false
    );
  }

  /**
   * Examine an item in detail
   */
  private examineItem(item: any): CommandResult {
    let description = this.items.examineItem(item.id);
    
    // Add container-specific information
    if (this.items.isContainer(item.id)) {
      const containerInfo = this.getContainerInfo(item);
      if (containerInfo) {
        description += '\n' + containerInfo;
      }
    }
    
    // Add light source information
    if (this.items.isLightSource(item.id)) {
      const lightInfo = this.getLightSourceInfo(item);
      if (lightInfo) {
        description += '\n' + lightInfo;
      }
    }
    
    // Add lock information
    if (this.items.isLockable(item.id)) {
      const lockInfo = this.getLockInfo(item);
      if (lockInfo) {
        description += '\n' + lockInfo;
      }
    }
    
    return this.success(description, false);
  }

  /**
   * Examine a monster in detail
   */
  private examineMonster(monster: any): CommandResult {
    let description = monster.examineText || monster.description;
    
    // Add health status
    if (monster.health < monster.maxHealth) {
      const healthPercent = (monster.health / monster.maxHealth) * 100;
      if (healthPercent <= 25) {
        description += "\nIt looks severely wounded.";
      } else if (healthPercent <= 50) {
        description += "\nIt looks wounded.";
      } else if (healthPercent <= 75) {
        description += "\nIt looks slightly wounded.";
      }
    }
    
    // Add inventory information if visible
    if (monster.inventory && monster.inventory.length > 0) {
      const visibleItems = monster.inventory
        .map((itemId: string) => this.gameState.getItem(itemId))
        .filter((item: { visible: any; }) => item && item.visible)
        .map((item: any) => item!.name);
      
      if (visibleItems.length > 0) {
        description += `\nThe ${monster.name} is carrying ${this.formatItemList(visibleItems)}.`;
      }
    }
    
    return this.success(description, false);
  }

  /**
   * Get container-specific information
   */
  private getContainerInfo(item: any): string | null {
    const parts: string[] = [];
    
    // Open/closed state
    if (this.items.canOpen(item.id)) {
      const isOpen = item.state?.open || false;
      parts.push(`The ${item.name} is ${isOpen ? 'open' : 'closed'}.`);
      
      // Contents (if open or transparent)
      if (isOpen || item.contentsVisible) {
        const contents = this.items.getContainerContents(item.id);
        if (contents.length > 0) {
          const contentItems = contents
            .map(itemId => this.gameState.getItem(itemId))
            .filter(item => item !== undefined)
            .map(item => item!.name);
          
          parts.push(`It contains ${this.formatItemList(contentItems)}.`);
        } else {
          parts.push("It is empty.");
        }
      }
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  }

  /**
   * Get light source information
   */
  private getLightSourceInfo(item: any): string | null {
    const isLit = this.items.isLit(item.id);
    let info = `The ${item.name} is ${isLit ? 'lit' : 'not lit'}.`;
    
    // Add fuel information if applicable
    if (item.remainingFuel !== undefined && item.remainingFuel !== -1) {
      const fuelPercent = item.maxFuel ? (item.remainingFuel / item.maxFuel) * 100 : 0;
      if (fuelPercent <= 10) {
        info += " It's almost out of fuel.";
      } else if (fuelPercent <= 25) {
        info += " It's running low on fuel.";
      }
    }
    
    return info;
  }

  /**
   * Get lock information
   */
  private getLockInfo(item: any): string | null {
    if (this.items.isLocked(item.id)) {
      return `The ${item.name} is locked.`;
    }
    return null;
  }



}
