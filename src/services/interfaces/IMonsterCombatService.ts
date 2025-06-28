/**
 * Monster Combat Service Interface
 * 
 * Responsible for all combat-related mechanics including damage calculation,
 * combat message selection, and death handling.
 * 
 * @interface IMonsterCombatService
 */

import { Item } from '../../types/ItemTypes';
import { MeleeMessages } from '../../types/MonsterData';

export interface CombatResult {
  /** Whether the combat action was successful */
  success: boolean;
  /** Message describing the combat outcome */
  message: string;
  /** Actual damage dealt */
  damageDealt: number;
  /** Whether the target died */
  targetDied: boolean;
  /** Score change from this combat action */
  scoreChange?: number;
  /** Items dropped on death */
  droppedItems?: string[];
}

export interface MonsterDeathResult {
  /** Death message */
  message: string;
  /** Score awarded for defeating the monster */
  scoreChange: number;
  /** Items dropped by the monster */
  droppedItems: string[];
  /** Flags to set on death */
  flagsToSet?: Record<string, boolean>;
  /** Effects triggered by death */
  effects?: string[];
}

export interface IMonsterCombatService {
  /**
   * Calculate damage for an attack
   * @param attackerId ID of the attacking entity (monster or player)
   * @param targetId ID of the target
   * @param weapon Optional weapon being used
   * @returns Calculated damage amount
   */
  calculateDamage(attackerId: string, targetId: string, weapon?: Item): number;

  /**
   * Apply damage to a monster
   * @param monsterId Target monster ID
   * @param damage Amount of damage to apply
   * @param source Source of the damage (e.g., "player", "fall", "fire")
   * @returns Combat result with outcome details
   */
  applyDamage(monsterId: string, damage: number, source: string): CombatResult;

  /**
   * Select an appropriate combat message from melee tables
   * @param monsterId Monster ID (for accessing melee messages)
   * @param category Message category (miss, kill, light_wound, etc.)
   * @returns Selected message or default if none available
   */
  selectCombatMessage(monsterId: string, category: keyof MeleeMessages): string;

  /**
   * Perform a monster attack on a target
   * @param monsterId Attacking monster ID
   * @param targetId Target ID (usually "player")
   * @returns Combat result
   */
  performMonsterAttack(monsterId: string, targetId: string): CombatResult;

  /**
   * Check if a monster should die based on current health
   * @param monsterId Monster ID to check
   * @returns true if monster should die
   */
  checkDeathCondition(monsterId: string): boolean;

  /**
   * Handle monster death including drops and score
   * @param monsterId Monster that died
   * @returns Death result with drops and score
   */
  handleMonsterDeath(monsterId: string): MonsterDeathResult;

  /**
   * Get combat strength for a monster
   * @param monsterId Monster ID
   * @returns Combat strength value or default
   */
  getCombatStrength(monsterId: string): number;

  /**
   * Check if a monster is immune to a damage source
   * @param monsterId Monster ID
   * @param damageSource Source of damage
   * @returns true if immune
   */
  isImmuneToSource(monsterId: string, damageSource: string): boolean;

  /**
   * Calculate combat modifiers based on conditions
   * @param monsterId Monster ID
   * @param targetId Target ID
   * @returns Damage multiplier (1.0 = normal)
   */
  calculateCombatModifiers(monsterId: string, targetId: string): number;

  /**
   * Check if a monster can be attacked
   * @param monsterId Monster ID
   * @returns true if monster can be attacked
   */
  canBeAttacked(monsterId: string): boolean;
}