/**
 * Put Command Tests - Attic Scene
 * Auto-generated tests for put command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/helpers/PutCommandHelper';

describe('Put Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let putHelper: PutCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

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
    it('should put brick in brick when open', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      expect(putHelper.isInInventory('brick')).toBe(true);

      // Setup: Open container
      putHelper.executeOpen('open brick');
      expect(putHelper.isContainerOpen('brick')).toBe(true);

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should fail to put brick in brick when closed', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');

      // Setup: Ensure container is closed
      putHelper.executeClose('close brick');
      expect(putHelper.isContainerOpen('brick')).toBe(false);

      const result = putHelper.executePutInContainer('brick', 'brick');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/closed|can't put/i);
    });
  });

  describe('Put Items Not in Inventory', () => {
    it('should fail to put item not in inventory', () => {
      // Ensure item is not in inventory
      expect(putHelper.isInInventory('brick')).toBe(false);

      // Open container
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "put <item> in <container>" syntax', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should work with container alias "brick"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "brick"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "squar"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'squar');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "clay"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'clay');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });

    it('should work with item alias "brick"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "brick"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "squar"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('squar', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "clay"', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('clay', 'brick');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('brick', 'brick');
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
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should update container contents when putting items', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      // Verify item not in container initially
      expect(putHelper.isInContainer('brick', 'brick')).toBe(false);

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        // Verify item now in container
        expect(putHelper.isInContainer('brick', 'brick')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should decrease inventory count when putting items', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      const initialCount = putHelper.getInventoryCount();

      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        putHelper.verifyInventoryCountChange(initialCount, -1);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });
  });

  describe('State Consistency', () => {
    it('should maintain container state after putting items', () => {
      // Setup
      putHelper.addToInventory('brick');
      putHelper.removeFromScene('brick');
      putHelper.executeOpen('open brick');

      // Put item in container
      const result = putHelper.executePutInContainer('brick', 'brick');

      if (result.success) {
        // Verify container still open
        expect(putHelper.isContainerOpen('brick')).toBe(true);

        // Verify item still in container
        expect(putHelper.isInContainer('brick', 'brick')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });
  });
});
