/**
 * KitchenHelper - Scene Test Helper
 * Auto-generated scene helper for Kitchen
 *
 * This helper provides utilities for testing the kitchen scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
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

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('kitchen');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('kitchen', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['windo', 'sbag', 'bottl'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('kitchen', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'windo', visible: true },
        { itemId: 'sbag', visible: true },
        { itemId: 'bottl', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('kitchen');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('kitchen', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('kitchen');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['windo', 'sbag', 'bottl'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('kitchen', itemId);
      }
    });
  }

  /**
   * Verify scene has atmospheric messages
   */
  verifyAtmosphere(): void {
    const scene = this.getScene();
    expect(scene?.atmosphere).toBeDefined();
    expect(scene?.atmosphere?.length).toBeGreaterThan(0);
  }

  /**
   * Verify scene lighting
   */
  verifyLighting(): void {
    const scene = this.getScene();
    expect(scene?.lighting).toBe('daylight');
  }

  /**
   * Verify expected exits are available
   */
  verifyExpectedExits(): void {
    const exits = this.sceneService.getAvailableExits('kitchen');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('up');
  }
}
