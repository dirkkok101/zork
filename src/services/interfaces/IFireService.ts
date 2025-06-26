import { ItemOperationResult } from '../../types/ItemTypes';

/**
 * Fire result interface
 * Extends ItemOperationResult with fire-specific data
 */
export interface FireResult extends ItemOperationResult {
  /** Whether fire was successfully started */
  ignited?: boolean;
  
  /** Whether fire spread to other items */
  spread?: boolean;
  
  /** Items affected by the fire */
  affectedItems?: string[];
  
  /** Duration the fire will burn (in game turns) */
  burnDuration?: number;
  
  /** Source of ignition used */
  ignitionSource?: string;
  
  /** Item that was set on fire */
  burningItem?: string;
}

/**
 * Fire hazard information interface
 */
export interface FireHazard {
  /** ID of the hazardous item */
  itemId: string;
  
  /** Type of hazard */
  hazardType: 'FLAMMABLE' | 'IGNITION_SOURCE' | 'EXPLOSIVE';
  
  /** Severity level (1-10) */
  severity: number;
  
  /** Warning message */
  warning: string;
  
  /** Recommended action */
  recommendation?: string;
}

/**
 * Fire Service Interface
 * Handles all fire, burning, and ignition mechanics
 * Following Single Responsibility Principle - focused only on fire-related interactions
 */
export interface IFireService {
  /**
   * Light an item using another item as ignition source
   * @param itemNameOrId Name or ID of the item to light
   * @param ignitionSourceNameOrId Name or ID of the ignition source (match, torch, etc.)
   * @returns Result of the lighting operation
   */
  lightWithFire(itemNameOrId: string, ignitionSourceNameOrId: string): FireResult;

  /**
   * Burn an item (destroy it with fire)
   * @param itemNameOrId Name or ID of the item to burn
   * @param ignitionSourceNameOrId Optional ignition source
   * @returns Result of the burning operation
   */
  burnItem(itemNameOrId: string, ignitionSourceNameOrId?: string): FireResult;

  /**
   * Extinguish a fire on an item
   * @param itemNameOrId Name or ID of the burning item
   * @param extinguishMethod Optional method to extinguish (water, sand, etc.)
   * @returns Result of the extinguish operation
   */
  extinguishFire(itemNameOrId: string, extinguishMethod?: string): ItemOperationResult;

  /**
   * Strike a match to create fire
   * @param matchNameOrId Name or ID of the match to strike
   * @param surface Optional surface to strike on
   * @returns Result of the match striking
   */
  strikeMatch(matchNameOrId: string, surface?: string): FireResult;

  /**
   * Check if an item can be ignited
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item can catch fire
   */
  canIgnite(itemNameOrId: string): boolean;

  /**
   * Check if an item can burn (is flammable)
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is flammable
   */
  canBurn(itemNameOrId: string): boolean;

  /**
   * Check if fire can spread from one item to another
   * @param fromItemNameOrId Name or ID of the burning item
   * @param toItemNameOrId Name or ID of the target item
   * @returns Whether fire can spread between these items
   */
  canSpreadFire(fromItemNameOrId: string, toItemNameOrId: string): boolean;

  /**
   * Get all currently burning items
   * @returns Array of item IDs that are currently on fire
   */
  getBurningItems(): string[];

  /**
   * Check if an item is currently burning
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is currently on fire
   */
  isBurning(itemNameOrId: string): boolean;

  /**
   * Check if an item can be used as an ignition source
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item can light other items
   */
  canUseAsIgnitionSource(itemNameOrId: string): boolean;

  /**
   * Get the burn duration for an item
   * @param itemNameOrId Name or ID of the item
   * @returns How long the item will burn (in game turns)
   */
  getBurnDuration(itemNameOrId: string): number;

  /**
   * Get remaining burn time for a burning item
   * @param itemNameOrId Name or ID of the burning item
   * @returns Remaining burn time in game turns
   */
  getRemainingBurnTime(itemNameOrId: string): number;

  /**
   * Update burning items (called each game turn)
   * Reduces burn duration and handles fire spreading
   * @returns Array of messages about fire events this turn
   */
  updateBurningItems(): string[];

  /**
   * Check for fire hazards in the current scene
   * @returns Array of fire hazards detected
   */
  checkFireHazards(): FireHazard[];

  /**
   * Get fire safety warnings for the current situation
   * @returns Array of fire safety warning messages
   */
  getFireSafetyWarnings(): string[];

  /**
   * Check if it's safe to use fire in the current location
   * @returns Whether fire can be safely used
   */
  isSafeToUseFireHere(): boolean;

  /**
   * Get all available ignition sources in inventory and scene
   * @param functionalOnly Whether to only return working ignition sources
   * @returns Array of ignition source item IDs
   */
  getAvailableIgnitionSources(functionalOnly?: boolean): string[];
}