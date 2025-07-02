import { ICommandProcessor } from './interfaces/ICommandProcessor';
import { IGameStateService } from './interfaces/IGameStateService';
import { CommandResult } from '../types/CommandTypes';
import { CommandService } from './CommandService';
import log from 'loglevel';

/**
 * Command Processor Service
 * Handles command execution and game state updates
 */
export class CommandProcessor implements ICommandProcessor {
  private logger: log.Logger;

  constructor(
    private commandService: CommandService,
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('CommandProcessor');
  }

  /**
   * Process a command and handle all state updates
   */
  processCommand(input: string): CommandResult {
    try {
      // Execute the command
      const result = this.commandService.executeCommand(input);
      
      // Handle move counting
      if (result.countsAsMove) {
        this.gameState.incrementMoves();
        this.logger.debug(`Move counter incremented after command: ${input}`);
      }
      
      // Score changes are handled by commands themselves during execution
      // The scoreChange field is for informational purposes only
      if (result.scoreChange) {
        this.logger.debug(`Command reported score change of ${result.scoreChange} points: ${input}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error processing command "${input}":`, error);
      return {
        success: false,
        message: 'An error occurred while processing your command.',
        countsAsMove: false
      };
    }
  }

  /**
   * Get the current move count
   */
  getMoveCount(): number {
    return this.gameState.getGameState().moves || 0;
  }
  
  /**
   * Get command suggestions for input completion
   */
  getSuggestions(input: string): string[] {
    return this.commandService.getSuggestions(input);
  }
}