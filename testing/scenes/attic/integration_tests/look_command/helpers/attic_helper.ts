/**
 * AtticHelper - Scene Test Helper
 * Auto-generated scene helper for Attic
 *
 * This helper provides utilities for testing the attic scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class AtticHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
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

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('attic');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('attic', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['brick', 'rope', 'knife'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('attic', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'brick', visible: true },
        { itemId: 'rope', visible: true },
        { itemId: 'knife', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('attic');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('attic', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('attic');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['brick', 'rope', 'knife'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('attic', itemId);
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

}
