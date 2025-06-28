/**
 * West of House Scene Test Helper
 * Provides utilities specific to testing the west_of_house scene
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Item, ItemType } from '@/types/ItemTypes';
import { Scene } from '@/types/SceneTypes';

export class WestOfHouseHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the west_of_house scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('west_of_house');
  }

  /**
   * Verify the player is in west_of_house
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('west_of_house');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('west_of_house');
    
    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('west_of_house', { visited: false });
    
    // Remove any items that might have been added during testing
    const scene = this.getScene();
    if (scene) {
      scene.items = [];
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
      currentLocation: 'west_of_house',
      state: itemData.state || {},
      flags: itemData.flags || {},
      ...itemData
    };

    // Add item to game state items collection
    const gameState = this.gameState.getGameState();
    gameState.items[itemId] = defaultItem;
    
    // Add item to scene
    this.sceneService.addItemToScene('west_of_house', itemId);
  }

  /**
   * Add a test container to the scene
   */
  addContainerToScene(containerId: string, options: {
    name?: string;
    isOpen?: boolean;
    isLocked?: boolean;
    contents?: string[];
  } = {}): void {
    const containerItem: Partial<Item> = {
      id: containerId,
      name: options.name || 'Test Container',
      description: 'A test container.',
      examineText: 'It looks like a test container.',
      type: ItemType.CONTAINER,
      properties: {
        container: true,
        openable: true,
        lockable: options.isLocked !== undefined
      },
      state: {
        isOpen: options.isOpen !== undefined ? options.isOpen : true,
        isLocked: options.isLocked || false,
        contents: options.contents || []
      }
    };

    this.addItemToScene(containerId, containerItem);
  }

  /**
   * Verify expected exits are available
   */
  verifyExpectedExits(): void {
    const exits = this.sceneService.getAvailableExits('west_of_house');
    const exitDirections = exits.map((exit: any) => exit.direction);
    
    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('west');
    // Note: east is blocked, so it might not appear in available exits
  }

  /**
   * Get scene description for comparison
   */
  getSceneDescription(): string {
    return this.sceneService.getSceneDescription('west_of_house');
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('west_of_house');
  }

  /**
   * Mark scene as visited (for testing subsequent visits)
   */
  markAsVisited(): void {
    this.gameState.markSceneVisited('west_of_house');
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('west_of_house');
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
        this.sceneService.removeItemFromScene('west_of_house', itemId);
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
}