import { IScoringService } from './interfaces/IScoringService';
import { IGameStateService } from './interfaces/IGameStateService';
import log from 'loglevel';

/**
 * Scoring Service Implementation
 * Manages score calculation and tracking for authentic Zork scoring system
 */
export class ScoringService implements IScoringService {
  private logger: log.Logger;
  private scoringData: any = null;

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('ScoringService');
    this.loadScoringData();
  }

  /**
   * Load scoring configuration from data files
   */
  private async loadScoringData(): Promise<void> {
    try {
      // In a real implementation, these would be loaded from the data files
      // For now, using the data structure from scoring_system.json
      this.scoringData = {
        "treasureValues": {
          "coin": 12,
          "lamp": 5,
          "egg": 5,
          "bar": 10,
          "emera": 10,
          "ruby": 10,
          "diamo": 10,
          "saffr": 10,
          "chali": 10,
          "tride": 15,
          "bauble": 5,
          "coffi": 15
        },
        "depositLocation": "case",
        "depositMultiplier": 2,
        "completionBonus": 50,
        "maxScore": 350,
        "scoringEvents": [
          {
            "id": "first_treasure",
            "description": "Finding your first treasure",
            "points": 5,
            "oneTime": true
          },
          {
            "id": "defeat_troll",
            "description": "Defeating the troll", 
            "points": 25,
            "oneTime": true
          },
          {
            "id": "defeat_thief",
            "description": "Defeating the thief",
            "points": 10,
            "oneTime": true
          },
          {
            "id": "open_trophy_case",
            "description": "Opening the trophy case",
            "points": 15,
            "oneTime": true
          },
          {
            "id": "solve_maze",
            "description": "Navigating the maze",
            "points": 20,
            "oneTime": true
          },
          {
            "id": "reach_endgame",
            "description": "Reaching the final area",
            "points": 50,
            "oneTime": true
          }
        ]
      };

      this.logger.debug('Scoring data loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load scoring data:', error);
    }
  }

  /**
   * Calculate base treasure points for finding a treasure
   */
  calculateTreasureScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    const value = this.scoringData?.treasureValues?.[treasureId] || 0;
    this.logger.debug(`Treasure ${treasureId} base score: ${value}`);
    return value;
  }

  /**
   * Calculate deposit bonus points for placing treasure in trophy case
   */
  calculateDepositScore(treasureId: string): number {
    if (!this.isTreasure(treasureId)) {
      return 0;
    }

    const baseValue = this.calculateTreasureScore(treasureId);
    const multiplier = this.scoringData?.depositMultiplier || 2;
    const depositBonus = baseValue * (multiplier - 1); // Additional points beyond base
    
    this.logger.debug(`Treasure ${treasureId} deposit bonus: ${depositBonus} (base: ${baseValue}, multiplier: ${multiplier})`);
    return depositBonus;
  }

  /**
   * Award points for a one-time game event
   */
  awardEventScore(eventId: string): boolean {
    if (this.hasEarnedEvent(eventId)) {
      this.logger.debug(`Event ${eventId} already earned`);
      return false;
    }

    const event = this.scoringData?.scoringEvents?.find((e: any) => e.id === eventId);
    if (!event) {
      this.logger.warn(`Unknown scoring event: ${eventId}`);
      return false;
    }

    // Mark event as earned using game state flags
    const flagName = `scoring_event_${eventId}`;
    this.gameState.setFlag(flagName, true);
    
    // Award the points
    this.gameState.addScore(event.points);
    
    this.logger.info(`Awarded ${event.points} points for event: ${event.description}`);
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
    return this.scoringData?.maxScore || 350;
  }

  /**
   * Count total number of treasures discovered by the player
   */
  getTotalTreasuresFound(): number {
    if (!this.scoringData?.treasureValues) {
      return 0;
    }

    const treasureIds = Object.keys(this.scoringData.treasureValues);
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
    if (!this.scoringData?.treasureValues) {
      return 0;
    }

    const treasureIds = Object.keys(this.scoringData.treasureValues);
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
    // First check if it's in our treasure values list
    if (this.scoringData?.treasureValues?.hasOwnProperty(itemId)) {
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
    const event = this.scoringData?.scoringEvents?.find((e: any) => e.id === eventId);
    return event?.points || 0;
  }

  /**
   * Calculate completion bonus if all treasures are deposited
   */
  calculateCompletionBonus(): number {
    if (!this.scoringData?.treasureValues) {
      return 0;
    }

    const totalTreasures = Object.keys(this.scoringData.treasureValues).length;
    const depositedTreasures = this.getTotalTreasuresDeposited();

    if (depositedTreasures >= totalTreasures) {
      const bonus = this.scoringData.completionBonus || 50;
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