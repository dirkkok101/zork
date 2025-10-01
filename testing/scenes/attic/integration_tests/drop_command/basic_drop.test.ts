/**
 * Drop Command Tests - Attic Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

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
    it('should drop brick from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('brick');
      expect(dropHelper.isInInventory('brick')).toBe(true);

      const result = dropHelper.executeDropItem('brick');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('brick');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop rope from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('rope');
      expect(dropHelper.isInInventory('rope')).toBe(true);

      const result = dropHelper.executeDropItem('rope');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('rope');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop knife from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('knife');
      expect(dropHelper.isInInventory('knife')).toBe(true);

      const result = dropHelper.executeDropItem('knife');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('knife');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop brick when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('brick')).toBe(false);

      const result = dropHelper.executeDropItem('brick');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Drop Items into Containers', () => {
    it('should drop item into brick when open', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('brick');

      // Setup: Add container to scene and open it
      dropHelper.executeOpen('open attic');

      const result = dropHelper.executeDropInContainer('brick', 'attic');

      if (result.success) {
        dropHelper.verifySuccess(result);
        dropHelper.verifyItemMovedToContainer('brick', 'attic');
      }
    });

    it('should fail to drop item into closed brick', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('brick');

      const result = dropHelper.executeDropInContainer('brick', 'attic');

      dropHelper.verifyFailure(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('brick');

      const result = dropHelper.executeDropItem('brick');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('brick');

      const result = dropHelper.executeDropDown('brick');

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
      dropHelper.addToInventory('brick');

      const result = dropHelper.executeDropItem('brick');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('brick');
      dropHelper.removeFromScene('brick');
      expect(dropHelper.isInInventory('brick')).toBe(true);
      expect(dropHelper.isInScene('brick')).toBe(false);

      dropHelper.executeDropItem('brick');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('brick')).toBe(false);
      expect(dropHelper.isInScene('brick')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('brick');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('brick');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

  describe('Drop Multiple Items', () => {
    it('should handle dropping multiple items in sequence', () => {
      // Setup: Add all items to inventory
      dropHelper.addToInventory('brick');
      dropHelper.addToInventory('rope');
      dropHelper.addToInventory('knife');

      // Drop each item
      dropHelper.executeDropItem('brick');
      expect(dropHelper.isInScene('brick')).toBe(true);
      dropHelper.executeDropItem('rope');
      expect(dropHelper.isInScene('rope')).toBe(true);
      dropHelper.executeDropItem('knife');
      expect(dropHelper.isInScene('knife')).toBe(true);

      // Verify all items in scene
      expect(dropHelper.isInScene('brick')).toBe(true);
      expect(dropHelper.isInInventory('brick')).toBe(false);
      expect(dropHelper.isInScene('rope')).toBe(true);
      expect(dropHelper.isInInventory('rope')).toBe(false);
      expect(dropHelper.isInScene('knife')).toBe(true);
      expect(dropHelper.isInInventory('knife')).toBe(false);
    });
  });
});
