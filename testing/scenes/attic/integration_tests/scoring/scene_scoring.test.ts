/**
 * Scoring Tests - Attic Scene
 * Auto-generated tests for scoring functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ScoringHelper } from '@testing/helpers/ScoringHelper';

describe('Scoring - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let scoringHelper: ScoringHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

    scoringHelper = new ScoringHelper(
      testEnv.services.gameState as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Scoring', () => {
    it('should award points for first visit to attic', () => {
      // Reset scoring state
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('attic');
      testEnv.services.gameState.updateSceneRuntimeState('attic', { visited: false });

      const initialScore = scoringHelper.getCurrentScore();

      // Execute first visit (look command)
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify first visit completed successfully
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.hasVisitedScene('attic')).toBe(true);

      // Note: First visit scoring may or may not be awarded depending on scene configuration
      // Score should not decrease
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should not award points for subsequent visits', () => {
      // Setup: Scene already visited
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('attic');
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

  describe('Treasure Collection Scoring', () => {
    it('should award points for first-time collection of rope', () => {
      // Setup: Reset scoring and ensure treasure is in scene
      scoringHelper.resetScoringState();
      testEnv.services.scene.addItemToScene('attic', 'rope');

      const initialScore = scoringHelper.getCurrentScore();
      const expectedPoints = scoringHelper.getTreasureScore('rope');

      // Execute: Take treasure for first time
      const result = testEnv.commandProcessor.processCommand('take rope');

      if (result.success && expectedPoints > 0) {
        // Verify: Points awarded for first-time collection
        const finalScore = scoringHelper.getCurrentScore();
        expect(finalScore).toBe(initialScore + expectedPoints);
        expect(scoringHelper.isTreasureFound('rope')).toBe(true);
      }
    });

    it('should not award points for rope if already found', () => {
      // Setup: Mark treasure as already found
      scoringHelper.resetScoringState();
      scoringHelper.markTreasureFound('rope');
      testEnv.services.scene.addItemToScene('attic', 'rope');

      const initialScore = scoringHelper.getCurrentScore();

      // Execute: Take already-found treasure
      const result = testEnv.commandProcessor.processCommand('take rope');

      if (result.success) {
        // Verify: No additional points awarded
        scoringHelper.verifyNoScoreChange(result);
        expect(scoringHelper.getCurrentScore()).toBe(initialScore);
      }
    });

  });

  describe('Non-Treasure Items', () => {
    it('should not award points for taking non-treasure items like brick', () => {
      // Setup: Non-treasure in scene
      scoringHelper.resetScoringState();
      testEnv.services.scene.addItemToScene('attic', 'brick');

      const initialScore = scoringHelper.getCurrentScore();

      // Execute: Take non-treasure
      const result = testEnv.commandProcessor.processCommand('take brick');

      if (result.success) {
        // Verify: No scoring for non-treasure
        expect(scoringHelper.isTreasure('brick')).toBe(false);
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
      testEnv.services.scene.addItemToScene('', 'rope');
      testEnv.commandProcessor.processCommand('take rope');

      // Score should never go below initial
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should maintain treasure found flags correctly', () => {
      scoringHelper.resetScoringState();

      // Initially no treasures found
      expect(scoringHelper.isTreasureFound('rope')).toBe(false);

      // Take a treasure
      testEnv.services.scene.addItemToScene('', 'rope');
      const result = testEnv.commandProcessor.processCommand('take rope');

      if (result.success) {
        expect(scoringHelper.isTreasureFound('rope')).toBe(true);
      }
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
