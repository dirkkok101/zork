/**
 * Conditional Access Tests - Living Room Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('light_load Flag Mechanics - Living Room', () => {
    it('should block east exit when light_load is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('light_load', false);
      accessHelper.validateFlagState('light_load', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('east', /The chimney is too narrow for you and all of your baggage\./i);
      expect(accessHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow east exit when light_load is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('light_load', true);
      accessHelper.validateFlagState('light_load', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('east', 'kitchen');
    });

    it('should show correct error message for blocked east exit', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      const result = accessHelper.executeCommand('east');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The chimney is too narrow for you and all of your baggage\./i);
    });

    it('should persist light_load flag across commands', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('light_load', false, [
        'look',
        'inventory',
        'examine wooden door'
      ]);
    });

    it('should maintain light_load flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'light_load',
        false,
        ['east', 'east', 'east']
      );
    });

    it('should provide consistent error messages for east exit', () => {
      testEnv.services.gameState.setFlag('light_load', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('east', 3);
    });
  });

  describe('magic_flag Flag Mechanics - Living Room', () => {
    it('should block west exit when magic_flag is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('magic_flag', false);
      accessHelper.validateFlagState('magic_flag', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('west', /The north wall is solid rock\./i);
      expect(accessHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow west exit when magic_flag is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('magic_flag', true);
      accessHelper.validateFlagState('magic_flag', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('west', 'strange_passage');
    });

    it('should show correct error message for blocked west exit', () => {
      testEnv.services.gameState.setFlag('magic_flag', false);

      const result = accessHelper.executeCommand('west');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The north wall is solid rock\./i);
    });

    it('should persist magic_flag flag across commands', () => {
      testEnv.services.gameState.setFlag('magic_flag', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('magic_flag', false, [
        'look',
        'inventory',
        'examine wooden door'
      ]);
    });

    it('should maintain magic_flag flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('magic_flag', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'magic_flag',
        false,
        ['west', 'west', 'west']
      );
    });

    it('should provide consistent error messages for west exit', () => {
      testEnv.services.gameState.setFlag('magic_flag', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('west', 3);
    });
  });

  describe('door_door_open Flag Mechanics - Living Room', () => {
    it('should block down exit when door_door_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_door_open', false);
      accessHelper.validateFlagState('door_door_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('down', /The door is closed\./i);
      expect(accessHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow down exit when door_door_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_door_open', true);
      accessHelper.validateFlagState('door_door_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('down', 'cellar');
    });

    it('should show correct error message for blocked down exit', () => {
      testEnv.services.gameState.setFlag('door_door_open', false);

      const result = accessHelper.executeCommand('down');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/The door is closed\./i);
    });

    it('should persist door_door_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_door_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_door_open', false, [
        'look',
        'inventory',
        'examine wooden door'
      ]);
    });

    it('should maintain door_door_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_door_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_door_open',
        false,
        ['down', 'down', 'down']
      );
    });

    it('should provide consistent error messages for down exit', () => {
      testEnv.services.gameState.setFlag('door_door_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('down', 3);
    });
  });

  describe('Flag State Transitions - door_door_open', () => {
    it('should support complete flag cycle for down exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_door_open', false);
      let result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_door_open', true);
      result = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('cellar');

      // Return to original scene
      accessHelper.setCurrentScene('living_room');

      // Disable access
      testEnv.services.gameState.setFlag('door_door_open', false);
      result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for down', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_door_open', true);
        const allowResult = accessHelper.executeCommand('down');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('living_room');

        // Block
        testEnv.services.gameState.setFlag('door_door_open', false);
        const blockResult = accessHelper.executeCommand('down');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('Multiple Conditional Exits', () => {
    it('should handle independent conditional exits', () => {
      // Test east exit independently
      testEnv.services.gameState.setFlag('light_load', false);
      accessHelper.validateNoMovement('east', 'living_room');

      testEnv.services.gameState.setFlag('light_load', true);
      const result0 = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result0);
      accessHelper.setCurrentScene('living_room');

      // Test west exit independently
      testEnv.services.gameState.setFlag('magic_flag', false);
      accessHelper.validateNoMovement('west', 'living_room');

      testEnv.services.gameState.setFlag('magic_flag', true);
      const result1 = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result1);
      accessHelper.setCurrentScene('living_room');

      // Test down exit independently
      testEnv.services.gameState.setFlag('door_door_open', false);
      accessHelper.validateNoMovement('down', 'living_room');

      testEnv.services.gameState.setFlag('door_door_open', true);
      const result2 = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result2);
      accessHelper.setCurrentScene('living_room');

    });
  });

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      testEnv.services.gameState.setFlag('light_load', false);
      testEnv.services.gameState.setFlag('magic_flag', false);
      testEnv.services.gameState.setFlag('door_door_open', false);

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('light_load', true);
      testEnv.services.gameState.setFlag('magic_flag', true);
      testEnv.services.gameState.setFlag('door_door_open', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('east');
      expect(openDirections).toContain('west');
      expect(openDirections).toContain('down');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain light_load when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('light_load', true);

      // Move to destination
      accessHelper.executeCommand('east');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Flag should still be true
      accessHelper.validateFlagState('light_load', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('living_room');
      accessHelper.validateFlagState('light_load', true);
    });

    it('should maintain magic_flag when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('magic_flag', true);

      // Move to destination
      accessHelper.executeCommand('west');
      expect(accessHelper.getCurrentScene()).toBe('strange_passage');

      // Flag should still be true
      accessHelper.validateFlagState('magic_flag', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('living_room');
      accessHelper.validateFlagState('magic_flag', true);
    });

    it('should maintain door_door_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_door_open', true);

      // Move to destination
      accessHelper.executeCommand('down');
      expect(accessHelper.getCurrentScene()).toBe('cellar');

      // Flag should still be true
      accessHelper.validateFlagState('door_door_open', true);

      // Return to original scene for flag consistency check
      accessHelper.setCurrentScene('living_room');
      accessHelper.validateFlagState('door_door_open', true);
    });

  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      testEnv.services.gameState.setFlag('light_load', true);
      testEnv.services.gameState.setFlag('magic_flag', true);
      testEnv.services.gameState.setFlag('door_door_open', true);

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine ');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('light_load', true);
      accessHelper.validateFlagState('magic_flag', true);
      accessHelper.validateFlagState('door_door_open', true);
    });

    it('should maintain flag states during inventory operations', () => {
      testEnv.services.gameState.setFlag('light_load', false);
      testEnv.services.gameState.setFlag('magic_flag', false);
      testEnv.services.gameState.setFlag('door_door_open', false);

      // Inventory operations
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('light_load', false);
      accessHelper.validateFlagState('magic_flag', false);
      accessHelper.validateFlagState('door_door_open', false);
    });

    it('should reflect light_load changes for east in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('light_load', false);
      let result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('light_load', true);
      result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('living_room');

      // Block again
      testEnv.services.gameState.setFlag('light_load', false);
      result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);
    });

    it('should reflect magic_flag changes for west in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('magic_flag', false);
      let result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('magic_flag', true);
      result = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('living_room');

      // Block again
      testEnv.services.gameState.setFlag('magic_flag', false);
      result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);
    });

    it('should reflect door_door_open changes for down in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_door_open', false);
      let result = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_door_open', true);
      result = accessHelper.executeCommand('down');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('living_room');

      // Block again
      testEnv.services.gameState.setFlag('door_door_open', false);
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
        'east',
        'kitchen'
      );

      // Reset scene
      accessHelper.setCurrentScene('living_room');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('light_load', false);
      const blockedResult = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined light_load state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('light_load', 'east');
    });

    it('should handle manual magic_flag flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'magic_flag',
        true,
        'west',
        'strange_passage'
      );

      // Reset scene
      accessHelper.setCurrentScene('living_room');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('magic_flag', false);
      const blockedResult = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined magic_flag state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('magic_flag', 'west');
    });

    it('should handle manual door_door_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_door_open',
        true,
        'down',
        'cellar'
      );

      // Reset scene
      accessHelper.setCurrentScene('living_room');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_door_open', false);
      const blockedResult = accessHelper.executeCommand('down');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_door_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_door_open', 'down');
    });

  });
});
