/**
 * Take Command Test Helper
 * Provides utilities for testing the Take command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IInventoryService, IItemService, ISceneService, IScoringService } from '@/services/interfaces';
import { ScoringValidationHelper } from '@testing/utils/scoring_validation_helper';

export class TakeCommandHelper {
  private scoringHelper?: ScoringValidationHelper;

  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private inventory: IInventoryService,
    private items: IItemService,
    private scene: ISceneService,
    private scoring?: IScoringService
  ) {
    if (this.scoring) {
      this.scoringHelper = new ScoringValidationHelper(this.gameState, this.scoring);
    }
  }

  /**
   * Execute a take command and return the result
   */
  executeTake(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "take <target>" command
   */
  executeTakeTarget(target: string): CommandResult {
    return this.executeTake(`take ${target}`);
  }

  /**
   * Execute an open command (for setup in tests)
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
   * Check if an item is accessible (in scene, inventory, or open containers)
   */
  isAccessible(itemId: string): boolean {
    // Check inventory
    if (this.isInInventory(itemId)) {
      return true;
    }

    // Check scene
    if (this.isInScene(itemId)) {
      return true;
    }

    // Check open containers in scene
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    
    for (const sceneItemId of sceneItems) {
      const container = this.gameState.getItem(sceneItemId);
      if (container && this.items.isContainer(sceneItemId)) {
        const isOpen = container.state?.open || false;
        if (isOpen && this.isInContainer(itemId, sceneItemId)) {
          return true;
        }
      }
    }

    return false;
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
   * Verify that the result contains specific text
   */
  verifyContainsText(result: CommandResult, expectedText: string): void {
    expect(result.message.toLowerCase()).toContain(expectedText.toLowerCase());
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
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify item cannot be taken message
   */
  verifyCannotTake(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't take.*${itemName}`, 'i'));
  }

  /**
   * Verify already have item message
   */
  verifyAlreadyHave(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`already have.*${itemName}`, 'i'));
  }

  /**
   * Verify successful take message
   */
  verifyTakeSuccess(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`take.*${itemName}`, 'i'));
    this.verifyCountsAsMove(result);
  }

  /**
   * Verify item was moved from scene to inventory
   */
  verifyItemMoved(itemId: string, shouldBeInInventory: boolean = true): void {
    if (shouldBeInInventory) {
      expect(this.isInInventory(itemId)).toBe(true);
      expect(this.isInScene(itemId)).toBe(false);
    } else {
      expect(this.isInInventory(itemId)).toBe(false);
      expect(this.isInScene(itemId)).toBe(true);
    }
  }

  /**
   * Verify inventory count changed by expected amount
   */
  verifyInventoryCountChange(initialCount: number, expectedChange: number): void {
    const currentCount = this.getInventoryCount();
    expect(currentCount).toBe(initialCount + expectedChange);
  }

  // === Scoring Validation Methods ===

  /**
   * Get current player score
   */
  getCurrentScore(): number {
    return this.scoringHelper?.getCurrentScore() || 0;
  }

  /**
   * Verify treasure scoring on take
   */
  verifyTreasureTakeScoring(result: CommandResult, itemId: string): void {
    if (this.scoringHelper) {
      this.scoringHelper.verifyTreasureDiscovery(result, itemId);
    }
  }

  /**
   * Verify no scoring impact for non-treasures
   */
  verifyNonTreasureTakeScoring(result: CommandResult, itemId: string): void {
    if (this.scoringHelper) {
      this.scoringHelper.verifyNonTreasureNoScoring(result, itemId);
    }
  }

  /**
   * Verify score change in result
   */
  verifyScoreChange(result: CommandResult, expectedPoints: number): void {
    if (this.scoringHelper) {
      this.scoringHelper.verifyScoreChange(result, expectedPoints);
    }
  }

  /**
   * Verify no score change in result
   */
  verifyNoScoreChange(result: CommandResult): void {
    if (this.scoringHelper) {
      this.scoringHelper.verifyNoScoreChange(result);
    }
  }

  /**
   * Verify score increased by expected amount
   */
  verifyScoreIncrease(initialScore: number, expectedIncrease: number): void {
    if (this.scoringHelper) {
      this.scoringHelper.verifyScoreIncrease(initialScore, expectedIncrease);
    }
  }

  /**
   * Check if an item is a treasure
   */
  isTreasure(itemId: string): boolean {
    return this.scoringHelper?.isTreasure(itemId) || false;
  }

  /**
   * Get treasure base score value
   */
  getTreasureScore(treasureId: string): number {
    return this.scoringHelper?.getTreasureScore(treasureId) || 0;
  }

  /**
   * Reset scoring state for clean tests
   */
  resetScoringState(): void {
    if (this.scoringHelper) {
      this.scoringHelper.resetScoringState();
    }
  }

  /**
   * Get scoring helper for advanced scoring tests
   */
  getScoringHelper(): ScoringValidationHelper | undefined {
    return this.scoringHelper;
  }

  /**
   * Verify successful take with scoring validation
   */
  verifyTakeSuccessWithScoring(result: CommandResult, itemName: string, itemId: string): void {
    this.verifyTakeSuccess(result, itemName);
    
    if (this.scoringHelper && this.isTreasure(itemId)) {
      const expectedScore = this.getTreasureScore(itemId);
      if (expectedScore > 0) {
        this.verifyScoreChange(result, expectedScore);
      }
    } else {
      this.verifyNoScoreChange(result);
    }
  }
}