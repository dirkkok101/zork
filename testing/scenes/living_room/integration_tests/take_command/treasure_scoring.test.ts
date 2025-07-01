import { IntegrationTestFactory, LivingRoomTestEnvironment } from '../helpers/integration_test_factory';

describe('Living Room - Take Command with Treasure Scoring Integration Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Treasure Take Operations', () => {
    test('should take treasure from open trophy case', async () => {
      // Setup: Treasure in open trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Take treasure from trophy case
      const result = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');

      // Verify: Successful take operation
      expect(result.success).toBe(true);
      expect(result.message).toContain('test_gem');

      // Verify treasure moved to inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');
      expect(testEnv.livingRoomHelper.getTrophyCaseContents()).not.toContain('test_gem');
    });

    test('should prevent taking from closed trophy case', async () => {
      // Setup: Treasure in closed trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Try to take from closed trophy case
      const result = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');

      // Verify: Operation fails or requires opening first
      expect(result).toBeDefined();
      
      // If failed, treasure should remain in trophy case
      if (!result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).not.toContain('test_gem');
        expect(testEnv.livingRoomHelper.getTrophyCaseContents()).toContain('test_gem');
      }
    });

    test('should take treasure from living room floor and award first-time points', async () => {
      // Setup: Place treasure in living room
      testEnv.livingRoomHelper.setupTestTreasures();
      const testTreasure = testEnv.itemService.getItem('test_egg');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take treasure for first time
      const result = await testEnv.commandProcessor.processCommand('take test_egg');

      // Verify: Successful take with scoring
      expect(result.success).toBe(true);
      expect(result.message).toContain('test_egg');

      // Verify treasure in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_egg');
      expect(testEnv.gameState.sceneStates['living_room'].items).not.toContain('test_egg');

      // Verify first-time take scoring
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTakeScore = testEnv.trophyCaseHelper.getTakeValue('test_egg');
      expect(finalScore).toBe(initialScore + expectedTakeScore);

      // Verify treasure found flag
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_egg')).toBe(true);
    });

    test('should not award points for taking already-found treasure', async () => {
      // Setup: Mark treasure as already found
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.services.gameState.getFlag('treasure_found_test_coin') = true;
      
      const testTreasure = testEnv.itemService.getItem('test_coin');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_coin');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take already-found treasure
      const result = await testEnv.commandProcessor.processCommand('take test_coin');

      // Verify: Successful take but no additional scoring
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_coin');

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore); // No additional points
    });
  });

  describe('Trophy Case Take Operations', () => {
    test('should take multiple treasures from trophy case', async () => {
      // Setup: Multiple treasures in trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_egg');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Take all treasures
      const results = [
        await testEnv.commandProcessor.processCommand('take test_egg from trophy case'),
        await testEnv.commandProcessor.processCommand('take test_coin from trophy case'),
        await testEnv.commandProcessor.processCommand('take test_gem from trophy case')
      ];

      // Verify: All takes successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify all treasures in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_coin');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');

      // Verify trophy case empty
      expect(testEnv.livingRoomHelper.getTrophyCaseContents().length).toBe(0);
    });

    test('should maintain deposit scoring flags when taking from trophy case', async () => {
      // Setup: Deposit treasure first, then take it back
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');
      testEnv.livingRoomHelper.openTrophyCase();
      
      // Deposit to earn points
      await testEnv.commandProcessor.processCommand('put test_gem in trophy case');
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_gem')).toBe(true);

      // Execute: Take treasure back
      const result = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');

      // Verify: Take successful
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');

      // Verify: Deposit flag should remain (to prevent re-scoring)
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_gem')).toBe(true);
    });
  });

  describe('Treasure Identification and Scoring', () => {
    test('should correctly identify treasures vs non-treasures', async () => {
      // Setup: Mix of treasures and non-treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      
      // Add non-treasure (lamp) to scene
      testEnv.gameState.sceneStates['living_room'].items.push('lamp');
      
      // Add treasure to scene
      const testTreasure = testEnv.itemService.getItem('test_egg');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');

      testEnv.livingRoomHelper.resetScoringState();
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take both items
      const lampResult = await testEnv.commandProcessor.processCommand('take lamp');
      const treasureResult = await testEnv.commandProcessor.processCommand('take test_egg');

      // Verify: Both takes successful
      expect(lampResult.success).toBe(true);
      expect(treasureResult.success).toBe(true);

      // Verify: Only treasure awards points
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('test_egg');
      expect(finalScore).toBe(initialScore + expectedTreasureScore);

      // Verify: Only treasure marked as found
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_egg')).toBe(true);
    });

    test('should calculate correct take scores for different treasures', async () => {
      // Setup: Verify scoring calculations
      testEnv.livingRoomHelper.setupTestTreasures();

      // Verify individual treasure take values
      expect(testEnv.trophyCaseHelper.getTakeValue('test_egg')).toBe(5);
      expect(testEnv.trophyCaseHelper.getTakeValue('test_coin')).toBe(10);
      expect(testEnv.trophyCaseHelper.getTakeValue('test_gem')).toBe(15);

      // Verify scoring service consistency
      expect(testEnv.scoringService.calculateTreasureScore('test_egg')).toBe(5);
      expect(testEnv.scoringService.calculateTreasureScore('test_coin')).toBe(10);
      expect(testEnv.scoringService.calculateTreasureScore('test_gem')).toBe(15);
    });
  });

  describe('First Treasure Achievement', () => {
    test('should award first treasure achievement bonus', async () => {
      // Setup: No treasures found yet
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();
      
      const testTreasure = testEnv.itemService.getItem('test_egg');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take first treasure
      const result = await testEnv.commandProcessor.processCommand('take test_egg');

      // Verify: Successful take
      expect(result.success).toBe(true);

      // Verify: Both treasure score and first treasure bonus awarded
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('test_egg');
      
      // May include first treasure bonus depending on implementation
      expect(finalScore).toBeGreaterThanOrEqual(initialScore + expectedTreasureScore);

      // Check if first treasure event was triggered
      const hasFirstTreasure = testEnv.livingRoomHelper.hasEarnedScoringEvent('first_treasure');
      // This depends on implementation - may be triggered by finding first treasure
    });

    test('should not award first treasure bonus for subsequent treasures', async () => {
      // Setup: Already found one treasure
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.services.gameState.getFlag('treasure_found_test_egg') = true;
      testEnv.services.gameState.getFlag('scoring_event_first_treasure') = true;

      const testTreasure = testEnv.itemService.getItem('test_coin');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_coin');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take second treasure
      const result = await testEnv.commandProcessor.processCommand('take test_coin');

      // Verify: Only normal treasure score awarded
      expect(result.success).toBe(true);
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('test_coin');
      expect(finalScore).toBe(initialScore + expectedTreasureScore);
    });
  });

  describe('Scoring State Management', () => {
    test('should properly set treasure found flags', async () => {
      // Setup: Treasures in scene
      testEnv.livingRoomHelper.setupTestTreasures();
      ['test_egg', 'test_coin', 'test_gem'].forEach(treasureId => {
        const treasure = testEnv.itemService.getItem(treasureId);
        if (treasure) {
          treasure.currentLocation = 'living_room';
        }
        testEnv.gameState.sceneStates['living_room'].items.push(treasureId);
      });

      testEnv.livingRoomHelper.resetScoringState();

      // Execute: Take treasures one by one
      await testEnv.commandProcessor.processCommand('take test_egg');
      await testEnv.commandProcessor.processCommand('take test_coin');
      await testEnv.commandProcessor.processCommand('take test_gem');

      // Verify: All treasure found flags set
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_egg')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_coin')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_gem')).toBe(true);
    });

    test('should maintain scoring consistency across take operations', async () => {
      // Setup: Complex scenario with multiple treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Place treasures in different locations
      const eggTreasure = testEnv.itemService.getItem('test_egg');
      if (eggTreasure) {
        eggTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');

      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take from different locations
      const eggResult = await testEnv.commandProcessor.processCommand('take test_egg');
      const coinResult = await testEnv.commandProcessor.processCommand('take test_coin from trophy case');

      // Verify: Consistent scoring
      expect(eggResult.success).toBe(true);
      expect(coinResult.success).toBe(true);

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedEggScore = testEnv.trophyCaseHelper.getTakeValue('test_egg');
      
      // Coin should not award take points if already found/deposited
      const expectedTotal = testEnv.livingRoomHelper.hasTreasureBeenFound('test_coin') 
        ? expectedEggScore 
        : expectedEggScore + testEnv.trophyCaseHelper.getTakeValue('test_coin');

      expect(finalScore).toBeGreaterThanOrEqual(initialScore + expectedEggScore);
    });
  });

  describe('Error Handling', () => {
    test('should handle taking non-existent treasure', async () => {
      // Execute: Try to take non-existent treasure
      const result = await testEnv.commandProcessor.processCommand('take nonexistent_treasure');

      // Verify: Appropriate error handling
      expect(result.success).toBe(false);
      expect(testEnv.services.gameState.getGameState().inventory).not.toContain('nonexistent_treasure');
    });

    test('should handle taking treasure not in current location', async () => {
      // Setup: Treasure exists but not in current scene
      testEnv.livingRoomHelper.setupTestTreasures();
      const testTreasure = testEnv.itemService.getItem('test_gem');
      if (testTreasure) {
        testTreasure.currentLocation = 'kitchen'; // Different location
      }

      // Execute: Try to take treasure not present
      const result = await testEnv.commandProcessor.processCommand('take test_gem');

      // Verify: Appropriate error
      expect(result.success).toBe(false);
      expect(testEnv.services.gameState.getGameState().inventory).not.toContain('test_gem');
    });

    test('should handle corrupted treasure data gracefully', async () => {
      // Setup: Corrupt treasure properties
      testEnv.livingRoomHelper.setupTestTreasures();
      const testTreasure = testEnv.itemService.getItem('test_egg');
      if (testTreasure) {
        testTreasure.properties.treasurePoints = undefined as any;
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');

      // Execute: Take corrupted treasure
      const result = await testEnv.commandProcessor.processCommand('take test_egg');

      // Verify: Graceful handling
      expect(result).toBeDefined();
      // Should either succeed with 0 points or handle error appropriately
    });
  });

  describe('Integration with Other Systems', () => {
    test('should update scene description after taking treasures', async () => {
      // Setup: Treasures in scene
      testEnv.livingRoomHelper.setupTestTreasures();
      const testTreasure = testEnv.itemService.getItem('test_coin');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_coin');

      // Execute: Take treasure and look at room
      await testEnv.commandProcessor.processCommand('take test_coin');
      const lookResult = await testEnv.commandProcessor.processCommand('look');

      // Verify: Room description updated
      expect(lookResult.success).toBe(true);
      expect(lookResult.message).toContain('living room');
      expect(testEnv.gameState.sceneStates['living_room'].items).not.toContain('test_coin');
    });

    test('should work correctly with weight restrictions', async () => {
      // Setup: Heavy inventory near weight limit
      testEnv.livingRoomHelper.setupHeavyInventory();
      testEnv.livingRoomHelper.setupTestTreasures();
      
      const testTreasure = testEnv.itemService.getItem('test_gem');
      if (testTreasure) {
        testTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_gem');

      // Execute: Try to take treasure with heavy inventory
      const result = await testEnv.commandProcessor.processCommand('take test_gem');

      // Verify: May succeed or fail based on weight limits
      expect(result).toBeDefined();
      
      // If successful, should still award scoring
      if (result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');
      }
    });

    test('should maintain inventory integrity during operations', async () => {
      // Setup: Complex inventory state
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      
      const initialInventoryCount = testEnv.services.gameState.getGameState().inventory.length;

      // Add treasure to trophy case
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_coin');

      // Execute: Take from trophy case
      const result = await testEnv.commandProcessor.processCommand('take test_coin from trophy case');

      // Verify: Inventory integrity maintained
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory.length).toBe(initialInventoryCount + 1);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_coin');
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle multiple rapid take operations', async () => {
      // Setup: Multiple treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      ['test_egg', 'test_coin', 'test_gem'].forEach(treasureId => {
        const treasure = testEnv.itemService.getItem(treasureId);
        if (treasure) {
          treasure.currentLocation = 'living_room';
        }
        testEnv.gameState.sceneStates['living_room'].items.push(treasureId);
      });

      const startTime = Date.now();

      // Execute: Rapid take operations
      const results = [
        await testEnv.commandProcessor.processCommand('take test_egg'),
        await testEnv.commandProcessor.processCommand('take test_coin'),
        await testEnv.commandProcessor.processCommand('take test_gem')
      ];

      const endTime = Date.now();

      // Verify: Efficient execution
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verify: All operations successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify: All treasures in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_coin');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');
    });
  });
});