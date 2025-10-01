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

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('ScoringService');
    this.initializeScoringService();
  }

  /**
   * No separate data loading needed - scoring data is accessed directly from 
   * GameStateService which already has loaded item and scene data
   */
  private initializeScoringService(): void {
    this.logger.debug('ScoringService initialized - using data from GameStateService');
  }


  /**
   * Calculate base treasure points for finding a treasure
   */
  calculateTreasureScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    // Check if treasure was already found - only award points on first find
    const foundFlag = `treasure_found_${treasureId}`;
    if (this.gameState.getFlag(foundFlag)) {
      this.logger.debug(`Treasure ${treasureId} already found - no points awarded`);
      return 0;
    }

    // Get treasure points from item properties
    let value = 0;
    const treasure = this.gameState.getItem(treasureId);
    if (treasure?.properties?.treasurePoints) {
      value = treasure.properties.treasurePoints;
    }
    
    this.logger.debug(`Treasure ${treasureId} base score: ${value}`);
    return value;
  }

  /**
   * Calculate deposit points for placing treasure in trophy case
   * Returns 0 if the treasure has already been deposited
   * Note: In authentic Zork, ALL treasure points are awarded on deposit, not on take
   */
  calculateDepositScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    // Check if treasure already deposited
    const depositedFlag = `treasure_deposited_${treasureId}`;
    if (this.gameState.getFlag(depositedFlag)) {
      this.logger.debug(`Treasure ${treasureId} already deposited - no points awarded`);
      return 0; // Already deposited
    }

    // Read deposit value directly from loaded trophy case data
    const trophyCase = this.gameState.getItem('tcase');
    const depositValue = trophyCase?.properties?.depositValues?.[treasureId] || 0;

    this.logger.debug(`Treasure ${treasureId} deposit value: ${depositValue} points`);
    return depositValue; // Return full deposit value (not a bonus)
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
    // Read firstVisitPoints directly from loaded scene data (same pattern as treasure scoring)
    const scene = this.gameState.getScene(sceneId);
    this.logger.debug(`Scene ${sceneId} data:`, scene ? {id: scene.id, title: scene.title, firstVisitPoints: scene.firstVisitPoints} : 'null');
    const points = scene?.firstVisitPoints || 0;
    this.logger.debug(`Scene ${sceneId} first visit score: ${points}`);
    return points;
  }

  /**
   * Award points for visiting a scene for the first time
   */
  awardSceneScore(sceneId: string): boolean {
    // Use the same visited tracking system as SceneService/GameStateService
    if (this.gameState.hasVisitedScene(sceneId)) {
      this.logger.debug(`Scene ${sceneId} already visited`);
      return false;
    }

    const points = this.calculateSceneScore(sceneId);
    this.logger.debug(`Scene ${sceneId} first visit points: ${points}`);
    
    if (points > 0) {
      // Award the points (SceneService will handle marking as visited)
      this.gameState.addScore(points);
      this.logger.info(`Awarded ${points} points for first visit to: ${sceneId}`);
      return true;
    }
    this.logger.debug(`No points for scene ${sceneId}, but marked as visited`);
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
    // For simplicity, return the canonical Zork maximum score
    // In a full implementation, this could calculate from all loaded treasures and scenes
    return 350; // Authentic Zork maximum score
  }

  /**
   * Count total number of treasures discovered by the player
   */
  getTotalTreasuresFound(): number {
    // Get all loaded items and count found treasures
    const gameState = this.gameState.getGameState();
    let foundCount = 0;
    
    for (const [itemId, _item] of Object.entries(gameState.items)) {
      if (this.isTreasure(itemId)) {
        const foundFlag = `treasure_found_${itemId}`;
        if (this.gameState.getFlag(foundFlag)) {
          foundCount++;
        }
      }
    }
    
    return foundCount;
  }

  /**
   * Count total number of treasures deposited in the trophy case
   */
  getTotalTreasuresDeposited(): number {
    // Get all loaded items and count deposited treasures
    const gameState = this.gameState.getGameState();
    let depositedCount = 0;
    
    for (const [itemId, _item] of Object.entries(gameState.items)) {
      if (this.isTreasure(itemId)) {
        const depositedFlag = `treasure_deposited_${itemId}`;
        if (this.gameState.getFlag(depositedFlag)) {
          depositedCount++;
        }
      }
    }
    
    return depositedCount;
  }

  /**
   * Check if an item is a treasure that can be scored
   */
  isTreasure(itemId: string): boolean {
    // Check item type and properties from loaded data
    const item = this.gameState.getItem(itemId);
    if (item && (item.type === 'TREASURE' || item.properties?.treasurePoints)) {
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
    // Count total treasures from loaded data
    const gameState = this.gameState.getGameState();
    const totalTreasures = Object.keys(gameState.items).filter(itemId => this.isTreasure(itemId)).length;
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

  /**
   * Check if a treasure has been found (for test purposes)
   */
  hasTreasureBeenFound(treasureId: string): boolean {
    if (!this.isTreasure(treasureId)) {
      return false;
    }
    const foundFlag = `treasure_found_${treasureId}`;
    return this.gameState.getFlag(foundFlag);
  }
}