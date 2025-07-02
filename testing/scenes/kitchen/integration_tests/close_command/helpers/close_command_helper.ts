/**
 * Close Command Test Helper for Kitchen Scene
 * Provides utilities for testing the Close command in kitchen integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService } from '@/services/interfaces';

export class CloseCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService
  ) {}

  /**
   * Execute a close command and return the result
   */
  executeClose(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "close <target>" command
   */
  executeCloseTarget(target: string): CommandResult {
    return this.executeClose(`close ${target}`);
  }

  /**
   * Execute an open command (for setup in tests)
   */
  executeOpen(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
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
   * Verify close success message
   */
  verifyCloseMessage(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`close.*${itemName}`, 'i'));
  }

  /**
   * Verify that the command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify that the command does not count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify that an item is actually closed in the game state
   */
  verifyItemClosed(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen || item?.state?.open || false;
    expect(isOpen).toBe(false);
  }

  /**
   * Verify that an item is actually open in the game state
   */
  verifyItemOpen(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen || item?.state?.open || false;
    expect(isOpen).toBe(true);
  }

  /**
   * Verify window was closed and flag was unset
   */
  verifyWindowClosed(): void {
    const flagState = this.gameState.getFlag('door_windo_open');
    expect(flagState).toBe(false);
    this.verifyItemClosed('windo');
  }

  /**
   * Verify window is open and flag is set
   */
  verifyWindowOpen(): void {
    const flagState = this.gameState.getFlag('door_windo_open');
    expect(flagState).toBe(true);
    this.verifyItemOpen('windo');
  }

  /**
   * Verify sack was closed
   */
  verifySackClosed(): void {
    this.verifyItemClosed('sbag');
  }

  /**
   * Verify sack is open
   */
  verifySackOpen(): void {
    this.verifyItemOpen('sbag');
  }

  /**
   * Verify bottle was closed
   */
  verifyBottleClosed(): void {
    this.verifyItemClosed('bottl');
  }

  /**
   * Verify bottle is open
   */
  verifyBottleOpen(): void {
    this.verifyItemOpen('bottl');
  }

  /**
   * Verify kitchen-specific window closing success
   */
  verifyWindowCloseSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyWindowClosed();
    expect(result.message).toMatch(/close.*window|window.*close/i);
  }

  /**
   * Verify kitchen-specific sack closing success
   */
  verifySackCloseSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifySackClosed();
    expect(result.message).toMatch(/close.*sack/i);
  }

  /**
   * Verify kitchen-specific bottle closing success
   */
  verifyBottleCloseSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyBottleClosed();
    expect(result.message).toMatch(/close.*bottle/i);
  }

  /**
   * Verify already closed message
   */
  verifyAlreadyClosed(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${itemName}.*already closed`, 'i'));
  }

  /**
   * Verify cannot close message
   */
  verifyCannotClose(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't close.*${itemName}`, 'i'));
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Get current moves count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Verify move count increased by expected amount
   */
  verifyMoveCountIncreased(initialCount: number, expectedIncrease: number): void {
    const currentCount = this.getCurrentMoves();
    expect(currentCount).toBe(initialCount + expectedIncrease);
  }

  /**
   * Verify move count has not changed
   */
  verifyMoveCountUnchanged(initialCount: number): void {
    const currentCount = this.getCurrentMoves();
    expect(currentCount).toBe(initialCount);
  }

  /**
   * Execute close window command (specific method for tests)
   */
  executeCloseWindow(): CommandResult {
    return this.executeCloseTarget('window');
  }

  /**
   * Execute close sack command (specific method for tests)
   */
  executeCloseSack(): CommandResult {
    return this.executeCloseTarget('sack');
  }

  /**
   * Execute close bottle command (specific method for tests)
   */
  executeCloseBottle(): CommandResult {
    return this.executeCloseTarget('bottle');
  }
}