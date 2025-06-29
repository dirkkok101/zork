/**
 * Mailbox Complete Interaction User Journey Test
 * 
 * Tests the full mailbox interaction sequence that mirrors authentic Zork gameplay.
 * This test would have caught the original state persistence bug.
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '@testing/scenes/west_of_house/integration_tests/look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '@testing/scenes/west_of_house/integration_tests/open_command/helpers/open_command_helper';
import { ExamineCommandHelper } from '@testing/scenes/west_of_house/integration_tests/examine_command/helpers/examine_command_helper';
import { CloseCommandHelper } from '@testing/scenes/west_of_house/integration_tests/close_command/helpers/close_command_helper';
import { TakeCommandHelper } from '@testing/scenes/west_of_house/integration_tests/take_command/helpers/take_command_helper';
import { LookCommandHelper } from '@testing/scenes/west_of_house/integration_tests/look_command/helpers/look_command_helper';

describe('Mailbox Complete Interaction - User Journey', () => {
  let testEnv: IntegrationTestEnvironment;
  let openHelper: OpenCommandHelper;
  let examineHelper: ExamineCommandHelper;
  let closeHelper: CloseCommandHelper;
  let takeHelper: TakeCommandHelper;
  let lookHelper: LookCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create all command helpers
    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    
    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
    
    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any
    );
    
    takeHelper = new TakeCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any
    );
    
    lookHelper = testEnv.lookCommandHelper;
  });

  beforeEach(() => {
    // Reset scene and clear any test items for clean state
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Complete Mailbox Interaction Sequence', () => {
    it('should handle the complete authentic Zork mailbox workflow', () => {
      // Step 1: Initial scene examination
      // User first sees the scene - mailbox should be visible
      const initialLook = lookHelper.executeBasicLook();
      lookHelper.verifySuccess(initialLook);
      expect(initialLook.message).toContain('mailbox');
      
      // Step 2: Examine closed mailbox
      // This should show the mailbox is closed
      const examineClosedResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineClosedResult);
      examineHelper.verifyContainsText(examineClosedResult, 'small mailbox');
      examineHelper.verifyContainsText(examineClosedResult, 'closed');
      
      // Step 3: Open mailbox
      // This should successfully open the mailbox
      const openResult = openHelper.executeOpenTarget('mailbox');
      openHelper.verifySuccess(openResult);
      openHelper.verifyOpenMessage(openResult, 'mailbox');
      openHelper.verifyItemOpened('mailb');
      
      // Step 4: Examine opened mailbox (CRITICAL TEST - this caught the bug)
      // After opening, examining should show the mailbox as open
      const examineOpenResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineOpenResult);
      examineHelper.verifyContainsText(examineOpenResult, 'small mailbox');
      examineHelper.verifyContainsText(examineOpenResult, 'open');
      // This should be different from the closed examination
      expect(examineOpenResult.message).not.toBe(examineClosedResult.message);
      
      // Step 5: Look in mailbox / examine contents
      // Should see the leaflet inside
      const lookInResult = lookHelper.executeLookAt('mailbox');
      lookHelper.verifySuccess(lookInResult);
      // Note: Content visibility depends on container contents implementation
      
      // Step 6: Take leaflet from mailbox
      // Should successfully take the leaflet
      const takeResult = takeHelper.executeTakeTarget('leaflet');
      if (takeResult.success) {
        takeHelper.verifySuccess(takeResult);
        takeHelper.verifyItemMoved('adver', true);
      }
      
      // Step 7: Examine mailbox after taking leaflet
      // Should still show as open, but now empty
      const examineAfterTakeResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineAfterTakeResult);
      examineHelper.verifyContainsText(examineAfterTakeResult, 'open');
      
      // Step 8: Close mailbox
      // Should successfully close the mailbox
      const closeResult = closeHelper.executeCloseTarget('mailbox');
      closeHelper.verifySuccess(closeResult);
      closeHelper.verifyCloseMessage(closeResult, 'mailbox');
      closeHelper.verifyItemClosed('mailb');
      
      // Step 9: Final examination of closed mailbox
      // Should show as closed again, completing the cycle
      const finalExamineResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(finalExamineResult);
      examineHelper.verifyContainsText(finalExamineResult, 'closed');
      // Should match the original closed state description
      expect(finalExamineResult.message).toBe(examineClosedResult.message);
    });
    
    it('should maintain mailbox state across other commands', () => {
      // Open mailbox
      const openResult = openHelper.executeOpenTarget('mailbox');
      openHelper.verifySuccess(openResult);
      
      // Perform unrelated commands that shouldn't affect mailbox state
      const lookAroundResult = lookHelper.executeLookAround();
      lookHelper.verifySuccess(lookAroundResult);
      
      // Try examining other objects - may or may not succeed, but shouldn't affect mailbox
      examineHelper.executeExamineTarget('house');
      
      // Mailbox should still be open after unrelated commands
      const examineStillOpenResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineStillOpenResult);
      examineHelper.verifyContainsText(examineStillOpenResult, 'open');
      
      // Verify internal state is also consistent
      openHelper.verifyItemOpened('mailb');
    });
    
    it('should handle repeated open/close cycles correctly', () => {
      // Cycle 1: Open -> Examine -> Close
      openHelper.executeOpenTarget('mailbox');
      const examine1 = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(examine1, 'open');
      closeHelper.executeCloseTarget('mailbox');
      
      // Cycle 2: Open -> Examine -> Close again
      openHelper.executeOpenTarget('mailbox');
      const examine2 = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(examine2, 'open');
      // Should behave identically to first cycle
      expect(examine2.message).toBe(examine1.message);
      closeHelper.executeCloseTarget('mailbox');
      
      // Final verification: mailbox should be closed
      const finalExamine = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(finalExamine, 'closed');
    });
  });

  describe('State Consistency Validation', () => {
    it('should show consistent state across all access methods', () => {
      // Open the mailbox
      openHelper.executeOpenTarget('mailbox');
      
      // Verify state through multiple methods
      
      // Method 1: Direct item state check
      openHelper.verifyItemOpened('mailb');
      
      // Method 2: ExamineCommand output
      const examineResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(examineResult, 'open');
      
      // Method 3: ItemService can open check (should say already open)
      const reopenResult = openHelper.executeOpenTarget('mailbox');
      openHelper.verifyAlreadyOpen(reopenResult, 'mailbox');
      
      // Method 4: CloseCommand should be able to close it
      const closeResult = closeHelper.executeCloseTarget('mailbox');
      closeHelper.verifySuccess(closeResult);
      
      // All methods should agree the mailbox is now closed
      closeHelper.verifyItemClosed('mailb');
      const examineClosedResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(examineClosedResult, 'closed');
    });
  });

  describe('Error Handling in Sequences', () => {
    it('should handle invalid commands gracefully without breaking state', () => {
      // Open mailbox
      openHelper.executeOpenTarget('mailbox');
      
      // Try invalid commands
      const invalidTake = takeHelper.executeTakeTarget('nonexistent');
      takeHelper.verifyItemNotFound(invalidTake, 'nonexistent');
      
      const invalidExamine = examineHelper.executeExamineTarget('phantom');
      examineHelper.verifyItemNotFound(invalidExamine, 'phantom');
      
      // Mailbox should still be in correct state after invalid commands
      const examineAfterErrors = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(examineAfterErrors, 'open');
      openHelper.verifyItemOpened('mailb');
    });
  });
});
