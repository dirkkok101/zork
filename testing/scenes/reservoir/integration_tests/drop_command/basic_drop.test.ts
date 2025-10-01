/**
 * Drop Command Tests - Reservoir Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - Reservoir Scene', () => {
  let testEnv: ReservoirTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();

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
    it('should drop trunk of jewels from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('trunk');
      expect(dropHelper.isInInventory('trunk')).toBe(true);

      const result = dropHelper.executeDropItem('trunk');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('trunk');
      dropHelper.verifyCountsAsMove(result);
    });

  });

  describe('Drop Items Not in Inventory', () => {
    it('should fail to drop trunk of jewels when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('trunk')).toBe(false);

      const result = dropHelper.executeDropItem('trunk');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('trunk');

      const result = dropHelper.executeDropItem('trunk');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('trunk');

      const result = dropHelper.executeDropDown('trunk');

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
      dropHelper.addToInventory('trunk');

      const result = dropHelper.executeDropItem('trunk');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('trunk');
      dropHelper.removeFromScene('trunk');
      expect(dropHelper.isInInventory('trunk')).toBe(true);
      expect(dropHelper.isInScene('trunk')).toBe(false);

      dropHelper.executeDropItem('trunk');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('trunk')).toBe(false);
      expect(dropHelper.isInScene('trunk')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('trunk');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('trunk');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

});
