import { ICommand } from './interfaces/ICommand';
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
 * Base Command
 * Abstract base class for all commands with service injection and common utilities
 */
export abstract class BaseCommand implements ICommand {
  /** Primary name of the command */
  name: string;
  
  /** Alternative names for the command */
  aliases: string[];
  
  /** Usage description */
  usage: string;
  
  /** Help text for the command */
  helpText: string;

  /** Logger for this command */
  protected logger: log.Logger;

  /**
   * Create a new BaseCommand with injected services
   * @param name Primary command name
   * @param aliases Alternative command names
   * @param usage Usage description
   * @param helpText Help text
   * @param gameState Game state service
   * @param scene Scene service
   * @param inventory Inventory service
   * @param items Item service
   * @param combat Combat service
   * @param persistence Persistence service
   * @param output Output service
   * @param scoring Scoring service
   * @param logger Logger instance (optional, will create one if not provided)
   */
  constructor(
    name: string,
    aliases: string[] = [],
    usage: string = '',
    helpText: string = '',
    protected gameState: IGameStateService,
    protected scene: ISceneService,
    protected inventory: IInventoryService,
    protected items: IItemService,
    protected combat: ICombatService,
    protected persistence: IPersistenceService,
    protected output: IOutputService,
    protected scoring: IScoringService,
    logger?: log.Logger
  ) {
    this.name = name;
    this.aliases = aliases;
    this.usage = usage;
    this.helpText = helpText;
    this.logger = logger || log.getLogger(`Command:${name}`);
  }
  
  /**
   * Check if the command matches the input
   * @param input User input text
   * @returns Whether the command matches
   */
  matches(input: string): boolean {
    const trimmedInput = input.trim();
    this.logger.trace(`Checking if command '${this.name}' matches input: '${trimmedInput}'`);
    
    // Check primary name
    if (trimmedInput === this.name || trimmedInput.startsWith(`${this.name} `)) {
      this.logger.debug(`Command '${this.name}' matched input by primary name`);
      return true;
    }
    
    // Check aliases
    for (const alias of this.aliases) {
      if (trimmedInput === alias || trimmedInput.startsWith(`${alias} `)) {
        this.logger.debug(`Command '${this.name}' matched input by alias '${alias}'`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get the base command from the input
   * @param input User input text
   * @returns The base command (primary name or alias)
   */
  protected getBaseCommand(input: string): string {
    // Check primary name
    if (input === this.name || input.startsWith(`${this.name} `)) {
      return this.name;
    }
    
    // Check aliases
    for (const alias of this.aliases) {
      if (input === alias || input.startsWith(`${alias} `)) {
        return alias;
      }
    }
    
    // Default to first word if no match found
    const firstWord = input.split(' ')[0];
    return firstWord || '';
  }
  
  /**
   * Check if the command can be executed in the current context
   * @returns Whether the command can be executed
   */
  canExecute(): boolean {
    // Base implementation allows execution
    return true;
  }

  /**
   * Log command execution start
   * @param input User input text
   */
  protected logExecutionStart(input: string): void {
    this.logger.info(`Executing command '${this.name}' with input: '${input.trim()}'`);
  }

  /**
   * Log command execution success
   * @param result Command result
   */
  protected logExecutionSuccess(result: CommandResult): void {
    this.logger.debug(`Command '${this.name}' executed successfully: ${result.success ? 'success' : 'failure'}`);
  }

  /**
   * Log command execution error
   * @param error Error that occurred
   * @param input Original input
   */
  protected logExecutionError(error: Error, input: string): void {
    this.logger.error(`Command '${this.name}' execution failed for input '${input.trim()}':`, error);
  }
  
  /**
   * Execute the command
   * @param input User input text
   * @returns Command execution result
   */
  abstract execute(input: string): CommandResult;
  
  /**
   * Get suggestions for command completion
   * @param input Partial user input
   * @returns Array of suggestion strings
   */
  getSuggestions(input: string): string[] {
    // Base implementation returns the command name and aliases
    if (input === '') {
      return [this.name, ...this.aliases];
    }
    
    // Check if input matches the start of the command name
    if (this.name.startsWith(input)) {
      return [this.name];
    }
    
    // Check if input matches the start of any alias
    const matchingAliases = this.aliases.filter(alias => alias.startsWith(input));
    return matchingAliases;
  }
  
  /**
   * Extract arguments from input
   * @param input User input text
   * @returns Array of arguments
   */
  protected getArgs(input: string): string[] {
    // Find the command part
    let commandPart = '';
    if (input === this.name || input.startsWith(`${this.name} `)) {
      commandPart = this.name;
    } else {
      for (const alias of this.aliases) {
        if (input === alias || input.startsWith(`${alias} `)) {
          commandPart = alias;
          break;
        }
      }
    }
    
    // Remove command part and split remaining text
    const argsText = input.substring(commandPart.length).trim();
    if (!argsText) {
      return [];
    }
    
    // Split by spaces, but respect quotes
    const args: string[] = [];
    let currentArg = '';
    let inQuotes = false;
    
    for (let i = 0; i < argsText.length; i++) {
      const char = argsText[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (currentArg) {
          args.push(currentArg);
          currentArg = '';
        }
      } else {
        currentArg += char;
      }
    }
    
    if (currentArg) {
      args.push(currentArg);
    }
    
    return args;
  }
  
  /**
   * Create a successful result
   * Commands should use services to modify state rather than direct state updates
   * @param message Result message
   * @param countsAsMove Whether the command counts as a move
   * @param scoreChange Score change (if any)
   * @returns Command result
   */
  protected success(
    message: string,
    countsAsMove: boolean = true,
    scoreChange: number = 0
  ): CommandResult {
    return {
      success: true,
      message,
      countsAsMove,
      scoreChange
    };
  }
  
  /**
   * Create a failed result
   * @param message Result message
   * @param countsAsMove Whether the command counts as a move
   * @returns Command result
   */
  protected failure(message: string, countsAsMove: boolean = false): CommandResult {
    return {
      success: false,
      message,
      countsAsMove
    };
  }

  /**
   * Parse arguments to extract preposition and target
   * Handles common patterns like "look at <object>", "put <object> in <container>"
   * @param args Array of arguments from getArgs()
   * @returns Object with preposition and target
   */
  protected parseArgsWithPreposition(args: string[]): { preposition: string | null | undefined; target: string | null | undefined } {
    if (args.length === 0) {
      return { preposition: null, target: null };
    }

    const text = args.join(' ').toLowerCase();
    
    // Check for common prepositions
    const match = text.match(/^(at|in|inside|on|under|behind|to|from|with|into|onto)\s+(.+)$/);
    
    if (match) {
      return {
        preposition: match[1],
        target: match[2]
      };
    }
    
    // No preposition found, entire text is the target
    return {
      preposition: null,
      target: text
    };
  }

  /**
   * Parse arguments for commands with object and preposition patterns
   * Handles patterns like "give <object> to <recipient>", "put <object> in <container>"
   * @param args Array of arguments from getArgs()
   * @returns Object with object, preposition, and target
   */
  protected parseArgsWithObjectAndPreposition(args: string[]): {
    object: string | undefined | null;
    preposition: string | undefined | null;
    target: string | undefined | null
  } {
    if (args.length === 0) {
      return { object: null, preposition: null, target: null };
    }

    const text = args.join(' ');
    
    // Check for object + preposition + target pattern
    const match = text.match(/^(.+?)\s+(at|in|inside|on|under|behind|to|from|with|into|onto)\s+(.+)$/i);
    
    if (match) {
      return {
        'object': match[1]?.trim(),
        'preposition': match[2]?.toLowerCase(),
        'target': match[3]?.trim()
      };
    }
    
    // No preposition found, entire text is the object
    return {
      object: text,
      preposition: null,
      target: null
    };
  }

  /**
   * Format a list of items grammatically
   * @param items Array of item names
   * @param useArticle Whether to prefix items with "a/an"
   * @returns Formatted string like "a lamp, a sword, and a key"
   */
  protected formatItemList(items: string[], useArticle: boolean = true): string {
    if (items.length === 0) return '';
    
    const formatItem = (item: string | undefined) => {
      if (!item) return '';
      if (!useArticle) return item;
      // Simple article logic - can be enhanced
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const article = vowels.includes(item[0]?.toLowerCase() || '') ? 'an' : 'a';
      return `${article} ${item}`;
    };

    if (items.length === 1) return formatItem(items[0]);
    if (items.length === 2) return `${formatItem(items[0])} and ${formatItem(items[1])}`;
    
    const allButLast = items.slice(0, -1).map(formatItem).join(', ');
    return `${allButLast}, and ${formatItem(items[items.length - 1])}`;
  }

  /**
   * Check if a string is a self-reference
   * @param text Text to check
   * @returns Whether the text refers to the player
   */
  protected isSelfReference(text: string): boolean {
    const selfReferences = ['self', 'me', 'myself', 'player', 'inventory', 'adventurer'];
    return selfReferences.includes(text.toLowerCase());
  }

  /**
   * Find an item by name in current scene or inventory
   * @param name Item name or alias to find
   * @returns The item if found, null otherwise
   */
  protected findItem(name: string): any {
    const lowerName = name.toLowerCase();
    const currentSceneId = this.gameState.getCurrentScene();
    
    // Check inventory first
    for (const itemId of this.inventory.getItems()) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, lowerName)) {
        return item;
      }
    }
    
    // Check scene items
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    for (const itemId of sceneItems) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, lowerName)) {
        return item;
      }
    }
    
    // Check inside open containers in the scene
    for (const itemId of sceneItems) {
      const container = this.gameState.getItem(itemId);
      if (container && this.items.isContainer(itemId)) {
        // Check if container is open
        const isOpen = container.state?.open || false;
        if (isOpen) {
          const contents = this.items.getContainerContents(itemId);
          for (const contentItemId of contents) {
            const contentItem = this.gameState.getItem(contentItemId);
            if (contentItem && this.items.itemMatches(contentItem, lowerName)) {
              return contentItem;
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Find an item ID by name in current scene or inventory
   * @param name Item name or alias to find
   * @returns The item ID if found, null otherwise
   */
  protected findItemId(name: string): string | null {
    const lowerName = name.toLowerCase();
    const currentSceneId = this.gameState.getCurrentScene();
    
    // Check scene items first (items in current location take precedence)
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    for (const itemId of sceneItems) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, lowerName)) {
        return itemId;
      }
    }
    
    // Check inside open containers in the scene using ItemService
    const containerSearchResult = this.items.findItemInOpenContainers(name, sceneItems);
    if (containerSearchResult) {
      return containerSearchResult;
    }
    
    // Check inventory
    for (const itemId of this.inventory.getItems()) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, lowerName)) {
        return itemId;
      }
    }
    
    return null;
  }


  /**
   * Find a monster by name in the current scene
   * @param name Monster name or synonym to find
   * @returns The monster if found, null otherwise
   */
  protected findMonster(name: string): any {
    const currentSceneId = this.gameState.getCurrentScene();
    const monsterIds = this.combat.getMonstersInScene(currentSceneId);
    const lowerName = name.toLowerCase();
    
    for (const monsterId of monsterIds) {
      const monster = this.gameState.getMonster(monsterId);
      if (monster && (
        monster.name.toLowerCase() === lowerName ||
        (monster.synonyms && monster.synonyms.some((syn: string) => syn.toLowerCase() === lowerName))
      )) {
        return monster;
      }
    }
    
    return null;
  }

  /**
   * Find an exit by direction in the current scene
   * @param direction Direction to find
   * @returns The exit if found, null otherwise
   */
  protected findExit(direction: string): any {
    const currentSceneId = this.gameState.getCurrentScene();
    const exits = this.scene.getAvailableExits(currentSceneId);
    const lowerDirection = direction.toLowerCase();
    
    return exits.find(exit => 
      exit.direction.toLowerCase() === lowerDirection ||
      (exit.direction.toLowerCase().startsWith(lowerDirection) && lowerDirection.length >= 1)
    );
  }

  /**
   * Get proper article (a/an) for a word
   * @param word The word to get article for
   * @returns "a" or "an"
   */
  protected getArticle(word: string): string {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return vowels.includes(word[0]?.toLowerCase() || '') ? 'an' : 'a';
  }

  /**
   * Find an item by name in player's inventory
   * @param name Item name or alias to find
   * @returns The item ID if found, null otherwise
   */
  protected findItemInInventory(name: string): string | null {
    const lowerName = name.toLowerCase();
    const inventoryItems = this.inventory.getItems();
    
    for (const itemId of inventoryItems) {
      const item = this.gameState.getItem(itemId);
      if (item && this.items.itemMatches(item, lowerName)) {
        return itemId;
      }
    }
    
    return null;
  }
}
