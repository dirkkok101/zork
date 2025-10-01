/**
 * Forest1Helper - Scene Test Helper
 * Auto-generated scene helper for Forest
 *
 * This helper provides utilities for testing the forest_1 scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class Forest1Helper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the forest_1 scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('forest_1');
  }

  /**
   * Verify the player is in forest_1
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('forest_1');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('forest_1');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('forest_1', { visited: false });

  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('forest_1');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('forest_1', { visited: true });
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
    const exits = this.sceneService.getAvailableExits('forest_1');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('west');
  }
}
