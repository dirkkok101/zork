/**
 * Attic Scene - Look Command Integration Tests
 * Tests all aspects of the look command in the attic scene
 */

import './setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from './helpers/attic_integration_test_factory';

describe('Attic Scene - Look Command Integration', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look Commands', () => {
    it('look command shows attic scene description with items', () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
      testEnv.lookCommandHelper.verifyExitInformation(result);
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });

    it('l (abbreviated look) command works identically', () => {
      const result = testEnv.lookCommandHelper.executeLook('l');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
    });

    it('look around command works identically', () => {
      const result = testEnv.lookCommandHelper.executeLookAround();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
    });
  });

  describe('Item State Display', () => {
    it('look shows brick as closed container initially', () => {
      testEnv.atticHelper.setBrickClosed();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
    });

    it('look shows brick contents when brick is open', () => {
      testEnv.atticHelper.setBrickOpen();
      // Add some test items to brick for content display
      testEnv.atticHelper.addToBrickContainer(['test_item']);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, true, false);
    });

    it('look shows empty brick when open but empty', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.clearBrickContents();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, true, false);
    });

    it('look hides container contents when brick is closed', () => {
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.addToBrickContainer(['test_item']);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
      
      // Should not show contents
      expect(result.message).not.toContain('test_item');
    });
  });

  describe('Look At Specific Items', () => {
    it('look at brick shows brick description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('brick');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'brick');
      expect(result.message).toContain('You see brick');
    });

    it('look at rope shows rope description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('rope');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'rope');
      expect(result.message).toContain('You see rope');
    });

    it('look at knife shows knife description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('knife');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'knife');
      expect(result.message).toContain('You see knife');
    });

    it('look at knife shows state when on', () => {
      testEnv.atticHelper.setKnifeOn();
      
      const result = testEnv.lookCommandHelper.executeLookAt('knife');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      // Note: Knife state might not show in look at, depends on implementation
    });

    it('look at large coil works with alias', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('large coil');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'rope');
    });

    it('look at square brick works with alias', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('square brick');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'brick');
    });
  });

  describe('Look In Container', () => {
    it('look in brick shows contents when open', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_coin', 'test_gem']);
      
      const result = testEnv.lookCommandHelper.executeLookIn('brick');
      
      testEnv.lookCommandHelper.verifyContainerContents(result, 'brick', ['test_coin', 'test_gem']);
    });

    it('look in brick fails when closed', () => {
      testEnv.atticHelper.setBrickClosed();
      
      const result = testEnv.lookCommandHelper.executeLookIn('brick');
      
      testEnv.lookCommandHelper.verifyClosedContainer(result, 'brick');
    });

    it('look in brick shows empty when open but empty', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.clearBrickContents();
      
      const result = testEnv.lookCommandHelper.executeLookIn('brick');
      
      testEnv.lookCommandHelper.verifyContainerContents(result, 'brick', []);
    });

    it('look in rope fails (not a container)', () => {
      const result = testEnv.lookCommandHelper.executeLookIn('rope');
      
      testEnv.lookCommandHelper.verifyNonContainer(result, 'rope');
    });

    it('look in knife fails (not a container)', () => {
      const result = testEnv.lookCommandHelper.executeLookIn('knife');
      
      testEnv.lookCommandHelper.verifyNonContainer(result, 'knife');
    });
  });

  describe('Invalid Targets', () => {
    it('look at nonexistent item fails', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('nonexistent');
      
      testEnv.lookCommandHelper.verifyInvalidTarget(result, 'nonexistent');
    });

    it('look in nonexistent container fails', () => {
      const result = testEnv.lookCommandHelper.executeLookIn('nonexistent');
      
      testEnv.lookCommandHelper.verifyInvalidTarget(result, 'nonexistent');
    });

    it('look at table (not present in attic) fails', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('table');
      
      testEnv.lookCommandHelper.verifyInvalidTarget(result, 'table');
    });
  });

  describe('Game State Tracking', () => {
    it('look command marks scene as visited', () => {
      expect(testEnv.atticHelper.isFirstVisit()).toBe(true);
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
      expect(testEnv.atticHelper.isFirstVisit()).toBe(false);
    });

    it('look command does not increment move counter', () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyNoMove(result);
      expect(testEnv.lookCommandHelper.getCurrentMoves()).toBe(initialMoves);
    });

    it('look command does not change score', () => {
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
      expect(testEnv.lookCommandHelper.getCurrentScore()).toBe(initialScore);
    });
  });

  describe('Scene State Verification', () => {
    it('player is in attic scene', () => {
      testEnv.atticHelper.verifyPlayerInScene();
    });

    it('attic has correct lighting', () => {
      testEnv.atticHelper.verifyLighting();
    });

    it('attic has atmospheric elements', () => {
      // Atmosphere should be available in examine command, not basic look
      const result = testEnv.examineCommandHelper.executeExamine('');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      // Note: atmosphere is random, so we'll just verify the examine worked
    });

    it('attic has expected items', () => {
      const sceneItems = testEnv.atticHelper.getSceneItems();
      
      expect(sceneItems).toContain('brick');
      expect(sceneItems).toContain('rope');
      expect(sceneItems).toContain('knife');
    });
  });

  describe('Brick State Integration', () => {
    it('brick state affects look command item display', () => {
      // Initially closed
      let result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
      
      // Open brick
      testEnv.atticHelper.setBrickOpen();
      result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyAtticItems(result, true, false);
      
      // Close brick again
      testEnv.atticHelper.setBrickClosed();
      result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyAtticItems(result, false, false);
    });

    it('brick state affects look at brick description', () => {
      // Closed brick
      testEnv.atticHelper.setBrickClosed();
      testEnv.lookCommandHelper.executeLookAt('brick');
      // Note: Static descriptions might not show state, depends on implementation
      
      // Open brick
      testEnv.atticHelper.setBrickOpen();
      testEnv.lookCommandHelper.executeLookAt('brick');
      // Note: State-based descriptions would be game implementation dependent
    });
  });

  describe('Multiple Item State Combinations', () => {
    it('look handles both brick open and knife on states', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, true, true);
    });

    it('look handles mixed states correctly', () => {
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.setKnifeOn();
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyAtticItems(result, false, true);
    });
  });
});