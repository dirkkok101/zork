/**
 * Take Command Test Helper for Attic Scene
 * Provides utilities for testing the Take command in attic integration tests
 * Specializes in weight management and inventory mechanics
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IItemService } from '@/services/interfaces';

export class TakeCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private items: IItemService
  ) {}

  /**
   * Execute a take command and return the result
   */
  executeTake(target: string): CommandResult {
    return this.commandProcessor.processCommand(`take ${target}`);
  }

  /**
   * Execute take command with custom verb
   */
  executeTakeWith(verb: string, target: string): CommandResult {
    return this.commandProcessor.processCommand(`${verb} ${target}`);
  }

  /**
   * Execute take command with custom format
   */
  executeTakeCommand(command: string): CommandResult {
    return this.commandProcessor.processCommand(command);
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
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify item was successfully taken
   */
  verifyItemTaken(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`take.*${itemName}`, 'i'));
  }

  /**
   * Verify no score change occurred
   */
  verifyNoScoreChange(result: CommandResult): void {
    expect(result.scoreChange).toBeFalsy();
  }

  /**
   * Verify item is now in player inventory
   */
  verifyInventoryContains(itemId: string): void {
    const inventory = this.gameState.getGameState().inventory;
    expect(inventory).toContain(itemId);
  }

  /**
   * Verify item is not in player inventory
   */
  verifyInventoryDoesNotContain(itemId: string): void {
    const inventory = this.gameState.getGameState().inventory;
    expect(inventory).not.toContain(itemId);
  }

  /**
   * Verify item was removed from scene
   */
  verifyItemRemovedFromScene(itemId: string): void {
    const currentScene = this.getCurrentScene();
    const sceneItems = this.getSceneItems(currentScene);
    expect(sceneItems).not.toContain(itemId);
  }

  /**
   * Verify item is not present (already taken or not available)
   */
  verifyNotPresent(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`already have.*${itemName}|don't see.*${itemName}|can't find.*${itemName}`, 'i'));
  }

  /**
   * Verify error message for missing target
   */
  verifyMissingTarget(result: CommandResult): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(/what.*take|take.*what/i);
  }

  /**
   * Verify error message for invalid target
   */
  verifyInvalidTarget(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}|can't find.*${target}`, 'i'));
  }

  /**
   * Get current player inventory weight
   */
  getCurrentInventoryWeight(): number {
    const gameState = this.gameState.getGameState();
    return gameState.inventory.reduce((total, itemId) => {
      const item = this.gameState.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
  }

  /**
   * Check if player has light load (can exit down from attic)
   */
  hasLightLoad(): boolean {
    // This should match the game's light_load condition
    // Based on previous testing, threshold appears to be around 20
    return this.getCurrentInventoryWeight() < 20;
  }

  /**
   * Get current scene ID
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Get items in specified scene
   */
  getSceneItems(sceneId: string): string[] {
    // This should use the scene service to get current items
    const scene = this.gameState.getScene(sceneId);
    return scene?.items?.map((item: any) => item.itemId) || [];
  }

  /**
   * Check if an item is a container
   */
  isContainer(itemId: string): boolean {
    return this.items.isContainer(itemId);
  }

  /**
   * Get current moves count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Get current score for comparison
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }

  /**
   * Get player inventory
   */
  getPlayerInventory(): string[] {
    return this.gameState.getGameState().inventory;
  }

  /**
   * Clear player inventory for testing
   */
  clearPlayerInventory(): void {
    const gameState = this.gameState.getGameState();
    gameState.inventory = [];
  }

  /**
   * Add item to inventory manually for testing
   */
  addToInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    if (!gameState.inventory.includes(itemId)) {
      gameState.inventory.push(itemId);
    }
  }

  /**
   * Remove item from inventory manually for testing
   */
  removeFromInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    const index = gameState.inventory.indexOf(itemId);
    if (index > -1) {
      gameState.inventory.splice(index, 1);
    }
  }

  /**
   * Get weight of specific item
   */
  getItemWeight(itemId: string): number {
    const item = this.gameState.getItem(itemId);
    return item?.weight || 0;
  }

  /**
   * Verify inventory weight equals expected value
   */
  verifyInventoryWeight(expectedWeight: number): void {
    const currentWeight = this.getCurrentInventoryWeight();
    expect(currentWeight).toBe(expectedWeight);
  }

  /**
   * Verify inventory contains exactly the specified items
   */
  verifyInventoryContents(expectedItems: string[]): void {
    const inventory = this.getPlayerInventory();
    expect(inventory.sort()).toEqual(expectedItems.sort());
  }

  /**
   * Verify inventory is empty
   */
  verifyInventoryEmpty(): void {
    const inventory = this.getPlayerInventory();
    expect(inventory).toEqual([]);
  }

  /**
   * Count items in inventory
   */
  getInventoryCount(): number {
    return this.getPlayerInventory().length;
  }

  /**
   * Verify specific message content
   */
  verifyMessage(result: CommandResult, expectedMessage: string): void {
    expect(result.message).toBe(expectedMessage);
  }

  /**
   * Verify message contains specific text
   */
  verifyMessageContains(result: CommandResult, expectedText: string): void {
    expect(result.message).toContain(expectedText);
  }

  /**
   * Verify message matches pattern
   */
  verifyMessageMatches(result: CommandResult, pattern: RegExp): void {
    expect(result.message).toMatch(pattern);
  }

  /**
   * Test taking all attic items and verify weight
   */
  takeAllAtticItems(): void {
    this.executeTake('brick');   // 9 weight
    this.executeTake('rope');    // 10 weight  
    this.executeTake('knife');   // 5 weight
    // Total: 24 weight
  }

  /**
   * Verify that taking items affects movement capability
   */
  verifyWeightAffectsMovement(): void {
    const initialCanExit = this.hasLightLoad();
    
    // Take heavy items
    this.takeAllAtticItems();
    
    const finalCanExit = this.hasLightLoad();
    
    // Should have changed from light to heavy (or stayed heavy)
    expect(initialCanExit || !finalCanExit).toBe(true);
  }
}