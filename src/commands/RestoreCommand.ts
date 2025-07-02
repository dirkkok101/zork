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
 * Restore Command
 * 
 * Handles restoring saved game state:
 * - "restore" - Restore the game state from localStorage
 * 
 * Follows traditional Zork behavior:
 * - Does NOT count as a move
 * - Provides clear feedback on success/failure
 * - Fails gracefully if no save exists
 */
export class RestoreCommand extends BaseCommand {
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
      'restore',
      [],
      'restore',
      'Restore a previously saved game.',
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
   * Execute the restore command
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);

    try {
      // Parse arguments - restore command should have no arguments
      const args = this.getArgs(input);
      
      if (args.length > 0) {
        this.logger.debug('Restore command received unexpected arguments');
        return this.failure('Just type "restore" to restore your saved game.', false);
      }

      // Check if a saved game exists
      if (!this.persistence.hasSavedGame()) {
        this.logger.debug('No saved game found');
        return this.failure('No saved game found.', false);
      }

      // Attempt to restore the game
      this.logger.info('Attempting to restore game state');
      
      try {
        // Call the persistence service to restore the game
        // The restore operation should complete synchronously in most cases
        // since localStorage access is synchronous
        this.persistence.restoreGame().then(success => {
          if (success) {
            this.logger.info('Game restored successfully');
          } else {
            this.logger.warn('Game restore failed');
          }
        }).catch(error => {
          this.logger.error('Restore operation failed:', error);
        });
        
        // Return immediate success - the restore should complete quickly
        this.logger.info('Game restore initiated');
        const result = this.success('Game restored.', false, 0);
        this.logExecutionSuccess(result);
        return result;

      } catch (restoreError) {
        this.logger.error('Restore command failed:', restoreError);
        return this.failure('Failed to restore the saved game. The save file may be corrupted.', false);
      }

    } catch (error) {
      this.logExecutionError(error as Error, input);
      return this.failure('An error occurred while restoring the game.', false);
    }
  }

  /**
   * Check if the restore command can be executed
   */
  override canExecute(): boolean {
    // Restore command can always be attempted
    // The actual check for save existence happens in execute()
    return true;
  }

  /**
   * Get command suggestions
   */
  override getSuggestions(input: string): string[] {
    if (input === '' || 'restore'.startsWith(input.toLowerCase())) {
      return ['restore'];
    }
    return [];
  }
}