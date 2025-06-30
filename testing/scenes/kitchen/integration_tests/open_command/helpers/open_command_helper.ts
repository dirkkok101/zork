/**
 * Open Command Test Helper for Kitchen Scene
 * Provides utilities for executing and validating open command behavior in the kitchen
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IItemService } from '@/services/interfaces';

export class OpenCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private items: IItemService
  ) {}

  /**
   * Execute an open command and return the result
   */
  executeOpen(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "open <target>" command
   */
  executeOpenTarget(target: string): CommandResult {
    return this.executeOpen(`open ${target}`);
  }

  /**
   * Execute "open <target> with <key>" command
   */
  executeOpenWithKey(target: string, key: string): CommandResult {
    return this.executeOpen(`open ${target} with ${key}`);
  }

  /**
   * Verify command was successful
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify command failed with expected message
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
   * Verify item was opened
   */
  verifyItemOpened(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen || item?.state?.open || false;
    expect(isOpen).toBe(true);
  }

  /**
   * Verify item is closed
   */
  verifyItemClosed(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen || item?.state?.open || false;
    expect(isOpen).toBe(false);
  }

  /**
   * Verify window was opened and flag was set
   */
  verifyWindowOpened(): void {
    const flagState = this.gameState.getFlag('door_windo_open');
    expect(flagState).toBe(true);
    this.verifyItemOpened('windo');
  }

  /**
   * Verify window is closed and flag is not set
   */
  verifyWindowClosed(): void {
    const flagState = this.gameState.getFlag('door_windo_open');
    expect(flagState).toBe(false);
    this.verifyItemClosed('windo');
  }

  /**
   * Verify sack was opened
   */
  verifySackOpened(): void {
    this.verifyItemOpened('sbag');
  }

  /**
   * Verify sack is closed
   */
  verifySackClosed(): void {
    this.verifyItemClosed('sbag');
  }

  /**
   * Verify bottle was opened
   */
  verifyBottleOpened(): void {
    this.verifyItemOpened('bottl');
  }

  /**
   * Verify bottle is closed
   */
  verifyBottleClosed(): void {
    this.verifyItemClosed('bottl');
  }

  /**
   * Verify the command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify the command doesn't count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify successful open message
   */
  verifyOpenMessage(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`open.*${itemName}`, 'i'));
  }

  /**
   * Verify already open message
   */
  verifyAlreadyOpen(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${itemName}.*already.*open|already.*open.*${itemName}`, 'i'));
  }

  /**
   * Verify cannot open message
   */
  verifyCannotOpen(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't open.*${itemName}`, 'i'));
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify kitchen-specific window opening success
   */
  verifyWindowOpenSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyWindowOpened();
    expect(result.message).toMatch(/open.*window/i);
  }

  /**
   * Verify kitchen-specific sack opening success
   */
  verifySackOpenSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifySackOpened();
    expect(result.message).toMatch(/open.*sack/i);
  }

  /**
   * Verify kitchen-specific bottle opening success
   */
  verifyBottleOpenSuccess(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyBottleOpened();
    expect(result.message).toMatch(/open.*bottle/i);
  }

  /**
   * Check if item can be opened
   */
  canOpen(itemId: string): boolean {
    return this.items.canOpen(itemId);
  }

  /**
   * Check if item is locked
   */
  isLocked(itemId: string): boolean {
    return this.items.isLocked(itemId);
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
   * Execute open window command (specific method for tests)
   */
  executeOpenWindow(): CommandResult {
    return this.executeOpenTarget('window');
  }

  /**
   * Execute open sack command (specific method for tests)
   */
  executeOpenSack(): CommandResult {
    return this.executeOpenTarget('sack');
  }

  /**
   * Execute open bottle command (specific method for tests)
   */
  executeOpenBottle(): CommandResult {
    return this.executeOpenTarget('bottle');
  }
}