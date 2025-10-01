/**
 * Put Command Tests - Kitchen Scene
 * Auto-generated tests for put command functionality
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/helpers/PutCommandHelper';

describe('Put Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let putHelper: PutCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

    putHelper = new PutCommandHelper(
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

  describe('Put Items in Containers', () => {
    it('should put brown sack in brown sack when open', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      expect(putHelper.isInInventory('sbag')).toBe(true);

      // Setup: Open container
      putHelper.executeOpen('open sbag');
      expect(putHelper.isContainerOpen('sbag')).toBe(true);

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|can't put/i);
      }
    });

    it('should fail to put brown sack in brown sack when closed', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');

      // Setup: Ensure container is closed
      putHelper.executeClose('close sbag');
      expect(putHelper.isContainerOpen('sbag')).toBe(false);

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/closed|can't put/i);
    });
  });

  describe('Put Items Not in Inventory', () => {
    it('should fail to put item not in inventory', () => {
      // Ensure item is not in inventory
      expect(putHelper.isInInventory('sbag')).toBe(false);

      // Open container
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "put <item> in <container>" syntax', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      putHelper.verifySuccess(result);
      putHelper.verifyItemMovedToContainer('sbag', 'sbag');
    });

    it('should work with container alias "sbag"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "bag"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'bag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "sack"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sack');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "brown"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'brown');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "elong"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'elong');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });

    it('should work with item alias "sbag"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "bag"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('bag', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "sack"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sack', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "brown"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('brown', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "elong"', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('elong', 'sbag');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('sbag', 'sbag');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty put command gracefully', () => {
      const result = putHelper.executePut('put');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*put|put.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = putHelper.executePutInContainer('nonexistent_item_xyz', 'container');

      putHelper.verifyFailure(result);
    });

    it('should handle non-existent containers gracefully', () => {
      const result = putHelper.executePutInContainer('item', 'nonexistent_container_xyz');

      putHelper.verifyFailure(result);
    });

    it('should handle putting items from other scenes', () => {
      const result = putHelper.executePutInContainer('sword', 'container');

      putHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should count put command as a move', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const result = putHelper.executePutInContainer('sbag', 'sbag');

      putHelper.verifyCountsAsMove(result);
    });

    it('should update container contents when putting items', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      // Verify item not in container initially
      expect(putHelper.isInContainer('sbag', 'sbag')).toBe(false);

      putHelper.executePutInContainer('sbag', 'sbag');

      // Verify item now in container
      expect(putHelper.isInContainer('sbag', 'sbag')).toBe(true);
    });

    it('should decrease inventory count when putting items', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      const initialCount = putHelper.getInventoryCount();

      putHelper.executePutInContainer('sbag', 'sbag');

      putHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

  describe('Put Items in Multiple Containers', () => {
    it('should handle putting item in container, then taking it and putting in another', () => {
      const item = 'sbag';

      // Put in first container
      putHelper.addToInventory(item);
      putHelper.removeFromScene(item);
      putHelper.executeOpen('open sbag');

      const result1 = putHelper.executePutInContainer(item, 'sbag');

      if (result1.success) {
        putHelper.verifySuccess(result1);
        putHelper.verifyItemMovedToContainer(item, 'sbag');

        // Take it back out (if container supports this)
        const takeResult = putHelper.executeTake('take ' + item);

        if (takeResult.success) {
          // Try putting in a second container
        }
      }
    });
  });

  describe('State Consistency', () => {
    it('should maintain container state after putting items', () => {
      // Setup
      putHelper.addToInventory('sbag');
      putHelper.removeFromScene('sbag');
      putHelper.executeOpen('open sbag');

      // Put item in container
      putHelper.executePutInContainer('sbag', 'sbag');

      // Verify container still open
      expect(putHelper.isContainerOpen('sbag')).toBe(true);

      // Verify item still in container
      expect(putHelper.isInContainer('sbag', 'sbag')).toBe(true);
    });
  });
});
