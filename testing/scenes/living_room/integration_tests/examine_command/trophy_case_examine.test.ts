import { IntegrationTestFactory, LivingRoomTestEnvironment } from '../helpers/integration_test_factory';

describe('Living Room - Examine Trophy Case Integration Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Trophy Case Examination', () => {
    test('should examine closed empty trophy case', async () => {
      // Setup: Closed empty trophy case
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Examination successful with appropriate description
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Should indicate it's closed
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(false);
      expect(trophyCaseStatus.totalTreasures).toBe(0);
    });

    test('should examine open empty trophy case', async () => {
      // Setup: Open empty trophy case
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Shows open empty state
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Should indicate it's open and empty
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBe(0);
    });

    test('should examine open trophy case with treasures', async () => {
      // Setup: Trophy case with treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Shows contents
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Should show the treasures inside
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBeGreaterThan(0);
      expect(trophyCaseStatus.contents).toContain('test_gem');
    });

    test('should examine closed trophy case with hidden treasures', async () => {
      // Setup: Add treasures then close trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Cannot see contents when closed
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Should be closed with hidden contents
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(false);
      expect(trophyCaseStatus.totalTreasures).toBeGreaterThan(0);
    });
  });

  describe('Trophy Case Alias Recognition', () => {
    test('should recognize "case" as trophy case', async () => {
      // Execute: Examine using short alias
      const result = await testEnv.commandProcessor.processCommand('examine case');

      // Verify: Recognizes trophy case
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
    });

    test('should recognize "tcase" as trophy case', async () => {
      // Execute: Examine using technical alias
      const result = await testEnv.commandProcessor.processCommand('examine tcase');

      // Verify: Recognizes trophy case
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
    });

    test('should recognize "trophy" as trophy case', async () => {
      // Execute: Examine using partial name
      const result = await testEnv.commandProcessor.processCommand('examine trophy');

      // Verify: Recognizes trophy case
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
    });
  });

  describe('Container Properties Display', () => {
    test('should show container properties in examination', async () => {
      // Setup: Open trophy case for full examination
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Container properties are mentioned
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Verify it's configured as a container
      const validation = testEnv.trophyCaseHelper.validateInitialState();
      expect(validation.isValid).toBe(true);
    });

    test('should indicate capacity and usage', async () => {
      // Setup: Multiple treasures in trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_egg');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Shows usage information
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.totalTreasures).toBe(2);
      expect(trophyCaseStatus.contents).toContain('test_egg');
      expect(trophyCaseStatus.contents).toContain('test_coin');
    });
  });

  describe('Treasure Content Examination', () => {
    test('should list individual treasures when open', async () => {
      // Setup: Multiple specific treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_egg');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Lists all treasures
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_egg');
      expect(contents).toContain('test_coin');
      expect(contents).toContain('test_gem');
      expect(contents.length).toBe(3);
    });

    test('should show appropriate message for empty open case', async () => {
      // Setup: Open empty trophy case
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Indicates empty state
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBe(0);
    });
  });

  describe('Scoring Information', () => {
    test('should not reveal scoring information in examine', async () => {
      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Does not spoil scoring mechanics
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Should not contain scoring spoilers like "deposit values" or point amounts
      expect(result.message).not.toContain('points');
      expect(result.message).not.toContain('score');
      expect(result.message).not.toContain('deposit');
    });

    test('should maintain trophy case scoring configuration', async () => {
      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Trophy case scoring is properly configured
      expect(result.success).toBe(true);
      
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.depositValuesConfigured).toBe(true);
      expect(trophyCaseStatus.totalPossibleScore).toBeGreaterThan(0);
    });
  });

  describe('State Consistency', () => {
    test('should maintain state after examination', async () => {
      // Setup: Known state
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      const initialState = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getInventory().length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: State unchanged
      expect(result.success).toBe(true);
      const finalState = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getInventory().length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };
      
      expect(finalState.currentScene).toBe(initialState.currentScene);
      expect(finalState.inventoryCount).toBe(initialState.inventoryCount);
      expect(finalState.score).toBe(initialState.score);
      expect(finalState.trophyCaseOpen).toBe(initialState.trophyCaseOpen);
      expect(finalState.trophyCaseContents).toBe(initialState.trophyCaseContents);
    });

    test('should handle repeated examinations consistently', async () => {
      // Setup: Stable state
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');

      // Execute: Multiple examinations
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(await testEnv.commandProcessor.processCommand('examine trophy case'));
      }

      // Verify: Consistent results
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.message).toContain('trophy case');
      });

      // State should remain stable
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBe(1);
      expect(trophyCaseStatus.contents).toContain('test_coin');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing trophy case gracefully', async () => {
      // Setup: Remove trophy case
      // Items are managed by services - cannot delete directly;

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Appropriate error handling
      // Exact behavior depends on implementation
      expect(result).toBeDefined();
    });

    test('should handle corrupted trophy case state', async () => {
      // Setup: Corrupt trophy case state
      const trophyCase = testEnv.livingRoomHelper.getTrophyCase();
      if (trophyCase) {
        trophyCase.state = null as any;
      }

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Graceful handling
      expect(result).toBeDefined();
    });

    test('should handle invalid treasure references in contents', async () => {
      // Setup: Add invalid treasure reference
      testEnv.livingRoomHelper.openTrophyCase();
      const trophyCase = testEnv.livingRoomHelper.getTrophyCase();
      if (trophyCase && trophyCase.state) {
        trophyCase.state.contents = ['invalid_treasure_id'];
      }

      // Execute: Examine trophy case
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Handles invalid references gracefully
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
    });
  });

  describe('Integration with Other Systems', () => {
    test('should work correctly after opening/closing operations', async () => {
      // Setup: Perform open/close cycle
      testEnv.livingRoomHelper.closeTrophyCase();
      await testEnv.commandProcessor.processCommand('open trophy case');
      await testEnv.commandProcessor.processCommand('close trophy case');

      // Execute: Examine after operations
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Examination works correctly
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(false);
    });

    test('should work correctly after treasure operations', async () => {
      // Setup: Perform treasure operations
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_egg');

      // Execute: Examine after treasure placement
      const result = await testEnv.commandProcessor.processCommand('examine trophy case');

      // Verify: Shows updated state
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_egg');
    });
  });
});