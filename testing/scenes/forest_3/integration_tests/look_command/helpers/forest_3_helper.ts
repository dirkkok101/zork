/**
 * Forest3Helper - Scene Test Helper
 * Auto-generated scene helper for Forest
 *
 * This helper provides utilities for testing the forest_3 scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class Forest3Helper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the forest_3 scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('forest_3');
  }

  /**
   * Verify the player is in forest_3
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('forest_3');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('forest_3');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('forest_3', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('forest_3');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('forest_3', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['ftree'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('forest_3', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'ftree', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('forest_3');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('forest_3', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('forest_3');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['ftree'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('forest_3', itemId);
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
    const exits = this.sceneService.getAvailableExits('forest_3');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('up');
    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('west');
  }
}
