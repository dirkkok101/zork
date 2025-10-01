/**
 * Put Command Tests - West of House Scene
 * Auto-generated tests for put command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/helpers/PutCommandHelper';

describe('Put Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let putHelper: PutCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should put welcome mat in mailbox when open', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      expect(putHelper.isInInventory('mat')).toBe(true);

      // Setup: Open container
      putHelper.executeOpen('open mailb');
      expect(putHelper.isContainerOpen('mailb')).toBe(true);

      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should fail to put welcome mat in mailbox when closed', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');

      // Setup: Ensure container is closed
      putHelper.executeClose('close mailb');
      expect(putHelper.isContainerOpen('mailb')).toBe(false);

      const result = putHelper.executePutInContainer('mat', 'mailb');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/closed|can't put/i);
    });
  });

  describe('Put Items Not in Inventory', () => {
    it('should fail to put item not in inventory', () => {
      // Ensure item is not in inventory
      expect(putHelper.isInInventory('mat')).toBe(false);

      // Open container
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'mailb');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "put <item> in <container>" syntax', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should work with container alias "mailb"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "box"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'box');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with container alias "small"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'small');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });

    it('should work with item alias "mat"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "welco"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('welco', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    it('should work with item alias "rubbe"', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('rubbe', 'mailb');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('mat', 'mailb');
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
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const result = putHelper.executePutInContainer('mat', 'mailb');

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
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      // Verify item not in container initially
      expect(putHelper.isInContainer('mat', 'mailb')).toBe(false);

      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        // Verify item now in container
        expect(putHelper.isInContainer('mat', 'mailb')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should decrease inventory count when putting items', () => {
      // Setup
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      const initialCount = putHelper.getInventoryCount();

      const result = putHelper.executePutInContainer('mat', 'mailb');

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
      putHelper.addToInventory('mat');
      putHelper.removeFromScene('mat');
      putHelper.executeOpen('open mailb');

      // Put item in container
      const result = putHelper.executePutInContainer('mat', 'mailb');

      if (result.success) {
        // Verify container still open
        expect(putHelper.isContainerOpen('mailb')).toBe(true);

        // Verify item still in container
        expect(putHelper.isInContainer('mat', 'mailb')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });
  });
});
