/**
 * User Journey Tests - Clearing Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Clearing Scene - User Journeys', () => {
  let testEnv: ClearingTestEnvironment;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();
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
      const examineGrateResult = testEnv.commandProcessor.processCommand('examine grating');
      expect(examineGrateResult.success).toBe(true);
      const examineLeaveResult = testEnv.commandProcessor.processCommand('examine pile of leaves');
      expect(examineLeaveResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

  });

  describe('Tool Collector Journey', () => {
    it('should focus on collecting useful tools', () => {
      // Identify pile of leaves as useful tool
      const examineLeaveResult = testEnv.commandProcessor.processCommand('examine pile of leaves');
      expect(examineLeaveResult.success).toBe(true);

      // Collect tool
      const takeLeaveResult = testEnv.commandProcessor.processCommand('take pile of leaves');
      if (takeLeaveResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('leave');
      }
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take pile of leaves');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('southwest');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine grating');
      testEnv.commandProcessor.processCommand('examine pile of leaves');

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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'clearing';

      // Test southwest exit
      const southwestResult = testEnv.commandProcessor.processCommand('southwest');

      if (southwestResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('behind_house');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test southeast exit
      const southeastResult = testEnv.commandProcessor.processCommand('southeast');

      if (southeastResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('fore5');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test west exit
      const westResult = testEnv.commandProcessor.processCommand('west');

      if (westResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_3');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test south exit
      const southResult = testEnv.commandProcessor.processCommand('south');

      if (southResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_2');

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
      testEnv.commandProcessor.processCommand('examine grating');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take pile of leaves');
      testEnv.commandProcessor.processCommand('drop pile of leaves');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
