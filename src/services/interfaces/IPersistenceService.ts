/**
 * Manages game state persistence (save and restore operations).
 * 
 * This service is responsible for:
 * - Serializing current game state to persistent storage
 * - Restoring game state from saved data
 * - Managing save file existence and validity
 * - Coordinating with all other services for complete state capture
 * 
 * Boundaries:
 * - Does NOT own the actual game state (other services own their data)
 * - Does NOT handle user interface for save/restore (OutputService responsibility)
 * - Does NOT validate game state consistency (each service validates its own data)
 * - Focus is purely on persistence mechanics
 */
export interface IPersistenceService {
  /** Save current game state to persistent storage */
  saveGame(): Promise<boolean>;
  
  /** Restore game state from saved data */
  restoreGame(): Promise<boolean>;
  
  /** Check if a saved game exists */
  hasSavedGame(): boolean;
}