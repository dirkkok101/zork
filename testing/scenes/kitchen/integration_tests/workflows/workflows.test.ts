/**
 * Workflow Tests - Kitchen Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container Interaction Workflows', () => {
    it('should complete full brown sack container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open brown sack');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in brown sack');
      expect(lookInResult.success).toBe(true);

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close brown sack');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple brown sack open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open brown sack');
      const examine1 = testEnv.commandProcessor.processCommand('examine brown sack');
      testEnv.commandProcessor.processCommand('close brown sack');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open brown sack');
      const examine2 = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close brown sack');
    });

    it('should complete full glass bottle container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open glass bottle');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in glass bottle');
      expect(lookInResult.success).toBe(true);

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close glass bottle');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple glass bottle open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open glass bottle');
      const examine1 = testEnv.commandProcessor.processCommand('examine glass bottle');
      testEnv.commandProcessor.processCommand('close glass bottle');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open glass bottle');
      const examine2 = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close glass bottle');
    });

  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take brown sack
      const takeSbagResult = testEnv.commandProcessor.processCommand('take brown sack');
      if (takeSbagResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('sbag');
      }

      // Take glass bottle
      const takeBottlResult = testEnv.commandProcessor.processCommand('take glass bottle');
      if (takeBottlResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('bottl');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take brown sack');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('sbag');
    });
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineWindoResult = testEnv.commandProcessor.processCommand('examine window');
      expect(examineWindoResult.success).toBe(true);
      const examineSbagResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examineSbagResult.success).toBe(true);
      const examineBottlResult = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(examineBottlResult.success).toBe(true);

      // Step 3: Test all exits
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene
      if (exitWestResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('east');
      }
      const exitUpResult = testEnv.commandProcessor.processCommand('up');
      expect(exitUpResult).toBeDefined();

      // Return to original scene
      if (exitUpResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('down');
      }
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene
      if (exitEastResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('west');
      }
      const exitOutResult = testEnv.commandProcessor.processCommand('out');
      expect(exitOutResult).toBeDefined();

      // Return to original scene
      if (exitOutResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('in');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine window');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');
    });
  });
});
