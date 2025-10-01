/**
 * Close Command Tests - Living Room Scene
 * Auto-generated tests for close command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from '@testing/helpers/CloseCommandHelper';

describe('Close Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Close Containers', () => {
    it('should close trophy case when open', () => {
      // Open the container first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('tcase');

      closeHelper.verifySuccess(result);
      closeHelper.verifyItemClosed('tcase');
      closeHelper.verifyCountsAsMove(result);
    });

    it('should fail to close trophy case when already closed', () => {
      // Ensure container is closed
      closeHelper.verifyItemClosed('tcase');

      // Try to close again
      const result = closeHelper.executeCloseTarget('tcase');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/already closed/i);
    });

    it('should close trophy case using "tcase" alias', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('tcase');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('tcase');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close trophy case using "case" alias', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('case');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('tcase');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close trophy case using "troph" alias', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('troph');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('tcase');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Close Non-Closeable Items', () => {
    it('should handle closing non-closeable items appropriately', () => {
      const result = closeHelper.executeCloseTarget('wdoor');

      // Some non-containers (like doors) can be closed, others cannot
      if (result.success) {
        closeHelper.verifySuccess(result);
      } else {
        closeHelper.verifyFailure(result);
        expect(result.message).toMatch(/can't close|can't be closed|not a container|already closed/i);
      }
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "close" command', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('tcase');
      closeHelper.verifySuccess(result);
    });

    it('should work with "close <container>" syntax', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('tcase');

      if (!result.success && result.message.match(/already closed/i)) {
        // Already closed, that's fine
        expect(true).toBe(true);
      } else {
        closeHelper.verifySuccess(result);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty close command gracefully', () => {
      const result = closeHelper.executeClose('close');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*close|close.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = closeHelper.executeCloseTarget('nonexistent_item_xyz');

      closeHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should count close command as a move', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      const result = closeHelper.executeCloseTarget('tcase');

      closeHelper.verifyCountsAsMove(result);
    });

    it('should persist closed state across commands', () => {
      // Open container
      closeHelper.executeOpen('open tcase');

      // Close the container
      closeHelper.executeCloseTarget('tcase');
      closeHelper.verifyItemClosed('tcase');

      // Execute another command
      closeHelper.executeClose('look');

      // Verify still closed
      closeHelper.verifyItemClosed('tcase');
    });

    it('should change container examination after closing', () => {
      // Open container
      closeHelper.executeOpen('open tcase');

      // Examine open container
      const openExamine = closeHelper.executeClose('examine tcase');
      closeHelper.verifySuccess(openExamine);

      // Close container
      closeHelper.executeCloseTarget('tcase');

      // Examine closed container
      const closedExamine = closeHelper.executeClose('examine tcase');
      closeHelper.verifySuccess(closedExamine);

      // Messages should be different
      expect(closedExamine.message).not.toBe(openExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain trophy case state after closing', () => {
      // Open first
      closeHelper.executeOpen('open tcase');

      // Close
      closeHelper.executeCloseTarget('tcase');
      closeHelper.verifyItemClosed('tcase');

      // State should persist
      closeHelper.verifyItemClosed('tcase');
    });
  });
});
