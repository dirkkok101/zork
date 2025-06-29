/**
 * Kitchen Entry Workflow Integration Tests - Behind House Scene
 * Tests complete user journey for accessing kitchen via window
 */

import '../look_command/setup';
import { BehindHouseIntegrationTestFactory, BehindHouseTestEnvironment } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '../move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '../open_command/helpers/open_command_helper';
import { CloseCommandHelper } from '../close_command/helpers/close_command_helper';
import { ExamineCommandHelper } from '../examine_command/helpers/examine_command_helper';

describe('Kitchen Entry Workflow - User Journey', () => {
  let testEnv: BehindHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;
  let openHelper: OpenCommandHelper;
  let closeHelper: CloseCommandHelper;
  let examineHelper: ExamineCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();
    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
    openHelper = new OpenCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    closeHelper = new CloseCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any
    );
    examineHelper = new ExamineCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.items as any,
      testEnv.services.inventory as any
    );
    
    // Ensure we start in behind_house with clean state
    testEnv.behindHouseHelper.resetScene();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Discovery and Exploration Workflow', () => {
    it('should complete new player discovery sequence', async () => {
      // 1. Player arrives at behind house scene
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // 2. Player looks around to understand the area
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifySceneDescription(lookResult);
      testEnv.lookCommandHelper.verifyWindowVisible(lookResult);
      
      // 3. Player examines the window
      const examineResult = examineHelper.executeExamineWindow();
      examineHelper.verifyWindowExamination(examineResult);
      examineHelper.verifyWindowState(examineResult, false); // Should start closed
      
      // 4. Player tries to go west (should fail)
      const moveFailResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(moveFailResult);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // 5. Player realizes they need to open the window
      const openResult = openHelper.executeOpenWindow();
      openHelper.verifyWindowOpenMessage(openResult);
      
      // 6. Player looks around again to see changes
      const lookAfterOpenResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowExitDescription(lookAfterOpenResult);
      
      // 7. Player successfully enters kitchen
      const enterKitchenResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(enterKitchenResult);
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should support player returning via window', async () => {
      // Complete entry workflow first
      openHelper.executeOpenWindow();
      moveHelper.executeMoveWest();
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
      
      // Return to behind_house
      const returnResult = moveHelper.executeMoveDirection('east');
      moveHelper.verifyMovementSuccess(returnResult, 'behind_house');
      
      // Verify window remains open
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      // Can re-enter kitchen
      const reenterResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(reenterResult);
    });
  });

  describe('Complete Window Interaction Workflow', () => {
    it('should support full examine → open → enter → return → close sequence', async () => {
      let initialMoves = moveHelper.getCurrentMoves();
      
      // 1. Examine window (closed state)
      const examineClosedResult = examineHelper.executeExamineWindow();
      examineHelper.verifyWindowState(examineClosedResult, false);
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves); // Examine doesn't count as move
      
      // 2. Open window
      const openResult = openHelper.executeOpenWindow();
      openHelper.verifySuccess(openResult);
      initialMoves = moveHelper.getCurrentMoves(); // Update count after open command
      
      // 3. Examine window (open state)
      const examineOpenResult = examineHelper.executeExamineWindow();
      examineHelper.verifyWindowState(examineOpenResult, true);
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves); // Examine doesn't count as move
      
      // 4. Enter kitchen via west
      const enterWestResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(enterWestResult);
      initialMoves++;
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves);
      
      // 5. Return to behind_house
      const returnResult = moveHelper.executeMoveDirection('east');
      moveHelper.verifyMovementSuccess(returnResult, 'behind_house');
      initialMoves++;
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves);
      
      // 6. Try entering via "in" direction
      const enterInResult = moveHelper.executeMoveIn();
      moveHelper.verifyKitchenAccess(enterInResult);
      initialMoves++;
      
      // 7. Return again
      moveHelper.setCurrentScene('behind_house');
      
      // 8. Close window
      const closeResult = closeHelper.executeCloseWindow();
      closeHelper.verifySuccess(closeResult);
      initialMoves++;
      expect(moveHelper.getCurrentMoves()).toBe(initialMoves);
      
      // 9. Verify access is now blocked
      const blockedResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(blockedResult);
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should track all state changes during workflow', async () => {
      const gameState = testEnv.services.gameState;
      
      // Track initial state
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      expect(gameState.hasVisitedScene('kitchen')).toBe(false);
      
      // Open and enter
      openHelper.executeOpenWindow();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      moveHelper.executeMoveWest();
      expect(gameState.getCurrentScene()).toBe('kitchen');
      expect(gameState.hasVisitedScene('kitchen')).toBe(true);
      
      // Return and close
      moveHelper.executeMoveDirection('east');
      expect(gameState.getCurrentScene()).toBe('behind_house');
      
      closeHelper.executeCloseWindow();
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      // Kitchen should remain visited
      expect(gameState.hasVisitedScene('kitchen')).toBe(true);
    });
  });

  describe('Alternative Discovery Workflows', () => {
    it('should support trying movement first, then discovering window', async () => {
      // 1. Player tries to go west immediately (fails)
      const firstAttemptResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(firstAttemptResult);
      
      // 2. Player looks around to understand why it failed
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyWindowVisible(lookResult);
      
      // 3. Player examines the window
      const examineResult = examineHelper.executeExamineWindow();
      examineHelper.verifyWindowExamination(examineResult);
      
      // 4. Player opens window and succeeds
      openHelper.executeOpenWindow();
      const successResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(successResult);
    });

    it('should support examination-heavy exploration style', async () => {
      // Player who examines everything first
      const examineSceneResult = examineHelper.executeExamineScene();
      examineHelper.verifySceneExamination(examineSceneResult);
      
      const examineWindowResult = examineHelper.executeExamineWindow();
      examineHelper.verifyWindowExamination(examineWindowResult);
      
      const examineSelfResult = examineHelper.executeExamineTarget('me');
      examineHelper.verifySelfExamination(examineSelfResult, false);
      
      // Then proceeds with opening and movement
      openHelper.executeOpenWindow();
      const moveResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(moveResult);
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should support recovering from failed movement attempts', async () => {
      // Multiple failed attempts
      moveHelper.executeMoveWest();
      moveHelper.executeMoveIn();
      moveHelper.executeMoveWest();
      
      // Player stays in same location
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // Discovery and successful resolution
      openHelper.executeOpenWindow();
      const successResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(successResult);
    });

    it('should handle opening already open window gracefully', async () => {
      // Open window
      openHelper.executeOpenWindow();
      
      // Try to open again (should give helpful message)
      const redundantOpenResult = openHelper.executeOpenWindow();
      openHelper.verifyAlreadyOpen(redundantOpenResult);
      
      // Movement still works
      const moveResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(moveResult);
    });

    it('should handle closing already closed window gracefully', async () => {
      // Window starts closed
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
      
      // Try to close (should give helpful message)
      const redundantCloseResult = closeHelper.executeCloseWindow();
      closeHelper.verifyAlreadyClosed(redundantCloseResult);
      
      // Movement should still be blocked
      const moveResult = moveHelper.executeMoveWest();
      moveHelper.verifyWindowClosedFailure(moveResult);
    });
  });

  describe('Multi-Session Workflow Simulation', () => {
    it('should support player leaving and returning to scene', async () => {
      // Player opens window and leaves scene
      openHelper.executeOpenWindow();
      moveHelper.executeMoveNorth();
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
      
      // Player returns later
      moveHelper.executeMoveDirection('south');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      
      // Window should still be open
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      // Can still access kitchen
      const accessResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(accessResult);
    });

    it('should maintain window state across scene exploration', async () => {
      // Open window
      openHelper.executeOpenWindow();
      
      // Explore adjacent scenes
      moveHelper.executeMoveNorth();
      moveHelper.executeMoveDirection('west'); // To west_of_house
      moveHelper.executeMoveDirection('south'); // To south_of_house
      moveHelper.executeMoveDirection('east'); // Back to behind_house
      
      // Window should still be open
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(true);
      
      // Kitchen access should still work
      const accessResult = moveHelper.executeMoveWest();
      moveHelper.verifyKitchenAccess(accessResult);
    });
  });

  describe('Command Sequence Validation', () => {
    it('should validate typical player command sequences', async () => {
      const commands = [
        { cmd: 'look', expectSuccess: true },
        { cmd: 'examine windo', expectSuccess: true },
        { cmd: 'west', expectSuccess: false },
        { cmd: 'open windo', expectSuccess: true },
        { cmd: 'look', expectSuccess: true },
        { cmd: 'west', expectSuccess: true },
        { cmd: 'east', expectSuccess: true },
        { cmd: 'close windo', expectSuccess: true },
        { cmd: 'west', expectSuccess: false }
      ];
      
      for (const command of commands) {
        let result;
        
        if (command.cmd === 'look') {
          result = testEnv.lookCommandHelper.executeBasicLook();
        } else if (command.cmd.startsWith('examine')) {
          result = examineHelper.executeExamine(command.cmd);
        } else if (command.cmd.startsWith('open')) {
          result = openHelper.executeOpen(command.cmd);
        } else if (command.cmd.startsWith('close')) {
          result = closeHelper.executeClose(command.cmd);
        } else {
          result = moveHelper.executeMoveDirection(command.cmd);
        }
        
        if (command.expectSuccess) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      }
      
      // Final state verification
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
      expect(testEnv.behindHouseHelper.isWindowOpen()).toBe(false);
    });

    it('should handle rapid command sequences', async () => {
      // Rapid open/close/move sequences
      openHelper.executeOpenWindow();
      moveHelper.executeMoveWest();
      moveHelper.executeMoveDirection('east');
      closeHelper.executeCloseWindow();
      moveHelper.executeMoveWest(); // Should fail
      openHelper.executeOpenWindow();
      moveHelper.executeMoveWest(); // Should succeed
      
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });
  });
});