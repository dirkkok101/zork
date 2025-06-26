import { ItemOperationResult, ConsumableItem, ConsumptionEffects } from '../../types/ItemTypes';

/**
 * Consumption result interface
 * Extends ItemOperationResult with consumption-specific data
 */
export interface ConsumptionResult extends ItemOperationResult {
  /** Effects applied to the player */
  effects?: ConsumptionEffects;
  
  /** Whether the item was destroyed after consumption */
  itemDestroyed?: boolean;
  
  /** New player stats after consumption */
  playerStats?: {
    health?: number;
    hunger?: number;
    thirst?: number;
  };
  
  /** Item that was consumed */
  consumedItem?: string;
  
  /** Type of consumption performed */
  consumptionType?: 'FOOD' | 'DRINK';
}

/**
 * Player nutrition status interface
 */
export interface NutritionStatus {
  /** Current hunger level (0-100, where 100 is completely full) */
  hunger: number;
  
  /** Current thirst level (0-100, where 100 is completely hydrated) */
  thirst: number;
  
  /** Current health level (0-100) */
  health: number;
  
  /** Status description */
  status: string;
  
  /** Whether the player needs food */
  needsFood: boolean;
  
  /** Whether the player needs drink */
  needsDrink: boolean;
}

/**
 * Consumable Service Interface
 * Handles all food and drink consumption mechanics
 * Following Single Responsibility Principle - focused only on consumable items
 */
export interface IConsumableService {
  /**
   * Eat a food item from inventory
   * @param itemNameOrId Name or ID of the food item to eat
   * @returns Result of the eating operation with effects
   */
  eatItem(itemNameOrId: string): ConsumptionResult;

  /**
   * Drink a liquid item from inventory
   * @param itemNameOrId Name or ID of the drink item to consume
   * @returns Result of the drinking operation with effects
   */
  drinkItem(itemNameOrId: string): ConsumptionResult;

  /**
   * Check if an item can be consumed
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is consumable
   */
  canConsume(itemNameOrId: string): boolean;

  /**
   * Get the consumption effects of an item without consuming it
   * @param itemNameOrId Name or ID of the item to analyze
   * @returns The effects this item would have when consumed
   */
  getConsumptionEffects(itemNameOrId: string): ConsumptionEffects | undefined;

  /**
   * Check if an item is food
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is food
   */
  isFood(itemNameOrId: string): boolean;

  /**
   * Check if an item is a drink
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is a drink
   */
  isDrink(itemNameOrId: string): boolean;

  /**
   * Get the nutritional value of a consumable item
   * @param itemNameOrId Name or ID of the item
   * @returns Nutritional value or undefined if not consumable
   */
  getNutritionalValue(itemNameOrId: string): number | undefined;

  /**
   * Check if a consumable item is spoiled or expired
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is still safe to consume
   */
  isFresh(itemNameOrId: string): boolean;

  /**
   * Get all consumable items in inventory
   * @param type Optional filter by consumption type
   * @returns Array of consumable items
   */
  getConsumableItems(type?: 'FOOD' | 'DRINK'): ConsumableItem[];

  /**
   * Get current nutrition status
   * @returns Complete nutrition status of the player
   */
  getNutritionStatus(): NutritionStatus;

  /**
   * Check current hunger level
   * @returns Current hunger level (0-100, where 100 is completely full)
   */
  getHungerLevel(): number;

  /**
   * Check current thirst level
   * @returns Current thirst level (0-100, where 100 is completely hydrated)
   */
  getThirstLevel(): number;

  /**
   * Update nutrition levels over time (called each game turn)
   * @param timeDelta Time passed since last update
   * @returns Array of messages about nutrition changes
   */
  updateNutrition(timeDelta: number): string[];

  /**
   * Check for nutrition warnings (hunger, thirst)
   * @returns Array of warning messages about nutrition needs
   */
  getNutritionWarnings(): string[];

  /**
   * Force set nutrition levels (for testing or special effects)
   * @param hunger New hunger level (0-100)
   * @param thirst New thirst level (0-100)
   */
  setNutritionLevels(hunger: number, thirst: number): void;

  /**
   * Check if the player is starving or dehydrated
   * @returns Whether the player is in critical nutrition state
   */
  isCriticalNutritionState(): boolean;
}