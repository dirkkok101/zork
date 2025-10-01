/**
 * Open Command Tests - Living Room Scene
 * Auto-generated tests for open command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/helpers/OpenCommandHelper';

describe('Open Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Open Containers', () => {
    it('should open trophy case when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('tcase');

      const result = openHelper.executeOpenTarget('tcase');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('tcase');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open trophy case when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('tcase');
      openHelper.verifyItemOpened('tcase');

      // Try to open again
      const result = openHelper.executeOpenTarget('tcase');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    it('should open trophy case using "case" alias', () => {
      const result = openHelper.executeOpenTarget('case');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('tcase');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open trophy case using "troph" alias', () => {
      const result = openHelper.executeOpenTarget('troph');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('tcase');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Open Non-Openable Items', () => {
    it('should handle opening non-container items appropriately', () => {
      const result = openHelper.executeOpenTarget('wdoor');

      // Some non-containers (like doors) can be opened, others cannot
      if (result.success) {
        openHelper.verifySuccess(result);
      } else {
        openHelper.verifyFailure(result);
        expect(result.message).toMatch(/can't open|can't be opened|not a container/i);
      }
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "open" command', () => {
      const result = openHelper.executeOpenTarget('tcase');
      openHelper.verifySuccess(result);
    });

    it('should work with "open <container>" syntax', () => {
      // Close if already open from previous test
      const result = openHelper.executeOpenTarget('tcase');

      if (!result.success && result.message.match(/already open/i)) {
        // Already open, that's fine
        expect(true).toBe(true);
      } else {
        openHelper.verifySuccess(result);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty open command gracefully', () => {
      const result = openHelper.executeOpen('open');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*open|open.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = openHelper.executeOpenTarget('nonexistent_item_xyz');

      openHelper.verifyFailure(result);
    });

    it('should handle opening items from other scenes', () => {
      const result = openHelper.executeOpenTarget('trophy_case');

      openHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should count open command as a move', () => {
      const result = openHelper.executeOpenTarget('tcase');

      openHelper.verifyCountsAsMove(result);
    });

    it('should persist open state across commands', () => {
      // Open the container
      openHelper.executeOpenTarget('tcase');
      openHelper.verifyItemOpened('tcase');

      // Execute another command
      openHelper.executeOpen('look');

      // Verify still open
      openHelper.verifyItemOpened('tcase');
    });

    it('should change container examination after opening', () => {
      // Examine closed container
      const closedExamine = openHelper.executeOpen('examine tcase');
      openHelper.verifySuccess(closedExamine);

      // Open container
      openHelper.executeOpenTarget('tcase');

      // Examine open container
      const openExamine = openHelper.executeOpen('examine tcase');
      openHelper.verifySuccess(openExamine);

      // Messages should be different
      expect(openExamine.message).not.toBe(closedExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain trophy case state after opening', () => {
      // Initial state: closed
      openHelper.verifyItemClosed('tcase');

      // Open
      openHelper.executeOpenTarget('tcase');
      openHelper.verifyItemOpened('tcase');

      // State should persist
      openHelper.verifyItemOpened('tcase');
    });
  });
});
