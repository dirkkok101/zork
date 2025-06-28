import { GameState } from '../../types/GameState';

/**
 * Save slot information
 */
export interface SaveSlot {
    /** Save slot name/identifier */
    name: string;
    
    /** Timestamp when the save was created */
    timestamp: number;
    
    /** Human-readable date string */
    dateString: string;
    
    /** Current scene name at time of save */
    sceneName: string;
    
    /** Current score at time of save */
    score: number;
    
    /** Number of moves at time of save */
    moves: number;
    
    /** Save file version for compatibility */
    version: string;
    
    /** Optional description/note about the save */
    description?: string;
}

/**
 * Persistence operation result
 */
export interface PersistenceResult {
    /** Whether the operation was successful */
    success: boolean;
    
    /** Human-readable message about the operation */
    message: string;
    
    /** Optional error details for debugging */
    error?: string;
}

/**
 * Game Persistence Service Interface
 * 
 * Handles all save/load operations following Single Responsibility Principle.
 * Extracted from the monolithic GameStateService to achieve proper SOLID compliance.
 * 
 * Responsibilities:
 * - Game state serialization and deserialization
 * - Save slot management
 * - Local storage operations
 * - Save file versioning and compatibility
 * 
 * Dependencies:
 * - Game state structure for serialization
 * - Local storage or file system for persistence
 * - Scene service for scene name resolution
 */
export interface IGamePersistenceService {
    /**
     * Save the current game state to a named slot
     * @param gameState Current game state to save
     * @param slotName Name of the save slot (default: 'default')
     * @param description Optional description for the save
     * @returns Result of the save operation
     */
    saveGame(gameState: GameState, slotName?: string, description?: string): Promise<PersistenceResult>;
    
    /**
     * Load a game state from a named slot
     * @param slotName Name of the save slot to load
     * @returns Loaded game state or null if not found
     */
    loadGame(slotName: string): Promise<GameState | null>;
    
    /**
     * Get information about all available save slots
     * @returns Array of save slot information sorted by timestamp
     */
    getAvailableSaveSlots(): Promise<SaveSlot[]>;
    
    /**
     * Check if a save slot exists
     * @param slotName Name of the save slot to check
     * @returns Whether the save slot exists
     */
    saveSlotExists(slotName: string): Promise<boolean>;
    
    /**
     * Delete a save slot
     * @param slotName Name of the save slot to delete
     * @returns Result of the delete operation
     */
    deleteSaveSlot(slotName: string): Promise<PersistenceResult>;
    
    /**
     * Get detailed information about a specific save slot
     * @param slotName Name of the save slot
     * @returns Detailed save slot information or null if not found
     */
    getSaveSlotInfo(slotName: string): Promise<SaveSlot | null>;
    
    /**
     * Export a save game to a portable format
     * @param slotName Name of the save slot to export
     * @returns Serialized save data for backup/sharing
     */
    exportSaveGame(slotName: string): Promise<string | null>;
    
    /**
     * Import a save game from a portable format
     * @param saveData Serialized save data to import
     * @param slotName Name to assign to the imported save
     * @returns Result of the import operation
     */
    importSaveGame(saveData: string, slotName: string): Promise<PersistenceResult>;
    
    /**
     * Validate a game state for save compatibility
     * @param gameState Game state to validate
     * @returns Whether the game state is valid for saving
     */
    validateGameState(gameState: GameState): Promise<boolean>;
    
    /**
     * Migrate an old save file to the current version
     * @param oldSaveData Save data in old format
     * @returns Migrated game state or null if migration failed
     */
    migrateSaveData(oldSaveData: any): Promise<GameState | null>;
    
    /**
     * Get the maximum number of save slots supported
     * @returns Maximum number of save slots (0 = unlimited)
     */
    getMaxSaveSlots(): Promise<number>;
    
    /**
     * Get the total storage space used by save files
     * @returns Storage space in bytes
     */
    getStorageUsed(): Promise<number>;
    
    /**
     * Clear all save data (useful for testing or reset)
     * @returns Result of the clear operation
     */
    clearAllSaves(): Promise<PersistenceResult>;
    
    /**
     * Create an autosave of the current game state
     * Autosaves are managed separately from manual saves
     * @param gameState Current game state to autosave
     * @returns Result of the autosave operation
     */
    createAutosave(gameState: GameState): Promise<PersistenceResult>;
    
    /**
     * Load the most recent autosave
     * @returns Most recent autosave game state or null if none exists
     */
    loadAutosave(): Promise<GameState | null>;
    
    /**
     * Configure autosave settings
     * @param enabled Whether autosave is enabled
     * @param interval Autosave interval in moves (0 = disabled)
     * @returns Result of the configuration change
     */
    configureAutosave(enabled: boolean, interval: number): Promise<PersistenceResult>;
    
    /**
     * Get current autosave configuration
     * @returns Autosave settings
     */
    getAutosaveConfig(): Promise<{
        enabled: boolean;
        interval: number;
        lastAutosave?: number;
    }>;
    
    /**
     * Backup all save data to an external format
     * @returns Complete backup data for all saves
     */
    createBackup(): Promise<string>;
    
    /**
     * Restore save data from a backup
     * @param backupData Complete backup data
     * @param overwrite Whether to overwrite existing saves
     * @returns Result of the restore operation
     */
    restoreFromBackup(backupData: string, overwrite: boolean): Promise<PersistenceResult>;
}