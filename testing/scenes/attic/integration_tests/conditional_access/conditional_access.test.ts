/**
 * Conditional Access Tests - Attic Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('light_load Flag Mechanics - Attic', () => {
    it('should block down exit when light_load is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('light_load', false);
      accessHelper.validateFlagState('light_load', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('down', /The chimney is too narrow for you and all of your baggage\./i);
      expect(accessHelper.getCurrentScene()).toBe('attic');
    });

    it('should allow down exit when light_load is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('light_load', true);
      accessHelper.validateFlagState('light_load', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('down', 'kitchen');
    });

    it('should show correct error message for blocked down exit', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      const result = accessHelper.executeCommand('down');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The chimney is too narrow for you and all of your baggage\./i);
    });

    it('should persist light_load flag across commands', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('light_load', false, [
        'look',
        'inventory',
        'examine brick'
      ]);
    });

    it('should maintain light_load flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'light_load',
        false,
        ['down', 'down', 'down']
      );
    });

    it('should provide consistent error messages for down exit', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('down', 3);
    });
  });

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      testEnv.services.gameState.setFlag('light_load', false);

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('light_load', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('down');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain light_load when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('light_load', true);

      // Move to destination
      accessHelper.executeCommand('down');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Flag should still be true
      accessHelper.validateFlagState('light_load', true);

      // Move back (if possible)
      accessHelper.executeCommand('up');
      expect(accessHelper.getCurrentScene()).toBe('attic');
      accessHelper.validateFlagState('light_load', true);
    });

  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      testEnv.services.gameState.setFlag('light_load', true);

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine ');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('light_load', true);
    });

    it('should maintain flag states during inventory operations', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Inventory operations
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('light_load', false);
    });

    it('should reflect light_load changes for down in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('light_load', false);
      let result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('light_load', true);
      result = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('attic');

      // Block again
      testEnv.services.gameState.setFlag('light_load', false);
      result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual light_load flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'light_load',
        true,
        'down',
        'kitchen'
      );

      // Reset scene
      accessHelper.setCurrentScene('attic');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('light_load', false);
      const blockedResult = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined light_load state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('light_load', 'down');
    });

  });
});
