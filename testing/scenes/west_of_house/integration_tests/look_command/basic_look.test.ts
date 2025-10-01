/**
 * Basic Look Command Integration Tests
 * Auto-generated tests for look functionality in West of House
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from './helpers/integration_test_factory';

describe('Basic Look Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Look', () => {
    it('should show first visit description on initial look and award 1 point', async () => {
      // Verify this is the first visit
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);

      // Get initial score
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();

      // Execute look command
      const result = testEnv.lookCommandHelper.executeBasicLook();

      // Verify first visit description
      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);

      // Verify first visit scoring
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, 1);

      // Verify scene is now marked as visited
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });

    it('should show first visit description with "look around" and award 1 point', async () => {
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, 1);
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });
  });

  describe('Subsequent Visit Look', () => {
    beforeEach(() => {
      // Mark scene as visited first
      testEnv.westOfHouseHelper.markAsVisited();
    });

    it('should show regular description on look', async () => {
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);

      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('West of House');
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });

    it('should show regular description with "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('West of House');
    });
  });

  describe('Exit Display', () => {
    it('should display available exits in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toMatch(/exits?:/i);
      expect(result.message).toContain('north');
      expect(result.message).toContain('south');
      expect(result.message).toContain('west');
    });

    it('should verify expected exits are actually available', () => {
      testEnv.westOfHouseHelper.verifyExpectedExits();
    });
  });

  describe('Atmospheric Elements', () => {
    it('should verify scene has atmospheric messages', () => {
      testEnv.westOfHouseHelper.verifyAtmosphere();
    });

    it('should verify scene lighting is daylight', () => {
      testEnv.westOfHouseHelper.verifyLighting();
    });

    it('should include scene title in description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      expect(result.message).toContain('West of House');
    });
  });

  describe('State Tracking', () => {
    it('should not increment move counter', async () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();

      testEnv.lookCommandHelper.executeBasicLook();

      const finalMoves = testEnv.lookCommandHelper.getCurrentMoves();
      expect(finalMoves).toBe(initialMoves);
    });

    it('should change score by 1 on first visit', async () => {
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeBasicLook();

      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore + 1);
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
    });

    it('should set visited flag after first look', async () => {
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);

      testEnv.lookCommandHelper.executeBasicLook();

      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);
    });

    it('should not award points on subsequent looks', async () => {
      testEnv.westOfHouseHelper.markAsVisited();
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeBasicLook();

      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept "look" command', async () => {
      const result = testEnv.lookCommandHelper.executeLook('look');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should accept "l" shorthand', async () => {
      const result = testEnv.lookCommandHelper.executeLook('l');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should accept "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLook('look around');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should produce same result for all basic look variations', async () => {
      // Mark as visited first to avoid first-visit differences
      testEnv.westOfHouseHelper.markAsVisited();

      const lookResult = testEnv.lookCommandHelper.executeLook('look');
      const lResult = testEnv.lookCommandHelper.executeLook('l');
      const lookAroundResult = testEnv.lookCommandHelper.executeLook('look around');

      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySuccess(lResult);
      testEnv.lookCommandHelper.verifySuccess(lookAroundResult);

      expect(lookResult.message).toContain('West of House');
      expect(lResult.message).toContain('West of House');
      expect(lookAroundResult.message).toContain('West of House');
    });
  });
});
