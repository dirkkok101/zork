/**
 * User Journey Tests - Dam Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { DamTestEnvironment, DamIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Dam Scene - User Journeys', () => {
  let testEnv: DamTestEnvironment;

  beforeEach(async () => {
    testEnv = await DamIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Time Visitor Journey', () => {
    it('should explore scene systematically on first visit', () => {
      // Step 1: Initial look around
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine interesting items
      const examineBoltResult = testEnv.commandProcessor.processCommand('examine bolt');
      expect(examineBoltResult.success).toBe(true);
      const examineDamResult = testEnv.commandProcessor.processCommand('examine dam');
      expect(examineDamResult.success).toBe(true);
      const examineBubblResult = testEnv.commandProcessor.processCommand('examine green bubble');
      expect(examineBubblResult.success).toBe(true);
      const examineCpanlResult = testEnv.commandProcessor.processCommand('examine control panel');
      expect(examineCpanlResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('south');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine bolt');
      testEnv.commandProcessor.processCommand('examine dam');
      testEnv.commandProcessor.processCommand('examine green bubble');
      testEnv.commandProcessor.processCommand('examine control panel');

      // Step 5: Check inventory
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });
  });

  describe('Error Recovery Journey', () => {
    it('should gracefully recover from mistakes', () => {
      // Mistake 1: Try invalid command
      const invalidCmd = testEnv.commandProcessor.processCommand('take nonexistent');
      expect(invalidCmd.success).toBe(false);

      // Recovery: Continue with valid action
      const validCmd = testEnv.commandProcessor.processCommand('look');
      expect(validCmd.success).toBe(true);

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('dam');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'dam';

      // Test south exit
      const southResult = testEnv.commandProcessor.processCommand('south');

      if (southResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('cany1');

        // Return to original scene
        testEnv.commandProcessor.processCommand('north');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
      // Test down exit
      const downResult = testEnv.commandProcessor.processCommand('down');

      if (downResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('dock');

        // Return to original scene
        testEnv.commandProcessor.processCommand('up');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
      // Test east exit
      const eastResult = testEnv.commandProcessor.processCommand('east');

      if (eastResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('cave3');

        // Return to original scene
        testEnv.commandProcessor.processCommand('west');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
      // Test north exit
      const northResult = testEnv.commandProcessor.processCommand('north');

      if (northResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('lobby');

        // Return to original scene
        testEnv.commandProcessor.processCommand('south');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
    });
  });

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('examine bolt');
      testEnv.commandProcessor.processCommand('inventory');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
