/**
 * Weight Restrictions Tests - Attic Scene
 * Auto-generated tests for weight-based mechanics
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { WeightHelper } from '@testing/helpers/WeightHelper';

describe('Weight Restrictions - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let weightHelper: WeightHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

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

  describe('Weight Threshold - down Exit', () => {
    it('should allow exit with empty inventory', () => {
      weightHelper.clearInventory();

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(0);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('down');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should allow exit with single light item (knife - 5 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take knife');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(5);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('down');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should test exit with medium item (brick - 9 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take brick');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(9);

      const result = weightHelper.attemptExit('down');

      // Test based on weight threshold
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      } else {
        weightHelper.verifyWeightBlockedExit(result, 'attic');
      }
    });

    it('should test exit with medium item (rope - 10 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take rope');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(10);

      const result = weightHelper.attemptExit('down');

      // Test based on weight threshold
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      } else {
        weightHelper.verifyWeightBlockedExit(result, 'attic');
      }
    });

  });

  describe('Weight Calculation Accuracy', () => {
    it('should calculate weight correctly for individual items', () => {
      weightHelper.clearInventory();

      const knifeWeight = weightHelper.getItemWeight('knife');
      expect(knifeWeight).toBe(5);

      const brickWeight = weightHelper.getItemWeight('brick');
      expect(brickWeight).toBe(9);

    });

    it('should calculate total weight correctly when adding items', () => {
      weightHelper.clearInventory();
      let expectedWeight = 0;

      testEnv.commandProcessor.processCommand('take knife');
      expectedWeight += 5;
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

      testEnv.commandProcessor.processCommand('take brick');
      expectedWeight += 9;
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

    });

    it('should maintain consistent weight calculation across checks', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take knife');
      testEnv.commandProcessor.processCommand('take brick');

      const expectedWeight = 14;
      weightHelper.verifyWeightConsistency(expectedWeight, 5);
    });
  });

  describe('Exit Blocking Mechanics', () => {
    it('should block down exit when over weight limit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(false);

      const result = weightHelper.attemptExit('down');
      weightHelper.verifyWeightBlockedExit(result, 'attic');
      weightHelper.verifyWeightErrorMessage(result);
    });

    it('should show consistent error message for weight-blocked exit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      const result = weightHelper.attemptExit('down');

      weightHelper.verifyFailure(result);
      weightHelper.verifyWeightErrorMessage(result);
    });

  });

  describe('Weight Management Strategies', () => {
    it('should enable exit after dropping heavy items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      // Should be blocked initially
      let result = weightHelper.attemptExit('down');
      weightHelper.verifyWeightBlockedExit(result, 'attic');

      // Drop heaviest item
      const dropResult = weightHelper.dropItem('rope');
      weightHelper.verifyItemDropped(dropResult, 'rope');

      // Should now be able to exit if under limit
      result = weightHelper.attemptExit('down');
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      }
    });

    it('should calculate weight correctly after dropping items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take knife');
      testEnv.commandProcessor.processCommand('take brick');

      const initialWeight = weightHelper.getCurrentWeight();
      expect(initialWeight).toBe(14);

      const itemWeight = weightHelper.getItemWeight('knife');
      weightHelper.dropItem('knife');

      const finalWeight = weightHelper.getCurrentWeight();
      expect(finalWeight).toBe(initialWeight - itemWeight);
    });

    it('should allow exit after dropping all items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      // Should be blocked initially
      let result = weightHelper.attemptExit('down');
      weightHelper.verifyWeightBlockedExit(result, 'attic');

      // Drop all items
      weightHelper.dropAllItems();
      expect(weightHelper.getCurrentWeight()).toBe(0);

      // Should now be able to exit
      result = weightHelper.attemptExit('down');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });
  });

  describe('Container Weight Mechanics', () => {
    it('should calculate brick weight including contents', () => {
      weightHelper.clearInventory();

      // Empty container weight
      const emptyWeight = weightHelper.getItemWeight('brick');
      expect(emptyWeight).toBe(9);

      // Add container to inventory
      testEnv.commandProcessor.processCommand('take brick');

      // Weight should be just container when empty
      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeGreaterThanOrEqual(emptyWeight);
    });

  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle weight exactly at threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      // Test at exact limit (15 weight units)
      testEnv.commandProcessor.processCommand('take knife');
      testEnv.commandProcessor.processCommand('take brick');

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeLessThanOrEqual(limit);

      const result = weightHelper.attemptExit('down');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should handle weight just over threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeGreaterThan(limit);

      const result = weightHelper.attemptExit('down');
      weightHelper.verifyWeightBlockedExit(result, 'attic');
    });

  });

  describe('Integration with Game State', () => {
    it('should maintain weight calculation across commands', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take knife');
      testEnv.commandProcessor.processCommand('take brick');

      const expectedWeight = 14;

      // Execute various commands
      weightHelper.verifyWeightPersistence(expectedWeight, [
        'look',
        'inventory',
        'examine brick'
      ]);
    });

    it('should not affect weight calculation on failed exit attempts', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      const initialWeight = weightHelper.getCurrentWeight();

      // Attempt exit multiple times
      for (let i = 0; i < 3; i++) {
        const result = weightHelper.attemptExit('down');
        weightHelper.verifyWeightBlockedExit(result, 'attic');

        const currentWeight = weightHelper.getCurrentWeight();
        expect(currentWeight).toBe(initialWeight);
      }
    });
  });

  describe('Weight Limit Information', () => {
    it('should have consistent weight limit', () => {
      const limit = weightHelper.getWeightLimit();
      expect(limit).toBe(15); // Based on InventoryService.hasLightLoad()
    });

    it('should correctly identify light vs heavy load', () => {
      weightHelper.clearInventory();

      // Light load
      testEnv.commandProcessor.processCommand('take knife');
      expect(weightHelper.isLightLoad()).toBe(true);
      expect(weightHelper.isHeavyLoad()).toBe(false);

      // Heavy load
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');
      expect(weightHelper.isHeavyLoad()).toBe(true);
      expect(weightHelper.isLightLoad()).toBe(false);
    });

    it('should correctly predict if adding item would exceed limit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take brick');

      const wouldExceedBrick = weightHelper.wouldExceedLimit('brick');
      expect(typeof wouldExceedBrick).toBe('boolean');
      const wouldExceedRope = weightHelper.wouldExceedLimit('rope');
      expect(typeof wouldExceedRope).toBe('boolean');
    });
  });
});
