/**
 * LivingRoomHelper - Scene Test Helper
 * Auto-generated scene helper for Living Room
 *
 * This helper provides utilities for testing the living_room scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class LivingRoomHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the living_room scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('living_room');
  }

  /**
   * Verify the player is in living_room
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('living_room');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('living_room');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('living_room', { visited: false });

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('living_room');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('living_room', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['wdoor', 'door', 'tcase', 'lamp', 'rug', 'paper', 'sword'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('living_room', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'wdoor', visible: true },
        { itemId: 'door', visible: true },
        { itemId: 'tcase', visible: true },
        { itemId: 'lamp', visible: true },
        { itemId: 'rug', visible: true },
        { itemId: 'paper', visible: true },
        { itemId: 'sword', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('living_room');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('living_room', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('living_room');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['wdoor', 'door', 'tcase', 'lamp', 'rug', 'paper', 'sword'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('living_room', itemId);
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
