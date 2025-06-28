/**
 * Monster Movement Service Interface
 * 
 * Responsible for monster movement mechanics including pathfinding,
 * movement patterns, and movement validation.
 * 
 * @interface IMonsterMovementService
 */

import { MovementPattern } from '../../types/MonsterTypes';

export interface MovementResult {
  /** Whether the movement was successful */
  success: boolean;
  /** New scene ID if movement succeeded */
  newSceneId?: string;
  /** Message describing the movement */
  message: string;
  /** Whether player should be notified */
  notifyPlayer: boolean;
}

export interface MovementDecision {
  /** Target scene ID to move to */
  targetSceneId: string | null;
  /** Reason for the movement decision */
  reason: string;
  /** Priority of this movement (higher = more urgent) */
  priority: number;
}

export interface IMonsterMovementService {
  /**
   * Move a monster to a new scene
   * @param monsterId Monster to move
   * @param targetSceneId Destination scene
   * @returns Movement result
   */
  moveMonster(monsterId: string, targetSceneId: string): MovementResult;

  /**
   * Calculate next movement based on pattern
   * @param monsterId Monster ID
   * @param pattern Movement pattern to use
   * @returns Movement decision with target scene
   */
  calculateMovement(monsterId: string, pattern: MovementPattern): MovementDecision;

  /**
   * Check if movement to a scene is allowed
   * @param monsterId Monster ID
   * @param targetSceneId Target scene ID
   * @returns true if movement is allowed
   */
  isMovementAllowed(monsterId: string, targetSceneId: string): boolean;

  /**
   * Handle demon-based movement (from MDL)
   * @param monsterId Monster ID
   * @param demonName Movement demon name (e.g., ROBBER-DEMON)
   * @returns Movement result
   */
  handleDemonMovement(monsterId: string, demonName: string): MovementResult;

  /**
   * Get valid exits from current monster location
   * @param monsterId Monster ID
   * @returns Array of valid scene IDs
   */
  getValidExits(monsterId: string): string[];

  /**
   * Calculate path to target scene
   * @param monsterId Monster ID
   * @param targetSceneId Target scene ID
   * @returns Array of scene IDs forming path, or empty if no path
   */
  calculatePath(monsterId: string, targetSceneId: string): string[];

  /**
   * Check if monster can reach a scene
   * @param monsterId Monster ID
   * @param targetSceneId Target scene ID
   * @returns true if reachable
   */
  canReachScene(monsterId: string, targetSceneId: string): boolean;

  /**
   * Handle flee movement (away from threat)
   * @param monsterId Monster ID
   * @param threatSceneId Scene to flee from
   * @returns Movement result
   */
  fleeFromScene(monsterId: string, threatSceneId: string): MovementResult;

  /**
   * Handle follow movement (toward target)
   * @param monsterId Monster ID
   * @param targetSceneId Scene to move toward
   * @returns Movement result
   */
  followToScene(monsterId: string, targetSceneId: string): MovementResult;

  /**
   * Execute patrol pattern
   * @param monsterId Monster ID
   * @param patrolRoute Array of scene IDs
   * @returns Movement result
   */
  executePatrol(monsterId: string, patrolRoute: string[]): MovementResult;

  /**
   * Get movement message for player notification
   * @param monsterId Monster ID
   * @param fromSceneId Origin scene
   * @param toSceneId Destination scene
   * @param playerSceneId Player's current scene
   * @returns Message or null if player shouldn't see it
   */
  getMovementMessage(
    monsterId: string, 
    fromSceneId: string, 
    toSceneId: string, 
    playerSceneId: string
  ): string | null;
}