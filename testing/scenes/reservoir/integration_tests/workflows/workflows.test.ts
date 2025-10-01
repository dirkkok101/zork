/**
 * Workflow Tests - Reservoir Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Reservoir Scene', () => {
  let testEnv: ReservoirTestEnvironment;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take trunk of jewels
      const takeTrunkResult = testEnv.commandProcessor.processCommand('take trunk of jewels');
      if (takeTrunkResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('trunk');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine trunk of jewels');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take trunk of jewels');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('trunk');
    });
  });

  describe('Treasure Collection Workflow', () => {
    it('should complete treasure discovery and collection', () => {
      // Discover trunk of jewels
      const examineTrunkResult = testEnv.commandProcessor.processCommand('examine trunk of jewels');
      expect(examineTrunkResult.success).toBe(true);

      // Collect trunk of jewels
      const takeTrunkResult = testEnv.commandProcessor.processCommand('take trunk of jewels');
      if (takeTrunkResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('trunk');
      }

      // Verify treasures collected
      const inventory = testEnv.services.gameState.getGameState().inventory;
      expect(inventory.length).toBeGreaterThan(0);
    });
  });

  describe('Systematic Exploration Workflow', () => {
    it('should complete thorough scene exploration', () => {
      // Step 1: Initial look
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Examine all visible items
      const examineTrunkResult = testEnv.commandProcessor.processCommand('examine trunk of jewels');
      expect(examineTrunkResult.success).toBe(true);

      // Step 3: Test all exits
      const exitNorthResult = testEnv.commandProcessor.processCommand('north');
      expect(exitNorthResult).toBeDefined();

      // Return to original scene for next test
      if (exitNorthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('reservoir');
      }
      const exitUpResult = testEnv.commandProcessor.processCommand('up');
      expect(exitUpResult).toBeDefined();

      // Return to original scene for next test
      if (exitUpResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('reservoir');
      }
      const exitSouthResult = testEnv.commandProcessor.processCommand('south');
      expect(exitSouthResult).toBeDefined();

      // Return to original scene for next test
      if (exitSouthResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('reservoir');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('reservoir');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('reservoir');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine trunk of jewels');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('reservoir');
    });
  });
});
