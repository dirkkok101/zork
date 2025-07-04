/**
 * Put Command Test Helper
 * Provides utilities for testing the Put command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IInventoryService, IItemService, ISceneService, IScoringService } from '@/services/interfaces';
import { ScoringValidationHelper } from '@testing/utils/scoring_validation_helper';

export class PutCommandHelper {
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
   * Execute a put command and return the result
   */
  executePut(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "put <item> in <container>" command
   */
  executePutInContainer(item: string, container: string): CommandResult {
    return this.executePut(`put ${item} in ${container}`);
  }

  /**
   * Execute "put <item> on <object>" command
   */
  executePutOn(item: string, target: string): CommandResult {
    return this.executePut(`put ${item} on ${target}`);
  }

  /**
   * Execute "put <item> under <object>" command
   */
  executePutUnder(item: string, target: string): CommandResult {
    return this.executePut(`put ${item} under ${target}`);
  }

  /**
   * Execute "put down <item>" command
   */
  executePutDown(item: string): CommandResult {
    return this.executePut(`put down ${item}`);
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
   * Execute a close command (for test setup)
   */
  executeClose(input: string): CommandResult {
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
   * Verify successful put message
   */
  verifyPutSuccess(result: CommandResult, itemName: string, targetName?: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`put.*${itemName}`, 'i'));
    if (targetName) {
      expect(result.message).toMatch(new RegExp(targetName, 'i'));
    }
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
   * Verify item was moved from inventory to container
   */
  verifyItemMovedToContainer(itemId: string, containerId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInContainer(itemId, containerId)).toBe(true);
    expect(this.isInScene(itemId)).toBe(false);
  }

  /**
   * Verify item was moved from inventory to scene
   */
  verifyItemMovedToScene(itemId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInScene(itemId)).toBe(true);
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

  // === Scoring Validation Methods ===

  /**
   * Get current player score
   */
  getCurrentScore(): number {
    return this.scoringHelper?.getCurrentScore() || 0;
  }

  /**
   * Check if target is trophy case or treasury
   */
  isTrophyCase(targetId: string): boolean {
    return targetId === 'case' || targetId === 'trophy_case';
  }

  /**
   * Verify treasure deposit scoring for trophy case
   */
  verifyTreasureDepositScoring(result: CommandResult, itemId: string, targetId: string): void {
    if (this.scoringHelper) {
      const isTrophyCase = this.isTrophyCase(targetId);
      this.scoringHelper.verifyTreasureDeposit(result, itemId, isTrophyCase);
    }
  }

  /**
   * Verify no scoring impact for non-treasures or non-trophy case
   */
  verifyNonScoringPut(result: CommandResult, itemId: string, targetId: string): void {
    if (this.scoringHelper) {
      const isTreasure = this.scoringHelper.isTreasure(itemId);
      const isTrophyCase = this.isTrophyCase(targetId);
      
      if (!isTreasure || !isTrophyCase) {
        this.scoringHelper.verifyNoScoreChange(result);
      }
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
   * Check if an item is a treasure
   */
  isTreasure(itemId: string): boolean {
    return this.scoringHelper?.isTreasure(itemId) || false;
  }

  /**
   * Get treasure deposit bonus value
   */
  getTreasureDepositScore(treasureId: string): number {
    return this.scoringHelper?.getTreasureDepositScore(treasureId) || 0;
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
   * Verify successful put in trophy case with scoring validation
   */
  verifyPutInTrophyCaseWithScoring(result: CommandResult, itemName: string, itemId: string, targetName: string, targetId: string): void {
    this.verifyPutSuccess(result, itemName, targetName);
    
    if (this.scoringHelper && this.isTreasure(itemId) && this.isTrophyCase(targetId)) {
      const expectedScore = this.getTreasureDepositScore(itemId);
      if (expectedScore > 0) {
        this.verifyScoreChange(result, expectedScore);
      }
    } else {
      this.verifyNoScoreChange(result);
    }
  }

  /**
   * Verify successful put with comprehensive scoring validation
   */
  verifyPutSuccessWithScoring(result: CommandResult, itemName: string, itemId: string, targetName: string, targetId: string): void {
    this.verifyPutSuccess(result, itemName, targetName);
    this.verifyTreasureDepositScoring(result, itemId, targetId);
  }

}