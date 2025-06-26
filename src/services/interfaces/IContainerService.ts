import { Item, ContainerItem, ItemOperationResult } from '../../types/ItemTypes';

/**
 * Result of container operations
 */
export interface ContainerResult extends ItemOperationResult {
  /** Container involved in the operation */
  container?: ContainerItem;
  
  /** Item involved in the operation */
  item?: Item;
}

/**
 * Container Service Interface
 * Manages container items, their contents, and interactions
 * Following Single Responsibility Principle - focused only on container operations
 */
export interface IContainerService {
  /**
   * Find a container in the current scene or inventory
   * @param containerNameOrId Name or ID of the container to find
   * @returns Container item or undefined if not found
   */
  findContainer(containerNameOrId: string): ContainerItem | undefined;

  /**
   * Check if an item can be placed in a container
   * @param itemNameOrId Name or ID of the item to put
   * @param containerNameOrId Name or ID of the container
   * @returns Whether the item can be put in the container and reason if not
   */
  canPutItemInContainer(itemNameOrId: string, containerNameOrId: string): { canPut: boolean; reason?: string };

  /**
   * Put an item into a container
   * @param itemNameOrId Name or ID of the item to put
   * @param containerNameOrId Name or ID of the container
   * @returns Result of the put operation
   */
  putItemInContainer(itemNameOrId: string, containerNameOrId: string): ContainerResult;

  /**
   * Take an item from a container
   * @param itemNameOrId Name or ID of the item to take
   * @param containerNameOrId Name or ID of the container
   * @returns Result of the take operation
   */
  takeItemFromContainer(itemNameOrId: string, containerNameOrId: string): ContainerResult;

  /**
   * Open a container
   * @param containerNameOrId Name or ID of the container to open
   * @returns Result of the open operation
   */
  openContainer(containerNameOrId: string): ContainerResult;

  /**
   * Close a container
   * @param containerNameOrId Name or ID of the container to close
   * @returns Result of the close operation
   */
  closeContainer(containerNameOrId: string): ContainerResult;

  /**
   * Check if a container is open
   * @param containerNameOrId Name or ID of the container
   * @returns Whether the container is open
   */
  isContainerOpen(containerNameOrId: string): boolean;

  /**
   * Check if a container is locked
   * @param containerNameOrId Name or ID of the container
   * @returns Whether the container is locked
   */
  isContainerLocked(containerNameOrId: string): boolean;

  /**
   * Lock a container with a key
   * @param containerNameOrId Name or ID of the container to lock
   * @param keyNameOrId Name or ID of the key to use
   * @returns Result of the lock operation
   */
  lockContainer(containerNameOrId: string, keyNameOrId: string): ContainerResult;

  /**
   * Unlock a container with a key
   * @param containerNameOrId Name or ID of the container to unlock
   * @param keyNameOrId Name or ID of the key to use
   * @returns Result of the unlock operation
   */
  unlockContainer(containerNameOrId: string, keyNameOrId: string): ContainerResult;

  /**
   * Get all visible items in a container
   * @param containerNameOrId Name or ID of the container
   * @returns Array of item IDs in the container
   */
  getContainerContents(containerNameOrId: string): string[];

  /**
   * Get the total weight of items in a container
   * @param containerNameOrId Name or ID of the container
   * @returns Total weight of container contents
   */
  getContainerWeight(containerNameOrId: string): number;

  /**
   * Get the remaining capacity of a container
   * @param containerNameOrId Name or ID of the container
   * @returns Number of additional items the container can hold
   */
  getRemainingCapacity(containerNameOrId: string): number;

  /**
   * Get the remaining weight capacity of a container
   * @param containerNameOrId Name or ID of the container
   * @returns Additional weight the container can hold
   */
  getRemainingWeightCapacity(containerNameOrId: string): number;

  /**
   * Check if an item is a container
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is a container
   */
  isContainer(itemNameOrId: string): boolean;
}