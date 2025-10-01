/**
 * State Validation Test Template
 * Generates comprehensive tests for state persistence and consistency
 *
 * Template Variables:
 * - title: Scene title
 * - sceneId: Scene identifier
 * - testEnvType: TypeScript type for test environment
 * - factoryName: Factory class name
 * - containers: Array of container items with state
 * - itemsWithState: Array of items with state properties (weapons, etc.)
 * - conditionalExits: Array of exits that depend on flags
 * - hasContainers: Boolean indicating if scene has containers
 * - hasItemsWithState: Boolean indicating if scene has items with state
 * - hasConditionalExits: Boolean indicating if scene has conditional exits
 */

export const stateValidationTestTemplate = `/**
 * State Validation Tests - {{title}} Scene
 * Auto-generated tests for state persistence and consistency
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { StateValidationHelper } from '@testing/helpers/StateValidationHelper';

describe('State Validation - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let stateHelper: StateValidationHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

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

  {{#if hasContainers}}
  describe('Container State Persistence', () => {
    {{#each containers}}
    it('{{this.name}} state persists across look commands', () => {
      // Start with closed {{this.name}}
      stateHelper.executeCommand('close {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', false);

      // Execute look command
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('{{this.id}}', false);

      // Open {{this.name}}
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);

      // Multiple look commands should preserve open state
      stateHelper.executeCommand('look');
      stateHelper.validateContainerState('{{this.id}}', true);
    });

    it('{{this.name}} state persists across examine commands', () => {
      // Open {{this.name}}
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);

      // Examine various items should not affect container state
      stateHelper.executeCommand('examine {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);
    });

    {{#if this.canTake}}
    it('{{this.name}} state persists when taken into inventory', () => {
      // Open {{this.name}}
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);

      // Take {{this.name}}
      const takeResult = stateHelper.executeCommand('take {{this.id}}');

      if (takeResult.success) {
        // Verify in inventory
        const inventory = stateHelper.getGameState().inventory;
        expect(inventory).toContain('{{this.id}}');

        // State should persist in inventory
        stateHelper.validateContainerState('{{this.id}}', true);
      }
    });
    {{/if}}

    {{/each}}

    {{#if hasMultipleContainers}}
    it('independent container states do not interfere', () => {
      // Set different states for each container
      {{#each containers}}
      {{#if @first}}
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);
      {{else}}
      stateHelper.executeCommand('close {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', false);
      {{/if}}
      {{/each}}

      // Verify states remained independent
      {{#each containers}}
      {{#if @first}}
      stateHelper.validateContainerState('{{this.id}}', true);
      {{else}}
      stateHelper.validateContainerState('{{this.id}}', false);
      {{/if}}
      {{/each}}
    });
    {{/if}}
  });
  {{/if}}

  {{#if hasItemsWithState}}
  describe('Item State Persistence', () => {
    {{#each itemsWithState}}
    it('{{this.name}} state persists across commands', () => {
      // Execute various non-modifying commands
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine {{this.id}}');

      // State should remain consistent
      stateHelper.validateStateConsistency('{{this.id}}');
    });

    {{/each}}
  });
  {{/if}}

  {{#if hasConditionalExits}}
  describe('Flag-Based State Consistency', () => {
    {{#each conditionalExits}}
    it('{{this.flagName}} flag consistency across commands', () => {
      // Test with flag unset
      testEnv.services.gameState.setFlag('{{this.flagName}}', false);
      stateHelper.validateFlagState('{{this.flagName}}', false);

      // Execute look command
      stateHelper.executeCommand('look');

      // Flag should persist
      stateHelper.validateFlagState('{{this.flagName}}', false);

      // Set flag
      testEnv.services.gameState.setFlag('{{this.flagName}}', true);
      stateHelper.validateFlagState('{{this.flagName}}', true);

      // Execute another command
      stateHelper.executeCommand('look');

      // Flag should still be set
      stateHelper.validateFlagState('{{this.flagName}}', true);
    });

    {{#if this.relatedItem}}
    it('{{this.flagName}} flag state matches {{this.relatedItem}} state', () => {
      const item = testEnv.services.gameState.getItem('{{this.relatedItem}}');
      const flagValue = testEnv.services.gameState.getFlag('{{this.flagName}}');

      // Flag and item state should be consistent
      if (item?.state?.isOpen !== undefined) {
        expect(flagValue).toBe(item.state.isOpen);
      }
    });
    {{/if}}

    {{/each}}
  });
  {{/if}}

  describe('State Consistency Across Commands', () => {
    {{#if hasContainers}}
    {{#each containers}}
    it('{{this.name}} state is reported consistently by all commands', () => {
      // Open {{this.name}}
      stateHelper.executeCommand('open {{this.id}}');

      // Verify state consistency across multiple queries
      stateHelper.validateStateConsistency('{{this.id}}');

      // Different commands should not affect state
      stateHelper.executeCommand('look');
      stateHelper.executeCommand('examine {{this.id}}');

      // State should still be consistent
      stateHelper.validateContainerState('{{this.id}}', true);
    });

    {{/each}}
    {{/if}}

    it('game state integrity is maintained across operations', () => {
      // Verify initial integrity
      stateHelper.validateGameStateIntegrity();

      // Execute various commands
      stateHelper.executeCommand('look');
      {{#if hasContainers}}
      {{#each containers}}
      {{#if @first}}
      stateHelper.executeCommand('examine {{this.id}}');
      {{/if}}
      {{/each}}
      {{/if}}

      // Integrity should be maintained
      stateHelper.validateGameStateIntegrity();
    });
  });

  {{#if hasContainers}}
  {{#if sceneExits}}
  describe('State Persistence Across Scene Transitions', () => {
    {{#each containers}}
    {{#if @first}}
    it('{{this.name}} state persists across scene transitions', () => {
      // Set specific state
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);

      {{#if ../firstExit}}
      // Move to another scene
      const moveResult = stateHelper.executeCommand('{{../firstExit.direction}}');

      if (moveResult.success) {
        // Verify state persisted
        stateHelper.validateContainerState('{{this.id}}', true);

        // Return to scene
        {{#if ../firstExit.reverseDirection}}
        stateHelper.executeCommand('{{../firstExit.reverseDirection}}');
        stateHelper.validateContainerState('{{this.id}}', true);
        {{/if}}
      }
      {{/if}}
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}
  {{/if}}

  describe('State Validation After Failed Operations', () => {
    {{#if hasContainers}}
    {{#each containers}}
    {{#if @first}}
    it('{{this.name}} state remains valid after failed operations', () => {
      // Set initial state
      stateHelper.executeCommand('open {{this.id}}');
      stateHelper.validateContainerState('{{this.id}}', true);

      // Try invalid commands that should fail
      stateHelper.executeCommand('examine nonexistent_item');
      stateHelper.executeCommand('take imaginary_item');

      // State should be unchanged
      stateHelper.validateContainerState('{{this.id}}', true);
    });
    {{/if}}
    {{/each}}
    {{/if}}

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
`;
