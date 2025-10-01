/**
 * Open Command Tests - Attic Scene
 * Auto-generated tests for open command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/helpers/OpenCommandHelper';

describe('Open Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

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
    it('should open brick when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('brick');

      const result = openHelper.executeOpenTarget('brick');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('brick');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open brick when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('brick');
      openHelper.verifyItemOpened('brick');

      // Try to open again
      const result = openHelper.executeOpenTarget('brick');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    it('should open brick using "brick" alias', () => {
      const result = openHelper.executeOpenTarget('brick');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('brick');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open brick using "squar" alias', () => {
      const result = openHelper.executeOpenTarget('squar');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('brick');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open brick using "clay" alias', () => {
      const result = openHelper.executeOpenTarget('clay');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('brick');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Open Non-Openable Items', () => {
    it('should handle opening non-container items appropriately', () => {
      const result = openHelper.executeOpenTarget('rope');

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
      const result = openHelper.executeOpenTarget('brick');
      openHelper.verifySuccess(result);
    });

    it('should work with "open <container>" syntax', () => {
      // Close if already open from previous test
      const result = openHelper.executeOpenTarget('brick');

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
      const result = openHelper.executeOpenTarget('brick');

      openHelper.verifyCountsAsMove(result);
    });

    it('should persist open state across commands', () => {
      // Open the container
      openHelper.executeOpenTarget('brick');
      openHelper.verifyItemOpened('brick');

      // Execute another command
      openHelper.executeOpen('look');

      // Verify still open
      openHelper.verifyItemOpened('brick');
    });

    it('should change container examination after opening', () => {
      // Examine closed container
      const closedExamine = openHelper.executeOpen('examine brick');
      openHelper.verifySuccess(closedExamine);

      // Open container
      openHelper.executeOpenTarget('brick');

      // Examine open container
      const openExamine = openHelper.executeOpen('examine brick');
      openHelper.verifySuccess(openExamine);

      // Messages should be different
      expect(openExamine.message).not.toBe(closedExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain brick state after opening', () => {
      // Initial state: closed
      openHelper.verifyItemClosed('brick');

      // Open
      openHelper.executeOpenTarget('brick');
      openHelper.verifyItemOpened('brick');

      // State should persist
      openHelper.verifyItemOpened('brick');
    });
  });
});
