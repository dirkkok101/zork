import { ItemOperationResult, Item } from '../../types/ItemTypes';

/**
 * Item Service Interface
 * Handles basic item operations and generic interactions
 * Following Single Responsibility Principle - focused on core item management
 */
export interface IItemService {
  /**
   * Get an item by its ID
   * @param itemId Unique identifier of the item
   * @returns Item or undefined if not found
   */
  getItem(itemId: string): Item | undefined;

  /**
   * Find an item by name or ID in either the inventory or current scene
   * @param nameOrId Item name or ID to find
   * @param inventoryOnly Whether to search only in inventory
   * @returns The found item or undefined
   */
  findItem(nameOrId: string, inventoryOnly?: boolean): Item | undefined;

  /**
   * Check if an item matches a name or ID
   * @param item Item to check
   * @param nameOrId Name or ID to match
   * @returns Whether the item matches the provided name or ID
   */
  itemMatches(item: Item, nameOrId: string): boolean;

  /**
   * Take an item from the current scene
   * @param itemNameOrId Name or ID of the item to take
   * @returns Result of the take operation
   */
  takeItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Drop an item from inventory to the current scene
   * @param itemNameOrId Name or ID of the item to drop
   * @returns Result of the drop operation
   */
  dropItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Examine an item
   * @param itemNameOrId Name or ID of the item to examine
   * @returns Result of the examine operation with description text
   */
  examineItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Read an item (books, signs, labels)
   * @param itemNameOrId Name or ID of the item to read
   * @returns Result of the read operation with text content
   */
  readItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Search an item for hidden contents or information
   * @param itemNameOrId Name or ID of the item to search
   * @returns Result of the search operation
   */
  searchItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Turn an item (dials, switches, mechanisms)
   * @param itemNameOrId Name or ID of the item to turn
   * @param direction Optional direction (clockwise, counterclockwise)
   * @returns Result of the turn operation
   */
  turnItem(itemNameOrId: string, direction?: string): ItemOperationResult;

  /**
   * Push an item (buttons, movable objects)
   * @param itemNameOrId Name or ID of the item to push
   * @returns Result of the push operation
   */
  pushItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Pull an item (levers, ropes, movable objects)  
   * @param itemNameOrId Name or ID of the item to pull
   * @returns Result of the pull operation
   */
  pullItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Generic interaction method for handling any item interaction
   * @param itemNameOrId Name or ID of the item
   * @param action The action to perform
   * @param target Optional target for the action
   * @returns Result of the interaction
   */
  interactWithItem(itemNameOrId: string, action: string, target?: string): ItemOperationResult;

  /**
   * Check if an item can be interacted with using a specific action
   * @param itemNameOrId Name or ID of the item
   * @param action The action to check
   * @returns Whether the interaction is possible
   */
  canInteractWith(itemNameOrId: string, action: string): boolean;

  /**
   * Get all possible interactions for an item
   * @param itemNameOrId Name or ID of the item
   * @returns Array of available interaction commands
   */
  getAvailableInteractions(itemNameOrId: string): string[];

  /**
   * Get an item's current state property
   * @param itemId ID of the item
   * @param property Property name to get
   * @returns The property value
   */
  getItemProperty(itemId: string, property: string): any;

  /**
   * Set an item's state property
   * @param itemId ID of the item
   * @param property Property name to set
   * @param value Value to set
   */
  setItemProperty(itemId: string, property: string, value: any): void;

  /**
   * Update multiple properties of an item's state
   * @param itemId ID of the item
   * @param updates Object with property updates
   */
  updateItemState(itemId: string, updates: Record<string, any>): void;
}