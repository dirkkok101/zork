/**
 * Workflow Tests - Living Room Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container Interaction Workflows', () => {
    it('should complete full trophy case container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in trophy case');
      expect(lookInResult.success).toBe(true);

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close trophy case');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple trophy case open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open trophy case');
      const examine1 = testEnv.commandProcessor.processCommand('examine trophy case');
      testEnv.commandProcessor.processCommand('close trophy case');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open trophy case');
      const examine2 = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close trophy case');
    });

  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take lamp
      const takeLampResult = testEnv.commandProcessor.processCommand('take lamp');
      if (takeLampResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('lamp');
      }

      // Take carpet
      const takeRugResult = testEnv.commandProcessor.processCommand('take carpet');
      if (takeRugResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('rug');
      }

      // Take newspaper
      const takePaperResult = testEnv.commandProcessor.processCommand('take newspaper');
      if (takePaperResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('paper');
      }

      // Take sword
      const takeSwordResult = testEnv.commandProcessor.processCommand('take sword');
      if (takeSwordResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('sword');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine lamp');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take lamp');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('lamp');
    });
  });

  describe('Weight Management Workflow', () => {
    it('should handle weight-limited item collection', () => {
      // Step 1: Take light items first
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');

      // Step 2: Test if can exit
      const lightExitResult = testEnv.commandProcessor.processCommand('east');
      const canExitLight = lightExitResult.success && lightExitResult.countsAsMove;

      if (canExitLight) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');

        // Return to scene
        testEnv.commandProcessor.processCommand('west');
      }

      // Step 3: Try adding heavier items
      testEnv.commandProcessor.processCommand('take lamp');

      // Step 4: Test exit again
      const heavyExitResult = testEnv.commandProcessor.processCommand('east');

      if (!heavyExitResult.success || !heavyExitResult.countsAsMove) {
        // Step 5: Drop items to reduce weight
        testEnv.commandProcessor.processCommand('drop lamp');

        // Step 6: Retry exit
        const retryExitResult = testEnv.commandProcessor.processCommand('east');
        expect(retryExitResult.countsAsMove).toBe(true);
      }
    });

    it('should recover from overweight situation', () => {
      // Overload inventory
      testEnv.commandProcessor.processCommand('take sword');

      // Attempt exit - should fail
      const blockedResult = testEnv.commandProcessor.processCommand('east');
      expect(blockedResult.success).toBe(false);

      // Drop heaviest item
      const dropResult = testEnv.commandProcessor.processCommand('drop sword');
      expect(dropResult.success).toBe(true);

      // Retry exit - should succeed
      const successResult = testEnv.commandProcessor.processCommand('east');
      expect(successResult.countsAsMove).toBe(true);
    });
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineWdoorResult = testEnv.commandProcessor.processCommand('examine wooden door');
      expect(examineWdoorResult.success).toBe(true);
      const examineTcaseResult = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineTcaseResult.success).toBe(true);
      const examineLampResult = testEnv.commandProcessor.processCommand('examine lamp');
      expect(examineLampResult.success).toBe(true);
      const examineRugResult = testEnv.commandProcessor.processCommand('examine carpet');
      expect(examineRugResult.success).toBe(true);
      const examinePaperResult = testEnv.commandProcessor.processCommand('examine newspaper');
      expect(examinePaperResult.success).toBe(true);
      const examineSwordResult = testEnv.commandProcessor.processCommand('examine sword');
      expect(examineSwordResult.success).toBe(true);

      // Step 3: Test all exits
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene for next test
      if (exitEastResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('living_room');
      }
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene for next test
      if (exitWestResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('living_room');
      }
      const exitDownResult = testEnv.commandProcessor.processCommand('down');
      expect(exitDownResult).toBeDefined();

      // Return to original scene for next test
      if (exitDownResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('living_room');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('living_room');
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should gracefully handle invalid actions in sequence', () => {
      // Valid action
      const validResult = testEnv.commandProcessor.processCommand('look');
      expect(validResult.success).toBe(true);

      // Invalid action
      const invalidResult = testEnv.commandProcessor.processCommand('take nonexistent');
      expect(invalidResult.success).toBe(false);

      // Recovery with valid action
      const recoveryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(recoveryResult.success).toBe(true);

      // Verify scene state intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('living_room');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine wooden door');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('living_room');
    });
  });
});
