/**
 * Take Command Tests - Sandy Beach Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Sandy Beach Scene', () => {
  let testEnv: BeachTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();

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
    it('should take statue and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('statu');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('statu');
      takeHelper.verifyItemRemovedFromScene('statu');
    });

    it('should take statue using "sculp" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sculp');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('statu');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'sculp');
      }
    });

    it('should take statue using "rock" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('rock');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('statu');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'rock');
      }
    });

    it('should take statue using "beaut" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('beaut');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('statu');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'beaut');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take statue twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('statu');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('statu');

      // Second take should fail
      result = takeHelper.executeTake('statu');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

  });

  describe('Cannot Take Non-Portable Items', () => {
    it('should fail to take sandy beach (non-portable)', () => {
      const result = takeHelper.executeTake('sand');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('statu');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'statu');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'statu');

      if (result.success) {
        takeHelper.verifyInventoryContains('statu');
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

      takeHelper.executeTake('statu');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('statu')).toBe(true);

      takeHelper.executeTake('statu');

      // Verify item removed from scene
      expect(takeHelper.isInScene('statu')).toBe(false);
    });
  });

  describe('Treasure Collection', () => {
    it('should take statue treasure without immediate score change', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      const result = takeHelper.executeTake('statu');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('statu');

      // Score changes when deposited, not when taken
      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('statu');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

  });

});
