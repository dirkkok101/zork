/**
 * User Journey Test Template
 * Generates scene-specific player journey tests based on different personas and playstyles
 */

export const userJourneyTestTemplate = `/**
 * User Journey Tests - {{title}} Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';

describe('{{title}} Scene - User Journeys', () => {
  let testEnv: {{testEnvType}};

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Time Visitor Journey', () => {
    it('should explore scene systematically on first visit', () => {
      // Step 1: Initial look around
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      {{#if hasVisibleItems}}
      // Step 2: Examine interesting items
      {{#each visibleItems}}
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);
      {{/each}}
      {{/if}}

      {{#if hasExits}}
      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
      {{/if}}
    });

    {{#if hasContainers}}
    it('should discover and explore containers', () => {
      {{#each containers}}
      // Discover {{this.name}} container
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);

      // Open and investigate
      const open{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('open {{this.name}}');
      if (open{{this.capitalizedId}}Result.success) {
        const lookIn{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('look in {{this.name}}');
        expect(lookIn{{this.capitalizedId}}Result.success).toBe(true);
      }
      {{/each}}
    });
    {{/if}}
  });

  {{#if hasTreasures}}
  describe('Treasure Hunter Journey', () => {
    it('should prioritize collecting valuable treasures', () => {
      {{#each treasures}}
      // Identify {{this.name}} as treasure
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);

      // Collect treasure
      const take{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('take {{this.name}}');
      if (take{{this.capitalizedId}}Result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('{{this.id}}');
      }
      {{/each}}

      // Verify treasures collected
      const inventory = testEnv.services.gameState.getGameState().inventory;
      expect(inventory.length).toBeGreaterThan(0);
    });

    {{#if hasWeightRestriction}}
    it('should manage weight while collecting treasures', () => {
      // Try to collect heaviest treasure first
      {{#if heaviestTreasure}}
      const takeHeavyResult = testEnv.commandProcessor.processCommand('take {{heaviestTreasure.name}}');

      if (takeHeavyResult.success) {
        // Test if can exit with treasure
        const exitResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');

        if (!exitResult.success || !exitResult.countsAsMove) {
          // Adapt strategy - drop and take lighter treasure
          testEnv.commandProcessor.processCommand('drop {{heaviestTreasure.name}}');
          {{#if lightestTreasure}}
          testEnv.commandProcessor.processCommand('take {{lightestTreasure.name}}');
          {{/if}}
        }
      }
      {{/if}}
    });
    {{/if}}
  });
  {{/if}}

  {{#if hasTools}}
  describe('Tool Collector Journey', () => {
    it('should focus on collecting useful tools', () => {
      {{#each tools}}
      // Identify {{this.name}} as useful tool
      const examine{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('examine {{this.name}}');
      expect(examine{{this.capitalizedId}}Result.success).toBe(true);

      // Collect tool
      const take{{this.capitalizedId}}Result = testEnv.commandProcessor.processCommand('take {{this.name}}');
      if (take{{this.capitalizedId}}Result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('{{this.id}}');
      }
      {{/each}}
    });
  });
  {{/if}}

  {{#if hasWeightRestriction}}
  describe('Problem-Solving Journey', () => {
    it('should discover weight restriction through trial and error', () => {
      // Step 1: Take items without knowing about weight limit
      {{#each takeableItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Step 2: Attempt to exit
      const exitResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');

      // Step 3: Adapt based on result
      if (!exitResult.success || !exitResult.countsAsMove) {
        // Player discovers weight restriction
        expect(exitResult.success).toBe(false);

        // Step 4: Drop items strategically
        {{#if heaviestItem}}
        testEnv.commandProcessor.processCommand('drop {{heaviestItem.name}}');
        {{/if}}

        // Step 5: Retry exit
        const retryResult = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
        expect(retryResult.countsAsMove).toBe(true);
      }
    });

    it('should learn from mistakes and optimize strategy', () => {
      // Initial failed attempt
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const failedExit = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
      expect(failedExit.success).toBe(false);

      // Learned behavior - drop and retry
      {{#if overLimitItems.[0]}}
      testEnv.commandProcessor.processCommand('drop {{overLimitItems.[0].name}}');
      {{/if}}

      const successExit = testEnv.commandProcessor.processCommand('{{restrictedDirection}}');
      expect(successExit.countsAsMove).toBe(true);
    });
  });
  {{/if}}

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      {{#if primaryObjective}}
      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take {{primaryObjective.name}}');
      {{/if}}

      {{#if hasExits}}
      // Exit efficiently
      {{#if firstExit}}
      testEnv.commandProcessor.processCommand('{{firstExit.direction}}');
      {{/if}}
      {{/if}}

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      {{#if hasVisibleItems}}
      // Step 2: Examine every item
      {{#each visibleItems}}
      testEnv.commandProcessor.processCommand('examine {{this.name}}');
      {{/each}}
      {{/if}}

      {{#if hasContainers}}
      // Step 3: Open all containers
      {{#each containers}}
      testEnv.commandProcessor.processCommand('open {{this.name}}');
      testEnv.commandProcessor.processCommand('look in {{this.name}}');
      {{/each}}
      {{/if}}

      {{#if hasTakeableItems}}
      // Step 4: Take all items (if possible)
      {{#each lightItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}
      {{/if}}

      // Step 5: Check inventory
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });
  });

  describe('Error Recovery Journey', () => {
    it('should gracefully recover from mistakes', () => {
      // Mistake 1: Try invalid command
      const invalidCmd = testEnv.commandProcessor.processCommand('take nonexistent');
      expect(invalidCmd.success).toBe(false);

      // Recovery: Continue with valid action
      const validCmd = testEnv.commandProcessor.processCommand('look');
      expect(validCmd.success).toBe(true);

      {{#if hasContainers}}
      // Mistake 2: Try to take from closed container
      {{#if containers.[0]}}
      testEnv.commandProcessor.processCommand('take item from {{containers.[0].name}}');

      // Recovery: Open container first
      testEnv.commandProcessor.processCommand('open {{containers.[0].name}}');
      {{/if}}
      {{/if}}

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('{{id}}');
    });
  });

  {{#if hasMultipleExits}}
  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = '{{id}}';

      {{#each simpleExits}}
      // Test {{this.direction}} exit
      const {{this.direction}}Result = testEnv.commandProcessor.processCommand('{{this.direction}}');

      if ({{this.direction}}Result.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('{{this.to}}');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      {{/each}}
    });
  });
  {{/if}}

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      {{#if firstVisibleItem}}
      testEnv.commandProcessor.processCommand('examine {{firstVisibleItem.name}}');
      {{/if}}
      testEnv.commandProcessor.processCommand('inventory');
      {{#if firstTakeableItem}}
      testEnv.commandProcessor.processCommand('take {{firstTakeableItem.name}}');
      testEnv.commandProcessor.processCommand('drop {{firstTakeableItem.name}}');
      {{/if}}

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
`;
