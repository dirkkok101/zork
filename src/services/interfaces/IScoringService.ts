/**
 * Scoring Service Interface
 * Manages score calculation and tracking for Zork treasure collection and events
 * 
 * This service handles:
 * - Treasure point calculations (base + deposit bonuses)
 * - One-time event scoring (combat, puzzle solving, etc.)
 * - Score validation and maximum score tracking
 * - Progress tracking for treasures and achievements
 * 
 * Boundaries:
 * - Does NOT modify game state directly (uses GameStateService)
 * - Does NOT handle UI display (UI layer responsibility)
 * - Does NOT manage treasure locations (ItemService/SceneService)
 * - Focuses solely on score calculation and validation
 */
export interface IScoringService {
  /**
   * Calculate base treasure points for finding a treasure
   * @param treasureId The ID of the treasure item
   * @returns Base point value, or 0 if not a treasure
   */
  calculateTreasureScore(treasureId: string): number;

  /**
   * Calculate deposit bonus points for placing treasure in trophy case
   * @param treasureId The ID of the treasure item
   * @returns Deposit bonus points, or 0 if not a treasure or already earned
   */
  calculateDepositScore(treasureId: string): number;

  /**
   * Award points for depositing a treasure in the trophy case
   * Combines calculation, awarding, and flag setting in one atomic operation
   * @param treasureId The ID of the treasure item being deposited
   * @returns true if points were awarded, false if already deposited or no points
   */
  awardDepositScore(treasureId: string): boolean;

  /**
   * Calculate scene scoring points for first visit
   * @param sceneId The ID of the scene
   * @returns Point value for first visit, or 0 if no scoring
   */
  calculateSceneScore(sceneId: string): number;

  /**
   * Award points for visiting a scene for the first time
   * @param sceneId The ID of the scene being visited
   * @returns true if points were awarded, false if already visited or no points
   */
  awardSceneScore(sceneId: string): boolean;

  /**
   * Award points for a one-time game event
   * @param eventId The ID of the scoring event (e.g., 'defeat_troll', 'solve_maze')
   * @returns true if points were awarded, false if already earned or invalid event
   */
  awardEventScore(eventId: string): boolean;

  /**
   * Check if a scoring event has already been earned
   * @param eventId The ID of the scoring event
   * @returns true if the event has been completed and scored
   */
  hasEarnedEvent(eventId: string): boolean;

  /**
   * Get the theoretical maximum score possible in the game
   * @returns Maximum possible score (350 in authentic Zork)
   */
  getMaxScore(): number;

  /**
   * Count total number of treasures discovered by the player
   * @returns Number of unique treasures found
   */
  getTotalTreasuresFound(): number;

  /**
   * Count total number of treasures deposited in the trophy case
   * @returns Number of treasures properly stored
   */
  getTotalTreasuresDeposited(): number;

  /**
   * Check if an item is a treasure that can be scored
   * @param itemId The ID of the item to check
   * @returns true if the item is a treasure with scoring value
   */
  isTreasure(itemId: string): boolean;

  /**
   * Get points for a specific scoring event
   * @param eventId The ID of the scoring event
   * @returns Point value for the event, or 0 if invalid
   */
  getEventScore(eventId: string): number;

  /**
   * Calculate completion bonus if all treasures are deposited
   * @returns Completion bonus points, or 0 if not all treasures deposited
   */
  calculateCompletionBonus(): number;

  /**
   * Mark a treasure as found (for tracking purposes)
   * @param treasureId The ID of the treasure item
   */
  markTreasureFound(treasureId: string): void;

  /**
   * Mark a treasure as deposited in trophy case
   * @param treasureId The ID of the treasure item
   */
  markTreasureDeposited(treasureId: string): void;

  /**
   * Check if a treasure has been found (for test purposes)
   * @param treasureId The ID of the treasure item
   * @returns true if the treasure has been found before
   */
  hasTreasureBeenFound(treasureId: string): boolean;
}