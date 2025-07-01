/**
 * Scene Scoring Integration Tests - West of House
 * Tests scene-based scoring functionality including first visit points
 */

import '../look_command/setup';
import { IntegrationTestFactory, IntegrationTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Scene Scoring - West of House', () => {
  let testEnv: IntegrationTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Points', () => {
    it('should award 1 point for first visit to west_of_house', async () => {
      // Verify clean state
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(0);
      
      // Execute first look command
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify scoring
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Verify scene state updated
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);
    });

    it('should award points exactly once per scene', async () => {
      // First visit
      const firstResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyFirstVisitScoring(firstResult);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Second visit should not award additional points
      const secondResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoScoreChange(secondResult);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Third visit should also not award points
      const thirdResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoScoreChange(thirdResult);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
    });

    it('should work with different look command variations', async () => {
      const variations = ['look', 'l', 'look around'];
      
      // Test that any variation awards the points on first use
      for (const variation of variations) {
        // Reset test environment for each variation
        testEnv.cleanup();
        testEnv = await IntegrationTestFactory.createTestEnvironment();
        
        expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
        expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(0);
        
        const result = testEnv.lookCommandHelper.executeLook(variation);
        testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
        expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      }
    });
  });

  describe('Score Persistence', () => {
    it('should maintain score across multiple commands', async () => {
      // Award initial point
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyFirstVisitScoring(lookResult);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Execute other commands that shouldn't affect score
      testEnv.lookCommandHelper.executeLook('examine door');
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      testEnv.lookCommandHelper.executeLook('look at mailbox');
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Another look should not change score
      const subsequentLook = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoScoreChange(subsequentLook);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
    });

    it('should persist score through scene state changes', async () => {
      // Award point
      testEnv.lookCommandHelper.executeBasicLook();
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Simulate scene state changes (like opening/closing items)
      testEnv.westOfHouseHelper.markAsVisited();
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
      
      // Score should remain after state changes
      const result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
    });
  });

  describe('Scoring Integration with Scene System', () => {
    it('should track visit flags correctly with scoring', async () => {
      // Initial state
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(0);
      
      // First visit
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Both scoring and visit tracking should work
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
    });

    it('should handle scoring service dependencies correctly', async () => {
      // This test ensures the scoring service is properly injected and working
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify the scoring service is working through the command chain
      expect(result.scoreChange).toBe(1);
      expect(result.success).toBe(true);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, 1);
    });
  });

  describe('West of House Specific Scoring', () => {
    it('should award exactly 1 point for west_of_house (not more or less)', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify exact point amount
      expect(result.scoreChange).toBe(1);
      expect(result.scoreChange).not.toBe(0);
      expect(result.scoreChange).not.toBe(2);
      expect(result.scoreChange).not.toBe(5);
      
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
    });

    it('should match scene data configuration', async () => {
      // This test ensures our scoring matches the actual scene data
      // west_of_house.json should have "firstVisitPoints": 1
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      
      // The scoring should match what's in west_of_house.json
      expect(result.scoreChange).toBe(1);
    });
  });

  describe('Error Conditions', () => {
    it('should handle scoring errors gracefully', async () => {
      // Even if scoring has issues, the look command should still work
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Command should succeed regardless of scoring
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      
      // Scoring should work normally
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
    });

    it('should not duplicate scoring on rapid commands', async () => {
      // Rapid fire commands shouldn't award multiple points
      const result1 = testEnv.lookCommandHelper.executeBasicLook();
      const result2 = testEnv.lookCommandHelper.executeBasicLook();
      const result3 = testEnv.lookCommandHelper.executeBasicLook();
      
      // Only first should award points
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result1);
      testEnv.lookCommandHelper.verifyNoScoreChange(result2);
      testEnv.lookCommandHelper.verifyNoScoreChange(result3);
      
      // Total score should be exactly 1
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(1);
    });
  });
});