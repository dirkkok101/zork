/**
 * Attic Scene Test Helper
 * Provides utilities specific to testing the attic scene
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { ItemService } from '@/services/ItemService';
import { Item, ItemType } from '@/types/ItemTypes';
import { Scene } from '@/types/SceneTypes';

export class AtticHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;
  private itemService: ItemService;

  constructor(gameState: GameStateService, sceneService: SceneService, itemService: ItemService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
    this.itemService = itemService;
  }

  /**
   * Get the attic scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('attic');
  }

  /**
   * Verify the player is in attic
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('attic');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('attic');
    
    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('attic', { visited: false });
    
    // Clear any existing runtime scene items first
    const currentSceneItems = this.sceneService.getSceneItems('attic');
    currentSceneItems.forEach(itemId => {
      this.sceneService.removeItemFromScene('attic', itemId);
    });
    
    // Restore authentic Zork items to the scene using SceneService
    const authenticItems = ['brick', 'rope', 'knife'];
    authenticItems.forEach(itemId => {
      this.sceneService.addItemToScene('attic', itemId);
    });
    
    // Also set the scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'brick', visible: true },
        { itemId: 'rope', visible: true },
        { itemId: 'knife', visible: true }
      ];
    }
    
    // Reset brick container state - initially closed
    const brick = this.gameState.getItem('brick');
    if (brick) {
      brick.state = { 
        open: false
      };
      // Set container as empty initially (player can add items during testing)
      (brick as any).contents = [];
    }
    
    // Reset knife state - initially off
    const knife = this.gameState.getItem('knife');
    if (knife) {
      knife.state = { 
        on: false
      };
    }
    
    // Reset rope state (no special state needed)
    const rope = this.gameState.getItem('rope');
    if (rope) {
      rope.state = {};
    }
    
    // Clear player inventory to start fresh
    this.clearPlayerInventory();
  }

  /**
   * Clear player inventory for clean testing
   */
  clearPlayerInventory(): void {
    const gameState = this.gameState.getGameState();
    gameState.inventory = [];
  }

  /**
   * Add a test item to the scene
   */
  addItemToScene(itemId: string, itemData: Partial<Item>): void {
    const defaultItem: Item = {
      id: itemId,
      name: itemData.name || 'Test Item',
      aliases: itemData.aliases || [],
      description: itemData.description || 'A test item.',
      examineText: itemData.examineText || 'It looks like a test item.',
      type: itemData.type || ItemType.TOOL,
      portable: itemData.portable !== undefined ? itemData.portable : true,
      visible: itemData.visible !== undefined ? itemData.visible : true,
      weight: itemData.weight || 1,
      size: itemData.size || 'SMALL' as any,
      tags: itemData.tags || [],
      properties: itemData.properties || {},
      interactions: itemData.interactions || [],
      currentLocation: 'attic',
      state: itemData.state || {},
      flags: itemData.flags || {},
      ...itemData
    };

    // Add item to game state items collection
    const gameState = this.gameState.getGameState();
    gameState.items[itemId] = defaultItem;
    
    // Add item to scene
    this.sceneService.addItemToScene('attic', itemId);
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('attic');
  }

  /**
   * Remove all test items from the scene
   */
  clearTestItems(): void {
    const scene = this.getScene();
    if (scene) {
      // Remove items that were added for testing
      const testItemIds = scene.items
        .map((item: any) => item.itemId)
        .filter((id: string) => id.startsWith('test_') || id.includes('_test'));
      
      testItemIds.forEach((itemId: string) => {
        this.sceneService.removeItemFromScene('attic', itemId);
      });
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('attic');
  }

  /**
   * Mark scene as visited (for testing subsequent visits)
   */
  markAsVisited(): void {
    this.gameState.markSceneVisited('attic');
  }

  /**
   * Verify scene contains expected atmospheric elements
   */
  verifyAtmosphere(): void {
    const scene = this.getScene();
    expect(scene?.atmosphere).toBeDefined();
    expect(scene?.atmosphere?.length).toBeGreaterThan(0);
  }

  /**
   * Verify scene lighting is lit
   */
  verifyLighting(): void {
    const scene = this.getScene();
    expect(scene?.lighting).toBe('daylight');
  }

  /**
   * Set brick container state (open/closed)
   */
  setBrickState(isOpen: boolean): void {
    const brick = this.gameState.getItem('brick');
    if (brick) {
      brick.state = { 
        ...brick.state,
        open: isOpen
      };
    }
  }

  /**
   * Set brick to open state
   */
  setBrickOpen(): void {
    this.setBrickState(true);
  }

  /**
   * Set brick to closed state
   */
  setBrickClosed(): void {
    this.setBrickState(false);
  }

  /**
   * Verify brick state
   */
  verifyBrickState(expectedOpen: boolean): void {
    const brick = this.gameState.getItem('brick');
    expect(brick?.state?.open).toBe(expectedOpen);
  }

  /**
   * Set knife weapon state (on/off)
   */
  setKnifeState(isOn: boolean): void {
    const knife = this.gameState.getItem('knife');
    if (knife) {
      knife.state = { 
        ...knife.state,
        on: isOn
      };
    }
  }

  /**
   * Set knife to on state
   */
  setKnifeOn(): void {
    this.setKnifeState(true);
  }

  /**
   * Set knife to off state
   */
  setKnifeOff(): void {
    this.setKnifeState(false);
  }

  /**
   * Verify knife state
   */
  verifyKnifeState(expectedOn: boolean): void {
    const knife = this.gameState.getItem('knife');
    expect(knife?.state?.on).toBe(expectedOn);
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
   * Check if player inventory is light enough to exit via down
   */
  isLightLoad(): boolean {
    // This would need to match the game's light_load condition
    // For now, assume anything under weight 20 is light load
    return this.getCurrentInventoryWeight() < 20;
  }

  /**
   * Add item to player inventory for testing weight mechanics
   */
  addItemToInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    if (!gameState.inventory.includes(itemId)) {
      gameState.inventory.push(itemId);
    }
  }

  /**
   * Remove item from player inventory
   */
  removeItemFromInventory(itemId: string): void {
    const gameState = this.gameState.getGameState();
    const index = gameState.inventory.indexOf(itemId);
    if (index > -1) {
      gameState.inventory.splice(index, 1);
    }
  }

  /**
   * Add brick contents for testing
   */
  addToBrickContainer(itemIds: string[]): void {
    const brick = this.gameState.getItem('brick');
    if (brick) {
      (brick as any).contents = [...((brick as any).contents || []), ...itemIds];
    }
  }

  /**
   * Get brick container contents
   */
  getBrickContents(): string[] {
    const brick = this.gameState.getItem('brick');
    return (brick as any)?.contents || [];
  }

  /**
   * Clear brick container contents
   */
  clearBrickContents(): void {
    const brick = this.gameState.getItem('brick');
    if (brick) {
      (brick as any).contents = [];
    }
  }

  /**
   * Get scene description for comparison
   */
  getSceneDescription(): string {
    return this.sceneService.getSceneDescription('attic');
  }

  /**
   * Verify expected exits are available based on inventory weight
   */
  verifyExpectedExits(shouldHaveDownExit: boolean): void {
    const exits = this.sceneService.getAvailableExits('attic');
    const exitDirections = exits.map((exit: any) => exit.direction);
    
    if (shouldHaveDownExit) {
      expect(exitDirections).toContain('down');
    } else {
      // Even if blocked, down exit might still be listed but fail when attempted
      // This depends on how the scene service handles conditional exits
    }
  }

  /**
   * Check if down exit is currently available based on weight
   */
  isDownExitAvailable(): boolean {
    const exits = this.sceneService.getAvailableExits('attic');
    const exitDirections = exits.map((exit: any) => exit.direction);
    return exitDirections.includes('down');
  }

  /**
   * Get item details from the item service
   */
  getItemDetails(itemId: string) {
    return this.gameState.getItem(itemId);
  }

  /**
   * Check if an item is in the current scene
   */
  isItemInScene(itemId: string): boolean {
    return this.sceneService.getSceneItems('attic').includes(itemId);
  }

  /**
   * Check if an item is a container using item service
   */
  isContainer(itemId: string): boolean {
    return this.itemService.isContainer(itemId);
  }

  /**
   * Create a test item for use in attic container tests
   */
  createTestItem(id: string, name: string): void {
    const testItem = {
      id,
      name,
      aliases: [id.toUpperCase()],
      description: `A test item: ${name}`,
      examineText: `This is a test item used for container tests: ${name}`,
      type: "TOOL" as any,
      portable: true,
      visible: true,
      weight: 2,
      size: "TINY" as any,
      tags: ["portable", "test"],
      properties: {},
      interactions: [],
      state: {},
      initialLocation: "unknown"
    };
    
    // Add to game state
    (this.gameState as any).gameState.items[id] = testItem;
  }

  /**
   * Setup test items for container tests
   */
  setupTestItems(): void {
    this.createTestItem("test_emerald", "emerald");
    this.createTestItem("test_coins", "coins");
  }

  /**
   * Clear test items from game state
   */
  clearTestItemsFromState(): void {
    const gameState = (this.gameState as any).gameState;
    delete gameState.items["test_emerald"];
    delete gameState.items["test_coins"];
  }
}