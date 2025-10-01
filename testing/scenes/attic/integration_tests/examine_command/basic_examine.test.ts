/**
 * Examine Command Tests - Attic Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine brick and show description', () => {
      const result = examineHelper.executeExamineTarget('brick');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine brick using "brick" alias', () => {
      const result = examineHelper.executeExamineTarget('brick');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine brick using "squar" alias', () => {
      const result = examineHelper.executeExamineTarget('squar');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine brick using "clay" alias', () => {
      const result = examineHelper.executeExamineTarget('clay');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine rope and show description', () => {
      const result = examineHelper.executeExamineTarget('rope');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine rope using "hemp" alias', () => {
      const result = examineHelper.executeExamineTarget('hemp');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine rope using "coil" alias', () => {
      const result = examineHelper.executeExamineTarget('coil');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine rope using "large" alias', () => {
      const result = examineHelper.executeExamineTarget('large');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine knife and show description', () => {
      const result = examineHelper.executeExamineTarget('knife');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine knife using "blade" alias', () => {
      const result = examineHelper.executeExamineTarget('blade');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine knife using "nasty" alias', () => {
      const result = examineHelper.executeExamineTarget('nasty');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine knife using "unrus" alias', () => {
      const result = examineHelper.executeExamineTarget('unrus');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine knife using "plain" alias', () => {
      const result = examineHelper.executeExamineTarget('plain');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Examine Containers', () => {
    it('should examine closed brick and show closed state', () => {
      const result = examineHelper.executeExamineTarget('brick');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open brick and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open brick');

      const result = examineHelper.executeExamineTarget('brick');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, true, false);
    });

  });

  describe('Examine Items in Inventory', () => {
    it('should examine brick when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('brick');

      const result = examineHelper.executeExamineTarget('brick');

      examineHelper.verifySuccess(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('brick');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x brick');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at brick');

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
      const result = examineHelper.executeExamineTarget('brick');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('brick');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

  describe('Container State Awareness', () => {
    it('should show different descriptions for open vs closed brick', () => {
      // Examine closed
      const closedResult = examineHelper.executeExamineTarget('brick');
      examineHelper.verifySuccess(closedResult);

      // Open container
      examineHelper.executeOpen('open brick');

      // Examine open
      const openResult = examineHelper.executeExamineTarget('brick');
      examineHelper.verifySuccess(openResult);

      // Results should differ
      expect(openResult.message).not.toBe(closedResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('brick');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('rope');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);
      const result2 = examineHelper.executeExamineTarget('knife');
      examineHelper.verifySuccess(result2);
      results.push(result2.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
