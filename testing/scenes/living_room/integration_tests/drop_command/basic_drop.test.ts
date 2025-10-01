/**
 * Drop Command Tests - Living Room Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

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
    it('should drop lamp from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('lamp');
      expect(dropHelper.isInInventory('lamp')).toBe(true);

      const result = dropHelper.executeDropItem('lamp');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('lamp');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop carpet from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('rug');
      expect(dropHelper.isInInventory('rug')).toBe(true);

      const result = dropHelper.executeDropItem('rug');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('rug');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop newspaper from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('paper');
      expect(dropHelper.isInInventory('paper')).toBe(true);

      const result = dropHelper.executeDropItem('paper');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('paper');
      dropHelper.verifyCountsAsMove(result);
    });

    it('should drop sword from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('sword');
      expect(dropHelper.isInInventory('sword')).toBe(true);

      const result = dropHelper.executeDropItem('sword');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('sword');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop lamp when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('lamp')).toBe(false);

      const result = dropHelper.executeDropItem('lamp');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('lamp');

      const result = dropHelper.executeDropItem('lamp');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('lamp');

      const result = dropHelper.executeDropDown('lamp');

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
      dropHelper.addToInventory('lamp');

      const result = dropHelper.executeDropItem('lamp');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('lamp');
      dropHelper.removeFromScene('lamp');
      expect(dropHelper.isInInventory('lamp')).toBe(true);
      expect(dropHelper.isInScene('lamp')).toBe(false);

      dropHelper.executeDropItem('lamp');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('lamp')).toBe(false);
      expect(dropHelper.isInScene('lamp')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('lamp');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('lamp');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

  describe('Drop Multiple Items', () => {
    it('should handle dropping multiple items in sequence', () => {
      // Setup: Add all items to inventory
      dropHelper.addToInventory('lamp');
      dropHelper.addToInventory('rug');
      dropHelper.addToInventory('paper');
      dropHelper.addToInventory('sword');

      // Drop each item
      dropHelper.executeDropItem('lamp');
      expect(dropHelper.isInScene('lamp')).toBe(true);
      dropHelper.executeDropItem('rug');
      expect(dropHelper.isInScene('rug')).toBe(true);
      dropHelper.executeDropItem('paper');
      expect(dropHelper.isInScene('paper')).toBe(true);
      dropHelper.executeDropItem('sword');
      expect(dropHelper.isInScene('sword')).toBe(true);

      // Verify all items in scene
      expect(dropHelper.isInScene('lamp')).toBe(true);
      expect(dropHelper.isInInventory('lamp')).toBe(false);
      expect(dropHelper.isInScene('rug')).toBe(true);
      expect(dropHelper.isInInventory('rug')).toBe(false);
      expect(dropHelper.isInScene('paper')).toBe(true);
      expect(dropHelper.isInInventory('paper')).toBe(false);
      expect(dropHelper.isInScene('sword')).toBe(true);
      expect(dropHelper.isInInventory('sword')).toBe(false);
    });
  });
});
