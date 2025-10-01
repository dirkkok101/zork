/**
 * Workflow Test Template
 * Generates tests for common multi-step interaction sequences
 */

export const workflowTestTemplate = `/**
 * Workflow Tests - {{title}} Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';

describe('Workflows - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if hasContainerWorkflows}}
  describe('Container Interaction Workflows', () => {
    {{#each containers}}
    it('should complete full {{this.name}} container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open {{this.name}}');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in {{this.name}}');
      expect(lookInResult.success).toBe(true);

      {{#if this.hasContents}}
      // Step 4: Take item from container
      const takeResult = testEnv.commandProcessor.processCommand('take {{this.firstContent}} from {{this.name}}');
      if (takeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('{{this.firstContentId}}');
      }
      {{/if}}

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close {{this.name}}');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple {{this.name}} open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open {{this.name}}');
      const examine1 = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      testEnv.commandProcessor.processCommand('close {{this.name}}');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open {{this.name}}');
      const examine2 = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close {{this.name}}');
    });

    {{/each}}
  });
  {{/if}}

  {{#if hasItemCollectionWorkflow}}
  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      {{#each takeableItems}}
      // Take {{this.name}}
      const take{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('take {{this.name}}');
      if (take{{this.capitalizedId}}Result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('{{this.id}}');
      }

      {{/each}}

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      {{#if firstTakeableItem}}
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine {{firstTakeableItem.name}}');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take {{firstTakeableItem.name}}');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('{{firstTakeableItem.id}}');
      {{/if}}
    });
  });
  {{/if}}

  {{#if hasWeightManagementWorkflow}}
  describe('Weight Management Workflow', () => {
    it('should handle weight-limited item collection', () => {
      // Step 1: Take light items first
      {{#each lightItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Step 2: Test if can exit
      const lightExitResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
      const canExitLight = lightExitResult.success && lightExitResult.countsAsMove;

      if (canExitLight) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('{{restrictedDestination}}');

        // Return to scene
        {{#if returnDirection}}
        testEnv.commandProcessor.processCommand('{{returnDirection}}');
        {{/if}}
      }

      // Step 3: Try adding heavier items
      {{#each mediumItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Step 4: Test exit again
      const heavyExitResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');

      if (!heavyExitResult.success || !heavyExitResult.countsAsMove) {
        // Step 5: Drop items to reduce weight
        {{#if mediumItems.[0]}}
        testEnv.commandProcessor.processCommand('drop {{mediumItems.[0].name}}');
        {{/if}}

        // Step 6: Retry exit
        const retryExitResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
        expect(retryExitResult.countsAsMove).toBe(true);
      }
    });

    it('should recover from overweight situation', () => {
      // Overload inventory
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Attempt exit - should fail
      const blockedResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
      expect(blockedResult.success).toBe(false);

      // Drop heaviest item
      {{#if overLimitItems.[0]}}
      const dropResult = testEnv.commandProcessor.processCommand('drop {{overLimitItems.[0].name}}');
      expect(dropResult.success).toBe(true);
      {{/if}}

      // Retry exit - should succeed
      const successResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
      expect(successResult.countsAsMove).toBe(true);
    });
  });
  {{/if}}

  {{#if hasTreasureWorkflow}}
  describe('Treasure Collection Workflow', () => {
    it('should complete treasure discovery and collection', () => {
      {{#each treasures}}
      // Discover {{this.name}}
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);

      // Collect {{this.name}}
      const take{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('take {{this.name}}');
      if (take{{this.capitalizedId}}Result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('{{this.id}}');
      }

      {{/each}}

      // Verify treasures collected
      const inventory = testEnv.services.gameState.getGameState().inventory;
      expect(inventory.length).toBeGreaterThan(0);
    });
  });
  {{/if}}

  {{#if hasExplorationWorkflow}}
  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      {{#each visibleItems}}
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);
      {{/each}}

      // Step 3: Test all exits
      {{#each availableExits}}
      const exit{{this.capitalizedDirection}}Result = testEnv.commandProcessor.processCommand('{{this.direction}}');
      expect(exit{{this.capitalizedDirection}}Result).toBeDefined();

      // Return to original scene for next test
      if (exit{{this.capitalizedDirection}}Result.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('{{../id}}');
      }
      {{/each}}

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('{{id}}');
    });
  });
  {{/if}}

  {{#if hasConditionalAccessWorkflow}}
  describe('Conditional Access Workflow', () => {
    it('should handle flag-based progression', () => {
      // Step 1: Test blocked exit
      const blockedResult = testEnv.commandProcessor.processCommand('{{conditionalExit.direction}}');
      expect(blockedResult.success).toBe(false);

      // Step 2: Set required flag
      testEnv.services.gameState.setFlag('{{conditionalExit.requiredFlag}}', true);

      // Step 3: Test now-accessible exit
      const accessibleResult = testEnv.commandProcessor.processCommand('{{conditionalExit.direction}}');
      expect(accessibleResult.countsAsMove).toBe(true);
    });
  });
  {{/if}}

  describe('Error Recovery Workflow', () => {
    it('should gracefully handle invalid actions in sequence', () => {
      // Valid action
      const validResult = testEnv.commandProcessor.processCommand('look');
      expect(validResult.success).toBe(true);

      // Invalid action
      const invalidResult = testEnv.commandProcessor.processCommand('take nonexistent');
      expect(invalidResult.success).toBe(false);

      // Recovery with valid action
      const recoveryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(recoveryResult.success).toBe(true);

      // Verify scene state intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('{{id}}');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      {{#if firstVisibleItem}}
      testEnv.commandProcessor.processCommand('examine {{firstVisibleItem.name}}');
      {{/if}}

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('{{id}}');
    });
  });
});
`;
