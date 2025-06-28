/**
 * Basic Look Command Integration Tests
 * Tests fundamental look and look around functionality in west_of_house scene
 */

import './setup';
import { IntegrationTestFactory, IntegrationTestEnvironment } from './helpers/integration_test_factory';

describe('Basic Look Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Look', () => {
    it('should show first visit description on initial look', async () => {
      // Verify this is actually the first visit
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
      
      // Execute look command
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify first visit description
      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
      
      // Verify scene is now marked as visited
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });

    it('should show first visit description with "look around"', async () => {
      // Verify this is the first visit
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
      
      // Execute look around command
      const result = testEnv.lookCommandHelper.executeLookAround();
      
      // Should behave identically to basic look
      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });
  });

  describe('Subsequent Visit Look', () => {
    beforeEach(() => {
      // Mark scene as visited first
      testEnv.westOfHouseHelper.markAsVisited();
    });

    it('should show regular description on subsequent look', async () => {
      // Verify scene is marked as visited
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);
      
      // Execute look command
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify regular description (not first visit)
      testEnv.lookCommandHelper.verifyRegularDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });

    it('should show regular description with "look around"', async () => {
      // Execute look around command on visited scene
      const result = testEnv.lookCommandHelper.executeLookAround();
      
      // Should show regular description
      testEnv.lookCommandHelper.verifyRegularDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
    });
  });

  describe('Exit Display', () => {
    it('should display available exits in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Verify exits are displayed
      testEnv.lookCommandHelper.verifyExitInformation(result);
      
      // Verify specific exits
      expect(result.message).toContain('north');
      expect(result.message).toContain('south');
      expect(result.message).toContain('west');
      
      // Note: east might not be listed since it's blocked
    });

    it('should verify expected exits are actually available', () => {
      // Use helper to verify scene configuration
      testEnv.westOfHouseHelper.verifyExpectedExits();
    });
  });

  describe('Empty Scene Items', () => {
    it('should handle scene with no items gracefully', async () => {
      // Ensure scene has no items
      const sceneItems = testEnv.westOfHouseHelper.getSceneItems();
      expect(sceneItems).toHaveLength(0);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Should not mention items
      testEnv.lookCommandHelper.verifyItemInformation(result, []);
      testEnv.lookCommandHelper.verifySceneDescription(result);
    });
  });

  describe('Scene With Items', () => {
    beforeEach(() => {
      // Add a test item to the scene
      testEnv.westOfHouseHelper.addItemToScene('test_lamp', {
        name: 'brass lamp',
        description: 'A shiny brass lamp.',
        visible: true
      });
    });

    it('should display visible items in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Should show the item
      testEnv.lookCommandHelper.verifyItemInformation(result, ['brass lamp']);
      testEnv.lookCommandHelper.verifySceneDescription(result);
    });

    it('should not display invisible items', async () => {
      // Add an invisible item
      testEnv.westOfHouseHelper.addItemToScene('test_hidden', {
        name: 'hidden item',
        description: 'A hidden item.',
        visible: false
      });

      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      // Should only show visible items
      testEnv.lookCommandHelper.verifyItemInformation(result, ['brass lamp']);
      expect(result.message).not.toContain('hidden item');
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
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(true);
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      // Should now be marked as visited
      expect(testEnv.westOfHouseHelper.isFirstVisit()).toBe(false);
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
      
      // All should be successful and contain same core content
      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySuccess(lResult);
      testEnv.lookCommandHelper.verifySuccess(lookAroundResult);
      
      // Should all contain scene title
      expect(lookResult.message).toContain('West of House');
      expect(lResult.message).toContain('West of House');
      expect(lookAroundResult.message).toContain('West of House');
    });
  });
});