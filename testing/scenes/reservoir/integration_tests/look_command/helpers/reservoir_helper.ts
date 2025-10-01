/**
 * ReservoirHelper - Scene Test Helper
 * Auto-generated scene helper for Reservoir
 *
 * This helper provides utilities for testing the reservoir scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class ReservoirHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the reservoir scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('reservoir');
  }

  /**
   * Verify the player is in reservoir
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('reservoir');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('reservoir');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('reservoir', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('reservoir');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('reservoir', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['trunk'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('reservoir', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'trunk', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('reservoir');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('reservoir', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('reservoir');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['trunk'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('reservoir', itemId);
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
    const exits = this.sceneService.getAvailableExits('reservoir');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('up');
  }
}
