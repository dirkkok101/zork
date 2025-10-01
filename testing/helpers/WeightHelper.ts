/**
 * Weight and Capacity Test Helper
 * Provides utilities for testing weight restrictions and capacity limits
 */

import { CommandResult } from '@/types/CommandTypes';

export class WeightHelper {
  constructor(
    private commandProcessor: any,
    private gameState: any,
    private scene: any,
    private items: any
  ) {}

  /**
   * Get current player inventory weight
   */
  getCurrentWeight(): number {
    const gameState = this.gameState.getGameState();
    return gameState.inventory.reduce((total: number, itemId: string) => {
      const item = this.gameState.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
  }

  /**
   * Get weight limit threshold (based on InventoryService.hasLightLoad())
   */
  getWeightLimit(): number {
    return 15; // Matches InventoryService implementation
  }

  /**
   * Check if player can exit based on weight (light load check)
   */
  canExitWithCurrentWeight(): boolean {
    return this.getCurrentWeight() <= this.getWeightLimit();
  }

  /**
   * Attempt to exit in specified direction
   */
  attemptExit(direction: string): CommandResult {
    return this.commandProcessor.processCommand(direction);
  }

  /**
   * Execute specific movement command
   */
  executeMovementCommand(command: string): CommandResult {
    return this.commandProcessor.processCommand(command);
  }

  /**
   * Verify successful exit (no weight restriction)
   */
  verifySuccessfulExit(result: CommandResult, expectedDestination: string): void {
    expect(result.success).toBe(true);
    expect(result.countsAsMove).toBe(true);
    expect(this.getCurrentScene()).toBe(expectedDestination);
  }

  /**
   * Verify exit was blocked due to weight
   */
  verifyWeightBlockedExit(result: CommandResult, currentScene: string): void {
    expect(result.success).toBe(false);
    expect(result.countsAsMove).toBe(true); // Failed moves still count
    expect(this.getCurrentScene()).toBe(currentScene); // Player should still be in same scene
  }

  /**
   * Verify the weight-based error message
   */
  verifyWeightErrorMessage(result: CommandResult): void {
    // Common weight-related error patterns
    expect(result.message).toMatch(/too narrow|too heavy|baggage|burden|load/i);
  }

  /**
   * Get current scene ID
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Drop an item from inventory
   */
  dropItem(itemId: string): CommandResult {
    return this.commandProcessor.processCommand(`drop ${itemId}`);
  }

  /**
   * Verify item was dropped successfully
   */
  verifyItemDropped(result: CommandResult, itemId: string): void {
    expect(result.success).toBe(true);

    // Item should no longer be in inventory
    const inventory = this.gameState.getGameState().inventory;
    expect(inventory).not.toContain(itemId);
  }

  /**
   * Drop all items from inventory
   */
  dropAllItems(): void {
    const inventory = [...this.gameState.getGameState().inventory];
    inventory.forEach((itemId: string) => {
      this.dropItem(itemId);
    });

    // Verify inventory is empty
    expect(this.gameState.getGameState().inventory).toEqual([]);
  }

  /**
   * Get weight of specific item
   */
  getItemWeight(itemId: string): number {
    const item = this.gameState.getItem(itemId);
    return item?.weight || 0;
  }

  /**
   * Verify weight calculation matches expected
   */
  verifyWeight(expectedWeight: number): void {
    const actualWeight = this.getCurrentWeight();
    expect(actualWeight).toBe(expectedWeight);
  }

  /**
   * Verify weight is within range
   */
  verifyWeightInRange(min: number, max: number): void {
    const weight = this.getCurrentWeight();
    expect(weight).toBeGreaterThanOrEqual(min);
    expect(weight).toBeLessThanOrEqual(max);
  }

  /**
   * Check if inventory is at light load
   */
  isLightLoad(): boolean {
    return this.canExitWithCurrentWeight();
  }

  /**
   * Check if inventory is at heavy load
   */
  isHeavyLoad(): boolean {
    return !this.canExitWithCurrentWeight();
  }

  /**
   * Get inventory contents
   */
  getInventory(): string[] {
    return this.gameState.getGameState().inventory;
  }

  /**
   * Verify inventory contains specific items
   */
  verifyInventoryContains(itemIds: string[]): void {
    const inventory = this.getInventory();
    itemIds.forEach(itemId => {
      expect(inventory).toContain(itemId);
    });
  }

  /**
   * Test if adding item would exceed weight limit
   */
  wouldExceedLimit(itemId: string): boolean {
    const currentWeight = this.getCurrentWeight();
    const itemWeight = this.getItemWeight(itemId);
    return (currentWeight + itemWeight) > this.getWeightLimit();
  }

  /**
   * Clear player inventory
   */
  clearInventory(): void {
    this.gameState.getGameState().inventory = [];
  }

  /**
   * Add item to inventory for testing
   */
  addItemToInventory(itemId: string): void {
    const inventory = this.gameState.getGameState().inventory;
    if (!inventory.includes(itemId)) {
      inventory.push(itemId);
    }
  }

  /**
   * Verify success
   */
  verifySuccess(result: CommandResult): void {
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  }

  /**
   * Verify failure
   */
  verifyFailure(result: CommandResult): void {
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  }

  /**
   * Verify message contains expected text
   */
  verifyMessageContains(result: CommandResult, expectedText: string): void {
    expect(result.message).toContain(expectedText);
  }

  /**
   * Test container weight including contents
   */
  getContainerWeight(containerId: string, includeContents: boolean = true): number {
    const container = this.gameState.getItem(containerId);
    if (!container) return 0;

    let weight = container.weight || 0;

    if (includeContents && container.contents && Array.isArray(container.contents)) {
      weight += container.contents.reduce((total: number, itemId: string) => {
        return total + this.getItemWeight(itemId);
      }, 0);
    }

    return weight;
  }

  /**
   * Verify container weight calculation
   */
  verifyContainerWeight(containerId: string, expectedWeight: number, includeContents: boolean = true): void {
    const actualWeight = this.getContainerWeight(containerId, includeContents);
    expect(actualWeight).toBe(expectedWeight);
  }

  /**
   * Check if item is a container
   */
  isContainer(itemId: string): boolean {
    return this.items.isContainer(itemId);
  }

  /**
   * Get available exits from current scene
   */
  getAvailableExits(): any[] {
    return this.scene.getAvailableExits(this.getCurrentScene());
  }

  /**
   * Verify specific exit exists
   */
  verifyExitExists(direction: string): void {
    const exits = this.getAvailableExits();
    const hasExit = exits.some(exit => exit.direction === direction);
    expect(hasExit).toBe(true);
  }

  /**
   * Test weight persistence across commands
   */
  verifyWeightPersistence(expectedWeight: number, commands: string[]): void {
    // Execute commands
    commands.forEach(cmd => this.commandProcessor.processCommand(cmd));

    // Weight should remain unchanged
    this.verifyWeight(expectedWeight);
  }

  /**
   * Test weight calculation is consistent
   */
  verifyWeightConsistency(expectedWeight: number, iterations: number = 5): void {
    for (let i = 0; i < iterations; i++) {
      const weight = this.getCurrentWeight();
      expect(weight).toBe(expectedWeight);
    }
  }
}
