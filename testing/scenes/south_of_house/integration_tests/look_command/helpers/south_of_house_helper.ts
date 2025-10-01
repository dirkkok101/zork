/**
 * SouthOfHouseHelper - Scene Test Helper
 * Auto-generated scene helper for South of House
 *
 * This helper provides utilities for testing the south_of_house scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class SouthOfHouseHelper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the south_of_house scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('south_of_house');
  }

  /**
   * Verify the player is in south_of_house
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('south_of_house');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('south_of_house');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('south_of_house', { visited: false });

  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('south_of_house');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('south_of_house', { visited: true });
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
    const exits = this.sceneService.getAvailableExits('south_of_house');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('west');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('south');
  }
}
