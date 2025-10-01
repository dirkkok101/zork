/**
 * State Validation Tests - Attic Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

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
    it('brick state persists across look commands', () => {
      // Start with closed brick
      stateHelper.executeCommand('close brick');
      stateHelper.validateContainerState('brick', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('brick', false);

      // Open brick
      stateHelper.executeCommand('open brick');
      stateHelper.validateContainerState('brick', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('brick', true);
    });

    it('brick state persists across examine commands', () => {
      // Open brick
      stateHelper.executeCommand('open brick');
      stateHelper.validateContainerState('brick', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine brick');
      stateHelper.validateContainerState('brick', true);
    });

    it('brick state persists when taken into inventory', () => {
      // Open brick
      stateHelper.executeCommand('open brick');
      stateHelper.validateContainerState('brick', true);

      // Take brick
      const takeResult = stateHelper.executeCommand('take brick');

      if (takeResult.success) {
        // Verify in inventory
        const inventory = stateHelper.getGameState().inventory;
        expect(inventory).toContain('brick');

        // State should persist in inventory
        stateHelper.validateContainerState('brick', true);
      }
    });

  });

  describe('Item State Persistence', () => {
    it('knife state persists across commands', () => {
      // Execute various non-modifying commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine knife');

      // State should remain consistent
      stateHelper.validateStateConsistency('knife');
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

  });

  describe('State Consistency Across Commands', () => {
    it('brick state is reported consistently by all commands', () => {
      // Open brick
      stateHelper.executeCommand('open brick');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('brick');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine brick');

      // State should still be consistent
      stateHelper.validateContainerState('brick', true);
    });

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine brick');

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  describe('State Persistence Across Scene Transitions', () => {
    it('brick state persists across scene transitions', () => {
      // Set specific state
      stateHelper.executeCommand('open brick');
      stateHelper.validateContainerState('brick', true);

      // Move to another scene
      const moveResult = stateHelper.executeCommand('down');

      if (moveResult.success) {
        // Verify state persisted
        stateHelper.validateContainerState('brick', true);

        // Return to scene
        stateHelper.executeCommand('up');
        stateHelper.validateContainerState('brick', true);
      }
    });
  });

  describe('State Validation After Failed Operations', () => {
    it('brick state remains valid after failed operations', () => {
      // Set initial state
      stateHelper.executeCommand('open brick');
      stateHelper.validateContainerState('brick', true);

      // Try invalid commands that should fail
      stateHelper.executeCommand('examine nonexistent_item');
      stateHelper.executeCommand('take imaginary_item');

      // State should be unchanged
      stateHelper.validateContainerState('brick', true);
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
