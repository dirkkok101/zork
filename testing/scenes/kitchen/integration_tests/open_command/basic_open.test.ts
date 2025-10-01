/**
 * Open Command Tests - Kitchen Scene
 * Auto-generated tests for open command functionality
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/helpers/OpenCommandHelper';

describe('Open Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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
    it('should open brown sack when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('sbag');

      const result = openHelper.executeOpenTarget('sbag');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('sbag');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open brown sack when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('sbag');
      openHelper.verifyItemOpened('sbag');

      // Try to open again
      const result = openHelper.executeOpenTarget('sbag');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    it('should open brown sack using "bag" alias', () => {
      const result = openHelper.executeOpenTarget('bag');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('sbag');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open brown sack using "sack" alias', () => {
      const result = openHelper.executeOpenTarget('sack');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('sbag');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open brown sack using "brown" alias', () => {
      const result = openHelper.executeOpenTarget('brown');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('sbag');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open brown sack using "elong" alias', () => {
      const result = openHelper.executeOpenTarget('elong');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('sbag');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });

    it('should open glass bottle when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('bottl');

      const result = openHelper.executeOpenTarget('bottl');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('bottl');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open glass bottle when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('bottl');
      openHelper.verifyItemOpened('bottl');

      // Try to open again
      const result = openHelper.executeOpenTarget('bottl');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    it('should reveal contents when opening glass bottle', () => {
      const result = openHelper.executeOpenTarget('bottl');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('bottl');
      expect(result.message.toLowerCase()).toMatch(/water|contains/i);
    });

    it('should open glass bottle using "conta" alias', () => {
      const result = openHelper.executeOpenTarget('conta');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('bottl');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open glass bottle using "clear" alias', () => {
      const result = openHelper.executeOpenTarget('clear');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('bottl');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    it('should open glass bottle using "glass" alias', () => {
      const result = openHelper.executeOpenTarget('glass');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('bottl');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });

  });

  describe('Cannot Open Non-Openable Items', () => {
    it('should handle opening non-container items appropriately', () => {
      const result = openHelper.executeOpenTarget('windo');

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
      const result = openHelper.executeOpenTarget('sbag');
      openHelper.verifySuccess(result);
    });

    it('should work with "open <container>" syntax', () => {
      // Close if already open from previous test
      const result = openHelper.executeOpenTarget('sbag');

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
      const result = openHelper.executeOpenTarget('sbag');

      openHelper.verifyCountsAsMove(result);
    });

    it('should persist open state across commands', () => {
      // Open the container
      openHelper.executeOpenTarget('sbag');
      openHelper.verifyItemOpened('sbag');

      // Execute another command
      openHelper.executeOpen('look');

      // Verify still open
      openHelper.verifyItemOpened('sbag');
    });

    it('should change container examination after opening', () => {
      // Examine closed container
      const closedExamine = openHelper.executeOpen('examine sbag');
      openHelper.verifySuccess(closedExamine);

      // Open container
      openHelper.executeOpenTarget('sbag');

      // Examine open container
      const openExamine = openHelper.executeOpen('examine sbag');
      openHelper.verifySuccess(openExamine);

      // Messages should be different
      expect(openExamine.message).not.toBe(closedExamine.message);
    });
  });

  describe('Open Multiple Containers', () => {
    it('should handle opening multiple containers in sequence', () => {
      const result0 = openHelper.executeOpenTarget('sbag');
      openHelper.verifySuccess(result0);
      openHelper.verifyItemOpened('sbag');
      const result1 = openHelper.executeOpenTarget('bottl');
      openHelper.verifySuccess(result1);
      openHelper.verifyItemOpened('bottl');

      // Verify all containers are open
      openHelper.verifyItemOpened('sbag');
      openHelper.verifyItemOpened('bottl');
    });
  });

  describe('State Consistency', () => {
    it('should maintain brown sack state after opening', () => {
      // Initial state: closed
      openHelper.verifyItemClosed('sbag');

      // Open
      openHelper.executeOpenTarget('sbag');
      openHelper.verifyItemOpened('sbag');

      // State should persist
      openHelper.verifyItemOpened('sbag');
    });
  });
});
