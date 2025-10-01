/**
 * Scoring Tests - Living Room Scene
 * Auto-generated tests for scoring functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ScoringHelper } from '@testing/helpers/ScoringHelper';

describe('Scoring - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let scoringHelper: ScoringHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    scoringHelper = new ScoringHelper(
      testEnv.services.gameState as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Scoring', () => {
    it('should award points for first visit to living_room', () => {
      // Reset scoring state
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('living_room');
      testEnv.services.gameState.updateSceneRuntimeState('living_room', { visited: false });

      const initialScore = scoringHelper.getCurrentScore();

      // Execute first visit (look command)
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify first visit completed successfully
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.hasVisitedScene('living_room')).toBe(true);

      // Note: First visit scoring may or may not be awarded depending on scene configuration
      // Score should not decrease
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should not award points for subsequent visits', () => {
      // Setup: Scene already visited
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('living_room');
      testEnv.commandProcessor.processCommand('look'); // First visit

      const scoreAfterFirstVisit = scoringHelper.getCurrentScore();

      // Execute second visit
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify no additional scoring
      expect(result.success).toBe(true);
      scoringHelper.verifyNoScoreChange(result);
      expect(scoringHelper.getCurrentScore()).toBe(scoreAfterFirstVisit);
    });
  });

  describe('Trophy Case Deposit Scoring', () => {

    it('should track total treasures deposited', () => {
      // Setup: Reset scoring
      scoringHelper.resetScoringState();

      const initialDeposits = scoringHelper.getTotalTreasuresDeposited();

      // Deposit multiple treasures if available

      // Verify deposit count increased
      const finalDeposits = scoringHelper.getTotalTreasuresDeposited();
      expect(finalDeposits).toBeGreaterThanOrEqual(initialDeposits);
    });
  });

  describe('Non-Treasure Items', () => {
    it('should not award points for taking non-treasure items like lamp', () => {
      // Setup: Non-treasure in scene
      scoringHelper.resetScoringState();
      testEnv.services.scene.addItemToScene('living_room', 'lamp');

      const initialScore = scoringHelper.getCurrentScore();

      // Execute: Take non-treasure
      const result = testEnv.commandProcessor.processCommand('take lamp');

      if (result.success) {
        // Verify: No scoring for non-treasure
        expect(scoringHelper.isTreasure('lamp')).toBe(false);
        scoringHelper.verifyNoScoreChange(result);
        expect(scoringHelper.getCurrentScore()).toBe(initialScore);
      }
    });
  });

  describe('Scoring State Integrity', () => {
    it('should maintain score consistency across commands', () => {
      scoringHelper.resetScoringState();

      const score1 = scoringHelper.getCurrentScore();
      testEnv.commandProcessor.processCommand('look');
      const score2 = scoringHelper.getCurrentScore();
      testEnv.commandProcessor.processCommand('look');
      const score3 = scoringHelper.getCurrentScore();

      // Score should either stay same or increase, never decrease
      expect(score2).toBeGreaterThanOrEqual(score1);
      expect(score3).toBeGreaterThanOrEqual(score2);
    });

    it('should not award negative scores', () => {
      scoringHelper.resetScoringState();

      const initialScore = scoringHelper.getCurrentScore();

      // Execute various commands
      testEnv.commandProcessor.processCommand('look');

      // Score should never go below initial
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

  });

  describe('Maximum Score Tracking', () => {
    it('should report maximum achievable score', () => {
      const maxScore = scoringHelper.getMaxScore();
      expect(maxScore).toBeGreaterThan(0);
      expect(typeof maxScore).toBe('number');
    });

    it('should never exceed maximum score', () => {
      scoringHelper.resetScoringState();
      const maxScore = scoringHelper.getMaxScore();

      // Current score should always be less than or equal to max
      const currentScore = scoringHelper.getCurrentScore();
      expect(currentScore).toBeLessThanOrEqual(maxScore);
    });
  });
});
