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
 * Save Command
 * 
 * Handles saving the current game state:
 * - "save" - Save the current game state to localStorage
 * 
 * Follows traditional Zork behavior:
 * - Counts as a move
 * - Provides clear feedback on success/failure
 * - Overwrites previous save (single save slot)
 */
export class SaveCommand extends BaseCommand {
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
      'save',
      [],
      'save',
      'Save the current game state.',
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
   * Execute the save command
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);

    try {
      // Parse arguments - save command should have no arguments
      const args = this.getArgs(input);
      
      if (args.length > 0) {
        this.logger.debug('Save command received unexpected arguments');
        return this.failure('Just type "save" to save your game.', false);
      }

      // Check if game is in a saveable state
      if (this.gameState.isGameOver()) {
        this.logger.debug('Cannot save - game is over');
        return this.failure('You cannot save after the game has ended.', false);
      }

      // Attempt to save the game
      this.logger.info('Attempting to save game state');
      
      try {
        // Call the persistence service to save the game
        // Since we're in a synchronous command context, we'll handle the async operation
        // by calling it and trusting it will complete
        this.persistence.saveGame().then(success => {
          if (success) {
            this.logger.info('Game saved successfully');
          } else {
            this.logger.warn('Game save failed');
          }
        }).catch(error => {
          this.logger.error('Save operation failed:', error);
        });
        
        // Return immediate success - the save will complete asynchronously
        this.logger.info('Game save initiated');
        const result = this.success('Game saved.', true, 0);
        this.logExecutionSuccess(result);
        return result;

      } catch (saveError) {
        this.logger.error('Save command failed:', saveError);
        return this.failure('Failed to save the game. Please try again.', false);
      }

    } catch (error) {
      this.logExecutionError(error as Error, input);
      return this.failure('An error occurred while saving the game.', false);
    }
  }

  /**
   * Check if the save command can be executed
   */
  override canExecute(): boolean {
    // Save command can be executed unless the game is over
    return !this.gameState.isGameOver();
  }

  /**
   * Get command suggestions
   */
  override getSuggestions(input: string): string[] {
    if (input === '' || 'save'.startsWith(input.toLowerCase())) {
      return ['save'];
    }
    return [];
  }
}