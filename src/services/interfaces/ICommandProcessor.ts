import { CommandResult } from '../../types/CommandTypes';

/**
 * Processes commands and handles game state updates.
 * 
 * This service acts as the central command execution point, ensuring:
 * - Consistent command processing for both UI and tests
 * - Proper move counting based on countsAsMove flag
 * - Score updates when commands affect score
 * - Centralized command execution logic
 * 
 * Boundaries:
 * - Does NOT parse commands (CommandService responsibility)
 * - Does NOT display output (OutputService/UI responsibility)
 * - Does NOT implement command logic (Command classes responsibility)
 * - Focus is on orchestrating command execution and state updates
 */
export interface ICommandProcessor {
  /**
   * Process a command string and handle all state updates
   * @param input The raw command input from user
   * @returns Command result with success status and message
   */
  processCommand(input: string): CommandResult;
  
  /**
   * Get the current move count
   * @returns The number of moves made
   */
  getMoveCount(): number;
  
  /**
   * Get command suggestions for input completion
   * @param input Partial command input
   * @returns Array of suggested command completions
   */
  getSuggestions(input: string): string[];
}