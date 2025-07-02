/**
 * Basic Examine Command Integration Tests - Behind House Scene
 * Tests examine functionality for window and scene elements
 */

import '@testing/scenes/behind_house/integration_tests/look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '@testing/scenes/behind_house/integration_tests/look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from './helpers/examine_command_helper';

describe('Basic Examine Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Examination', () => {
    it('should examine the window item successfully', async () => {
      const result = examineHelper.executeExamineWindow();
      
      examineHelper.verifyWindowExamination(result);
      examineHelper.verifyNoMove(result);
    });

    it('should show window as a door-type object', async () => {
      const result = examineHelper.executeExamineWindow();
      
      examineHelper.verifyWindowAsDoor(result);
      examineHelper.verifyNonPortableItem(result, 'windo');
    });

    it('should examine window with different command variations', async () => {
      // Test that commands work with both aliases, but results should contain resolved name
      examineHelper.verifyCommandVariations('windo', 'window'); // window is the canonical name
    });

    it('should examine window with "window" alias', async () => {
      const result = examineHelper.executeExamineTarget('window');
      
      examineHelper.verifyWindowExamination(result);
      // Should contain canonical name "window" in response
      examineHelper.verifyContainsText(result, 'window');
    });
  });

  describe('Window State Examination', () => {
    it('should describe closed window state', async () => {
      testEnv.behindHouseHelper.setWindowClosed();
      
      const result = examineHelper.executeExamineWindow();
      
      examineHelper.verifyWindowState(result, false);
      examineHelper.verifyContainsText(result, 'closed');
    });

    it('should describe open window state', async () => {
      testEnv.behindHouseHelper.setWindowOpen();
      
      const result = examineHelper.executeExamineWindow();
      
      examineHelper.verifyWindowState(result, true);
      examineHelper.verifyContainsText(result, 'open');
    });

    it('should maintain window state during examination', async () => {
      // Start closed
      testEnv.behindHouseHelper.setWindowClosed();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      examineHelper.executeExamineWindow();
      
      // Should still be closed after examination
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      // Open it
      testEnv.behindHouseHelper.setWindowOpen();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      examineHelper.executeExamineWindow();
      
      // Should still be open after examination
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
    });
  });

  describe('Scene Examination', () => {
    it('should examine the scene when no target specified', async () => {
      const result = examineHelper.executeExamineScene();
      
      examineHelper.verifySceneExamination(result);
      examineHelper.verifyNoMove(result);
    });

    it('should examine scene with "examine here" command', async () => {
      const result = examineHelper.executeExamineTarget('here');
      
      examineHelper.verifySceneExamination(result);
    });

    it('should examine scene with "examine around" command', async () => {
      const result = examineHelper.executeExamineTarget('around');
      
      examineHelper.verifySceneExamination(result);
    });
  });

  describe('Self Examination', () => {
    it('should examine self when empty-handed', async () => {
      examineHelper.clearInventory();
      
      const result = examineHelper.executeExamineTarget('me');
      
      examineHelper.verifySelfExamination(result, false);
    });

    it('should examine self with items', async () => {
      // Add test item to inventory (if available)
      const hasItems = examineHelper.addItemToInventory('test_item');
      
      const result = examineHelper.executeExamineTarget('self');
      
      if (hasItems) {
        examineHelper.verifySelfExamination(result, true, 1);
      } else {
        examineHelper.verifySelfExamination(result, false);
      }
    });

    it('should accept various self-reference aliases', async () => {
      const selfAliases = ['me', 'self', 'myself', 'adventurer'];
      
      selfAliases.forEach(alias => {
        const result = examineHelper.executeExamineTarget(alias);
        examineHelper.verifySuccess(result);
        examineHelper.verifyContainsText(result, 'adventurer');
      });
    });
  });

  describe('Invalid Target Examination', () => {
    it('should fail when examining non-existent item', async () => {
      const result = examineHelper.executeExamineTarget('nonexistent');
      
      // Error message should use the resolved name (same as input for non-existent items)
      examineHelper.verifyInvalidTarget(result, 'nonexistent', 'nonexistent');
    });

    it('should fail when examining items from other scenes', async () => {
      // Try to examine mailbox (from west_of_house)
      const result = examineHelper.executeExamineTarget('mailbox');
      
      // Error should use canonical name "mailbox" not any alias
      examineHelper.verifyInvalidTarget(result, 'mailbox', 'mailbox');
    });

    it('should examine scene when examining empty string', async () => {
      const result = examineHelper.executeExamineTarget('');
      
      examineHelper.verifySceneExamination(result);
      examineHelper.verifyNoMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept "examine" command', async () => {
      const result = examineHelper.executeExamine('examine windo');
      examineHelper.verifySuccess(result);
    });

    it('should accept "x" shorthand', async () => {
      const result = examineHelper.executeExamine('x windo');
      examineHelper.verifySuccess(result);
    });

    it('should accept "look at" command', async () => {
      const result = examineHelper.executeExamine('look at windo');
      examineHelper.verifySuccess(result);
    });

    it('should produce consistent results across command variations', async () => {
      const examineResult = examineHelper.executeExamine('examine windo');
      const xResult = examineHelper.executeExamine('x windo');
      const lookAtResult = examineHelper.executeExamine('look at windo');
      
      // All should succeed
      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(xResult);
      examineHelper.verifySuccess(lookAtResult);
      
      // All should contain canonical window information
      examineHelper.verifyContainsText(examineResult, 'window');
      examineHelper.verifyContainsText(xResult, 'window');
      examineHelper.verifyContainsText(lookAtResult, 'window');
    });

    it('should use canonical name "window" when examining via alias', async () => {
      // When user types "windo", responses should use canonical "window"
      const resultFromAlias = examineHelper.executeExamineTarget('windo');
      examineHelper.verifySuccess(resultFromAlias);
      examineHelper.verifyContainsText(resultFromAlias, 'window');
      
      // When user types "window", responses should also use "window"
      const resultFromCanonical = examineHelper.executeExamineTarget('window');
      examineHelper.verifySuccess(resultFromCanonical);
      examineHelper.verifyContainsText(resultFromCanonical, 'window');
    });
  });

  describe('State Consistency', () => {
    it('should not change game state during examination', async () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const initialWindowState = testEnv.behindHouseHelper.isWindowOpen();
      
      examineHelper.executeExamineWindow();
      
      const finalMoves = testEnv.lookCommandHelper.getCurrentMoves();
      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      const finalWindowState = testEnv.behindHouseHelper.isWindowOpen();
      
      // Nothing should change
      expect(finalMoves).toBe(initialMoves);
      expect(finalScore).toBe(initialScore);
      expect(finalWindowState).toBe(initialWindowState);
    });

    it('should not count as a move', async () => {
      const result = examineHelper.executeExamineWindow();
      examineHelper.verifyNoMove(result);
    });

    it('should maintain scene items during examination', async () => {
      const initialItems = testEnv.behindHouseHelper.getSceneItems();
      
      examineHelper.executeExamineWindow();
      
      const finalItems = testEnv.behindHouseHelper.getSceneItems();
      expect(finalItems).toEqual(initialItems);
    });
  });
});
