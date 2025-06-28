import {Item} from '../../types/ItemTypes';
import {Scene} from '../../types/SceneTypes';
import {Monster} from '../../types/Monster';
import {GameState} from '../../types/GameState';

/**
 * Manages core game state including player location, flags, scoring, game lifecycle, and data access.
 * 
 * This service is the central authority for:
 * - Player's current location in the game world
 * - Global boolean flags that affect game behavior
 * - Score tracking and progression
 * - Game termination conditions
 * - Data access to loaded game items, scenes, and monsters
 * - State modifications to game data
 * 
 * Boundaries:
 * - Does NOT handle business logic for items/scenes/monsters (other services)
 * - Does NOT handle save/restore operations (PersistenceService)
 * - Does NOT handle user interface output (OutputService)
 * - Acts as single source of truth for all game state and data
 */
export interface IGameStateService {
  /** Get the ID of the player's current scene */
  getCurrentScene(): string;
  
  /** Move player to a new scene (updates current location) */
  setCurrentScene(sceneId: string): void;
  
  /** Get the value of a global game flag */
  getFlag(name: string): boolean;
  
  /** Set a global game flag (used for puzzle states, story progression) */
  setFlag(name: string, value: boolean): void;
  
  /** Get the player's current score */
  getScore(): number;
  
  /** Add points to the player's score */
  addScore(points: number): void;
  
  /** Check if the game has ended */
  isGameOver(): boolean;
  
  /** End the game with a specific reason (death, victory, quit) */
  endGame(reason: string): void;
  
  // Data Access Methods
  
  /** Get item data by ID from loaded game data */
  getItem(id: string): Item | undefined;
  
  /** Get scene data by ID from loaded game data */
  getScene(id: string): Scene | undefined;
  
  /** Get monster data by ID from loaded game data */
  getMonster(id: string): Monster | undefined;
  
  // State Modification Methods
  
  /** Update item state properties (for item interactions, state changes) */
  updateItemState(id: string, updates: Partial<Item>): void;
  
  /** Update scene state properties (for scene modifications) */
  updateSceneState(id: string, updates: Partial<Scene>): void;
  
  /** Update monster state properties (for monster state changes) */
  updateMonsterState(id: string, updates: Partial<Monster>): void;
  
  // Scene State Management
  
  /** Check if a scene has been visited by the player */
  hasVisitedScene(sceneId: string): boolean;
  
  /** Mark a scene as visited */
  markSceneVisited(sceneId: string): void;
  
  /** Get scene-specific runtime state */
  getSceneState(sceneId: string): Record<string, any>;
  
  /** Update scene-specific runtime state */
  updateSceneRuntimeState(sceneId: string, updates: Record<string, any>): void;

  /** Get the complete game state (for persistence) */
  getGameState(): GameState;

  /** Set the complete game state (for restoration) */
  setGameState(gameState: GameState): void;
}
