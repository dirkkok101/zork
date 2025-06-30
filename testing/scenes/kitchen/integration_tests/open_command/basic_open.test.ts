/**
 * Kitchen Scene - Open Command Integration Tests
 * Tests all aspects of the open command in the kitchen scene
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Open Command Integration', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Opening', () => {
    it('open window succeeds when window is closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      const initialMoves = testEnv.openCommandHelper.getCurrentMoves();
      
      const result = testEnv.openCommandHelper.executeOpenTarget('window');
      
      testEnv.openCommandHelper.verifyWindowOpenSuccess(result);
      testEnv.openCommandHelper.verifyCountsAsMove(result);
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('open windo (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('windo');
      
      testEnv.openCommandHelper.verifyWindowOpenSuccess(result);
    });

    it('open window fails when already open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('window');
      
      testEnv.openCommandHelper.verifyAlreadyOpen(result, 'window');
      testEnv.openCommandHelper.verifyCountsAsMove(result);
    });

    it('window opening sets global flag correctly', () => {
      testEnv.kitchenHelper.setWindowState(false);
      testEnv.kitchenHelper.verifyWindowState(false);
      
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      testEnv.kitchenHelper.verifyWindowState(true);
    });

    it('window opening enables east movement', () => {
      testEnv.kitchenHelper.setWindowState(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
      
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
    });
  });

  describe('Sack Opening', () => {
    it('open sack succeeds when sack is closed', () => {
      testEnv.kitchenHelper.setSackState(false);
      const initialMoves = testEnv.openCommandHelper.getCurrentMoves();
      
      const result = testEnv.openCommandHelper.executeOpenTarget('sack');
      
      testEnv.openCommandHelper.verifySackOpenSuccess(result);
      testEnv.openCommandHelper.verifyCountsAsMove(result);
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('open brown sack (with alias) succeeds', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('brown sack');
      
      testEnv.openCommandHelper.verifySackOpenSuccess(result);
    });

    it('open sbag (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('sbag');
      
      testEnv.openCommandHelper.verifySackOpenSuccess(result);
    });

    it('open sack fails when already open', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('sack');
      
      testEnv.openCommandHelper.verifyAlreadyOpen(result, 'sack');
      testEnv.openCommandHelper.verifyCountsAsMove(result);
    });

    it('opening sack reveals contents in look command', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      // Initially contents hidden
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookResult.message).not.toContain('sandwich');
      expect(lookResult.message).not.toContain('garlic');
      
      // Open sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // Contents now visible
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
    });
  });

  describe('Bottle Opening', () => {
    it('open bottle succeeds when bottle is closed', () => {
      testEnv.kitchenHelper.setBottleState(false);
      const initialMoves = testEnv.openCommandHelper.getCurrentMoves();
      
      const result = testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      testEnv.openCommandHelper.verifyBottleOpenSuccess(result);
      testEnv.openCommandHelper.verifyCountsAsMove(result);
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('open glass bottle (with alias) succeeds', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('glass bottle');
      
      testEnv.openCommandHelper.verifyBottleOpenSuccess(result);
    });

    it('open bottl (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('bottl');
      
      testEnv.openCommandHelper.verifyBottleOpenSuccess(result);
    });

    it('open bottle fails when already open', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      testEnv.openCommandHelper.verifyAlreadyOpen(result, 'bottle');
      testEnv.openCommandHelper.verifyCountsAsMove(result);
    });

    it('opening bottle reveals water in look command', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      // Initially water hidden
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookResult.message).not.toContain('water');
      
      // Open bottle
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // Water now visible
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
    });
  });

  describe('Multiple Container Opening', () => {
    it('opening both sack and bottle shows all contents', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Open both containers
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // All contents visible
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
    });

    it('opening containers independently works', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Open only sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(false);
      
      // Open only bottle
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(true);
    });
  });

  describe('Invalid Open Targets', () => {
    it('open nonexistent item fails', () => {
      const result = testEnv.openCommandHelper.executeOpenTarget('nonexistent');
      
      testEnv.openCommandHelper.verifyItemNotFound(result, 'nonexistent');
      testEnv.openCommandHelper.verifyCountsAsMove(result);
    });

    it('open non-openable item fails', () => {
      // Try to open something that can't be opened (assuming table if present)
      const result = testEnv.openCommandHelper.executeOpenTarget('kitchen');
      
      testEnv.openCommandHelper.verifyFailure(result);
      testEnv.openCommandHelper.verifyCountsAsMove(result);
    });

    it('empty open command fails', () => {
      const result = testEnv.openCommandHelper.executeOpen('open');
      
      testEnv.openCommandHelper.verifyFailure(result);
      // Should ask what to open
      expect(result.message).toMatch(/what.*open/i);
    });
  });

  describe('Open Command Variations', () => {
    it('various forms of open window work', () => {
      const variations = ['open window', 'open the window', 'open windo'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setWindowState(false);
        
        const result = testEnv.openCommandHelper.executeOpen(command);
        
        testEnv.openCommandHelper.verifyWindowOpenSuccess(result);
      });
    });

    it('various forms of open sack work', () => {
      const variations = ['open sack', 'open the sack', 'open brown sack', 'open sbag'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setSackState(false);
        
        const result = testEnv.openCommandHelper.executeOpen(command);
        
        testEnv.openCommandHelper.verifySackOpenSuccess(result);
      });
    });

    it('various forms of open bottle work', () => {
      const variations = ['open bottle', 'open the bottle', 'open glass bottle', 'open bottl'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setBottleState(false);
        
        const result = testEnv.openCommandHelper.executeOpen(command);
        
        testEnv.openCommandHelper.verifyBottleOpenSuccess(result);
      });
    });
  });

  describe('Move Counter Tracking', () => {
    it('successful open commands increment move counter', () => {
      const initialMoves = testEnv.openCommandHelper.getCurrentMoves();
      
      // Open window
      testEnv.kitchenHelper.setWindowState(false);
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Open sack
      testEnv.kitchenHelper.setSackState(false);
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
      
      // Open bottle
      testEnv.kitchenHelper.setBottleState(false);
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 3);
    });

    it('failed open commands still increment move counter', () => {
      const initialMoves = testEnv.openCommandHelper.getCurrentMoves();
      
      // Try opening already open window
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Try opening nonexistent item
      testEnv.openCommandHelper.executeOpenTarget('nonexistent');
      testEnv.openCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
    });
  });

  describe('State Persistence', () => {
    it('window state persists across other commands', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      // Open window
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.kitchenHelper.verifyWindowState(true);
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Window should still be open
      testEnv.kitchenHelper.verifyWindowState(true);
    });

    it('container states persist across other commands', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Open containers
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Containers should still be open
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(true);
    });
  });

  describe('Integration with Other Commands', () => {
    it('opening window enables movement immediately', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      // Initially east movement fails
      let moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(moveResult);
      
      // Open window
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Now east movement succeeds
      moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(moveResult, 'behind_house');
    });

    it('opening containers affects look command output immediately', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Initially no contents visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      
      // Open sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
      
      // Open bottle
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
    });

    it('opening containers affects look in commands', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      // Initially look in sack fails
      let lookInResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyClosedContainer(lookInResult, 'sack');
      
      // Open sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // Now look in sack succeeds
      lookInResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyContainerContents(lookInResult, 'sack', ['sandwich', 'garlic']);
    });
  });

  describe('Scene State Verification', () => {
    it('player remains in kitchen after open commands', () => {
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.kitchenHelper.verifyPlayerInScene();
    });

    it('scene items remain in place after opening', () => {
      const sceneItems = testEnv.kitchenHelper.getSceneItems();
      
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      const sceneItemsAfter = testEnv.kitchenHelper.getSceneItems();
      expect(sceneItemsAfter).toEqual(sceneItems);
    });
  });
});