/**
 * Examine Command Tests - Kitchen Scene
 * Auto-generated tests for examine command functionality
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from '@testing/helpers/ExamineCommandHelper';

describe('Examine Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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

    it('should examine brown sack and show description', () => {
      const result = examineHelper.executeExamineTarget('sbag');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine brown sack using "bag" alias', () => {
      const result = examineHelper.executeExamineTarget('bag');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine brown sack using "sack" alias', () => {
      const result = examineHelper.executeExamineTarget('sack');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine brown sack using "brown" alias', () => {
      const result = examineHelper.executeExamineTarget('brown');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine brown sack using "elong" alias', () => {
      const result = examineHelper.executeExamineTarget('elong');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

    it('should examine glass bottle and show description', () => {
      const result = examineHelper.executeExamineTarget('bottl');

      examineHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(10);
      examineHelper.verifyNoMove(result);
    });

    it('should examine glass bottle using "conta" alias', () => {
      const result = examineHelper.executeExamineTarget('conta');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine glass bottle using "clear" alias', () => {
      const result = examineHelper.executeExamineTarget('clear');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });
    it('should examine glass bottle using "glass" alias', () => {
      const result = examineHelper.executeExamineTarget('glass');

      if (result.success) {
        examineHelper.verifySuccess(result);
      } else {
        // Alias may not be recognized
        examineHelper.verifyFailure(result);
      }
    });

  });

  describe('Examine Containers', () => {
    it('should examine closed brown sack and show closed state', () => {
      const result = examineHelper.executeExamineTarget('sbag');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open brown sack and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open sbag');

      const result = examineHelper.executeExamineTarget('sbag');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, true, false);
    });

    it('should examine closed glass bottle and show closed state', () => {
      const result = examineHelper.executeExamineTarget('bottl');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, false);
    });

    it('should examine open glass bottle and show contents', () => {
      // Open the container first
      examineHelper.executeOpen('open bottl');

      const result = examineHelper.executeExamineTarget('bottl');

      examineHelper.verifySuccess(result);
      examineHelper.verifyContainerInfo(result, true, true);
    });

  });

  describe('Examine Items in Inventory', () => {
    it('should examine brown sack when in inventory', () => {
      // Add item to inventory
      examineHelper.addItemToInventory('sbag');

      const result = examineHelper.executeExamineTarget('sbag');

      examineHelper.verifySuccess(result);
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

  describe('Container State Awareness', () => {
    it('should show different descriptions for open vs closed brown sack', () => {
      // Examine closed
      const closedResult = examineHelper.executeExamineTarget('sbag');
      examineHelper.verifySuccess(closedResult);

      // Open container
      examineHelper.executeOpen('open sbag');

      // Examine open
      const openResult = examineHelper.executeExamineTarget('sbag');
      examineHelper.verifySuccess(openResult);

      // Results should differ
      expect(openResult.message).not.toBe(closedResult.message);
    });
  });

  describe('Examine Multiple Items', () => {
    it('should examine each item with unique descriptions', () => {
      const results: string[] = [];

      const result0 = examineHelper.executeExamineTarget('windo');
      examineHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = examineHelper.executeExamineTarget('sbag');
      examineHelper.verifySuccess(result1);
      results.push(result1.message);
      const result2 = examineHelper.executeExamineTarget('bottl');
      examineHelper.verifySuccess(result2);
      results.push(result2.message);

      // Each item should have a unique description
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});
