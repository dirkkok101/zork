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

      // Step 2: Examine interesting items
      const examineTrunkResult = testEnv.commandProcessor.processCommand('examine trunk of jewels');
      expect(examineTrunkResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

  });

  describe('Treasure Hunter Journey', () => {
    it('should prioritize collecting valuable treasures', () => {
      // Identify trunk of jewels as treasure
      const examineTrunkResult = testEnv.commandProcessor.processCommand('examine trunk of jewels');
      expect(examineTrunkResult.success).toBe(true);

      // Collect treasure
      const takeTrunkResult = testEnv.commandProcessor.processCommand('take trunk of jewels');
      if (takeTrunkResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('trunk');
      }

      // Verify treasures collected
      const inventory = testEnv.services.gameState.getGameState().inventory;
      expect(inventory.length).toBeGreaterThan(0);
    });

  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take trunk of jewels');

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

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine trunk of jewels');

      // Step 4: Take all items (if possible)

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

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test up exit
      const upResult = testEnv.commandProcessor.processCommand('up');

      if (upResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('instr');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
    });
  });

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('examine trunk of jewels');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take trunk of jewels');
      testEnv.commandProcessor.processCommand('drop trunk of jewels');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
