/**
 * NorthOfHouseHelper - Scene Test Helper
 * Auto-generated scene helper for North of House
 *
 * This helper provides utilities for testing the north_of_house scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class NorthOfHouseHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the north_of_house scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('north_of_house');
  }

  /**
   * Verify the player is in north_of_house
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('north_of_house');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('north_of_house');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('north_of_house', { visited: false });

  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('north_of_house');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('north_of_house', { visited: true });
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
    const exits = this.sceneService.getAvailableExits('north_of_house');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('north');
  }
}
