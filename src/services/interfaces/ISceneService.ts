import { Exit, SceneItem } from '../../types/SceneTypes';

/**
 * Manages scene navigation logic and scene-based operations.
 * 
 * This service handles all behavior that was previously on Scene objects:
 * - Scene descriptions with conditional logic and lighting
 * - Exit availability based on conditions and game state
 * - Visible item filtering based on conditions
 * - Scene entry/exit logic and actions
 * - Scene state management
 * 
 * Boundaries:
 * - Does NOT manage scene data access (GameStateService responsibility)
 * - Does NOT track player's current location (GameStateService responsibility)
 * - Does NOT manage player inventory (InventoryService responsibility)
 * - Does NOT manage item internal states (ItemService responsibility)
 * - Focus is on scene navigation and scene-related business logic
 */
export interface ISceneService {
  /** Get the complete description of a scene (handles lighting, first visit, etc.) */
  getSceneDescription(sceneId: string): string;
  
  /** Get available exits from a scene (filters based on conditions, locks, etc.) */
  getAvailableExits(sceneId: string): Exit[];
  
  /** Get all exits from a scene (including blocked/conditional ones) */
  getAllExits(sceneId: string): Exit[];
  
  /** Get visible items in a scene (filters based on conditions and visibility) */
  getVisibleItems(sceneId: string): SceneItem[];
  
  /** Check if player can enter a scene (handles entry conditions) */
  canEnterScene(sceneId: string): boolean;
  
  /** Handle scene entry logic (triggers entry actions, updates visited status) */
  enterScene(sceneId: string): void;
  
  /** Handle scene exit logic (triggers exit actions) */
  exitScene(sceneId: string): void;
  
  /** Check if movement from current scene in given direction is valid */
  canMoveTo(fromScene: string, direction: string): boolean;
  
  /** Execute movement in given direction, returns destination scene ID */
  moveTo(direction: string): string;
  
  /** Get list of items currently in a scene (runtime state) */
  getSceneItems(sceneId: string): string[];
  
  /** Add an item to a scene (when dropped by player or spawned) */
  addItemToScene(sceneId: string, itemId: string): void;
  
  /** Remove an item from a scene (when taken by player) */
  removeItemFromScene(sceneId: string, itemId: string): void;

  // Door operations
  /** Check if a door item can be opened in the current scene */
  canOpenDoor(sceneId: string, doorItemId: string): boolean;
  
  /** Check if a door item can be closed in the current scene */
  canCloseDoor(sceneId: string, doorItemId: string): boolean;
  
  /** Open a door item, updating scene flags and exit availability */
  openDoor(sceneId: string, doorItemId: string): DoorResult;
  
  /** Close a door item, updating scene flags and exit availability */
  closeDoor(sceneId: string, doorItemId: string): DoorResult;
}

/**
 * Result of a door operation
 */
export interface DoorResult {
  success: boolean;
  message: string;
  stateChanged: boolean;
}