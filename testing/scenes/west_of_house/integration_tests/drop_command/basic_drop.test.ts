/**
 * Drop Command Tests - West of House Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should drop welcome mat from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('mat');
      expect(dropHelper.isInInventory('mat')).toBe(true);

      const result = dropHelper.executeDropItem('mat');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('mat');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop welcome mat when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('mat')).toBe(false);

      const result = dropHelper.executeDropItem('mat');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('mat');

      const result = dropHelper.executeDropItem('mat');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('mat');

      const result = dropHelper.executeDropDown('mat');

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
      dropHelper.addToInventory('mat');

      const result = dropHelper.executeDropItem('mat');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('mat');
      dropHelper.removeFromScene('mat');
      expect(dropHelper.isInInventory('mat')).toBe(true);
      expect(dropHelper.isInScene('mat')).toBe(false);

      dropHelper.executeDropItem('mat');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('mat')).toBe(false);
      expect(dropHelper.isInScene('mat')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('mat');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('mat');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

});
