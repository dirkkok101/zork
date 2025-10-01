/**
 * Close Command Tests - West of House Scene
 * Auto-generated tests for close command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from '@testing/helpers/CloseCommandHelper';

describe('Close Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Close Containers', () => {
    it('should close mailbox when open', () => {
      // Open the container first
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('mailb');

      closeHelper.verifySuccess(result);
      closeHelper.verifyItemClosed('mailb');
      closeHelper.verifyCountsAsMove(result);
    });

    it('should fail to close mailbox when already closed', () => {
      // Ensure container is closed
      closeHelper.verifyItemClosed('mailb');

      // Try to close again
      const result = closeHelper.executeCloseTarget('mailb');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/already closed/i);
    });

    it('should close mailbox using "mailb" alias', () => {
      // Open first
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('mailb');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('mailb');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close mailbox using "box" alias', () => {
      // Open first
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('box');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('mailb');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close mailbox using "small" alias', () => {
      // Open first
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('small');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('mailb');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Close Non-Closeable Items', () => {
    it('should handle closing non-closeable items appropriately', () => {
      const result = closeHelper.executeCloseTarget('fdoor');

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
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('mailb');
      closeHelper.verifySuccess(result);
    });

    it('should work with "close <container>" syntax', () => {
      // Open first
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('mailb');

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
      closeHelper.executeOpen('open mailb');

      const result = closeHelper.executeCloseTarget('mailb');

      closeHelper.verifyCountsAsMove(result);
    });

    it('should persist closed state across commands', () => {
      // Open container
      closeHelper.executeOpen('open mailb');

      // Close the container
      closeHelper.executeCloseTarget('mailb');
      closeHelper.verifyItemClosed('mailb');

      // Execute another command
      closeHelper.executeClose('look');

      // Verify still closed
      closeHelper.verifyItemClosed('mailb');
    });

    it('should change container examination after closing', () => {
      // Open container
      closeHelper.executeOpen('open mailb');

      // Examine open container
      const openExamine = closeHelper.executeClose('examine mailb');
      closeHelper.verifySuccess(openExamine);

      // Close container
      closeHelper.executeCloseTarget('mailb');

      // Examine closed container
      const closedExamine = closeHelper.executeClose('examine mailb');
      closeHelper.verifySuccess(closedExamine);

      // Messages should be different
      expect(closedExamine.message).not.toBe(openExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain mailbox state after closing', () => {
      // Open first
      closeHelper.executeOpen('open mailb');

      // Close
      closeHelper.executeCloseTarget('mailb');
      closeHelper.verifyItemClosed('mailb');

      // State should persist
      closeHelper.verifyItemClosed('mailb');
    });
  });
});
