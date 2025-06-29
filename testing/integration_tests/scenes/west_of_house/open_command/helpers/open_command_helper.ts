/**
 * Open Command Test Helper
 * Provides utilities for executing and validating open command behavior
 */

import { OpenCommand } from '@/commands/OpenCommand';
import { CommandResult } from '@/types/CommandTypes';
import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { InventoryService } from '@/services/InventoryService';
import { ItemService } from '@/services/ItemService';
import { OutputService } from '@/services/OutputService';
import { ICombatService, IPersistenceService } from '@/services/interfaces';

export class OpenCommandHelper {
  private openCommand: OpenCommand;
  private gameState: GameStateService;
  private items: ItemService;
  
  constructor(
    gameState: GameStateService,
    sceneService: SceneService,
    inventoryService: InventoryService,
    itemService: ItemService,
    combatService: ICombatService,
    persistenceService: IPersistenceService,
    outputService: OutputService
  ) {
    this.gameState = gameState;
    this.items = itemService;
    this.openCommand = new OpenCommand(
      gameState,
      sceneService,
      inventoryService,
      itemService,
      combatService,
      persistenceService,
      outputService
    );
  }

  /**
   * Execute an open command and return the result
   */
  executeOpen(input: string): CommandResult {
    return this.openCommand.execute(input);
  }

  /**
   * Execute "open <target>" command
   */
  executeOpenTarget(target: string): CommandResult {
    return this.executeOpen(`open ${target}`);
  }

  /**
   * Execute "open <target> with <key>" command
   */
  executeOpenWithKey(target: string, key: string): CommandResult {
    return this.executeOpen(`open ${target} with ${key}`);
  }

  /**
   * Verify command was successful
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify command failed with expected message
   */
  verifyFailure(result: CommandResult, expectedMessagePattern?: string | RegExp): void {
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify item was opened
   */
  verifyItemOpened(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen ?? (item as any)?.isOpen ?? false;
    expect(isOpen).toBe(true);
  }

  /**
   * Verify item is closed
   */
  verifyItemClosed(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isOpen = item?.state?.isOpen ?? (item as any)?.isOpen ?? false;
    expect(isOpen).toBe(false);
  }

  /**
   * Verify item is locked
   */
  verifyItemLocked(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isLocked = item?.state?.isLocked ?? (item as any)?.isLocked ?? false;
    expect(isLocked).toBe(true);
  }

  /**
   * Verify item is unlocked
   */
  verifyItemUnlocked(itemId: string): void {
    const item = this.gameState.getItem(itemId);
    expect(item).toBeDefined();
    const isLocked = item?.state?.isLocked ?? (item as any)?.isLocked ?? false;
    expect(isLocked).toBe(false);
  }

  /**
   * Verify the command counts as a move
   */
  verifyCountsAsMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify the command doesn't count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify successful open message
   */
  verifyOpenMessage(result: CommandResult, itemName: string, keyName?: string): void {
    this.verifySuccess(result);
    expect(result.message).toContain(`open the ${itemName}`);
    if (keyName) {
      expect(result.message).toContain(`with the ${keyName}`);
    }
  }

  /**
   * Verify already open message
   */
  verifyAlreadyOpen(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${itemName}.*already open`, 'i'));
  }

  /**
   * Verify locked message
   */
  verifyLocked(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${itemName}.*locked`, 'i'));
  }

  /**
   * Verify cannot open message
   */
  verifyCannotOpen(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't open.*${itemName}`, 'i'));
  }

  /**
   * Verify cannot open message with resolved item name
   */
  verifyCannotOpenItem(result: CommandResult, resolvedItemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't open.*${resolvedItemName}`, 'i'));
  }

  /**
   * Verify item not found message
   */
  verifyItemNotFound(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${itemName}`, 'i'));
  }

  /**
   * Verify key not found message
   */
  verifyKeyNotFound(result: CommandResult, keyName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't have.*${keyName}`, 'i'));
  }

  /**
   * Verify wrong key message
   */
  verifyWrongKey(result: CommandResult, keyName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${keyName}.*doesn't fit`, 'i'));
  }

  /**
   * Check if item can be opened
   */
  canOpen(itemId: string): boolean {
    return this.items.canOpen(itemId);
  }

  /**
   * Check if item is locked
   */
  isLocked(itemId: string): boolean {
    return this.items.isLocked(itemId);
  }
}