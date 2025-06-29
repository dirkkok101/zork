/**
 * State Validation Integration Tests - Behind House Scene
 * Tests flag persistence and state consistency across various operations
 */

import '../look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '../move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '../open_command/helpers/open_command_helper';
import { CloseCommandHelper } from '../close_command/helpers/close_command_helper';
import { ExamineCommandHelper } from '../examine_command/helpers/examine_command_helper';

describe('State Validation - Flag Persistence', () => {
  let testEnv: BehindHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;
  let openHelper: OpenCommandHelper;
  let closeHelper: CloseCommandHelper;
  let examineHelper: ExamineCommandHelper;

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
    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any,
      testEnv.services.inventory as any
    );
    
    // Ensure we start in behind_house with clean state
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_windo_open Flag Persistence', () => {
    it('should persist flag state across non-modifying commands', async () => {
      // Set window open
      openHelper.executeOpenWindow();
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Execute various non-modifying commands
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.executeLookAround();
      examineHelper.executeExamineWindow();
      examineHelper.executeExamineScene();
      examineHelper.executeExamineTarget('me');
      
      // Flag should remain true
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });

    it('should persist flag state across successful movements', async () => {
      // Open window and move to kitchen
      openHelper.executeOpenWindow();
      moveHelper.executeMoveWest();
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
      
      // Flag should persist in kitchen
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Return to behind_house
      moveHelper.executeMoveDirection('east');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // Flag should still be true
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
    });

    it('should persist flag state across failed movements', async () => {
      // Set window closed
      testEnv.behindHouseHelper.setWindowClosed();
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      
      // Attempt multiple failed movements
      moveHelper.executeMoveWest();
      moveHelper.executeMoveIn();
      moveHelper.executeMoveWest();
      
      // Flag should remain false
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should persist flag state across scene transitions', async () => {
      // Open window
      openHelper.executeOpenWindow();
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Visit multiple scenes
      moveHelper.executeMoveNorth(); // to north_of_house
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      moveHelper.executeMoveDirection('west'); // to west_of_house
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      moveHelper.executeMoveDirection('south'); // to south_of_house
      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      moveHelper.executeMoveDirection('east'); // back to behind_house
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
    });
  });

  describe('State Consistency Validation', () => {
    it('should maintain consistent behavior across repeated operations', async () => {
      for (let i = 0; i < 5; i++) {
        // Open window
        testEnv.behindHouseHelper.setWindowClosed();
        openHelper.executeOpenWindow();
        expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
        
        // Test movement
        const moveResult = moveHelper.executeMoveWest();
        moveHelper.verifyKitchenAccess(moveResult);
        
        // Return
        moveHelper.executeMoveDirection('east');
        expect(moveHelper.getCurrentScene()).toBe('behind_house');
        
        // Close window
        closeHelper.executeCloseWindow();
        expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
        
        // Test blocked movement
        const blockedResult = moveHelper.executeMoveWest();
        moveHelper.verifyWindowClosedFailure(blockedResult);
      }
    });

    it('should maintain state consistency between helper methods and direct access', async () => {
      // Test open state
      openHelper.executeOpenWindow();
      
      // All methods should agree on state
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      expect(openHelper.isWindowOpen()).toBe(true);
      expect(closeHelper.isWindowOpen()).toBe(true);
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      
      // Test closed state
      closeHelper.executeCloseWindow();
      
      // All methods should agree on state
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      expect(openHelper.isWindowOpen()).toBe(false);
      expect(closeHelper.isWindowOpen()).toBe(false);
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
    });

    it('should validate exit availability consistency with flag state', async () => {
      // Test closed state
      testEnv.behindHouseHelper.setWindowClosed();
      const exitsClosed = moveHelper.getAvailableExits();
      const directionsClosed = exitsClosed.map(exit => exit.direction);
      
      // Should have basic exits but conditional ones may not be listed as available
      expect(directionsClosed).toContain('north');
      expect(directionsClosed).toContain('south');
      expect(directionsClosed).toContain('east');
      
      // Test open state
      testEnv.behindHouseHelper.setWindowOpen();
      const exitsOpen = moveHelper.getAvailableExits();
      const directionsOpen = exitsOpen.map(exit => exit.direction);
      
      // Should have all exits including conditional ones
      expect(directionsOpen).toContain('north');
      expect(directionsOpen).toContain('south');
      expect(directionsOpen).toContain('east');
      expect(directionsOpen).toContain('west');
      expect(directionsOpen).toContain('in');
    });
  });

  describe('Game State Integrity', () => {
    it('should not corrupt other game state when changing window flag', async () => {
      // Capture initial state
      const initialScene = moveHelper.getCurrentScene();
      const initialMoves = moveHelper.getCurrentMoves();
      const initialScore = testEnv.services.gameState.getScore();
      const initialItems = testEnv.behindHouseHelper.getSceneItems();
      
      // Change window state multiple times
      openHelper.executeOpenWindow();
      closeHelper.executeCloseWindow();
      openHelper.executeOpenWindow();
      
      // Verify other state is preserved (accounting for moves from commands)
      expect(moveHelper.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getScore()).toBe(initialScore);
      expect(testEnv.behindHouseHelper.getSceneItems()).toEqual(initialItems);
      
      // Move count should have increased by 3 (one for each command)
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves + 3);
    });

    it('should maintain scene item consistency during flag changes', async () => {
      const initialItems = testEnv.behindHouseHelper.getSceneItems();
      
      // Change window state
      openHelper.executeOpenWindow();
      expect(testEnv.behindHouseHelper.getSceneItems()).toEqual(initialItems);
      
      closeHelper.executeCloseWindow();
      expect(testEnv.behindHouseHelper.getSceneItems()).toEqual(initialItems);
      
      // Window item should remain in scene and maintain properties
      testEnv.behindHouseHelper.verifyWindowProperties();
    });

    it('should maintain visited scene tracking during flag changes', async () => {
      // Initially behind_house should be visited after reset
      expect(testEnv.services.gameState.hasVisitedScene('behind_house')).toBe(false);
      
      // Look around to mark as visited
      testEnv.lookCommandHelper.executeBasicLook();
      expect(testEnv.services.gameState.hasVisitedScene('behind_house')).toBe(true);
      
      // Change window state
      openHelper.executeOpenWindow();
      expect(testEnv.services.gameState.hasVisitedScene('behind_house')).toBe(true);
      
      closeHelper.executeCloseWindow();
      expect(testEnv.services.gameState.hasVisitedScene('behind_house')).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid flag state changes gracefully', async () => {
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          openHelper.executeOpenWindow();
          expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
        } else {
          closeHelper.executeCloseWindow();
          expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
        }
      }
      
      // Final state should be consistent
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
    });

    it('should handle flag state with invalid values gracefully', async () => {
      // Test with various invalid flag values
      const gameState = testEnv.services.gameState;
      
      // Test with null
      gameState.setFlag('door_windo_open', null as any);
      const moveResultNull = moveHelper.executeMoveWest();
      expect(moveResultNull.success).toBe(false); // Should default to blocked
      
      // Test with undefined
      gameState.setFlag('door_windo_open', undefined as any);
      const moveResultUndef = moveHelper.executeMoveWest();
      expect(moveResultUndef.success).toBe(false); // Should default to blocked
      
      // Test with string
      gameState.setFlag('door_windo_open', 'true' as any);
      moveHelper.executeMoveWest();
      // Behavior depends on implementation - might work if truthy check is used
      
      // Restore to valid state
      gameState.setFlag('door_windo_open', true);
      const moveResultValid = moveHelper.executeMoveWest();
      expect(moveResultValid.success).toBe(true);
    });

    it('should maintain flag isolation from other flags', async () => {
      const gameState = testEnv.services.gameState;
      
      // Set some other flags
      gameState.setFlag('other_flag_1', true);
      gameState.setFlag('other_flag_2', false);
      gameState.setFlag('test_flag', true); // Use boolean for type safety
      
      // Change window flag
      openHelper.executeOpenWindow();
      
      // Other flags should be unaffected
      expect(gameState.getFlag('other_flag_1')).toBe(true);
      expect(gameState.getFlag('other_flag_2')).toBe(false);
      expect(gameState.getFlag('test_flag')).toBe(true);
      
      // Window flag should be correct
      expect(gameState.getFlag('door_windo_open')).toBe(true);
    });
  });

  describe('Cross-Command State Validation', () => {
    it('should maintain consistent state across all command types', async () => {
      // Open window
      openHelper.executeOpenWindow();
      const openState = testEnv.behindHouseHelper.isWindowOpen();
      
      // Verify state consistency across different command types
      testEnv.lookCommandHelper.executeBasicLook();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(openState);
      
      examineHelper.executeExamineWindow();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(openState);
      
      moveHelper.executeMoveNorth();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(openState);
      
      moveHelper.executeMoveDirection('south'); // back to behind_house
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(openState);
      
      // State should remain consistent
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });

    it('should validate command result consistency with flag state', async () => {
      // Test that all commands that care about window state give consistent results
      
      // Closed state
      testEnv.behindHouseHelper.setWindowClosed();
      
      const lookClosed = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookClosed.message).not.toContain('You see window west');
      
      const moveClosed = moveHelper.executeMoveWest();
      expect(moveClosed.success).toBe(false);
      expect(moveClosed.message).toContain('The windo is closed');
      
      // Open state
      testEnv.behindHouseHelper.setWindowOpen();
      
      const lookOpen = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookOpen);
      
      testEnv.behindHouseHelper.resetScene(); // Reset position after failed move
      const moveOpen = moveHelper.executeMoveWest();
      expect(moveOpen.success).toBe(true);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });
  });
});