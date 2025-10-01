import { IGameStateService } from './interfaces/IGameStateService';
import { GameState, createInitialGameState } from '../types/GameState';
import { Item } from '../types/ItemTypes';
import { Scene } from '../types/SceneTypes';
import { Monster } from '../types/Monster';
import log from 'loglevel';

/**
 * Game State Service
 * Manages the core game state including player location, scores, flags, and data access
 */
export class GameStateService implements IGameStateService {
  private gameState: GameState;
  private logger: log.Logger;

  constructor(startingSceneId: string = 'west_of_house', logger?: log.Logger) {
    this.gameState = createInitialGameState(startingSceneId);
    this.logger = logger || log.getLogger('GameStateService');
    this.logger.debug(`GameStateService initialized with starting scene: ${startingSceneId}`);
  }

  /**
   * Load game data into the state
   * Called during initialization to populate items, scenes, and monsters
   */
  loadGameData(items: Record<string, Item>, scenes: Record<string, Scene>, monsters: Record<string, Monster>): void {
    this.gameState.items = items;
    this.gameState.scenes = scenes;
    this.gameState.monsters = monsters;
    this.logger.info(`Game data loaded: ${Object.keys(items).length} items, ${Object.keys(scenes).length} scenes, ${Object.keys(monsters).length} monsters`);
  }

  // Location Management
  getCurrentScene(): string {
    return this.gameState.currentSceneId;
  }

  setCurrentScene(sceneId: string): void {
    this.logger.debug(`Moving player from ${this.gameState.currentSceneId} to ${sceneId}`);
    this.gameState.currentSceneId = sceneId;
  }

  // Flag Management
  getFlag(name: string): boolean {
    return this.gameState.flags[name] || false;
  }

  hasFlag(name: string): boolean {
    return name in this.gameState.flags;
  }

  setFlag(name: string, value: boolean): void {
    this.logger.debug(`Setting flag ${name} to ${value}`);
    this.gameState.flags[name] = value;
  }

  // Score Management
  getScore(): number {
    return this.gameState.score;
  }

  addScore(points: number): void {
    this.gameState.score += points;
    this.logger.debug(`Score changed by ${points}, new score: ${this.gameState.score}`);
  }

  incrementMoves(): void {
    this.gameState.moves = (this.gameState.moves || 0) + 1;
    this.logger.debug(`Move counter incremented to: ${this.gameState.moves}`);
  }

  // Game Lifecycle
  isGameOver(): boolean {
    return this.getFlag('gameOver') || false;
  }

  endGame(reason: string): void {
    this.logger.info(`Game ended: ${reason}`);
    this.setFlag('gameOver', true);
    this.setFlag('gameEndReason', reason as any); // Store as any for simplicity
  }

  // Data Access
  getItem(id: string): Item | undefined {
    return this.gameState.items[id];
  }

  getScene(id: string): Scene | undefined {
    return this.gameState.scenes[id];
  }

  getMonster(id: string): Monster | undefined {
    return this.gameState.monsters[id];
  }

  // State Modification
  updateItemState(id: string, updates: Partial<Item>): void {
    const item = this.gameState.items[id];
    if (item) {
      Object.assign(item, updates);
      this.logger.debug(`Updated item ${id} state`);
    } else {
      this.logger.warn(`Attempted to update non-existent item: ${id}`);
    }
  }

  updateSceneState(id: string, updates: Partial<Scene>): void {
    const scene = this.gameState.scenes[id];
    if (scene) {
      Object.assign(scene, updates);
      this.logger.debug(`Updated scene ${id} state`);
    } else {
      this.logger.warn(`Attempted to update non-existent scene: ${id}`);
    }
  }

  updateMonsterState(id: string, updates: Partial<Monster>): void {
    const monster = this.gameState.monsters[id];
    if (monster) {
      Object.assign(monster, updates);
      this.logger.debug(`Updated monster ${id} state`);
    } else {
      this.logger.warn(`Attempted to update non-existent monster: ${id}`);
    }
  }

  // Scene State Management
  hasVisitedScene(sceneId: string): boolean {
    return this.gameState.sceneStates[sceneId]?.visited || false;
  }

  markSceneVisited(sceneId: string): void {
    if (!this.gameState.sceneStates[sceneId]) {
      this.gameState.sceneStates[sceneId] = {
        visited: false,
        items: [],
        variables: {}
      };
    }
    this.gameState.sceneStates[sceneId].visited = true;
    this.logger.debug(`Marked scene ${sceneId} as visited`);
  }

  getSceneState(sceneId: string): Record<string, any> {
    if (!this.gameState.sceneStates[sceneId]) {
      this.gameState.sceneStates[sceneId] = {
        visited: false,
        items: [],
        variables: {}
      };
    }
    return this.gameState.sceneStates[sceneId].variables;
  }

  updateSceneRuntimeState(sceneId: string, updates: Record<string, any>): void {
    if (!this.gameState.sceneStates[sceneId]) {
      this.gameState.sceneStates[sceneId] = {
        visited: false,
        items: [],
        variables: {}
      };
    }
    // Update the scene state properties, not just variables
    Object.assign(this.gameState.sceneStates[sceneId], updates);
    this.logger.debug(`Updated runtime state for scene ${sceneId}`);
  }

  /**
   * Get the complete game state (for persistence)
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Set the complete game state (for restoration)
   */
  setGameState(gameState: GameState): void {
    this.gameState = gameState;
    this.logger.info('Game state restored');
  }
}