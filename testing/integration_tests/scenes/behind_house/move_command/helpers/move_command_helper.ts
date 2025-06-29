/**
 * Move Command Test Helper for Behind House Scene
 * Provides utilities for testing the Move command with conditional kitchen access
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
   * Execute movement to north
   */
  executeMoveNorth(): CommandResult {
    return this.executeMoveDirection('north');
  }

  /**
   * Execute movement to south
   */
  executeMoveSouth(): CommandResult {
    return this.executeMoveDirection('south');
  }

  /**
   * Execute movement to east
   */
  executeMoveEast(): CommandResult {
    return this.executeMoveDirection('east');
  }

  /**
   * Execute movement to west (kitchen via window)
   */
  executeMoveWest(): CommandResult {
    return this.executeMoveDirection('west');
  }

  /**
   * Execute movement "in" (kitchen via window)
   */
  executeMoveIn(): CommandResult {
    return this.executeMoveDirection('in');
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
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify movement failure with specific message
   */
  verifyMovementFailure(result: CommandResult, expectedMessage?: string): void {
    this.verifyFailure(result);
    this.verifyCountsAsMove(result); // Failed moves still count as moves in Zork
    
    if (expectedMessage) {
      this.verifyMessageContains(result, expectedMessage);
    }
  }

  /**
   * Verify movement failure due to window being closed
   */
  verifyWindowClosedFailure(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyMessageContains(result, 'The windo is closed');
  }

  /**
   * Verify successful movement to kitchen when window is open
   */
  verifyKitchenAccess(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'kitchen');
  }

  /**
   * Verify movement to north_of_house
   */
  verifyNorthMovement(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'north_of_house');
  }

  /**
   * Verify movement to south_of_house
   */
  verifySouthMovement(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'south_of_house');
  }

  /**
   * Verify movement to clearing
   */
  verifyEastMovement(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'clearing');
  }

  /**
   * Test movement between two scenes
   */
  verifyMovementBetweenScenes(fromSceneId: string, toSceneId: string, direction: string): void {
    this.setCurrentScene(fromSceneId);
    expect(this.getCurrentScene()).toBe(fromSceneId);

    const result = this.executeMoveDirection(direction);
    this.verifyMovementSuccess(result, toSceneId);
  }

  /**
   * Test conditional movement with window state
   */
  verifyConditionalMovement(direction: string, expectedSuccess: boolean): void {
    // Execute movement and verify based on expected success
    const result = this.executeMoveDirection(direction);
    
    if (expectedSuccess) {
      this.verifySuccess(result);
      expect(this.getCurrentScene()).toBe('kitchen');
    } else {
      this.verifyWindowClosedFailure(result);
      expect(this.getCurrentScene()).toBe('behind_house'); // Should stay in same scene
    }
  }

  /**
   * Test movement aliases for a direction
   */
  verifyMovementAliases(direction: string, expectedDestination: string): void {
    const aliases = ['go', 'move', 'walk'];
    const startingScene = this.getCurrentScene();

    aliases.forEach(alias => {
      this.setCurrentScene(startingScene);
      
      const result = this.executeMove(`${alias} ${direction}`);
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
   * Verify all basic exits work (non-conditional ones)
   */
  verifyBasicExits(): void {
    const startingScene = this.getCurrentScene();
    
    // Test North
    this.setCurrentScene(startingScene);
    const northResult = this.executeMoveNorth();
    this.verifyNorthMovement(northResult);
    
    // Test South
    this.setCurrentScene(startingScene);
    const southResult = this.executeMoveSouth();
    this.verifySouthMovement(southResult);
    
    // Test East
    this.setCurrentScene(startingScene);
    const eastResult = this.executeMoveEast();
    this.verifyEastMovement(eastResult);
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
   * Verify invalid direction response
   */
  verifyInvalidDirection(result: CommandResult): void {
    this.verifyFailure(result);
    // Should indicate direction is not available
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Get scene description for verification
   */
  getSceneDescription(sceneId?: string): string {
    const targetScene = sceneId || this.getCurrentScene();
    return this.scene.getSceneDescription(targetScene);
  }
}