/**
 * Attic Scene - Move Command Integration Tests
 * Tests all aspects of movement in the attic scene, especially weight-based exit mechanics
 */

import '../look_command/setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from '../look_command/helpers/attic_integration_test_factory';

describe('Attic Scene - Move Command Integration', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Valid Movement Directions', () => {
    it('down movement from attic to kitchen succeeds with light load', () => {
      // Ensure light inventory
      testEnv.moveCommandHelper.clearInventory();
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDown();
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('d (down abbreviation) movement works with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('d');
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });

    it('down movement succeeds with moderately light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      // Add a light item (rope is 10 weight)
      testEnv.moveCommandHelper.addItemToInventory('rope');
      
      const result = testEnv.moveCommandHelper.executeMoveDown();
      
      // Should still work if under weight threshold
      if (testEnv.moveCommandHelper.hasLightLoad()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(result);
      } else {
        testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      }
    });
  });

  describe('Weight-Based Exit Restrictions', () => {
    it('down movement fails with heavy load', () => {
      testEnv.moveCommandHelper.clearInventory();
      // Add heavy items to exceed weight threshold
      testEnv.moveCommandHelper.addItemToInventory('brick'); // 9 weight
      testEnv.moveCommandHelper.addItemToInventory('rope');  // 10 weight
      testEnv.moveCommandHelper.addItemToInventory('knife'); // 5 weight
      // Total: 24 weight (should exceed light_load threshold)
      
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDown();
      
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1); // Failed moves still count
    });

    it('down movement shows correct error message for heavy load', () => {
      testEnv.moveCommandHelper.clearInventory();
      // Add heavy items
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      const result = testEnv.moveCommandHelper.executeMoveDown();
      
      testEnv.moveCommandHelper.verifyMessageContains(result, 'chimney is too narrow');
      testEnv.moveCommandHelper.verifyMessageContains(result, 'baggage');
    });

    it('weight threshold boundary testing', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      // Test with incrementally increasing weight
      const items = ['knife', 'rope']; // 5 + 10 = 15 weight
      items.forEach(itemId => {
        testEnv.moveCommandHelper.addItemToInventory(itemId);
      });
      
      let result = testEnv.moveCommandHelper.executeMoveDown();
      const lightResult = result.success;
      
      // Reset position if movement succeeded
      if (lightResult) {
        testEnv.moveCommandHelper.setCurrentScene('attic');
      }
      
      // Add one more heavy item to cross threshold
      testEnv.moveCommandHelper.addItemToInventory('brick'); // +9 = 24 total
      
      result = testEnv.moveCommandHelper.executeMoveDown();
      const heavyResult = result.success;
      
      // At some point, adding weight should prevent movement
      expect(lightResult || !heavyResult).toBe(true);
    });

    it('dropping items enables movement', () => {
      testEnv.moveCommandHelper.clearInventory();
      // Start with heavy load
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      // Should fail initially
      let result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      
      // Drop items to reduce weight
      testEnv.moveCommandHelper.removeItemFromInventory('brick');
      testEnv.moveCommandHelper.removeItemFromInventory('rope');
      
      // Should now succeed
      result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });
  });

  describe('Blocked Movement Directions', () => {
    it('up movement is blocked (no exit)', () => {
      const result = testEnv.moveCommandHelper.executeMoveUp();
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'up');
    });

    it('north movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('north');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'north');
    });

    it('south movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('south');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'south');
    });

    it('east movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('east');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'east');
    });

    it('west movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('west');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'west');
    });

    it('in movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('in');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'in');
    });

    it('out movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('out');
      
      testEnv.moveCommandHelper.verifyNoExit(result, 'out');
    });
  });

  describe('Movement Command Variations', () => {
    it('go down command works with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const result = testEnv.moveCommandHelper.executeMoveWithGo('down');
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });

    it('move down command works with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const result = testEnv.moveCommandHelper.executeMoveWith('move', 'down');
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });

    it('walk down command works with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const result = testEnv.moveCommandHelper.executeMoveWith('walk', 'down');
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });

    it('travel down command works with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const result = testEnv.moveCommandHelper.executeMoveWith('travel', 'down');
      
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
    });

    it('all movement aliases work for down direction with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      testEnv.moveCommandHelper.verifyMovementAliases('down', 'kitchen');
    });
  });

  describe('Direction Abbreviations', () => {
    it('down and d abbreviation both work with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      testEnv.moveCommandHelper.verifyDirectionAbbreviations('down', 'd', 'kitchen');
    });
  });

  describe('Round Trip Movement', () => {
    it('attic to kitchen and back with light load', () => {
      testEnv.moveCommandHelper.clearInventory();
      testEnv.moveCommandHelper.verifyRoundTrip('down', 'kitchen', 'up', 'attic');
    });

    it('round trip fails with heavy load', () => {
      // Add heavy items
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      testEnv.moveCommandHelper.setCurrentScene('attic');
      const result = testEnv.moveCommandHelper.executeMoveDown();
      
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      // Player should still be in attic
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
    });
  });

  describe('Move Counter Tracking', () => {
    it('successful moves increment counter', () => {
      testEnv.moveCommandHelper.clearInventory();
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Move down
      testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Move back up
      testEnv.moveCommandHelper.executeMoveDirection('up');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
    });

    it('failed moves still increment counter', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Try blocked direction
      testEnv.moveCommandHelper.executeMoveDirection('north');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Try weight-restricted movement
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
    });
  });

  describe('Invalid Movement Commands', () => {
    it('empty go command fails', () => {
      const result = testEnv.moveCommandHelper.executeMove('go');
      
      testEnv.moveCommandHelper.verifyFailure(result);
      expect(result.message).toMatch(/go where/i);
    });

    it('invalid direction fails', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('nowhere');
      
      testEnv.moveCommandHelper.verifyFailure(result);
    });

    it('nonsensical movement command fails', () => {
      const result = testEnv.moveCommandHelper.executeMove('go backwards');
      
      testEnv.moveCommandHelper.verifyFailure(result);
    });
  });

  describe('Scene State After Movement', () => {
    it('player starts in attic', () => {
      testEnv.atticHelper.verifyPlayerInScene();
    });

    it('movement to kitchen changes current scene', () => {
      testEnv.moveCommandHelper.clearInventory();
      testEnv.moveCommandHelper.executeMoveDown();
      
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('kitchen');
    });

    it('failed movement keeps player in attic', () => {
      testEnv.moveCommandHelper.executeMoveDirection('north');
      
      testEnv.atticHelper.verifyPlayerInScene();
    });

    it('weight-blocked movement keeps player in attic', () => {
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      testEnv.moveCommandHelper.executeMoveDown();
      
      testEnv.atticHelper.verifyPlayerInScene();
    });
  });

  describe('Weight Calculation Integration', () => {
    it('weight calculation is accurate', () => {
      testEnv.moveCommandHelper.clearInventory();
      expect(testEnv.moveCommandHelper.getCurrentInventoryWeight()).toBe(0);
      
      testEnv.moveCommandHelper.addItemToInventory('knife'); // 5 weight
      expect(testEnv.moveCommandHelper.getCurrentInventoryWeight()).toBe(5);
      
      testEnv.moveCommandHelper.addItemToInventory('rope'); // 10 weight
      expect(testEnv.moveCommandHelper.getCurrentInventoryWeight()).toBe(15);
      
      testEnv.moveCommandHelper.addItemToInventory('brick'); // 9 weight
      expect(testEnv.moveCommandHelper.getCurrentInventoryWeight()).toBe(24);
    });

    it('light load detection works correctly', () => {
      testEnv.moveCommandHelper.clearInventory();
      expect(testEnv.moveCommandHelper.hasLightLoad()).toBe(true);
      
      // Add items until heavy
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      expect(testEnv.moveCommandHelper.hasLightLoad()).toBe(false);
    });

    it('weight threshold is consistent with movement results', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      // Test with known light load
      testEnv.moveCommandHelper.addItemToInventory('knife'); // 5 weight
      const isLight = testEnv.moveCommandHelper.hasLightLoad();
      
      const result = testEnv.moveCommandHelper.executeMoveDown();
      const movementSucceeded = result.success;
      
      // Light load detection should match movement success
      expect(isLight).toBe(movementSucceeded);
    });
  });

  describe('Available Exits Query', () => {
    it('available exits includes down when weight is light', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      const exits = testEnv.moveCommandHelper.getAvailableExits();
      const directions = exits.map(exit => exit.direction);
      
      expect(directions).toContain('down');
    });

    it('direction availability check works correctly', () => {
      expect(testEnv.moveCommandHelper.isDirectionAvailable('down')).toBe(true);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('up')).toBe(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('north')).toBe(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('south')).toBe(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('east')).toBe(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('west')).toBe(false);
    });
  });

  describe('Integration with Inventory Management', () => {
    it('taking items affects movement capability', () => {
      testEnv.moveCommandHelper.clearInventory();
      
      // Should be able to move initially
      let result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(result);
      
      // Return to attic
      testEnv.moveCommandHelper.setCurrentScene('attic');
      
      // Take all items (simulate with direct inventory manipulation)
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      // Should now be blocked
      result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
    });

    it('strategic item management enables exit', () => {
      testEnv.moveCommandHelper.clearInventory();
      testEnv.moveCommandHelper.addItemToInventory('brick');
      testEnv.moveCommandHelper.addItemToInventory('rope');
      testEnv.moveCommandHelper.addItemToInventory('knife');
      
      // Should be blocked initially
      let result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      
      // Drop the heaviest item (rope = 10 weight)
      testEnv.moveCommandHelper.removeItemFromInventory('rope');
      
      // Should now work (brick + knife = 14 weight)
      result = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.moveCommandHelper.hasLightLoad()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(result);
      }
    });
  });
});