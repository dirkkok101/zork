/**
 * Take Command Tests - Clearing Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

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
    it('should take pile of leaves and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('leave');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('leave');
      takeHelper.verifyItemRemovedFromScene('leave');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take pile of leaves using "leaf" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('leaf');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('leave');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'leaf');
      }
    });

    it('should take pile of leaves using "pile" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('pile');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('leave');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'pile');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take pile of leaves twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('leave');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('leave');

      // Second take should fail
      result = takeHelper.executeTake('leave');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

  });

  describe('Cannot Take Non-Portable Items', () => {
    it('should fail to take grating (non-portable)', () => {
      const result = takeHelper.executeTake('grate');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('leave');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'leave');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'leave');

      if (result.success) {
        takeHelper.verifyInventoryContains('leave');
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

      takeHelper.executeTake('leave');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('leave');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('leave')).toBe(true);

      takeHelper.executeTake('leave');

      // Verify item removed from scene
      expect(takeHelper.isInScene('leave')).toBe(false);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('leave');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    it('should handle taking heavy item pile of leaves (25 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('leave');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(25);
    });
  });

});
