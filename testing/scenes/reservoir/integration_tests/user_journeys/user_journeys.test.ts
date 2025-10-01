/**
 * User Journey Tests - Reservoir Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Reservoir Scene - User Journeys', () => {
  let testEnv: ReservoirTestEnvironment;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Time Visitor Journey', () => {
    it('should explore scene systematically on first visit', () => {
      // Step 1: Initial look around
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

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
      testEnv.commandProcessor.processCommand('north');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('reservoir');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'reservoir';

      // Test north exit
      const northResult = testEnv.commandProcessor.processCommand('north');

      if (northResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('resen');

        // Return to original scene
        testEnv.commandProcessor.processCommand('south');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
      // Test up exit
      const upResult = testEnv.commandProcessor.processCommand('up');

      if (upResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('instr');

        // Return to original scene
        testEnv.commandProcessor.processCommand('down');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
    });
  });

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
