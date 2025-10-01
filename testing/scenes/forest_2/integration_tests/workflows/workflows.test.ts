/**
 * Workflow Tests - Forest Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { Forest2TestEnvironment, Forest2IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Forest Scene', () => {
  let testEnv: Forest2TestEnvironment;

  beforeEach(async () => {
    testEnv = await Forest2IntegrationTestFactory.createTestEnvironment();
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

      // Step 3: Test all exits
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene for next test
      if (exitNorthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_2');
      }
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene for next test
      if (exitEastResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_2');
      }
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene for next test
      if (exitSouthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_2');
      }
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene for next test
      if (exitWestResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_2');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_2');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_2');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_2');
    });
  });
});
