/**
 * State Validation Tests - West of House Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('mailbox state persists across look commands', () => {
      // Start with closed mailbox
      stateHelper.executeCommand('close mailb');
      stateHelper.validateContainerState('mailb', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('mailb', false);

      // Open mailbox
      stateHelper.executeCommand('open mailb');
      stateHelper.validateContainerState('mailb', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('mailb', true);
    });

    it('mailbox state persists across examine commands', () => {
      // Open mailbox
      stateHelper.executeCommand('open mailb');
      stateHelper.validateContainerState('mailb', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine mailb');
      stateHelper.validateContainerState('mailb', true);
    });

  });

  describe('State Consistency Across Commands', () => {
    it('mailbox state is reported consistently by all commands', () => {
      // Open mailbox
      stateHelper.executeCommand('open mailb');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('mailb');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine mailb');

      // State should still be consistent
      stateHelper.validateContainerState('mailb', true);
    });

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine mailb');

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  describe('State Persistence Across Scene Transitions', () => {
    it('mailbox state persists across scene transitions', () => {
      // Set specific state
      stateHelper.executeCommand('open mailb');
      stateHelper.validateContainerState('mailb', true);

      // Move to another scene
      const moveResult = stateHelper.executeCommand('north');

      if (moveResult.success) {
        // Verify state persisted
        stateHelper.validateContainerState('mailb', true);

        // Return to scene
        stateHelper.executeCommand('south');
        stateHelper.validateContainerState('mailb', true);
      }
    });
  });

  describe('State Validation After Failed Operations', () => {
    it('mailbox state remains valid after failed operations', () => {
      // Set initial state
      stateHelper.executeCommand('open mailb');
      stateHelper.validateContainerState('mailb', true);

      // Try invalid commands that should fail
      stateHelper.executeCommand('examine nonexistent_item');
      stateHelper.executeCommand('take imaginary_item');

      // State should be unchanged
      stateHelper.validateContainerState('mailb', true);
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
