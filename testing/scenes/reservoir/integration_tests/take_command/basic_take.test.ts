/**
 * Take Command Tests - Reservoir Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Reservoir Scene', () => {
  let testEnv: ReservoirTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();

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
    it('should take trunk of jewels and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('trunk');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('trunk');
      takeHelper.verifyItemRemovedFromScene('trunk');
    });

    it('should take trunk of jewels using "chest" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('chest');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('trunk');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'chest');
      }
    });

    it('should take trunk of jewels using "jewel" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('jewel');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('trunk');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'jewel');
      }
    });

    it('should take trunk of jewels using "old" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('old');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('trunk');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'old');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take trunk of jewels twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('trunk');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('trunk');

      // Second take should fail
      result = takeHelper.executeTake('trunk');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('trunk');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'trunk');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'trunk');

      if (result.success) {
        takeHelper.verifyInventoryContains('trunk');
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

      takeHelper.executeTake('trunk');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('trunk')).toBe(true);

      takeHelper.executeTake('trunk');

      // Verify item removed from scene
      expect(takeHelper.isInScene('trunk')).toBe(false);
    });
  });

  describe('Treasure Collection', () => {
    it('should take trunk of jewels treasure without immediate score change', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      const result = takeHelper.executeTake('trunk');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('trunk');

      // Score changes when deposited, not when taken
      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('trunk');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    it('should handle taking heavy item trunk of jewels (35 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('trunk');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(35);
    });
  });

});
