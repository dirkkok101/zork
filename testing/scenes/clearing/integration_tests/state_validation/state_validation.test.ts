/**
 * State Validation Tests - Clearing Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

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

  describe('Flag-Based State Consistency', () => {
    it('door_grate_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_grate_open', false);
      stateHelper.validateFlagState('door_grate_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_grate_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_grate_open', true);
      stateHelper.validateFlagState('door_grate_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_grate_open', true);
    });

    it('door_grate_open flag state matches grate state', () => {
      const item = testEnv.services.gameState.getItem('grate');
      const flagValue = testEnv.services.gameState.getFlag('door_grate_open');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });

    it('door_grate_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_grate_open', false);
      stateHelper.validateFlagState('door_grate_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_grate_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_grate_open', true);
      stateHelper.validateFlagState('door_grate_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_grate_open', true);
    });

    it('door_grate_open flag state matches grate state', () => {
      const item = testEnv.services.gameState.getItem('grate');
      const flagValue = testEnv.services.gameState.getFlag('door_grate_open');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });

    it('door_grate_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_grate_open', false);
      stateHelper.validateFlagState('door_grate_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_grate_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_grate_open', true);
      stateHelper.validateFlagState('door_grate_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_grate_open', true);
    });

    it('door_grate_open flag state matches grate state', () => {
      const item = testEnv.services.gameState.getItem('grate');
      const flagValue = testEnv.services.gameState.getFlag('door_grate_open');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });

  });

  describe('State Consistency Across Commands', () => {

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  describe('State Validation After Failed Operations', () => {

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
