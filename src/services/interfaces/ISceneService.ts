/**
 * Manages scene navigation logic and scene-based operations.
 * 
 * This service is responsible for:
 * - Validating and executing movement between scenes
 * - Managing items that exist in scenes (not in player inventory)
 * - Providing scene descriptions based on current state
 * - Implementing scene-specific business logic
 * 
 * Boundaries:
 * - Does NOT manage scene data access (GameStateService responsibility)
 * - Does NOT track player's current location (GameStateService responsibility)
 * - Does NOT manage player inventory (InventoryService responsibility)
 * - Does NOT manage item internal states (ItemService responsibility)
 * - Focus is on scene navigation and scene-related business logic
 */
export interface ISceneService {
  /** Check if movement from current scene in given direction is valid */
  canMoveTo(fromScene: string, direction: string): boolean;
  
  /** Execute movement in given direction, returns destination scene ID */
  moveTo(direction: string): string;
  
  /** Get list of valid exits from a scene */
  getExits(sceneId: string): string[];
  
  /** Get list of items currently in a scene */
  getSceneItems(sceneId: string): string[];
  
  /** Add an item to a scene (when dropped by player or spawned) */
  addItemToScene(sceneId: string, itemId: string): void;
  
  /** Remove an item from a scene (when taken by player) */
  removeItemFromScene(sceneId: string, itemId: string): void;
  
  /** Get the current description of a scene (may vary based on game state) */
  getSceneDescription(sceneId: string): string;
}