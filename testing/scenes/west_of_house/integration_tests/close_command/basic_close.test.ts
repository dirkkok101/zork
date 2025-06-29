/**
 * Basic Close Command Tests - West of House Scene
 * Tests closing various containers and doors in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '@testing/scenes/west_of_house/integration_tests/look_command/helpers/integration_test_factory';
import { CloseCommandHelper } from './helpers/close_command_helper';

describe('Close Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let closeHelper: CloseCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Close command helper
    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Authentic West of House Close Interactions', () => {
    beforeEach(() => {
      // Ensure clean state with only real scene items
      testEnv.westOfHouseHelper.clearTestItems();
    });

    describe('Closing the Small Mailbox', () => {
      it('should close the mailbox after opening it', () => {
        // First open the mailbox
        const openResult = closeHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        
        // Then close it
        const result = closeHelper.executeCloseTarget('mailbox');
        
        closeHelper.verifyCloseMessage(result, 'mailbox');
        closeHelper.verifyCountsAsMove(result);
        closeHelper.verifyItemClosed('mailb');
      });

      it('should close mailbox using "box" alias', () => {
        // First open the mailbox
        closeHelper.executeOpen('open mailbox');
        
        // Then close using alias
        const result = closeHelper.executeCloseTarget('box');
        
        closeHelper.verifySuccess(result);
        closeHelper.verifyItemClosed('mailb');
      });

      it('should fail when trying to close already closed mailbox', () => {
        const result = closeHelper.executeCloseTarget('mailbox');
        
        closeHelper.verifyAlreadyClosed(result, 'mailbox');
        closeHelper.verifyNoMove(result);
      });
    });

    describe('Attempting to Close Non-Closeable Items', () => {
      it('should fail to close the front door (authentic Zork behavior)', () => {
        const result = closeHelper.executeCloseTarget('door');
        
        closeHelper.verifyCannotClose(result, 'door');
        closeHelper.verifyNoMove(result);
      });

      it('should fail to close the welcome mat (authentic Zork behavior)', () => {
        const result = closeHelper.executeCloseTarget('welcome mat');
        
        closeHelper.verifyCannotClose(result, 'welcome mat');
        closeHelper.verifyNoMove(result);
      });
    });
  });

  describe('Command Syntax and Error Handling', () => {
    it('should handle empty close command gracefully', () => {
      const result = closeHelper.executeClose('close');
      
      closeHelper.verifyFailure(result, 'What do you want to close');
      closeHelper.verifyNoMove(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = closeHelper.executeCloseTarget('phantom');
      
      closeHelper.verifyItemNotFound(result, 'phantom');
      closeHelper.verifyNoMove(result);
    });
  });
});
