/**
 * Look Command Test Helper for Kitchen Scene
 * Provides utilities for executing and validating look command behavior in the kitchen
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService } from '@/services/interfaces';

export class LookCommandHelper {
  private gameState: IGameStateService;
  
  constructor(
    private commandProcessor: CommandProcessor,
    gameState: IGameStateService
  ) {
    this.gameState = gameState;
  }

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
   * Verify the result contains kitchen scene title and description
   */
  verifySceneDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('Kitchen');
    expect(result.message).toContain('You are in the kitchen');
  }

  /**
   * Verify the result contains exit information
   */
  verifyExitInformation(result: CommandResult, includeEast = false): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/exits?:/i);
    expect(result.message).toContain('west');
    expect(result.message).toContain('up');
    
    // East/out exit depends on window state
    if (includeEast) {
      expect(result.message).toMatch(/east|out/);
    } else {
      expect(result.message).not.toMatch(/east|out/);
    }
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
   * Verify kitchen-specific items are displayed
   */
  verifyKitchenItems(result: CommandResult, sackOpen = false, bottleOpen = false): void {
    this.verifySuccess(result);
    
    // Always visible items
    expect(result.message).toContain('window');
    expect(result.message).toContain('sack');
    expect(result.message).toContain('bottle');
    
    // Container contents based on state
    if (sackOpen) {
      expect(result.message.includes('sandwich') || result.message.includes('lunch')).toBe(true);
      expect(result.message).toContain('clove of garlic');
    }
    
    if (bottleOpen) {
      expect(result.message).toContain('water');
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
   * Verify game state was marked as visited after look
   */
  verifySceneMarkedVisited(): void {
    expect(this.gameState.hasVisitedScene('kitchen')).toBe(true);
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
   * Verify container contents description
   */
  verifyContainerContents(result: CommandResult, containerName: string, expectedContents: string[]): void {
    this.verifySuccess(result);
    
    if (expectedContents.length === 0) {
      expect(result.message).toMatch(new RegExp(`${containerName}.*empty`, 'i'));
    } else {
      expect(result.message).toMatch(new RegExp(`${containerName}.*contains`, 'i'));
      expectedContents.forEach(item => {
        expect(result.message).toContain(item);
      });
    }
  }

  /**
   * Verify window state in description
   */
  verifyWindowState(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    
    if (isOpen) {
      expect(result.message).toMatch(/window.*open/i);
    } else {
      expect(result.message).toMatch(/window.*closed/i);
    }
  }

  /**
   * Verify error message for invalid target
   */
  verifyInvalidTarget(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}`, 'i'));
  }

  /**
   * Verify error message for closed container
   */
  verifyClosedContainer(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*closed`, 'i'));
  }

  /**
   * Verify error message for locked container
   */
  verifyLockedContainer(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*locked`, 'i'));
  }

  /**
   * Verify error message for non-container
   */
  verifyNonContainer(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't look inside.*${itemName}`, 'i'));
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
   * Verify no window exit description in result
   */
  verifyNoWindowExitDescription(result: CommandResult): void {
    this.verifySuccess(result);
    // Should not show east or out exits when window is closed
    expect(result.message).not.toMatch(/east|out/i);
  }

  /**
   * Verify window exit description is present
   */
  verifyWindowExitDescription(result: CommandResult): void {
    this.verifySuccess(result);
    // Should show east or out exits when window is open
    expect(result.message).toMatch(/east|out/i);
  }
}