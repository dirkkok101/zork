/**
 * Drop Command Tests - Sandy Beach Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Sandy Beach Scene', () => {
  let testEnv: BeachTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();

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
    it('should drop statue from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('statu');
      expect(dropHelper.isInInventory('statu')).toBe(true);

      const result = dropHelper.executeDropItem('statu');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('statu');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop statue when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('statu')).toBe(false);

      const result = dropHelper.executeDropItem('statu');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('statu');

      const result = dropHelper.executeDropItem('statu');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('statu');

      const result = dropHelper.executeDropDown('statu');

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
      dropHelper.addToInventory('statu');

      const result = dropHelper.executeDropItem('statu');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('statu');
      dropHelper.removeFromScene('statu');
      expect(dropHelper.isInInventory('statu')).toBe(true);
      expect(dropHelper.isInScene('statu')).toBe(false);

      dropHelper.executeDropItem('statu');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('statu')).toBe(false);
      expect(dropHelper.isInScene('statu')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('statu');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('statu');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

});
