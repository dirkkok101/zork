/**
 * Conditional Access Test Template
 * Generates tests for flag-based exits and conditional movement
 */

export const conditionalAccessTestTemplate = `/**
 * Conditional Access Tests - {{title}} Scene
 * Auto-generated tests for flag-based exit mechanics
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { ConditionalAccessHelper } from '@testing/helpers/ConditionalAccessHelper';

describe('Conditional Access - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let accessHelper: ConditionalAccessHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    accessHelper = new ConditionalAccessHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#each conditionalExits}}
  describe('{{this.flagName}} Flag Mechanics - {{../title}}', () => {
    it('should block {{this.direction}} exit when {{this.flagName}} is false', () => {
      // Set flag to false (closed/blocked)
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      accessHelper.validateFlagState('{{this.flagName}}', false);

      // Attempt to move - should be blocked
      accessHelper.validateBlockedExit('{{this.direction}}', /{{this.errorPattern}}/i);
      expect(accessHelper.getCurrentScene()).toBe('{{../id}}');
    });

    it('should allow {{this.direction}} exit when {{this.flagName}} is true', () => {
      // Set flag to true (open/allowed)
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      accessHelper.validateFlagState('{{this.flagName}}', true);

      // Attempt to move - should succeed
      accessHelper.validateAllowedExit('{{this.direction}}', '{{this.to}}');
    });

    it('should show correct error message for blocked {{this.direction}} exit', () => {
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);

      const result = accessHelper.executeCommand('{{this.direction}}');

      accessHelper.verifyFailure(result);
      expect(result.message).toMatch(/{{this.errorPattern}}/i);
    });

    it('should persist {{this.flagName}} flag across commands', () => {
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);

      // Execute various non-movement commands
      accessHelper.validateFlagPersistence('{{this.flagName}}', false, [
        'look',
        'inventory',
        'examine {{../firstItemName}}'
      ]);
    });

    it('should maintain {{this.flagName}} flag consistency during failed movement attempts', () => {
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);

      // Multiple failed attempts should not change flag
      accessHelper.validateFlagStabilityDuringFailedAttempts(
        '{{this.flagName}}',
        false,
        ['{{this.direction}}', '{{this.direction}}', '{{this.direction}}']
      );
    });

    it('should provide consistent error messages for {{this.direction}} exit', () => {
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);

      // Multiple attempts should return same error
      accessHelper.validateConsistentErrorMessages('{{this.direction}}', 3);
    });
  });

  {{#if this.hasOpenCommand}}
  describe('Flag State Transitions - {{this.flagName}}', () => {
    it('should support complete flag cycle for {{this.direction}} exit', () => {
      // Test blocked -> allowed -> blocked cycle
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      let result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifyFailure(result);

      // Enable access
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('{{this.to}}');

      // Return to original scene
      accessHelper.setCurrentScene('{{../id}}');

      // Disable access
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifyFailure(result);
    });

    it('should handle rapid flag changes for {{this.direction}}', () => {
      for (let i = 0; i < 3; i++) {
        // Allow
        testEnv.services.gameState.setFlag('{{this.flagName}}', true);
        const allowResult = accessHelper.executeCommand('{{this.direction}}');
        accessHelper.verifySuccess(allowResult);
        accessHelper.setCurrentScene('{{../id}}');

        // Block
        testEnv.services.gameState.setFlag('{{this.flagName}}', false);
        const blockResult = accessHelper.executeCommand('{{this.direction}}');
        accessHelper.verifyFailure(blockResult);
      }
    });
  });
  {{/if}}

  {{/each}}

  {{#if hasMultipleConditionalExits}}
  describe('Multiple Conditional Exits', () => {
    it('should handle independent conditional exits', () => {
      {{#each conditionalExits}}
      // Test {{this.direction}} exit independently
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      accessHelper.validateNoMovement('{{this.direction}}', '{{../id}}');

      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      const result{{@index}} = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifySuccess(result{{@index}});
      accessHelper.setCurrentScene('{{../id}}');

      {{/each}}
    });
  });
  {{/if}}

  {{#if hasUnconditionalExits}}
  describe('Unconditional Exits Always Available', () => {
    {{#each unconditionalExits}}
    it('should allow {{this.direction}} exit regardless of flag states', () => {
      {{#each ../conditionalExits}}
      // Set conditional flag to false
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      {{/each}}

      // Unconditional exit should still work
      const result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifySuccess(result);
      expect(accessHelper.getCurrentScene()).toBe('{{this.to}}');
    });

    {{/each}}
  });
  {{/if}}

  describe('Exit Availability Based on Flags', () => {
    it('should show different available exits based on flag states', () => {
      // Test with all flags false (maximum restrictions)
      {{#each conditionalExits}}
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      {{/each}}

      const restrictedExits = accessHelper.getAvailableExits();
      const restrictedDirections = restrictedExits.map(exit => exit.direction);

      // Unconditional exits should always be available
      {{#each unconditionalExits}}
      expect(restrictedDirections).toContain('{{this.direction}}');
      {{/each}}

      // Now test with all flags true (maximum access)
      {{#each conditionalExits}}
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      {{/each}}

      const openExits = accessHelper.getAvailableExits();
      const openDirections = openExits.map(exit => exit.direction);

      // All exits should be available
      {{#each unconditionalExits}}
      expect(openDirections).toContain('{{this.direction}}');
      {{/each}}
      {{#each conditionalExits}}
      expect(openDirections).toContain('{{this.direction}}');
      {{/each}}
    });
  });

  describe('Cross-Scene Flag Consistency', () => {
    {{#each conditionalExits}}
    it('should maintain {{this.flagName}} when moving between scenes', () => {
      // Set flag to true
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);

      // Move to destination
      accessHelper.executeCommand('{{this.direction}}');
      expect(accessHelper.getCurrentScene()).toBe('{{this.to}}');

      // Flag should still be true
      accessHelper.validateFlagState('{{this.flagName}}', true);

      // Move back (if possible)
      {{#if this.returnDirection}}
      accessHelper.executeCommand('{{this.returnDirection}}');
      expect(accessHelper.getCurrentScene()).toBe('{{../id}}');
      accessHelper.validateFlagState('{{this.flagName}}', true);
      {{/if}}
    });

    {{/each}}
  });

  describe('Integration with Other Commands', () => {
    it('should maintain flag states during examine commands', () => {
      {{#each conditionalExits}}
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      {{/each}}

      // Examine various things
      accessHelper.executeCommand('look');
      accessHelper.executeCommand('examine {{../firstItemName}}');
      accessHelper.executeCommand('inventory');

      // Flags should remain unchanged
      {{#each conditionalExits}}
      accessHelper.validateFlagState('{{this.flagName}}', true);
      {{/each}}
    });

    it('should maintain flag states during inventory operations', () => {
      {{#each conditionalExits}}
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      {{/each}}

      // Inventory operations
      {{#if ../hasTakeableItem}}
      accessHelper.executeCommand('take {{../firstTakeableItem}}');
      accessHelper.executeCommand('inventory');
      accessHelper.executeCommand('drop {{../firstTakeableItem}}');
      {{else}}
      accessHelper.executeCommand('inventory');
      {{/if}}

      // Flags should remain unchanged
      {{#each conditionalExits}}
      accessHelper.validateFlagState('{{this.flagName}}', false);
      {{/each}}
    });

    {{#each conditionalExits}}
    it('should reflect {{this.flagName}} changes for {{this.direction}} in subsequent commands', () => {
      // Start blocked
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      let result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifyFailure(result);

      // Allow access
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifySuccess(result);
      accessHelper.setCurrentScene('{{../id}}');

      // Block again
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      result = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifyFailure(result);
    });

    {{/each}}
  });

  describe('Error Handling and Edge Cases', () => {
    {{#each conditionalExits}}
    it('should handle manual {{this.flagName}} flag manipulation', () => {
      // Manually set flag to true
      accessHelper.validateManualFlagManipulation(
        '{{this.flagName}}',
        true,
        '{{this.direction}}',
        '{{this.to}}'
      );

      // Reset scene
      accessHelper.setCurrentScene('{{../id}}');

      // Manually set flag to false and verify blocking
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      const blockedResult = accessHelper.executeCommand('{{this.direction}}');
      accessHelper.verifyFailure(blockedResult);
    });

    it('should handle undefined {{this.flagName}} state gracefully', () => {
      accessHelper.validateUndefinedFlagHandling('{{this.flagName}}', '{{this.direction}}');
    });

    {{/each}}
  });
});
`;
