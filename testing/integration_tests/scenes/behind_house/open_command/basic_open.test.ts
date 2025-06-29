/**
 * Basic Open Command Integration Tests - Behind House Scene
 * Tests open command functionality for window mechanics
 */

import '../look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from './helpers/open_command_helper';
import { MoveCommandHelper } from '../move_command/helpers/move_command_helper';

describe('Basic Open Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let openHelper: OpenCommandHelper;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    
    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
    
    // Ensure we start in behind_house with clean state
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Opening - Closed to Open', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowClosed();
    });

    it('should open window successfully when closed', async () => {
      const result = openHelper.testWindowOpenFromClosed();
      
      openHelper.verifyWindowOpenMessage(result);
      openHelper.verifyCountsAsMove(result);
      openHelper.verifyWindowOpened();
    });

    it('should enable kitchen access after opening window', async () => {
      // Verify kitchen access is initially blocked
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
      
      // Open window
      openHelper.executeOpenWindow();
      
      openHelper.verifyWindowOpened();
      
      // Verify kitchen access is now available
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
    });

    it('should update game state flag correctly', async () => {
      expect(openHelper.isWindowOpen()).toBe(false);
      
      openHelper.executeOpenWindow();
      
      expect(openHelper.isWindowOpen()).toBe(true);
      openHelper.verifyWindowOpened();
    });

    it('should count as a move', async () => {
      const initialMoves = openHelper.getCurrentMoves();
      
      openHelper.executeOpenWindow();
      
      openHelper.verifyMoveCounterIncremented(initialMoves);
    });

    it('should not change score', async () => {
      const initialScore = testEnv.services.gameState.getScore();
      
      openHelper.executeOpenWindow();
      
      openHelper.verifyNoScoreChange(initialScore);
    });
  });

  describe('Window Opening - Already Open', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowOpen();
    });

    it('should fail when trying to open already open window', async () => {
      const result = openHelper.testWindowOpenWhenAlreadyOpen();
      
      openHelper.verifyAlreadyOpen(result);
      openHelper.verifyNoMove(result);
      openHelper.verifyWindowOpened(); // Should remain open
    });

    it('should maintain kitchen access when already open', async () => {
      // Verify kitchen access is available
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
      
      // Try to open again
      openHelper.executeOpenWindow();
      
      // Verify kitchen access remains available
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
    });

    it('should not count as a move when already open', async () => {
      const initialMoves = openHelper.getCurrentMoves();
      
      openHelper.executeOpenWindow();
      
      const currentMoves = openHelper.getCurrentMoves();
      expect(currentMoves).toBe(initialMoves);
    });
  });

  describe('Command Variations', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowClosed();
    });

    it('should accept "open windo" command', async () => {
      const result = openHelper.executeOpenTarget('windo');
      
      openHelper.verifySuccess(result);
      openHelper.verifyWindowOpened();
    });

    it('should accept "open window" command', async () => {
      const result = openHelper.executeOpenTarget('window');
      
      openHelper.verifySuccess(result);
      openHelper.verifyWindowOpened();
    });

    it('should work with all window aliases', async () => {
      openHelper.verifyWindowCommandVariations();
    });

    it('should accept various open command formats', async () => {
      const commands = ['open windo', 'open window'];
      
      commands.forEach(command => {
        // Reset to closed state
        testEnv.behindHouseHelper.setWindowClosed();
        
        const result = openHelper.executeOpen(command);
        openHelper.verifySuccess(result);
        openHelper.verifyWindowOpened();
      });
    });
  });

  describe('Invalid Targets', () => {
    it('should fail when trying to open non-existent items', async () => {
      const result = openHelper.executeOpenTarget('nonexistent');
      
      // Error message should use resolved name (same as input for non-existent items)
      openHelper.verifyItemNotFound(result, 'nonexistent', 'nonexistent');
    });

    it('should fail when trying to open items from other scenes', async () => {
      const result = openHelper.executeOpenTarget('mailbox');
      
      // Error should use canonical name "mailbox" not any alias
      openHelper.verifyItemNotFound(result, 'mailbox', 'mailbox');
    });

    it('should fail when trying to open non-openable items', async () => {
      // Add a non-openable test item
      testEnv.behindHouseHelper.addItemToScene('test_rock', {
        name: 'Rock',
        portable: false,
        properties: { openable: false }
      });
      
      const result = openHelper.executeOpenTarget('rock');
      
      // Error should use canonical name "rock" 
      openHelper.verifyCannotOpen(result, 'rock', 'rock');
    });

    it('should handle empty target gracefully', async () => {
      const result = openHelper.executeOpen('open');
      
      openHelper.verifyFailure(result);
    });
  });

  describe('Window State Transitions', () => {
    it('should transition from closed to open state correctly', async () => {
      const initialState = false;
      testEnv.behindHouseHelper.setWindowClosed();
      
      openHelper.executeOpenWindow();
      
      openHelper.verifyWindowStateChange(initialState, true);
    });

    it('should maintain state consistency across multiple commands', async () => {
      // Start closed
      testEnv.behindHouseHelper.setWindowClosed();
      expect(openHelper.isWindowOpen()).toBe(false);
      
      // Open
      openHelper.executeOpenWindow();
      expect(openHelper.isWindowOpen()).toBe(true);
      
      // Try to open again
      openHelper.executeOpenWindow();
      expect(openHelper.isWindowOpen()).toBe(true);
      
      // State should remain consistent
      openHelper.verifyWindowOpened();
    });
  });

  describe('Integration with Movement', () => {
    it('should enable west movement after opening window', async () => {
      // Start with closed window
      testEnv.behindHouseHelper.setWindowClosed();
      
      // Open window
      openHelper.executeOpenWindow();
      
      // Try to move west (should work now)
      const moveResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(moveResult);
    });

    it('should enable "in" movement after opening window', async () => {
      // Start with closed window
      testEnv.behindHouseHelper.setWindowClosed();
      
      // Open window
      openHelper.executeOpenWindow();
      
      // Try to move in (should work now)
      const moveResult = moveHelper.executeMoveIn();
      moveHelper.verifyKitchenAccess(moveResult);
    });
  });

  describe('State Consistency', () => {
    it('should not affect other game state during window opening', async () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();
      const initialItems = testEnv.behindHouseHelper.getSceneItems();
      
      openHelper.executeOpenWindow();
      
      const finalScene = testEnv.services.gameState.getCurrentScene();
      const finalItems = testEnv.behindHouseHelper.getSceneItems();
      
      expect(finalScene).toBe(initialScene);
      expect(finalItems).toEqual(initialItems);
    });

    it('should maintain window item properties after opening', async () => {
      testEnv.behindHouseHelper.verifyWindowProperties();
      
      openHelper.executeOpenWindow();
      
      testEnv.behindHouseHelper.verifyWindowProperties();
    });
  });
});