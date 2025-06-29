/**
 * Inventory Command Test Helper
 * Provides utilities for testing the Inventory command in integration tests
 */

import { InventoryCommand } from '@/commands/InventoryCommand';
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

export class InventoryCommandHelper {
  private inventoryCommand: InventoryCommand;

  constructor(
    gameState: IGameStateService,
    scene: ISceneService,
    private inventory: IInventoryService,
    items: IItemService,
    combat: ICombatService,
    persistence: IPersistenceService,
    output: IOutputService
  ) {
    this.inventoryCommand = new InventoryCommand(
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
   * Execute an inventory command and return the result
   */
  executeInventory(input: string): CommandResult {
    return this.inventoryCommand.execute(input);
  }

  /**
   * Execute inventory command with no arguments
   */
  executeInventoryDisplay(): CommandResult {
    return this.executeInventory('inventory');
  }

  /**
   * Execute inventory using "i" alias
   */
  executeInventoryShort(): CommandResult {
    return this.executeInventory('i');
  }

  /**
   * Execute inventory using "inv" alias
   */
  executeInventoryAbbreviated(): CommandResult {
    return this.executeInventory('inv');
  }

  /**
   * Get current inventory count for verification
   */
  getInventoryCount(): number {
    return this.inventory.getItemCount();
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
   * Check if item is in inventory
   */
  isInInventory(itemId: string): boolean {
    return this.inventory.hasItem(itemId);
  }

  /**
   * Get list of items in inventory
   */
  getInventoryItems(): string[] {
    return this.inventory.getItems();
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
   * Verify command does count as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
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
   * Verify empty inventory message
   */
  verifyEmptyInventory(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, "You are empty-handed.");
  }

  /**
   * Verify inventory contains specific items
   */
  verifyInventoryContains(result: CommandResult, itemNames: string[]): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    
    // Check that all expected items appear in the message
    itemNames.forEach(itemName => {
      this.verifyMessageContains(result, itemName);
    });
  }

  /**
   * Verify inventory description format for single item
   */
  verifyInventorySingleItem(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, `You are carrying ${itemName}.`);
  }

  /**
   * Verify inventory description format for two items
   */
  verifyInventoryTwoItems(result: CommandResult, item1: string, item2: string): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    this.verifyMessage(result, `You are carrying ${item1} and ${item2}.`);
  }

  /**
   * Verify inventory description format for multiple items
   */
  verifyInventoryMultipleItems(result: CommandResult, items: string[]): void {
    this.verifySuccess(result);
    this.verifyNoMove(result);
    
    if (items.length >= 3) {
      const allButLast = items.slice(0, -1).join(', ');
      const expectedMessage = `You are carrying ${allButLast}, and ${items[items.length - 1]}.`;
      this.verifyMessage(result, expectedMessage);
    }
  }
}