/**
 * Conditional Access Tests - Kitchen Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_windo_open Flag Mechanics - Kitchen', () => {
    it('should block east exit when door_windo_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateFlagState('door_windo_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('east', /(?:closed|blocked|locked|cannot)/i);
      expect(accessHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow east exit when door_windo_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      accessHelper.validateFlagState('door_windo_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('east', 'behind_house');
    });

    it('should show correct error message for blocked east exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = accessHelper.executeCommand('east');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/(?:closed|blocked|locked|cannot)/i);
    });

    it('should persist door_windo_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_windo_open', false, [
        'look',
        'inventory',
        'examine window'
      ]);
    });

    it('should maintain door_windo_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_windo_open',
        false,
        ['east', 'east', 'east']
      );
    });

    it('should provide consistent error messages for east exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('east', 3);
    });
  });

  describe('Flag State Transitions - door_windo_open', () => {
    it('should support complete flag cycle for east exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('behind_house');

      // Return to original scene
      accessHelper.setCurrentScene('kitchen');

      // Disable access
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for east', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_windo_open', true);
        const allowResult = accessHelper.executeCommand('east');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('kitchen');

        // Block
        testEnv.services.gameState.setFlag('door_windo_open', false);
        const blockResult = accessHelper.executeCommand('east');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('door_windo_open Flag Mechanics - Kitchen', () => {
    it('should block out exit when door_windo_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateFlagState('door_windo_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('out', /(?:closed|blocked|locked|cannot)/i);
      expect(accessHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow out exit when door_windo_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      accessHelper.validateFlagState('door_windo_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('out', 'behind_house');
    });

    it('should show correct error message for blocked out exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = accessHelper.executeCommand('out');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/(?:closed|blocked|locked|cannot)/i);
    });

    it('should persist door_windo_open flag across commands', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('door_windo_open', false, [
        'look',
        'inventory',
        'examine window'
      ]);
    });

    it('should maintain door_windo_open flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'door_windo_open',
        false,
        ['out', 'out', 'out']
      );
    });

    it('should provide consistent error messages for out exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('out', 3);
    });
  });

  describe('Flag State Transitions - door_windo_open', () => {
    it('should support complete flag cycle for out exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('out');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('out');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('behind_house');

      // Return to original scene
      accessHelper.setCurrentScene('kitchen');

      // Disable access
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('out');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for out', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_windo_open', true);
        const allowResult = accessHelper.executeCommand('out');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('kitchen');

        // Block
        testEnv.services.gameState.setFlag('door_windo_open', false);
        const blockResult = accessHelper.executeCommand('out');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('Multiple Conditional Exits', () => {
    it('should handle independent conditional exits', () => {
      // Test east exit independently
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateNoMovement('east', 'kitchen');

      testEnv.services.gameState.setFlag('door_windo_open', true);
      const result0 = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result0);
      accessHelper.setCurrentScene('kitchen');

      // Test out exit independently
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateNoMovement('out', 'kitchen');

      testEnv.services.gameState.setFlag('door_windo_open', true);
      const result1 = accessHelper.executeCommand('out');
      accessHelper.verifySuccess(result1);
      accessHelper.setCurrentScene('kitchen');

    });
  });

  describe('Unconditional Exits Always Available', () => {
    it('should allow west exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow up exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('up');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('attic');
    });

  });

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      testEnv.services.gameState.setFlag('door_windo_open', false);
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const restrictedExits = accessHelper.getAvailableExits();
      const restrictedDirections = restrictedExits.map(exit => exit.direction);

      // Unconditional exits should always be available
      expect(restrictedDirections).toContain('west');
      expect(restrictedDirections).toContain('up');

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('west');
      expect(openDirections).toContain('up');
      expect(openDirections).toContain('east');
      expect(openDirections).toContain('out');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain door_windo_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_windo_open', true);

      // Move to destination
      accessHelper.executeCommand('east');
      expect(accessHelper.getCurrentScene()).toBe('behind_house');

      // Flag should still be true
      accessHelper.validateFlagState('door_windo_open', true);

      // Move back (if possible)
      accessHelper.executeCommand('west');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');
      accessHelper.validateFlagState('door_windo_open', true);
    });

    it('should maintain door_windo_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_windo_open', true);

      // Move to destination
      accessHelper.executeCommand('out');
      expect(accessHelper.getCurrentScene()).toBe('behind_house');

      // Flag should still be true
      accessHelper.validateFlagState('door_windo_open', true);

      // Move back (if possible)
      accessHelper.executeCommand('in');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');
      accessHelper.validateFlagState('door_windo_open', true);
    });

  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      testEnv.services.gameState.setFlag('door_windo_open', true);
      testEnv.services.gameState.setFlag('door_windo_open', true);

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine ');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('door_windo_open', true);
      accessHelper.validateFlagState('door_windo_open', true);
    });

    it('should maintain flag states during inventory operations', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Inventory operations
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('door_windo_open', false);
      accessHelper.validateFlagState('door_windo_open', false);
    });

    it('should reflect door_windo_open changes for east in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('kitchen');

      // Block again
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(result);
    });

    it('should reflect door_windo_open changes for out in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('out');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('out');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('kitchen');

      // Block again
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('out');
      accessHelper.verifyFailure(result);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual door_windo_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_windo_open',
        true,
        'east',
        'behind_house'
      );

      // Reset scene
      accessHelper.setCurrentScene('kitchen');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_windo_open', false);
      const blockedResult = accessHelper.executeCommand('east');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_windo_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_windo_open', 'east');
    });

    it('should handle manual door_windo_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_windo_open',
        true,
        'out',
        'behind_house'
      );

      // Reset scene
      accessHelper.setCurrentScene('kitchen');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_windo_open', false);
      const blockedResult = accessHelper.executeCommand('out');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_windo_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_windo_open', 'out');
    });

  });
});
