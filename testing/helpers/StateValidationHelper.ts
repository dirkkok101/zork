/**
 * State Validation Test Helper
 * Provides utilities for validating item state persistence and consistency across any scene
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, ISceneService, IItemService } from '@/services/interfaces';

export class StateValidationHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private scene: ISceneService,
    private items: IItemService
  ) {}

  /**
   * Validate that item state matches expected values
   */
  validateItemState(itemId: string, expectedState: any): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();

    if (expectedState) {
      Object.keys(expectedState).forEach(key => {
        expect(item?.state?.[key]).toBe(expectedState[key]);
      });
    }
  }

  /**
   * Validate container state and contents
   * @param containerId - The ID of the container to validate
   * @param expectedOpen - Whether the container should be open
   * @param expectedContents - Optional array of expected contents (if undefined, contents are not checked)
   */
  validateContainerState(containerId: string, expectedOpen: boolean, expectedContents?: string[]): void {
    const container = this.gameState.getItem(containerId);
    expect(container).toBeDefined();
    expect(container?.state?.open).toBe(expectedOpen);

    // Only validate contents if explicitly provided
    if (expectedContents !== undefined) {
      const contents = (container as any)?.contents || [];
      expect(contents.sort()).toEqual(expectedContents.sort());
    }
  }

  /**
   * Validate weapon state
   */
  validateWeaponState(weaponId: string, expectedOn: boolean): void {
    const weapon = this.gameState.getItem(weaponId);
    expect(weapon).toBeDefined();
    expect(weapon?.state?.on).toBe(expectedOn);
  }

  /**
   * Validate inventory contents and weights
   */
  validateInventoryState(expectedItems: string[], expectedWeight?: number): void {
    const gameState = this.gameState.getGameState();
    expect(gameState.inventory.sort()).toEqual(expectedItems.sort());

    if (expectedWeight !== undefined) {
      const actualWeight = gameState.inventory.reduce((total, itemId) => {
        const item = this.gameState.getItem(itemId);
        return total + (item?.weight || 0);
      }, 0);
      expect(actualWeight).toBe(expectedWeight);
    }
  }

  /**
   * Validate scene item distribution
   */
  validateSceneItems(sceneId: string, expectedItems: string[]): void {
    const scene = this.gameState.getScene(sceneId);
    const actualItems = scene?.items?.map((item: any) => item.itemId) || [];
    expect(actualItems.sort()).toEqual(expectedItems.sort());
  }

  /**
   * Validate state consistency across multiple queries
   */
  validateStateConsistency(itemId: string): void {
    // Query state multiple times and ensure consistency
    const state1 = this.gameState.getItem(itemId)?.state;
    const state2 = this.gameState.getItem(itemId)?.state;
    const state3 = this.gameState.getItem(itemId)?.state;

    expect(state1).toEqual(state2);
    expect(state2).toEqual(state3);
  }

  /**
   * Get current scene ID
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Get items in specified scene
   */
  getSceneItems(sceneId: string): string[] {
    const scene = this.gameState.getScene(sceneId);
    return scene?.items?.map((item: any) => item.itemId) || [];
  }

  /**
   * Check if an item is a container
   */
  isContainer(itemId: string): boolean {
    return this.items.isContainer(itemId);
  }

  /**
   * Get available exits from current scene
   */
  getAvailableExits(): any[] {
    return this.scene.getAvailableExits(this.getCurrentScene());
  }

  /**
   * Validate game state integrity
   */
  validateGameStateIntegrity(): void {
    const gameState = this.gameState.getGameState();

    // Basic integrity checks
    expect(gameState).toBeDefined();
    expect(gameState.inventory).toBeDefined();
    expect(Array.isArray(gameState.inventory)).toBe(true);
    expect(typeof gameState.moves).toBe('number');
    expect(gameState.moves).toBeGreaterThanOrEqual(0);

    // Inventory items should exist
    gameState.inventory.forEach(itemId => {
      const item = this.gameState.getItem(itemId);
      expect(item).toBeDefined();
    });

    // Current scene should exist
    const currentScene = this.gameState.getCurrentScene();
    expect(currentScene).toBeDefined();
    expect(typeof currentScene).toBe('string');

    const scene = this.gameState.getScene(currentScene);
    expect(scene).toBeDefined();
  }

  /**
   * Validate that container state persists across commands
   */
  validateContainerStatePersistence(containerId: string, initialState: boolean): void {
    // Verify initial state
    this.validateContainerState(containerId, initialState);

    // Execute non-modifying command
    this.commandProcessor.processCommand('look');

    // State should persist
    this.validateContainerState(containerId, initialState);
  }

  /**
   * Validate that item state persists across scene transitions
   */
  validateItemStatePersistenceAcrossMovement(
    itemId: string,
    stateProperty: string,
    expectedValue: any,
    moveCommand: string,
    returnCommand: string
  ): void {
    // Verify initial state
    const item = this.gameState.getItem(itemId);
    expect(item?.state?.[stateProperty]).toBe(expectedValue);

    // Move away
    const moveResult = this.commandProcessor.processCommand(moveCommand);

    // Only test if movement succeeded
    if (moveResult.success) {
      // Verify state persists
      expect(item?.state?.[stateProperty]).toBe(expectedValue);

      // Return
      this.commandProcessor.processCommand(returnCommand);

      // Verify state still persists
      expect(item?.state?.[stateProperty]).toBe(expectedValue);
    }
  }

  /**
   * Get current inventory weight
   */
  getCurrentInventoryWeight(): number {
    const gameState = this.gameState.getGameState();
    return gameState.inventory.reduce((total, itemId) => {
      const item = this.gameState.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
  }

  /**
   * Get game state for advanced validation
   */
  getGameState(): any {
    return this.gameState.getGameState();
  }

  /**
   * Validate flag state
   */
  validateFlagState(flagName: string, expectedValue: boolean): void {
    const actualValue = this.gameState.getFlag(flagName);
    expect(actualValue).toBe(expectedValue);
  }

  /**
   * Validate flag state persists across commands
   */
  validateFlagStatePersistence(flagName: string, expectedValue: boolean, command: string): void {
    // Verify initial flag state
    this.validateFlagState(flagName, expectedValue);

    // Execute command
    this.commandProcessor.processCommand(command);

    // Flag should persist
    this.validateFlagState(flagName, expectedValue);
  }

  /**
   * Execute command and return result
   */
  executeCommand(command: string): CommandResult {
    return this.commandProcessor.processCommand(command);
  }

  /**
   * Validate that a failed operation doesn't change state
   */
  validateFailedOperationNoStateChange(
    operation: () => CommandResult,
    itemId: string,
    stateProperty: string
  ): void {
    const beforeValue = this.gameState.getItem(itemId)?.state?.[stateProperty];

    const result = operation();
    expect(result.success).toBe(false);

    const afterValue = this.gameState.getItem(itemId)?.state?.[stateProperty];
    expect(afterValue).toBe(beforeValue);
  }
}
