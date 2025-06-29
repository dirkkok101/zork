/**
 * Close Command Test Helper for Behind House Scene
 * Provides utilities for executing and validating close command behavior on window
 */

import { CommandResult } from '@/types/CommandTypes';
import { GameStateService } from '@/services/GameStateService';
import { ItemService } from '@/services/ItemService';
import { CommandProcessor } from '@/services/CommandProcessor';

export class CloseCommandHelper {
  
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: GameStateService,
    private items: ItemService
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
   * Execute "close window" command
   */
  executeCloseWindow(): CommandResult {
    return this.executeCloseTarget('windo');
  }

  /**
   * Execute "close window" with alias
   */
  executeCloseWindowAlias(alias: string): CommandResult {
    return this.executeCloseTarget(alias);
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
   * Verify window flag was set to closed
   */
  verifyWindowClosed(): void {
    const isOpen = this.gameState.getFlag('door_windo_open');
    expect(isOpen).toBe(false);
  }

  /**
   * Verify window flag is set to open
   */
  verifyWindowOpen(): void {
    const isOpen = this.gameState.getFlag('door_windo_open');
    expect(isOpen).toBe(true);
  }

  /**
   * Check current window state
   */
  isWindowOpen(): boolean {
    return this.gameState.getFlag('door_windo_open') === true;
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
   * Verify successful window close message
   */
  verifyWindowCloseMessage(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message.toLowerCase()).toMatch(/close.*window|close.*windo/);
  }

  /**
   * Verify already closed message
   */
  verifyAlreadyClosed(result: CommandResult): void {
    this.verifyFailure(result);
    expect(result.message.toLowerCase()).toMatch(/already.*closed|windo.*closed/);
  }

  /**
   * Verify cannot close message for non-closable items
   */
  verifyCannotClose(result: CommandResult, inputAlias: string, expectedResolvedName?: string): void {
    this.verifyFailure(result);
    // Error messages should use resolved name, not the alias the user typed
    const nameToCheck = expectedResolvedName || inputAlias;
    expect(result.message).toMatch(new RegExp(`can't close.*${nameToCheck}`, 'i'));
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, inputAlias: string, expectedResolvedName?: string): void {
    this.verifyFailure(result);
    // Error messages should use resolved name, not the alias the user typed
    const nameToCheck = expectedResolvedName || inputAlias;
    expect(result.message).toMatch(new RegExp(`don't see.*${nameToCheck}`, 'i'));
  }

  /**
   * Verify window state changed from open to closed
   */
  verifyWindowStateChange(initialState: boolean, expectedFinalState: boolean): void {
    const finalState = this.isWindowOpen();
    expect(initialState).not.toBe(expectedFinalState);
    expect(finalState).toBe(expectedFinalState);
  }

  /**
   * Test closing window from open state
   */
  testWindowCloseFromOpen(): CommandResult {
    // Ensure window starts open
    this.gameState.setFlag('door_windo_open', true);
    expect(this.isWindowOpen()).toBe(true);
    
    // Execute close command
    const result = this.executeCloseWindow();
    
    // Verify window is now closed
    this.verifyWindowClosed();
    
    return result;
  }

  /**
   * Test closing window when already closed
   */
  testWindowCloseWhenAlreadyClosed(): CommandResult {
    // Ensure window starts closed
    this.gameState.setFlag('door_windo_open', false);
    expect(this.isWindowOpen()).toBe(false);
    
    // Execute close command
    const result = this.executeCloseWindow();
    
    // Verify window remains closed
    this.verifyWindowClosed();
    
    return result;
  }

  /**
   * Verify command variations work for window
   */
  verifyWindowCommandVariations(): void {
    const variations = ['windo', 'window'];
    
    variations.forEach(variation => {
      // Reset to open state
      this.gameState.setFlag('door_windo_open', true);
      
      const result = this.executeCloseTarget(variation);
      this.verifySuccess(result);
      this.verifyWindowClosed();
    });
  }

  /**
   * Get current move count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Verify move counter incremented
   */
  verifyMoveCounterIncremented(initialMoves: number): void {
    const currentMoves = this.getCurrentMoves();
    expect(currentMoves).toBe(initialMoves + 1);
  }

  /**
   * Verify move counter unchanged
   */
  verifyMoveCounterUnchanged(initialMoves: number): void {
    const currentMoves = this.getCurrentMoves();
    expect(currentMoves).toBe(initialMoves);
  }

  /**
   * Verify no score change occurred
   */
  verifyNoScoreChange(initialScore: number): void {
    const currentScore = this.gameState.getScore();
    expect(currentScore).toBe(initialScore);
  }

  /**
   * Check if item can be closed
   */
  canClose(itemId: string): boolean {
    return this.items.canOpen(itemId); // Use canOpen since closeable items are usually openable
  }

  /**
   * Check if item is locked
   */
  isLocked(itemId: string): boolean {
    return this.items.isLocked(itemId);
  }
}