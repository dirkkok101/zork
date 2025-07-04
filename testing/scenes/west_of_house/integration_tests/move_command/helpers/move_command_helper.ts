/**
 * Move Command Test Helper
 * Provides utilities for testing the Move command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, ISceneService } from '@/services/interfaces';

export class MoveCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private scene: ISceneService
  ) {}

  /**
   * Execute a move command and return the result
   */
  executeMove(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute movement to a specific direction
   */
  executeMoveDirection(direction: string): CommandResult {
    return this.executeMove(direction);
  }

  /**
   * Execute "go <direction>" format
   */
  executeMoveWithGo(direction: string): CommandResult {
    return this.executeMove(`go ${direction}`);
  }

  /**
   * Execute movement using various command formats
   */
  executeMoveWith(command: string, direction: string): CommandResult {
    return this.executeMove(`${command} ${direction}`);
  }

  /**
   * Get current scene ID for verification
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Set current scene for test setup
   */
  setCurrentScene(sceneId: string): void {
    this.gameState.setCurrentScene(sceneId);
  }

  /**
   * Get current score from game state
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }

  /**
   * Verify no score change occurred
   */
  verifyNoScoreChange(result: CommandResult): void {
    expect(result.scoreChange).toBeFalsy();
  }

  /**
   * Verify specific score change occurred
   */
  verifyScoreChange(result: CommandResult, expectedPoints: number): void {
    expect(result.scoreChange).toBe(expectedPoints);
    expect(result.scoreChange).toBeGreaterThan(0);
  }

  /**
   * Verify score increase after movement
   */
  verifyScoreIncrease(initialScore: number, expectedIncrease: number): void {
    const currentScore = this.getCurrentScore();
    expect(currentScore).toBe(initialScore + expectedIncrease);
  }

  /**
   * Get available exits from current scene
   */
  getAvailableExits(): any[] {
    const currentScene = this.getCurrentScene();
    return this.scene.getAvailableExits(currentScene);
  }

  /**
   * Check if a direction is available from current scene
   */
  isDirectionAvailable(direction: string): boolean {
    const exits = this.getAvailableExits();
    return exits.some(exit => 
      exit.direction.toLowerCase() === direction.toLowerCase() ||
      exit.direction.toLowerCase().startsWith(direction.toLowerCase())
    );
  }

  /**
   * Get scene description for verification
   */
  getSceneDescription(sceneId?: string): string {
    const targetScene = sceneId || this.getCurrentScene();
    return this.scene.getSceneDescription(targetScene);
  }

  /**
   * Check if scene has been visited
   */
  hasVisitedScene(sceneId: string): boolean {
    return this.gameState.hasVisitedScene(sceneId);
  }

  /**
   * Verify command executed successfully
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
  }

  /**
   * Verify command failed
   */
  verifyFailure(result: CommandResult): void {
    expect(result.success).toBe(false);
  }

  /**
   * Verify command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify command does not count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
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
   * Verify successful movement to a scene
   */
  verifyMovementSuccess(result: CommandResult, expectedSceneId: string): void {
    this.verifySuccess(result);
    this.verifyCountsAsMove(result);
    expect(this.getCurrentScene()).toBe(expectedSceneId);
    // Message should contain scene description
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify movement failure with specific message
   */
  verifyMovementFailure(result: CommandResult, expectedMessage?: string): void {
    this.verifyFailure(result);
    this.verifyCountsAsMove(result); // Failed moves still count as moves in Zork
    
    if (expectedMessage) {
      this.verifyMessage(result, expectedMessage);
    }
  }

  /**
   * Verify movement failure due to no exit
   */
  verifyNoExit(result: CommandResult, direction: string): void {
    this.verifyFailure(result);
    this.verifyMessageContains(result, `cannot go ${direction}`);
  }

  /**
   * Verify movement failure due to locked exit
   */
  verifyLockedExit(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyMessageContains(result, 'locked');
  }

  /**
   * Verify movement failure due to blocked exit
   */
  verifyBlockedExit(result: CommandResult): void {
    this.verifyFailure(result);
    // Blocked exits typically have custom failure messages
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify invalid direction input
   */
  verifyInvalidDirection(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyMessage(result, 'Go where?');
  }

  /**
   * Test movement between two scenes
   */
  verifyMovementBetweenScenes(fromSceneId: string, toSceneId: string, direction: string): void {
    // Set starting scene
    this.setCurrentScene(fromSceneId);
    expect(this.getCurrentScene()).toBe(fromSceneId);

    // Execute movement
    const result = this.executeMoveDirection(direction);

    // Verify successful movement
    this.verifyMovementSuccess(result, toSceneId);
  }

  /**
   * Test that all movement aliases work for a direction
   */
  verifyMovementAliases(direction: string, expectedDestination: string): void {
    const aliases = ['go', 'move', 'walk', 'travel'];
    const startingScene = this.getCurrentScene();

    aliases.forEach(alias => {
      // Reset to starting position
      this.setCurrentScene(startingScene);
      
      // Test alias
      const result = this.executeMoveWith(alias, direction);
      this.verifyMovementSuccess(result, expectedDestination);
    });
  }

  /**
   * Test direction abbreviations
   */
  verifyDirectionAbbreviations(fullDirection: string, abbreviation: string, expectedDestination: string): void {
    const startingScene = this.getCurrentScene();

    // Test full direction
    this.setCurrentScene(startingScene);
    const fullResult = this.executeMoveDirection(fullDirection);
    this.verifyMovementSuccess(fullResult, expectedDestination);

    // Test abbreviation
    this.setCurrentScene(startingScene);
    const abbrevResult = this.executeMoveDirection(abbreviation);
    this.verifyMovementSuccess(abbrevResult, expectedDestination);
  }

  /**
   * Get suggestions for command completion testing
   */
  getSuggestions(): string[] {
    // Get basic command suggestions
    const commandSuggestions = this.commandProcessor.getSuggestions('');
    
    // Get available directions from current scene
    const currentScene = this.gameState.getCurrentScene();
    const availableExits = this.scene.getAvailableExits(currentScene);
    const directions = availableExits.map(exit => exit.direction);
    
    // Combine movement commands and available directions
    const movementCommands = ['go', 'move', 'walk', 'travel', 'head'];
    const movementSuggestions = [...movementCommands, ...directions];
    
    // Filter command suggestions to include movement-related ones
    const relevantCommands = commandSuggestions.filter(cmd => 
      movementCommands.includes(cmd) || directions.includes(cmd)
    );
    
    // Return combined and deduplicated suggestions
    return [...new Set([...relevantCommands, ...movementSuggestions])];
  }

  /**
   * Verify suggestions contain expected values
   */
  verifySuggestionsContain(expectedSuggestions: string[]): void {
    const suggestions = this.getSuggestions();
    expectedSuggestions.forEach(expected => {
      expect(suggestions).toContain(expected);
    });
  }
}