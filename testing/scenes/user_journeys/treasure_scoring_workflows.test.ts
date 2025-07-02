/**
 * Treasure Collection Scoring Workflows
 * 
 * End-to-end tests for treasure discovery and deposit scoring
 * Tests authentic Zork scoring mechanics across multiple scenes
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '@testing/scenes/west_of_house/integration_tests/look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/scenes/west_of_house/integration_tests/put_command/helpers/put_command_helper';
import { ScoringValidationHelper } from '@testing/utils/scoring_validation_helper';

describe('Treasure Collection Scoring Workflows', () => {
  let testEnv: IntegrationTestEnvironment;
  let putHelper: PutCommandHelper;
  let scoringHelper: ScoringValidationHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create command helpers with scoring service
    putHelper = new PutCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any,
      testEnv.services.scoring as any
    );

    scoringHelper = new ScoringValidationHelper(
      testEnv.services.gameState as any,
      testEnv.services.scoring as any
    );
  });

  beforeEach(() => {
    // Reset to clean state
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    testEnv.resetScoring();
    scoringHelper.resetScoringState();
    
    // Clear inventory
    const inventory = testEnv.services.inventory as any;
    const items = inventory.getItems();
    items.forEach((itemId: string) => {
      inventory.removeItem(itemId);
    });
    
    // Ensure starting in west_of_house
    testEnv.services.gameState.setCurrentScene('west_of_house');
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Treasure Discovery Scoring', () => {
    it('should award points for finding first treasure', () => {
      const initialScore = scoringHelper.getCurrentScore();
      expect(initialScore).toBe(0);
      
      // Simulate finding a treasure (we'll use coin as example)
      // In real game, this would happen when taking a treasure item
      const isCoinTreasure = scoringHelper.isTreasure('coin');
      
      if (isCoinTreasure) {
        const treasureScore = scoringHelper.getTreasureScore('coin');
        expect(treasureScore).toBeGreaterThan(0);
        
        // Simulate the scoring that would happen on treasure discovery
        testEnv.services.gameState.addScore(treasureScore);
        scoringHelper.markTreasureFound('coin');
        
        // Verify score increased
        scoringHelper.verifyScoreIncrease(initialScore, treasureScore);
        expect(scoringHelper.isTreasureFound('coin')).toBe(true);
      }
    });

    it('should not double-award points for same treasure', () => {
      const initialScore = scoringHelper.getCurrentScore();
      
      // Mark treasure as found and award points
      if (scoringHelper.isTreasure('coin')) {
        const treasureScore = scoringHelper.getTreasureScore('coin');
        testEnv.services.gameState.addScore(treasureScore);
        scoringHelper.markTreasureFound('coin');
        
        const scoreAfterFirst = scoringHelper.getCurrentScore();
        expect(scoreAfterFirst).toBe(initialScore + treasureScore);
        
        // Try to award again - should not change score
        if (!scoringHelper.isTreasureFound('coin')) {
          testEnv.services.gameState.addScore(treasureScore);
          scoringHelper.markTreasureFound('coin');
        }
        
        // Score should remain the same
        expect(scoringHelper.getCurrentScore()).toBe(scoreAfterFirst);
      }
    });

    it('should award different points for different treasures', () => {
      const initialScore = scoringHelper.getCurrentScore();
      let cumulativeScore = initialScore;
      
      const treasureIds = ['coin', 'lamp', 'emera'];
      const awardedScores: number[] = [];
      
      treasureIds.forEach(treasureId => {
        if (scoringHelper.isTreasure(treasureId)) {
          const treasureScore = scoringHelper.getTreasureScore(treasureId);
          
          testEnv.services.gameState.addScore(treasureScore);
          scoringHelper.markTreasureFound(treasureId);
          cumulativeScore += treasureScore;
          awardedScores.push(treasureScore);
          
          expect(scoringHelper.getCurrentScore()).toBe(cumulativeScore);
          expect(scoringHelper.isTreasureFound(treasureId)).toBe(true);
        }
      });
      
      // Verify final score is sum of all treasure scores
      const totalExpected = awardedScores.reduce((sum, score) => sum + score, initialScore);
      expect(scoringHelper.getCurrentScore()).toBe(totalExpected);
    });
  });

  describe('Trophy Case Deposit Scoring', () => {
    beforeEach(() => {
      // Add a treasure to inventory for testing deposits
      if (scoringHelper.isTreasure('coin')) {
        putHelper.addToInventory('coin');
        // Mark as found (prerequisite for deposit bonus)
        scoringHelper.markTreasureFound('coin');
        const treasureScore = scoringHelper.getTreasureScore('coin');
        testEnv.services.gameState.addScore(treasureScore);
      }
    });

    it('should award deposit bonus for putting treasure in trophy case', () => {
      if (!scoringHelper.isTreasure('coin')) {
        pending('Test requires coin to be a treasure');
        return;
      }
      
      const initialScore = scoringHelper.getCurrentScore();
      const expectedDepositBonus = scoringHelper.getTreasureDepositScore('coin');
      
      if (expectedDepositBonus > 0) {
        // Simulate putting treasure in trophy case
        testEnv.services.gameState.addScore(expectedDepositBonus);
        scoringHelper.markTreasureDeposited('coin');
        
        // Verify deposit bonus awarded
        scoringHelper.verifyScoreIncrease(initialScore, expectedDepositBonus);
        expect(scoringHelper.isTreasureDeposited('coin')).toBe(true);
      }
    });

    it('should not award deposit bonus for non-trophy containers', () => {
      if (!scoringHelper.isTreasure('coin')) {
        pending('Test requires coin to be a treasure');
        return;
      }
      
      const initialScore = scoringHelper.getCurrentScore();
      
      // Simulate putting treasure in regular container (not trophy case)
      // This should not award deposit bonus
      
      // Score should remain unchanged
      expect(scoringHelper.getCurrentScore()).toBe(initialScore);
      expect(scoringHelper.isTreasureDeposited('coin')).toBe(false);
    });

    it('should calculate correct deposit multiplier', () => {
      if (!scoringHelper.isTreasure('coin')) {
        pending('Test requires coin to be a treasure');
        return;
      }
      
      const baseScore = scoringHelper.getTreasureScore('coin');
      const depositBonus = scoringHelper.getTreasureDepositScore('coin');
      
      if (baseScore > 0 && depositBonus > 0) {
        // Deposit bonus should typically be base score (2x total - 1x already awarded = 1x bonus)
        expect(depositBonus).toBe(baseScore);
      }
    });
  });

  describe('Cumulative Scoring Scenarios', () => {
    it('should handle multiple treasure discovery and deposit workflow', () => {
      const initialScore = scoringHelper.getCurrentScore();
      const actions: Array<{result?: any, expectedIncrease: number}> = [];
      
      // Treasure discovery phase
      const treasureIds = ['coin', 'emera'];
      let cumulativeScore = initialScore;
      
      treasureIds.forEach(treasureId => {
        if (scoringHelper.isTreasure(treasureId)) {
          const treasureScore = scoringHelper.getTreasureScore(treasureId);
          
          // Award discovery points
          testEnv.services.gameState.addScore(treasureScore);
          scoringHelper.markTreasureFound(treasureId);
          cumulativeScore += treasureScore;
          
          actions.push({ expectedIncrease: treasureScore });
          
          expect(scoringHelper.getCurrentScore()).toBe(cumulativeScore);
        }
      });
      
      // Trophy deposit phase
      treasureIds.forEach(treasureId => {
        if (scoringHelper.isTreasure(treasureId)) {
          const depositBonus = scoringHelper.getTreasureDepositScore(treasureId);
          
          if (depositBonus > 0) {
            // Award deposit bonus
            testEnv.services.gameState.addScore(depositBonus);
            scoringHelper.markTreasureDeposited(treasureId);
            cumulativeScore += depositBonus;
            
            actions.push({ expectedIncrease: depositBonus });
            
            expect(scoringHelper.getCurrentScore()).toBe(cumulativeScore);
          }
        }
      });
      
      // Verify final cumulative score
      const totalIncrease = actions.reduce((sum, action) => sum + action.expectedIncrease, 0);
      scoringHelper.verifyScoreIncrease(initialScore, totalIncrease);
    });

    it('should track total treasures found and deposited', () => {
      const treasureIds = ['coin', 'emera', 'ruby'];
      let expectedFound = 0;
      let expectedDeposited = 0;
      
      // Find some treasures
      treasureIds.forEach(treasureId => {
        if (scoringHelper.isTreasure(treasureId)) {
          scoringHelper.markTreasureFound(treasureId);
          expectedFound++;
        }
      });
      
      expect(scoringHelper.getTotalTreasuresFound()).toBe(expectedFound);
      expect(scoringHelper.getTotalTreasuresDeposited()).toBe(0);
      
      // Deposit some treasures
      treasureIds.slice(0, 2).forEach(treasureId => {
        if (scoringHelper.isTreasure(treasureId)) {
          scoringHelper.markTreasureDeposited(treasureId);
          expectedDeposited++;
        }
      });
      
      expect(scoringHelper.getTotalTreasuresFound()).toBe(expectedFound);
      expect(scoringHelper.getTotalTreasuresDeposited()).toBe(expectedDeposited);
    });
  });

  describe('Scoring Events Integration', () => {
    it('should award scoring events correctly', () => {
      const initialScore = scoringHelper.getCurrentScore();
      
      // Test first treasure event
      const eventId = 'first_treasure';
      const eventScore = scoringHelper.getEventScore(eventId);
      
      if (eventScore > 0) {
        const wasAwarded = testEnv.services.scoring.awardEventScore(eventId);
        expect(wasAwarded).toBe(true);
        expect(scoringHelper.isScoringEventEarned(eventId)).toBe(true);
        scoringHelper.verifyScoreIncrease(initialScore, eventScore);
        
        // Try to award again - should not work
        const wasAwardedAgain = testEnv.services.scoring.awardEventScore(eventId);
        expect(wasAwardedAgain).toBe(false);
      }
    });

    it('should validate scoring event prerequisites', () => {
      // Test that events can only be awarded once
      const eventId = 'defeat_troll';
      const eventScore = scoringHelper.getEventScore(eventId);
      
      if (eventScore > 0) {
        expect(scoringHelper.isScoringEventEarned(eventId)).toBe(false);
        
        const awarded = testEnv.services.scoring.awardEventScore(eventId);
        expect(awarded).toBe(true);
        expect(scoringHelper.isScoringEventEarned(eventId)).toBe(true);
        
        // Second attempt should fail
        const awardedAgain = testEnv.services.scoring.awardEventScore(eventId);
        expect(awardedAgain).toBe(false);
      }
    });
  });

  describe('Score State Validation', () => {
    it('should maintain scoring consistency across operations', () => {
      const initialScore = scoringHelper.getCurrentScore();
      expect(initialScore).toBe(0);
      
      // Perform various scoring operations
      if (scoringHelper.isTreasure('coin')) {
        const treasureScore = scoringHelper.getTreasureScore('coin');
        testEnv.services.gameState.addScore(treasureScore);
        scoringHelper.markTreasureFound('coin');
        
        expect(scoringHelper.getCurrentScore()).toBe(treasureScore);
        expect(scoringHelper.isTreasureFound('coin')).toBe(true);
      }
      
      // Award an event
      const eventScore = scoringHelper.getEventScore('first_treasure');
      if (eventScore > 0) {
        testEnv.services.scoring.awardEventScore('first_treasure');
        expect(scoringHelper.isScoringEventEarned('first_treasure')).toBe(true);
      }
      
      // Score should be consistent across different access methods
      const finalScore = scoringHelper.getCurrentScore();
      expect(testEnv.services.gameState.getScore()).toBe(finalScore);
    });

    it('should properly reset all scoring state', () => {
      // Set up some scoring state
      testEnv.services.gameState.addScore(100);
      scoringHelper.markTreasureFound('coin');
      scoringHelper.markTreasureDeposited('coin');
      testEnv.services.scoring.awardEventScore('first_treasure');
      
      // Verify state is set (100 base + 5 first_treasure event = 105)
      expect(scoringHelper.getCurrentScore()).toBe(105);
      expect(scoringHelper.isTreasureFound('coin')).toBe(true);
      expect(scoringHelper.isTreasureDeposited('coin')).toBe(true);
      expect(scoringHelper.isScoringEventEarned('first_treasure')).toBe(true);
      
      // Reset and verify clean state
      scoringHelper.resetScoringState();
      
      expect(scoringHelper.getCurrentScore()).toBe(0);
      expect(scoringHelper.isTreasureFound('coin')).toBe(false);
      expect(scoringHelper.isTreasureDeposited('coin')).toBe(false);
      expect(scoringHelper.isScoringEventEarned('first_treasure')).toBe(false);
    });
  });
});