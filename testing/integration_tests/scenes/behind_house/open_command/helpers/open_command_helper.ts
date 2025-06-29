/**
 * Open Command Test Helper for Behind House Scene
 * Provides utilities for executing and validating open command behavior on window
 */

import { CommandResult } from '@/types/CommandTypes';
import { GameStateService } from '@/services/GameStateService';
import { ItemService } from '@/services/ItemService';
import { CommandProcessor } from '@/services/CommandProcessor';

export class OpenCommandHelper {
  
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: GameStateService,
    private items: ItemService
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
   * Execute "open window" command
   */
  executeOpenWindow(): CommandResult {
    return this.executeOpenTarget('windo');
  }

  /**
   * Execute "open window" with alias
   */
  executeOpenWindowAlias(alias: string): CommandResult {
    return this.executeOpenTarget(alias);
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
   * Verify window flag was set to open
   */
  verifyWindowOpened(): void {
    const isOpen = this.gameState.getFlag('door_windo_open');
    expect(isOpen).toBe(true);
  }

  /**
   * Verify window flag is set to closed
   */
  verifyWindowClosed(): void {
    const isOpen = this.gameState.getFlag('door_windo_open');
    expect(isOpen).toBe(false);
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
   * Verify successful window open message
   */
  verifyWindowOpenMessage(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message.toLowerCase()).toMatch(/open.*window|open.*windo/);
  }

  /**
   * Verify already open message
   */
  verifyAlreadyOpen(result: CommandResult): void {
    this.verifyFailure(result);
    expect(result.message.toLowerCase()).toMatch(/already.*open|windo.*open/);
  }

  /**
   * Verify cannot open message for non-openable items
   */
  verifyCannotOpen(result: CommandResult, inputAlias: string, expectedResolvedName?: string): void {
    this.verifyFailure(result);
    // Error messages should use resolved name, not the alias the user typed
    const nameToCheck = expectedResolvedName || inputAlias;
    expect(result.message).toMatch(new RegExp(`can't open.*${nameToCheck}`, 'i'));
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
   * Verify window state changed from closed to open
   */
  verifyWindowStateChange(initialState: boolean, expectedFinalState: boolean): void {
    const finalState = this.isWindowOpen();
    expect(initialState).not.toBe(expectedFinalState);
    expect(finalState).toBe(expectedFinalState);
  }

  /**
   * Test opening window from closed state
   */
  testWindowOpenFromClosed(): CommandResult {
    // Ensure window starts closed
    this.gameState.setFlag('door_windo_open', false);
    expect(this.isWindowOpen()).toBe(false);
    
    // Execute open command
    const result = this.executeOpenWindow();
    
    // Verify window is now open
    this.verifyWindowOpened();
    
    return result;
  }

  /**
   * Test opening window when already open
   */
  testWindowOpenWhenAlreadyOpen(): CommandResult {
    // Ensure window starts open
    this.gameState.setFlag('door_windo_open', true);
    expect(this.isWindowOpen()).toBe(true);
    
    // Execute open command
    const result = this.executeOpenWindow();
    
    // Verify window remains open
    this.verifyWindowOpened();
    
    return result;
  }

  /**
   * Verify command variations work for window
   */
  verifyWindowCommandVariations(): void {
    const variations = ['windo', 'window'];
    
    variations.forEach(variation => {
      // Reset to closed state
      this.gameState.setFlag('door_windo_open', false);
      
      const result = this.executeOpenTarget(variation);
      this.verifySuccess(result);
      this.verifyWindowOpened();
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
}