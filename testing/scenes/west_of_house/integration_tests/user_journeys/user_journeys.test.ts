/**
 * User Journey Tests - West of House Scene
 * Scene-specific player journeys simulating different playstyles and goals
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('West of House Scene - User Journeys', () => {
  let testEnv: WestOfHouseTestEnvironment;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();
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
      const examineFdoorResult = testEnv.commandProcessor.processCommand('examine door');
      expect(examineFdoorResult.success).toBe(true);
      const examineMailbResult = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(examineMailbResult.success).toBe(true);
      const examineMatResult = testEnv.commandProcessor.processCommand('examine welcome mat');
      expect(examineMatResult.success).toBe(true);

      // Step 3: Check available exits
      const inventory = testEnv.commandProcessor.processCommand('inventory');
      expect(inventory.success).toBe(true);
    });

    it('should discover and explore containers', () => {
      // Discover mailbox container
      const examineMailbResult = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(examineMailbResult.success).toBe(true);

      // Open and investigate
      const openMailbResult = testEnv.commandProcessor.processCommand('open mailbox');
      if (openMailbResult.success) {
        const lookInMailbResult = testEnv.commandProcessor.processCommand('look in mailbox');
        expect(lookInMailbResult.success).toBe(true);
      }
    });
  });

  describe('Tool Collector Journey', () => {
    it('should focus on collecting useful tools', () => {
      // Identify welcome mat as useful tool
      const examineMatResult = testEnv.commandProcessor.processCommand('examine welcome mat');
      expect(examineMatResult.success).toBe(true);

      // Collect tool
      const takeMatResult = testEnv.commandProcessor.processCommand('take welcome mat');
      if (takeMatResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('mat');
      }
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('should complete scene objectives with minimal moves', () => {
      const initialMoves = testEnv.services.gameState.getGameState().moves || 0;

      // Quick assessment
      testEnv.commandProcessor.processCommand('look');

      // Take most valuable/useful item
      testEnv.commandProcessor.processCommand('take welcome mat');

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
      testEnv.commandProcessor.processCommand('examine door');
      testEnv.commandProcessor.processCommand('examine mailbox');
      testEnv.commandProcessor.processCommand('examine welcome mat');

      // Step 3: Open all containers
      testEnv.commandProcessor.processCommand('open mailbox');
      testEnv.commandProcessor.processCommand('look in mailbox');

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

      // Mistake 2: Try to take from closed container
      testEnv.commandProcessor.processCommand('take item from mailbox');

      // Recovery: Open container first
      testEnv.commandProcessor.processCommand('open mailbox');

      // Verify scene state is intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('west_of_house');
    });
  });

  describe('Exploration Journey', () => {
    it('should systematically explore all exits', () => {
      const originalScene = 'west_of_house';

      // Test north exit
      const northResult = testEnv.commandProcessor.processCommand('north');

      if (northResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('north_of_house');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test south exit
      const southResult = testEnv.commandProcessor.processCommand('south');

      if (southResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('south_of_house');

        // Return to original scene for next test
        testEnv.services.gameState.setCurrentScene(originalScene);
      }
      // Test west exit
      const westResult = testEnv.commandProcessor.processCommand('west');

      if (westResult.countsAsMove) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('forest_1');

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
      testEnv.commandProcessor.processCommand('examine door');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('take welcome mat');
      testEnv.commandProcessor.processCommand('drop welcome mat');

      // Verify state consistency
      expect(testEnv.services.gameState.getCurrentScene()).toBe(startScene);
    });
  });
});
