/**
 * Conditional Access Integration Tests - Behind House Scene
 * Tests flag-based exit mechanics for kitchen access via window
 */

import '@testing/scenes/behind_house/integration_tests/look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '@testing/scenes/behind_house/integration_tests/look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/scenes/behind_house/integration_tests/move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '@testing/scenes/behind_house/integration_tests/open_command/helpers/open_command_helper';
import { CloseCommandHelper } from '../close_command/helpers/close_command_helper';
import { ExamineCommandHelper } from '../examine_command/helpers/examine_command_helper';

describe('Conditional Access - Flag Based Exits', () => {
  let testEnv: BehindHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;
  let openHelper: OpenCommandHelper;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
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
    
    // Ensure we start in behind_house with clean state
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_windo_open Flag Mechanics', () => {
    it('should initially have window closed (flag false)', async () => {
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
    });

    it('should set flag when opening window', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      openHelper.executeOpenWindow();
      
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });

    it('should unset flag when closing window', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      closeHelper.executeCloseWindow();
      
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
    });

    it('should persist flag state across commands', async () => {
      // Open window
      openHelper.executeOpenWindow();
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Execute other commands
      testEnv.lookCommandHelper.executeBasicLook();
      moveHelper.executeMoveNorth();
      moveHelper.setCurrentScene('behind_house');
      
      // Flag should persist
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
    });
  });

  describe('West Exit Conditional Logic', () => {
    it('should block west exit when window is closed', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow west exit when window is open', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyKitchenAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should show correct error message for blocked west exit', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyMessageContains(result, 'The windo is closed');
    });

    it('should provide window description for open west exit', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      // Check if exit description is available in look
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookResult);
    });
  });

  describe('In Exit Conditional Logic', () => {
    it('should block "in" exit when window is closed', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      const result = moveHelper.executeMoveIn();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow "in" exit when window is open', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      const result = moveHelper.executeMoveIn();
      
      moveHelper.verifyKitchenAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should show same error message for both west and in exits', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      const westResult = moveHelper.executeMoveWest();
      moveHelper.setCurrentScene('behind_house'); // Reset position
      const inResult = moveHelper.executeMoveIn();
      
      // Both should have same error message
      expect(westResult.message).toBe(inResult.message);
      moveHelper.verifyMessageContains(westResult, 'The windo is closed');
      moveHelper.verifyMessageContains(inResult, 'The windo is closed');
    });
  });

  describe('Flag State Transitions', () => {
    it('should support flag transition scenarios', async () => {
      // Scenario 1: Start closed, open, try to move
      testEnv.behindHouseHelper.setWindowClosed();
      const blockedResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(blockedResult);
      
      // Open window
      openHelper.executeOpenWindow();
      
      // Now movement should work
      const allowedResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(allowedResult);
    });

    it('should handle rapid flag changes', async () => {
      // Multiple open/close cycles
      for (let i = 0; i < 3; i++) {
        // Close
        testEnv.behindHouseHelper.setWindowClosed();
        expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
        
        // Open
        openHelper.executeOpenWindow();
        expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
        
        // Close again
        closeHelper.executeCloseWindow();
        expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      }
    });

    it('should maintain flag consistency during movement attempts', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      // Multiple failed movement attempts shouldn't affect flag
      moveHelper.executeMoveWest();
      moveHelper.executeMoveIn();
      moveHelper.executeMoveWest();
      
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
    });
  });

  describe('Exit Availability Based on Flag', () => {
    it('should show different available exits based on window state', async () => {
      // Closed window - basic exits only
      testEnv.behindHouseHelper.setWindowClosed();
      const exits1 = moveHelper.getAvailableExits();
      const directions1 = exits1.map(exit => exit.direction);
      
      expect(directions1).toContain('north');
      expect(directions1).toContain('south');
      expect(directions1).toContain('east');
      
      // Open window - all exits available
      testEnv.behindHouseHelper.setWindowOpen();
      const exits2 = moveHelper.getAvailableExits();
      const directions2 = exits2.map(exit => exit.direction);
      
      expect(directions2).toContain('north');
      expect(directions2).toContain('south');
      expect(directions2).toContain('east');
      expect(directions2).toContain('west');
      expect(directions2).toContain('in');
    });

    it('should handle exit descriptions based on flag state', async () => {
      // Test closed state
      testEnv.behindHouseHelper.setWindowClosed();
      const lookClosed = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookClosed.message).not.toContain('You see window west');
      
      // Test open state
      testEnv.behindHouseHelper.setWindowOpen();
      const lookOpen = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookOpen);
    });
  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag state during examine commands', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      // Examine various things
      const examineHelper = new ExamineCommandHelper(
        testEnv.commandProcessor,
        testEnv.services.gameState as any,
        testEnv.services.items as any,
        testEnv.services.inventory as any
      );
      
      examineHelper.executeExamineWindow();
      examineHelper.executeExamineScene();
      
      // Flag should remain true
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });

    it('should maintain flag state during look commands', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.executeLookAround();
      
      // Flag should remain true
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });

    it('should reflect flag changes in subsequent look commands', async () => {
      // Start closed
      testEnv.behindHouseHelper.setWindowClosed();
      const lookClosed = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookClosed.message).not.toContain('You see window west');
      
      // Open window
      openHelper.executeOpenWindow();
      const lookOpen = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookOpen);
      
      // Close window
      closeHelper.executeCloseWindow();
      const lookClosedAgain = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookClosedAgain.message).not.toContain('You see window west');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual flag manipulation', async () => {
      // Manually set flag without using commands
      testEnv.services.gameState.setFlag('door_windo_open', true);
      
      // Movement should work
      const result = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(result);
    });

    it('should handle flag reset scenarios', async () => {
      // Open window
      openHelper.executeOpenWindow();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      // Manually reset flag
      testEnv.services.gameState.setFlag('door_windo_open', false);
      
      // Movement should be blocked
      testEnv.behindHouseHelper.resetScene();
      const result = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(result);
    });

    it('should handle undefined flag state gracefully', async () => {
      // Clear the flag entirely
      testEnv.services.gameState.setFlag('door_windo_open', undefined as any);
      
      // Should default to blocked access
      const result = moveHelper.executeMoveWest();
      moveHelper.verifyFailure(result);
    });
  });
});
