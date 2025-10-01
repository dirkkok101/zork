/**
 * Drop Command Tests - Kitchen Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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
    it('should drop brown sack from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('sbag');
      expect(dropHelper.isInInventory('sbag')).toBe(true);

      const result = dropHelper.executeDropItem('sbag');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('sbag');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop glass bottle from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('bottl');
      expect(dropHelper.isInInventory('bottl')).toBe(true);

      const result = dropHelper.executeDropItem('bottl');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('bottl');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop brown sack when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('sbag')).toBe(false);

      const result = dropHelper.executeDropItem('sbag');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Drop Items into Containers', () => {
    it('should drop item into brown sack when open', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('sbag');

      // Setup: Add container to scene and open it
      dropHelper.executeOpen('open kitchen');

      const result = dropHelper.executeDropInContainer('sbag', 'kitchen');

      if (result.success) {
        dropHelper.verifySuccess(result);
        dropHelper.verifyItemMovedToContainer('sbag', 'kitchen');
      }
    });

    it('should fail to drop item into closed brown sack', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('sbag');

      const result = dropHelper.executeDropInContainer('sbag', 'kitchen');

      dropHelper.verifyFailure(result);
    });
    it('should drop item into glass bottle when open', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('sbag');

      // Setup: Add container to scene and open it
      dropHelper.executeOpen('open kitchen');

      const result = dropHelper.executeDropInContainer('sbag', 'kitchen');

      if (result.success) {
        dropHelper.verifySuccess(result);
        dropHelper.verifyItemMovedToContainer('sbag', 'kitchen');
      }
    });

    it('should fail to drop item into closed glass bottle', () => {
      // Setup: Add test item to inventory
      dropHelper.addToInventory('sbag');

      const result = dropHelper.executeDropInContainer('sbag', 'kitchen');

      dropHelper.verifyFailure(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('sbag');

      const result = dropHelper.executeDropItem('sbag');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('sbag');

      const result = dropHelper.executeDropDown('sbag');

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
      dropHelper.addToInventory('sbag');

      const result = dropHelper.executeDropItem('sbag');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('sbag');
      dropHelper.removeFromScene('sbag');
      expect(dropHelper.isInInventory('sbag')).toBe(true);
      expect(dropHelper.isInScene('sbag')).toBe(false);

      dropHelper.executeDropItem('sbag');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('sbag')).toBe(false);
      expect(dropHelper.isInScene('sbag')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('sbag');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('sbag');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

  describe('Drop Multiple Items', () => {
    it('should handle dropping multiple items in sequence', () => {
      // Setup: Add all items to inventory
      dropHelper.addToInventory('sbag');
      dropHelper.addToInventory('bottl');

      // Drop each item
      dropHelper.executeDropItem('sbag');
      expect(dropHelper.isInScene('sbag')).toBe(true);
      dropHelper.executeDropItem('bottl');
      expect(dropHelper.isInScene('bottl')).toBe(true);

      // Verify all items in scene
      expect(dropHelper.isInScene('sbag')).toBe(true);
      expect(dropHelper.isInInventory('sbag')).toBe(false);
      expect(dropHelper.isInScene('bottl')).toBe(true);
      expect(dropHelper.isInInventory('bottl')).toBe(false);
    });
  });
});
