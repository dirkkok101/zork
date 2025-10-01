/**
 * User Journey Tests - Attic Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Attic Scene - User Journeys', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
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
      const examineBrickResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(examineBrickResult.success).toBe(true);
      const examineRopeResult = testEnv.commandProcessor.processCommand('examine rope');
      expect(examineRopeResult.success).toBe(true);
      const examineKnifeResult = testEnv.commandProcessor.processCommand('examine knife');
      expect(examineKnifeResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

    it('should discover and explore containers', () => {
      // Discover brick container
      const examineBrickResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(examineBrickResult.success).toBe(true);

      // Open and investigate
      const openBrickResult = testEnv.commandProcessor.processCommand('open brick');
      if (openBrickResult.success) {
        const lookInBrickResult = testEnv.commandProcessor.processCommand('look in brick');
        expect(lookInBrickResult.success).toBe(true);
      }
    });
  });

  describe('Treasure Hunter Journey', () => {
    it('should prioritize collecting valuable treasures', () => {
      // Identify rope as treasure
      const examineRopeResult = testEnv.commandProcessor.processCommand('examine rope');
      expect(examineRopeResult.success).toBe(true);

      // Collect treasure
      const takeRopeResult = testEnv.commandProcessor.processCommand('take rope');
      if (takeRopeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('rope');
      }

      // Verify treasures collected
      const inventory = testEnv.services.gameState.getGameState().inventory;
      expect(inventory.length).toBeGreaterThan(0);
    });

    it('should manage weight while collecting treasures', () => {
      // Try to collect heaviest treasure first
      const takeHeavyResult = testEnv.commandProcessor.processCommand('take rope');

      if (takeHeavyResult.success) {
        // Test if can exit with treasure
        const exitResult = testEnv.commandProcessor.processCommand('down');

        if (!exitResult.success || !exitResult.countsAsMove) {
          // Adapt strategy - drop and take lighter treasure
          testEnv.commandProcessor.processCommand('drop rope');
          testEnv.commandProcessor.processCommand('take rope');
        }
      }
    });
  });

  describe('Tool Collector Journey', () => {
    it('should focus on collecting useful tools', () => {
      // Identify knife as useful tool
      const examineKnifeResult = testEnv.commandProcessor.processCommand('examine knife');
      expect(examineKnifeResult.success).toBe(true);

      // Collect tool
      const takeKnifeResult = testEnv.commandProcessor.processCommand('take knife');
      if (takeKnifeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('knife');
      }
    });
  });

  describe('Problem-Solving Journey', () => {
    it('should discover weight restriction through trial and error', () => {
      // Step 1: Take items without knowing about weight limit
      testEnv.commandProcessor.processCommand('take brick');
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take knife');

      // Step 2: Attempt to exit
      const exitResult = testEnv.commandProcessor.processCommand('down');

      // Step 3: Adapt based on result
      if (!exitResult.success || !exitResult.countsAsMove) {
        // Player discovers weight restriction
        expect(exitResult.success).toBe(false);

        // Step 4: Drop items strategically
        testEnv.commandProcessor.processCommand('drop rope');

        // Step 5: Retry exit
        const retryResult = testEnv.commandProcessor.processCommand('down');
        expect(retryResult.countsAsMove).toBe(true);
      }
    });

    it('should learn from mistakes and optimize strategy', () => {
      // Initial failed attempt
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      const failedExit = testEnv.commandProcessor.processCommand('down');
      expect(failedExit.success).toBe(false);

      // Learned behavior - drop and retry
      testEnv.commandProcessor.processCommand('drop rope');

      const successExit = testEnv.commandProcessor.processCommand('down');
      expect(successExit.countsAsMove).toBe(true);
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take rope');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('down');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine brick');
      testEnv.commandProcessor.processCommand('examine rope');
      testEnv.commandProcessor.processCommand('examine knife');

      // Step 3: Open all containers
      testEnv.commandProcessor.processCommand('open brick');
      testEnv.commandProcessor.processCommand('look in brick');

      // Step 4: Take all items (if possible)
      testEnv.commandProcessor.processCommand('take knife');

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
      testEnv.commandProcessor.processCommand('take item from brick');

      // Recovery: Open container first
      testEnv.commandProcessor.processCommand('open brick');

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('attic');
    });
  });

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('examine brick');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take brick');
      testEnv.commandProcessor.processCommand('drop brick');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
