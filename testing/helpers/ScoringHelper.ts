/**
 * Scoring Helper
 * Provides utilities for testing scoring functionality in integration tests
 */

import { CommandResult } from '@/types/CommandTypes';
import { IGameStateService, IScoringService } from '@/services/interfaces';

export class ScoringHelper {
  constructor(
    private gameState: IGameStateService,
    private scoring: IScoringService
  ) {}

  /**
   * Get current player score
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }

  /**
   * Verify that a command result includes score change
   */
  verifyScoreChange(result: CommandResult, expectedPoints: number): void {
    expect(result.scoreChange).toBeDefined();
    expect(result.scoreChange).toBe(expectedPoints);
  }

  /**
   * Verify that a command result has no score change
   */
  verifyNoScoreChange(result: CommandResult): void {
    // Accept either undefined (not provided) or 0 (explicitly no change)
    if (result.scoreChange !== undefined) {
      expect(result.scoreChange).toBe(0);
    }
  }

  /**
   * Verify score increased by expected amount
   */
  verifyScoreIncrease(initialScore: number, expectedIncrease: number): void {
    const currentScore = this.getCurrentScore();
    expect(currentScore).toBe(initialScore + expectedIncrease);
  }

  /**
   * Verify score remained unchanged
   */
  verifyScoreUnchanged(initialScore: number): void {
    const currentScore = this.getCurrentScore();
    expect(currentScore).toBe(initialScore);
  }

  /**
   * Check if an item is a treasure
   */
  isTreasure(itemId: string): boolean {
    return this.scoring.isTreasure(itemId);
  }

  /**
   * Get treasure base score value
   */
  getTreasureScore(treasureId: string): number {
    return this.scoring.calculateTreasureScore(treasureId);
  }

  /**
   * Get treasure deposit bonus value
   */
  getTreasureDepositScore(treasureId: string): number {
    return this.scoring.calculateDepositScore(treasureId);
  }

  /**
   * Check if a treasure has been found (flag set)
   */
  isTreasureFound(treasureId: string): boolean {
    const flagName = `treasure_found_${treasureId}`;
    return this.gameState.getFlag(flagName);
  }

  /**
   * Check if a treasure has been deposited (flag set)
   */
  isTreasureDeposited(treasureId: string): boolean {
    const flagName = `treasure_deposited_${treasureId}`;
    return this.gameState.getFlag(flagName);
  }

  /**
   * Check if a scoring event has been earned
   */
  isScoringEventEarned(eventId: string): boolean {
    return this.scoring.hasEarnedEvent(eventId);
  }

  /**
   * Get score for a specific event
   */
  getEventScore(eventId: string): number {
    return this.scoring.getEventScore(eventId);
  }

  /**
   * Verify treasure discovery scoring workflow
   */
  verifyTreasureDiscovery(result: CommandResult, treasureId: string): void {
    if (this.isTreasure(treasureId)) {
      const expectedScore = this.getTreasureScore(treasureId);
      if (expectedScore > 0) {
        this.verifyScoreChange(result, expectedScore);
        expect(this.isTreasureFound(treasureId)).toBe(true);
      }
    } else {
      this.verifyNoScoreChange(result);
    }
  }

  /**
   * Verify treasure deposit scoring workflow
   */
  verifyTreasureDeposit(result: CommandResult, treasureId: string, inTrophyCase: boolean = false): void {
    if (this.isTreasure(treasureId) && inTrophyCase) {
      const expectedScore = this.getTreasureDepositScore(treasureId);
      if (expectedScore > 0) {
        this.verifyScoreChange(result, expectedScore);
        expect(this.isTreasureDeposited(treasureId)).toBe(true);
      }
    } else {
      this.verifyNoScoreChange(result);
    }
  }

  /**
   * Verify non-treasure item has no scoring impact
   */
  verifyNonTreasureNoScoring(result: CommandResult, itemId: string): void {
    expect(this.isTreasure(itemId)).toBe(false);
    this.verifyNoScoreChange(result);
    expect(this.isTreasureFound(itemId)).toBe(false);
    expect(this.isTreasureDeposited(itemId)).toBe(false);
  }

  /**
   * Mark a treasure as found (for testing purposes)
   */
  markTreasureFound(treasureId: string): void {
    this.scoring.markTreasureFound(treasureId);
  }

  /**
   * Mark a treasure as deposited (for testing purposes)
   */
  markTreasureDeposited(treasureId: string): void {
    this.scoring.markTreasureDeposited(treasureId);
  }

  /**
   * Reset scoring state for clean tests
   */
  resetScoringState(): void {
    // Reset score to 0
    this.gameState.addScore(-this.gameState.getScore());
    
    // Clear all treasure flags
    const treasureIds = ['coin', 'lamp', 'egg', 'bar', 'emera', 'ruby', 'diamo', 'saffr', 'chali', 'tride', 'bauble', 'coffi'];
    treasureIds.forEach(treasureId => {
      this.gameState.setFlag(`treasure_found_${treasureId}`, false);
      this.gameState.setFlag(`treasure_deposited_${treasureId}`, false);
    });
    
    // Clear scoring event flags
    const eventIds = ['first_treasure', 'defeat_troll', 'defeat_thief', 'open_trophy_case', 'solve_maze', 'reach_endgame'];
    eventIds.forEach(eventId => {
      this.gameState.setFlag(`scoring_event_${eventId}`, false);
    });
  }

  /**
   * Get total treasures found count
   */
  getTotalTreasuresFound(): number {
    return this.scoring.getTotalTreasuresFound();
  }

  /**
   * Get total treasures deposited count
   */
  getTotalTreasuresDeposited(): number {
    return this.scoring.getTotalTreasuresDeposited();
  }

  /**
   * Get maximum possible score
   */
  getMaxScore(): number {
    return this.scoring.getMaxScore();
  }

  /**
   * Verify cumulative scoring across multiple actions
   */
  verifyCumulativeScoring(actions: Array<{result: CommandResult, expectedIncrease: number}>): void {
    let runningTotal = 0;
    const initialScore = this.getCurrentScore();
    
    actions.forEach((action) => {
      runningTotal += action.expectedIncrease;
      this.verifyScoreChange(action.result, action.expectedIncrease);
    });
    
    this.verifyScoreIncrease(initialScore, runningTotal);
  }

  /**
   * Verify scoring event award
   */
  verifyScoringEvent(eventId: string, shouldBeAwarded: boolean = true): void {
    const eventScore = this.getEventScore(eventId);
    const wasAwarded = this.scoring.awardEventScore(eventId);
    
    if (shouldBeAwarded && eventScore > 0) {
      expect(wasAwarded).toBe(true);
      expect(this.isScoringEventEarned(eventId)).toBe(true);
    } else {
      expect(wasAwarded).toBe(false);
    }
  }
}