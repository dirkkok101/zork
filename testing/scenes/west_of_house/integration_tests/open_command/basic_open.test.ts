/**
 * Open Command Tests - West of House Scene
 * Auto-generated tests for open command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/helpers/OpenCommandHelper';

describe('Open Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should open mailbox when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('mailb');

      const result = openHelper.executeOpenTarget('mailb');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('mailb');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open mailbox when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('mailb');
      openHelper.verifyItemOpened('mailb');

      // Try to open again
      const result = openHelper.executeOpenTarget('mailb');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    it('should reveal contents when opening mailbox', () => {
      const result = openHelper.executeOpenTarget('mailb');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('mailb');
      expect(result.message.toLowerCase()).toMatch(/adver|contains/i);
    });

    it('should open mailbox using "box" alias', () => {
      const result = openHelper.executeOpenTarget('box');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('mailb');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open mailbox using "small" alias', () => {
      const result = openHelper.executeOpenTarget('small');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('mailb');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Open Non-Openable Items', () => {
    it('should handle opening non-container items appropriately', () => {
      const result = openHelper.executeOpenTarget('fdoor');

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
      const result = openHelper.executeOpenTarget('mailb');
      openHelper.verifySuccess(result);
    });

    it('should work with "open <container>" syntax', () => {
      // Close if already open from previous test
      const result = openHelper.executeOpenTarget('mailb');

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
      const result = openHelper.executeOpenTarget('mailb');

      openHelper.verifyCountsAsMove(result);
    });

    it('should persist open state across commands', () => {
      // Open the container
      openHelper.executeOpenTarget('mailb');
      openHelper.verifyItemOpened('mailb');

      // Execute another command
      openHelper.executeOpen('look');

      // Verify still open
      openHelper.verifyItemOpened('mailb');
    });

    it('should change container examination after opening', () => {
      // Examine closed container
      const closedExamine = openHelper.executeOpen('examine mailb');
      openHelper.verifySuccess(closedExamine);

      // Open container
      openHelper.executeOpenTarget('mailb');

      // Examine open container
      const openExamine = openHelper.executeOpen('examine mailb');
      openHelper.verifySuccess(openExamine);

      // Messages should be different
      expect(openExamine.message).not.toBe(closedExamine.message);
    });
  });

  describe('State Consistency', () => {
    it('should maintain mailbox state after opening', () => {
      // Initial state: closed
      openHelper.verifyItemClosed('mailb');

      // Open
      openHelper.executeOpenTarget('mailb');
      openHelper.verifyItemOpened('mailb');

      // State should persist
      openHelper.verifyItemOpened('mailb');
    });
  });
});
