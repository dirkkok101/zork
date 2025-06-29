/**
 * Examine Command Test Helper
 * Provides utilities for testing the Examine command in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IInventoryService } from '@/services/interfaces';

export class ExamineCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
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
   * Execute an open command (for setup in tests)
   */
  executeOpen(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute a take command (for setup in tests)
   */
  executeTake(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
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
   * Verify detailed examination content
   */
  verifyDetailedExamination(result: CommandResult, expectedDetails: string[]): void {
    this.verifySuccess(result);
    expectedDetails.forEach(detail => {
      this.verifyContainsText(result, detail);
    });
  }

  /**
   * Verify container information is shown
   */
  verifyContainerInfo(result: CommandResult, isOpen: boolean, hasContents?: boolean): void {
    this.verifySuccess(result);
    
    if (isOpen) {
      this.verifyContainsText(result, 'open');
      if (hasContents) {
        expect(result.message.toLowerCase()).toMatch(/contains|inside/);
      } else {
        this.verifyContainsText(result, 'empty');
      }
    } else {
      this.verifyContainsText(result, 'closed');
    }
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
   * Verify readable content is included
   */
  verifyReadableContent(result: CommandResult, expectedReadableText?: string): void {
    this.verifySuccess(result);
    if (expectedReadableText) {
      this.verifyContainsText(result, expectedReadableText);
    }
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
}