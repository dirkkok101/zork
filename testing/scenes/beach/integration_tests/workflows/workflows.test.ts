/**
 * Workflow Tests - Sandy Beach Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Sandy Beach Scene', () => {
  let testEnv: BeachTestEnvironment;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineSandResult = testEnv.commandProcessor.processCommand('examine sandy beach');
      expect(examineSandResult.success).toBe(true);

      // Step 3: Test all exits
      const exitLauncResult = testEnv.commandProcessor.processCommand('launc');
      expect(exitLauncResult).toBeDefined();

      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene
      if (exitSouthResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('north');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('beach');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('beach');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine sandy beach');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('beach');
    });
  });
});
