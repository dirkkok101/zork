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
 * This service handles all behavior that was previously on Item objects:
 * - Item interactions and validations
 * - Container operations (open, close, get contents)
 * - Light source operations (light on/off, fuel management)
 * - Lockable item operations (lock, unlock with keys)
 * - Item state changes and condition checking
 * - Item descriptions and readable content
 * 
 * Boundaries:
 * - Does NOT manage item data access (GameStateService responsibility)
 * - Does NOT manage item locations (InventoryService/SceneService responsibility)
 * - Does NOT handle combat mechanics (CombatService responsibility)
 * - Does NOT manage global game state (GameStateService responsibility)
 * - Focus is purely on item-specific business logic
 */
export interface IItemService {
  // Basic item operations
  /** Get item data by ID */
  getItem(itemId: string): any;
  
  /** Check if an item can be picked up */
  canTake(itemId: string): boolean;
  
  /** Take an item and add it to inventory */
  takeItem(itemId: string): ItemResult;
  
  /** Put an item in a container or location */
  putItem(itemId: string, targetId?: string, preposition?: string): ItemResult;
  
  /** Get detailed examination description of an item */
  examineItem(itemId: string): string;
  
  /** Read text content of an item (books, signs, etc.) */
  readItem(itemId: string): string;
  
  /** Use an item, optionally on a target */
  useItem(itemId: string, targetId?: string): ItemResult;
  
  // Container operations
  /** Check if an item is a container */
  isContainer(itemId: string): boolean;
  
  /** Check if a container can be opened */
  canOpen(itemId: string): boolean;
  
  /** Open a container, optionally with a key */
  openItem(itemId: string, keyId?: string): ItemResult;
  
  /** Close a container */
  closeItem(itemId: string): ItemResult;
  
  /** Get items inside a container */
  getContainerContents(itemId: string): string[];
  
  /** Add item to container */
  addToContainer(containerId: string, itemId: string): ItemResult;
  
  /** Remove item from container */
  removeFromContainer(containerId: string, itemId: string): ItemResult;
  
  // Light source operations
  /** Check if an item is a light source */
  isLightSource(itemId: string): boolean;
  
  /** Check if a light source is currently lit */
  isLit(itemId: string): boolean;
  
  /** Turn on a light source */
  lightOn(itemId: string): ItemResult;
  
  /** Turn off a light source */
  lightOff(itemId: string): ItemResult;
  
  // Lockable operations
  /** Check if an item can be locked/unlocked */
  isLockable(itemId: string): boolean;
  
  /** Check if an item is currently locked */
  isLocked(itemId: string): boolean;
  
  /** Lock an item with a key */
  lockItem(itemId: string, keyId: string): ItemResult;
  
  /** Unlock an item with a key */
  unlockItem(itemId: string, keyId: string): ItemResult;

  // Container search and state methods
  /** Check if a container is currently open */
  isContainerOpen(containerId: string): boolean;

  /** Find an item by name in open containers */
  findItemInOpenContainers(itemName: string, containerIds: string[]): string | null;

  /** Check if an item matches a name or alias */
  itemMatches(item: any, name: string): boolean;

  // Suggestion helper methods for autocomplete
  /** Get portable items in a scene for autocomplete suggestions */
  getPortableItemsInScene(sceneId: string): any[];

  /** Get visible items in a scene for autocomplete suggestions */
  getVisibleItemsInScene(sceneId: string): any[];

  /** Get openable items in a scene for autocomplete suggestions */
  getOpenableItemsInScene(sceneId: string, mustBeClosed: boolean): any[];

  /** Get all items in player's inventory for autocomplete suggestions */
  getInventoryItems(): any[];

  /** Get readable items in a scene for autocomplete suggestions */
  getReadableItemsInScene(sceneId: string): any[];
}