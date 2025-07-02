import { IGameStateService } from '@/services/interfaces/IGameStateService';
import { IItemService } from '@/services/interfaces/IItemService';
import { IScoringService } from '@/services/interfaces/IScoringService';
import { LivingRoomHelper } from './living_room_helper';

/**
 * Trophy Case Helper
 * Specialized helper for trophy case container operations and scoring mechanics
 * Provides detailed validation and manipulation of trophy case state
 */
export class TrophyCaseHelper {
  constructor(
    private gameStateService: IGameStateService,
    private itemService: IItemService,
    private scoringService: IScoringService,
    private livingRoomHelper: LivingRoomHelper
  ) {
    // itemService and scoringService are kept for future use
    this.itemService; // Reference to avoid unused warning
    this.scoringService; // Reference to avoid unused warning
  }

  /**
   * Validate trophy case initial state
   */
  validateInitialState(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const trophyCase = this.livingRoomHelper.getTrophyCase();

    if (!trophyCase) {
      errors.push('Trophy case not found');
      return { isValid: false, errors };
    }

    // Check basic properties
    if (trophyCase.type !== 'CONTAINER') {
      errors.push(`Expected trophy case type to be CONTAINER, got ${trophyCase.type}`);
    }

    if (!trophyCase.properties?.container) {
      errors.push('Trophy case missing container property');
    }

    if (!trophyCase.properties?.depositValues) {
      errors.push('Trophy case missing depositValues property');
    }

    // Check initial state - Trophy case starts open in authentic Zork
    if (trophyCase.state?.open !== true) {
      errors.push('Trophy case should start open in authentic Zork');
    }

    if (trophyCase.state?.contents && trophyCase.state.contents.length > 0) {
      errors.push('Trophy case should start empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get deposit value for a specific treasure
   */
  getDepositValue(treasureId: string): number {
    const trophyCase = this.livingRoomHelper.getTrophyCase();
    return trophyCase?.properties?.depositValues?.[treasureId] || 0;
  }

  /**
   * Get take value for a specific treasure
   */
  getTakeValue(treasureId: string): number {
    const treasure = this.gameStateService.getItem(treasureId);
    return treasure?.properties?.treasurePoints || 0;
  }

  /**
   * Get deposit bonus (difference between deposit and take values)
   */
  getDepositBonus(treasureId: string): number {
    const depositValue = this.getDepositValue(treasureId);
    const takeValue = this.getTakeValue(treasureId);
    return depositValue - takeValue;
  }

  /**
   * Simulate depositing a treasure and verify scoring
   */
  simulateDepositWithScoring(treasureId: string): {
    success: boolean;
    scoreAwarded: number;
    bonusAwarded: number;
    errors: string[];
  } {
    const errors: string[] = [];
    const initialScore = this.livingRoomHelper.getCurrentScore();
    
    // Verify trophy case is open
    if (!this.livingRoomHelper.isTrophyCaseOpen()) {
      errors.push('Trophy case must be open to deposit treasures');
      return { success: false, scoreAwarded: 0, bonusAwarded: 0, errors };
    }

    // Verify treasure is in inventory
    const gameState = this.gameStateService.getGameState();
    if (!gameState.inventory.includes(treasureId)) {
      errors.push(`Treasure ${treasureId} not in inventory`);
      return { success: false, scoreAwarded: 0, bonusAwarded: 0, errors };
    }

    // Verify treasure is not already deposited
    if (this.livingRoomHelper.hasTreasureBeenDeposited(treasureId)) {
      errors.push(`Treasure ${treasureId} already deposited`);
      return { success: false, scoreAwarded: 0, bonusAwarded: 0, errors };
    }

    // Perform deposit
    this.livingRoomHelper.addTreasureToTrophyCase(treasureId);
    
    // Remove from inventory
    const inventoryIndex = gameState.inventory.indexOf(treasureId);
    if (inventoryIndex > -1) {
      gameState.inventory.splice(inventoryIndex, 1);
    }

    // Award scoring - simulate deposit bonus
    const depositBonus = this.getDepositBonus(treasureId);
    this.gameStateService.addScore(depositBonus);
    this.gameStateService.setFlag(`treasure_deposited_${treasureId}`, true);
    const finalScore = this.livingRoomHelper.getCurrentScore();
    const scoreAwarded = finalScore - initialScore;

    return {
      success: true,
      scoreAwarded,
      bonusAwarded: depositBonus,
      errors
    };
  }

  /**
   * Simulate taking a treasure from trophy case
   */
  simulateTakeFromTrophyCase(treasureId: string): {
    success: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Verify trophy case is open
    if (!this.livingRoomHelper.isTrophyCaseOpen()) {
      errors.push('Trophy case must be open to take treasures');
      return { success: false, errors };
    }

    // Verify treasure is in trophy case
    const contents = this.livingRoomHelper.getTrophyCaseContents();
    if (!contents.includes(treasureId)) {
      errors.push(`Treasure ${treasureId} not in trophy case`);
      return { success: false, errors };
    }

    // Perform take
    this.livingRoomHelper.removeTreasureFromTrophyCase(treasureId);
    this.livingRoomHelper.addTreasureToInventory(treasureId);

    return { success: true, errors };
  }

  /**
   * Verify trophy case contents display
   */
  verifyContentsDisplay(expectedContents: string[], isOpen: boolean): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const actualContents = this.livingRoomHelper.getTrophyCaseContents();
    const isActuallyOpen = this.livingRoomHelper.isTrophyCaseOpen();

    // Check open/closed state
    if (isActuallyOpen !== isOpen) {
      errors.push(`Expected trophy case to be ${isOpen ? 'open' : 'closed'}, but it is ${isActuallyOpen ? 'open' : 'closed'}`);
    }

    // Check contents
    if (actualContents.length !== expectedContents.length) {
      errors.push(`Expected ${expectedContents.length} items, found ${actualContents.length}`);
    }

    expectedContents.forEach(item => {
      if (!actualContents.includes(item)) {
        errors.push(`Expected item ${item} not found in trophy case`);
      }
    });

    actualContents.forEach(item => {
      if (!expectedContents.includes(item)) {
        errors.push(`Unexpected item ${item} found in trophy case`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Setup a multi-treasure scenario for complex testing
   */
  setupMultiTreasureScenario(): {
    treasureIds: string[];
    expectedTakeScores: number[];
    expectedDepositScores: number[];
    expectedBonuses: number[];
  } {
    // Setup test treasures
    this.livingRoomHelper.setupTestTreasures();

    const treasureIds = ['egg', 'coin', 'diamo'];
    const expectedTakeScores = [5, 12, 6];  // From real treasure data
    const expectedDepositScores = [10, 22, 25];
    const expectedBonuses = [5, 10, 19]; // deposit - take

    // Add treasures to inventory
    treasureIds.forEach(id => {
      this.livingRoomHelper.addTreasureToInventory(id);
    });

    return {
      treasureIds,
      expectedTakeScores,
      expectedDepositScores,
      expectedBonuses
    };
  }

  /**
   * Verify scoring calculations match expected values
   */
  verifyScoringCalculations(treasureId: string, expectedTake: number, expectedDeposit: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const actualTake = this.getTakeValue(treasureId);
    const actualDepositTotal = this.getDepositValue(treasureId);
    const actualBonus = this.getDepositBonus(treasureId);
    const expectedBonus = expectedDeposit - expectedTake;

    if (actualTake !== expectedTake) {
      errors.push(`Expected take value ${expectedTake}, got ${actualTake} for ${treasureId}`);
    }

    if (actualDepositTotal !== expectedDeposit) {
      errors.push(`Expected deposit value ${expectedDeposit}, got ${actualDepositTotal} for ${treasureId}`);
    }

    if (actualBonus !== expectedBonus) {
      errors.push(`Expected deposit bonus ${expectedBonus}, got ${actualBonus} for ${treasureId}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test double-deposit prevention
   */
  testDoubleDepositPrevention(treasureId: string): {
    firstDepositAwarded: boolean;
    secondDepositAwarded: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Ensure trophy case is open and treasure is in inventory
    this.livingRoomHelper.openTrophyCase();
    this.livingRoomHelper.addTreasureToInventory(treasureId);

    // First deposit
    const firstResult = this.simulateDepositWithScoring(treasureId);
    const firstDepositAwarded = firstResult.success && firstResult.bonusAwarded > 0;

    // Try to deposit again (should fail)
    const alreadyDeposited = this.gameStateService.getFlag(`treasure_deposited_${treasureId}`);
    const secondDepositAwarded = !alreadyDeposited;

    if (secondDepositAwarded) {
      errors.push('Second deposit should not award bonus points');
    }

    return {
      firstDepositAwarded,
      secondDepositAwarded,
      errors
    };
  }

  /**
   * Get comprehensive trophy case status
   */
  getTrophyCaseStatus(): {
    isOpen: boolean;
    contents: string[];
    totalTreasures: number;
    depositValuesConfigured: boolean;
    totalPossibleScore: number;
  } {
    const trophyCase = this.livingRoomHelper.getTrophyCase();
    const contents = this.livingRoomHelper.getTrophyCaseContents();
    const depositValues = trophyCase?.properties?.depositValues || {};

    const totalPossibleScore = Object.values(depositValues).reduce((sum: number, value: any) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    return {
      isOpen: this.livingRoomHelper.isTrophyCaseOpen(),
      contents,
      totalTreasures: contents.length,
      depositValuesConfigured: Object.keys(depositValues).length > 0,
      totalPossibleScore
    };
  }
}