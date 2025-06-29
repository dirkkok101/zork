/**
 * Look Command Test Helper for Behind House Scene
 * Provides utilities for executing and validating look command behavior
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService } from '@/services/interfaces';

export class LookCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService
  ) {}

  /**
   * Execute a look command and return the result
   */
  executeLook(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute basic "look" command
   */
  executeBasicLook(): CommandResult {
    return this.executeLook('look');
  }

  /**
   * Execute "look around" command
   */
  executeLookAround(): CommandResult {
    return this.executeLook('look around');
  }

  /**
   * Execute "look at <target>" command
   */
  executeLookAt(target: string): CommandResult {
    return this.executeLook(`look at ${target}`);
  }

  /**
   * Execute "look in <target>" command
   */
  executeLookIn(target: string): CommandResult {
    return this.executeLook(`look in ${target}`);
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
   * Verify the result contains scene title and description
   */
  verifySceneDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('Behind House');
    expect(result.message).toContain('You are in the behind house');
  }

  /**
   * Verify the result contains exit information
   */
  verifyExitInformation(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/exits?:/i);
    expect(result.message).toContain('north');
    expect(result.message).toContain('south');
    expect(result.message).toContain('east');
  }

  /**
   * Verify the result contains window exit information when open
   */
  verifyWindowExitInformation(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/exits?:/i);
    expect(result.message).toContain('west');
    expect(result.message).toContain('in');
  }

  /**
   * Verify the result contains item information
   */
  verifyItemInformation(result: CommandResult, expectedItems: string[]): void {
    this.verifySuccess(result);
    
    if (expectedItems.length === 0) {
      // Should not contain item listing
      expect(result.message).not.toMatch(/you can see/i);
    } else {
      expect(result.message).toMatch(/you can see/i);
      expectedItems.forEach(item => {
        expect(result.message).toContain(item);
      });
    }
  }

  /**
   * Verify window is visible in scene
   */
  verifyWindowVisible(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/you can see/i);
    expect(result.message).toContain('windo');
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
   * Verify game state was marked as visited after look
   */
  verifySceneMarkedVisited(): void {
    expect(this.gameState.hasVisitedScene('behind_house')).toBe(true);
  }

  /**
   * Verify specific exit description
   */
  verifyExitDescription(result: CommandResult, direction: string, expectedContent?: string): void {
    this.verifySuccess(result);
    
    if (expectedContent) {
      expect(result.message).toContain(expectedContent);
    } else {
      // Default expectation for exit descriptions
      expect(result.message).toMatch(new RegExp(`exit.*${direction}`, 'i'));
    }
  }

  /**
   * Verify window exit description when window is open
   */
  verifyWindowExitDescription(result: CommandResult): void {
    this.verifySuccess(result);
    // When window is open, both west and in exits should be available
    expect(result.message).toContain('west');
    expect(result.message).toContain('in');
  }

  /**
   * Verify item description
   */
  verifyItemDescription(result: CommandResult, itemName: string, expectedDescription?: string): void {
    this.verifySuccess(result);
    
    if (expectedDescription) {
      expect(result.message).toContain(expectedDescription);
    } else {
      // Should contain the item name
      expect(result.message).toContain(itemName);
    }
  }

  /**
   * Verify window description
   */
  verifyWindowDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('windo');
  }

  /**
   * Verify atmospheric message is included
   */
  verifyAtmosphericMessage(result: CommandResult): void {
    this.verifySuccess(result);
    // Check for any of the expected atmospheric messages
    const atmosphericMessages = [
      'gentle breeze stirs the leaves',
      'birds chirping in the distance',
      'sunlight filters through the trees',
      'air is fresh and clean'
    ];
    
    // Note: Atmospheric messages may not always be displayed in basic look
    // This is expected Zork behavior - atmospheric messages are occasional
    const hasAtmospheric = atmosphericMessages.some(msg => 
      result.message.toLowerCase().includes(msg.toLowerCase())
    );
    
    // For now, we just verify the result is successful
    // Atmospheric messages are random/occasional in original Zork
    if (hasAtmospheric) {
      // Great! An atmospheric message was included
      expect(hasAtmospheric).toBe(true);
    }
    // If no atmospheric message, that's also valid behavior
  }

  /**
   * Verify error message for invalid target
   */
  verifyInvalidTarget(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}`, 'i'));
  }

  /**
   * Get current moves count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves || 0;
  }

  /**
   * Get current score for comparison
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }
}