/**
 * Basic Examine Command Integration Tests - Kitchen Scene
 * Tests examine functionality for kitchen items and scene elements
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';
import { ExamineCommandHelper } from './helpers/examine_command_helper';

describe('Basic Examine Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Examination', () => {
    it('should examine the window item successfully', () => {
      const result = examineHelper.executeExamineTarget('window');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'window');
      examineHelper.verifyNoMove(result);
    });

    it('should examine window with item ID alias', () => {
      const result = examineHelper.executeExamineTarget('windo');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'window');
    });

    it('should describe closed window state', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const result = examineHelper.executeExamineTarget('window');
      
      examineHelper.verifyWindowExamine(result, false);
    });

    it('should describe open window state', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = examineHelper.executeExamineTarget('window');
      
      examineHelper.verifyWindowExamine(result, true);
    });
  });

  describe('Sack Examination', () => {
    it('should examine closed sack', () => {
      testEnv.kitchenHelper.setSackState(false);
      
      const result = examineHelper.executeExamineTarget('sack');
      
      examineHelper.verifySackExamine(result, false);
      examineHelper.verifyNoMove(result);
    });

    it('should examine open sack with contents', () => {
      testEnv.kitchenHelper.setSackState(true);
      
      const result = examineHelper.executeExamineTarget('sack');
      
      examineHelper.verifySackExamine(result, true);
    });

    it('should examine sack with brown sack alias', () => {
      const result = examineHelper.executeExamineTarget('brown sack');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'sack');
    });

    it('should examine sack with item ID alias', () => {
      const result = examineHelper.executeExamineTarget('sbag');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'sack');
    });
  });

  describe('Bottle Examination', () => {
    it('should examine closed bottle', () => {
      testEnv.kitchenHelper.setBottleState(false);
      
      const result = examineHelper.executeExamineTarget('bottle');
      
      examineHelper.verifyBottleExamine(result, false);
      examineHelper.verifyNoMove(result);
    });

    it('should examine open bottle with water', () => {
      testEnv.kitchenHelper.setBottleState(true);
      
      const result = examineHelper.executeExamineTarget('bottle');
      
      examineHelper.verifyBottleExamine(result, true);
    });

    it('should examine bottle with glass bottle alias', () => {
      const result = examineHelper.executeExamineTarget('glass bottle');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'bottle');
    });

    it('should examine bottle with item ID alias', () => {
      const result = examineHelper.executeExamineTarget('bottl');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyItemDescription(result, 'bottle');
    });
  });

  describe('Container State Examination', () => {
    it('should show different descriptions based on container states', () => {
      // Test all combinations of container states
      const testCases = [
        { sackOpen: false, bottleOpen: false },
        { sackOpen: true, bottleOpen: false },
        { sackOpen: false, bottleOpen: true },
        { sackOpen: true, bottleOpen: true }
      ];

      testCases.forEach(({ sackOpen, bottleOpen }) => {
        testEnv.kitchenHelper.setSackState(sackOpen);
        testEnv.kitchenHelper.setBottleState(bottleOpen);
        
        const sackResult = examineHelper.executeExamineTarget('sack');
        const bottleResult = examineHelper.executeExamineTarget('bottle');
        
        examineHelper.verifySackExamine(sackResult, sackOpen);
        examineHelper.verifyBottleExamine(bottleResult, bottleOpen);
      });
    });

    it('should maintain container states during examination', () => {
      // Set specific states
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Examine both
      examineHelper.executeExamineTarget('sack');
      examineHelper.executeExamineTarget('bottle');
      
      // States should be unchanged
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(false);
    });
  });

  describe('Scene Examination', () => {
    it('should examine the scene when no target specified', () => {
      const result = examineHelper.executeExamine('examine');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyDetailedDescription(result);
      examineHelper.verifyNoMove(result);
    });

    it('should examine scene with "examine here" command', () => {
      const result = examineHelper.executeExamineTarget('here');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyDetailedDescription(result);
    });

    it('should examine scene with "examine around" command', () => {
      const result = examineHelper.executeExamineTarget('around');
      
      examineHelper.verifySuccess(result);
      examineHelper.verifyDetailedDescription(result);
    });
  });

  describe('Invalid Target Examination', () => {
    it('should fail when examining non-existent item', () => {
      const result = examineHelper.executeExamineTarget('nonexistent');
      
      examineHelper.verifyItemNotFound(result, 'nonexistent');
    });

    it('should fail when examining items from other scenes', () => {
      const result = examineHelper.executeExamineTarget('mailbox');
      
      examineHelper.verifyItemNotFound(result, 'mailbox');
    });

    it('should fail when examining table (not present in kitchen)', () => {
      const result = examineHelper.executeExamineTarget('table');
      
      examineHelper.verifyItemNotFound(result, 'table');
    });
  });

  describe('Command Variations', () => {
    it('should accept "examine" command', () => {
      const result = examineHelper.executeExamine('examine window');
      examineHelper.verifySuccess(result);
    });

    it('should accept "x" shorthand', () => {
      const result = examineHelper.executeExamine('x window');
      examineHelper.verifySuccess(result);
    });

    it('should accept "look at" command', () => {
      const result = examineHelper.executeLookAt('window');
      examineHelper.verifySuccess(result);
    });

    it('should produce consistent results across command variations', () => {
      const examineResult = examineHelper.executeExamine('examine window');
      const xResult = examineHelper.executeExamine('x window');
      const lookAtResult = examineHelper.executeLookAt('window');
      
      examineHelper.verifySuccess(examineResult);
      examineHelper.verifySuccess(xResult);
      examineHelper.verifySuccess(lookAtResult);
      
      examineHelper.verifyItemDescription(examineResult, 'window');
      examineHelper.verifyItemDescription(xResult, 'window');
      examineHelper.verifyItemDescription(lookAtResult, 'window');
    });
  });

  describe('State Consistency', () => {
    it('should not change game state during examination', () => {
      const initialMoves = examineHelper.getCurrentMoves();
      const initialWindowState = testEnv.kitchenHelper.isEastExitAvailable();
      
      examineHelper.executeExamineTarget('window');
      examineHelper.executeExamineTarget('sack');
      examineHelper.executeExamineTarget('bottle');
      
      const finalMoves = examineHelper.getCurrentMoves();
      const finalWindowState = testEnv.kitchenHelper.isEastExitAvailable();
      
      expect(finalMoves).toBe(initialMoves);
      expect(finalWindowState).toBe(initialWindowState);
    });

    it('should not count as a move', () => {
      const result = examineHelper.executeExamineTarget('window');
      examineHelper.verifyNoMove(result);
    });

    it('should maintain scene items during examination', () => {
      const initialItems = testEnv.kitchenHelper.getSceneItems();
      
      examineHelper.executeExamineTarget('window');
      examineHelper.executeExamineTarget('sack');
      examineHelper.executeExamineTarget('bottle');
      
      const finalItems = testEnv.kitchenHelper.getSceneItems();
      expect(finalItems).toEqual(initialItems);
    });

    it('should preserve move count across multiple examinations', () => {
      const initialCount = examineHelper.getCurrentMoves();
      
      examineHelper.executeExamineTarget('window');
      examineHelper.verifyMoveCountUnchanged(initialCount);
      
      examineHelper.executeExamineTarget('sack');
      examineHelper.verifyMoveCountUnchanged(initialCount);
      
      examineHelper.executeExamineTarget('bottle');
      examineHelper.verifyMoveCountUnchanged(initialCount);
    });
  });
});