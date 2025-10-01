/**
 * DamHelper - Scene Test Helper
 * Auto-generated scene helper for Dam
 *
 * This helper provides utilities for testing the dam scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class DamHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the dam scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('dam');
  }

  /**
   * Verify the player is in dam
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('dam');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('dam');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('dam', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('dam');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('dam', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['bolt', 'dam', 'bubbl', 'cpanl'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('dam', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'bolt', visible: true },
        { itemId: 'dam', visible: true },
        { itemId: 'bubbl', visible: true },
        { itemId: 'cpanl', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('dam');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('dam', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('dam');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['bolt', 'dam', 'bubbl', 'cpanl'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('dam', itemId);
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
    const exits = this.sceneService.getAvailableExits('dam');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('down');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('north');
  }
}
