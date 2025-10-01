/**
 * User Journey Tests - Kitchen Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - User Journeys', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
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
      const examineWindoResult = testEnv.commandProcessor.processCommand('examine window');
      expect(examineWindoResult.success).toBe(true);
      const examineSbagResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examineSbagResult.success).toBe(true);
      const examineBottlResult = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(examineBottlResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

    it('should discover and explore containers', () => {
      // Discover brown sack container
      const examineSbagResult = testEnv.commandProcessor.processCommand('examine brown sack');
      expect(examineSbagResult.success).toBe(true);

      // Open and investigate
      const openSbagResult = testEnv.commandProcessor.processCommand('open brown sack');
      if (openSbagResult.success) {
        const lookInSbagResult = testEnv.commandProcessor.processCommand('look in brown sack');
        expect(lookInSbagResult.success).toBe(true);
      }
      // Discover glass bottle container
      const examineBottlResult = testEnv.commandProcessor.processCommand('examine glass bottle');
      expect(examineBottlResult.success).toBe(true);

      // Open and investigate
      const openBottlResult = testEnv.commandProcessor.processCommand('open glass bottle');
      if (openBottlResult.success) {
        const lookInBottlResult = testEnv.commandProcessor.processCommand('look in glass bottle');
        expect(lookInBottlResult.success).toBe(true);
      }
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take brown sack');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('west');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine window');
      testEnv.commandProcessor.processCommand('examine brown sack');
      testEnv.commandProcessor.processCommand('examine glass bottle');

      // Step 3: Open all containers
      testEnv.commandProcessor.processCommand('open brown sack');
      testEnv.commandProcessor.processCommand('look in brown sack');
      testEnv.commandProcessor.processCommand('open glass bottle');
      testEnv.commandProcessor.processCommand('look in glass bottle');

      // Step 4: Take all items (if possible)
      testEnv.commandProcessor.processCommand('take brown sack');
      testEnv.commandProcessor.processCommand('take glass bottle');

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

      // Mistake 2: Try to take from closed container
      testEnv.commandProcessor.processCommand('take item from brown sack');

      // Recovery: Open container first
      testEnv.commandProcessor.processCommand('open brown sack');

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'kitchen';

      // Test west exit
      const westResult = testEnv.commandProcessor.processCommand('west');

      if (westResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('living_room');

        // Return to original scene
        testEnv.commandProcessor.processCommand('east');
        expect(testEnv.services.gameState.getCurrentScene()).toBe(originalScene);
      }
      // Test up exit
      const upResult = testEnv.commandProcessor.processCommand('up');

      if (upResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('attic');

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
      testEnv.commandProcessor.processCommand('examine window');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take brown sack');
      testEnv.commandProcessor.processCommand('drop brown sack');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
