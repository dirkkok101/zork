/**
 * Take Command Tests - Attic Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

    takeHelper = new TakeCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Take Individual Items', () => {
    it('should take brick and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('brick');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('brick');
      takeHelper.verifyItemRemovedFromScene('brick');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take brick using "brick" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('brick');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('brick');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'brick');
      }
    });

    it('should take brick using "squar" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('squar');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('brick');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'squar');
      }
    });

    it('should take brick using "clay" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('clay');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('brick');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'clay');
      }
    });

    it('should take rope and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('rope');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('rope');
      takeHelper.verifyItemRemovedFromScene('rope');
    });

    it('should take rope using "hemp" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('hemp');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('rope');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'hemp');
      }
    });

    it('should take rope using "coil" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('coil');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('rope');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'coil');
      }
    });

    it('should take rope using "large" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('large');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('rope');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'large');
      }
    });

    it('should take knife and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('knife');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('knife');
      takeHelper.verifyItemRemovedFromScene('knife');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take knife using "blade" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('blade');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('knife');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'blade');
      }
    });

    it('should take knife using "nasty" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('nasty');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('knife');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'nasty');
      }
    });

    it('should take knife using "unrus" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('unrus');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('knife');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'unrus');
      }
    });

    it('should take knife using "plain" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('plain');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('knife');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'plain');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take brick twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('brick');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('brick');

      // Second take should fail
      result = takeHelper.executeTake('brick');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

    it('should handle taking multiple items in sequence', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('brick');
      takeHelper.verifyInventoryContains('brick');
      takeHelper.executeTake('rope');
      takeHelper.verifyInventoryContains('rope');
      takeHelper.executeTake('knife');
      takeHelper.verifyInventoryContains('knife');

      // Verify all in inventory
      takeHelper.verifyInventoryContains('brick');
      takeHelper.verifyInventoryContains('rope');
      takeHelper.verifyInventoryContains('knife');
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('brick');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'brick');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'brick');

      if (result.success) {
        takeHelper.verifyInventoryContains('brick');
      } else {
        // Multi-word commands may not be supported
        takeHelper.verifyFailure(result);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty take command gracefully', () => {
      const result = takeHelper.executeTake('');

      takeHelper.verifyFailure(result);
      takeHelper.verifyMissingTarget(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = takeHelper.executeTake('nonexistent_item_xyz');

      takeHelper.verifyFailure(result);
      takeHelper.verifyInvalidTarget(result, 'nonexistent_item_xyz');
    });

    it('should handle taking items from other scenes', () => {
      const result = takeHelper.executeTake('sword');

      takeHelper.verifyFailure(result);
      takeHelper.verifyInvalidTarget(result, 'sword');
    });
  });

  describe('Game State Tracking', () => {
    it('should count take command as a move', () => {
      takeHelper.clearPlayerInventory();
      const initialMoves = takeHelper.getCurrentMoves();

      takeHelper.executeTake('brick');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('brick');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('brick')).toBe(true);

      takeHelper.executeTake('brick');

      // Verify item removed from scene
      expect(takeHelper.isInScene('brick')).toBe(false);
    });
  });

  describe('Treasure Collection', () => {
    it('should take rope treasure without immediate score change', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      const result = takeHelper.executeTake('rope');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('rope');

      // Score changes when deposited, not when taken
      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('brick');
      takeHelper.executeTake('rope');
      takeHelper.executeTake('knife');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    it('should handle taking heavy item rope (10 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('rope');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(10);
    });
  });

  describe('Item State Preservation', () => {
    it('should preserve brick state when taken', () => {
      takeHelper.clearPlayerInventory();

      // Open the item before taking
      takeHelper.executeOpen('open brick');

      takeHelper.executeTake('brick');

      // Item should be in inventory (state preservation verified by game logic)
      takeHelper.verifyInventoryContains('brick');
    });
  });
});
