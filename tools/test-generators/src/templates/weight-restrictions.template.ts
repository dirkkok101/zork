/**
 * Weight Restrictions Test Template
 * Generates tests for weight-based exit restrictions and capacity limits
 */

export const weightRestrictionsTestTemplate = `/**
 * Weight Restrictions Tests - {{title}} Scene
 * Auto-generated tests for weight-based mechanics
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { WeightHelper } from '@testing/helpers/WeightHelper';

describe('Weight Restrictions - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let weightHelper: WeightHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    weightHelper = new WeightHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any,
      testEnv.services.items as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if hasWeightRestrictedExit}}
  describe('Weight Threshold - {{restrictedDirection}} Exit', () => {
    it('should allow exit with empty inventory', () => {
      weightHelper.clearInventory();

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(0);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
    });

    {{#each lightItems}}
    it('should allow exit with single light item ({{this.name}} - {{this.weight}} weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take {{this.name}}');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe({{this.weight}});

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('{{../restrictedDirection}}');
      weightHelper.verifySuccessfulExit(result, '{{../restrictedDestination}}');
    });

    {{/each}}

    {{#each mediumItems}}
    it('should test exit with medium item ({{this.name}} - {{this.weight}} weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take {{this.name}}');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe({{this.weight}});

      const result = weightHelper.attemptExit('{{../restrictedDirection}}');

      // Test based on weight threshold
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, '{{../restrictedDestination}}');
      } else {
        weightHelper.verifyWeightBlockedExit(result, '{{../id}}');
      }
    });

    {{/each}}

    {{#if hasHeavyItems}}
    {{#each heavyItems}}
    it('should block exit with heavy item ({{this.name}} - {{this.weight}} weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take {{this.name}}');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe({{this.weight}});

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(false);

      const result = weightHelper.attemptExit('{{../restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(result, '{{../id}}');
    });

    {{/each}}
    {{/if}}

    {{#if hasMultipleItems}}
    it('should test exit with multiple items', () => {
      weightHelper.clearInventory();
      {{#each combinedItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe({{combinedWeight}});

      const result = weightHelper.attemptExit('{{restrictedDirection}}');

      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
      } else {
        weightHelper.verifyWeightBlockedExit(result, '{{id}}');
      }
    });
    {{/if}}
  });

  describe('Weight Calculation Accuracy', () => {
    it('should calculate weight correctly for individual items', () => {
      weightHelper.clearInventory();

      {{#each testItems}}
      const {{this.id}}Weight = weightHelper.getItemWeight('{{this.id}}');
      expect({{this.id}}Weight).toBe({{this.weight}});

      {{/each}}
    });

    it('should calculate total weight correctly when adding items', () => {
      weightHelper.clearInventory();
      let expectedWeight = 0;

      {{#each testItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      expectedWeight += {{this.weight}};
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

      {{/each}}
    });

    it('should maintain consistent weight calculation across checks', () => {
      weightHelper.clearInventory();
      {{#each testItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const expectedWeight = {{totalTestWeight}};
      weightHelper.verifyWeightConsistency(expectedWeight, 5);
    });
  });

  describe('Exit Blocking Mechanics', () => {
    it('should block {{restrictedDirection}} exit when over weight limit', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(false);

      const result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(result, '{{id}}');
      weightHelper.verifyWeightErrorMessage(result);
    });

    it('should show consistent error message for weight-blocked exit', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const result = weightHelper.attemptExit('{{restrictedDirection}}');

      weightHelper.verifyFailure(result);
      weightHelper.verifyWeightErrorMessage(result);
    });

    {{#if hasOtherExits}}
    it('should allow other exits regardless of weight', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // {{restrictedDirection}} should be blocked
      const blockedResult = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(blockedResult, '{{id}}');

      // Other exits should work
      {{#each unrestrictedExits}}
      const {{this.direction}}Result = weightHelper.attemptExit('{{this.direction}}');
      weightHelper.verifySuccessfulExit({{this.direction}}Result, '{{this.to}}');
      testEnv.services.gameState.setCurrentScene('{{../id}}');
      {{/each}}
    });
    {{/if}}
  });

  describe('Weight Management Strategies', () => {
    it('should enable exit after dropping heavy items', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Should be blocked initially
      let result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(result, '{{id}}');

      // Drop heaviest item
      {{#if overLimitItems}}
      const dropResult = weightHelper.dropItem('{{overLimitItems.[0].id}}');
      weightHelper.verifyItemDropped(dropResult, '{{overLimitItems.[0].id}}');

      // Should now be able to exit if under limit
      result = weightHelper.attemptExit('{{restrictedDirection}}');
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
      }
      {{/if}}
    });

    it('should calculate weight correctly after dropping items', () => {
      weightHelper.clearInventory();
      {{#each testItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const initialWeight = weightHelper.getCurrentWeight();
      expect(initialWeight).toBe({{totalTestWeight}});

      {{#if testItems}}
      const itemWeight = weightHelper.getItemWeight('{{testItems.[0].id}}');
      weightHelper.dropItem('{{testItems.[0].id}}');

      const finalWeight = weightHelper.getCurrentWeight();
      expect(finalWeight).toBe(initialWeight - itemWeight);
      {{/if}}
    });

    it('should allow exit after dropping all items', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      // Should be blocked initially
      let result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(result, '{{id}}');

      // Drop all items
      weightHelper.dropAllItems();
      expect(weightHelper.getCurrentWeight()).toBe(0);

      // Should now be able to exit
      result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
    });
  });

  {{#if hasContainers}}
  describe('Container Weight Mechanics', () => {
    {{#each containers}}
    it('should calculate {{this.name}} weight including contents', () => {
      weightHelper.clearInventory();

      // Empty container weight
      const emptyWeight = weightHelper.getItemWeight('{{this.id}}');
      expect(emptyWeight).toBe({{this.weight}});

      // Add container to inventory
      testEnv.commandProcessor.processCommand('take {{this.name}}');

      // Weight should be just container when empty
      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeGreaterThanOrEqual(emptyWeight);
    });

    {{/each}}
  });
  {{/if}}

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle weight exactly at threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      // Test at exact limit (15 weight units)
      {{#each limitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeLessThanOrEqual(limit);

      const result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
    });

    it('should handle weight just over threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeGreaterThan(limit);

      const result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifyWeightBlockedExit(result, '{{id}}');
    });

    {{#if hasZeroWeightItems}}
    it('should handle zero-weight items correctly', () => {
      weightHelper.clearInventory();

      {{#each zeroWeightItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(0);

      const result = weightHelper.attemptExit('{{restrictedDirection}}');
      weightHelper.verifySuccessfulExit(result, '{{restrictedDestination}}');
    });
    {{/if}}
  });

  describe('Integration with Game State', () => {
    it('should maintain weight calculation across commands', () => {
      weightHelper.clearInventory();
      {{#each testItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const expectedWeight = {{totalTestWeight}};

      // Execute various commands
      weightHelper.verifyWeightPersistence(expectedWeight, [
        'look',
        'inventory',
        'examine {{firstItemName}}'
      ]);
    });

    it('should not affect weight calculation on failed exit attempts', () => {
      weightHelper.clearInventory();
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}

      const initialWeight = weightHelper.getCurrentWeight();

      // Attempt exit multiple times
      for (let i = 0; i < 3; i++) {
        const result = weightHelper.attemptExit('{{restrictedDirection}}');
        weightHelper.verifyWeightBlockedExit(result, '{{id}}');

        const currentWeight = weightHelper.getCurrentWeight();
        expect(currentWeight).toBe(initialWeight);
      }
    });
  });
  {{/if}}

  describe('Weight Limit Information', () => {
    it('should have consistent weight limit', () => {
      const limit = weightHelper.getWeightLimit();
      expect(limit).toBe(15); // Based on InventoryService.hasLightLoad()
    });

    it('should correctly identify light vs heavy load', () => {
      weightHelper.clearInventory();

      // Light load
      {{#if lightItems}}
      testEnv.commandProcessor.processCommand('take {{lightItems.[0].name}}');
      expect(weightHelper.isLightLoad()).toBe(true);
      expect(weightHelper.isHeavyLoad()).toBe(false);
      {{/if}}

      // Heavy load
      weightHelper.clearInventory();
      {{#if overLimitItems}}
      {{#each overLimitItems}}
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/each}}
      expect(weightHelper.isHeavyLoad()).toBe(true);
      expect(weightHelper.isLightLoad()).toBe(false);
      {{/if}}
    });

    it('should correctly predict if adding item would exceed limit', () => {
      weightHelper.clearInventory();
      {{#if mediumItems}}
      testEnv.commandProcessor.processCommand('take {{mediumItems.[0].name}}');

      {{#each mediumItems}}
      const wouldExceed{{this.capitalizedId}} = weightHelper.wouldExceedLimit('{{this.id}}');
      expect(typeof wouldExceed{{this.capitalizedId}}).toBe('boolean');
      {{/each}}
      {{/if}}
    });
  });
});
`;
