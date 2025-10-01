export const helperTemplate = `/**
 * {{className}}Helper - Scene Test Helper
 * Auto-generated scene helper for {{title}}
 *
 * This helper provides utilities for testing the {{id}} scene.
 */

import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { Scene } from '@/types/SceneTypes';

export class {{className}}Helper {
  private gameState: GameStateService;
  private sceneService: SceneService;

  constructor(gameState: GameStateService, sceneService: SceneService) {
    this.gameState = gameState;
    this.sceneService = sceneService;
  }

  /**
   * Get the {{id}} scene data
   */
  getScene(): Scene | undefined {
    return this.gameState.getScene('{{id}}');
  }

  /**
   * Verify the player is in {{id}}
   */
  verifyPlayerInScene(): void {
    expect(this.gameState.getCurrentScene()).toBe('{{id}}');
  }

  /**
   * Reset the scene to initial state
   */
  resetScene(): void {
    this.gameState.setCurrentScene('{{id}}');

    // Clear visited flag to test first visit behavior
    this.gameState.updateSceneRuntimeState('{{id}}', { visited: false });

{{#if hasItems}}
    // Clear existing runtime scene items
    const currentSceneItems = this.sceneService.getSceneItems('{{id}}');
    currentSceneItems.forEach((itemId: string) => {
      this.sceneService.removeItemFromScene('{{id}}', itemId);
    });

    // Restore authentic items from scene data
    const authenticItems = [{{#each items}}'{{this.id}}'{{#unless @last}}, {{/unless}}{{/each}}];
    authenticItems.forEach((itemId: string) => {
      this.sceneService.addItemToScene('{{id}}', itemId);
    });

    // Update scene.items for backwards compatibility
    const scene = this.getScene();
    if (scene) {
      scene.items = [
{{#each items}}
        { itemId: '{{this.id}}', visible: true }{{#unless @last}},{{/unless}}
{{/each}}
      ];
    }
{{/if}}
  }

  /**
   * Check if this is the first visit to the scene
   */
  isFirstVisit(): boolean {
    return !this.gameState.hasVisitedScene('{{id}}');
  }

  /**
   * Mark the scene as visited
   */
  markAsVisited(): void {
    this.gameState.updateSceneRuntimeState('{{id}}', { visited: true });
  }

{{#if hasItems}}
  /**
   * Get items currently in the scene
   */
  getSceneItems(): string[] {
    return this.sceneService.getSceneItems('{{id}}');
  }

  /**
   * Clear all test items from the scene
   */
  clearTestItems(): void {
    const sceneItems = this.getSceneItems();
    const authenticItems = [{{#each items}}'{{this.id}}'{{#unless @last}}, {{/unless}}{{/each}}];

    sceneItems.forEach((itemId: string) => {
      if (!authenticItems.includes(itemId)) {
        this.sceneService.removeItemFromScene('{{id}}', itemId);
      }
    });
  }
{{/if}}

{{#if hasAtmosphere}}
  /**
   * Verify scene has atmospheric messages
   */
  verifyAtmosphere(): void {
    const scene = this.getScene();
    expect(scene?.atmosphere).toBeDefined();
    expect(scene?.atmosphere?.length).toBeGreaterThan(0);
  }
{{/if}}

  /**
   * Verify scene lighting
   */
  verifyLighting(): void {
    const scene = this.getScene();
    expect(scene?.lighting).toBe('{{lighting}}');
  }

{{#if exits.simple}}
  /**
   * Verify expected exits are available
   */
  verifyExpectedExits(): void {
    const exits = this.sceneService.getAvailableExits('{{id}}');
    const exitDirections = exits.map((exit: any) => exit.direction);

{{#each exits.simple}}
    expect(exitDirections).toContain('{{this.direction}}');
{{/each}}
  }
{{/if}}
}
`;
