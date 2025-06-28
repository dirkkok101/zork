import { CommandResult } from '../../services/interfaces';

/**
 * Command interface
 * Represents a command that can be executed by the player
 * 
 * Commands are orchestrators that coordinate between services to achieve functionality.
 * They do not implement game logic directly but delegate to appropriate services.
 */
export interface ICommand {
  /** Primary name of the command */
  name: string;
  
  /** Alternative names for the command */
  aliases: string[];
  
  /** Usage description */
  usage: string;
  
  /** Help text for the command */
  helpText: string;
  
  /**
   * Check if the command matches the input
   * @param input User input text
   * @returns Whether the command matches
   */
  matches(input: string): boolean;
  
  /**
   * Check if the command can be executed in the current context
   * @returns Whether the command can be executed
   */
  canExecute(): boolean;
  
  /**
   * Execute the command
   * @param input User input text
   * @returns Command execution result
   */
  execute(input: string): CommandResult;
  
  /**
   * Get suggestions for command completion
   * @param input Partial user input
   * @returns Array of suggestion strings
   */
  getSuggestions(input: string): string[];
}