/**
 * Kitchen Scene - Look Command Integration Tests
 * Tests all aspects of the look command in the kitchen scene
 */

import './setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from './helpers/integration_test_factory';

describe('Kitchen Scene - Look Command Integration', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look Commands', () => {
    it('look command shows kitchen scene description with items', () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, false, false);
      testEnv.lookCommandHelper.verifyExitInformation(result, false); // Window closed initially
      testEnv.lookCommandHelper.verifyNoMove(result);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });

    it('l (abbreviated look) command works identically', () => {
      const result = testEnv.lookCommandHelper.executeLook('l');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, false, false);
    });

    it('look around command works identically', () => {
      const result = testEnv.lookCommandHelper.executeLookAround();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, false, false);
    });
  });

  describe('Container State Display', () => {
    it('look shows sack contents when sack is open', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, true, false);
    });

    it('look shows bottle contents when bottle is open', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, false, true);
    });

    it('look shows both container contents when both are open', () => {
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, true, true);
    });

    it('look hides container contents when containers are closed', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyKitchenItems(result, false, false);
      
      // Should not show contents
      expect(result.message).not.toContain('sandwich');
      expect(result.message).not.toContain('lunch');
      expect(result.message).not.toContain('garlic');
      expect(result.message).not.toContain('water');
    });
  });

  describe('Exit Display Based on Window State', () => {
    it('look shows west and up exits when window is closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyExitInformation(result, false);
    });

    it('look shows west, up, and east/out exits when window is open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifyExitInformation(result, true);
    });
  });

  describe('Look At Specific Items', () => {
    it('look at window shows window description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('window');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'window');
    });

    it('look at sack shows sack description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('sack');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'sack');
    });

    it('look at bottle shows bottle description', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('bottle');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'bottle');
    });

    it('look at brown sack works with alias', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('brown sack');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'sack');
    });

    it('look at glass bottle works with alias', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('glass bottle');
      
      testEnv.lookCommandHelper.verifySuccess(result);
      testEnv.lookCommandHelper.verifyItemDescription(result, 'bottle');
    });
  });

  describe('Look In Containers', () => {
    it('look in sack shows contents when open', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = testEnv.lookCommandHelper.executeLookIn('sack');
      
      testEnv.lookCommandHelper.verifyContainerContents(result, 'sack', ['lunch', 'clove of garlic']);
    });

    it('look in sack fails when closed', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      const result = testEnv.lookCommandHelper.executeLookIn('sack');
      
      testEnv.lookCommandHelper.verifyClosedContainer(result, 'sack');
    });

    it('look in bottle shows contents when open', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.lookCommandHelper.executeLookIn('bottle');
      
      testEnv.lookCommandHelper.verifyContainerContents(result, 'bottle', ['water']);
    });

    it('look in bottle fails when closed', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = testEnv.lookCommandHelper.executeLookIn('bottle');
      
      testEnv.lookCommandHelper.verifyClosedContainer(result, 'bottle');
    });

    it('look in window fails (not a container)', () => {
      const result = testEnv.lookCommandHelper.executeLookIn('window');
      
      testEnv.lookCommandHelper.verifyNonContainer(result, 'window');
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

    it('look at table (not present in kitchen) fails', () => {
      const result = testEnv.lookCommandHelper.executeLookAt('table');
      
      testEnv.lookCommandHelper.verifyInvalidTarget(result, 'table');
    });
  });

  describe('Game State Tracking', () => {
    it('look command marks scene as visited', () => {
      expect(testEnv.kitchenHelper.isFirstVisit()).toBe(true);
      
      testEnv.lookCommandHelper.executeBasicLook();
      
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
      expect(testEnv.kitchenHelper.isFirstVisit()).toBe(false);
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
    it('player is in kitchen scene', () => {
      testEnv.kitchenHelper.verifyPlayerInScene();
    });

    it('kitchen has correct lighting', () => {
      testEnv.kitchenHelper.verifyLighting();
    });

    it('kitchen has atmospheric elements', () => {
      testEnv.kitchenHelper.verifyAtmosphere();
    });

    it('kitchen has expected items', () => {
      const sceneItems = testEnv.kitchenHelper.getSceneItems();
      
      expect(sceneItems).toContain('windo');
      expect(sceneItems).toContain('sbag');
      expect(sceneItems).toContain('bottl');
    });
  });

  describe('Window State Integration', () => {
    it('window state affects look command exit display', () => {
      // Initially closed
      let result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(result, false);
      
      // Open window
      testEnv.kitchenHelper.setWindowState(true);
      result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(result, true);
      
      // Close window again
      testEnv.kitchenHelper.setWindowState(false);
      result = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(result, false);
    });

    it('window state affects look at window description', () => {
      // Closed window
      testEnv.kitchenHelper.setWindowState(false);
      let result = testEnv.lookCommandHelper.executeLookAt('window');
      testEnv.lookCommandHelper.verifyWindowState(result, false);
      
      // Open window
      testEnv.kitchenHelper.setWindowState(true);
      result = testEnv.lookCommandHelper.executeLookAt('window');
      testEnv.lookCommandHelper.verifyWindowState(result, true);
    });
  });
});