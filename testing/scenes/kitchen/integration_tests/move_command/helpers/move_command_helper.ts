/**
 * Move Command Test Helper for Kitchen Scene
 * Provides utilities for testing the Move command in kitchen integration tests
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
   * Verify movement failure due to blocked exit (like closed window)
   */
  verifyBlockedExit(result: CommandResult, expectedBlockMessage?: string): void {
    this.verifyFailure(result);
    this.verifyCountsAsMove(result);
    if (expectedBlockMessage) {
      this.verifyMessageContains(result, expectedBlockMessage);
    }
  }

  /**
   * Verify kitchen-specific blocked exit (window is closed)
   */
  verifyWindowClosed(result: CommandResult): void {
    this.verifyBlockedExit(result, 'windo is closed');
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
   * Test movement from kitchen to living room (west)
   */
  verifyKitchenToLivingRoom(): void {
    this.verifyMovementBetweenScenes('kitchen', 'living_room', 'west');
  }

  /**
   * Test movement from kitchen to attic (up)
   */
  verifyKitchenToAttic(): void {
    this.verifyMovementBetweenScenes('kitchen', 'attic', 'up');
  }

  /**
   * Test movement from kitchen to behind house (east/out through window)
   */
  verifyKitchenToBehindHouse(): void {
    this.verifyMovementBetweenScenes('kitchen', 'behind_house', 'east');
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
   * Verify blocked directions from kitchen
   */
  verifyKitchenBlockedDirections(): void {
    const blockedDirections = ['north', 'south', 'in', 'down'];
    
    blockedDirections.forEach(direction => {
      this.setCurrentScene('kitchen');
      const result = this.executeMoveDirection(direction);
      
      if (direction === 'down') {
        // Special message for chimney
        this.verifyBlockedExit(result, 'Only Santa Claus climbs down chimneys');
      } else {
        this.verifyFailure(result);
        this.verifyCountsAsMove(result);
      }
    });
  }

  /**
   * Get current move count
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Verify move count increased by expected amount
   */
  verifyMoveCountIncreased(initialCount: number, expectedIncrease: number): void {
    const currentCount = this.getCurrentMoves();
    expect(currentCount).toBe(initialCount + expectedIncrease);
  }

  /**
   * Verify round trip movement works
   */
  verifyRoundTrip(direction1: string, destination: string, direction2: string, origin: string): void {
    this.setCurrentScene(origin);
    
    // First movement
    const result1 = this.executeMoveDirection(direction1);
    this.verifyMovementSuccess(result1, destination);
    
    // Return movement
    const result2 = this.executeMoveDirection(direction2);
    this.verifyMovementSuccess(result2, origin);
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

  /**
   * Execute move east command (specific method for tests)
   */
  executeMoveEast(): CommandResult {
    return this.executeMoveDirection('east');
  }

  /**
   * Execute move out command (specific method for tests)
   */
  executeMoveOut(): CommandResult {
    return this.executeMoveDirection('out');
  }

  /**
   * Execute move west command (specific method for tests)
   */
  executeMoveWest(): CommandResult {
    return this.executeMoveDirection('west');
  }

  /**
   * Execute move up command (specific method for tests)
   */
  executeMoveUp(): CommandResult {
    return this.executeMoveDirection('up');
  }

  /**
   * Execute move down command (specific method for tests)
   */
  executeMoveDown(): CommandResult {
    return this.executeMoveDirection('down');
  }

  /**
   * Verify window closed failure for east/out movement
   */
  verifyWindowClosedFailure(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyCountsAsMove(result);
    this.verifyMessageContains(result, 'windo is closed');
  }

  /**
   * Verify successful access to behind house
   */
  verifyBehindHouseAccess(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'behind_house');
  }

  /**
   * Verify successful access to living room
   */
  verifyLivingRoomAccess(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'living_room');
  }

  /**
   * Verify successful access to attic
   */
  verifyAtticAccess(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'attic');
  }
}