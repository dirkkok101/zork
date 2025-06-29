import { ISceneService } from './interfaces/ISceneService';
import { IGameStateService } from './interfaces/IGameStateService';
import { Exit, SceneItem } from '../types/SceneTypes';
import log from 'loglevel';

/**
 * Scene Service
 * Manages scene descriptions, navigation, and scene-related operations
 */
export class SceneService implements ISceneService {
  private logger: log.Logger;

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('SceneService');
  }

  /**
   * Get the complete scene description with current conditions
   */
  getSceneDescription(sceneId: string): string {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Scene not found: ${sceneId}`);
      return "You are in an unknown location.";
    }

    let description = scene.title;

    // Use first visit description if this is the first time here
    if (!this.gameState.hasVisitedScene(sceneId) && scene.firstVisitDescription) {
      description += '\n' + scene.firstVisitDescription;
    } else {
      description += '\n' + scene.description;
    }

    // Mark scene as visited
    this.gameState.markSceneVisited(sceneId);

    return description;
  }

  /**
   * Get visible items in the scene based on current conditions
   */
  getVisibleItems(sceneId: string): SceneItem[] {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Scene not found: ${sceneId}`);
      return [];
    }

    return scene.items.filter(sceneItem => {
      // Check if item is visible
      if (!sceneItem.visible) {
        return false;
      }

      // Check item condition if it exists
      if (sceneItem.condition) {
        return this.checkCondition(sceneItem.condition);
      }

      return true;
    });
  }

  /**
   * Get available exits based on current conditions
   */
  getAvailableExits(sceneId: string): Exit[] {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Scene not found: ${sceneId}`);
      return [];
    }

    return scene.exits.filter(exit => {
      // Check if exit is hidden
      if (exit.hidden) {
        return false;
      }

      // Check exit condition if it exists
      if (exit.condition) {
        return this.checkCondition(exit.condition);
      }

      return true;
    });
  }

  /**
   * Get all items currently in the scene (for finding items)
   */
  getSceneItems(sceneId: string): string[] {
    const visibleItems = this.getVisibleItems(sceneId);
    return visibleItems.map(sceneItem => sceneItem.itemId);
  }

  /**
   * Add an item to the scene
   */
  addItemToScene(sceneId: string, itemId: string): void {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Cannot add item to non-existent scene: ${sceneId}`);
      return;
    }

    // Get item's visibility from item data
    const item = this.gameState.getItem(itemId);
    const visible = item?.visible ?? true;

    // Add scene item with item's visibility
    const sceneItem: SceneItem = {
      itemId,
      visible
    };

    scene.items.push(sceneItem);
    this.logger.debug(`Added item ${itemId} to scene ${sceneId} (visible: ${visible})`);
  }

  /**
   * Remove an item from the scene
   */
  removeItemFromScene(sceneId: string, itemId: string): void {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Cannot remove item from non-existent scene: ${sceneId}`);
      return;
    }

    const initialLength = scene.items.length;
    scene.items = scene.items.filter(sceneItem => sceneItem.itemId !== itemId);
    
    if (scene.items.length < initialLength) {
      this.logger.debug(`Removed item ${itemId} from scene ${sceneId}`);
    } else {
      this.logger.debug(`Item ${itemId} was not found in scene ${sceneId}`);
    }
  }

  /**
   * Check if movement to a direction is valid
   */
  canMoveTo(fromScene: string, direction: string): boolean {
    const availableExits = this.getAvailableExits(fromScene);
    const exit = availableExits.find(e => 
      e.direction.toLowerCase() === direction.toLowerCase() ||
      (direction.toLowerCase().length <= e.direction.toLowerCase().length && 
       e.direction.toLowerCase().startsWith(direction.toLowerCase()))
    );

    if (!exit) {
      return false;
    }

    // Check if exit is locked
    if (exit.locked) {
      return false;
    }

    return true;
  }

  /**
   * Execute movement in a direction
   */
  moveTo(direction: string): string {
    const currentSceneId = this.gameState.getCurrentScene();
    const availableExits = this.getAvailableExits(currentSceneId);
    
    const exit = availableExits.find(e => 
      e.direction.toLowerCase() === direction.toLowerCase() ||
      (direction.toLowerCase().length <= e.direction.toLowerCase().length && 
       e.direction.toLowerCase().startsWith(direction.toLowerCase()))
    );

    if (!exit) {
      throw new Error(`No exit in direction: ${direction}`);
    }

    if (exit.locked) {
      throw new Error(`The exit to the ${direction} is locked.`);
    }

    // Move to the new scene
    this.gameState.setCurrentScene(exit.to);
    this.logger.debug(`Player moved from ${currentSceneId} to ${exit.to} via ${direction}`);
    
    return exit.to;
  }

  /**
   * Check if the player can enter a scene
   */
  canEnterScene(sceneId: string): boolean {
    // Basic implementation - can be extended with specific entry conditions
    const scene = this.gameState.getScene(sceneId);
    return scene !== undefined;
  }

  /**
   * Handle scene entry logic
   */
  enterScene(sceneId: string): void {
    const scene = this.gameState.getScene(sceneId);
    if (!scene) {
      this.logger.warn(`Cannot enter non-existent scene: ${sceneId}`);
      return;
    }

    // Execute entry actions if any
    if (scene.entryActions) {
      for (const action of scene.entryActions) {
        if (action.condition && !this.checkCondition(action.condition)) {
          continue;
        }

        // For now, just log that an action would be executed
        // Full action execution would require more complex integration
        this.logger.debug(`Entry action triggered for scene ${sceneId}: ${action.message || 'unnamed action'}`);
      }
    }

    this.logger.debug(`Player entered scene: ${sceneId}`);
  }

  /**
   * Handle scene exit logic
   */
  exitScene(sceneId: string): void {
    // Basic implementation - can be extended with specific exit logic
    this.logger.debug(`Player exited scene: ${sceneId}`);
  }

  /**
   * Check if a condition (flag or flags) is met
   */
  private checkCondition(condition: string | string[]): boolean {
    if (typeof condition === 'string') {
      return this.gameState.getFlag(condition);
    }

    if (Array.isArray(condition)) {
      // All conditions must be true
      return condition.every(flag => this.gameState.getFlag(flag));
    }

    return false;
  }
}