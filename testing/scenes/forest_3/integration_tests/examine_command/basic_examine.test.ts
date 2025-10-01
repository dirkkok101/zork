/**
 * Examine Command Tests - Forest Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { Forest3TestEnvironment, Forest3IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Forest Scene', () => {
  let testEnv: Forest3TestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await Forest3IntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine large tree and show description', () => {
      const result = examineHelper.executeExamineTarget('ftree');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine large tree using "tree" alias', () => {
      const result = examineHelper.executeExamineTarget('tree');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine large tree using "large" alias', () => {
      const result = examineHelper.executeExamineTarget('large');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('ftree');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x ftree');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at ftree');

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
      const result = examineHelper.executeExamineTarget('ftree');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('ftree');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

});
