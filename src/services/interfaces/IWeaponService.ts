import { ItemOperationResult, WeaponItem } from '../../types/ItemTypes';

/**
 * Combat result interface
 * Extends ItemOperationResult with combat-specific data
 */
export interface CombatResult extends ItemOperationResult {
  /** Damage dealt in the attack */
  damage?: number;
  
  /** Whether the attack was critical */
  critical?: boolean;
  
  /** Whether the target was defeated */
  defeated?: boolean;
  
  /** Experience gained from combat */
  experience?: number;
  
  /** Weapon used in the attack */
  weaponUsed?: string;
  
  /** Target of the attack */
  target?: string;
}

/**
 * Weapon Service Interface
 * Handles all weapon-related operations and combat mechanics
 * Following Single Responsibility Principle - focused only on weapons and combat
 */
export interface IWeaponService {
  /**
   * Wield a weapon from inventory
   * @param weaponNameOrId Name or ID of the weapon to wield
   * @returns Result of the wield operation
   */
  wieldWeapon(weaponNameOrId: string): ItemOperationResult;

  /**
   * Unwield the currently wielded weapon
   * @returns Result of the unwield operation
   */
  unwieldWeapon(): ItemOperationResult;

  /**
   * Attack a target with a wielded or specified weapon
   * @param targetNameOrId Name or ID of the target to attack
   * @param weaponNameOrId Optional specific weapon to use
   * @returns Result of the attack with combat details
   */
  attackWith(targetNameOrId: string, weaponNameOrId?: string): CombatResult;

  /**
   * Attack with bare hands (no weapon)
   * @param targetNameOrId Name or ID of the target to attack
   * @returns Result of the unarmed attack
   */
  attackUnarmed(targetNameOrId: string): CombatResult;

  /**
   * Get the damage value of a weapon
   * @param weaponNameOrId Name or ID of the weapon
   * @returns Base damage value of the weapon
   */
  getWeaponDamage(weaponNameOrId: string): number;

  /**
   * Check if a specific weapon is currently wielded
   * @param weaponNameOrId Name or ID of the weapon to check
   * @returns Whether the weapon is wielded
   */
  isWeaponWielded(weaponNameOrId: string): boolean;

  /**
   * Get the currently wielded weapon
   * @returns The wielded weapon or undefined if none
   */
  getCurrentWeapon(): WeaponItem | undefined;

  /**
   * Check if an item can be used as a weapon
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item can be wielded as a weapon
   */
  canWieldAsWeapon(itemNameOrId: string): boolean;

  /**
   * Calculate effective damage considering weapon condition and user state
   * @param weaponNameOrId Name or ID of the weapon being used
   * @param targetNameOrId Optional target for damage calculation modifiers
   * @returns Effective damage value
   */
  calculateEffectiveDamage(weaponNameOrId: string, targetNameOrId?: string): number;

  /**
   * Repair a weapon's durability
   * @param weaponNameOrId Name or ID of the weapon to repair
   * @param repairAmount Amount to repair (optional, defaults to full repair)
   * @returns Result of the repair operation
   */
  repairWeapon(weaponNameOrId: string, repairAmount?: number): ItemOperationResult;

  /**
   * Check if a weapon needs repair
   * @param weaponNameOrId Name or ID of the weapon to check
   * @returns Whether the weapon needs repair
   */
  needsRepair(weaponNameOrId: string): boolean;

  /**
   * Get weapon durability as a percentage
   * @param weaponNameOrId Name or ID of the weapon
   * @returns Durability percentage (0-100)
   */
  getWeaponDurability(weaponNameOrId: string): number;

  /**
   * Get all weapons in inventory
   * @param wieldedOnly Whether to only return currently wielded weapons
   * @returns Array of weapon items
   */
  getWeaponsInInventory(wieldedOnly?: boolean): WeaponItem[];

  /**
   * Check if the player can attack a target
   * @param targetNameOrId Name or ID of the target
   * @returns Whether an attack is possible
   */
  canAttackTarget(targetNameOrId: string): boolean;

  /**
   * Get combat statistics for the player
   * @returns Object with combat stats (attacks made, damage dealt, etc.)
   */
  getCombatStatistics(): {
    totalAttacks: number;
    totalDamageDealt: number;
    criticalHits: number;
    enemiesDefeated: number;
  };
}