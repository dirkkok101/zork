/**
 * Forest2Helper - Scene Test Helper
 * Auto-generated scene helper for Forest
 *
 * This helper provides utilities for testing the forest_2 scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class Forest2Helper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the forest_2 scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('forest_2');
  }

  /**
   * Verify the player is in forest_2
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('forest_2');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('forest_2');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('forest_2', { visited: false });

  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('forest_2');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('forest_2', { visited: true });
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
    const exits = this.sceneService.getAvailableExits('forest_2');
    const exitDirections = exits.map((exit: any) => exit.direction);

    expect(exitDirections).toContain('north');
    expect(exitDirections).toContain('east');
    expect(exitDirections).toContain('south');
    expect(exitDirections).toContain('west');
  }
}
