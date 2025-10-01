/**
 * ClearingHelper - Scene Test Helper
 * Auto-generated scene helper for Clearing
 *
 * This helper provides utilities for testing the clearing scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class ClearingHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the clearing scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('clearing');
  }

  /**
   * Verify the player is in clearing
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('clearing');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('clearing');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('clearing', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('clearing');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('clearing', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['grate', 'leave'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('clearing', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'grate', visible: true },
        { itemId: 'leave', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('clearing');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('clearing', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('clearing');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['grate', 'leave'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('clearing', itemId);
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
    const exits = this.sceneService.getAvailableExits('clearing');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('southwest');
    expect(exitDirections).toContain('southeast');
    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('south');
  }
}
