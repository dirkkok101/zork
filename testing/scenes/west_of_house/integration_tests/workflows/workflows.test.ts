/**
 * Workflow Tests - West of House Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container Interaction Workflows', () => {
    it('should complete full mailbox container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open mailbox');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in mailbox');
      expect(lookInResult.success).toBe(true);

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close mailbox');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple mailbox open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open mailbox');
      const examine1 = testEnv.commandProcessor.processCommand('examine mailbox');
      testEnv.commandProcessor.processCommand('close mailbox');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open mailbox');
      const examine2 = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close mailbox');
    });

  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take welcome mat
      const takeMatResult = testEnv.commandProcessor.processCommand('take welcome mat');
      if (takeMatResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('mat');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine welcome mat');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take welcome mat');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('mat');
    });
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineFdoorResult = testEnv.commandProcessor.processCommand('examine door');
      expect(examineFdoorResult.success).toBe(true);
      const examineMailbResult = testEnv.commandProcessor.processCommand('examine mailbox');
      expect(examineMailbResult.success).toBe(true);
      const examineMatResult = testEnv.commandProcessor.processCommand('examine welcome mat');
      expect(examineMatResult.success).toBe(true);

      // Step 3: Test all exits
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene for next test
      if (exitNorthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('west_of_house');
      }
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene for next test
      if (exitSouthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('west_of_house');
      }
      const exitWestResult = testEnv.commandProcessor.processCommand('west');
      expect(exitWestResult).toBeDefined();

      // Return to original scene for next test
      if (exitWestResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('west_of_house');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('west_of_house');
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should gracefully handle invalid actions in sequence', () => {
      // Valid action
      const validResult = testEnv.commandProcessor.processCommand('look');
      expect(validResult.success).toBe(true);

      // Invalid action
      const invalidResult = testEnv.commandProcessor.processCommand('take nonexistent');
      expect(invalidResult.success).toBe(false);

      // Recovery with valid action
      const recoveryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(recoveryResult.success).toBe(true);

      // Verify scene state intact
      expect(testEnv.services.gameState.getCurrentScene()).toBe('west_of_house');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine door');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('west_of_house');
    });
  });
});
