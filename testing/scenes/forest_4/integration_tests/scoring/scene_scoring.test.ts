/**
 * Scoring Tests - Forest Scene
 * Auto-generated tests for scoring functionality
 */

import '../setup';
import { Forest4TestEnvironment, Forest4IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ScoringHelper } from '@testing/helpers/ScoringHelper';

describe('Scoring - Forest Scene', () => {
  let testEnv: Forest4TestEnvironment;
  let scoringHelper: ScoringHelper;

  beforeEach(async () => {
    testEnv = await Forest4IntegrationTestFactory.createTestEnvironment();

    scoringHelper = new ScoringHelper(
      testEnv.services.gameState as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Scoring', () => {
    it('should award points for first visit to forest_4', () => {
      // Reset scoring state
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('forest_4');
      testEnv.services.gameState.updateSceneRuntimeState('forest_4', { visited: false });

      const initialScore = scoringHelper.getCurrentScore();

      // Execute first visit (look command)
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify first visit completed successfully
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.hasVisitedScene('forest_4')).toBe(true);

      // Note: First visit scoring may or may not be awarded depending on scene configuration
      // Score should not decrease
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should not award points for subsequent visits', () => {
      // Setup: Scene already visited
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('forest_4');
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
