/**
 * Conditional Access Tests - Behind House Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { BehindHouseTestEnvironment, BehindHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('door_windo_open Flag Mechanics - Behind House', () => {
    it('should block west exit when door_windo_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateFlagState('door_windo_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('west', /(?:closed|blocked|locked|cannot)/i);
      expect(accessHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow west exit when door_windo_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      accessHelper.validateFlagState('door_windo_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('west', 'kitchen');
    });

    it('should show correct error message for blocked west exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = accessHelper.executeCommand('west');

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
        ['west', 'west', 'west']
      );
    });

    it('should provide consistent error messages for west exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('west', 3);
    });
  });

  describe('Flag State Transitions - door_windo_open', () => {
    it('should support complete flag cycle for west exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Return to original scene
      accessHelper.setCurrentScene('behind_house');

      // Disable access
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for west', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_windo_open', true);
        const allowResult = accessHelper.executeCommand('west');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('behind_house');

        // Block
        testEnv.services.gameState.setFlag('door_windo_open', false);
        const blockResult = accessHelper.executeCommand('west');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('door_windo_open Flag Mechanics - Behind House', () => {
    it('should block in exit when door_windo_open is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateFlagState('door_windo_open', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('in', /(?:closed|blocked|locked|cannot)/i);
      expect(accessHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow in exit when door_windo_open is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      accessHelper.validateFlagState('door_windo_open', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('in', 'kitchen');
    });

    it('should show correct error message for blocked in exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = accessHelper.executeCommand('in');

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
        ['in', 'in', 'in']
      );
    });

    it('should provide consistent error messages for in exit', () => {
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('in', 3);
    });
  });

  describe('Flag State Transitions - door_windo_open', () => {
    it('should support complete flag cycle for in exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('in');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('in');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Return to original scene
      accessHelper.setCurrentScene('behind_house');

      // Disable access
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('in');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for in', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('door_windo_open', true);
        const allowResult = accessHelper.executeCommand('in');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('behind_house');

        // Block
        testEnv.services.gameState.setFlag('door_windo_open', false);
        const blockResult = accessHelper.executeCommand('in');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });

  describe('Multiple Conditional Exits', () => {
    it('should handle independent conditional exits', () => {
      // Test west exit independently
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateNoMovement('west', 'behind_house');

      testEnv.services.gameState.setFlag('door_windo_open', true);
      const result0 = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result0);
      accessHelper.setCurrentScene('behind_house');

      // Test in exit independently
      testEnv.services.gameState.setFlag('door_windo_open', false);
      accessHelper.validateNoMovement('in', 'behind_house');

      testEnv.services.gameState.setFlag('door_windo_open', true);
      const result1 = accessHelper.executeCommand('in');
      accessHelper.verifySuccess(result1);
      accessHelper.setCurrentScene('behind_house');

    });
  });

  describe('Unconditional Exits Always Available', () => {
    it('should allow north exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('north');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('north_of_house');
    });

    it('should allow south exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('south');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('south_of_house');
    });

    it('should allow east exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('door_windo_open', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('east');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('clearing');
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
      expect(restrictedDirections).toContain('north');
      expect(restrictedDirections).toContain('south');
      expect(restrictedDirections).toContain('east');

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('door_windo_open', true);
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('north');
      expect(openDirections).toContain('south');
      expect(openDirections).toContain('east');
      expect(openDirections).toContain('west');
      expect(openDirections).toContain('in');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain door_windo_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_windo_open', true);

      // Move to destination
      accessHelper.executeCommand('west');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Flag should still be true
      accessHelper.validateFlagState('door_windo_open', true);

      // Move back (if possible)
      accessHelper.executeCommand('east');
      expect(accessHelper.getCurrentScene()).toBe('behind_house');
      accessHelper.validateFlagState('door_windo_open', true);
    });

    it('should maintain door_windo_open when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('door_windo_open', true);

      // Move to destination
      accessHelper.executeCommand('in');
      expect(accessHelper.getCurrentScene()).toBe('kitchen');

      // Flag should still be true
      accessHelper.validateFlagState('door_windo_open', true);

      // Move back (if possible)
      accessHelper.executeCommand('out');
      expect(accessHelper.getCurrentScene()).toBe('behind_house');
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

    it('should reflect door_windo_open changes for west in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('west');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('behind_house');

      // Block again
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(result);
    });

    it('should reflect door_windo_open changes for in in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('door_windo_open', false);
      let result = accessHelper.executeCommand('in');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('door_windo_open', true);
      result = accessHelper.executeCommand('in');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('behind_house');

      // Block again
      testEnv.services.gameState.setFlag('door_windo_open', false);
      result = accessHelper.executeCommand('in');
      accessHelper.verifyFailure(result);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual door_windo_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_windo_open',
        true,
        'west',
        'kitchen'
      );

      // Reset scene
      accessHelper.setCurrentScene('behind_house');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_windo_open', false);
      const blockedResult = accessHelper.executeCommand('west');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_windo_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_windo_open', 'west');
    });

    it('should handle manual door_windo_open flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'door_windo_open',
        true,
        'in',
        'kitchen'
      );

      // Reset scene
      accessHelper.setCurrentScene('behind_house');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('door_windo_open', false);
      const blockedResult = accessHelper.executeCommand('in');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined door_windo_open state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('door_windo_open', 'in');
    });

  });
});
