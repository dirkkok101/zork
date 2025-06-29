/**
 * Basic Movement Integration Tests - Behind House Scene
 * Tests movement commands including conditional kitchen access via window
 */

import '@testing/scenes/behind_house/integration_tests/look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from './helpers/move_command_helper';

describe('Basic Movement Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
    
    // Ensure we start in behind_house
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Exit Movement', () => {
    it('should move north to north_of_house', async () => {
      const result = moveHelper.executeMoveNorth();
      
      moveHelper.verifyNorthMovement(result);
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
    });

    it('should move south to south_of_house', async () => {
      const result = moveHelper.executeMoveSouth();
      
      moveHelper.verifySouthMovement(result);
      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
    });

    it('should move east to clearing', async () => {
      const result = moveHelper.executeMoveEast();
      
      moveHelper.verifyEastMovement(result);
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should verify all basic exits work', async () => {
      moveHelper.verifyBasicExits();
    });
  });

  describe('Conditional Kitchen Access - Window Closed', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowClosed();
      testEnv.behindHouseHelper.verifyKitchenAccessBlocked();
    });

    it('should fail to move west when window is closed', async () => {
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should fail to move in when window is closed', async () => {
      const result = moveHelper.executeMoveIn();
      
      moveHelper.verifyWindowClosedFailure(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should show correct error message for closed window', async () => {
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyFailure(result);
      moveHelper.verifyMessageContains(result, 'The windo is closed');
    });

    it('should count failed window access as a move', async () => {
      const initialMoves = moveHelper.getCurrentMoves();
      
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyFailure(result);
      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMoveCounterIncremented(initialMoves);
    });
  });

  describe('Conditional Kitchen Access - Window Open', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowOpen();
      testEnv.behindHouseHelper.verifyKitchenAccessAvailable();
    });

    it('should move west to kitchen when window is open', async () => {
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifyKitchenAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should move in to kitchen when window is open', async () => {
      const result = moveHelper.executeMoveIn();
      
      moveHelper.verifyKitchenAccess(result);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should count successful window access as a move', async () => {
      const initialMoves = moveHelper.getCurrentMoves();
      
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifySuccess(result);
      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMoveCounterIncremented(initialMoves);
    });

    it('should provide scene description when entering kitchen', async () => {
      const result = moveHelper.executeMoveWest();
      
      moveHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).toContain('kitchen');
    });
  });

  describe('Window State Transitions', () => {
    it('should respect window state changes during same session', async () => {
      // Start with closed window
      testEnv.behindHouseHelper.setWindowClosed();
      
      const closedResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(closedResult);
      
      // Open window
      testEnv.behindHouseHelper.setWindowOpen();
      
      const openResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(openResult);
    });

    it('should maintain window state consistency', async () => {
      // Test closed state
      testEnv.behindHouseHelper.setWindowClosed();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      const result1 = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(result1);
      
      // Test open state
      testEnv.behindHouseHelper.setWindowOpen();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      // Reset position since we're still in behind_house after failed move
      testEnv.behindHouseHelper.resetScene();
      
      const result2 = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(result2);
    });
  });

  describe('Command Variations', () => {
    beforeEach(() => {
      testEnv.behindHouseHelper.setWindowOpen(); // Enable kitchen access for testing
    });

    it('should accept direction-only commands', async () => {
      const result = moveHelper.executeMoveDirection('north');
      moveHelper.verifyNorthMovement(result);
    });

    it('should accept "go <direction>" format', async () => {
      const result = moveHelper.executeMoveWithGo('south');
      moveHelper.verifySouthMovement(result);
    });

    it('should accept direction abbreviations', async () => {
      moveHelper.verifyDirectionAbbreviations('north', 'n', 'north_of_house');
      
      testEnv.behindHouseHelper.resetScene();
      moveHelper.verifyDirectionAbbreviations('south', 's', 'south_of_house');
      
      testEnv.behindHouseHelper.resetScene();
      moveHelper.verifyDirectionAbbreviations('east', 'e', 'clearing');
      
      testEnv.behindHouseHelper.resetScene();
      moveHelper.verifyDirectionAbbreviations('west', 'w', 'kitchen');
    });

    it('should handle movement aliases', async () => {
      moveHelper.verifyMovementAliases('north', 'north_of_house');
    });
  });

  describe('Movement State Tracking', () => {
    it('should increment move counter for successful moves', async () => {
      const initialMoves = moveHelper.getCurrentMoves();
      
      moveHelper.executeMoveNorth();
      
      moveHelper.verifyMoveCounterIncremented(initialMoves);
    });

    it('should increment move counter for failed moves', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      const initialMoves = moveHelper.getCurrentMoves();
      
      moveHelper.executeMoveWest();
      
      moveHelper.verifyMoveCounterIncremented(initialMoves);
    });

    it('should update current scene on successful movement', async () => {
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      moveHelper.executeMoveNorth();
      
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
    });

    it('should not update current scene on failed movement', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      moveHelper.executeMoveWest();
      
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });
  });

  describe('Round Trip Movement', () => {
    it('should complete round trip via north route', async () => {
      // Go north
      const northResult = moveHelper.executeMoveNorth();
      moveHelper.verifyNorthMovement(northResult);
      
      // Come back south
      const southResult = moveHelper.executeMoveDirection('south');
      moveHelper.verifyMovementSuccess(southResult, 'behind_house');
    });

    it('should complete round trip via east route', async () => {
      // Go east to clearing
      const eastResult = moveHelper.executeMoveEast();
      moveHelper.verifyEastMovement(eastResult);
      
      // Come back southwest (clearing connects back via sw, not west)
      const swResult = moveHelper.executeMoveDirection('sw');
      moveHelper.verifyMovementSuccess(swResult, 'behind_house');
    });

    it('should complete round trip via kitchen when window is open', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      // Go west to kitchen
      const westResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(westResult);
      
      // Come back east
      const eastResult = moveHelper.executeMoveDirection('east');
      moveHelper.verifyMovementSuccess(eastResult, 'behind_house');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid directions gracefully', async () => {
      const result = moveHelper.executeMoveDirection('up');
      
      moveHelper.verifyInvalidDirection(result);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should handle empty direction input', async () => {
      const result = moveHelper.executeMove('go');
      
      moveHelper.verifyFailure(result);
    });

    it('should handle nonsense direction input', async () => {
      const result = moveHelper.executeMoveDirection('nowhere');
      
      moveHelper.verifyInvalidDirection(result);
    });
  });
});
