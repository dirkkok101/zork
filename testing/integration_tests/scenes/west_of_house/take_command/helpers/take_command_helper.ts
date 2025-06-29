/**
 * Take Command Test Helper
 * Provides utilities for testing the Take command in integration tests
 */

import { TakeCommand } from '@/commands/TakeCommand';
import { CommandResult } from '@/types/CommandTypes';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService
} from '@/services/interfaces';

export class TakeCommandHelper {
  private takeCommand: TakeCommand;

  constructor(
    private gameState: IGameStateService,
    private scene: ISceneService,
    private inventory: IInventoryService,
    private items: IItemService,
    private combat: ICombatService,
    private persistence: IPersistenceService,
    private output: IOutputService
  ) {
    this.takeCommand = new TakeCommand(
      gameState,
      scene,
      inventory,
      items,
      combat,
      persistence,
      output
    );
  }

  /**
   * Execute a take command and return the result
   */
  executeTake(input: string): CommandResult {
    return this.takeCommand.execute(input);
  }

  /**
   * Execute "take <target>" command
   */
  executeTakeTarget(target: string): CommandResult {
    return this.executeTake(`take ${target}`);
  }

  /**
   * Execute an open command (for setup in tests)
   */
  executeOpen(input: string): CommandResult {
    // Import and use OpenCommand for test setup
    const { OpenCommand } = require('@/commands/OpenCommand');
    const openCommand = new OpenCommand(
      this.gameState,
      this.scene,
      this.inventory,
      this.items,
      this.combat,
      this.persistence,
      this.output
    );
    return openCommand.execute(input);
  }

  /**
   * Check if an item is in the player's inventory
   */
  isInInventory(itemId: string): boolean {
    return this.inventory.hasItem(itemId);
  }

  /**
   * Check if an item is in the current scene
   */
  isInScene(itemId: string): boolean {
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    return sceneItems.includes(itemId);
  }

  /**
   * Check if an item is in a specific container
   */
  isInContainer(itemId: string, containerId: string): boolean {
    const contents = this.items.getContainerContents(containerId);
    return contents.includes(itemId);
  }

  /**
   * Check if an item is accessible (in scene, inventory, or open containers)
   */
  isAccessible(itemId: string): boolean {
    // Check inventory
    if (this.isInInventory(itemId)) {
      return true;
    }

    // Check scene
    if (this.isInScene(itemId)) {
      return true;
    }

    // Check open containers in scene
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    
    for (const sceneItemId of sceneItems) {
      const container = this.gameState.getItem(sceneItemId);
      if (container && this.items.isContainer(sceneItemId)) {
        const isOpen = container.state?.isOpen || (container as any).isOpen || false;
        if (isOpen && this.isInContainer(itemId, sceneItemId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get current inventory count
   */
  getInventoryCount(): number {
    return this.inventory.getItems().length;
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
    expect(result.message.length).toBeGreaterThan(0);
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify that the result contains specific text
   */
  verifyContainsText(result: CommandResult, expectedText: string): void {
    expect(result.message.toLowerCase()).toContain(expectedText.toLowerCase());
  }

  /**
   * Verify that the command does not count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify that the command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify item cannot be taken message
   */
  verifyCannotTake(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't take.*${itemName}`, 'i'));
  }

  /**
   * Verify already have item message
   */
  verifyAlreadyHave(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`already have.*${itemName}`, 'i'));
  }

  /**
   * Verify successful take message
   */
  verifyTakeSuccess(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`take.*${itemName}`, 'i'));
    this.verifyCountsAsMove(result);
  }

  /**
   * Verify item was moved from scene to inventory
   */
  verifyItemMoved(itemId: string, shouldBeInInventory: boolean = true): void {
    if (shouldBeInInventory) {
      expect(this.isInInventory(itemId)).toBe(true);
      expect(this.isInScene(itemId)).toBe(false);
    } else {
      expect(this.isInInventory(itemId)).toBe(false);
      expect(this.isInScene(itemId)).toBe(true);
    }
  }

  /**
   * Verify inventory count changed by expected amount
   */
  verifyInventoryCountChange(initialCount: number, expectedChange: number): void {
    const currentCount = this.getInventoryCount();
    expect(currentCount).toBe(initialCount + expectedChange);
  }
}