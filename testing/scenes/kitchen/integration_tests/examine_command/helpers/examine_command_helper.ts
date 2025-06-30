/**
 * Examine Command Test Helper for Kitchen Scene
 * Provides utilities for testing the Examine command in kitchen integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService } from '@/services/interfaces';

export class ExamineCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService
  ) {}

  /**
   * Execute an examine command and return the result
   */
  executeExamine(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "examine <target>" command
   */
  executeExamineTarget(target: string): CommandResult {
    return this.executeExamine(`examine ${target}`);
  }

  /**
   * Execute "look at <target>" command (alias for examine)
   */
  executeLookAt(target: string): CommandResult {
    return this.executeExamine(`look at ${target}`);
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
   * Verify the command doesn't count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify item description contains expected content
   */
  verifyItemDescription(result: CommandResult, expectedContent: string): void {
    this.verifySuccess(result);
    expect(result.message).toContain(expectedContent);
  }

  /**
   * Verify window examination based on state
   */
  verifyWindowExamine(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    expect(result.message).toContain('window');
    
    if (isOpen) {
      expect(result.message).toMatch(/open|opened/i);
    } else {
      expect(result.message).toMatch(/closed/i);
    }
  }

  /**
   * Verify sack examination based on state
   */
  verifySackExamine(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    expect(result.message).toContain('sack');
    
    if (isOpen) {
      expect(result.message).toMatch(/open|opened/i);
      // Should mention contents when open
      expect(result.message).toMatch(/sandwich|lunch|garlic/i);
    } else {
      expect(result.message).toMatch(/closed/i);
    }
  }

  /**
   * Verify bottle examination based on state
   */
  verifyBottleExamine(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    expect(result.message).toContain('bottle');
    
    if (isOpen) {
      expect(result.message).toMatch(/open|opened/i);
      // Should mention water when open
      expect(result.message).toMatch(/water/i);
    } else {
      expect(result.message).toMatch(/closed/i);
    }
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}`, 'i'));
  }

  /**
   * Verify examine shows detailed description
   */
  verifyDetailedDescription(result: CommandResult): void {
    this.verifySuccess(result);
    // Detailed descriptions should be longer than basic look descriptions
    expect(result.message.length).toBeGreaterThan(50);
  }

  /**
   * Get current moves count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Verify move count didn't change
   */
  verifyMoveCountUnchanged(initialCount: number): void {
    const currentCount = this.getCurrentMoves();
    expect(currentCount).toBe(initialCount);
  }
}