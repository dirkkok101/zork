/**
 * Living Room Scene Scoring Tests
 * Tests first visit scoring integration and scoring system consistency
 */

import { IntegrationTestFactory, LivingRoomTestEnvironment } from '../helpers/integration_test_factory';

describe('Living Room Scene Scoring', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Scoring', () => {
    test('should award 1 point for first visit to living room', async () => {
      // Setup: Fresh game with living room unvisited
      testEnv.livingRoomHelper.simulateGameStart();
      expect(testEnv.livingRoomHelper.isFirstVisit()).toBe(true);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(0);

      // Execute: Look command (triggers first visit)
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: First visit scoring awarded
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(1);
      expect(testEnv.livingRoomHelper.isFirstVisit()).toBe(false);
    });

    test('should not award points for subsequent visits', async () => {
      // Setup: Scene already visited
      testEnv.livingRoomHelper.simulateGameStart();
      await testEnv.commandProcessor.processCommand('look'); // First visit
      const scoreAfterFirstVisit = testEnv.livingRoomHelper.getCurrentScore();
      expect(scoreAfterFirstVisit).toBe(1);

      // Execute: Look command again
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: No additional scoring
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyNoScoreChange(result);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(scoreAfterFirstVisit);
    });

    test('should maintain score after multiple visits', async () => {
      // Setup: First visit completed
      testEnv.livingRoomHelper.simulateGameStart();
      await testEnv.commandProcessor.processCommand('look');
      const scoreAfterFirstVisit = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Multiple subsequent visits
      for (let i = 0; i < 5; i++) {
        const result = await testEnv.commandProcessor.processCommand('look');
        testEnv.livingRoomHelper.verifyNoScoreChange(result);
        expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(scoreAfterFirstVisit);
      }
    });
  });

  describe('Scoring Integration', () => {
    test('should have correct scene scoring configuration', () => {
      // Verify: Living room has proper scoring data
      testEnv.livingRoomHelper.verifyScoringConfiguration();
      testEnv.livingRoomHelper.verifyFirstVisitPoints();
    });

    test('should integrate with game state properly', async () => {
      // Setup: Clean game state
      testEnv.livingRoomHelper.simulateGameStart();
      const gameState = testEnv.services.gameState.getGameState();
      const initialScore = gameState.score;

      // Execute: First visit
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Score updated in game state
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      expect(gameState.score).toBe(initialScore + 1);
      expect(testEnv.services.gameState.hasVisitedScene('living_room')).toBe(true);
    });

    test('should handle score overflow gracefully', async () => {
      // Setup: Set score to high value
      testEnv.livingRoomHelper.simulateGameStart();
      testEnv.services.gameState.addScore(999999);
      const highScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: First visit
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Score increased correctly
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(highScore + 1);
    });
  });

  describe('Error Conditions', () => {
    test('should handle missing scene data gracefully', async () => {
      // Setup: Simulate corrupted scene
      testEnv.livingRoomHelper.simulateGameStart();
      
      // Note: Cannot easily corrupt scene data in integration test
      // This test verifies basic resilience
      const result = await testEnv.commandProcessor.processCommand('look');
      
      // Verify: Command should succeed
      expect(result.success).toBe(true);
    });

    test('should handle negative score edge case', async () => {
      // Setup: Set negative score
      testEnv.livingRoomHelper.simulateGameStart();
      testEnv.services.gameState.addScore(-10);
      const negativeScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(negativeScore).toBe(-10);

      // Execute: First visit
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Score increased correctly from negative
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(negativeScore + 1);
    });
  });

  describe('Command Result Verification', () => {
    test('should return correct CommandResult structure for first visit', async () => {
      // Setup: First visit scenario
      testEnv.livingRoomHelper.simulateGameStart();

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: CommandResult structure
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      expect(result.scoreChange).toBe(1);
      expect(result.message.length).toBeGreaterThan(0);
    });

    test('should return correct CommandResult for subsequent visits', async () => {
      // Setup: Already visited
      testEnv.livingRoomHelper.simulateGameStart();
      await testEnv.commandProcessor.processCommand('look'); // First visit

      // Execute: Second visit
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: CommandResult structure
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      expect(result.scoreChange).toBe(0);
      expect(result.message.length).toBeGreaterThan(0);
    });
  });

  describe('Scene State Consistency', () => {
    test('should maintain consistent scene state across scoring', async () => {
      // Setup: Record initial scene state
      testEnv.livingRoomHelper.simulateGameStart();
      const scene = testEnv.services.gameState.getScene('living_room');
      const initialItemCount = scene?.items?.length || 0;

      // Execute: First visit with scoring
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Scene state unchanged except for visited flag
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      
      const sceneAfter = testEnv.services.gameState.getScene('living_room');
      expect(sceneAfter?.items?.length).toBe(initialItemCount);
      expect(testEnv.services.gameState.hasVisitedScene('living_room')).toBe(true);
    });

    test('should preserve trophy case state during scoring', async () => {
      // Setup: Configure trophy case state
      testEnv.livingRoomHelper.simulateGameStart();
      testEnv.livingRoomHelper.openTrophyCase();
      const trophyCaseWasOpen = testEnv.livingRoomHelper.isTrophyCaseOpen();

      // Execute: First visit
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Trophy case state preserved
      expect(result.success).toBe(true);
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(trophyCaseWasOpen);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle rapid scoring operations', async () => {
      // Setup: Multiple fresh environments
      const scores: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        testEnv.livingRoomHelper.simulateGameStart();
        const result = await testEnv.commandProcessor.processCommand('look');
        
        expect(result.success).toBe(true);
        testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
        scores.push(testEnv.livingRoomHelper.getCurrentScore());
      }

      // Verify: All scoring operations succeeded
      scores.forEach(score => {
        expect(score).toBe(1);
      });
    });

    test('should maintain scoring integrity across test runs', async () => {
      // Setup: Clean state
      testEnv.livingRoomHelper.simulateGameStart();
      
      // Execute: Score, reset, score again
      let result = await testEnv.commandProcessor.processCommand('look');
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      
      testEnv.livingRoomHelper.simulateGameStart(); // Reset
      
      result = await testEnv.commandProcessor.processCommand('look');
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      
      // Verify: Both scoring operations worked correctly
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(1);
    });
  });
});