/**
 * Manages the player's personal inventory.
 * 
 * This service handles:
 * - Tracking what items the player is carrying
 * - Enforcing carrying capacity limits
 * - Adding/removing items from player possession
 * - Providing inventory status and descriptions
 * 
 * Boundaries:
 * - Does NOT manage item properties or behaviors (ItemService responsibility)
 * - Does NOT manage items in scenes (SceneService responsibility)
 * - Does NOT handle item interactions (ItemService responsibility)
 * - Focus is purely on what the player is carrying
 */
export interface IInventoryService {
  /** Get list of item IDs currently in player inventory */
  getItems(): string[];
  
  /** Check if player has a specific item */
  hasItem(itemId: string): boolean;
  
  /** Add an item to player inventory, returns success based on capacity */
  addItem(itemId: string): boolean;
  
  /** Remove an item from player inventory */
  removeItem(itemId: string): boolean;
  
  /** Get current number of items carried */
  getItemCount(): number;
  
  /** Check if player can carry additional items */
  canCarryMore(): boolean;
  
  /** Get formatted description of player's inventory */
  getInventoryDescription(): string;
  
  /** Get current total weight of carried items */
  getCurrentWeight(): number;
  
  /** Check if player has a light load (for narrow passages) */
  hasLightLoad(): boolean;
  
  /** Check if player is empty-handed (for very narrow passages) */
  isEmptyHanded(): boolean;
}