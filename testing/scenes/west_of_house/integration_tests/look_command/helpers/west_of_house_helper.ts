/**
 * WestOfHouseHelper - Scene Test Helper
 * Auto-generated scene helper for West of House
 *
 * This helper provides utilities for testing the west_of_house scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
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

    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('west_of_house');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('west_of_house', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = ['fdoor', 'mailb', 'mat'];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('west_of_house', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
        { itemId: 'fdoor', visible: true },
        { itemId: 'mailb', visible: true },
        { itemId: 'mat', visible: true }
      ];
    }
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('west_of_house');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('west_of_house', { visited: true });
  }

  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('west_of_house');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = ['fdoor', 'mailb', 'mat'];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('west_of_house', itemId);
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
    const exits = this.sceneService.getAvailableExits('west_of_house');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('west');
  }
}
