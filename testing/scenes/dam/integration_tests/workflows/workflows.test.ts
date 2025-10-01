/**
 * Workflow Tests - Dam Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { DamTestEnvironment, DamIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Dam Scene', () => {
  let testEnv: DamTestEnvironment;

  beforeEach(async () => {
    testEnv = await DamIntegrationTestFactory.createTestEnvironment();
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
      const examineBoltResult = testEnv.commandProcessor.processCommand('examine bolt');
      expect(examineBoltResult.success).toBe(true);
      const examineDamResult = testEnv.commandProcessor.processCommand('examine dam');
      expect(examineDamResult.success).toBe(true);
      const examineBubblResult = testEnv.commandProcessor.processCommand('examine green bubble');
      expect(examineBubblResult.success).toBe(true);
      const examineCpanlResult = testEnv.commandProcessor.processCommand('examine control panel');
      expect(examineCpanlResult.success).toBe(true);

      // Step 3: Test all exits
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene
      if (exitSouthResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('north');
      }
      const exitDownResult = testEnv.commandProcessor.processCommand('down');
      expect(exitDownResult).toBeDefined();

      // Return to original scene
      if (exitDownResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('up');
      }
      const exitEastResult = testEnv.commandProcessor.processCommand('east');
      expect(exitEastResult).toBeDefined();

      // Return to original scene
      if (exitEastResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('west');
      }
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene
      if (exitNorthResult.countsAsMove) {
        testEnv.commandProcessor.processCommand('south');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('dam');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('dam');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine bolt');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('dam');
    });
  });
});
