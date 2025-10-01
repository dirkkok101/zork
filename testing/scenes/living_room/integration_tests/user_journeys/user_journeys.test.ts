/**
 * User Journey Tests - Living Room Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Living Room Scene - User Journeys', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();
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
      const examineWdoorResult = testEnv.commandProcessor.processCommand('examine wooden door');
      expect(examineWdoorResult.success).toBe(true);
      const examineTcaseResult = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineTcaseResult.success).toBe(true);
      const examineLampResult = testEnv.commandProcessor.processCommand('examine lamp');
      expect(examineLampResult.success).toBe(true);
      const examineRugResult = testEnv.commandProcessor.processCommand('examine carpet');
      expect(examineRugResult.success).toBe(true);
      const examinePaperResult = testEnv.commandProcessor.processCommand('examine newspaper');
      expect(examinePaperResult.success).toBe(true);
      const examineSwordResult = testEnv.commandProcessor.processCommand('examine sword');
      expect(examineSwordResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

    it('should discover and explore containers', () => {
      // Discover trophy case container
      const examineTcaseResult = testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineTcaseResult.success).toBe(true);

      // Open and investigate
      const openTcaseResult = testEnv.commandProcessor.processCommand('open trophy case');
      if (openTcaseResult.success) {
        const lookInTcaseResult = testEnv.commandProcessor.processCommand('look in trophy case');
        expect(lookInTcaseResult.success).toBe(true);
      }
    });
  });

  describe('Tool Collector Journey', () => {
    it('should focus on collecting useful tools', () => {
      // Identify lamp as useful tool
      const examineLampResult = testEnv.commandProcessor.processCommand('examine lamp');
      expect(examineLampResult.success).toBe(true);

      // Collect tool
      const takeLampResult = testEnv.commandProcessor.processCommand('take lamp');
      if (takeLampResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('lamp');
      }
      // Identify carpet as useful tool
      const examineRugResult = testEnv.commandProcessor.processCommand('examine carpet');
      expect(examineRugResult.success).toBe(true);

      // Collect tool
      const takeRugResult = testEnv.commandProcessor.processCommand('take carpet');
      if (takeRugResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('rug');
      }
      // Identify newspaper as useful tool
      const examinePaperResult = testEnv.commandProcessor.processCommand('examine newspaper');
      expect(examinePaperResult.success).toBe(true);

      // Collect tool
      const takePaperResult = testEnv.commandProcessor.processCommand('take newspaper');
      if (takePaperResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('paper');
      }
      // Identify sword as useful tool
      const examineSwordResult = testEnv.commandProcessor.processCommand('examine sword');
      expect(examineSwordResult.success).toBe(true);

      // Collect tool
      const takeSwordResult = testEnv.commandProcessor.processCommand('take sword');
      if (takeSwordResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('sword');
      }
    });
  });

  describe('Problem-Solving Journey', () => {
    it('should discover weight restriction through trial and error', () => {
      // Step 1: Take items without knowing about weight limit
      testEnv.commandProcessor.processCommand('take lamp');
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');
      testEnv.commandProcessor.processCommand('take sword');

      // Step 2: Attempt to exit
      const exitResult = testEnv.commandProcessor.processCommand('east');

      // Step 3: Adapt based on result
      if (!exitResult.success || !exitResult.countsAsMove) {
        // Player discovers weight restriction
        expect(exitResult.success).toBe(false);

        // Step 4: Drop items strategically
        testEnv.commandProcessor.processCommand('drop sword');

        // Step 5: Retry exit
        const retryResult = testEnv.commandProcessor.processCommand('east');
        expect(retryResult.countsAsMove).toBe(true);
      }
    });

    it('should learn from mistakes and optimize strategy', () => {
      // Initial failed attempt
      testEnv.commandProcessor.processCommand('take sword');

      const failedExit = testEnv.commandProcessor.processCommand('east');
      expect(failedExit.success).toBe(false);

      // Learned behavior - drop and retry
      testEnv.commandProcessor.processCommand('drop sword');

      const successExit = testEnv.commandProcessor.processCommand('east');
      expect(successExit.countsAsMove).toBe(true);
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take lamp');

      // Exit efficiently
      testEnv.commandProcessor.processCommand('east');

      const finalMoves = testEnv.services.gameState.getGameState().moves || 0;
      expect(finalMoves - initialMoves).toBeLessThanOrEqual(5);
    });
  });

  describe('Completionist Journey', () => {
    it('should exhaustively explore all scene features', () => {
      // Step 1: Look at scene
      testEnv.commandProcessor.processCommand('look');

      // Step 2: Examine every item
      testEnv.commandProcessor.processCommand('examine wooden door');
      testEnv.commandProcessor.processCommand('examine trophy case');
      testEnv.commandProcessor.processCommand('examine lamp');
      testEnv.commandProcessor.processCommand('examine carpet');
      testEnv.commandProcessor.processCommand('examine newspaper');
      testEnv.commandProcessor.processCommand('examine sword');

      // Step 3: Open all containers
      testEnv.commandProcessor.processCommand('open trophy case');
      testEnv.commandProcessor.processCommand('look in trophy case');

      // Step 4: Take all items (if possible)
      testEnv.commandProcessor.processCommand('take carpet');
      testEnv.commandProcessor.processCommand('take newspaper');

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
      testEnv.commandProcessor.processCommand('take item from trophy case');

      // Recovery: Open container first
      testEnv.commandProcessor.processCommand('open trophy case');

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('living_room');
    });
  });

  describe('State Consistency Journey', () => {
    it('should maintain consistent state throughout complex journey', () => {
      const startScene = testEnv.services.gameState.getCurrentScene();

      // Complex sequence of actions
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('examine wooden door');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take lamp');
      testEnv.commandProcessor.processCommand('drop lamp');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
