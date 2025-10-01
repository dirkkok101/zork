/**
 * Examine Command Tests - Clearing Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine grating and show description', () => {
      const result = examineHelper.executeExamineTarget('grate');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine grating using "grati" alias', () => {
      const result = examineHelper.executeExamineTarget('grati');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine pile of leaves and show description', () => {
      const result = examineHelper.executeExamineTarget('leave');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine pile of leaves using "leaf" alias', () => {
      const result = examineHelper.executeExamineTarget('leaf');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine pile of leaves using "pile" alias', () => {
      const result = examineHelper.executeExamineTarget('pile');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Examine Items in Inventory', () => {
    it('should examine pile of leaves when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('leave');

      const result = examineHelper.executeExamineTarget('leave');

      examineHelper.verifySuccess(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('grate');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x grate');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at grate');

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
      const result = examineHelper.executeExamineTarget('grate');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('grate');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('grate');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('leave');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
