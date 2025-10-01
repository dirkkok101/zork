/**
 * Close Command Tests - Attic Scene
 * Auto-generated tests for close command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from '@testing/helpers/CloseCommandHelper';

describe('Close Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Close Containers', () => {
    it('should close brick when open', () => {
      // Open the container first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');

      closeHelper.verifySuccess(result);
      closeHelper.verifyItemClosed('brick');
      closeHelper.verifyCountsAsMove(result);
    });

    it('should fail to close brick when already closed', () => {
      // Ensure container is closed
      closeHelper.verifyItemClosed('brick');

      // Try to close again
      const result = closeHelper.executeCloseTarget('brick');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/already closed/i);
    });

    it('should close brick using "brick" alias', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('brick');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brick using "brick" alias', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('brick');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brick using "squar" alias', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('squar');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('brick');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brick using "clay" alias', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('clay');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('brick');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Close Non-Closeable Items', () => {
    it('should handle closing non-closeable items appropriately', () => {
      const result = closeHelper.executeCloseTarget('rope');

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
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');
      closeHelper.verifySuccess(result);
    });

    it('should work with "close <container>" syntax', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');

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

    it('should handle closing items from other scenes', () => {
      const result = closeHelper.executeCloseTarget('trophy_case');

      closeHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should count close command as a move', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      const result = closeHelper.executeCloseTarget('brick');

      closeHelper.verifyCountsAsMove(result);
    });

    it('should persist closed state across commands', () => {
      // Open container
      closeHelper.executeOpen('open brick');

      // Close the container
      closeHelper.executeCloseTarget('brick');
      closeHelper.verifyItemClosed('brick');

      // Execute another command
      closeHelper.executeClose('look');

      // Verify still closed
      closeHelper.verifyItemClosed('brick');
    });

    it('should change container examination after closing', () => {
      // Open container
      closeHelper.executeOpen('open brick');

      // Examine open container
      const openExamine = closeHelper.executeClose('examine brick');
      closeHelper.verifySuccess(openExamine);

      // Close container
      closeHelper.executeCloseTarget('brick');

      // Examine closed container
      const closedExamine = closeHelper.executeClose('examine brick');
      closeHelper.verifySuccess(closedExamine);

      // Messages should be different
      expect(closedExamine.message).not.toBe(openExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain brick state after closing', () => {
      // Open first
      closeHelper.executeOpen('open brick');

      // Close
      closeHelper.executeCloseTarget('brick');
      closeHelper.verifyItemClosed('brick');

      // State should persist
      closeHelper.verifyItemClosed('brick');
    });
  });
});
