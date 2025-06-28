import { Exit, Direction } from '../../types/SceneTypes';
import { GameState } from '../../types/GameState';

/**
 * Navigation result containing success status and message
 */
export interface NavigationResult {
    /** Whether the navigation was successful */
    success: boolean;
    
    /** Message describing the result */
    message: string;
    
    /** Optional destination scene ID if successful */
    destinationId?: string;
}

/**
 * Scene Navigation Service Interface
 * 
 * Handles all navigation-related operations between scenes following Single Responsibility Principle.
 * Extracted from the monolithic SceneService to achieve proper SOLID compliance.
 * 
 * Responsibilities:
 * - Movement validation and execution
 * - Exit availability checking
 * - Direction parsing and validation
 * - Navigation state management
 * 
 * Dependencies:
 * - Scene data for exit information
 * - Game state for condition evaluation
 * - Condition evaluation service for exit restrictions
 */
export interface ISceneNavigationService {
    /**
     * Move in the specified direction from the current scene
     * @param direction Direction to move (north, south, east, west, up, down, etc.)
     * @param gameState Current game state
     * @returns Navigation result with success status and message
     */
    moveInDirection(direction: Direction, gameState: GameState): Promise<NavigationResult>;
    
    /**
     * Get all available exits from the current scene
     * Filters exits based on conditions, locks, and visibility
     * @param sceneId Scene ID to get exits for
     * @param gameState Current game state for condition checking
     * @returns Array of available exits
     */
    getAvailableExits(sceneId: string, gameState: GameState): Promise<Exit[]>;
    
    /**
     * Check if a specific direction is available from the current scene
     * @param sceneId Scene ID to check
     * @param direction Direction to validate
     * @param gameState Current game state
     * @returns Whether the direction is available
     */
    canMoveInDirection(sceneId: string, direction: Direction, gameState: GameState): Promise<boolean>;
    
    /**
     * Get the destination scene ID for a given direction
     * @param sceneId Current scene ID
     * @param direction Direction to check
     * @param gameState Current game state
     * @returns Destination scene ID or null if no valid exit
     */
    getDestination(sceneId: string, direction: Direction, gameState: GameState): Promise<string | null>;
    
    /**
     * Unlock an exit in the specified direction
     * @param sceneId Scene ID containing the exit
     * @param direction Direction of the exit to unlock
     * @param keyId ID of the key to use
     * @param gameState Current game state
     * @returns Result of the unlock operation
     */
    unlockExit(sceneId: string, direction: Direction, keyId: string, gameState: GameState): Promise<NavigationResult>;
    
    /**
     * Get all scenes that connect to the specified scene
     * Useful for reverse navigation and pathfinding
     * @param targetSceneId Scene to find connections to
     * @returns Array of scene IDs that have exits leading to the target
     */
    getConnectedScenes(targetSceneId: string): Promise<string[]>;
    
    /**
     * Validate a direction string and convert to canonical form
     * @param direction Raw direction input (e.g., "n", "north", "northeast")
     * @returns Canonical direction or null if invalid
     */
    parseDirection(direction: string): Direction | null;
    
    /**
     * Get all valid direction aliases for a given canonical direction
     * @param direction Canonical direction
     * @returns Array of valid aliases (e.g., ["north", "n", "nor"])
     */
    getDirectionAliases(direction: Direction): string[];
    
    /**
     * Check if movement between two scenes is possible
     * Useful for pathfinding and quest validation
     * @param fromSceneId Starting scene ID
     * @param toSceneId Destination scene ID
     * @param gameState Current game state
     * @returns Whether direct movement is possible
     */
    canNavigateBetween(fromSceneId: string, toSceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get a description of an exit in a specific direction
     * @param sceneId Scene ID containing the exit
     * @param direction Direction of the exit
     * @param gameState Current game state
     * @returns Exit description or null if no exit
     */
    getExitDescription(sceneId: string, direction: Direction, gameState: GameState): Promise<string | null>;
}