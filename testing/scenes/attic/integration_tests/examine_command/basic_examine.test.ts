/**
 * Attic Scene - Examine Command Integration Tests
 * Tests all aspects of the examine command for attic items
 */

import '../look_command/setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from '../look_command/helpers/attic_integration_test_factory';

describe('Attic Scene - Examine Command Integration', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Examine Individual Items', () => {
    it('examine brick shows detailed description', () => {
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'brick');
      testEnv.examineCommandHelper.verifyBrickDescription(result);
      testEnv.examineCommandHelper.verifyNoMove(result);
      testEnv.examineCommandHelper.verifyNoScoreChange(result);
    });

    it('examine rope shows detailed description', () => {
      const result = testEnv.examineCommandHelper.executeExamine('rope');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'rope');
      testEnv.examineCommandHelper.verifyRopeDescription(result);
      testEnv.examineCommandHelper.verifyNoMove(result);
      testEnv.examineCommandHelper.verifyNoScoreChange(result);
    });

    it('examine knife shows detailed description', () => {
      const result = testEnv.examineCommandHelper.executeExamine('knife');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'knife');
      testEnv.examineCommandHelper.verifyKnifeDescription(result);
      testEnv.examineCommandHelper.verifyNoMove(result);
      testEnv.examineCommandHelper.verifyNoScoreChange(result);
    });

    it('examine large coil (rope alias) works', () => {
      const result = testEnv.examineCommandHelper.executeExamine('large coil');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'rope');
      testEnv.examineCommandHelper.verifyRopeDescription(result);
    });

    it('examine square brick (brick alias) works', () => {
      const result = testEnv.examineCommandHelper.executeExamine('square brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'brick');
      testEnv.examineCommandHelper.verifyBrickDescription(result);
    });

    it('examine nasty knife (knife alias) works', () => {
      const result = testEnv.examineCommandHelper.executeExamine('nasty knife');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyItemDescription(result, 'knife');
      testEnv.examineCommandHelper.verifyKnifeDescription(result);
    });
  });

  describe('Brick Container State Examination', () => {
    it('examine brick shows closed state initially', () => {
      testEnv.atticHelper.setBrickClosed();
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickClosed(result);
    });

    it('examine brick shows open state when opened', () => {
      testEnv.atticHelper.setBrickOpen();
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickOpen(result);
    });

    it('examine brick shows contents when open', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_emerald', 'test_coins']);
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickOpen(result);
      testEnv.examineCommandHelper.verifyContainerContents(result, ['test_emerald', 'test_coins']);
    });

    it('examine brick shows empty when open but empty', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.clearBrickContents();
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickOpen(result);
      testEnv.examineCommandHelper.verifyEmptyContainer(result);
    });

    it('examine brick hides contents when closed', () => {
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.addToBrickContainer(['test_emerald']);
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickClosed(result);
      expect(result.message).not.toContain('test_emerald');
    });

    it('examine brick state transitions correctly', () => {
      // Start closed
      testEnv.atticHelper.setBrickClosed();
      let result = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifyBrickClosed(result);
      
      // Open brick
      testEnv.atticHelper.setBrickOpen();
      result = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifyBrickOpen(result);
      
      // Close brick again
      testEnv.atticHelper.setBrickClosed();
      result = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifyBrickClosed(result);
    });
  });

  describe('Knife Weapon State Examination', () => {
    it('examine knife shows off state initially', () => {
      testEnv.atticHelper.setKnifeOff();
      
      const result = testEnv.examineCommandHelper.executeExamine('knife');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyKnifeOff(result);
    });

    it('examine knife shows on state when turned on', () => {
      testEnv.atticHelper.setKnifeOn();
      
      const result = testEnv.examineCommandHelper.executeExamine('knife');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyKnifeOn(result);
    });

    it('examine knife state transitions correctly', () => {
      // Start off
      testEnv.atticHelper.setKnifeOff();
      let result = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifyKnifeOff(result);
      
      // Turn on
      testEnv.atticHelper.setKnifeOn();
      result = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifyKnifeOn(result);
      
      // Turn off again
      testEnv.atticHelper.setKnifeOff();
      result = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifyKnifeOff(result);
    });
  });

  describe('Rope Treasure Examination', () => {
    it('examine rope shows treasure characteristics', () => {
      const result = testEnv.examineCommandHelper.executeExamine('rope');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyRopeDescription(result);
      testEnv.examineCommandHelper.verifyTreasureHints(result);
    });

    it('examine rope shows weight information', () => {
      const result = testEnv.examineCommandHelper.executeExamine('rope');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      // Rope is heavy (10 weight), might be mentioned in description
      testEnv.examineCommandHelper.verifyRopeWeight(result);
    });
  });

  describe('Examine Command Variations', () => {
    it('x command works as examine abbreviation', () => {
      const result = testEnv.examineCommandHelper.executeExamineShort('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyBrickDescription(result);
    });

    it('examine command without target fails', () => {
      const result = testEnv.examineCommandHelper.executeExamine('');
      
      testEnv.examineCommandHelper.verifyFailure(result);
      testEnv.examineCommandHelper.verifyMissingTarget(result);
    });

    it('examine nonexistent item fails', () => {
      const result = testEnv.examineCommandHelper.executeExamine('nonexistent');
      
      testEnv.examineCommandHelper.verifyFailure(result);
      testEnv.examineCommandHelper.verifyInvalidTarget(result, 'nonexistent');
    });

    it('examine item not in attic fails', () => {
      const result = testEnv.examineCommandHelper.executeExamine('table');
      
      testEnv.examineCommandHelper.verifyFailure(result);
      testEnv.examineCommandHelper.verifyInvalidTarget(result, 'table');
    });
  });

  describe('Multiple Item State Combinations', () => {
    it('examine items with mixed states works', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      // Examine brick
      let result = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifyBrickOpen(result);
      
      // Examine knife
      result = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifyKnifeOn(result);
      
      // Examine rope (unaffected)
      result = testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.verifyRopeDescription(result);
    });

    it('examine all items sequentially maintains state', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      testEnv.atticHelper.addToBrickContainer(['test_gem']);
      
      const initialMoves = testEnv.examineCommandHelper.getCurrentMoves();
      
      // Examine all items
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      // Verify state persistence
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
      
      // Verify no moves were counted
      expect(testEnv.examineCommandHelper.getCurrentMoves()).toBe(initialMoves);
    });
  });

  describe('Examine vs Look At Consistency', () => {
    it('examine and look at show consistent information for brick', () => {
      testEnv.atticHelper.setBrickOpen();
      
      const examineResult = testEnv.examineCommandHelper.executeExamine('brick');
      const lookAtResult = testEnv.lookCommandHelper.executeLookAt('brick');
      
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      testEnv.lookCommandHelper.verifySuccess(lookAtResult);
      
      // Both should show the item as a container
      testEnv.examineCommandHelper.verifyBrickDescription(examineResult);
      testEnv.lookCommandHelper.verifyItemDescription(lookAtResult, 'brick');
    });

    it('examine and look at show consistent information for rope', () => {
      const examineResult = testEnv.examineCommandHelper.executeExamine('rope');
      const lookAtResult = testEnv.lookCommandHelper.executeLookAt('rope');
      
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      testEnv.lookCommandHelper.verifySuccess(lookAtResult);
      
      // Both should show rope details
      testEnv.examineCommandHelper.verifyRopeDescription(examineResult);
      testEnv.lookCommandHelper.verifyItemDescription(lookAtResult, 'rope');
    });

    it('examine and look at show consistent information for knife', () => {
      testEnv.atticHelper.setKnifeOn();
      
      const examineResult = testEnv.examineCommandHelper.executeExamine('knife');
      const lookAtResult = testEnv.lookCommandHelper.executeLookAt('knife');
      
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      testEnv.lookCommandHelper.verifySuccess(lookAtResult);
      
      // Both should show knife details
      testEnv.examineCommandHelper.verifyKnifeDescription(examineResult);
      testEnv.lookCommandHelper.verifyItemDescription(lookAtResult, 'knife');
    });
  });

  describe('Examine Command Context Sensitivity', () => {
    it('examine provides more detail than look at', () => {
      const examineResult = testEnv.examineCommandHelper.executeExamine('brick');
      const lookAtResult = testEnv.lookCommandHelper.executeLookAt('brick');
      
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      testEnv.lookCommandHelper.verifySuccess(lookAtResult);
      
      // Examine should provide more detailed information
      expect(examineResult.message.length).toBeGreaterThanOrEqual(lookAtResult.message.length);
    });

    it('examine shows technical details for container', () => {
      testEnv.atticHelper.setBrickOpen();
      
      const result = testEnv.examineCommandHelper.executeExamine('brick');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyContainerDetails(result);
    });

    it('examine shows technical details for weapon', () => {
      testEnv.atticHelper.setKnifeOn();
      
      const result = testEnv.examineCommandHelper.executeExamine('knife');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyWeaponDetails(result);
    });

    it('examine shows technical details for treasure', () => {
      const result = testEnv.examineCommandHelper.executeExamine('rope');
      
      testEnv.examineCommandHelper.verifySuccess(result);
      testEnv.examineCommandHelper.verifyTreasureDetails(result);
    });
  });

  describe('Game State Tracking', () => {
    it('examine command does not count as move', () => {
      const initialMoves = testEnv.examineCommandHelper.getCurrentMoves();
      
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      expect(testEnv.examineCommandHelper.getCurrentMoves()).toBe(initialMoves);
    });

    it('examine command does not change score', () => {
      const initialScore = testEnv.examineCommandHelper.getCurrentScore();
      
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      expect(testEnv.examineCommandHelper.getCurrentScore()).toBe(initialScore);
    });

    it('examine command does not affect item locations', () => {
      const initialItems = testEnv.atticHelper.getSceneItems();
      
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      const finalItems = testEnv.atticHelper.getSceneItems();
      expect(finalItems).toEqual(initialItems);
    });
  });
});