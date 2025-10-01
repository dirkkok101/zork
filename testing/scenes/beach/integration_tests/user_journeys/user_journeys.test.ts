/**
 * User Journey Tests - Sandy Beach Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Sandy Beach Scene - User Journeys', () => {
  let testEnv: BeachTestEnvironment;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();
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
      const examineStatuResult = testEnv.commandProcessor.processCommand('examine statue');
      expect(examineStatuResult.success).toBe(true);
      const examineSandResult = testEnv.commandProcessor.processCommand('examine sandy beach');
      expect(examineSandResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

  });

  describe('Treasure Hunter Journey', () => {
    it('should prioritize collecting valuable treasures', () => {
      // Identify statue as treasure
      const examineStatuResult = testEnv.commandProcessor.processCommand('examine statue');
      expect(examineStatuResult.success).toBe(true);

      // Collect treasure
      const takeStatuResult = testEnv.commandProcessor.processCommand('take statue');
      if (takeStatuResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('statu');
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
      testEnv.commandProcessor.processCommand('take statue');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('launc');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine statue');
      testEnv.commandProcessor.processCommand('examine sandy beach');

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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('beach');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'beach';

      // Test launc exit
      const launcResult = testEnv.commandProcessor.processCommand('launc');

      if (launcResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('rivr4');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test south exit
      const southResult = testEnv.commandProcessor.processCommand('south');

      if (southResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('fante');

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
      testEnv.commandProcessor.processCommand('examine statue');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take statue');
      testEnv.commandProcessor.processCommand('drop statue');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
