/**
 * Kitchen Scene - Close Command Integration Tests
 * Tests all aspects of the close command in the kitchen scene
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Close Command Integration', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Closing', () => {
    it('close window succeeds when window is open', () => {
      // First open the window
      testEnv.kitchenHelper.setWindowState(true);
      const initialMoves = testEnv.closeCommandHelper.getCurrentMoves();
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('window');
      
      testEnv.closeCommandHelper.verifyWindowCloseSuccess(result);
      testEnv.closeCommandHelper.verifyCountsAsMove(result);
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('close windo (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('windo');
      
      testEnv.closeCommandHelper.verifyWindowCloseSuccess(result);
    });

    it('close window fails when already closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('window');
      
      testEnv.closeCommandHelper.verifyAlreadyClosed(result, 'window');
      testEnv.closeCommandHelper.verifyNoMove(result);
    });

    it('window closing unsets global flag correctly', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.kitchenHelper.verifyWindowState(true);
      
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      testEnv.kitchenHelper.verifyWindowState(false);
    });

    it('window closing disables east movement', () => {
      testEnv.kitchenHelper.setWindowState(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
    });
  });

  describe('Sack Closing', () => {
    it('close sack succeeds when sack is open', () => {
      testEnv.kitchenHelper.setSackState(true);
      const initialMoves = testEnv.closeCommandHelper.getCurrentMoves();
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      testEnv.closeCommandHelper.verifySackCloseSuccess(result);
      testEnv.closeCommandHelper.verifyCountsAsMove(result);
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('close brown sack (with alias) succeeds', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('brown sack');
      
      testEnv.closeCommandHelper.verifySackCloseSuccess(result);
    });

    it('close sbag (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('sbag');
      
      testEnv.closeCommandHelper.verifySackCloseSuccess(result);
    });

    it('close sack fails when already closed', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      testEnv.closeCommandHelper.verifyAlreadyClosed(result, 'sack');
      testEnv.closeCommandHelper.verifyNoMove(result);
    });

    it('closing sack hides contents in look command', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      // Initially contents visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
      
      // Close sack
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      // Contents now hidden
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      expect(lookResult.message).not.toContain('sandwich');
      expect(lookResult.message).not.toContain('garlic');
    });
  });

  describe('Bottle Closing', () => {
    it('close bottle succeeds when bottle is open', () => {
      testEnv.kitchenHelper.setBottleState(true);
      const initialMoves = testEnv.closeCommandHelper.getCurrentMoves();
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      testEnv.closeCommandHelper.verifyBottleCloseSuccess(result);
      testEnv.closeCommandHelper.verifyCountsAsMove(result);
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('close glass bottle (with alias) succeeds', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('glass bottle');
      
      testEnv.closeCommandHelper.verifyBottleCloseSuccess(result);
    });

    it('close bottl (with item ID) succeeds', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('bottl');
      
      testEnv.closeCommandHelper.verifyBottleCloseSuccess(result);
    });

    it('close bottle fails when already closed', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      testEnv.closeCommandHelper.verifyAlreadyClosed(result, 'bottle');
      testEnv.closeCommandHelper.verifyNoMove(result);
    });

    it('closing bottle hides water in look command', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      // Initially water visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
      
      // Close bottle
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      // Water now hidden
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      expect(lookResult.message).not.toContain('water');
    });
  });

  describe('Multiple Container Closing', () => {
    it('closing both sack and bottle hides all contents', () => {
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      // Initially all contents visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
      
      // Close both containers
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      // All contents hidden
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
    });

    it('closing containers independently works', () => {
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      // Close only sack
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.kitchenHelper.verifySackState(false);
      testEnv.kitchenHelper.verifyBottleState(true);
      
      // Close only bottle
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      testEnv.kitchenHelper.verifySackState(false);
      testEnv.kitchenHelper.verifyBottleState(false);
    });
  });

  describe('Open-Close Cycles', () => {
    it('window can be opened and closed repeatedly', () => {
      // Start closed
      testEnv.kitchenHelper.setWindowState(false);
      
      // Open
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.closeCommandHelper.verifyWindowOpen();
      
      // Close
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.closeCommandHelper.verifyWindowClosed();
      
      // Open again
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.closeCommandHelper.verifyWindowOpen();
      
      // Close again
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.closeCommandHelper.verifyWindowClosed();
    });

    it('sack can be opened and closed repeatedly', () => {
      // Start closed
      testEnv.kitchenHelper.setSackState(false);
      
      // Open
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.closeCommandHelper.verifySackOpen();
      
      // Close
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.verifySackClosed();
      
      // Open again
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.closeCommandHelper.verifySackOpen();
    });

    it('bottle can be opened and closed repeatedly', () => {
      // Start closed
      testEnv.kitchenHelper.setBottleState(false);
      
      // Open
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.closeCommandHelper.verifyBottleOpen();
      
      // Close
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      testEnv.closeCommandHelper.verifyBottleClosed();
      
      // Open again
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.closeCommandHelper.verifyBottleOpen();
    });
  });

  describe('Invalid Close Targets', () => {
    it('close nonexistent item fails', () => {
      const result = testEnv.closeCommandHelper.executeCloseTarget('nonexistent');
      
      testEnv.closeCommandHelper.verifyItemNotFound(result, 'nonexistent');
      testEnv.closeCommandHelper.verifyNoMove(result);
    });

    it('close non-closeable item fails', () => {
      const result = testEnv.closeCommandHelper.executeCloseTarget('kitchen');
      
      testEnv.closeCommandHelper.verifyFailure(result);
      testEnv.closeCommandHelper.verifyNoMove(result);
    });

    it('empty close command fails', () => {
      const result = testEnv.closeCommandHelper.executeClose('close');
      
      testEnv.closeCommandHelper.verifyFailure(result);
      // Should ask what to close
      expect(result.message).toMatch(/what.*close/i);
    });
  });

  describe('Close Command Variations', () => {
    it('various forms of close window work', () => {
      const variations = ['close window', 'close the window', 'close windo'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setWindowState(true);
        
        const result = testEnv.closeCommandHelper.executeClose(command);
        
        testEnv.closeCommandHelper.verifyWindowCloseSuccess(result);
      });
    });

    it('various forms of close sack work', () => {
      const variations = ['close sack', 'close the sack', 'close brown sack', 'close sbag'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setSackState(true);
        
        const result = testEnv.closeCommandHelper.executeClose(command);
        
        testEnv.closeCommandHelper.verifySackCloseSuccess(result);
      });
    });

    it('various forms of close bottle work', () => {
      const variations = ['close bottle', 'close the bottle', 'close glass bottle', 'close bottl'];
      
      variations.forEach(command => {
        testEnv.kitchenHelper.setBottleState(true);
        
        const result = testEnv.closeCommandHelper.executeClose(command);
        
        testEnv.closeCommandHelper.verifyBottleCloseSuccess(result);
      });
    });
  });

  describe('Move Counter Tracking', () => {
    it('successful close commands increment move counter', () => {
      const initialMoves = testEnv.closeCommandHelper.getCurrentMoves();
      
      // Close window
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Close sack
      testEnv.kitchenHelper.setSackState(true);
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
      
      // Close bottle
      testEnv.kitchenHelper.setBottleState(true);
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      testEnv.closeCommandHelper.verifyMoveCountIncreased(initialMoves, 3);
    });

    it('failed close commands do not increment move counter', () => {
      const initialMoves = testEnv.closeCommandHelper.getCurrentMoves();
      
      // Try closing already closed window
      testEnv.kitchenHelper.setWindowState(false);
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.closeCommandHelper.verifyMoveCountUnchanged(initialMoves);
      
      // Try closing nonexistent item
      testEnv.closeCommandHelper.executeCloseTarget('nonexistent');
      testEnv.closeCommandHelper.verifyMoveCountUnchanged(initialMoves);
    });
  });

  describe('State Persistence', () => {
    it('window state persists across other commands', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      // Close window
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.closeCommandHelper.verifyWindowClosed();
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Window should still be closed
      testEnv.closeCommandHelper.verifyWindowClosed();
    });

    it('container states persist across other commands', () => {
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      // Close containers
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Containers should still be closed
      testEnv.closeCommandHelper.verifySackClosed();
      testEnv.closeCommandHelper.verifyBottleClosed();
    });
  });

  describe('Integration with Other Commands', () => {
    it('closing window disables movement immediately', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      // Initially east movement succeeds
      let moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(moveResult, 'behind_house');
      
      // Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('west');
      
      // Close window
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      // Now east movement fails
      moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(moveResult);
    });

    it('closing containers affects look command output immediately', () => {
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      // Initially all contents visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
      
      // Close sack
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
      
      // Close bottle
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
    });

    it('closing containers affects look in commands', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      // Initially look in sack succeeds
      let lookInResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyContainerContents(lookInResult, 'sack', ['lunch', 'garlic']);
      
      // Close sack
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      // Now look in sack fails
      lookInResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyClosedContainer(lookInResult, 'sack');
    });
  });

  describe('Scene State Verification', () => {
    it('player remains in kitchen after close commands', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.closeCommandHelper.executeCloseTarget('window');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      testEnv.kitchenHelper.setSackState(true);
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      testEnv.kitchenHelper.setBottleState(true);
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      testEnv.kitchenHelper.verifyPlayerInScene();
    });

    it('scene items remain in place after closing', () => {
      const sceneItems = testEnv.kitchenHelper.getSceneItems();
      
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      testEnv.kitchenHelper.setSackState(true);
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      testEnv.kitchenHelper.setBottleState(true);
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      const sceneItemsAfter = testEnv.kitchenHelper.getSceneItems();
      expect(sceneItemsAfter).toEqual(sceneItems);
    });
  });

  describe('Window State Integration with Movement', () => {
    it('closing window after movement through it blocks return', () => {
      // Open window and go to behind house
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.moveCommandHelper.executeMoveDirection('east');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
      
      // Close window from behind house (if possible via other commands)
      // Return to kitchen via different route
      testEnv.moveCommandHelper.executeMoveDirection('north');  // Assuming north leads elsewhere
      // Navigate back to kitchen through living room
      testEnv.moveCommandHelper.setCurrentScene('kitchen');  // Reset for test
      
      // Close window
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      // East movement now blocked
      const moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(moveResult);
    });
  });
});