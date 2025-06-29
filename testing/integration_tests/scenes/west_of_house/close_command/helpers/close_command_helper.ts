/**
 * Close Command Test Helper
 * Provides utilities for testing the Close command in integration tests
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
    const isOpen = item?.state?.open || false;
    expect(isOpen).toBe(false);
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
}