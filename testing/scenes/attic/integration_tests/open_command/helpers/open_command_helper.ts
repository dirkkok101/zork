/**
 * Open Command Test Helper for Attic Scene
 * Provides utilities for testing the Open command in attic integration tests
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
  executeOpen(target: string): CommandResult {
    return this.commandProcessor.processCommand(`open ${target}`);
  }

  /**
   * Execute open command with custom format
   */
  executeOpenWith(command: string): CommandResult {
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
   * Verify the command doesn't count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify no score change occurred
   */
  verifyNoScoreChange(result: CommandResult): void {
    expect(result.scoreChange).toBeFalsy();
  }

  /**
   * Verify container was successfully opened
   */
  verifyContainerOpened(result: CommandResult, containerName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*open|open.*${containerName}|opened.*${containerName}`, 'i'));
  }

  /**
   * Verify container was already open
   */
  verifyAlreadyOpen(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*already.*open|already.*open.*${containerName}`, 'i'));
  }

  /**
   * Verify target is not a container
   */
  verifyNotContainer(result: CommandResult, targetName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't.*open.*${targetName}|${targetName}.*can't.*open|not.*container`, 'i'));
  }

  /**
   * Verify error message for missing target
   */
  verifyMissingTarget(result: CommandResult): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(/what.*open|open.*what/i);
  }

  /**
   * Verify error message for invalid target
   */
  verifyInvalidTarget(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}|can't find.*${target}`, 'i'));
  }

  /**
   * Verify container contents are revealed when opened
   */
  verifyContentsRevealed(result: CommandResult, expectedContents: string[]): void {
    this.verifySuccess(result);
    
    if (expectedContents.length > 0) {
      expect(result.message).toMatch(/contains|holding|inside|reveals?/i);
      expectedContents.forEach(item => {
        expect(result.message).toContain(item);
      });
    }
  }

  /**
   * Verify empty container message
   */
  verifyEmptyContainer(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/empty|nothing|vacant/i);
  }

  /**
   * Get current scene for verification
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
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
}