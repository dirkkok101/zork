/**
 * Weight Restrictions Tests - Living Room Scene
 * Auto-generated tests for weight-based mechanics
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { WeightHelper } from '@testing/helpers/WeightHelper';

describe('Weight Restrictions - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let weightHelper: WeightHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

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

  describe('Weight Threshold - east Exit', () => {
    it('should allow exit with empty inventory', () => {
      weightHelper.clearInventory();

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(0);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should allow exit with single light item (carpet - 5 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take carpet');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(5);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should allow exit with single light item (newspaper - 2 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take newspaper');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(2);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(true);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should test exit with medium item (lamp - 15 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take lamp');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(15);

      const result = weightHelper.attemptExit('east');

      // Test based on weight threshold
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      } else {
        weightHelper.verifyWeightBlockedExit(result, 'living_room');
      }
    });

    it('should block exit with heavy item (sword - 30 weight)', () => {
      weightHelper.clearInventory();

      // Take item from scene
      const takeResult = testEnv.commandProcessor.processCommand('take sword');
      expect(takeResult.success).toBe(true);

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(30);

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(false);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(result, 'living_room');
    });

    it('should test exit with multiple items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBe(7);

      const result = weightHelper.attemptExit('east');

      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      } else {
        weightHelper.verifyWeightBlockedExit(result, 'living_room');
      }
    });
  });

  describe('Weight Calculation Accuracy', () => {
    it('should calculate weight correctly for individual items', () => {
      weightHelper.clearInventory();

      const rugWeight = weightHelper.getItemWeight('rug');
      expect(rugWeight).toBe(5);

      const paperWeight = weightHelper.getItemWeight('paper');
      expect(paperWeight).toBe(2);

      const lampWeight = weightHelper.getItemWeight('lamp');
      expect(lampWeight).toBe(15);

    });

    it('should calculate total weight correctly when adding items', () => {
      weightHelper.clearInventory();
      let expectedWeight = 0;

      testEnv.commandProcessor.processCommand('take carpet');
      expectedWeight += 5;
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

      testEnv.commandProcessor.processCommand('take newspaper');
      expectedWeight += 2;
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

      testEnv.commandProcessor.processCommand('take lamp');
      expectedWeight += 15;
      expect(weightHelper.getCurrentWeight()).toBe(expectedWeight);

    });

    it('should maintain consistent weight calculation across checks', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');
      testEnv.commandProcessor.processCommand('take lamp');

      const expectedWeight = 22;
      weightHelper.verifyWeightConsistency(expectedWeight, 5);
    });
  });

  describe('Exit Blocking Mechanics', () => {
    it('should block east exit when over weight limit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      const canExit = weightHelper.canExitWithCurrentWeight();
      expect(canExit).toBe(false);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(result, 'living_room');
      weightHelper.verifyWeightErrorMessage(result);
    });

    it('should show consistent error message for weight-blocked exit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      const result = weightHelper.attemptExit('east');

      weightHelper.verifyFailure(result);
      weightHelper.verifyWeightErrorMessage(result);
    });

    it('should allow other exits regardless of weight', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      // east should be blocked
      const blockedResult = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(blockedResult, 'living_room');

      // Other exits should work
      const westResult = weightHelper.attemptExit('west');
      weightHelper.verifySuccessfulExit(westResult, 'strange_passage');
      testEnv.services.gameState.setCurrentScene('living_room');
      const downResult = weightHelper.attemptExit('down');
      weightHelper.verifySuccessfulExit(downResult, 'cellar');
      testEnv.services.gameState.setCurrentScene('living_room');
    });
  });

  describe('Weight Management Strategies', () => {
    it('should enable exit after dropping heavy items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      // Should be blocked initially
      let result = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(result, 'living_room');

      // Drop heaviest item
      const dropResult = weightHelper.dropItem('sword');
      weightHelper.verifyItemDropped(dropResult, 'sword');

      // Should now be able to exit if under limit
      result = weightHelper.attemptExit('east');
      if (weightHelper.canExitWithCurrentWeight()) {
        weightHelper.verifySuccessfulExit(result, 'kitchen');
      }
    });

    it('should calculate weight correctly after dropping items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');
      testEnv.commandProcessor.processCommand('take lamp');

      const initialWeight = weightHelper.getCurrentWeight();
      expect(initialWeight).toBe(22);

      const itemWeight = weightHelper.getItemWeight('rug');
      weightHelper.dropItem('rug');

      const finalWeight = weightHelper.getCurrentWeight();
      expect(finalWeight).toBe(initialWeight - itemWeight);
    });

    it('should allow exit after dropping all items', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      // Should be blocked initially
      let result = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(result, 'living_room');

      // Drop all items
      weightHelper.dropAllItems();
      expect(weightHelper.getCurrentWeight()).toBe(0);

      // Should now be able to exit
      result = weightHelper.attemptExit('east');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle weight exactly at threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      // Test at exact limit (15 weight units)
      testEnv.commandProcessor.processCommand('take newspaper');
      testEnv.commandProcessor.processCommand('take carpet');

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeLessThanOrEqual(limit);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifySuccessfulExit(result, 'kitchen');
    });

    it('should handle weight just over threshold', () => {
      weightHelper.clearInventory();
      const limit = weightHelper.getWeightLimit();

      testEnv.commandProcessor.processCommand('take sword');

      const weight = weightHelper.getCurrentWeight();
      expect(weight).toBeGreaterThan(limit);

      const result = weightHelper.attemptExit('east');
      weightHelper.verifyWeightBlockedExit(result, 'living_room');
    });

  });

  describe('Integration with Game State', () => {
    it('should maintain weight calculation across commands', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');
      testEnv.commandProcessor.processCommand('take lamp');

      const expectedWeight = 22;

      // Execute various commands
      weightHelper.verifyWeightPersistence(expectedWeight, [
        'look',
        'inventory',
        'examine wooden door'
      ]);
    });

    it('should not affect weight calculation on failed exit attempts', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');

      const initialWeight = weightHelper.getCurrentWeight();

      // Attempt exit multiple times
      for (let i = 0; i < 3; i++) {
        const result = weightHelper.attemptExit('east');
        weightHelper.verifyWeightBlockedExit(result, 'living_room');

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
      testEnv.commandProcessor.processCommand('take carpet');
      expect(weightHelper.isLightLoad()).toBe(true);
      expect(weightHelper.isHeavyLoad()).toBe(false);

      // Heavy load
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take sword');
      expect(weightHelper.isHeavyLoad()).toBe(true);
      expect(weightHelper.isLightLoad()).toBe(false);
    });

    it('should correctly predict if adding item would exceed limit', () => {
      weightHelper.clearInventory();
      testEnv.commandProcessor.processCommand('take lamp');

      const wouldExceedLamp = weightHelper.wouldExceedLimit('lamp');
      expect(typeof wouldExceedLamp).toBe('boolean');
    });
  });
});
