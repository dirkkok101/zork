/**
 * Move Command Test Helper for Attic Scene
 * Provides utilities for testing the Move command in attic integration tests
 * Specializes in weight-based exit mechanics
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, ISceneService, IItemService } from '@/services/interfaces';

export class MoveCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private scene: ISceneService,
    private items: IItemService
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
   * Execute move down command (specific method for attic)
   */
  executeMoveDown(): CommandResult {
    return this.executeMoveDirection('down');
  }

  /**
   * Execute move up command (invalid from attic)
   */
  executeMoveUp(): CommandResult {
    return this.executeMoveDirection('up');
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
   * Get current player inventory weight
   */
  getCurrentInventoryWeight(): number {
    const gameState = this.gameState.getGameState();
    return gameState.inventory.reduce((total, itemId) => {
      const item = this.gameState.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
  }

  /**
   * Check if player has light load (can exit down)
   */
  hasLightLoad(): boolean {
    // This should match the game's light_load condition
    // Need to determine the exact weight threshold
    return this.getCurrentInventoryWeight() < 20;
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
      expect(result.message).toContain(expectedMessage);
    }
  }

  /**
   * Verify weight-based movement failure (attic-specific)
   */
  verifyWeightBasedFailure(result: CommandResult): void {
    this.verifyMovementFailure(result, 'too narrow for you and all of your baggage');
  }

  /**
   * Verify successful movement to kitchen (down from attic)
   */
  verifyKitchenAccess(result: CommandResult): void {
    this.verifyMovementSuccess(result, 'kitchen');
  }

  /**
   * Verify blocked movement due to invalid direction
   */
  verifyInvalidDirection(result: CommandResult, direction?: string): void {
    this.verifyFailure(result);
    if (direction) {
      expect(result.message).toMatch(new RegExp(`cannot go ${direction}`, 'i'));
    }
  }

  /**
   * Verify movement failure due to no exit
   */
  verifyNoExit(result: CommandResult, direction: string): void {
    this.verifyFailure(result);
    this.verifyCountsAsMove(result);
    expect(result.message).toMatch(new RegExp(`cannot go ${direction}`, 'i'));
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
   * Test movement from attic to kitchen (down)
   */
  verifyAtticToKitchen(): void {
    this.verifyMovementBetweenScenes('attic', 'kitchen', 'down');
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
   * Verify blocked directions from attic
   */
  verifyAtticBlockedDirections(): void {
    const blockedDirections = ['north', 'south', 'east', 'west', 'up', 'in', 'out'];
    
    blockedDirections.forEach(direction => {
      this.setCurrentScene('attic');
      const result = this.executeMoveDirection(direction);
      
      this.verifyFailure(result);
      this.verifyCountsAsMove(result);
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
   * Verify round trip movement works (attic specific with weight considerations)
   */
  verifyRoundTrip(direction1: string, destination: string, direction2: string, origin: string): void {
    this.setCurrentScene(origin);
    
    // First movement (should work if weight is light)
    const result1 = this.executeMoveDirection(direction1);
    if (this.hasLightLoad()) {
      this.verifyMovementSuccess(result1, destination);
      
      // Return movement
      const result2 = this.executeMoveDirection(direction2);
      this.verifyMovementSuccess(result2, origin);
    } else {
      this.verifyWeightBasedFailure(result1);
    }
  }

  /**
   * Test weight-based exit with different inventory loads
   */
  verifyWeightBasedExit(lightLoad: boolean): void {
    this.setCurrentScene('attic');
    
    const result = this.executeMoveDown();
    
    if (lightLoad) {
      this.verifyKitchenAccess(result);
    } else {
      this.verifyWeightBasedFailure(result);
    }
  }

  /**
   * Add item to inventory for weight testing
   */
  addItemToInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    if (!gameState.inventory.includes(itemId)) {
      gameState.inventory.push(itemId);
    }
  }

  /**
   * Remove item from inventory for weight testing
   */
  removeItemFromInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    const index = gameState.inventory.indexOf(itemId);
    if (index > -1) {
      gameState.inventory.splice(index, 1);
    }
  }

  /**
   * Clear inventory for clean testing
   */
  clearInventory(): void {
    const gameState = this.gameState.getGameState();
    gameState.inventory = [];
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
   * Check if an item is a container
   */
  isContainer(itemId: string): boolean {
    return this.items.isContainer(itemId);
  }
}