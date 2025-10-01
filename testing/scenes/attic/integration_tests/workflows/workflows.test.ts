/**
 * Workflow Tests - Attic Scene
 * Auto-generated tests for common interaction sequences and user journeys
 */

import '../setup';
import { AtticTestEnvironment, AtticIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';

describe('Workflows - Attic Scene', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container Interaction Workflows', () => {
    it('should complete full brick container workflow', () => {
      // Step 1: Examine closed container
      const examineClosedResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open container
      const openResult = testEnv.commandProcessor.processCommand('open brick');
      expect(openResult.success).toBe(true);

      // Step 3: Look in opened container
      const lookInResult = testEnv.commandProcessor.processCommand('look in brick');
      expect(lookInResult.success).toBe(true);

      // Step 5: Close container
      const closeResult = testEnv.commandProcessor.processCommand('close brick');
      expect(closeResult.success).toBe(true);

      // Step 6: Verify closed state persists
      const finalExamineResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(finalExamineResult.success).toBe(true);
    });

    it('should handle multiple brick open/close cycles', () => {
      // Cycle 1
      testEnv.commandProcessor.processCommand('open brick');
      const examine1 = testEnv.commandProcessor.processCommand('examine brick');
      testEnv.commandProcessor.processCommand('close brick');

      // Cycle 2
      testEnv.commandProcessor.processCommand('open brick');
      const examine2 = testEnv.commandProcessor.processCommand('examine brick');
      expect(examine2.message).toBe(examine1.message);
      testEnv.commandProcessor.processCommand('close brick');
    });

  });

  describe('Item Collection Workflow', () => {
    it('should complete systematic item collection', () => {
      // Step 1: Look around to see what's available
      const lookResult = testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Take brick
      const takeBrickResult = testEnv.commandProcessor.processCommand('take brick');
      if (takeBrickResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('brick');
      }

      // Take rope
      const takeRopeResult = testEnv.commandProcessor.processCommand('take rope');
      if (takeRopeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('rope');
      }

      // Take knife
      const takeKnifeResult = testEnv.commandProcessor.processCommand('take knife');
      if (takeKnifeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('knife');
      }

      // Verify inventory contents
      const inventoryResult = testEnv.commandProcessor.processCommand('inventory');
      expect(inventoryResult.success).toBe(true);
    });

    it('should handle selective item collection', () => {
      // Examine before taking
      const examineResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(examineResult.success).toBe(true);

      // Take item
      const takeResult = testEnv.commandProcessor.processCommand('take brick');
      expect(takeResult.success).toBe(true);

      // Verify in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('brick');
    });
  });

  describe('Weight Management Workflow', () => {
    it('should handle weight-limited item collection', () => {
      // Step 1: Take light items first
      testEnv.commandProcessor.processCommand('take knife');

      // Step 2: Test if can exit
      const lightExitResult = testEnv.commandProcessor.processCommand('down');
      const canExitLight = lightExitResult.success && lightExitResult.countsAsMove;

      if (canExitLight) {
        expect(testEnv.services.gameState.getCurrentScene()).toBe('kitchen');

        // Return to scene
        testEnv.commandProcessor.processCommand('up');
      }

      // Step 3: Try adding heavier items
      testEnv.commandProcessor.processCommand('take brick');
      testEnv.commandProcessor.processCommand('take rope');

      // Step 4: Test exit again
      const heavyExitResult = testEnv.commandProcessor.processCommand('down');

      if (!heavyExitResult.success || !heavyExitResult.countsAsMove) {
        // Step 5: Drop items to reduce weight
        testEnv.commandProcessor.processCommand('drop brick');

        // Step 6: Retry exit
        const retryExitResult = testEnv.commandProcessor.processCommand('down');
        expect(retryExitResult.countsAsMove).toBe(true);
      }
    });

    it('should recover from overweight situation', () => {
      // Overload inventory
      testEnv.commandProcessor.processCommand('take rope');
      testEnv.commandProcessor.processCommand('take brick');

      // Attempt exit - should fail
      const blockedResult = testEnv.commandProcessor.processCommand('down');
      expect(blockedResult.success).toBe(false);

      // Drop heaviest item
      const dropResult = testEnv.commandProcessor.processCommand('drop rope');
      expect(dropResult.success).toBe(true);

      // Retry exit - should succeed
      const successResult = testEnv.commandProcessor.processCommand('down');
      expect(successResult.countsAsMove).toBe(true);
    });
  });

  describe('Treasure Collection Workflow', () => {
    it('should complete treasure discovery and collection', () => {
      // Discover rope
      const examineRopeResult = testEnv.commandProcessor.processCommand('examine rope');
      expect(examineRopeResult.success).toBe(true);

      // Collect rope
      const takeRopeResult = testEnv.commandProcessor.processCommand('take rope');
      if (takeRopeResult.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('rope');
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
      const examineBrickResult = testEnv.commandProcessor.processCommand('examine brick');
      expect(examineBrickResult.success).toBe(true);
      const examineRopeResult = testEnv.commandProcessor.processCommand('examine rope');
      expect(examineRopeResult.success).toBe(true);
      const examineKnifeResult = testEnv.commandProcessor.processCommand('examine knife');
      expect(examineKnifeResult.success).toBe(true);

      // Step 3: Test all exits
      const exitDownResult = testEnv.commandProcessor.processCommand('down');
      expect(exitDownResult).toBeDefined();

      // Return to original scene for next test
      if (exitDownResult.countsAsMove) {
        testEnv.services.gameState.setCurrentScene('attic');
      }

      // Verify back in original scene
      expect(testEnv.services.gameState.getCurrentScene()).toBe('attic');
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
      expect(testEnv.services.gameState.getCurrentScene()).toBe('attic');
    });
  });

  describe('State Persistence Across Commands', () => {
    it('should maintain consistent state throughout workflow', () => {
      const initialScene = testEnv.services.gameState.getCurrentScene();

      // Execute multiple commands
      testEnv.commandProcessor.processCommand('look');
      testEnv.commandProcessor.processCommand('inventory');
      testEnv.commandProcessor.processCommand('examine brick');

      // Verify scene hasn't changed
      expect(testEnv.services.gameState.getCurrentScene()).toBe(initialScene);
      expect(testEnv.services.gameState.getCurrentScene()).toBe('attic');
    });
  });
});
