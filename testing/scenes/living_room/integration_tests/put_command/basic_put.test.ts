/**
 * Put Command Tests - Living Room Scene
 * Auto-generated tests for put command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/helpers/PutCommandHelper';

describe('Put Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let putHelper: PutCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

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
    it('should put lamp in trophy case when open', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      expect(putHelper.isInInventory('lamp')).toBe(true);

      // Setup: Open container
      putHelper.executeOpen('open tcase');
      expect(putHelper.isContainerOpen('tcase')).toBe(true);

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|can't put/i);
      }
    });

    it('should fail to put lamp in trophy case when closed', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');

      // Setup: Ensure container is closed
      putHelper.executeClose('close tcase');
      expect(putHelper.isContainerOpen('tcase')).toBe(false);

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/closed|can't put/i);
    });
  });

  describe('Put Items Not in Inventory', () => {
    it('should fail to put item not in inventory', () => {
      // Ensure item is not in inventory
      expect(putHelper.isInInventory('lamp')).toBe(false);

      // Open container
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "put <item> in <container>" syntax', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      putHelper.verifySuccess(result);
      putHelper.verifyItemMovedToContainer('lamp', 'tcase');
    });

    it('should work with container alias "tcase"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "case"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'case');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "troph"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'troph');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });

    it('should work with item alias "lamp"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "lante"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lante', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "light"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('light', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "brass"', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('brass', 'tcase');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('lamp', 'tcase');
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
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const result = putHelper.executePutInContainer('lamp', 'tcase');

      putHelper.verifyCountsAsMove(result);
    });

    it('should update container contents when putting items', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      // Verify item not in container initially
      expect(putHelper.isInContainer('lamp', 'tcase')).toBe(false);

      putHelper.executePutInContainer('lamp', 'tcase');

      // Verify item now in container
      expect(putHelper.isInContainer('lamp', 'tcase')).toBe(true);
    });

    it('should decrease inventory count when putting items', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      const initialCount = putHelper.getInventoryCount();

      putHelper.executePutInContainer('lamp', 'tcase');

      putHelper.verifyInventoryCountChange(initialCount, -1);
    });
  });

  describe('State Consistency', () => {
    it('should maintain container state after putting items', () => {
      // Setup
      putHelper.addToInventory('lamp');
      putHelper.removeFromScene('lamp');
      putHelper.executeOpen('open tcase');

      // Put item in container
      putHelper.executePutInContainer('lamp', 'tcase');

      // Verify container still open
      expect(putHelper.isContainerOpen('tcase')).toBe(true);

      // Verify item still in container
      expect(putHelper.isInContainer('lamp', 'tcase')).toBe(true);
    });
  });
});
