/**
 * Workflow Tests - Forest Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { Forest3TestEnvironment, Forest3IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Forest Scene', () => {
  let testEnv: Forest3TestEnvironment;

  beforeEach(async () => {
    testEnv = await Forest3IntegrationTestFactory.createTestEnvironment();
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
      const examineFtreeResult = testEnv.commandProcessor.processCommand('examine large tree');
      expect(examineFtreeResult.success).toBe(true);

      // Step 3: Test all exits
      const exitUpResult = testEnv.commandProcessor.processCommand('up');
      expect(exitUpResult).toBeDefined();

      // Return to original scene for next test
      if (exitUpResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_3');
      }
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene for next test
      if (exitNorthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_3');
      }
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene for next test
      if (exitEastResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_3');
      }
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene for next test
      if (exitSouthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_3');
      }
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene for next test
      if (exitWestResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('forest_3');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_3');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_3');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine large tree');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_3');
    });
  });
});
