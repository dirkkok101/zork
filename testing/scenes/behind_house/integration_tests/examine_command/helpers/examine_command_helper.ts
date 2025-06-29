/**
 * Examine Command Test Helper for Behind House Scene
 * Provides utilities for testing the Examine command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IInventoryService, IItemService } from '@/services/interfaces';

export class ExamineCommandHelper {

  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private items: IItemService,
    private inventory: IInventoryService
  ) {}

  /**
   * Execute an examine command and return the result
   */
  executeExamine(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "examine <target>" command
   */
  executeExamineTarget(target: string): CommandResult {
    return this.executeExamine(`examine ${target}`);
  }

  /**
   * Execute examine window command
   */
  executeExamineWindow(): CommandResult {
    return this.executeExamineTarget('windo');
  }

  /**
   * Execute examine scene command (no target)
   */
  executeExamineScene(): CommandResult {
    return this.executeExamine('examine');
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
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify window examination content
   */
  verifyWindowExamination(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyContainsText(result, 'windo');
    // Window should be described as a door/entrance
    expect(result.message.toLowerCase()).toMatch(/window|door|entrance/);
  }

  /**
   * Verify window state information (open/closed)
   */
  verifyWindowState(result: CommandResult, isOpen: boolean): void {
    this.verifySuccess(result);
    if (isOpen) {
      this.verifyContainsText(result, 'open');
    } else {
      this.verifyContainsText(result, 'closed');
    }
  }

  /**
   * Verify scene examination (when no specific target given)
   */
  verifySceneExamination(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyContainsText(result, 'Behind House');
    this.verifyContainsText(result, 'behind house');
  }

  /**
   * Verify detailed examination content
   */
  verifyDetailedExamination(result: CommandResult, expectedDetails: string[]): void {
    this.verifySuccess(result);
    expectedDetails.forEach(detail => {
      this.verifyContainsText(result, detail);
    });
  }

  /**
   * Verify self-examination content
   */
  verifySelfExamination(result: CommandResult, hasItems: boolean, itemCount?: number): void {
    this.verifySuccess(result);
    this.verifyContainsText(result, 'adventurer');
    
    if (hasItems && itemCount !== undefined) {
      this.verifyContainsText(result, `carrying ${itemCount} item`);
    } else if (!hasItems) {
      this.verifyContainsText(result, 'empty-handed');
    }
  }

  /**
   * Verify examination shows that window is a door-type object
   */
  verifyWindowAsDoor(result: CommandResult): void {
    this.verifySuccess(result);
    this.verifyContainsText(result, 'door');
    // Window should be tagged as a door and not have a separate description
  }

  /**
   * Verify examination response for non-portable item
   */
  verifyNonPortableItem(result: CommandResult, itemName: string): void {
    this.verifySuccess(result);
    this.verifyContainsText(result, itemName);
    // Should not suggest that the item can be taken
    expect(result.message.toLowerCase()).not.toMatch(/take|pick up|get/);
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
   * Verify examination of invalid targets
   */
  verifyInvalidTarget(result: CommandResult, inputAlias: string, expectedResolvedName?: string): void {
    this.verifyFailure(result);
    // Error messages should use resolved name, not the alias the user typed
    const nameToCheck = expectedResolvedName || inputAlias;
    expect(result.message).toMatch(new RegExp(`don't see.*${nameToCheck}`, 'i'));
  }

  /**
   * Verify examination command variations work
   */
  verifyCommandVariations(inputAlias: string, expectedResolvedName?: string): void {
    const examineResult = this.executeExamine(`examine ${inputAlias}`);
    const lookAtResult = this.executeExamine(`look at ${inputAlias}`);
    const xResult = this.executeExamine(`x ${inputAlias}`);
    
    // All should succeed
    this.verifySuccess(examineResult);
    this.verifySuccess(lookAtResult);
    this.verifySuccess(xResult);
    
    // All should contain the resolved name, not necessarily the input alias
    const nameToCheck = expectedResolvedName || inputAlias;
    this.verifyContainsText(examineResult, nameToCheck);
    this.verifyContainsText(lookAtResult, nameToCheck);
    this.verifyContainsText(xResult, nameToCheck);
  }

  /**
   * Get current scene ID (utility method using gameState)
   */
  getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Get item details (utility method using items)
   */
  getItemDetails(itemId: string): any {
    return this.items.examineItem(itemId);
  }
}