/**
 * State Validation Tests - Kitchen Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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
    it('brown sack state persists across look commands', () => {
      // Start with closed brown sack
      stateHelper.executeCommand('close sbag');
      stateHelper.validateContainerState('sbag', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('sbag', false);

      // Open brown sack
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('sbag', true);
    });

    it('brown sack state persists across examine commands', () => {
      // Open brown sack
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine sbag');
      stateHelper.validateContainerState('sbag', true);
    });

    it('brown sack state persists when taken into inventory', () => {
      // Open brown sack
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);

      // Take brown sack
      const takeResult = stateHelper.executeCommand('take sbag');

      if (takeResult.success) {
        // Verify in inventory
        const inventory = stateHelper.getGameState().inventory;
        expect(inventory).toContain('sbag');

        // State should persist in inventory
        stateHelper.validateContainerState('sbag', true);
      }
    });

    it('glass bottle state persists across look commands', () => {
      // Start with closed glass bottle
      stateHelper.executeCommand('close bottl');
      stateHelper.validateContainerState('bottl', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('bottl', false);

      // Open glass bottle
      stateHelper.executeCommand('open bottl');
      stateHelper.validateContainerState('bottl', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('bottl', true);
    });

    it('glass bottle state persists across examine commands', () => {
      // Open glass bottle
      stateHelper.executeCommand('open bottl');
      stateHelper.validateContainerState('bottl', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine bottl');
      stateHelper.validateContainerState('bottl', true);
    });

    it('glass bottle state persists when taken into inventory', () => {
      // Open glass bottle
      stateHelper.executeCommand('open bottl');
      stateHelper.validateContainerState('bottl', true);

      // Take glass bottle
      const takeResult = stateHelper.executeCommand('take bottl');

      if (takeResult.success) {
        // Verify in inventory
        const inventory = stateHelper.getGameState().inventory;
        expect(inventory).toContain('bottl');

        // State should persist in inventory
        stateHelper.validateContainerState('bottl', true);
      }
    });

    it('independent container states do not interfere', () => {
      // Set different states for each container
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);
      stateHelper.executeCommand('close bottl');
      stateHelper.validateContainerState('bottl', false);

      // Verify states remained independent
      stateHelper.validateContainerState('sbag', true);
      stateHelper.validateContainerState('bottl', false);
    });
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
    it('brown sack state is reported consistently by all commands', () => {
      // Open brown sack
      stateHelper.executeCommand('open sbag');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('sbag');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine sbag');

      // State should still be consistent
      stateHelper.validateContainerState('sbag', true);
    });

    it('glass bottle state is reported consistently by all commands', () => {
      // Open glass bottle
      stateHelper.executeCommand('open bottl');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('bottl');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine bottl');

      // State should still be consistent
      stateHelper.validateContainerState('bottl', true);
    });

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine sbag');

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  describe('State Persistence Across Scene Transitions', () => {
    it('brown sack state persists across scene transitions', () => {
      // Set specific state
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);

      // Move to another scene
      const moveResult = stateHelper.executeCommand('west');

      if (moveResult.success) {
        // Verify state persisted
        stateHelper.validateContainerState('sbag', true);

        // Return to scene
        stateHelper.executeCommand('east');
        stateHelper.validateContainerState('sbag', true);
      }
    });
  });

  describe('State Validation After Failed Operations', () => {
    it('brown sack state remains valid after failed operations', () => {
      // Set initial state
      stateHelper.executeCommand('open sbag');
      stateHelper.validateContainerState('sbag', true);

      // Try invalid commands that should fail
      stateHelper.executeCommand('examine nonexistent_item');
      stateHelper.executeCommand('take imaginary_item');

      // State should be unchanged
      stateHelper.validateContainerState('sbag', true);
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
