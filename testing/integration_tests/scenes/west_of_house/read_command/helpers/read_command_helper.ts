/**
 * Read Command Test Helper
 * Provides utilities for testing the Read command in integration tests
 */

import { ReadCommand } from '@/commands/ReadCommand';
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

export class ReadCommandHelper {
  private readCommand: ReadCommand;

  constructor(
    private gameState: IGameStateService,
    private scene: ISceneService,
    private inventory: IInventoryService,
    private items: IItemService,
    combat: ICombatService,
    persistence: IPersistenceService,
    output: IOutputService
  ) {
    this.readCommand = new ReadCommand(
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
   * Execute a read command and return the result
   */
  executeRead(input: string): CommandResult {
    return this.readCommand.execute(input);
  }

  /**
   * Execute read command for a specific item
   */
  executeReadItem(itemName: string): CommandResult {
    return this.executeRead(`read ${itemName}`);
  }

  /**
   * Execute read command with no arguments
   */
  executeReadEmpty(): CommandResult {
    return this.executeRead('read');
  }

  /**
   * Add an item to inventory for testing
   */
  addItemToInventory(itemId: string): boolean {
    return this.inventory.addItem(itemId);
  }

  /**
   * Remove an item from inventory for testing
   */
  removeItemFromInventory(itemId: string): boolean {
    return this.inventory.removeItem(itemId);
  }

  /**
   * Clear entire inventory for clean test state
   */
  clearInventory(): void {
    const items = this.inventory.getItems();
    items.forEach(itemId => {
      this.inventory.removeItem(itemId);
    });
  }

  /**
   * Check if item is readable
   */
  isItemReadable(itemId: string): boolean {
    const readResult = this.items.readItem(itemId);
    return readResult !== "You can't read that." && readResult !== "You don't see that here.";
  }

  /**
   * Get readable content for an item
   */
  getItemReadableContent(itemId: string): string | null {
    return this.items.readItem(itemId);
  }

  /**
   * Set current scene for testing
   */
  setCurrentScene(sceneId: string): void {
    this.gameState.setCurrentScene(sceneId);
  }

  /**
   * Get current scene ID
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Get scene items for verification
   */
  getSceneItems(): string[] {
    const currentScene = this.getCurrentScene();
    return this.scene.getSceneItems(currentScene);
  }

  /**
   * Check if item exists in current scene or inventory
   */
  isItemAccessible(itemName: string): boolean {
    const itemId = this.findItemId(itemName);
    return itemId !== null;
  }

  /**
   * Find item ID by name (similar to BaseCommand logic)
   */
  private findItemId(name: string): string | null {
    const lowerName = name.toLowerCase();
    const currentSceneId = this.getCurrentScene();
    
    // Check scene items
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    for (const itemId of sceneItems) {
      const item = this.gameState.getItem(itemId);
      if (item && this.itemMatches(item, lowerName)) {
        return itemId;
      }
    }
    
    // Check inventory
    for (const itemId of this.inventory.getItems()) {
      const item = this.gameState.getItem(itemId);
      if (item && this.itemMatches(item, lowerName)) {
        return itemId;
      }
    }
    
    return null;
  }

  /**
   * Check if an item matches a name or alias
   */
  private itemMatches(item: any, name: string): boolean {
    return item.name.toLowerCase() === name || 
           (item.aliases && item.aliases.some((alias: string) => alias.toLowerCase() === name));
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
   * Verify successful read with expected content
   */
  verifyReadSuccess(result: CommandResult, expectedContent: string): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, expectedContent);
  }

  /**
   * Verify read failure with expected message
   */
  verifyReadFailure(result: CommandResult, expectedMessage: string): void {
    this.verifyFailure(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, expectedMessage);
  }

  /**
   * Verify item not found error
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, `You don't see any ${itemName} here.`);
  }

  /**
   * Verify item not readable error
   */
  verifyItemNotReadable(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, "You can't read that.");
  }

  /**
   * Verify empty read command error
   */
  verifyEmptyReadCommand(result: CommandResult): void {
    this.verifyFailure(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, "Read what?");
  }

  /**
   * Test reading an item with various aliases
   */
  verifyReadWithAliases(aliases: string[], expectedContent: string): void {
    aliases.forEach(alias => {
      const result = this.executeReadItem(alias);
      this.verifyReadSuccess(result, expectedContent);
    });
  }
}