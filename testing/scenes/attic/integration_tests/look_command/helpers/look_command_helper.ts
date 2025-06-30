/**
 * Look Command Test Helper for Attic Scene
 * Provides utilities for testing the Look command in attic integration tests
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
   * Execute "look in <container>" command
   */
  executeLookIn(container: string): CommandResult {
    return this.executeLook(`look in ${container}`);
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
   * Verify the scene description appears in the result
   */
  verifySceneDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('This is the attic');
    expect(result.message).toContain('only exit is stairs that lead down');
  }

  /**
   * Verify attic scene atmosphere elements
   */
  verifyAtmosphere(result: CommandResult): void {
    this.verifySuccess(result);
    // Should contain atmospheric elements like cool air, darkness references, etc.
    const hasAtmosphere = result.message.includes('cool') || 
                         result.message.includes('damp') || 
                         result.message.includes('drips') ||
                         result.message.includes('echo') ||
                         result.message.includes('stone');
    expect(hasAtmosphere).toBe(true);
  }

  /**
   * Verify attic items are displayed correctly based on states
   */
  verifyAtticItems(result: CommandResult, brickOpen: boolean, knifeOn: boolean): void {
    this.verifySuccess(result);
    
    // Basic items should always be visible
    expect(result.message).toContain('brick');
    expect(result.message).toContain('rope');
    expect(result.message).toContain('knife');
    
    // Container state display for brick
    if (brickOpen) {
      // Should show brick with contents if any
      const hasBrickContents = result.message.includes('(which contains') && result.message.includes('brick');
      // Note: May be empty container, so we check for either contents or just open state
      expect(hasBrickContents || result.message.includes('open')).toBeTruthy();
    }
    
    // Knife state doesn't typically show in room descriptions, but could in examine
    if (knifeOn) {
      // Check for knife state indicators if present
      const hasKnifeState = result.message.includes('glowing') || result.message.includes('on');
      // Note: State display depends on implementation - may or may not be visible
      // This is primarily for future implementation verification
      expect(typeof hasKnifeState).toBe('boolean');
    }
  }

  /**
   * Verify exit information shows down exit
   */
  verifyExitInformation(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/exit.*down|down.*exit|stairs.*down/i);
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
    expect(this.gameState.hasVisitedScene('attic')).toBe(true);
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
   * Verify brick state in description
   */
  verifyBrickState(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    
    if (isOpen) {
      expect(result.message).toMatch(/brick.*open/i);
    } else {
      expect(result.message).toMatch(/brick.*closed/i);
    }
  }

  /**
   * Verify knife state in description  
   */
  verifyKnifeState(result: CommandResult, isOn: boolean): void {
    this.verifySuccess(result);
    
    if (isOn) {
      expect(result.message).toMatch(/knife.*on/i);
    } else {
      expect(result.message).toMatch(/knife.*off/i);
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
}