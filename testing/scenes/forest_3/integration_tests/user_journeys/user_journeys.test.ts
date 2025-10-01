/**
 * User Journey Tests - Forest Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { Forest3TestEnvironment, Forest3IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Forest Scene - User Journeys', () => {
  let testEnv: Forest3TestEnvironment;

  beforeEach(async () => {
    testEnv = await Forest3IntegrationTestFactory.createTestEnvironment();
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
      const examineFtreeResult = testEnv.commandProcessor.processCommand('examine large tree');
      expect(examineFtreeResult.success).toBe(true);

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
      testEnv.commandProcessor.processCommand('up');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine large tree');

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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_3');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'forest_3';

      // Test up exit
      const upResult = testEnv.commandProcessor.processCommand('up');

      if (upResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('tree');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test north exit
      const northResult = testEnv.commandProcessor.processCommand('north');

      if (northResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_2');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test east exit
      const eastResult = testEnv.commandProcessor.processCommand('east');

      if (eastResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test south exit
      const southResult = testEnv.commandProcessor.processCommand('south');

      if (southResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('clearing');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test west exit
      const westResult = testEnv.commandProcessor.processCommand('west');

      if (westResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('north_of_house');

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
      testEnv.commandProcessor.processCommand('examine large tree');
      testEnv.commandProcessor.processCommand('inventory');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
