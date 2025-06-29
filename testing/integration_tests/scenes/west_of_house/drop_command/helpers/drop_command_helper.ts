/**
 * Drop Command Test Helper
 * Provides utilities for testing the Drop command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IInventoryService, IItemService, ISceneService } from '@/services/interfaces';

export class DropCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private inventory: IInventoryService,
    private items: IItemService,
    private scene: ISceneService
  ) {}

  /**
   * Execute a drop command and return the result
   */
  executeDrop(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "drop <item>" command
   */
  executeDropItem(item: string): CommandResult {
    return this.executeDrop(`drop ${item}`);
  }

  /**
   * Execute "drop <item> down" command
   */
  executeDropDown(item: string): CommandResult {
    return this.executeDrop(`drop ${item} down`);
  }

  /**
   * Execute "drop <item> in <container>" command
   */
  executeDropInContainer(item: string, container: string): CommandResult {
    return this.executeDrop(`drop ${item} in ${container}`);
  }

  /**
   * Execute a take command (for test setup)
   */
  executeTake(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute an open command (for test setup)
   */
  executeOpen(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Check if an item is in the player's inventory
   */
  isInInventory(itemId: string): boolean {
    return this.inventory.hasItem(itemId);
  }

  /**
   * Check if an item is in the current scene
   */
  isInScene(itemId: string): boolean {
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    return sceneItems.includes(itemId);
  }

  /**
   * Check if an item is in a specific container
   */
  isInContainer(itemId: string, containerId: string): boolean {
    const contents = this.items.getContainerContents(containerId);
    return contents.includes(itemId);
  }

  /**
   * Check if a container is open
   */
  isContainerOpen(containerId: string): boolean {
    const container = this.gameState.getItem(containerId);
    if (!container) return false;
    return container.state?.open || false;
  }

  /**
   * Get current inventory count
   */
  getInventoryCount(): number {
    return this.inventory.getItems().length;
  }

  /**
   * Verify that the command succeeded
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify that the command failed with optional message pattern
   */
  verifyFailure(result: CommandResult, expectedMessagePattern?: string | RegExp): void {
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify that the command does not count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify that the command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify successful drop message
   */
  verifyDropSuccess(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`drop.*${itemName}`, 'i'));
    this.verifyCountsAsMove(result);
  }

  /**
   * Verify successful put message (when drop routes to put)
   */
  verifyPutSuccess(result: CommandResult, itemName: string, targetName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`put.*${itemName}`, 'i'));
    expect(result.message).toMatch(new RegExp(targetName, 'i'));
    this.verifyCountsAsMove(result);
  }

  /**
   * Verify don't have item message
   */
  verifyDontHave(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't have.*${itemName}`, 'i'));
  }

  /**
   * Verify can't put in container message
   */
  verifyCannotPutIn(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't put.*${containerName}`, 'i'));
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify container is closed message
   */
  verifyContainerClosed(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*closed`, 'i'));
  }

  /**
   * Verify item was moved from inventory to scene
   */
  verifyItemMovedToScene(itemId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInScene(itemId)).toBe(true);
  }

  /**
   * Verify item was moved from inventory to container
   */
  verifyItemMovedToContainer(itemId: string, containerId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInContainer(itemId, containerId)).toBe(true);
    expect(this.isInScene(itemId)).toBe(false);
  }

  /**
   * Verify inventory count changed by expected amount
   */
  verifyInventoryCountChange(initialCount: number, expectedChange: number): void {
    const currentCount = this.getInventoryCount();
    expect(currentCount).toBe(initialCount + expectedChange);
  }

  /**
   * Setup: Add item to inventory for testing
   */
  addToInventory(itemId: string): void {
    this.inventory.addItem(itemId);
  }

  /**
   * Setup: Remove item from scene for testing
   */
  removeFromScene(itemId: string): void {
    const currentSceneId = this.gameState.getCurrentScene();
    this.scene.removeItemFromScene(currentSceneId, itemId);
  }

}