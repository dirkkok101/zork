import { IPersistenceService } from './interfaces/IPersistenceService';
import { IGameStateService } from './interfaces/IGameStateService';
import { GameState } from '../types/GameState';
import log from 'loglevel';

/**
 * Saved Game Data Interface
 * Contains game state plus metadata
 */
interface SavedGameData {
  version: string;
  mode: 'classic' | 'enhanced';
  timestamp: number;
  gameState: GameState;
  playerName?: string;
  gameStyle?: string;
}

/**
 * Persistence Service Implementation
 * Handles saving and restoring game state using localStorage
 */
export class PersistenceService implements IPersistenceService {
  private readonly SAVE_KEY = 'zork-save';
  private readonly CLASSIC_VERSION = '1.0.0';
  private readonly ENHANCED_VERSION = '2.0.0';
  private logger: log.Logger;

  constructor(
    private gameStateService: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('PersistenceService');
  }

  /**
   * Save current game state to localStorage
   */
  async saveGame(): Promise<boolean> {
    try {
      this.logger.info('Saving game state...');

      // Get current game state
      const gameState = this.gameStateService.getGameState();

      // Determine if this is enhanced mode
      const isEnhanced = this.gameStateService.isEnhancedMode();
      const mode = isEnhanced ? 'enhanced' : 'classic';
      const version = isEnhanced ? this.ENHANCED_VERSION : this.CLASSIC_VERSION;

      // Create save data with metadata
      const saveData: SavedGameData = {
        version: version,
        mode: mode,
        timestamp: Date.now(),
        gameState: gameState,
        playerName: gameState.playerName,
        gameStyle: gameState.gameStyle
      };

      // Serialize to JSON
      const serializedData = JSON.stringify(saveData, null, 2);

      // Save to localStorage
      this.setStorageItem(this.SAVE_KEY, serializedData);

      this.logger.info(`Game saved successfully (${mode} mode) at ${new Date(saveData.timestamp).toISOString()}`);
      return true;

    } catch (error) {
      this.logger.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Restore game state from localStorage
   */
  async restoreGame(): Promise<boolean> {
    try {
      this.logger.info('Restoring game state...');

      // Check if save exists
      if (!this.hasSavedGame()) {
        this.logger.warn('No saved game found');
        return false;
      }

      // Load save data
      const serializedData = this.getStorageItem(this.SAVE_KEY);
      if (!serializedData) {
        this.logger.warn('Save data is empty or corrupted');
        return false;
      }

      // Parse JSON
      const saveData: SavedGameData = JSON.parse(serializedData);

      // Validate save data structure
      if (!this.validateSaveData(saveData)) {
        this.logger.error('Save data validation failed');
        return false;
      }

      // Restore game state
      this.gameStateService.setGameState(saveData.gameState);

      // Log mode information
      const mode = saveData.mode || 'classic';
      const modeInfo = mode === 'enhanced'
        ? `${mode} mode (${saveData.playerName}, ${saveData.gameStyle})`
        : `${mode} mode`;

      this.logger.info(`Game restored successfully (${modeInfo}) from ${new Date(saveData.timestamp).toISOString()}`);
      return true;

    } catch (error) {
      this.logger.error('Failed to restore game:', error);
      return false;
    }
  }

  /**
   * Check if a saved game exists
   */
  hasSavedGame(): boolean {
    try {
      const saveData = this.getStorageItem(this.SAVE_KEY);
      return saveData !== null && saveData.trim().length > 0;
    } catch (error) {
      this.logger.warn('Error checking for saved game:', error);
      return false;
    }
  }

  /**
   * Get save game metadata (for debugging/info)
   */
  getSaveMetadata(): { version: string; timestamp: number; exists: boolean } | null {
    try {
      if (!this.hasSavedGame()) {
        return { version: '', timestamp: 0, exists: false };
      }

      const serializedData = this.getStorageItem(this.SAVE_KEY);
      if (!serializedData) {
        return null;
      }

      const saveData: SavedGameData = JSON.parse(serializedData);
      return {
        version: saveData.version || 'unknown',
        timestamp: saveData.timestamp || 0,
        exists: true
      };
    } catch (error) {
      this.logger.warn('Error reading save metadata:', error);
      return null;
    }
  }

  /**
   * Delete saved game
   */
  deleteSavedGame(): boolean {
    try {
      this.removeStorageItem(this.SAVE_KEY);
      this.logger.info('Saved game deleted');
      return true;
    } catch (error) {
      this.logger.error('Failed to delete saved game:', error);
      return false;
    }
  }

  /**
   * Validate save data structure
   */
  private validateSaveData(saveData: any): saveData is SavedGameData {
    if (!saveData || typeof saveData !== 'object') {
      this.logger.error('Save data is not an object');
      return false;
    }

    if (!saveData.gameState || typeof saveData.gameState !== 'object') {
      this.logger.error('Save data missing valid gameState');
      return false;
    }

    // Check required GameState properties
    const gameState = saveData.gameState;
    const requiredProperties = [
      'currentSceneId', 'inventory', 'sceneStates', 
      'score', 'moves', 'flags', 'variables', 
      'items', 'scenes', 'monsters'
    ];

    for (const prop of requiredProperties) {
      if (!(prop in gameState)) {
        this.logger.error(`Save data missing required property: ${prop}`);
        return false;
      }
    }

    // Validate data types
    if (typeof gameState.currentSceneId !== 'string') {
      this.logger.error('Invalid currentSceneId type');
      return false;
    }

    if (!Array.isArray(gameState.inventory)) {
      this.logger.error('Invalid inventory type');
      return false;
    }

    if (typeof gameState.score !== 'number') {
      this.logger.error('Invalid score type');
      return false;
    }

    if (typeof gameState.moves !== 'number') {
      this.logger.error('Invalid moves type');
      return false;
    }

    this.logger.debug('Save data validation passed');
    return true;
  }

  /**
   * Get item from storage (with browser/Node.js compatibility)
   */
  private getStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Browser environment
      return localStorage.getItem(key);
    } else {
      // Node.js environment (for testing) - use in-memory storage
      return this.getInMemoryStorage(key);
    }
  }

  /**
   * Set item in storage (with browser/Node.js compatibility)
   */
  private setStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Browser environment
      localStorage.setItem(key, value);
    } else {
      // Node.js environment (for testing) - use in-memory storage
      this.setInMemoryStorage(key, value);
    }
  }

  /**
   * Remove item from storage (with browser/Node.js compatibility)
   */
  private removeStorageItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Browser environment
      localStorage.removeItem(key);
    } else {
      // Node.js environment (for testing) - use in-memory storage
      this.removeInMemoryStorage(key);
    }
  }

  // In-memory storage for Node.js testing environment
  private static inMemoryStorage: Map<string, string> = new Map();

  private getInMemoryStorage(key: string): string | null {
    return PersistenceService.inMemoryStorage.get(key) || null;
  }

  private setInMemoryStorage(key: string, value: string): void {
    PersistenceService.inMemoryStorage.set(key, value);
  }

  private removeInMemoryStorage(key: string): void {
    PersistenceService.inMemoryStorage.delete(key);
  }

  /**
   * Clear all in-memory storage (for testing)
   */
  static clearInMemoryStorage(): void {
    PersistenceService.inMemoryStorage.clear();
  }
}