/**
 * State Validation Tests - Living Room Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    stateHelper = new StateValidationHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any,
      testEnv.services.items as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container State Persistence', () => {
    it('trophy case state persists across look commands', () => {
      // Start with closed trophy case
      stateHelper.executeCommand('close tcase');
      stateHelper.validateContainerState('tcase', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('tcase', false);

      // Open trophy case
      stateHelper.executeCommand('open tcase');
      stateHelper.validateContainerState('tcase', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('tcase', true);
    });

    it('trophy case state persists across examine commands', () => {
      // Open trophy case
      stateHelper.executeCommand('open tcase');
      stateHelper.validateContainerState('tcase', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine tcase');
      stateHelper.validateContainerState('tcase', true);
    });

  });

  describe('Item State Persistence', () => {
    it('lamp state persists across commands', () => {
      // Execute various non-modifying commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine lamp');

      // State should remain consistent
      stateHelper.validateStateConsistency('lamp');
    });

    it('sword state persists across commands', () => {
      // Execute various non-modifying commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine sword');

      // State should remain consistent
      stateHelper.validateStateConsistency('sword');
    });

  });

  describe('Flag-Based State Consistency', () => {
    it('light_load flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('light_load', false);
      stateHelper.validateFlagState('light_load', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('light_load', false);

      // Set flag
      testEnv.services.gameState.setFlag('light_load', true);
      stateHelper.validateFlagState('light_load', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('light_load', true);
    });

    it('magic_flag flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('magic_flag', false);
      stateHelper.validateFlagState('magic_flag', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('magic_flag', false);

      // Set flag
      testEnv.services.gameState.setFlag('magic_flag', true);
      stateHelper.validateFlagState('magic_flag', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('magic_flag', true);
    });

    it('door_door_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_door_open', false);
      stateHelper.validateFlagState('door_door_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_door_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_door_open', true);
      stateHelper.validateFlagState('door_door_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_door_open', true);
    });

    it('door_door_open flag state matches door state', () => {
      const item = testEnv.services.gameState.getItem('door');
      const flagValue = testEnv.services.gameState.getFlag('door_door_open');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });

  });

  describe('State Consistency Across Commands', () => {
    it('trophy case state is reported consistently by all commands', () => {
      // Open trophy case
      stateHelper.executeCommand('open tcase');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('tcase');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine tcase');

      // State should still be consistent
      stateHelper.validateContainerState('tcase', true);
    });

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine tcase');

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  describe('State Persistence Across Scene Transitions', () => {
    it('trophy case state persists across scene transitions', () => {
      // Set specific state
      stateHelper.executeCommand('open tcase');
      stateHelper.validateContainerState('tcase', true);

      // Move to another scene
      const moveResult = stateHelper.executeCommand('east');

      if (moveResult.success) {
        // Verify state persisted
        stateHelper.validateContainerState('tcase', true);

        // Return to scene
        stateHelper.executeCommand('west');
        stateHelper.validateContainerState('tcase', true);
      }
    });
  });

  describe('State Validation After Failed Operations', () => {
    it('trophy case state remains valid after failed operations', () => {
      // Set initial state
      stateHelper.executeCommand('open tcase');
      stateHelper.validateContainerState('tcase', true);

      // Try invalid commands that should fail
      stateHelper.executeCommand('examine nonexistent_item');
      stateHelper.executeCommand('take imaginary_item');

      // State should be unchanged
      stateHelper.validateContainerState('tcase', true);
    });

    it('game state remains valid after failed operations', () => {
      // Verify initial state
      stateHelper.validateGameStateIntegrity();

      // Try various invalid operations
      stateHelper.executeCommand('invalid_direction');
      stateHelper.executeCommand('open nonexistent_container');
      stateHelper.executeCommand('take imaginary_item');

      // Game state should still be valid
      stateHelper.validateGameStateIntegrity();
    });
  });
});
