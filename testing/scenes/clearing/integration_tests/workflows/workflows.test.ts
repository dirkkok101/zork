/**
 * Workflow Tests - Clearing Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take pile of leaves
      const takeLeaveResult = testEnv.commandProcessor.processCommand('take pile of leaves');
      if (takeLeaveResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('leave');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine pile of leaves');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take pile of leaves');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('leave');
    });
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineGrateResult = testEnv.commandProcessor.processCommand('examine grating');
      expect(examineGrateResult.success).toBe(true);
      const examineLeaveResult = testEnv.commandProcessor.processCommand('examine pile of leaves');
      expect(examineLeaveResult.success).toBe(true);

      // Step 3: Test all exits
      const exitSouthwestResult = testEnv.commandProcessor.processCommand('southwest');
      expect(exitSouthwestResult).toBeDefined();

      // Return to original scene
      if (exitSouthwestResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('northeast');
      }
      const exitSoutheastResult = testEnv.commandProcessor.processCommand('southeast');
      expect(exitSoutheastResult).toBeDefined();

      // Return to original scene
      if (exitSoutheastResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('northwest');
      }
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene
      if (exitWestResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('east');
      }
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene
      if (exitSouthResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('north');
      }
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene
      if (exitNorthResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('south');
      }
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene
      if (exitEastResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('west');
      }
      const exitDownResult = testEnv.commandProcessor.processCommand('down');
      expect(exitDownResult).toBeDefined();

      // Return to original scene
      if (exitDownResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('up');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine grating');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');
    });
  });
});
