
import { ICommand } from '../commands/interfaces/ICommand';
import { CommandResult } from '../types/CommandTypes';
import log from 'loglevel';
import {ICommandService} from './interfaces';

/**
 * Command Service Implementation
 * 
 * Simple, focused command registry and execution service.
 * Commands are self-contained and handle their own parsing and service orchestration.
 */
export class CommandService implements ICommandService {
  /** Registry of commands mapped by name and aliases */
  private commands: Map<string, ICommand> = new Map();
  
  /** Command history for debugging and UI */
  private commandHistory: string[] = [];
  private readonly maxHistory = 100;

  /** Logger for this service */
  private logger: log.Logger;

  /**
   * Create a new CommandService
   * @param logger Logger instance (optional, will create one if not provided)
   */
  constructor(logger?: log.Logger) {
    this.logger = logger || log.getLogger('CommandService');
  }

  /**
   * Register a single command and its aliases
   */
  registerCommand(command: ICommand): void {
    this.logger.debug(`Registering command: ${command.name} with aliases: [${command.aliases.join(', ')}]`);
    
    // Register primary name
    this.commands.set(command.name.toLowerCase(), command);
    
    // Register all aliases
    command.aliases.forEach(alias => {
      this.commands.set(alias.toLowerCase(), command);
    });
    
    this.logger.trace(`Command ${command.name} registered with ${command.aliases.length + 1} name(s)`);
  }

  /**
   * Register multiple commands
   */
  registerCommands(commands: ICommand[]): void {
    this.logger.info(`Registering ${commands.length} commands...`);
    commands.forEach(command => this.registerCommand(command));
    this.logger.info(`✅ Registered ${commands.length} commands`);
  }

  /**
   * Execute a command based on user input
   */
  executeCommand(input: string): CommandResult {
    const trimmedInput = input.trim();
    this.logger.info(`Executing command: '${trimmedInput}'`);
    
    // Handle empty input
    if (!trimmedInput) {
      this.logger.debug('Empty input received');
      return this.createFailureResult('What?', false);
    }

    // Record in history
    this.addToHistory(trimmedInput);

    // Find matching command
    const command = this.findCommand(trimmedInput);
    
    if (!command) {
      this.logger.warn(`Unknown command: '${trimmedInput}'`);
      return this.handleUnknownCommand(trimmedInput);
    }

    this.logger.debug(`Found command: ${command.name}`);

    // Check if command can be executed
    if (!command.canExecute()) {
      this.logger.debug(`Command ${command.name} cannot be executed in current context`);
      return this.createFailureResult(`You can't ${command.name} right now.`, false);
    }

    // Execute the command
    try {
      const startTime = Date.now();
      const result = command.execute(trimmedInput);
      const executionTime = Date.now() - startTime;
      
      this.logger.debug(`Command ${command.name} executed in ${executionTime}ms, success: ${result.success}`);
      return result;
    } catch (error) {
      this.logger.error(`Error executing command "${trimmedInput}":`, error);
      return this.createFailureResult(
        'Something went wrong while executing that command.',
        false
      );
    }
  }

  /**
   * Find a command that matches the input
   */
  findCommand(input: string): ICommand | undefined {
    const lowerInput = input.toLowerCase();
    this.logger.trace(`Looking for command matching: '${lowerInput}'`);
    
    // Try exact matches first (for single-word commands)
    if (this.commands.has(lowerInput)) {
      const command = this.commands.get(lowerInput);
      this.logger.trace(`Found exact match: ${command?.name}`);
      return command;
    }
    
    // Extract first word and try matching
    const firstWord = lowerInput.split(/\s+/)[0];
    const command = this.commands.get(firstWord ?? '');
    
    if (command) {
      this.logger.trace(`Found command by first word '${firstWord}': ${command.name}`);
    } else {
      this.logger.trace(`No command found for input: '${lowerInput}'`);
    }
    
    return command;
  }

  /**
   * Get all registered commands (unique instances)
   */
  getAllCommands(): ICommand[] {
    const uniqueCommands = new Set<ICommand>();
    this.commands.forEach(command => uniqueCommands.add(command));
    return Array.from(uniqueCommands);
  }

  /**
   * Get command history
   */
  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearCommandHistory(): void {
    this.commandHistory.length = 0;
  }

  /**
   * Get command suggestions for partial input
   */
  getSuggestions(partialInput: string): string[] {
    const suggestions: string[] = [];
    const lowerInput = partialInput.toLowerCase();
    
    // Get suggestions from all unique commands
    const uniqueCommands = this.getAllCommands();
    
    for (const command of uniqueCommands) {
      try {
        // Let each command provide its own suggestions
        const commandSuggestions = command.getSuggestions(partialInput);
        suggestions.push(...commandSuggestions);
      } catch (error) {
        console.warn(`Error getting suggestions from ${command.name}:`, error);
      }
    }
    
    // Add basic command name suggestions
    const commandNames = new Set<string>();
    this.commands.forEach((command, name) => {
      if (name.startsWith(lowerInput)) {
        commandNames.add(command.name); // Use primary name, not alias
      }
    });
    suggestions.push(...Array.from(commandNames));
    
    // Remove duplicates and sort
    return Array.from(new Set(suggestions))
      .filter(suggestion => suggestion.toLowerCase().includes(lowerInput))
      .sort()
      .slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Check if a command exists
   */
  hasCommand(commandName: string): boolean {
    return this.commands.has(commandName.toLowerCase());
  }

  /**
   * Add command to history
   */
  private addToHistory(input: string): void {
    this.commandHistory.push(input);
    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory.shift();
    }
  }

  /**
   * Handle unknown command
   */
  private handleUnknownCommand(input: string): CommandResult {
    const suggestions = this.getSuggestions(input);
    
    if (suggestions.length > 0) {
      const suggestionText = suggestions.slice(0, 3).join(', ');
      return this.createFailureResult(
        `I don't understand "${input}". Try: ${suggestionText}`,
        false
      );
    }
    
    const firstWord = input.split(/\s+/)[0];
    return this.createFailureResult(
      `I don't know how to "${firstWord}". Type "help" for available commands.`,
      false
    );
  }

  /**
   * Create a standardized failure result
   */
  private createFailureResult(message: string, countsAsMove: boolean): CommandResult {
    return {
      success: false,
      message,
      countsAsMove
    };
  }
}
