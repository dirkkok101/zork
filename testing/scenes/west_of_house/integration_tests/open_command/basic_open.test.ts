/**
 * Basic Open Command Tests - West of House Scene
 * Tests opening various containers and doors in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from './helpers/open_command_helper';

describe('Open Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let openHelper: OpenCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Open command helper
    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
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

  describe('Authentic West of House Open Interactions', () => {
    beforeEach(() => {
      // Ensure clean state with only real scene items
      testEnv.westOfHouseHelper.clearTestItems();
    });

    describe('Opening the Small Mailbox', () => {
      it('should open the authentic Zork mailbox', () => {
        const result = openHelper.executeOpenTarget('mailbox');
        
        openHelper.verifyOpenMessage(result, 'mailbox');
        openHelper.verifyCountsAsMove(result);
        openHelper.verifyItemOpened('mailb');
      });

      it('should open mailbox using "box" alias from original game', () => {
        const result = openHelper.executeOpenTarget('box');
        
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('mailb');
      });

      it('should open mailbox using "small" alias from original game', () => {
        const result = openHelper.executeOpenTarget('small');
        
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('mailb');
      });

      it('should fail when trying to open already opened mailbox', () => {
        // First open it
        openHelper.executeOpenTarget('mailbox');
        
        // Try to open again - authentic Zork behavior
        const result = openHelper.executeOpenTarget('mailbox');
        
        openHelper.verifyAlreadyOpen(result, 'mailbox');
        openHelper.verifyNoMove(result);
      });
    });

    describe('Attempting to Open Non-Openable Items', () => {
      it('should fail to open the front door (authentic Zork behavior)', () => {
        const result = openHelper.executeOpenTarget('door');
        
        openHelper.verifyCannotOpenItem(result, 'door');
        openHelper.verifyNoMove(result);
      });

      it('should fail to open front door using "front" alias', () => {
        const result = openHelper.executeOpenTarget('front');
        
        openHelper.verifyCannotOpenItem(result, 'door'); // Should resolve to "door"
        openHelper.verifyNoMove(result);
      });

      it('should fail to open the welcome mat (authentic Zork behavior)', () => {
        const result = openHelper.executeOpenTarget('welcome mat');
        
        openHelper.verifyCannotOpenItem(result, 'welcome mat'); // Should resolve to "welcome mat"
        openHelper.verifyNoMove(result);
      });

      it('should fail to open welcome mat using "welco" alias', () => {
        const result = openHelper.executeOpenTarget('welco');
        
        openHelper.verifyCannotOpenItem(result, 'welcome mat'); // Should resolve to "welcome mat"
        openHelper.verifyNoMove(result);
      });
    });
  });

  describe('Command Syntax and Error Handling', () => {
    it('should handle empty open command gracefully', () => {
      const result = openHelper.executeOpen('open');
      
      openHelper.verifyFailure(result, 'What do you want to open');
      openHelper.verifyNoMove(result);
    });

    it('should handle missing target in open command', () => {
      const result = openHelper.executeOpen('open with');
      
      openHelper.verifyFailure(result, "With what?");
      openHelper.verifyNoMove(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = openHelper.executeOpenTarget('phantom');
      
      openHelper.verifyItemNotFound(result, 'phantom');
      openHelper.verifyNoMove(result);
    });
  });

  describe('Mailbox Contents Verification', () => {
    it('should reveal leaflet when mailbox is opened', () => {
      const result = openHelper.executeOpenTarget('mailbox');
      
      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('mailb');
      
      // Verify the authentic leaflet is inside (from original Zork) using ItemService
      const contents = testEnv.services.items.getContainerContents('mailb');
      expect(contents).toContain('adver'); // leaflet item ID
    });

    it('should maintain mailbox contents when opened', () => {
      openHelper.executeOpenTarget('mailbox');
      
      // Mailbox should still contain the leaflet after opening
      const contents = testEnv.services.items.getContainerContents('mailb');
      expect(contents).toBeDefined();
      expect(contents).toHaveLength(1);
      expect(contents).toContain('adver');
    });
  });
});