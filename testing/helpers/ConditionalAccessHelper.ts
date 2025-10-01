/**
 * Conditional Access Helper
 * Provides utilities for testing flag-based exits and conditional access
 */

import { CommandResult } from '@/types/CommandTypes';

export class ConditionalAccessHelper {
  constructor(
    private commandProcessor: any,
    private gameState: any,
    private scene: any
  ) {}

  /**
   * Execute a command and return the result
   */
  executeCommand(command: string): CommandResult {
    return this.commandProcessor.processCommand(command);
  }

  /**
   * Validate that a flag has the expected value
   */
  validateFlagState(flagName: string, expectedValue: boolean): void {
    const actualValue = this.gameState.getFlag(flagName);
    expect(actualValue).toBe(expectedValue);
  }

  /**
   * Validate that a flag persists across multiple commands
   */
  validateFlagPersistence(flagName: string, expectedValue: boolean, commands: string[]): void {
    // Execute multiple commands
    commands.forEach(cmd => this.executeCommand(cmd));

    // Flag should still have expected value
    this.validateFlagState(flagName, expectedValue);
  }

  /**
   * Test conditional movement - validate exit is blocked when condition is false
   */
  validateBlockedExit(direction: string, expectedErrorPattern: RegExp | string): CommandResult {
    const result = this.executeCommand(direction);

    expect(result.success).toBe(false);

    if (typeof expectedErrorPattern === 'string') {
      expect(result.message).toContain(expectedErrorPattern);
    } else {
      expect(result.message).toMatch(expectedErrorPattern);
    }

    return result;
  }

  /**
   * Test conditional movement - validate exit is allowed when condition is true
   */
  validateAllowedExit(direction: string, expectedDestination: string): CommandResult {
    const result = this.executeCommand(direction);

    expect(result.success).toBe(true);
    expect(this.getCurrentScene()).toBe(expectedDestination);

    return result;
  }

  /**
   * Test that an exit is blocked and player remains in current scene
   */
  validateNoMovement(direction: string, currentScene: string): void {
    const result = this.executeCommand(direction);

    expect(result.success).toBe(false);
    expect(this.getCurrentScene()).toBe(currentScene);
  }

  /**
   * Validate that multiple blocked attempts don't change flag state
   */
  validateFlagStabilityDuringFailedAttempts(
    flagName: string,
    expectedValue: boolean,
    attempts: string[]
  ): void {
    // Execute multiple failed attempts
    attempts.forEach(cmd => this.executeCommand(cmd));

    // Flag should remain unchanged
    this.validateFlagState(flagName, expectedValue);
  }

  /**
   * Validate cross-scene flag consistency
   */
  validateCrossSceneFlagConsistency(
    flagName: string,
    expectedValue: boolean,
    sceneTransitions: string[]
  ): void {
    // Move through multiple scenes
    sceneTransitions.forEach(direction => {
      const result = this.executeCommand(direction);
      if (result.success) {
        // After each successful transition, flag should maintain value
        this.validateFlagState(flagName, expectedValue);
      }
    });
  }

  /**
   * Validate that a flag change is reflected in subsequent commands
   */
  validateFlagChangeReflection(
    flagName: string,
    initialValue: boolean,
    changeCommand: string,
    newValue: boolean,
    verificationCommands: string[]
  ): void {
    // Validate initial state
    this.validateFlagState(flagName, initialValue);

    // Execute change command
    this.executeCommand(changeCommand);

    // Validate new state
    this.validateFlagState(flagName, newValue);

    // Execute verification commands and check flag persists
    this.validateFlagPersistence(flagName, newValue, verificationCommands);
  }

  /**
   * Validate exit availability based on conditions
   */
  validateExitAvailability(expectedDirections: string[]): void {
    const exits = this.getAvailableExits();
    const directions = exits.map((exit: any) => exit.direction);

    expectedDirections.forEach(direction => {
      expect(directions).toContain(direction);
    });
  }

  /**
   * Validate that conditional exits are not in available exits list when blocked
   */
  validateExitNotAvailable(direction: string): void {
    const exits = this.getAvailableExits();
    const directions = exits.map((exit: any) => exit.direction);

    expect(directions).not.toContain(direction);
  }

  /**
   * Test complete open/close/move cycle
   */
  validateFlagCycle(
    flagName: string,
    openCommand: string,
    closeCommand: string,
    conditionalDirection: string,
    expectedDestination: string,
    expectedError: string
  ): void {
    // Close and verify blocked
    this.executeCommand(closeCommand);
    this.validateFlagState(flagName, false);
    this.validateBlockedExit(conditionalDirection, expectedError);

    // Open and verify allowed
    this.executeCommand(openCommand);
    this.validateFlagState(flagName, true);
    const currentScene = this.getCurrentScene();
    this.validateAllowedExit(conditionalDirection, expectedDestination);

    // Return to original scene
    this.setCurrentScene(currentScene);

    // Close and verify blocked again
    this.executeCommand(closeCommand);
    this.validateFlagState(flagName, false);
    this.validateBlockedExit(conditionalDirection, expectedError);
  }

  /**
   * Validate error message consistency across multiple attempts
   */
  validateConsistentErrorMessages(direction: string, attempts: number): void {
    const results: CommandResult[] = [];

    for (let i = 0; i < attempts; i++) {
      results.push(this.executeCommand(direction));
    }

    // All results should have same error message
    const firstMessage = results[0]?.message;
    results.forEach(result => {
      expect(result.message).toBe(firstMessage);
      expect(result.success).toBe(false);
    });
  }

  /**
   * Validate that manual flag manipulation affects conditional access
   */
  validateManualFlagManipulation(
    flagName: string,
    value: boolean,
    direction: string,
    expectedDestination?: string,
    expectedError?: string
  ): void {
    // Manually set flag
    this.gameState.setFlag(flagName, value);

    if (value && expectedDestination) {
      // Should allow movement
      this.validateAllowedExit(direction, expectedDestination);
    } else if (!value && expectedError) {
      // Should block movement
      this.validateBlockedExit(direction, expectedError);
    }
  }

  /**
   * Validate that undefined flag state is handled gracefully
   */
  validateUndefinedFlagHandling(flagName: string, direction: string): void {
    // Clear flag
    this.gameState.setFlag(flagName, undefined);

    // Should fail gracefully
    const result = this.executeCommand(direction);
    expect(result.success).toBe(false);
  }

  /**
   * Get current scene
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Set current scene
   */
  setCurrentScene(sceneId: string): void {
    this.gameState.setCurrentScene(sceneId);
  }

  /**
   * Get available exits
   */
  getAvailableExits(): any[] {
    const currentScene = this.getCurrentScene();
    return this.scene.getAvailableExits(currentScene) || [];
  }

  /**
   * Verify success
   */
  verifySuccess(result: CommandResult): void {
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  }

  /**
   * Verify failure
   */
  verifyFailure(result: CommandResult): void {
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  }

  /**
   * Verify message contains expected text
   */
  verifyMessageContains(result: CommandResult, expectedText: string): void {
    expect(result.message).toContain(expectedText);
  }

  /**
   * Verify no movement occurred
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBeFalsy();
  }
}
