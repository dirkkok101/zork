/**
 * Conditional Access Tests - Reservoir Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - Reservoir Scene', () => {
  let testEnv: ReservoirTestEnvironment;
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('egypt_flag Flag Mechanics - Reservoir', () => {
    it('should block south exit when egypt_flag is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('egypt_flag', false);
      accessHelper.validateFlagState('egypt_flag', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('south', /(?:can&#x27;t|cannot|unable|blocked|closed)/i);
      expect(accessHelper.getCurrentScene()).toBe('reservoir');
    });

    it('should allow south exit when egypt_flag is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('egypt_flag', true);
      accessHelper.validateFlagState('egypt_flag', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('south', 'reses');
    });

    it('should show correct error message for blocked south exit', () => {
      testEnv.services.gameState.setFlag('egypt_flag', false);

      const result = accessHelper.executeCommand('south');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/(?:can&#x27;t|cannot|unable|blocked|closed)/i);
    });

    it('should persist egypt_flag flag across commands', () => {
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('egypt_flag', false, [
        'look',
        'inventory',
        'examine item'
      ]);
    });

    it('should maintain egypt_flag flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        'egypt_flag',
        false,
        ['south', 'south', 'south']
      );
    });

    it('should provide consistent error messages for south exit', () => {
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('south', 3);
    });
  });

  describe('Unconditional Exits Always Available', () => {
    it('should allow north exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('north');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('resen');
    });

    it('should allow up exit regardless of flag states', () => {
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('up');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('instr');
    });

  });

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      testEnv.services.gameState.setFlag('egypt_flag', false);

      const restrictedExits = accessHelper.getAvailableExits();
      const restrictedDirections = restrictedExits.map(exit => exit.direction);

      // Unconditional exits should always be available
      expect(restrictedDirections).toContain('north');
      expect(restrictedDirections).toContain('up');

      // Now test with all flags true (maximum access)
      testEnv.services.gameState.setFlag('egypt_flag', true);

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      expect(openDirections).toContain('north');
      expect(openDirections).toContain('up');
      expect(openDirections).toContain('south');
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    it('should maintain egypt_flag when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('egypt_flag', true);

      // Move to destination
      accessHelper.executeCommand('south');
      expect(accessHelper.getCurrentScene()).toBe('reses');

      // Flag should still be true
      accessHelper.validateFlagState('egypt_flag', true);

      // Move back (if possible)
      accessHelper.executeCommand('north');
      expect(accessHelper.getCurrentScene()).toBe('reservoir');
      accessHelper.validateFlagState('egypt_flag', true);
    });

  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      testEnv.services.gameState.setFlag('egypt_flag', true);

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine ');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('egypt_flag', true);
    });

    it('should maintain flag states during inventory operations', () => {
      testEnv.services.gameState.setFlag('egypt_flag', false);

      // Inventory operations
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      accessHelper.validateFlagState('egypt_flag', false);
    });

    it('should reflect egypt_flag changes for south in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('egypt_flag', false);
      let result = accessHelper.executeCommand('south');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('egypt_flag', true);
      result = accessHelper.executeCommand('south');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('reservoir');

      // Block again
      testEnv.services.gameState.setFlag('egypt_flag', false);
      result = accessHelper.executeCommand('south');
      accessHelper.verifyFailure(result);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle manual egypt_flag flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        'egypt_flag',
        true,
        'south',
        'reses'
      );

      // Reset scene
      accessHelper.setCurrentScene('reservoir');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('egypt_flag', false);
      const blockedResult = accessHelper.executeCommand('south');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined egypt_flag state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('egypt_flag', 'south');
    });

  });
});
