/**
 * Kitchen Scene Test Helper
 * Provides utilities specific to testing the kitchen scene
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Item, ItemType } from '@/types/ItemTypes';
import { Scene } from '@/types/SceneTypes';

export class KitchenHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the kitchen scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('kitchen');
  }

  /**
   * Verify the player is in kitchen
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('kitchen');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('kitchen');
    
    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('kitchen', { visited: false });
    
    // Clear any existing runtime scene items first
    const currentSceneItems = this.sceneService.getSceneItems('kitchen');
    currentSceneItems.forEach(itemId => {
      this.sceneService.removeItemFromScene('kitchen', itemId);
    });
    
    // Restore authentic Zork items to the scene using SceneService
    const authenticItems = ['windo', 'sbag', 'bottl'];
    authenticItems.forEach(itemId => {
      this.sceneService.addItemToScene('kitchen', itemId);
    });
    
    // Also set the scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'windo', visible: true },
        { itemId: 'sbag', visible: true },
        { itemId: 'bottl', visible: true }
      ];
    }
    
    // Reset window state - initially closed
    this.gameState.setFlag('door_windo_open', false);
    const window = this.gameState.getItem('windo');
    if (window) {
      window.state = { 
        isOpen: false
      };
    }
    
    // Reset sack state - initially closed
    const sack = this.gameState.getItem('sbag');
    if (sack) {
      sack.state = { 
        isOpen: false
      };
      // Set container contents (hot pepper sandwich/lunch and garlic)
      (sack as any).contents = ['food', 'garli'];
    }
    
    // Reset bottle state - initially closed with water
    const bottle = this.gameState.getItem('bottl');
    if (bottle) {
      bottle.state = { 
        isOpen: false
      };
      // Set container contents
      (bottle as any).contents = ['water'];
    }
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
      currentLocation: 'kitchen',
      state: itemData.state || {},
      flags: itemData.flags || {},
      ...itemData
    };

    // Add item to game state items collection
    const gameState = this.gameState.getGameState();
    gameState.items[itemId] = defaultItem;
    
    // Add item to scene
    this.sceneService.addItemToScene('kitchen', itemId);
  }

  /**
   * Verify expected exits are available
   */
  verifyExpectedExits(): void {
    const exits = this.sceneService.getAvailableExits('kitchen');
    const exitDirections = exits.map((exit: any) => exit.direction);
    
    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('up');
    // Note: east/out depends on window state
  }

  /**
   * Get scene description for comparison
   */
  getSceneDescription(): string {
    return this.sceneService.getSceneDescription('kitchen');
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('kitchen');
  }

  /**
   * Mark scene as visited (for testing subsequent visits)
   */
  markAsVisited(): void {
    this.gameState.markSceneVisited('kitchen');
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('kitchen');
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
        this.sceneService.removeItemFromScene('kitchen', itemId);
      });
    }
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
    expect(scene?.lighting).toBe('lit');
  }

  /**
   * Set window state (open/closed)
   */
  setWindowState(isOpen: boolean): void {
    this.gameState.setFlag('door_windo_open', isOpen);
    const window = this.gameState.getItem('windo');
    if (window) {
      window.state = { isOpen };
    }
  }

  /**
   * Set sack state (open/closed)
   */
  setSackState(isOpen: boolean): void {
    const sack = this.gameState.getItem('sbag');
    if (sack) {
      sack.state = { 
        ...sack.state,
        isOpen
      };
    }
  }

  /**
   * Set bottle state (open/closed)
   */
  setBottleState(isOpen: boolean): void {
    const bottle = this.gameState.getItem('bottl');
    if (bottle) {
      bottle.state = { 
        ...bottle.state,
        isOpen
      };
    }
  }

  /**
   * Verify window state
   */
  verifyWindowState(expectedOpen: boolean): void {
    const flagState = this.gameState.getFlag('door_windo_open');
    expect(flagState).toBe(expectedOpen);
    
    const window = this.gameState.getItem('windo');
    expect(window?.state?.isOpen).toBe(expectedOpen);
  }

  /**
   * Verify sack state
   */
  verifySackState(expectedOpen: boolean): void {
    const sack = this.gameState.getItem('sbag');
    expect(sack?.state?.isOpen).toBe(expectedOpen);
  }

  /**
   * Verify bottle state
   */
  verifyBottleState(expectedOpen: boolean): void {
    const bottle = this.gameState.getItem('bottl');
    expect(bottle?.state?.isOpen).toBe(expectedOpen);
  }

  /**
   * Check if east/out exit is available (depends on window state)
   */
  isEastExitAvailable(): boolean {
    const exits = this.sceneService.getAvailableExits('kitchen');
    const exitDirections = exits.map((exit: any) => exit.direction);
    return exitDirections.includes('east') || exitDirections.includes('out');
  }

  /**
   * Check if window is open (specific method for tests)
   */
  isWindowOpen(): boolean {
    return this.gameState.getFlag('door_windo_open') === true;
  }

  /**
   * Set window to closed state (specific method for tests)
   */
  setWindowClosed(): void {
    this.setWindowState(false);
  }

  /**
   * Set window to open state (specific method for tests)
   */
  setWindowOpen(): void {
    this.setWindowState(true);
  }

  /**
   * Set sack to open state (specific method for tests)
   */
  setSackOpen(): void {
    this.setSackState(true);
  }

  /**
   * Set sack to closed state (specific method for tests)
   */
  setSackClosed(): void {
    this.setSackState(false);
  }

  /**
   * Set bottle to open state (specific method for tests)
   */
  setBottleOpen(): void {
    this.setBottleState(true);
  }

  /**
   * Set bottle to closed state (specific method for tests)
   */
  setBottleClosed(): void {
    this.setBottleState(false);
  }

  /**
   * Add a container to the scene with specified properties (from west_of_house pattern)
   */
  addContainerToScene(containerId: string, options: {
    name?: string;
    isOpen?: boolean;
    isLocked?: boolean;
    contents?: string[];
  } = {}): void {
    const containerData: Partial<Item> = {
      name: options.name || 'Test Container',
      type: ItemType.CONTAINER,
      portable: false,
      state: {
        isOpen: options.isOpen ?? false,
        isLocked: options.isLocked ?? false
      }
    };
    
    this.addItemToScene(containerId, containerData);
    
    // Set container contents separately using any type to bypass TypeScript
    if (options.contents) {
      const item = this.gameState.getItem(containerId);
      if (item) {
        (item as any).contents = options.contents;
      }
    }
  }
}