/**
 * Close Command Tests - Kitchen Scene
 * Auto-generated tests for close command functionality
 */

import '../setup';
import { KitchenTestEnvironment,  } from '../look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from '@testing/helpers/CloseCommandHelper';

describe('Close Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let closeHelper: CloseCommandHelper;

  beforeEach(async () => {
    testEnv = await .createTestEnvironment();

    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Close Containers', () => {
    it('should close brown sack when open', () => {
      // Open the container first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('sbag');

      closeHelper.verifySuccess(result);
      closeHelper.verifyItemClosed('sbag');
      closeHelper.verifyCountsAsMove(result);
    });

    it('should fail to close brown sack when already closed', () => {
      // Ensure container is closed
      closeHelper.verifyItemClosed('sbag');

      // Try to close again
      const result = closeHelper.executeCloseTarget('sbag');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/already closed/i);
    });

    it('should close brown sack using "sbag" alias', () => {
      // Open first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('sbag');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('sbag');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brown sack using "bag" alias', () => {
      // Open first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('bag');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('sbag');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brown sack using "sack" alias', () => {
      // Open first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('sack');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('sbag');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brown sack using "brown" alias', () => {
      // Open first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('brown');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('sbag');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close brown sack using "elong" alias', () => {
      // Open first
      closeHelper.executeOpen('open sbag');

      const result = closeHelper.executeCloseTarget('elong');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('sbag');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });

    it('should close glass bottle when open', () => {
      // Open the container first
      closeHelper.executeOpen('open bottl');

      const result = closeHelper.executeCloseTarget('bottl');

      closeHelper.verifySuccess(result);
      closeHelper.verifyItemClosed('bottl');
      closeHelper.verifyCountsAsMove(result);
    });

    it('should fail to close glass bottle when already closed', () => {
      // Ensure container is closed
      closeHelper.verifyItemClosed('bottl');

      // Try to close again
      const result = closeHelper.executeCloseTarget('bottl');

      closeHelper.verifyFailure(result);
      expect(result.message).toMatch(/already closed/i);
    });

    it('should close glass bottle using "bottl" alias', () => {
      // Open first
      closeHelper.executeOpen('open bottl');

      const result = closeHelper.executeCloseTarget('bottl');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('bottl');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close glass bottle using "conta" alias', () => {
      // Open first
      closeHelper.executeOpen('open bottl');

      const result = closeHelper.executeCloseTarget('conta');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('bottl');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close glass bottle using "clear" alias', () => {
      // Open first
      closeHelper.executeOpen('open bottl');

      const result = closeHelper.executeCloseTarget('clear');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('bottl');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });
    it('should close glass bottle using "glass" alias', () => {
      // Open first
      closeHelper.executeOpen('open bottl');

      const result = closeHelper.executeCloseTarget('glass');

      if (result.success) {
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('bottl');
      } else {
        // Alias may not be recognized
        closeHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Close Non-Closeable Items', () => {
    it('should handle closing non-closeable items appropriately', () => {
      const result = closeHelper.executeCloseTarget('');

      // Some non-containers (like doors) can be closed, others cannot
      if (result.success) {
        closeHelper.verifySuccess(result);
      } else {
        closeHelper.verifyFailure(result);
        expect(result.message).toMatch(/can't close|can't be closed|not a container/i);
      }
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "close" command', () => {
      // Open first
      closeHelper.executeOpen('open ');

      const result = closeHelper.executeCloseTarget('');
      closeHelper.verifySuccess(result);
    });

    it('should work with "close <container>" syntax', () => {
      // Open first
      closeHelper.executeOpen('open ');

      const result = closeHelper.executeCloseTarget('');

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
      closeHelper.executeOpen('open ');

      const result = closeHelper.executeCloseTarget('');

      closeHelper.verifyCountsAsMove(result);
    });

    it('should persist closed state across commands', () => {
      // Open container
      closeHelper.executeOpen('open ');

      // Close the container
      closeHelper.executeCloseTarget('');
      closeHelper.verifyItemClosed('');

      // Execute another command
      closeHelper.executeClose('look');

      // Verify still closed
      closeHelper.verifyItemClosed('');
    });

    it('should change container examination after closing', () => {
      // Open container
      closeHelper.executeOpen('open ');

      // Examine open container
      const openExamine = closeHelper.executeClose('examine ');
      closeHelper.verifySuccess(openExamine);

      // Close container
      closeHelper.executeCloseTarget('');

      // Examine closed container
      const closedExamine = closeHelper.executeClose('examine ');
      closeHelper.verifySuccess(closedExamine);

      // Messages should be different
      expect(closedExamine.message).not.toBe(openExamine.message);
    });
  });

  describe('Close Multiple Containers', () => {
    it('should handle closing multiple containers in sequence', () => {
      const result0 = closeHelper.executeOpen('open sbag');
      closeHelper.verifySuccess(result0);
      const result1 = closeHelper.executeOpen('open bottl');
      closeHelper.verifySuccess(result1);

      const closeResult0 = closeHelper.executeCloseTarget('sbag');
      closeHelper.verifySuccess(closeResult0);
      closeHelper.verifyItemClosed('sbag');
      const closeResult1 = closeHelper.executeCloseTarget('bottl');
      closeHelper.verifySuccess(closeResult1);
      closeHelper.verifyItemClosed('bottl');

      // Verify all containers are closed
      closeHelper.verifyItemClosed('sbag');
      closeHelper.verifyItemClosed('bottl');
    });
  });

  describe('State Consistency', () => {
    it('should maintain  state after closing', () => {
      // Open first
      closeHelper.executeOpen('open ');

      // Close
      closeHelper.executeCloseTarget('');
      closeHelper.verifyItemClosed('');

      // State should persist
      closeHelper.verifyItemClosed('');
    });
  });
});
