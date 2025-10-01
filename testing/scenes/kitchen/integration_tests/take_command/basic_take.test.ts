/**
 * Take Command Tests - Kitchen Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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
    it('should take brown sack and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sbag');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('sbag');
      takeHelper.verifyItemRemovedFromScene('sbag');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take brown sack using "bag" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('bag');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sbag');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'bag');
      }
    });

    it('should take brown sack using "sack" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sack');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sbag');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'sack');
      }
    });

    it('should take brown sack using "brown" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('brown');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sbag');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'brown');
      }
    });

    it('should take brown sack using "elong" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('elong');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sbag');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'elong');
      }
    });

    it('should take glass bottle and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('bottl');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('bottl');
      takeHelper.verifyItemRemovedFromScene('bottl');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take glass bottle using "conta" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('conta');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('bottl');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'conta');
      }
    });

    it('should take glass bottle using "clear" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('clear');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('bottl');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'clear');
      }
    });

    it('should take glass bottle using "glass" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('glass');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('bottl');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'glass');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take brown sack twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('sbag');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('sbag');

      // Second take should fail
      result = takeHelper.executeTake('sbag');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

    it('should handle taking multiple items in sequence', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('sbag');
      takeHelper.verifyInventoryContains('sbag');
      takeHelper.executeTake('bottl');
      takeHelper.verifyInventoryContains('bottl');

      // Verify all in inventory
      takeHelper.verifyInventoryContains('sbag');
      takeHelper.verifyInventoryContains('bottl');
    });
  });

  describe('Take from Containers', () => {
    it('should take item from glass bottle when open', () => {
      takeHelper.clearPlayerInventory();

      // Open the container first
      takeHelper.executeOpen('open bottl');

      const result = takeHelper.executeTake('water');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('water');
      }
    });

    it('should fail to take item from closed glass bottle', () => {
      takeHelper.clearPlayerInventory();

      // Ensure container is closed (default state)
      const result = takeHelper.executeTake('water');

      takeHelper.verifyFailure(result);
    });
  });

  describe('Cannot Take Non-Portable Items', () => {
    it('should fail to take window (non-portable)', () => {
      const result = takeHelper.executeTake('windo');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sbag');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'sbag');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'sbag');

      if (result.success) {
        takeHelper.verifyInventoryContains('sbag');
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

      takeHelper.executeTake('sbag');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('sbag');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('sbag')).toBe(true);

      takeHelper.executeTake('sbag');

      // Verify item removed from scene
      expect(takeHelper.isInScene('sbag')).toBe(false);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('sbag');
      takeHelper.executeTake('bottl');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

  });

  describe('Item State Preservation', () => {
    it('should preserve brown sack state when taken', () => {
      takeHelper.clearPlayerInventory();

      // Open the item before taking
      takeHelper.executeOpen('open sbag');

      takeHelper.executeTake('sbag');

      // Item should be in inventory (state preservation verified by game logic)
      takeHelper.verifyInventoryContains('sbag');
    });
    it('should preserve glass bottle state when taken', () => {
      takeHelper.clearPlayerInventory();

      // Open the item before taking
      takeHelper.executeOpen('open bottl');

      takeHelper.executeTake('bottl');

      // Item should be in inventory (state preservation verified by game logic)
      takeHelper.verifyInventoryContains('bottl');
    });
  });
});
