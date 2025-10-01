/**
 * BeachHelper - Scene Test Helper
 * Auto-generated scene helper for Sandy Beach
 *
 * This helper provides utilities for testing the beach scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class BeachHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the beach scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('beach');
  }

  /**
   * Verify the player is in beach
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('beach');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('beach');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('beach', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('beach');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('beach', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['statu', 'sand'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('beach', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'statu', visible: true },
        { itemId: 'sand', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('beach');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('beach', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('beach');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['statu', 'sand'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('beach', itemId);
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
    const exits = this.sceneService.getAvailableExits('beach');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('launc');
    expect(exitDirections).toContain('south');
  }
}
