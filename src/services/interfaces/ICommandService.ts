import { ICommand } from '../../commands/interfaces/ICommand';
import { CommandResult } from '../../types/CommandTypes';

/**
 * Command Service Interface
 * 
 * Manages command registration, execution, and discovery.
 * 
 * This service is responsible for:
 * - Registering commands and their aliases
 * - Finding commands based on user input
 * - Executing commands by delegating to the command itself
 * - Managing command history
 * - Providing command suggestions
 * 
 * Boundaries:
 * - Does NOT handle UI output (IOutputService responsibility)
 * - Does NOT parse command arguments (commands handle their own parsing)
 * - Does NOT manage game state (commands use injected services)
 * - Does NOT handle complex business logic (commands orchestrate services)
 * - Focus is on command registry and execution coordination
 */
export interface ICommandService {
  /**
   * Register a single command
   * @param command Command to register
   */
  registerCommand(command: ICommand): void;
  
  /**
   * Register multiple commands
   * @param commands Array of commands to register
   */
  registerCommands(commands: ICommand[]): void;
  
  /**
   * Execute a command based on user input
   * @param input Raw user input string
   * @returns Command execution result
   */
  executeCommand(input: string): CommandResult;
  
  /**
   * Find a command that matches the given input
   * @param input User input string (or just the verb)
   * @returns Matching command or undefined
   */
  findCommand(input: string): ICommand | undefined;
  
  /**
   * Get all registered commands
   * @returns Array of all commands
   */
  getAllCommands(): ICommand[];
  
  /**
   * Get command history
   * @returns Array of recent command inputs
   */
  getCommandHistory(): string[];
  
  /**
   * Clear command history
   */
  clearCommandHistory(): void;
  
  /**
   * Get command suggestions for partial input
   * @param partialInput Partial user input
   * @returns Array of suggestion strings
   */
  getSuggestions(partialInput: string): string[];
  
  /**
   * Check if a command exists
   * @param commandName Command name or alias to check
   * @returns Whether the command exists
   */
  hasCommand(commandName: string): boolean;
}