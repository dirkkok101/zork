/**
 * Result of an item operation
 */
export interface ItemResult {
  success: boolean;
  message: string;
  stateChanged: boolean;
}

/**
 * Manages item business logic and interactions.
 * 
 * This service is responsible for:
 * - Validating item interactions (can open, can use, etc.)
 * - Executing item operations (open, close, use)
 * - Providing item descriptions and readable content
 * - Implementing item-specific behavior rules
 * 
 * Boundaries:
 * - Does NOT manage item data access (GameStateService responsibility)
 * - Does NOT manage item locations (InventoryService/SceneService responsibility)
 * - Does NOT handle combat mechanics (CombatService responsibility)
 * - Does NOT manage global game state (GameStateService responsibility)
 * - Focus is purely on item-specific business logic
 */
export interface IItemService {
  /** Check if an item can be picked up */
  canTake(itemId: string): boolean;
  
  /** Check if an item can be opened */
  canOpen(itemId: string): boolean;
  
  /** Check if an item can be used/activated */
  canUse(itemId: string): boolean;
  
  /** Open an item, optionally with a key */
  openItem(itemId: string, keyId?: string): ItemResult;
  
  /** Close an item */
  closeItem(itemId: string): ItemResult;
  
  /** Use an item, optionally on a target */
  useItem(itemId: string, targetId?: string): ItemResult;
  
  /** Get detailed examination description of an item */
  examineItem(itemId: string): string;
  
  /** Read text content of an item (books, signs, etc.) */
  readItem(itemId: string): string;
}