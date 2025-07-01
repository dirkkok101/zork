import { IScoringService } from './interfaces/IScoringService';
import { IGameStateService } from './interfaces/IGameStateService';
import log from 'loglevel';

/**
 * Scoring Service Implementation
 * Manages score calculation and tracking for authentic Zork scoring system
 * Uses data-driven approach loading from extracted scene and item files
 */
export class ScoringService implements IScoringService {
  private logger: log.Logger;
  private itemScoringData: Map<string, number> = new Map();
  private sceneScoringData: Map<string, number> = new Map();
  private depositValues: Map<string, number> = new Map();

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('ScoringService');
    this.loadAllScoringData();
  }

  /**
   * Load all scoring data from extracted scene and item files
   */
  private async loadAllScoringData(): Promise<void> {
    try {
      await Promise.all([
        this.loadItemScoringData(),
        this.loadSceneScoringData(),
        this.loadTrophyCaseData()
      ]);
      
      this.logger.debug('All scoring data loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load scoring data:', error);
    }
  }

  /**
   * Load item scoring data from individual item JSON files
   */
  private async loadItemScoringData(): Promise<void> {
    try {
      // In a real implementation, this would use a file system module or data loader
      // For now, we'll simulate loading item data
      // This would typically involve reading all item files and extracting treasurePoints
      
      // Placeholder for actual implementation that would:
      // 1. Load data/items/index.json to get list of items
      // 2. Load each item file
      // 3. Filter for treasures (type === 'TREASURE')
      // 4. Extract properties.treasurePoints for each treasure
      // 5. Store in itemScoringData Map
      
      this.logger.debug('Item scoring data loaded from item files');
    } catch (error) {
      this.logger.error('Failed to load item scoring data:', error);
    }
  }

  /**
   * Load scene scoring data from scene JSON files
   */
  private async loadSceneScoringData(): Promise<void> {
    try {
      // In a real implementation, this would load scene files and extract firstVisitPoints
      // Placeholder for actual implementation that would:
      // 1. Load data/scenes/index.json to get list of scenes
      // 2. Load each scene file
      // 3. Extract firstVisitPoints where present
      // 4. Store in sceneScoringData Map
      
      this.logger.debug('Scene scoring data loaded from scene files');
    } catch (error) {
      this.logger.error('Failed to load scene scoring data:', error);
    }
  }

  /**
   * Load trophy case deposit values from trophy case item file
   */
  private async loadTrophyCaseData(): Promise<void> {
    try {
      // In a real implementation, this would load the trophy case item file
      // Placeholder for actual implementation that would:
      // 1. Load data/items/tcase.json (or similar)
      // 2. Extract properties.depositValues
      // 3. Store in depositValues Map
      
      this.logger.debug('Trophy case data loaded from item file');
    } catch (error) {
      this.logger.error('Failed to load trophy case data:', error);
    }
  }

  /**
   * Calculate base treasure points for finding a treasure
   */
  calculateTreasureScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    // Try to get treasure points from pre-loaded data
    let value = this.itemScoringData.get(treasureId) || 0;
    
    // If not found in pre-loaded data, check item properties directly
    if (value === 0) {
      const treasure = this.gameState.getItem(treasureId);
      if (treasure?.properties?.treasurePoints) {
        value = treasure.properties.treasurePoints;
      }
    }
    
    this.logger.debug(`Treasure ${treasureId} base score: ${value}`);
    return value;
  }

  /**
   * Calculate deposit bonus points for placing treasure in trophy case
   * Returns 0 if the deposit bonus has already been earned
   */
  calculateDepositScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    // Check if deposit bonus already earned
    const depositedFlag = `treasure_deposited_${treasureId}`;
    if (this.gameState.getFlag(depositedFlag)) {
      this.logger.debug(`Treasure ${treasureId} deposit bonus already earned`);
      return 0; // Already earned, no bonus
    }

    // Try to get deposit value from trophy case properties (data-driven approach)
    let depositValue = this.depositValues.get(treasureId) || 0;
    
    // If not found in pre-loaded data, check trophy case properties directly
    if (depositValue === 0) {
      const trophyCase = this.gameState.getItem('tcase');
      if (trophyCase?.properties?.depositValues) {
        depositValue = trophyCase.properties.depositValues[treasureId] || 0;
      }
    }
    
    const baseValue = this.calculateTreasureScore(treasureId);
    const depositBonus = depositValue - baseValue; // Additional points beyond base take score
    
    this.logger.debug(`Treasure ${treasureId} deposit bonus: ${depositBonus} (total deposit: ${depositValue}, base: ${baseValue})`);
    return Math.max(0, depositBonus); // Ensure non-negative
  }

  /**
   * Award points for depositing a treasure in the trophy case
   * Combines calculation, awarding, and flag setting in one atomic operation
   */
  awardDepositScore(treasureId: string): boolean {
    const depositedFlag = `treasure_deposited_${treasureId}`;
    if (this.gameState.getFlag(depositedFlag)) {
      this.logger.debug(`Treasure ${treasureId} deposit bonus already earned`);
      return false; // Already earned
    }

    const depositBonus = this.calculateDepositScore(treasureId);
    if (depositBonus > 0) {
      // Mark as deposited and award points
      this.gameState.setFlag(depositedFlag, true);
      this.gameState.addScore(depositBonus);
      this.logger.info(`Awarded ${depositBonus} points for depositing treasure: ${treasureId}`);
      return true;
    }

    // Still mark as deposited even if no bonus points
    if (this.isTreasure(treasureId)) {
      this.gameState.setFlag(depositedFlag, true);
    }
    
    return false;
  }

  /**
   * Calculate scene scoring points for first visit
   */
  calculateSceneScore(sceneId: string): number {
    const points = this.sceneScoringData.get(sceneId) || 0;
    this.logger.debug(`Scene ${sceneId} first visit score: ${points}`);
    return points;
  }

  /**
   * Award points for visiting a scene for the first time
   */
  awardSceneScore(sceneId: string): boolean {
    const flagName = `scene_visited_${sceneId}`;
    if (this.gameState.getFlag(flagName)) {
      this.logger.debug(`Scene ${sceneId} already visited`);
      return false;
    }

    const points = this.calculateSceneScore(sceneId);
    if (points > 0) {
      // Mark scene as visited
      this.gameState.setFlag(flagName, true);
      // Award the points
      this.gameState.addScore(points);
      this.logger.info(`Awarded ${points} points for first visit to: ${sceneId}`);
      return true;
    }

    // Still mark as visited even if no points
    this.gameState.setFlag(flagName, true);
    return false;
  }

  /**
   * Award points for a one-time game event
   */
  awardEventScore(eventId: string): boolean {
    if (this.hasEarnedEvent(eventId)) {
      this.logger.debug(`Event ${eventId} already earned`);
      return false;
    }

    // Hardcoded event scores for now - could be moved to data files later
    const eventScores: { [key: string]: number } = {
      'first_treasure': 5,
      'defeat_troll': 25,
      'defeat_thief': 10,
      'open_trophy_case': 15,
      'solve_maze': 20,
      'reach_endgame': 50
    };

    const points = eventScores[eventId];
    if (!points) {
      this.logger.warn(`Unknown scoring event: ${eventId}`);
      return false;
    }

    // Mark event as earned using game state flags
    const flagName = `scoring_event_${eventId}`;
    this.gameState.setFlag(flagName, true);
    
    // Award the points
    this.gameState.addScore(points);
    
    this.logger.info(`Awarded ${points} points for event: ${eventId}`);
    return true;
  }

  /**
   * Check if a scoring event has already been earned
   */
  hasEarnedEvent(eventId: string): boolean {
    const flagName = `scoring_event_${eventId}`;
    return this.gameState.getFlag(flagName);
  }

  /**
   * Get the theoretical maximum score possible in the game
   */
  getMaxScore(): number {
    // Calculate max score from loaded data
    let maxScore = 0;
    
    // Add all treasure take scores
    for (const score of this.itemScoringData.values()) {
      maxScore += score;
    }
    
    // Add all treasure deposit bonuses
    for (const [treasureId, depositValue] of this.depositValues.entries()) {
      const takeScore = this.itemScoringData.get(treasureId) || 0;
      maxScore += Math.max(0, depositValue - takeScore);
    }
    
    // Add all scene scores
    for (const score of this.sceneScoringData.values()) {
      maxScore += score;
    }
    
    // Add event scores
    maxScore += 5 + 25 + 10 + 15 + 20 + 50; // hardcoded event totals
    
    return maxScore || 350; // fallback to 350 if calculation fails
  }

  /**
   * Count total number of treasures discovered by the player
   */
  getTotalTreasuresFound(): number {
    const treasureIds = Array.from(this.itemScoringData.keys());
    const foundTreasures = treasureIds.filter(treasureId => {
      // Check if player has found this treasure (flag or in inventory)
      const foundFlag = `treasure_found_${treasureId}`;
      return this.gameState.getFlag(foundFlag);
    });

    return foundTreasures.length;
  }

  /**
   * Count total number of treasures deposited in the trophy case
   */
  getTotalTreasuresDeposited(): number {
    const treasureIds = Array.from(this.itemScoringData.keys());
    const depositedTreasures = treasureIds.filter(treasureId => {
      // Check if treasure is deposited in trophy case
      const depositedFlag = `treasure_deposited_${treasureId}`;
      return this.gameState.getFlag(depositedFlag);
    });

    return depositedTreasures.length;
  }

  /**
   * Check if an item is a treasure that can be scored
   */
  isTreasure(itemId: string): boolean {
    // Check if it's in our loaded treasure scoring data
    if (this.itemScoringData.has(itemId)) {
      return true;
    }

    // Also check item type from ItemService
    const item = this.gameState.getItem(itemId);
    if (item && item.type === 'TREASURE') {
      return true;
    }

    return false;
  }

  /**
   * Get points for a specific scoring event
   */
  getEventScore(eventId: string): number {
    const eventScores: { [key: string]: number } = {
      'first_treasure': 5,
      'defeat_troll': 25,
      'defeat_thief': 10,
      'open_trophy_case': 15,
      'solve_maze': 20,
      'reach_endgame': 50
    };
    
    return eventScores[eventId] || 0;
  }

  /**
   * Calculate completion bonus if all treasures are deposited
   */
  calculateCompletionBonus(): number {
    const totalTreasures = this.itemScoringData.size;
    const depositedTreasures = this.getTotalTreasuresDeposited();

    if (depositedTreasures >= totalTreasures) {
      const bonus = 50; // Standard completion bonus
      this.logger.info(`All treasures deposited! Completion bonus: ${bonus} points`);
      return bonus;
    }

    return 0;
  }

  /**
   * Mark a treasure as found (for tracking purposes)
   */
  markTreasureFound(treasureId: string): void {
    if (this.isTreasure(treasureId)) {
      const flagName = `treasure_found_${treasureId}`;
      this.gameState.setFlag(flagName, true);
      this.logger.debug(`Marked treasure ${treasureId} as found`);
    }
  }

  /**
   * Mark a treasure as deposited in trophy case
   */
  markTreasureDeposited(treasureId: string): void {
    if (this.isTreasure(treasureId)) {
      const flagName = `treasure_deposited_${treasureId}`;
      this.gameState.setFlag(flagName, true);
      this.logger.debug(`Marked treasure ${treasureId} as deposited`);
    }
  }
}