/**
 * Basic Close Command Integration Tests - Behind House Scene
 * Tests close command functionality for window mechanics
 */

import '@testing/scenes/behind_house/integration_tests/look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '@testing/scenes/behind_house/integration_tests/look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from './helpers/close_command_helper';
import { MoveCommandHelper } from '@testing/scenes/behind_house/integration_tests/move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '@testing/scenes/behind_house/integration_tests/open_command/helpers/open_command_helper';

describe('Basic Close Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let closeHelper: CloseCommandHelper;
  let moveHelper: MoveCommandHelper;
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    
    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
    
    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    
    // Ensure we start in behind_house with clean state
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Closing - Open to Closed', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowOpen();
    });

    it('should close window successfully when open', async () => {
      const result = closeHelper.testWindowCloseFromOpen();
      
      closeHelper.verifyWindowCloseMessage(result);
      closeHelper.verifyCountsAsMove(result);
      closeHelper.verifyWindowClosed();
    });

    it('should block kitchen access after closing window', async () => {
      // Verify kitchen access is initially available
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
      
      // Close window
      closeHelper.executeCloseWindow();
      
      closeHelper.verifyWindowClosed();
      
      // Verify kitchen access is now blocked
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
    });

    it('should update game state flag correctly', async () => {
      expect(closeHelper.isWindowOpen()).toBe(true);
      
      closeHelper.executeCloseWindow();
      
      expect(closeHelper.isWindowOpen()).toBe(false);
      closeHelper.verifyWindowClosed();
    });

    it('should count as a move', async () => {
      const initialMoves = closeHelper.getCurrentMoves();
      
      closeHelper.executeCloseWindow();
      
      closeHelper.verifyMoveCounterIncremented(initialMoves);
    });

    it('should not change score', async () => {
      const initialScore = testEnv.services.gameState.getScore();
      
      closeHelper.executeCloseWindow();
      
      closeHelper.verifyNoScoreChange(initialScore);
    });
  });

  describe('Window Closing - Already Closed', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowClosed();
    });

    it('should fail when trying to close already closed window', async () => {
      const result = closeHelper.testWindowCloseWhenAlreadyClosed();
      
      closeHelper.verifyAlreadyClosed(result);
      closeHelper.verifyCountsAsMove(result);
      closeHelper.verifyWindowClosed(); // Should remain closed
    });

    it('should maintain blocked kitchen access when already closed', async () => {
      // Verify kitchen access is blocked
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
      
      // Try to close again
      closeHelper.executeCloseWindow();
      
      // Verify kitchen access remains blocked
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
    });

    it('should still count as a move even when already closed', async () => {
      const initialMoves = closeHelper.getCurrentMoves();
      
      closeHelper.executeCloseWindow();
      
      closeHelper.verifyMoveCounterIncremented(initialMoves);
    });
  });

  describe('Command Variations', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowOpen();
    });

    it('should accept "close windo" command', async () => {
      const result = closeHelper.executeCloseTarget('windo');
      
      closeHelper.verifySuccess(result);
      closeHelper.verifyWindowClosed();
    });

    it('should accept "close window" command', async () => {
      const result = closeHelper.executeCloseTarget('window');
      
      closeHelper.verifySuccess(result);
      closeHelper.verifyWindowClosed();
    });

    it('should work with all window aliases', async () => {
      closeHelper.verifyWindowCommandVariations();
    });

    it('should accept various close command formats', async () => {
      const commands = ['close windo', 'close window'];
      
      commands.forEach(command => {
        // Reset to open state
        testEnv.behindHouseHelper.setWindowOpen();
        
        const result = closeHelper.executeClose(command);
        closeHelper.verifySuccess(result);
        closeHelper.verifyWindowClosed();
      });
    });
  });

  describe('Invalid Targets', () => {
    it('should fail when trying to close non-existent items', async () => {
      const result = closeHelper.executeCloseTarget('nonexistent');
      
      // Error message should use resolved name (same as input for non-existent items)
      closeHelper.verifyItemNotFound(result, 'nonexistent', 'nonexistent');
    });

    it('should fail when trying to close items from other scenes', async () => {
      const result = closeHelper.executeCloseTarget('mailbox');
      
      // Error should use canonical name "mailbox" not any alias
      closeHelper.verifyItemNotFound(result, 'mailbox', 'mailbox');
    });

    it('should fail when trying to close non-closable items', async () => {
      // Add a non-closable test item
      testEnv.behindHouseHelper.addItemToScene('test_rock', {
        name: 'Rock',
        portable: false,
        properties: { openable: false }
      });
      
      const result = closeHelper.executeCloseTarget('rock');
      
      // Error should use canonical name "rock"
      closeHelper.verifyCannotClose(result, 'rock', 'rock');
    });

    it('should handle empty target gracefully', async () => {
      const result = closeHelper.executeClose('close');
      
      closeHelper.verifyFailure(result);
    });
  });

  describe('Window State Transitions', () => {
    it('should transition from open to closed state correctly', async () => {
      const initialState = true;
      testEnv.behindHouseHelper.setWindowOpen();
      
      closeHelper.executeCloseWindow();
      
      closeHelper.verifyWindowStateChange(initialState, false);
    });

    it('should maintain state consistency across multiple commands', async () => {
      // Start open
      testEnv.behindHouseHelper.setWindowOpen();
      expect(closeHelper.isWindowOpen()).toBe(true);
      
      // Close
      closeHelper.executeCloseWindow();
      expect(closeHelper.isWindowOpen()).toBe(false);
      
      // Try to close again
      closeHelper.executeCloseWindow();
      expect(closeHelper.isWindowOpen()).toBe(false);
      
      // State should remain consistent
      closeHelper.verifyWindowClosed();
    });
  });

  describe('Integration with Movement', () => {
    it('should block west movement after closing window', async () => {
      // Start with open window
      testEnv.behindHouseHelper.setWindowOpen();
      
      // Close window
      closeHelper.executeCloseWindow();
      
      // Try to move west (should fail now)
      const moveResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(moveResult);
    });

    it('should block "in" movement after closing window', async () => {
      // Start with open window
      testEnv.behindHouseHelper.setWindowOpen();
      
      // Close window
      closeHelper.executeCloseWindow();
      
      // Try to move in (should fail now)
      const moveResult = moveHelper.executeMoveIn();
      moveHelper.verifyWindowClosedFailure(moveResult);
    });
  });

  describe('Open/Close Cycle', () => {
    it('should support full open/close cycle', async () => {
      // Start closed
      testEnv.behindHouseHelper.setWindowClosed();
      expect(closeHelper.isWindowOpen()).toBe(false);
      
      // Open window
      openHelper.executeOpenWindow();
      expect(closeHelper.isWindowOpen()).toBe(true);
      
      // Close window
      const closeResult = closeHelper.executeCloseWindow();
      closeHelper.verifySuccess(closeResult);
      expect(closeHelper.isWindowOpen()).toBe(false);
      
      // Open again
      openHelper.executeOpenWindow();
      expect(closeHelper.isWindowOpen()).toBe(true);
    });

    it('should maintain kitchen access correlation with window state', async () => {
      // Start closed - kitchen blocked
      testEnv.behindHouseHelper.setWindowClosed();
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
      
      // Open - kitchen available
      openHelper.executeOpenWindow();
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
      
      // Close - kitchen blocked again
      closeHelper.executeCloseWindow();
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
    });
  });

  describe('State Consistency', () => {
    it('should not affect other game state during window closing', async () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();
      const initialItems = testEnv.behindHouseHelper.getSceneItems();
      
      closeHelper.executeCloseWindow();
      
      const finalScene = testEnv.services.gameState.getCurrentScene();
      const finalItems = testEnv.behindHouseHelper.getSceneItems();
      
      expect(finalScene).toBe(initialScene);
      expect(finalItems).toEqual(initialItems);
    });

    it('should maintain window item properties after closing', async () => {
      testEnv.behindHouseHelper.verifyWindowProperties();
      
      closeHelper.executeCloseWindow();
      
      testEnv.behindHouseHelper.verifyWindowProperties();
    });
  });
});
