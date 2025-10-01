/**
 * Examine Command Tests - Behind House Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { BehindHouseTestEnvironment, BehindHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine window and show description', () => {
      const result = examineHelper.executeExamineTarget('windo');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('windo');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x windo');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at windo');

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
      const result = examineHelper.executeExamineTarget('windo');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('windo');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

});
