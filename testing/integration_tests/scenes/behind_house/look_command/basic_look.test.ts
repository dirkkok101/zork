/**
 * Basic Look Command Integration Tests - Behind House Scene
 * Tests fundamental look and look around functionality in behind_house scene
 */

import './setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from './helpers/integration_test_factory';

describe('Basic Look Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Scene Description', () => {
    it('should show scene title and description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });

    it('should show description with "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLookAround();
      
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });
  });

  describe('Exit Display - Window Closed', () => {
    beforeEach(() => {
      // Ensure window starts closed
      testEnv.behindHouseHelper.setWindowClosed();
    });

    it('should display basic exits when window is closed', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyExitInformation(result);
      
      // Verify specific exits (north, south, east should always be available)
      expect(result.message).toContain('north');
      expect(result.message).toContain('south');
      expect(result.message).toContain('east');
    });

    it('should not show kitchen access when window is closed', async () => {
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifySuccess(result);
      
      // Should not show window exit description when closed
      expect(result.message).not.toContain('You see window west');
    });
  });

  describe('Exit Display - Window Open', () => {
    beforeEach(() => {
      // Open the window for kitchen access
      testEnv.behindHouseHelper.setWindowOpen();
    });

    it('should display all exits when window is open', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyExitInformation(result);
      testEnv.lookCommandHelper.verifyWindowExitInformation(result);
      
      // Verify all exits including window access
      expect(result.message).toContain('north');
      expect(result.message).toContain('south');
      expect(result.message).toContain('east');
      expect(result.message).toContain('west');
      expect(result.message).toContain('in');
    });

    it('should show window exit description when open', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyWindowExitDescription(result);
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
    });
  });

  describe('Window Item Display', () => {
    it('should display the window item', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyWindowVisible(result);
      testEnv.lookCommandHelper.verifyItemInformation(result, ['windo']);
    });

    it('should verify window is present in scene items', async () => {
      const sceneItems = testEnv.behindHouseHelper.getSceneItems();
      
      expect(sceneItems).toContain('windo');
      expect(sceneItems).toHaveLength(1); // Only the window
    });

    it('should verify window properties', () => {
      testEnv.behindHouseHelper.verifyWindowProperties();
    });
  });

  describe('State Tracking', () => {
    it('should not increment move counter', async () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      const finalMoves = testEnv.lookCommandHelper.getCurrentMoves();
      expect(finalMoves).toBe(initialMoves);
    });

    it('should not change score', async () => {
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore);
    });

    it('should set visited flag after first look', async () => {
      // Ensure starting state
      expect(testEnv.behindHouseHelper.isFirstVisit()).toBe(true);
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      // Should now be marked as visited
      expect(testEnv.behindHouseHelper.isFirstVisit()).toBe(false);
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });
  });

  describe('Atmospheric Elements', () => {
    it('should verify scene has atmospheric messages', () => {
      testEnv.behindHouseHelper.verifyAtmosphere();
    });

    it('should verify scene lighting is daylight', () => {
      testEnv.behindHouseHelper.verifyLighting();
    });

    it('should include atmospheric descriptions in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Atmospheric messages are defined in scene data but may not always display
      // This is expected Zork behavior - atmospheric messages are occasional
      testEnv.lookCommandHelper.verifyAtmosphericMessage(result);
    });

    it('should include scene title in description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      expect(result.message).toContain('Behind House');
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
      testEnv.behindHouseHelper.markAsVisited();
      
      const lookResult = testEnv.lookCommandHelper.executeLook('look');
      const lResult = testEnv.lookCommandHelper.executeLook('l');
      const lookAroundResult = testEnv.lookCommandHelper.executeLook('look around');
      
      // All should be successful and contain same core content
      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySuccess(lResult);
      testEnv.lookCommandHelper.verifySuccess(lookAroundResult);
      
      // Should all contain scene title
      expect(lookResult.message).toContain('Behind House');
      expect(lResult.message).toContain('Behind House');
      expect(lookAroundResult.message).toContain('Behind House');
    });
  });

  describe('Window State Consistency', () => {
    it('should maintain window state across look commands', async () => {
      // Start with window closed
      testEnv.behindHouseHelper.setWindowClosed();
      
      testEnv.lookCommandHelper.executeBasicLook();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      // Open window
      testEnv.behindHouseHelper.setWindowOpen();
      
      const openResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      testEnv.lookCommandHelper.verifyWindowExitDescription(openResult);
    });

    it('should show different exit descriptions based on window state', async () => {
      // Test closed window state
      testEnv.behindHouseHelper.setWindowClosed();
      const closedResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(closedResult.message).not.toContain('You see window west');
      
      // Test open window state
      testEnv.behindHouseHelper.setWindowOpen();
      const openResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(openResult);
    });
  });
});