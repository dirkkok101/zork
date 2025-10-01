/**
 * Conditional Access Tests - Clearing Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_grate_open Flag Mechanics - Clearing', () => {
    it('should block north exit when door_grate_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateFlagState('door_grate_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('north', /The grating is locked\./i);
      expect(accessHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow north exit when door_grate_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_grate_open', true);
      accessHelper.validateFlagState('door_grate_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('north', 'grating_room');
    });

    it('should show correct error message for blocked north exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = accessHelper.executeCommand('north');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The grating is locked\./i);
    });

    it('should persist door_grate_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_grate_open', false, [
        'look',
        'inventory',
        'examine grating'
      ]);
    });

    it('should maintain door_grate_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_grate_open',
        false,
        ['north', 'north', 'north']
      );
    });

    it('should provide consistent error messages for north exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('north', 3);
    });
  });

  describe('Flag State Transitions - door_grate_open', () => {
    it('should support complete flag cycle for north exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('north');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('north');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Return to original scene
      accessHelper.setCurrentScene('clearing');

      // Disable access
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('north');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for north', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_grate_open', true);
        const allowResult = accessHelper.executeCommand('north');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('clearing');

        // Block
        testEnv.services.gameState.setFlag('door_grate_open', false);
        const blockResult = accessHelper.executeCommand('north');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('door_grate_open Flag Mechanics - Clearing', () => {
    it('should block east exit when door_grate_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateFlagState('door_grate_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('east', /The grating is locked\./i);
      expect(accessHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow east exit when door_grate_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_grate_open', true);
      accessHelper.validateFlagState('door_grate_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('east', 'grating_room');
    });

    it('should show correct error message for blocked east exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = accessHelper.executeCommand('east');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The grating is locked\./i);
    });

    it('should persist door_grate_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_grate_open', false, [
        'look',
        'inventory',
        'examine grating'
      ]);
    });

    it('should maintain door_grate_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_grate_open',
        false,
        ['east', 'east', 'east']
      );
    });

    it('should provide consistent error messages for east exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('east', 3);
    });
  });

  describe('Flag State Transitions - door_grate_open', () => {
    it('should support complete flag cycle for east exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Return to original scene
      accessHelper.setCurrentScene('clearing');

      // Disable access
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for east', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_grate_open', true);
        const allowResult = accessHelper.executeCommand('east');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('clearing');

        // Block
        testEnv.services.gameState.setFlag('door_grate_open', false);
        const blockResult = accessHelper.executeCommand('east');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('door_grate_open Flag Mechanics - Clearing', () => {
    it('should block down exit when door_grate_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateFlagState('door_grate_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('down', /The grating is locked\./i);
      expect(accessHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow down exit when door_grate_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_grate_open', true);
      accessHelper.validateFlagState('door_grate_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('down', 'grating_room');
    });

    it('should show correct error message for blocked down exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = accessHelper.executeCommand('down');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The grating is locked\./i);
    });

    it('should persist door_grate_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_grate_open', false, [
        'look',
        'inventory',
        'examine grating'
      ]);
    });

    it('should maintain door_grate_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_grate_open',
        false,
        ['down', 'down', 'down']
      );
    });

    it('should provide consistent error messages for down exit', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('down', 3);
    });
  });

  describe('Flag State Transitions - door_grate_open', () => {
    it('should support complete flag cycle for down exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Return to original scene
      accessHelper.setCurrentScene('clearing');

      // Disable access
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for down', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_grate_open', true);
        const allowResult = accessHelper.executeCommand('down');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('clearing');

        // Block
        testEnv.services.gameState.setFlag('door_grate_open', false);
        const blockResult = accessHelper.executeCommand('down');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('Multiple Conditional Exits', () => {
    it('should handle independent conditional exits', () => {
      // Test north exit independently
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateNoMovement('north', 'clearing');

      testEnv.services.gameState.setFlag('door_grate_open', true);
      const result0 = accessHelper.executeCommand('north');
      accessHelper.verifySuccess(result0);
      accessHelper.setCurrentScene('clearing');

      // Test east exit independently
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateNoMovement('east', 'clearing');

      testEnv.services.gameState.setFlag('door_grate_open', true);
      const result1 = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result1);
      accessHelper.setCurrentScene('clearing');

      // Test down exit independently
      testEnv.services.gameState.setFlag('door_grate_open', false);
      accessHelper.validateNoMovement('down', 'clearing');

      testEnv.services.gameState.setFlag('door_grate_open', true);
      const result2 = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result2);
      accessHelper.setCurrentScene('clearing');

    });
  });

  describe('Unconditional Exits Always Available', () => {
    it('should allow southwest exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('southwest');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow southeast exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('southeast');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('fore5');
    });

    it('should allow west exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('forest_3');
    });

    it('should allow south exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('south');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('forest_2');
    });

  });

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      testEnv.services.gameState.setFlag('door_grate_open', false);
      testEnv.services.gameState.setFlag('door_grate_open', false);
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const restrictedExits = accessHelper.getAvailableExits();

      // Unconditional exits should always be available
      expect(restrictedExits.map(exit => exit.direction)).toContain('southwest');
      expect(restrictedExits.map(exit => exit.direction)).toContain('southeast');
      expect(restrictedExits.map(exit => exit.direction)).toContain('west');
      expect(restrictedExits.map(exit => exit.direction)).toContain('south');

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('door_grate_open', true);
      testEnv.services.gameState.setFlag('door_grate_open', true);
      testEnv.services.gameState.setFlag('door_grate_open', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('southwest');
      expect(openDirections).toContain('southeast');
      expect(openDirections).toContain('west');
      expect(openDirections).toContain('south');
      expect(openDirections).toContain('north');
      expect(openDirections).toContain('east');
      expect(openDirections).toContain('down');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain door_grate_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_grate_open', true);

      // Move to destination
      accessHelper.executeCommand('north');
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Flag should still be true
      accessHelper.validateFlagState('door_grate_open', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('clearing');
      accessHelper.validateFlagState('door_grate_open', true);
    });

    it('should maintain door_grate_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_grate_open', true);

      // Move to destination
      accessHelper.executeCommand('east');
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Flag should still be true
      accessHelper.validateFlagState('door_grate_open', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('clearing');
      accessHelper.validateFlagState('door_grate_open', true);
    });

    it('should maintain door_grate_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_grate_open', true);

      // Move to destination
      accessHelper.executeCommand('down');
      expect(accessHelper.getCurrentScene()).toBe('grating_room');

      // Flag should still be true
      accessHelper.validateFlagState('door_grate_open', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('clearing');
      accessHelper.validateFlagState('door_grate_open', true);
    });

  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      testEnv.services.gameState.setFlag('door_grate_open', true);
      testEnv.services.gameState.setFlag('door_grate_open', true);
      testEnv.services.gameState.setFlag('door_grate_open', true);

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine ');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('door_grate_open', true);
      accessHelper.validateFlagState('door_grate_open', true);
      accessHelper.validateFlagState('door_grate_open', true);
    });

    it('should maintain flag states during inventory operations', () => {
      testEnv.services.gameState.setFlag('door_grate_open', false);
      testEnv.services.gameState.setFlag('door_grate_open', false);
      testEnv.services.gameState.setFlag('door_grate_open', false);

      // Inventory operations
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('door_grate_open', false);
      accessHelper.validateFlagState('door_grate_open', false);
      accessHelper.validateFlagState('door_grate_open', false);
    });

    it('should reflect door_grate_open changes for north in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('north');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('north');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('clearing');

      // Block again
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('north');
      accessHelper.verifyFailure(result);
    });

    it('should reflect door_grate_open changes for east in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('clearing');

      // Block again
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);
    });

    it('should reflect door_grate_open changes for down in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_grate_open', false);
      let result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_grate_open', true);
      result = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('clearing');

      // Block again
      testEnv.services.gameState.setFlag('door_grate_open', false);
      result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual door_grate_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_grate_open',
        true,
        'north',
        'grating_room'
      );

      // Reset scene
      accessHelper.setCurrentScene('clearing');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_grate_open', false);
      const blockedResult = accessHelper.executeCommand('north');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_grate_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_grate_open', 'north');
    });

    it('should handle manual door_grate_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_grate_open',
        true,
        'east',
        'grating_room'
      );

      // Reset scene
      accessHelper.setCurrentScene('clearing');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_grate_open', false);
      const blockedResult = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_grate_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_grate_open', 'east');
    });

    it('should handle manual door_grate_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_grate_open',
        true,
        'down',
        'grating_room'
      );

      // Reset scene
      accessHelper.setCurrentScene('clearing');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_grate_open', false);
      const blockedResult = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_grate_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_grate_open', 'down');
    });

  });
});
