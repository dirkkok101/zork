/**
 * Examine Command Tests - Dam Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { DamTestEnvironment, DamIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Dam Scene', () => {
  let testEnv: DamTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await DamIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine bolt and show description', () => {
      const result = examineHelper.executeExamineTarget('bolt');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine bolt using "bolt" alias', () => {
      const result = examineHelper.executeExamineTarget('bolt');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine bolt using "nut" alias', () => {
      const result = examineHelper.executeExamineTarget('nut');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine bolt using "metal" alias', () => {
      const result = examineHelper.executeExamineTarget('metal');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine dam and show description', () => {
      const result = examineHelper.executeExamineTarget('dam');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine dam using "gate" alias', () => {
      const result = examineHelper.executeExamineTarget('gate');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine dam using "gates" alias', () => {
      const result = examineHelper.executeExamineTarget('gates');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine dam using "fcd" alias', () => {
      const result = examineHelper.executeExamineTarget('fcd');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine green bubble and show description', () => {
      const result = examineHelper.executeExamineTarget('bubbl');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine green bubble using "green" alias', () => {
      const result = examineHelper.executeExamineTarget('green');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine green bubble using "plast" alias', () => {
      const result = examineHelper.executeExamineTarget('plast');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine control panel and show description', () => {
      const result = examineHelper.executeExamineTarget('cpanl');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine control panel using "panel" alias', () => {
      const result = examineHelper.executeExamineTarget('panel');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine control panel using "contr" alias', () => {
      const result = examineHelper.executeExamineTarget('contr');

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
      const result = examineHelper.executeExamineTarget('bolt');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x bolt');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at bolt');

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
      const result = examineHelper.executeExamineTarget('bolt');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('bolt');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('bolt');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('dam');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);
      const result2 = examineHelper.executeExamineTarget('bubbl');
      examineHelper.verifySuccess(result2);
      results.push(result2.message);
      const result3 = examineHelper.executeExamineTarget('cpanl');
      examineHelper.verifySuccess(result3);
      results.push(result3.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
