/**
 * Core Monster Service Interface
 * 
 * Responsible for basic monster management operations including
 * loading, retrieving, and updating monster state.
 * 
 * @interface IMonsterService
 */

import { Monster, MonsterState } from '../../types/MonsterTypes';

export interface IMonsterService {
  /**
   * Load a specific monster by ID
   * @param id Monster identifier
   * @returns Promise resolving to the monster
   * @throws Error if monster not found
   */
  loadMonster(id: string): Promise<Monster>;

  /**
   * Load all available monsters
   * @returns Promise resolving to array of all monsters
   */
  loadAllMonsters(): Promise<Monster[]>;

  /**
   * Get a loaded monster by ID
   * @param id Monster identifier
   * @returns Monster if found, undefined otherwise
   */
  getMonster(id: string): Monster | undefined;

  /**
   * Get all monsters in a specific scene
   * @param sceneId Scene identifier
   * @returns Array of monsters in the scene (excluding dead monsters)
   */
  getMonstersInScene(sceneId: string): Monster[];

  /**
   * Get all active monsters (not dead)
   * @returns Array of active monsters
   */
  getActiveMonsters(): Monster[];

  /**
   * Update a monster's state
   * @param id Monster identifier
   * @param state New monster state
   * @returns true if successful, false if monster not found
   */
  updateMonsterState(id: string, state: MonsterState): boolean;

  /**
   * Update a monster's current location
   * @param id Monster identifier
   * @param sceneId Target scene identifier
   * @returns true if successful, false if monster not found or move not allowed
   */
  updateMonsterLocation(id: string, sceneId: string): boolean;

  /**
   * Update a monster's health
   * @param id Monster identifier
   * @param health New health value (will be clamped to 0-maxHealth)
   * @returns true if successful, false if monster not found
   */
  updateMonsterHealth(id: string, health: number): boolean;

  /**
   * Add an item to a monster's inventory
   * @param monsterId Monster identifier
   * @param itemId Item identifier
   * @returns true if successful, false if monster not found
   */
  addToMonsterInventory(monsterId: string, itemId: string): boolean;

  /**
   * Remove an item from a monster's inventory
   * @param monsterId Monster identifier
   * @param itemId Item identifier
   * @returns true if successful, false if monster or item not found
   */
  removeFromMonsterInventory(monsterId: string, itemId: string): boolean;

  /**
   * Check if a monster has a specific flag
   * @param monsterId Monster identifier
   * @param flag Flag name
   * @returns true if monster has flag, false otherwise
   */
  hasFlag(monsterId: string, flag: string): boolean;

  /**
   * Get a monster's property value
   * @param monsterId Monster identifier
   * @param property Property name
   * @returns Property value or undefined
   */
  getProperty(monsterId: string, property: string): any;

  /**
   * Set a monster's property value
   * @param monsterId Monster identifier
   * @param property Property name
   * @param value Property value
   * @returns true if successful, false if monster not found
   */
  setProperty(monsterId: string, property: string, value: any): boolean;
}