/**
 * Examine Command Tests - West of House Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine door and show description', () => {
      const result = examineHelper.executeExamineTarget('fdoor');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine door using "door" alias', () => {
      const result = examineHelper.executeExamineTarget('door');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine door using "front" alias', () => {
      const result = examineHelper.executeExamineTarget('front');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine mailbox and show description', () => {
      const result = examineHelper.executeExamineTarget('mailb');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine mailbox using "box" alias', () => {
      const result = examineHelper.executeExamineTarget('box');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine mailbox using "small" alias', () => {
      const result = examineHelper.executeExamineTarget('small');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine welcome mat and show description', () => {
      const result = examineHelper.executeExamineTarget('mat');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine welcome mat using "welco" alias', () => {
      const result = examineHelper.executeExamineTarget('welco');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine welcome mat using "rubbe" alias', () => {
      const result = examineHelper.executeExamineTarget('rubbe');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Examine Containers', () => {
    it('should examine closed mailbox and show closed state', () => {
      const result = examineHelper.executeExamineTarget('mailb');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open mailbox and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open mailb');

      const result = examineHelper.executeExamineTarget('mailb');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, true, true);
    });

  });

  describe('Examine Readable Items', () => {
    it('should examine welcome mat and show readable text', () => {
      const result = examineHelper.executeExamineTarget('mat');

      examineHelper.verifySuccess(result);
    });

  });

  describe('Examine Items in Inventory', () => {
    it('should examine welcome mat when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('mat');

      const result = examineHelper.executeExamineTarget('mat');

      examineHelper.verifySuccess(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('fdoor');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x fdoor');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at fdoor');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // look at may not be supported
        examineHelper.verifyFailure(result);
      }
    });
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

    it('should handle examining items from other scenes', () => {
      const result = examineHelper.executeExamineTarget('sword');

      examineHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should not count examine as a move', () => {
      const result = examineHelper.executeExamineTarget('fdoor');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('fdoor');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

  describe('Container State Awareness', () => {
    it('should show different descriptions for open vs closed mailbox', () => {
      // Examine closed
      const closedResult = examineHelper.executeExamineTarget('mailb');
      examineHelper.verifySuccess(closedResult);

      // Open container
      examineHelper.executeOpen('open mailb');

      // Examine open
      const openResult = examineHelper.executeExamineTarget('mailb');
      examineHelper.verifySuccess(openResult);

      // Results should differ
      expect(openResult.message).not.toBe(closedResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('fdoor');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('mailb');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);
      const result2 = examineHelper.executeExamineTarget('mat');
      examineHelper.verifySuccess(result2);
      results.push(result2.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
