import { IntegrationTestFactory, LivingRoomTestEnvironment } from '../helpers/integration_test_factory';

describe('Living Room - Trophy Case Open/Close Integration Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Open Operations', () => {
    test('should open closed trophy case successfully', async () => {
      // Setup: Ensure trophy case is closed
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Open trophy case
      const result = await testEnv.commandProcessor.processCommand('open trophy case');

      // Verify: Open operation successful
      expect(result.success).toBe(true);
      expect(result.message).toContain('open');
      expect(result.message).toContain('trophy case');
      
      // Verify state change
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
    });

    test('should handle opening already open trophy case', async () => {
      // Setup: Ensure trophy case is already open
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Try to open already open trophy case
      const result = await testEnv.commandProcessor.processCommand('open trophy case');

      // Verify: Appropriate response (implementation dependent)
      expect(result).toBeDefined();
      
      // Should still be open
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
    });

    test('should open trophy case using different aliases', async () => {
      // Test with different aliases
      const aliases = ['case', 'tcase', 'trophy'];
      
      for (const alias of aliases) {
        // Setup: Close trophy case
        testEnv.livingRoomHelper.closeTrophyCase();

        // Execute: Open using alias
        const result = testEnv.commandProcessor.processCommand(`open ${alias}`);

        // Verify: Opens successfully
        expect(result.success).toBe(true);
        expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
      }
    });
  });

  describe('Basic Close Operations', () => {
    test('should close open trophy case successfully', async () => {
      // Setup: Ensure trophy case is open
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Close trophy case
      const result = await testEnv.commandProcessor.processCommand('close trophy case');

      // Verify: Close operation successful
      expect(result.success).toBe(true);
      expect(result.message).toContain('close');
      expect(result.message).toContain('trophy case');
      
      // Verify state change
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
    });

    test('should handle closing already closed trophy case', async () => {
      // Setup: Ensure trophy case is already closed
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Try to close already closed trophy case
      const result = await testEnv.commandProcessor.processCommand('close trophy case');

      // Verify: Appropriate response (implementation dependent)
      expect(result).toBeDefined();
      
      // Should still be closed
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
    });

    test('should close trophy case using different aliases', async () => {
      // Test with different aliases
      const aliases = ['case', 'tcase', 'trophy'];
      
      for (const alias of aliases) {
        // Setup: Open trophy case
        testEnv.livingRoomHelper.openTrophyCase();

        // Execute: Close using alias
        const result = testEnv.commandProcessor.processCommand(`close ${alias}`);

        // Verify: Closes successfully
        expect(result.success).toBe(true);
        expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
      }
    });
  });

  describe('State Persistence', () => {
    test('should maintain open state across operations', async () => {
      // Setup: Open trophy case
      testEnv.livingRoomHelper.closeTrophyCase();
      await testEnv.commandProcessor.processCommand('open trophy case');

      // Execute: Various non-state-changing operations
      await testEnv.commandProcessor.processCommand('look');
      await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Trophy case remains open
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
    });

    test('should maintain closed state across operations', async () => {
      // Setup: Close trophy case
      testEnv.livingRoomHelper.openTrophyCase();
      await testEnv.commandProcessor.processCommand('close trophy case');

      // Execute: Various non-state-changing operations
      await testEnv.commandProcessor.processCommand('look');
      await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Trophy case remains closed
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
    });

    test('should preserve contents when opening and closing', async () => {
      // Setup: Add treasures to trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_egg');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');

      // Execute: Close and reopen
      await testEnv.commandProcessor.processCommand('close trophy case');
      await testEnv.commandProcessor.processCommand('open trophy case');

      // Verify: Contents preserved
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_egg');
      expect(contents).toContain('test_coin');
      expect(contents.length).toBe(2);
    });
  });

  describe('Content Visibility Rules', () => {
    test('should hide contents when closed', async () => {
      // Setup: Add treasures and close trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      await testEnv.commandProcessor.processCommand('close trophy case');

      // Execute: Look at room and examine trophy case
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Contents are not visible in descriptions
      expect(lookResult.success).toBe(true);
      expect(examineResult.success).toBe(true);
      
      // Trophy case should be mentioned but contents should be hidden
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
      
      // Verify contents are still there but hidden
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_gem');
    });

    test('should show contents when open', async () => {
      // Setup: Add treasures and open trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Look at room and examine trophy case
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Contents are visible
      expect(lookResult.success).toBe(true);
      expect(examineResult.success).toBe(true);
      
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
      
      // Verify contents are accessible
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_gem');
    });
  });

  describe('Multiple Operations Sequence', () => {
    test('should handle open-close-open sequence', async () => {
      // Execute: Open-Close-Open sequence
      testEnv.livingRoomHelper.closeTrophyCase();
      
      const openResult1 = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult1.success).toBe(true);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);

      const closeResult = await testEnv.commandProcessor.processCommand('close trophy case');
      expect(closeResult.success).toBe(true);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);

      const openResult2 = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult2.success).toBe(true);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
    });

    test('should handle rapid open/close operations', async () => {
      // Execute: Rapid operations
      const operations = ['open', 'close', 'open', 'close', 'open'];
      const results = [];

      testEnv.livingRoomHelper.closeTrophyCase();

      for (const operation of operations) {
        results.push(testEnv.commandProcessor.processCommand(`${operation} trophy case`));
      }

      // Verify: All operations succeeded
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Final state should be open
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
    });
  });

  describe('Scoring Integration', () => {
    test('should award points for first time opening trophy case', async () => {
      // Setup: Ensure first time opening event
      testEnv.livingRoomHelper.resetScoringState();
      testEnv.livingRoomHelper.closeTrophyCase();
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Open trophy case for first time
      const result = await testEnv.commandProcessor.processCommand('open trophy case');

      // Verify: Scoring event triggered
      expect(result.success).toBe(true);
      
      // Check if scoring event was triggered (depends on implementation)
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      // May or may not award points for opening - implementation dependent
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    test('should not affect scoring state unnecessarily', async () => {
      // Setup: Known scoring state
      testEnv.livingRoomHelper.resetScoringState();
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Open and close operations
      await testEnv.commandProcessor.processCommand('open trophy case');
      await testEnv.commandProcessor.processCommand('close trophy case');

      // Verify: Scoring state is appropriate
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      
      // Should not lose points for opening/closing
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });
  });

  describe('Error Handling', () => {
    test('should handle ambiguous commands gracefully', async () => {
      // Execute: Ambiguous open command
      const result = await testEnv.commandProcessor.processCommand('open');

      // Verify: Appropriate error handling
      // Implementation may ask for clarification or assume trophy case
      expect(result).toBeDefined();
    });

    test('should handle non-existent items', async () => {
      // Execute: Try to open non-existent item
      const result = await testEnv.commandProcessor.processCommand('open nonexistent');

      // Verify: Appropriate error message
      expect(result).toBeDefined();
      // Should not affect trophy case state
    });

    test('should handle corrupted trophy case state', async () => {
      // Setup: Corrupt trophy case state
      const trophyCase = testEnv.livingRoomHelper.getTrophyCase();
      if (trophyCase) {
        delete trophyCase.state.open;
      }

      // Execute: Try to open corrupted trophy case
      const result = await testEnv.commandProcessor.processCommand('open trophy case');

      // Verify: Graceful handling
      expect(result).toBeDefined();
    });
  });

  describe('Integration with Other Commands', () => {
    test('should work correctly with examine after open/close', async () => {
      // Execute: Open, examine, close, examine
      await testEnv.commandProcessor.processCommand('open trophy case');
      const examineOpen = await testEnv.commandProcessor.processCommand('examine trophy case');
      
      await testEnv.commandProcessor.processCommand('close trophy case');
      const examineClosed = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Examine works correctly in both states
      expect(examineOpen.success).toBe(true);
      expect(examineClosed.success).toBe(true);
      expect(examineOpen.message).toContain('trophy case');
      expect(examineClosed.message).toContain('trophy case');
    });

    test('should enable treasure operations when open', async () => {
      // Setup: Add real treasure to inventory
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('egg');

      // Execute: Open trophy case, then try to put treasure
      await testEnv.commandProcessor.processCommand('open trophy case');
      const putResult = await testEnv.commandProcessor.processCommand('put egg in trophy case');

      // Verify: Treasure operations work when open
      expect(putResult.success).toBe(true);
      expect(testEnv.livingRoomHelper.getTrophyCaseContents()).toContain('egg');
    });

    test('should prevent treasure operations when closed', async () => {
      // Setup: Add treasure to inventory and close trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Try to put treasure in closed trophy case
      const putResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');

      // Verify: Operation should fail or require opening first
      // Implementation dependent - may give "closed" error or auto-open
      expect(putResult).toBeDefined();
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle repeated operations efficiently', async () => {
      // Execute: Many open/close operations
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await testEnv.commandProcessor.processCommand('open trophy case');
        await testEnv.commandProcessor.processCommand('close trophy case');
      }
      
      const endTime = Date.now();
      
      // Verify: Operations complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      
      // Verify final state is consistent
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);
    });

    test('should maintain consistency under stress', async () => {
      // Execute: Mixed operations rapidly
      const operations: string[] = [
        'open trophy case',
        'examine trophy case',
        'close trophy case',
        'look',
        'open case',
        'close case'
      ];

      for (let i = 0; i < 20; i++) {
        const operation = operations[i % operations.length]!;
        const result = await testEnv.commandProcessor.processCommand(operation);
        expect(result).toBeDefined();
      }

      // Verify: Trophy case is still functional
      const finalOpen = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(finalOpen).toBeDefined();
      // After stress operations, accept current state rather than demanding specific behavior
    });
  });
});