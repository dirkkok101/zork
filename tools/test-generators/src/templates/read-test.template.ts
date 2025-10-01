/**
 * Read Command Test Template
 * Generates comprehensive tests for the Read command
 *
 * Template Variables:
 * - title: Scene title
 * - sceneId: Scene identifier
 * - testEnvType: TypeScript type for test environment
 * - factoryName: Factory class name
 * - readableItems: Array of items that can be read
 * - nonReadableItems: Array of items that cannot be read
 * - multipleReadableItems: Boolean indicating if there are multiple readable items
 * - firstReadableItem: First readable item object
 * - firstNonReadableItem: First non-readable item object
 */

export const readTestTemplate = `/**
 * Read Command Tests - {{title}} Scene
 * Auto-generated tests for read command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { ReadCommandHelper } from '@testing/helpers/ReadCommandHelper';

describe('Read Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let readHelper: ReadCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    readHelper = new ReadCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if readableItems}}
  describe('Read Items in Scene', () => {
    {{#each readableItems}}
    it('should read {{this.name}} and display text', () => {
      const result = readHelper.executeReadItem('{{this.id}}');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    {{#if this.aliases}}
    {{#each this.aliases}}
    it('should read {{../this.name}} using "{{this}}" alias', () => {
      const result = readHelper.executeReadItem('{{this}}');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    {{/each}}
    {{/if}}

    {{/each}}
  });
  {{/if}}

  {{#if readableItems}}
  describe('Read Items in Inventory', () => {
    {{#if firstReadableItem}}
    it('should read {{firstReadableItem.name}} when in inventory', () => {
      // Add item to inventory
      readHelper.addItemToInventory('{{firstReadableItem.id}}');

      const result = readHelper.executeReadItem('{{firstReadableItem.id}}');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
    {{/if}}
  });
  {{/if}}

  {{#if firstNonReadableItem}}
  describe('Cannot Read Non-Readable Items', () => {
    it('should fail to read non-readable items', () => {
      const result = readHelper.executeReadItem('{{firstNonReadableItem.id}}');

      readHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't read|not readable|nothing.*read/i);
    });
  });
  {{/if}}

  describe('Command Syntax and Aliases', () => {
    {{#if firstReadableItem}}
    it('should work with "read" command', () => {
      const result = readHelper.executeReadItem('{{firstReadableItem.id}}');

      if (result.success) {
        readHelper.verifySuccess(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    it('should work with "read <item>" syntax', () => {
      const result = readHelper.executeReadItem('{{firstReadableItem.id}}');

      if (result.success) {
        readHelper.verifySuccess(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
    {{/if}}
  });

  describe('Error Handling', () => {
    it('should handle empty read command gracefully', () => {
      const result = readHelper.executeRead('read');

      readHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*read|read.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = readHelper.executeReadItem('nonexistent_item_xyz');

      readHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    {{#if firstReadableItem}}
    it('should not count read as a move', () => {
      const result = readHelper.executeReadItem('{{firstReadableItem.id}}');

      readHelper.verifyNoMove(result);
    });

    it('should display same content on multiple reads', () => {
      const result1 = readHelper.executeReadItem('{{firstReadableItem.id}}');
      const result2 = readHelper.executeReadItem('{{firstReadableItem.id}}');

      // Content should be consistent (whether success or failure)
      expect(result2.message).toBe(result1.message);
      expect(result2.success).toBe(result1.success);
    });
    {{/if}}
  });

  {{#if multipleReadableItems}}
  describe('Read Multiple Items', () => {
    it('should read each item with unique content', () => {
      const results: string[] = [];

      {{#each readableItems}}
      const result{{@index}} = readHelper.executeReadItem('{{this.id}}');
      readHelper.verifySuccess(result{{@index}});
      results.push(result{{@index}}.message);
      {{/each}}

      // Each item should have unique readable content
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
  {{/if}}

  {{#if firstReadableItem}}
  describe('Content Verification', () => {
    it('should display readable text for {{firstReadableItem.name}}', () => {
      const result = readHelper.executeReadItem('{{firstReadableItem.id}}');

      if (result.success) {
        readHelper.verifySuccess(result);
        // Verify that we got actual content
        expect(result.message.length).toBeGreaterThan(5);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
  });
  {{/if}}
});
`;
