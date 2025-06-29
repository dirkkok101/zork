/**
 * Container Output Consistency Tests
 * 
 * Validates that user-visible output is consistent across all commands
 * when container states change. This type of test would catch bugs where
 * internal state is correct but user-visible output is wrong.
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { OpenCommandHelper } from '../open_command/helpers/open_command_helper';
import { ExamineCommandHelper } from '../examine_command/helpers/examine_command_helper';
import { CloseCommandHelper } from '../close_command/helpers/close_command_helper';
import { LookCommandHelper } from '../look_command/helpers/look_command_helper';

describe('Container Output Consistency - State Validation', () => {
  let testEnv: IntegrationTestEnvironment;
  let openHelper: OpenCommandHelper;
  let examineHelper: ExamineCommandHelper;
  let closeHelper: CloseCommandHelper;
  let lookHelper: LookCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
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
    
    lookHelper = testEnv.lookCommandHelper;
  });

  beforeEach(() => {
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Mailbox State Output Consistency', () => {
    it('should show consistent "closed" state across all commands initially', () => {
      // Test that all commands agree mailbox is closed initially
      
      // 1. Examine should show closed
      const examineResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineResult);
      examineHelper.verifyContainsText(examineResult, 'closed');
      expect(examineResult.message).toMatch(/mailbox.*closed/i);
      
      // 2. Look at mailbox should show closed state if implemented
      const lookAtResult = lookHelper.executeLookAt('mailbox');
      if (lookAtResult.success) {
        // If look at is implemented, it should also show closed state
        expect(lookAtResult.message).toMatch(/mailbox/i);
      }
      
      // 3. Attempting to close should say already closed
      const closeClosedResult = closeHelper.executeCloseTarget('mailbox');
      closeHelper.verifyAlreadyClosed(closeClosedResult, 'mailbox');
      
      // 4. Internal state should match user-visible state
      closeHelper.verifyItemClosed('mailb');
    });
    
    it('should show consistent "open" state across all commands after opening', () => {
      // Open the mailbox first
      const openResult = openHelper.executeOpenTarget('mailbox');
      openHelper.verifySuccess(openResult);
      
      // Test that all commands now agree mailbox is open
      
      // 1. Examine should show open
      const examineResult = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifySuccess(examineResult);
      examineHelper.verifyContainsText(examineResult, 'open');
      expect(examineResult.message).toMatch(/mailbox.*open/i);
      expect(examineResult.message).not.toMatch(/closed/i);
      
      // 2. Look at mailbox should show open state if implemented
      const lookAtResult = lookHelper.executeLookAt('mailbox');
      if (lookAtResult.success) {
        expect(lookAtResult.message).toMatch(/mailbox/i);
        // Should not say closed
        expect(lookAtResult.message).not.toMatch(/closed/i);
      }
      
      // 3. Attempting to open again should say already open
      const reopenResult = openHelper.executeOpenTarget('mailbox');
      openHelper.verifyAlreadyOpen(reopenResult, 'mailbox');
      
      // 4. Should be able to close it (proving it's open)
      const closeResult = closeHelper.executeCloseTarget('mailbox');
      closeHelper.verifySuccess(closeResult);
      
      // 5. Internal state should match user-visible state throughout
      // (Note: After close, should be closed again)
      closeHelper.verifyItemClosed('mailb');
    });
    
    it('should never show contradictory state information', () => {
      // Test that no command ever shows contradictory information
      
      // Start closed
      let examineResult = examineHelper.executeExamineTarget('mailbox');
      const closedMessage = examineResult.message;
      
      // Should not contain both "open" and "closed"
      const hasOpen = /open/i.test(closedMessage);
      const hasClosed = /closed/i.test(closedMessage);
      
      if (hasOpen && hasClosed) {
        // If both words appear, make sure they're not contradictory
        // e.g., "the mailbox is closed" vs "the mailbox is open and closed"
        expect(closedMessage).not.toMatch(/open.*and.*closed|closed.*and.*open/i);
      }
      
      // Open it
      openHelper.executeOpenTarget('mailbox');
      
      // Check opened state
      examineResult = examineHelper.executeExamineTarget('mailbox');
      const openMessage = examineResult.message;
      
      // Should clearly indicate open state
      expect(openMessage).toMatch(/open/i);
      expect(openMessage).not.toMatch(/(?<!not )closed/i); // Should not say "closed" (but "not closed" would be OK)
      
      // Should be different from closed message
      expect(openMessage).not.toBe(closedMessage);
    });
    
    it('should maintain output consistency through state transitions', () => {
      const stateHistory: Array<{action: string, examineOutput: string, internalState: boolean}> = [];
      
      // Record initial state
      let examineResult = examineHelper.executeExamineTarget('mailbox');
      stateHistory.push({
        action: 'initial',
        examineOutput: examineResult.message,
        internalState: false // starts closed
      });
      
      // Open and record
      openHelper.executeOpenTarget('mailbox');
      examineResult = examineHelper.executeExamineTarget('mailbox');
      stateHistory.push({
        action: 'open',
        examineOutput: examineResult.message,
        internalState: true // now open
      });
      
      // Close and record
      closeHelper.executeCloseTarget('mailbox');
      examineResult = examineHelper.executeExamineTarget('mailbox');
      stateHistory.push({
        action: 'close',
        examineOutput: examineResult.message,
        internalState: false // now closed again
      });
      
      // Open again and record
      openHelper.executeOpenTarget('mailbox');
      examineResult = examineHelper.executeExamineTarget('mailbox');
      stateHistory.push({
        action: 'reopen',
        examineOutput: examineResult.message,
        internalState: true // open again
      });
      
      // Verify consistency patterns:
      
      // 1. All "closed" states should have similar output
      const closedStates = stateHistory.filter(s => !s.internalState);
      if (closedStates.length > 1) {
        const firstClosed = closedStates[0]?.examineOutput;
        expect(firstClosed).toBeDefined();
        closedStates.forEach(state => {
          expect(state.examineOutput).toBe(firstClosed);
        });
      }
      
      // 2. All "open" states should have similar output
      const openStates = stateHistory.filter(s => s.internalState);
      if (openStates.length > 1) {
        const firstOpen = openStates[0]?.examineOutput;
        expect(firstOpen).toBeDefined();
        openStates.forEach(state => {
          expect(state.examineOutput).toBe(firstOpen);
        });
      }
      
      // 3. Open and closed outputs should be different
      if (openStates.length > 0 && closedStates.length > 0) {
        const openOutput = openStates[0]?.examineOutput;
        const closedOutput = closedStates[0]?.examineOutput;
        expect(openOutput).toBeDefined();
        expect(closedOutput).toBeDefined();
        expect(openOutput).not.toBe(closedOutput);
      }
    });
  });

  describe('Error State Consistency', () => {
    it('should show consistent error messages for invalid operations', () => {
      // Test trying to close already closed mailbox
      const closeClosedResult1 = closeHelper.executeCloseTarget('mailbox');
      const closeClosedResult2 = closeHelper.executeCloseTarget('mailbox');
      
      // Both should fail with same message
      closeHelper.verifyAlreadyClosed(closeClosedResult1, 'mailbox');
      closeHelper.verifyAlreadyClosed(closeClosedResult2, 'mailbox');
      expect(closeClosedResult1.message).toBe(closeClosedResult2.message);
      
      // Open mailbox
      openHelper.executeOpenTarget('mailbox');
      
      // Test trying to open already open mailbox
      const openOpenResult1 = openHelper.executeOpenTarget('mailbox');
      const openOpenResult2 = openHelper.executeOpenTarget('mailbox');
      
      // Both should fail with same message
      openHelper.verifyAlreadyOpen(openOpenResult1, 'mailbox');
      openHelper.verifyAlreadyOpen(openOpenResult2, 'mailbox');
      expect(openOpenResult1.message).toBe(openOpenResult2.message);
    });
  });

  describe('Multi-Container State Independence', () => {
    it('should maintain independent states for different containers', () => {
      // This test would be expanded when we have multiple containers
      // For now, just verify mailbox state doesn't affect other items
      
      // Open mailbox
      openHelper.executeOpenTarget('mailbox');
      
      // Examine other items - they should not be affected
      const doorResult = examineHelper.executeExamineTarget('door');
      if (doorResult.success) {
        // Door examination should be unaffected by mailbox state
        expect(doorResult.message).not.toMatch(/open|closed/i);
      }
      
      // Examine welcome mat
      const matResult = examineHelper.executeExamineTarget('welcome mat');
      if (matResult.success) {
        // Mat examination should be unaffected by mailbox state
        expect(matResult.message).not.toMatch(/mailbox/i);
      }
      
      // Mailbox should still be open
      const mailboxStillOpen = examineHelper.executeExamineTarget('mailbox');
      examineHelper.verifyContainsText(mailboxStillOpen, 'open');
    });
  });
});