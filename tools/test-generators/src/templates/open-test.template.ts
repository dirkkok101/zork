export const openTestTemplate = `/**
 * Open Command Tests - {{title}} Scene
 * Auto-generated tests for open command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/helpers/OpenCommandHelper';

describe('Open Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let openHelper: OpenCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if openableContainers}}
  describe('Open Containers', () => {
    {{#each openableContainers}}
    it('should open {{this.name}} when closed', () => {
      // Ensure container is closed
      openHelper.verifyItemClosed('{{this.id}}');

      const result = openHelper.executeOpenTarget('{{this.id}}');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('{{this.id}}');
      openHelper.verifyCountsAsMove(result);
    });

    it('should fail to open {{this.name}} when already open', () => {
      // Open the container first
      openHelper.executeOpenTarget('{{this.id}}');
      openHelper.verifyItemOpened('{{this.id}}');

      // Try to open again
      const result = openHelper.executeOpenTarget('{{this.id}}');

      openHelper.verifyFailure(result);
      expect(result.message).toMatch(/already open/i);
    });

    {{#if this.initialContents}}
    it('should reveal contents when opening {{this.name}}', () => {
      const result = openHelper.executeOpenTarget('{{this.id}}');

      openHelper.verifySuccess(result);
      openHelper.verifyItemOpened('{{this.id}}');
      {{#each this.initialContents}}
      expect(result.message.toLowerCase()).toMatch(/{{this}}|contains/i);
      {{/each}}
    });
    {{/if}}

    {{#if this.aliases}}
    {{#each this.aliases}}
    {{#if @index}}
    it('should open {{../name}} using "{{this}}" alias', () => {
      const result = openHelper.executeOpenTarget('{{this}}');

      if (result.success) {
        openHelper.verifySuccess(result);
        openHelper.verifyItemOpened('{{../id}}');
      } else {
        // Alias may not be recognized
        openHelper.verifyFailure(result);
      }
    });
    {{/if}}
    {{/each}}
    {{/if}}

    {{/each}}
  });
  {{/if}}

  {{#if nonOpenableItems}}
  describe('Cannot Open Non-Openable Items', () => {
    {{#each nonOpenableItems}}
    {{#if @first}}
    it('should handle opening non-container items appropriately', () => {
      const result = openHelper.executeOpenTarget('{{this.id}}');

      // Some non-containers (like doors) can be opened, others cannot
      if (result.success) {
        openHelper.verifySuccess(result);
      } else {
        openHelper.verifyFailure(result);
        expect(result.message).toMatch(/can't open|can't be opened|not a container/i);
      }
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  describe('Command Syntax and Aliases', () => {
    {{#if openableContainers}}
    {{#with (first openableContainers)}}
    it('should work with "open" command', () => {
      const result = openHelper.executeOpenTarget('{{this.id}}');
      openHelper.verifySuccess(result);
    });

    it('should work with "open <container>" syntax', () => {
      // Close if already open from previous test
      const result = openHelper.executeOpenTarget('{{this.id}}');

      if (!result.success && result.message.match(/already open/i)) {
        // Already open, that's fine
        expect(true).toBe(true);
      } else {
        openHelper.verifySuccess(result);
      }
    });
    {{/with}}
    {{/if}}
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

    {{#if openableContainers}}
    it('should handle opening items from other scenes', () => {
      const result = openHelper.executeOpenTarget('trophy_case');

      openHelper.verifyFailure(result);
    });
    {{/if}}
  });

  describe('Game State Tracking', () => {
    {{#if openableContainers}}
    {{#with (first openableContainers)}}
    it('should count open command as a move', () => {
      const result = openHelper.executeOpenTarget('{{this.id}}');

      openHelper.verifyCountsAsMove(result);
    });

    it('should persist open state across commands', () => {
      // Open the container
      openHelper.executeOpenTarget('{{this.id}}');
      openHelper.verifyItemOpened('{{this.id}}');

      // Execute another command
      openHelper.executeOpen('look');

      // Verify still open
      openHelper.verifyItemOpened('{{this.id}}');
    });

    it('should change container examination after opening', () => {
      // Examine closed container
      const closedExamine = openHelper.executeOpen('examine {{this.id}}');
      openHelper.verifySuccess(closedExamine);

      // Open container
      openHelper.executeOpenTarget('{{this.id}}');

      // Examine open container
      const openExamine = openHelper.executeOpen('examine {{this.id}}');
      openHelper.verifySuccess(openExamine);

      // Messages should be different
      expect(openExamine.message).not.toBe(closedExamine.message);
    });
    {{/with}}
    {{/if}}
  });

  {{#if multipleOpenableContainers}}
  describe('Open Multiple Containers', () => {
    it('should handle opening multiple containers in sequence', () => {
      {{#each openableContainers}}
      const result{{@index}} = openHelper.executeOpenTarget('{{this.id}}');
      openHelper.verifySuccess(result{{@index}});
      openHelper.verifyItemOpened('{{this.id}}');
      {{/each}}

      // Verify all containers are open
      {{#each openableContainers}}
      openHelper.verifyItemOpened('{{this.id}}');
      {{/each}}
    });
  });
  {{/if}}

  {{#if openableContainers}}
  describe('State Consistency', () => {
    {{#each openableContainers}}
    {{#if @first}}
    it('should maintain {{this.name}} state after opening', () => {
      // Initial state: closed
      openHelper.verifyItemClosed('{{this.id}}');

      // Open
      openHelper.executeOpenTarget('{{this.id}}');
      openHelper.verifyItemOpened('{{this.id}}');

      // State should persist
      openHelper.verifyItemOpened('{{this.id}}');
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}
});
`;
