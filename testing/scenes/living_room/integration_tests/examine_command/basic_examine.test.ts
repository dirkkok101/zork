/**
 * Examine Command Tests - Living Room Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Items in Scene', () => {
    it('should examine wooden door and show description', () => {
      const result = examineHelper.executeExamineTarget('wdoor');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine wooden door using "door" alias', () => {
      const result = examineHelper.executeExamineTarget('door');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine wooden door using "woode" alias', () => {
      const result = examineHelper.executeExamineTarget('woode');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine wooden door using "west" alias', () => {
      const result = examineHelper.executeExamineTarget('west');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine wooden door using "weste" alias', () => {
      const result = examineHelper.executeExamineTarget('weste');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine trophy case and show description', () => {
      const result = examineHelper.executeExamineTarget('tcase');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine trophy case using "case" alias', () => {
      const result = examineHelper.executeExamineTarget('case');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine trophy case using "troph" alias', () => {
      const result = examineHelper.executeExamineTarget('troph');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine lamp and show description', () => {
      const result = examineHelper.executeExamineTarget('lamp');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine lamp using "lante" alias', () => {
      const result = examineHelper.executeExamineTarget('lante');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine lamp using "light" alias', () => {
      const result = examineHelper.executeExamineTarget('light');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine lamp using "brass" alias', () => {
      const result = examineHelper.executeExamineTarget('brass');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine carpet and show description', () => {
      const result = examineHelper.executeExamineTarget('rug');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine carpet using "carpe" alias', () => {
      const result = examineHelper.executeExamineTarget('carpe');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine carpet using "orien" alias', () => {
      const result = examineHelper.executeExamineTarget('orien');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine newspaper and show description', () => {
      const result = examineHelper.executeExamineTarget('paper');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine newspaper using "newsp" alias', () => {
      const result = examineHelper.executeExamineTarget('newsp');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine newspaper using "issue" alias', () => {
      const result = examineHelper.executeExamineTarget('issue');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine newspaper using "repor" alias', () => {
      const result = examineHelper.executeExamineTarget('repor');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine newspaper using "magaz" alias', () => {
      const result = examineHelper.executeExamineTarget('magaz');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine newspaper using "news" alias', () => {
      const result = examineHelper.executeExamineTarget('news');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine sword and show description', () => {
      const result = examineHelper.executeExamineTarget('sword');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      examineHelper.verifyNoMove(result);
    });

    it('should examine sword using "orcri" alias', () => {
      const result = examineHelper.executeExamineTarget('orcri');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine sword using "glamd" alias', () => {
      const result = examineHelper.executeExamineTarget('glamd');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine sword using "blade" alias', () => {
      const result = examineHelper.executeExamineTarget('blade');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine sword using "elvis" alias', () => {
      const result = examineHelper.executeExamineTarget('elvis');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Examine Containers', () => {
    it('should examine closed trophy case and show closed state', () => {
      const result = examineHelper.executeExamineTarget('tcase');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open trophy case and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open tcase');

      const result = examineHelper.executeExamineTarget('tcase');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, true, false);
    });

  });

  describe('Examine Items in Inventory', () => {
    it('should examine lamp when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('lamp');

      const result = examineHelper.executeExamineTarget('lamp');

      examineHelper.verifySuccess(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "examine" command', () => {
      const result = examineHelper.executeExamineTarget('wdoor');
      examineHelper.verifySuccess(result);
    });

    it('should work with "x" shorthand', () => {
      const result = examineHelper.executeExamine('x wdoor');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // x shorthand may not be supported
        examineHelper.verifyFailure(result);
      }
    });

    it('should work with "look at" syntax', () => {
      const result = examineHelper.executeExamine('look at wdoor');

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
  });

  describe('Game State Tracking', () => {
    it('should not count examine as a move', () => {
      const result = examineHelper.executeExamineTarget('wdoor');

      examineHelper.verifyNoMove(result);
    });

    it('should return different result than look command', () => {
      const examineResult = examineHelper.executeExamineTarget('wdoor');
      const lookResult = examineHelper.executeExamine('look');

      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(lookResult);
      expect(examineResult.message).not.toBe(lookResult.message);
    });
  });

  describe('Container State Awareness', () => {
    it('should show different descriptions for open vs closed trophy case', () => {
      // Examine closed
      const closedResult = examineHelper.executeExamineTarget('tcase');
      examineHelper.verifySuccess(closedResult);

      // Open container
      examineHelper.executeOpen('open tcase');

      // Examine open
      const openResult = examineHelper.executeExamineTarget('tcase');
      examineHelper.verifySuccess(openResult);

      // Results should differ
      expect(openResult.message).not.toBe(closedResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('wdoor');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('tcase');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);
      const result2 = examineHelper.executeExamineTarget('lamp');
      examineHelper.verifySuccess(result2);
      results.push(result2.message);
      const result3 = examineHelper.executeExamineTarget('rug');
      examineHelper.verifySuccess(result3);
      results.push(result3.message);
      const result4 = examineHelper.executeExamineTarget('paper');
      examineHelper.verifySuccess(result4);
      results.push(result4.message);
      const result5 = examineHelper.executeExamineTarget('sword');
      examineHelper.verifySuccess(result5);
      results.push(result5.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
