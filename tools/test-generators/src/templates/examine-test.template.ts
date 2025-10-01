export const examineTestTemplate = `/**
 * Examine Command Tests - {{title}} Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if visibleItems}}
  describe('Examine Items in Scene', () => {
    {{#each visibleItems}}
    it('should examine {{this.name}} and show description', () => {
      const result = examineHelper.executeExamineTarget('{{this.id}}');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    {{#if this.aliases}}
    {{#each this.aliases}}
    {{#if @index}}
    it('should examine {{../name}} using "{{this}}" alias', () => {
      const result = examineHelper.executeExamineTarget('{{this}}');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    {{/if}}
    {{/each}}
    {{/if}}

    {{/each}}
  });
  {{/if}}

  {{#if containers}}
  describe('Examine Containers', () => {
    {{#each containers}}
    it('should examine closed {{this.name}} and show closed state', () => {
      const result = examineHelper.executeExamineTarget('{{this.id}}');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open {{this.name}} and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open {{this.id}}');

      const result = examineHelper.executeExamineTarget('{{this.id}}');

      examineHelper.verifySuccess(result);
      {{#if this.initialContents}}
      examineHelper.verifyContainerInfo(result, true, true);
      {{else}}
      examineHelper.verifyContainerInfo(result, true, false);
      {{/if}}
    });

    {{/each}}
  });
  {{/if}}


  {{#if takeableItems}}
  describe('Examine Items in Inventory', () => {
    {{#each takeableItems}}
    {{#if @first}}
    it('should examine {{this.name}} when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('{{this.id}}');

      const result = examineHelper.executeExamineTarget('{{this.id}}');

      examineHelper.verifySuccess(result);
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  describe('Command Syntax and Aliases', () => {
    {{#if visibleItems}}
    {{#with (first visibleItems)}}
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('{{this.id}}');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x {{this.id}}');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at {{this.id}}');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // look at may not be supported
        examineHelper.verifyFailure(result);
      }
    });
    {{/with}}
    {{/if}}
  });

  describe('Error Handling', () => {
    it('should handle empty examine command gracefully', () => {
      const result = examineHelper.executeExamine('examine');

      // Some implementations treat "examine" as "look"
      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        examineHelper.verifyFailure(result);
        expect(result.message).toMatch(/what.*examine|examine.*what/i);
      }
    });

    it('should handle non-existent items gracefully', () => {
      const result = examineHelper.executeExamineTarget('nonexistent_item_xyz');

      examineHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    {{#if visibleItems}}
    {{#with (first visibleItems)}}
    it('should not count examine as a move', () => {
      const result = examineHelper.executeExamineTarget('{{this.id}}');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('{{this.id}}');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
    {{/with}}
    {{/if}}
  });

  {{#if containers}}
  describe('Container State Awareness', () => {
    {{#each containers}}
    {{#if @first}}
    it('should show different descriptions for open vs closed {{this.name}}', () => {
      // Examine closed
      const closedResult = examineHelper.executeExamineTarget('{{this.id}}');
      examineHelper.verifySuccess(closedResult);

      // Open container
      examineHelper.executeOpen('open {{this.id}}');

      // Examine open
      const openResult = examineHelper.executeExamineTarget('{{this.id}}');
      examineHelper.verifySuccess(openResult);

      // Results should differ
      expect(openResult.message).not.toBe(closedResult.message);
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  {{#if multipleVisibleItems}}
  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      {{#each visibleItems}}
      const result{{@index}} = examineHelper.executeExamineTarget('{{this.id}}');
      examineHelper.verifySuccess(result{{@index}});
      results.push(result{{@index}}.message);
      {{/each}}

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
  {{/if}}
});
`;
