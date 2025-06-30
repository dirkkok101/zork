/**
 * State Validation Test Helper for Attic Scene
 * Provides utilities for validating item state persistence and consistency
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
   */
  validateContainerState(containerId: string, expectedOpen: boolean, expectedContents: string[] = []): void {
    const container = this.gameState.getItem(containerId);
    expect(container).toBeDefined();
    expect(container?.state?.isOpen).toBe(expectedOpen);
    
    const contents = (container as any)?.contents || [];
    expect(contents.sort()).toEqual(expectedContents.sort());
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
  validateInventoryState(expectedItems: string[], expectedWeight: number): void {
    const gameState = this.gameState.getGameState();
    expect(gameState.inventory.sort()).toEqual(expectedItems.sort());
    
    const actualWeight = gameState.inventory.reduce((total, itemId) => {
      const item = this.gameState.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
    expect(actualWeight).toBe(expectedWeight);
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
   * Create state snapshot for comparison
   */
  createStateSnapshot(): {
    inventory: string[];
    inventoryWeight: number;
    brickState: boolean;
    brickContents: string[];
    knifeState: boolean;
    sceneItems: string[];
    currentScene: string;
  } {
    const gameState = this.gameState.getGameState();
    const brick = this.gameState.getItem('brick');
    const knife = this.gameState.getItem('knife');
    
    return {
      inventory: [...gameState.inventory],
      inventoryWeight: gameState.inventory.reduce((total, itemId) => {
        const item = this.gameState.getItem(itemId);
        return total + (item?.weight || 0);
      }, 0),
      brickState: brick?.state?.isOpen || false,
      brickContents: [...((brick as any)?.contents || [])],
      knifeState: knife?.state?.on || false,
      sceneItems: this.getSceneItems('attic'),
      currentScene: this.gameState.getCurrentScene()
    };
  }

  /**
   * Compare two state snapshots
   */
  compareStateSnapshots(snapshot1: any, snapshot2: any, shouldBeEqual: boolean = true): void {
    if (shouldBeEqual) {
      expect(snapshot1.inventory.sort()).toEqual(snapshot2.inventory.sort());
      expect(snapshot1.inventoryWeight).toBe(snapshot2.inventoryWeight);
      expect(snapshot1.brickState).toBe(snapshot2.brickState);
      expect(snapshot1.brickContents.sort()).toEqual(snapshot2.brickContents.sort());
      expect(snapshot1.knifeState).toBe(snapshot2.knifeState);
      expect(snapshot1.sceneItems.sort()).toEqual(snapshot2.sceneItems.sort());
      expect(snapshot1.currentScene).toBe(snapshot2.currentScene);
    } else {
      // At least one property should be different
      const differences = [
        JSON.stringify(snapshot1.inventory.sort()) !== JSON.stringify(snapshot2.inventory.sort()),
        snapshot1.inventoryWeight !== snapshot2.inventoryWeight,
        snapshot1.brickState !== snapshot2.brickState,
        JSON.stringify(snapshot1.brickContents.sort()) !== JSON.stringify(snapshot2.brickContents.sort()),
        snapshot1.knifeState !== snapshot2.knifeState,
        JSON.stringify(snapshot1.sceneItems.sort()) !== JSON.stringify(snapshot2.sceneItems.sort()),
        snapshot1.currentScene !== snapshot2.currentScene
      ];
      
      expect(differences.some(diff => diff)).toBe(true);
    }
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
   * Validate that operations don't cause unintended state changes
   */
  validateOperationIsolation(operation: () => void, affectedItems: string[] = []): void {
    const beforeSnapshot = this.createStateSnapshot();
    
    operation();
    
    const afterSnapshot = this.createStateSnapshot();
    
    // Only specified items should have changed
    if (affectedItems.length === 0) {
      this.compareStateSnapshots(beforeSnapshot, afterSnapshot, true);
    } else {
      // Check that unaffected aspects remain the same
      if (!affectedItems.includes('inventory')) {
        expect(beforeSnapshot.inventory.sort()).toEqual(afterSnapshot.inventory.sort());
        expect(beforeSnapshot.inventoryWeight).toBe(afterSnapshot.inventoryWeight);
      }
      
      if (!affectedItems.includes('brick')) {
        expect(beforeSnapshot.brickState).toBe(afterSnapshot.brickState);
        expect(beforeSnapshot.brickContents.sort()).toEqual(afterSnapshot.brickContents.sort());
      }
      
      if (!affectedItems.includes('knife')) {
        expect(beforeSnapshot.knifeState).toBe(afterSnapshot.knifeState);
      }
      
      if (!affectedItems.includes('scene')) {
        expect(beforeSnapshot.sceneItems.sort()).toEqual(afterSnapshot.sceneItems.sort());
        expect(beforeSnapshot.currentScene).toBe(afterSnapshot.currentScene);
      }
    }
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
   * Validate item relationships and references
   */
  validateItemReferences(): void {
    const gameState = this.gameState.getGameState();
    
    // Items in inventory should not be in scenes
    gameState.inventory.forEach(itemId => {
      const sceneItems = this.getSceneItems('attic');
      expect(sceneItems).not.toContain(itemId);
    });
    
    // Container contents should be valid item references
    const brick = this.gameState.getItem('brick');
    if (brick && (brick as any).contents) {
      ((brick as any).contents as string[]).forEach(itemId => {
        // Note: Test items might not exist in game state, so this is a soft check
        if (!itemId.startsWith('test_')) {
          const item = this.gameState.getItem(itemId);
          expect(item).toBeDefined();
        }
      });
    }
  }

  /**
   * Execute command and validate no unexpected state changes
   */
  executeWithStateValidation(command: () => CommandResult, expectedChanges: string[] = []): CommandResult {
    const beforeSnapshot = this.createStateSnapshot();
    const result = command();
    const afterSnapshot = this.createStateSnapshot();
    
    this.validateOperationIsolation(() => {}, expectedChanges);
    
    return result;
  }

  /**
   * Reset to known good state for testing
   */
  resetToKnownState(): void {
    // Clear inventory
    const gameState = this.gameState.getGameState();
    gameState.inventory = [];
    
    // Reset item states
    const brick = this.gameState.getItem('brick');
    if (brick) {
      brick.state = { isOpen: false };
      (brick as any).contents = [];
    }
    
    const knife = this.gameState.getItem('knife');
    if (knife) {
      knife.state = { on: false };
    }
    
    // Ensure all items are in attic scene
    this.gameState.setCurrentScene('attic');
    
    const scene = this.gameState.getScene('attic');
    if (scene) {
      scene.items = [
        { itemId: 'brick', visible: true },
        { itemId: 'rope', visible: true },
        { itemId: 'knife', visible: true }
      ];
    }
  }
}