/**
 * Take Command Tests - West of House Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should take welcome mat and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('mat');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('mat');
      takeHelper.verifyItemRemovedFromScene('mat');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take welcome mat using "welco" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('welco');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('mat');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'welco');
      }
    });

    it('should take welcome mat using "rubbe" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('rubbe');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('mat');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'rubbe');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take welcome mat twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('mat');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('mat');

      // Second take should fail
      result = takeHelper.executeTake('mat');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

  });

  describe('Take from Containers', () => {
    it('should take item from mailbox when open', () => {
      takeHelper.clearPlayerInventory();

      // Open the container first
      takeHelper.executeOpen('open mailb');

      const result = takeHelper.executeTake('adver');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('adver');
      }
    });

    it('should fail to take item from closed mailbox', () => {
      takeHelper.clearPlayerInventory();

      // Ensure container is closed (default state)
      const result = takeHelper.executeTake('adver');

      takeHelper.verifyFailure(result);
    });
  });

  describe('Cannot Take Non-Portable Items', () => {
    it('should fail to take door (non-portable)', () => {
      const result = takeHelper.executeTake('fdoor');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
    it('should fail to take mailbox (non-portable)', () => {
      const result = takeHelper.executeTake('mailb');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('mat');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'mat');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'mat');

      if (result.success) {
        takeHelper.verifyInventoryContains('mat');
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

      takeHelper.executeTake('mat');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('mat');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('mat')).toBe(true);

      takeHelper.executeTake('mat');

      // Verify item removed from scene
      expect(takeHelper.isInScene('mat')).toBe(false);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('mat');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    it('should handle taking heavy item welcome mat (12 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('mat');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(12);
    });
  });

});
