/**
 * Monster AI Service Interface
 * 
 * Responsible for monster decision making, target selection,
 * and action planning based on game state.
 * 
 * @interface IMonsterAIService
 */

import { MonsterState } from '../../types/MonsterTypes';

export interface AIDecision {
  /** Recommended action for the monster */
  action: MonsterAction;
  /** Target for the action (if applicable) */
  targetId?: string;
  /** Priority of this decision (0-10) */
  priority: number;
  /** Reasoning for the decision */
  reason: string;
}

export enum MonsterAction {
  IDLE = 'idle',
  MOVE = 'move',
  ATTACK = 'attack',
  FLEE = 'flee',
  GUARD = 'guard',
  STEAL = 'steal',
  SPECIAL_ABILITY = 'special_ability',
  INTERACT = 'interact',
  PATROL = 'patrol',
  FOLLOW = 'follow'
}

export interface ThreatAssessment {
  /** ID of the threat source */
  threatId: string;
  /** Threat level (0-10) */
  threatLevel: number;
  /** Type of threat */
  threatType: 'player' | 'monster' | 'environmental';
  /** Distance to threat in scenes */
  distance: number;
  /** Whether threat is immediate */
  isImmediate: boolean;
}

export interface IMonsterAIService {
  /**
   * Update monster AI and get next action
   * @param monsterId Monster to update
   * @returns AI decision with recommended action
   */
  updateMonsterAI(monsterId: string): AIDecision;

  /**
   * Determine primary target for monster
   * @param monsterId Monster ID
   * @returns Target ID or null if no target
   */
  determineTarget(monsterId: string): string | null;

  /**
   * Select best action for current situation
   * @param monsterId Monster ID
   * @param targetId Target ID (if any)
   * @returns Recommended action
   */
  selectAction(monsterId: string, targetId?: string): MonsterAction;

  /**
   * Evaluate threat level from a source
   * @param monsterId Monster evaluating threat
   * @param threatId Source of potential threat
   * @returns Threat level (0-10)
   */
  evaluateThreat(monsterId: string, threatId: string): number;

  /**
   * Get all current threats to monster
   * @param monsterId Monster ID
   * @returns Array of threat assessments
   */
  assessThreats(monsterId: string): ThreatAssessment[];

  /**
   * Calculate optimal state for monster
   * @param monsterId Monster ID
   * @returns Recommended state
   */
  calculateOptimalState(monsterId: string): MonsterState;

  /**
   * Check if monster should change behavior
   * @param monsterId Monster ID
   * @returns true if behavior change recommended
   */
  shouldChangeBehavior(monsterId: string): boolean;

  /**
   * Get monster's current goal
   * @param monsterId Monster ID
   * @returns Current goal description
   */
  getCurrentGoal(monsterId: string): string;

  /**
   * Evaluate action success probability
   * @param monsterId Monster ID
   * @param action Proposed action
   * @param targetId Target ID (if applicable)
   * @returns Success probability (0-1)
   */
  evaluateActionSuccess(monsterId: string, action: MonsterAction, targetId?: string): number;

  /**
   * Plan sequence of actions
   * @param monsterId Monster ID
   * @param goalState Desired end state
   * @returns Array of actions to reach goal
   */
  planActionSequence(monsterId: string, goalState: MonsterState): MonsterAction[];

  /**
   * React to environmental change
   * @param monsterId Monster ID
   * @param changeType Type of change
   * @param changeData Additional data about change
   * @returns AI decision in response
   */
  reactToChange(monsterId: string, changeType: string, changeData?: any): AIDecision;
}