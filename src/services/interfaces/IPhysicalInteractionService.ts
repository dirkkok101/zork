import { ItemOperationResult } from '../../types/ItemTypes';

/**
 * Physical Interaction Service Interface
 * Handles physical manipulations of items that don't fit into other categories
 * Following Single Responsibility Principle - focused only on physical interactions
 */
export interface IPhysicalInteractionService {
  /**
   * Turn an item (dials, switches, mechanisms)
   * @param itemNameOrId Name or ID of the item to turn
   * @param direction Optional direction to turn (clockwise, counterclockwise)
   * @returns Result of the turn operation
   */
  turnItem(itemNameOrId: string, direction?: string): ItemOperationResult;

  /**
   * Search an item or container for hidden contents
   * @param itemNameOrId Name or ID of the item to search
   * @returns Result of the search operation with any discovered items
   */
  searchItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Push an item (buttons, movable objects)
   * @param itemNameOrId Name or ID of the item to push
   * @param direction Optional direction to push
   * @returns Result of the push operation
   */
  pushItem(itemNameOrId: string, direction?: string): ItemOperationResult;

  /**
   * Pull an item (levers, ropes, movable objects)
   * @param itemNameOrId Name or ID of the item to pull
   * @param direction Optional direction to pull
   * @returns Result of the pull operation
   */
  pullItem(itemNameOrId: string, direction?: string): ItemOperationResult;

  /**
   * Climb an item (trees, ropes, ladders)
   * @param itemNameOrId Name or ID of the item to climb
   * @returns Result of the climb operation
   */
  climbItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Dig with a tool at a location
   * @param toolNameOrId Name or ID of the digging tool
   * @param targetNameOrId Optional target to dig at
   * @returns Result of the dig operation
   */
  digWith(toolNameOrId: string, targetNameOrId?: string): ItemOperationResult;

  /**
   * Tie two items together (ropes, strings)
   * @param item1NameOrId Name or ID of the first item
   * @param item2NameOrId Name or ID of the second item
   * @returns Result of the tie operation
   */
  tieItems(item1NameOrId: string, item2NameOrId: string): ItemOperationResult;

  /**
   * Untie an item from whatever it's tied to
   * @param itemNameOrId Name or ID of the item to untie
   * @returns Result of the untie operation
   */
  untieItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Move an item (push furniture, slide objects)
   * @param itemNameOrId Name or ID of the item to move
   * @param direction Direction to move the item
   * @returns Result of the move operation
   */
  moveItem(itemNameOrId: string, direction: string): ItemOperationResult;

  /**
   * Lift an item (not the same as taking - for heavy objects)
   * @param itemNameOrId Name or ID of the item to lift
   * @returns Result of the lift operation
   */
  liftItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Wave an item (magic wands, flags, etc.)
   * @param itemNameOrId Name or ID of the item to wave
   * @param target Optional target to wave at
   * @returns Result of the wave operation
   */
  waveItem(itemNameOrId: string, target?: string): ItemOperationResult;

  /**
   * Rub an item (lamps, magic items)
   * @param itemNameOrId Name or ID of the item to rub
   * @returns Result of the rub operation
   */
  rubItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Touch an item (pressure plates, sensitive objects)
   * @param itemNameOrId Name or ID of the item to touch
   * @returns Result of the touch operation
   */
  touchItem(itemNameOrId: string): ItemOperationResult;

  /**
   * Check if an item can be physically manipulated in a specific way
   * @param itemNameOrId Name or ID of the item
   * @param action The physical action to check
   * @returns Whether the action is possible
   */
  canPerformAction(itemNameOrId: string, action: string): boolean;

  /**
   * Get all available physical interactions for an item
   * @param itemNameOrId Name or ID of the item
   * @returns Array of available physical actions
   */
  getAvailablePhysicalActions(itemNameOrId: string): string[];
}