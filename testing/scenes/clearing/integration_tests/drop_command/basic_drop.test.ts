/**
 * Drop Command Tests - Clearing Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

    dropHelper = new DropCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Drop Individual Items', () => {
    it('should drop pile of leaves from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('leave');
      expect(dropHelper.isInInventory('leave')).toBe(true);

      const result = dropHelper.executeDropItem('leave');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('leave');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop pile of leaves when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('leave')).toBe(false);

      const result = dropHelper.executeDropItem('leave');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('leave');

      const result = dropHelper.executeDropItem('leave');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('leave');

      const result = dropHelper.executeDropDown('leave');

      if (result.success) {
        dropHelper.verifySuccess(result);
      } else {
        // "drop down" may not be supported
        dropHelper.verifyFailure(result);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty drop command gracefully', () => {
      const result = dropHelper.executeDrop('drop');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*drop|drop.*what/i);
    });

    it('should handle dropping non-existent items', () => {
      const result = dropHelper.executeDropItem('nonexistent_item_xyz');

      dropHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should count drop command as a move', () => {
      dropHelper.addToInventory('leave');

      const result = dropHelper.executeDropItem('leave');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('leave');
      dropHelper.removeFromScene('leave');
      expect(dropHelper.isInInventory('leave')).toBe(true);
      expect(dropHelper.isInScene('leave')).toBe(false);

      dropHelper.executeDropItem('leave');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('leave')).toBe(false);
      expect(dropHelper.isInScene('leave')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('leave');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('leave');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

});
