/**
 * Result of a combat operation
 */
export interface CombatResult {
  success: boolean;
  message: string;
  monsterDefeated: boolean;
  playerDied: boolean;
}

/**
 * Result of a monster interaction
 */
export interface InteractionResult {
  success: boolean;
  message: string;
  itemAccepted: boolean;
}

/**
 * Manages monster-related interactions and combat business logic.
 * 
 * This service handles:
 * - Combat mechanics and resolution
 * - Non-combat monster interactions (giving items, communication)
 * - Monster AI and behavior logic
 * - Monster state changes and responses
 * 
 * Boundaries:
 * - Does NOT manage monster data access (GameStateService responsibility)
 * - Does NOT manage scene content (SceneService responsibility)
 * - Does NOT manage item properties (ItemService responsibility)
 * - Does NOT manage player inventory (InventoryService responsibility)
 * - Focus is purely on monster behavior and combat business logic
 */
export interface ICombatService {
  /** Get list of monsters currently in a scene */
  getMonstersInScene(sceneId: string): string[];
  
  /** Check if a monster can be attacked */
  canAttack(monsterId: string): boolean;
  
  /** Attack a monster, optionally with a weapon */
  attack(monsterId: string, weaponId?: string): CombatResult;
  
  /** Give an item to a monster */
  giveToMonster(monsterId: string, itemId: string): InteractionResult;
  
  /** Communicate with a monster */
  sayToMonster(monsterId: string, message: string): InteractionResult;
}