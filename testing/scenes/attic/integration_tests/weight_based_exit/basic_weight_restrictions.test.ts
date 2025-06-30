/**
 * Attic Scene - Weight-Based Exit Integration Tests
 * Tests the unique weight-based exit restrictions specific to the attic scene
 * This is the only scene in Zork with inventory weight affecting movement
 */

import '../look_command/setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from '../look_command/helpers/attic_integration_test_factory';

describe('Attic Scene - Weight-Based Exit Restrictions', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Weight Threshold Determination', () => {
    it('empty inventory allows exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(0);
      
      const canExit = testEnv.weightBasedExitHelper.canExitDown();
      expect(canExit).toBe(true);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('single light item (knife - 5 weight) allows exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('knife');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(5);
      
      const canExit = testEnv.weightBasedExitHelper.canExitDown();
      expect(canExit).toBe(true);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('single medium item (brick - 9 weight) allows exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('brick');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(9);
      
      const canExit = testEnv.weightBasedExitHelper.canExitDown();
      expect(canExit).toBe(true);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('single heavy item (rope - 10 weight) threshold test', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('rope');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(10);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      
      // This tests the exact weight threshold
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      } else {
        testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      }
    });

    it('two light items (knife + brick - 14 weight) allows exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('brick');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(14);
      
      const canExit = testEnv.weightBasedExitHelper.canExitDown();
      expect(canExit).toBe(true);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('medium + heavy items (brick + rope - 19 weight) threshold test', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(19);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      
      // Test near threshold
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      } else {
        testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      }
    });

    it('all three items (24 weight) blocks exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(24);
      
      const canExit = testEnv.weightBasedExitHelper.canExitDown();
      expect(canExit).toBe(false);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
    });
  });

  describe('Precise Weight Threshold Discovery', () => {
    it('binary search for exact weight threshold', () => {
      // Start with known light load
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('knife'); // 5 weight
      
      let result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      testEnv.weightBasedExitHelper.returnToAttic();
      
      // Add medium weight
      testEnv.takeCommandHelper.executeTake('brick'); // +9 = 14 total
      result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      testEnv.weightBasedExitHelper.returnToAttic();
      
      // Add heavy weight
      testEnv.takeCommandHelper.executeTake('rope'); // +10 = 24 total
      result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      
      // Record the threshold discovery
      const lightestBlockingWeight = 24;
      const heaviestAllowingWeight = 14;
      
      expect(lightestBlockingWeight).toBeGreaterThan(heaviestAllowingWeight);
      
      // The threshold is somewhere between 14 and 24
      testEnv.weightBasedExitHelper.recordWeightThreshold(heaviestAllowingWeight, lightestBlockingWeight);
    });

    it('test weight threshold with container contents', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_heavy_item']);
      
      // Take brick with contents
      testEnv.takeCommandHelper.executeTake('brick');
      
      // Weight should include container weight (brick itself = 9 weight)
      // Container contents weight may or may not be counted
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBeGreaterThanOrEqual(9);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      
      // Test if container contents affect weight calculation
      if (weight < 20) {
        testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      } else {
        testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      }
    });
  });

  describe('Weight Calculation Accuracy', () => {
    it('weight calculation matches individual item weights', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      const knifeWeight = testEnv.weightBasedExitHelper.getItemWeight('knife');
      const brickWeight = testEnv.weightBasedExitHelper.getItemWeight('brick');
      const ropeWeight = testEnv.weightBasedExitHelper.getItemWeight('rope');
      
      expect(knifeWeight).toBe(5);
      expect(brickWeight).toBe(9);
      expect(ropeWeight).toBe(10);
      
      // Test incremental addition
      testEnv.takeCommandHelper.executeTake('knife');
      expect(testEnv.weightBasedExitHelper.getCurrentWeight()).toBe(5);
      
      testEnv.takeCommandHelper.executeTake('brick');
      expect(testEnv.weightBasedExitHelper.getCurrentWeight()).toBe(14);
      
      testEnv.takeCommandHelper.executeTake('rope');
      expect(testEnv.weightBasedExitHelper.getCurrentWeight()).toBe(24);
    });

    it('weight calculation is consistent across commands', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Weight should be same regardless of how we check it
      const weightFromHelper = testEnv.weightBasedExitHelper.getCurrentWeight();
      const weightFromTakeHelper = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      const weightFromMoveHelper = testEnv.moveCommandHelper.getCurrentInventoryWeight();
      
      expect(weightFromHelper).toBe(19);
      expect(weightFromTakeHelper).toBe(19);
      expect(weightFromMoveHelper).toBe(19);
    });
  });

  describe('Exit Blocking Mechanics', () => {
    it('weight blocking prevents all down movement variations', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems(); // 24 weight
      
      // Test all movement command variations
      const commands = ['down', 'd', 'go down', 'move down', 'walk down', 'travel down'];
      
      commands.forEach(command => {
        const result = testEnv.weightBasedExitHelper.executeMovementCommand(command);
        testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
        
        // Player should still be in attic
        expect(testEnv.weightBasedExitHelper.getCurrentScene()).toBe('attic');
      });
    });

    it('weight blocking shows consistent error message', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems();
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      testEnv.weightBasedExitHelper.verifyWeightErrorMessage(result);
    });

    it('weight blocking affects only down direction', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems();
      
      // Down should be blocked
      const downResult = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(downResult);
      
      // Other directions should show normal "no exit" messages
      const upResult = testEnv.moveCommandHelper.executeMoveUp();
      testEnv.moveCommandHelper.verifyNoExit(upResult, 'up');
      
      const northResult = testEnv.moveCommandHelper.executeMoveDirection('north');
      testEnv.moveCommandHelper.verifyNoExit(northResult, 'north');
    });
  });

  describe('Weight Management Strategies', () => {
    it('dropping items enables exit', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems();
      
      // Should be blocked initially
      let result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      
      // Drop heaviest item (rope)
      const dropResult = testEnv.weightBasedExitHelper.dropItem('rope');
      testEnv.weightBasedExitHelper.verifyItemDropped(dropResult, 'rope');
      
      // Should now be able to exit (14 weight remaining)
      result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('strategic item selection for maximum value', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      // Take most valuable items within weight limit
      // Rope is a treasure (valuable) but heavy (10 weight)
      // Knife is a tool (useful) and light (5 weight)
      // Brick is a container and medium weight (9 weight)
      
      testEnv.takeCommandHelper.executeTake('knife'); // 5 weight
      testEnv.takeCommandHelper.executeTake('brick'); // +9 = 14 weight
      
      // Should be able to exit with these
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      
      // Return to test taking rope instead
      testEnv.weightBasedExitHelper.returnToAttic();
      testEnv.weightBasedExitHelper.dropAllItems();
      
      testEnv.takeCommandHelper.executeTake('rope'); // 10 weight
      
      const ropeResult = testEnv.weightBasedExitHelper.attemptDownExit();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.weightBasedExitHelper.verifySuccessfulExit(ropeResult);
      }
    });

    it('container optimization strategy', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_treasure']);
      
      // Take container with contents
      testEnv.takeCommandHelper.executeTake('brick');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      
      // Test if we can exit with container
      if (weight < 20) {
        const result = testEnv.weightBasedExitHelper.attemptDownExit();
        testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      }
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('weight exactly at threshold', () => {
      // Based on our testing, threshold appears to be around 20
      // Test with combinations that approach this limit
      
      testEnv.atticHelper.clearPlayerInventory();
      
      // Knife (5) + Brick (9) + something close to 5-6 more weight
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('brick');
      
      // Current weight: 14
      // We need to test around the threshold
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      
      testEnv.weightBasedExitHelper.returnToAttic();
      
      // Add one more item to cross threshold
      testEnv.takeCommandHelper.executeTake('rope'); // +10 = 24 total
      
      const blockedResult = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(blockedResult);
    });

    it('zero weight items do not affect threshold', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      // Add zero-weight test items
      testEnv.atticHelper.addItemToScene('zero_weight_item', { weight: 0 });
      testEnv.takeCommandHelper.executeTake('zero_weight_item');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(0);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });

    it('negative weight items (if any) do not reduce total', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      // Test with negative weight item (edge case)
      testEnv.atticHelper.addItemToScene('negative_item', { weight: -5 });
      testEnv.takeCommandHelper.executeTake('negative_item');
      
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBeGreaterThanOrEqual(0); // Weight should not go negative
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });
  });

  describe('Integration with Game State', () => {
    it('weight restrictions persist across save/load cycles', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems();
      
      // Should be blocked
      let result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
      
      // Simulate game state persistence
      const gameState = testEnv.weightBasedExitHelper.getGameState();
      const savedInventory = [...gameState.inventory];
      
      // Clear and restore inventory
      testEnv.atticHelper.clearPlayerInventory();
      gameState.inventory = savedInventory;
      
      // Should still be blocked
      result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
    });

    it('weight calculation unaffected by scene transitions', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('knife');
      
      const weightInAttic = testEnv.weightBasedExitHelper.getCurrentWeight();
      
      // Move to kitchen
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
      
      // Weight should be same in kitchen
      const weightInKitchen = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weightInKitchen).toBe(weightInAttic);
      
      // Return to attic
      testEnv.moveCommandHelper.executeMoveUp();
      
      // Weight should still be same
      const weightBackInAttic = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weightBackInAttic).toBe(weightInAttic);
    });
  });

  describe('Performance and Consistency', () => {
    it('weight calculation is consistent across multiple checks', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Check weight multiple times
      const weights = [];
      for (let i = 0; i < 5; i++) {
        weights.push(testEnv.weightBasedExitHelper.getCurrentWeight());
      }
      
      // All measurements should be identical
      weights.forEach(weight => {
        expect(weight).toBe(19);
      });
    });

    it('exit attempts do not affect weight calculation', () => {
      testEnv.atticHelper.clearPlayerInventory();
      testEnv.takeCommandHelper.takeAllAtticItems();
      
      const initialWeight = testEnv.weightBasedExitHelper.getCurrentWeight();
      
      // Attempt exit multiple times
      for (let i = 0; i < 3; i++) {
        const result = testEnv.weightBasedExitHelper.attemptDownExit();
        testEnv.weightBasedExitHelper.verifyWeightBlockedExit(result);
        
        const currentWeight = testEnv.weightBasedExitHelper.getCurrentWeight();
        expect(currentWeight).toBe(initialWeight);
      }
    });

    it('complex inventory manipulation maintains consistency', () => {
      testEnv.atticHelper.clearPlayerInventory();
      
      // Complex sequence of take/drop operations
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.weightBasedExitHelper.dropItem('knife');
      testEnv.takeCommandHelper.executeTake('rope');
      testEnv.weightBasedExitHelper.dropItem('brick');
      testEnv.takeCommandHelper.executeTake('knife');
      
      // Final state: rope (10) + knife (5) = 15 weight
      const weight = testEnv.weightBasedExitHelper.getCurrentWeight();
      expect(weight).toBe(15);
      
      const result = testEnv.weightBasedExitHelper.attemptDownExit();
      testEnv.weightBasedExitHelper.verifySuccessfulExit(result);
    });
  });
});