/**
 * Conditional Access Integration Tests - Kitchen Scene
 * Tests flag-based exit mechanics for behind house access via window
 */

import '@testing/scenes/kitchen/integration_tests/look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '@testing/scenes/kitchen/integration_tests/look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/scenes/kitchen/integration_tests/move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '@testing/scenes/kitchen/integration_tests/open_command/helpers/open_command_helper';
import { CloseCommandHelper } from '../close_command/helpers/close_command_helper';

describe('Conditional Access - Flag Based Exits (Kitchen)', () => {
  let testEnv: KitchenTestEnvironment;
  let moveHelper: MoveCommandHelper;
  let openHelper: OpenCommandHelper;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
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
    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    
    // Ensure clean state
    testEnv.kitchenHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_windo_open Flag Mechanics - Kitchen Side', () => {
    it('should initially have window open when entering from behind house', async () => {
      // Kitchen is typically entered with window already open
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
    });

    it('should set flag when opening window from kitchen', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      openHelper.executeOpenWindow();
      
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
    });

    it('should unset flag when closing window from kitchen', async () => {
      testEnv.kitchenHelper.setWindowOpen();
      
      closeHelper.executeCloseWindow();
      
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(false);
    });

    it('should persist flag state across commands', async () => {
      // Close window
      closeHelper.executeCloseWindow();
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.commandProcessor.processCommand('examine table');
      testEnv.commandProcessor.processCommand('inventory');
      
      // Flag should persist
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
    });
  });

  describe('East Exit Conditional Logic - From Kitchen', () => {
    it('should block east exit when window is closed', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveEast();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow east exit when window is open', async () => {
      testEnv.kitchenHelper.setWindowOpen();
      
      const result = moveHelper.executeMoveEast();
      
      moveHelper.verifyBehindHouseAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should show correct error message for blocked east exit', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveEast();
      
      moveHelper.verifyMessageContains(result, 'The windo is closed');
    });

    it('should not show window exit in look when closed', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoWindowExitDescription(lookResult);
    });

    it('should show window exit in look when open', async () => {
      testEnv.kitchenHelper.setWindowOpen();
      
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookResult);
    });
  });

  describe('Out Exit Conditional Logic - From Kitchen', () => {
    it('should block "out" exit when window is closed', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveOut();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow "out" exit when window is open', async () => {
      testEnv.kitchenHelper.setWindowOpen();
      
      const result = moveHelper.executeMoveOut();
      
      moveHelper.verifyBehindHouseAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should show same error message for both east and out exits', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      const eastResult = moveHelper.executeMoveEast();
      const outResult = moveHelper.executeMoveOut();
      
      // Both should have same error message
      expect(eastResult.message).toBe(outResult.message);
      moveHelper.verifyMessageContains(eastResult, 'The windo is closed');
      moveHelper.verifyMessageContains(outResult, 'The windo is closed');
    });
  });

  describe('West Exit Always Available', () => {
    it('should allow west exit regardless of window state', async () => {
      // Test with window closed
      testEnv.kitchenHelper.setWindowClosed();
      let result = moveHelper.executeMoveWest();
      moveHelper.verifyLivingRoomAccess(result);
      
      // Return to kitchen
      moveHelper.setCurrentScene('kitchen');
      
      // Test with window open
      testEnv.kitchenHelper.setWindowOpen();
      result = moveHelper.executeMoveWest();
      moveHelper.verifyLivingRoomAccess(result);
    });
  });

  describe('Flag State Transitions - Kitchen Perspective', () => {
    it('should support complete open/close/move cycle', async () => {
      // Start with window closed
      testEnv.kitchenHelper.setWindowClosed();
      
      // Try to move east - should fail
      let moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyWindowClosedFailure(moveResult);
      
      // Open window
      openHelper.executeOpenWindow();
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
      
      // Now movement should work
      moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyBehindHouseAccess(moveResult);
      
      // Return to kitchen
      moveHelper.setCurrentScene('kitchen');
      
      // Close window
      closeHelper.executeCloseWindow();
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(false);
      
      // Movement should be blocked again
      moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyWindowClosedFailure(moveResult);
    });

    it('should handle rapid flag changes', async () => {
      // Multiple open/close cycles
      for (let i = 0; i < 3; i++) {
        // Open
        testEnv.kitchenHelper.setWindowClosed();
        openHelper.executeOpenWindow();
        expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
        
        // Verify movement works
        const openResult = moveHelper.executeMoveEast();
        moveHelper.verifyBehindHouseAccess(openResult);
        moveHelper.setCurrentScene('kitchen');
        
        // Close
        closeHelper.executeCloseWindow();
        expect(testEnv.kitchenHelper.isWindowOpen()).toBe(false);
        
        // Verify movement blocked
        const closedResult = moveHelper.executeMoveEast();
        moveHelper.verifyWindowClosedFailure(closedResult);
      }
    });

    it('should maintain flag consistency during failed movement attempts', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      // Multiple failed movement attempts shouldn't affect flag
      moveHelper.executeMoveEast();
      moveHelper.executeMoveOut();
      moveHelper.executeMoveEast();
      
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(false);
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
    });
  });

  describe('Exit Availability Based on Flag', () => {
    it('should show different available exits based on window state', async () => {
      // Closed window - limited exits
      testEnv.kitchenHelper.setWindowClosed();
      const exits1 = moveHelper.getAvailableExits();
      const directions1 = exits1.map(exit => exit.direction);
      
      expect(directions1).toContain('west');
      // East/out should be conditional or blocked
      
      // Open window - all exits available
      testEnv.kitchenHelper.setWindowOpen();
      const exits2 = moveHelper.getAvailableExits();
      const directions2 = exits2.map(exit => exit.direction);
      
      expect(directions2).toContain('west');
      expect(directions2).toContain('east');
      expect(directions2).toContain('out');
    });

    it('should handle exit descriptions based on flag state', async () => {
      // Test closed state
      testEnv.kitchenHelper.setWindowClosed();
      const lookClosed = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyNoWindowExitDescription(lookClosed);
      
      // Test open state
      testEnv.kitchenHelper.setWindowOpen();
      const lookOpen = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookOpen);
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain flag when moving between scenes', async () => {
      // Open window in kitchen
      testEnv.kitchenHelper.setWindowOpen();
      openHelper.executeOpenWindow();
      
      // Move to behind house
      moveHelper.executeMoveEast();
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // Flag should still be true
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Move back to kitchen
      moveHelper.executeMoveWest();
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
      
      // Flag should still be true
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
    });

    it('should reflect window changes made in other scene', async () => {
      // Start in kitchen with window open
      testEnv.kitchenHelper.setWindowOpen();
      
      // Move to behind house
      moveHelper.executeMoveEast();
      
      // Close window from behind house
      testEnv.commandProcessor.processCommand('close window');
      
      // Try to move back to kitchen
      const result = moveHelper.executeMoveWest();
      
      // Should be blocked
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });
  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag state during examine commands', async () => {
      testEnv.kitchenHelper.setWindowOpen();
      
      // Examine various things
      testEnv.commandProcessor.processCommand('examine window');
      testEnv.commandProcessor.processCommand('examine table');
      testEnv.commandProcessor.processCommand('examine sack');
      
      // Flag should remain true
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
    });

    it('should maintain flag state during inventory operations', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      // Take and drop items
      testEnv.commandProcessor.processCommand('take bottle');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('drop bottle');
      
      // Flag should remain false
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(false);
    });

    it('should reflect flag changes in subsequent commands', async () => {
      // Start closed
      testEnv.kitchenHelper.setWindowClosed();
      let moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyWindowClosedFailure(moveResult);
      
      // Open window
      openHelper.executeOpenWindow();
      moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyBehindHouseAccess(moveResult);
      
      // Return and close
      moveHelper.setCurrentScene('kitchen');
      closeHelper.executeCloseWindow();
      moveResult = moveHelper.executeMoveEast();
      moveHelper.verifyWindowClosedFailure(moveResult);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual flag manipulation', async () => {
      // Manually set flag without using commands
      testEnv.services.gameState.setFlag('door_windo_open', true);
      
      // Movement should work
      const result = moveHelper.executeMoveEast();
      moveHelper.verifyBehindHouseAccess(result);
    });

    it('should handle flag reset scenarios', async () => {
      // Open window
      openHelper.executeOpenWindow();
      expect(testEnv.kitchenHelper.isWindowOpen()).toBe(true);
      
      // Manually reset flag
      testEnv.services.gameState.setFlag('door_windo_open', false);
      
      // Movement should be blocked
      const result = moveHelper.executeMoveEast();
      moveHelper.verifyWindowClosedFailure(result);
    });

    it('should handle undefined flag state gracefully', async () => {
      // Clear the flag entirely
      testEnv.services.gameState.setFlag('door_windo_open', undefined as any);
      
      // Should default to blocked access
      const result = moveHelper.executeMoveEast();
      moveHelper.verifyFailure(result);
    });

    it('should provide consistent error messages', async () => {
      testEnv.kitchenHelper.setWindowClosed();
      
      // Try multiple times - error should be consistent
      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(moveHelper.executeMoveEast());
      }
      
      // All should have same error message
      const firstMessage = results[0]?.message;
      results.forEach(result => {
        expect(result.message).toBe(firstMessage);
        expect(result.message).toContain('The windo is closed');
      });
    });
  });
});