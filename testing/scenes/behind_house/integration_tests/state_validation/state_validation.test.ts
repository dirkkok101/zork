/**
 * State Validation Tests - Behind House Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { BehindHouseTestEnvironment, BehindHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();

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
    it('door_windo_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_windo_open', false);
      stateHelper.validateFlagState('door_windo_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_windo_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_windo_open', true);
      stateHelper.validateFlagState('door_windo_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_windo_open', true);
    });

    it('door_windo_open flag state matches windo state', () => {
      const item = testEnv.services.gameState.getItem('windo');
      const flagValue = testEnv.services.gameState.getFlag('door_windo_open');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });

    it('door_windo_open flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('door_windo_open', false);
      stateHelper.validateFlagState('door_windo_open', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('door_windo_open', false);

      // Set flag
      testEnv.services.gameState.setFlag('door_windo_open', true);
      stateHelper.validateFlagState('door_windo_open', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('door_windo_open', true);
    });

    it('door_windo_open flag state matches windo state', () => {
      const item = testEnv.services.gameState.getItem('windo');
      const flagValue = testEnv.services.gameState.getFlag('door_windo_open');

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
