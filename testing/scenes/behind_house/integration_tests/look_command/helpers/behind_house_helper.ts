/**
 * Behind House Scene Test Helper
 * Provides utilities specific to testing the behind_house scene
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Item, ItemType } from '@/types/ItemTypes';
import { Scene } from '@/types/SceneTypes';

export class BehindHouseHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the behind_house scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('behind_house');
  }

  /**
   * Verify the player is in behind_house
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('behind_house');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('behind_house');
    
    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('behind_house', { visited: false });
    
    // Clear any existing runtime scene items first
    const currentSceneItems = this.sceneService.getSceneItems('behind_house');
    currentSceneItems.forEach(itemId => {
      this.sceneService.removeItemFromScene('behind_house', itemId);
    });
    
    // Restore authentic Zork items to the scene using SceneService
    const authenticItems = ['windo'];
    authenticItems.forEach(itemId => {
      this.sceneService.addItemToScene('behind_house', itemId);
    });
    
    // Also set the scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'windo', visible: true }
      ];
    }
    
    // Reset window state to closed (default state)
    this.setWindowClosed();
  }

  /**
   * Set the window to open state (enables kitchen access)
   */
  setWindowOpen(): void {
    this.gameState.setFlag('door_windo_open', true);
  }

  /**
   * Set the window to closed state (blocks kitchen access)
   */
  setWindowClosed(): void {
    this.gameState.setFlag('door_windo_open', false);
  }

  /**
   * Check if the window is currently open
   */
  isWindowOpen(): boolean {
    return this.gameState.getFlag('door_windo_open') === true;
  }

  /**
   * Verify kitchen access is available (window open)
   */
  verifyKitchenAccessAvailable(): void {
    const exits = this.sceneService.getAvailableExits('behind_house');
    const exitDirections = exits.map((exit: any) => exit.direction);
    
    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('in');
    expect(this.isWindowOpen()).toBe(true);
  }

  /**
   * Verify kitchen access is blocked (window closed)
   */
  verifyKitchenAccessBlocked(): void {
    // West and In exits may still be present but should fail when attempted
    expect(this.isWindowOpen()).toBe(false);
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
      currentLocation: 'behind_house',
      state: itemData.state || {},
      flags: itemData.flags || {},
      ...itemData
    };

    // Add item to game state items collection
    const gameState = this.gameState.getGameState();
    gameState.items[itemId] = defaultItem;
    
    // Add item to scene
    this.sceneService.addItemToScene('behind_house', itemId);
  }

  /**
   * Verify expected exits are available (without window condition check)
   */
  verifyExpectedExits(): void {
    const exits = this.sceneService.getAvailableExits('behind_house');
    const exitDirections = exits.map((exit: any) => exit.direction);
    
    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('east');
    // west and in depend on window state
  }

  /**
   * Get scene description for comparison
   */
  getSceneDescription(): string {
    return this.sceneService.getSceneDescription('behind_house');
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('behind_house');
  }

  /**
   * Mark scene as visited (for testing subsequent visits)
   */
  markAsVisited(): void {
    this.gameState.markSceneVisited('behind_house');
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('behind_house');
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
        this.sceneService.removeItemFromScene('behind_house', itemId);
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
   * Verify scene lighting is daylight
   */
  verifyLighting(): void {
    const scene = this.getScene();
    expect(scene?.lighting).toBe('daylight');
  }

  /**
   * Get the window item for testing
   */
  getWindow(): Item | undefined {
    return this.gameState.getItem('windo');
  }

  /**
   * Verify window item properties
   */
  verifyWindowProperties(): void {
    const window = this.getWindow();
    expect(window).toBeDefined();
    expect(window?.type).toBe(ItemType.TOOL);
    expect(window?.portable).toBe(false);
    expect(window?.visible).toBe(true);
    expect(window?.tags).toContain('door');
  }
}