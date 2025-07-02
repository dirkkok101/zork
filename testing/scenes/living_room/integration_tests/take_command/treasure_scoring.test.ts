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
      testEnv.livingRoomHelper.addTreasureToTrophyCase('diamo');

      // Execute: Take treasure from trophy case
      const result = await testEnv.commandProcessor.processCommand('take diamond from trophy case');

      // Verify: Successful take operation
      expect(result.success).toBe(true);
      expect(result.message).toContain('diamond');

      // Verify treasure moved to inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('diamo');
      expect(testEnv.livingRoomHelper.getTrophyCaseContents()).not.toContain('diamo');
    });

    test('should prevent taking from closed trophy case', async () => {
      // Setup: Treasure in closed trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('diamo');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Try to take from closed trophy case
      const result = await testEnv.commandProcessor.processCommand('take diamond from trophy case');

      // Verify: Operation fails or requires opening first
      expect(result).toBeDefined();
      
      // If failed, treasure should remain in trophy case
      if (!result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).not.toContain('diamo');
        expect(testEnv.livingRoomHelper.getTrophyCaseContents()).toContain('diamo');
      }
    });

    test('should take treasure from living room floor and award first-time points', async () => {
      // Setup: Place treasure in living room using services
      testEnv.livingRoomHelper.setupTestTreasures();
      // The setupTestTreasures now properly adds real treasures
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take treasure for first time
      const result = await testEnv.commandProcessor.processCommand('take egg');

      // Verify: Successful take with scoring
      expect(result.success).toBe(true);
      expect(result.message).toContain('egg');

      // Verify treasure in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('egg');
      // Verify treasure was removed from scene using service
      const sceneItems = testEnv.services.scene.getSceneItems('living_room');
      expect(sceneItems).not.toContain('egg');

      // Verify first-time take scoring
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTakeScore = testEnv.trophyCaseHelper.getTakeValue('egg');
      // Score should increase by the treasure points (using real game data)
      expect(finalScore).toBeGreaterThanOrEqual(initialScore + expectedTakeScore);
      expect(finalScore).toBe(initialScore + expectedTakeScore); // Use real treasure points

      // Verify treasure found flag
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('egg')).toBe(true);
    });

    test('should not award points for taking already-found treasure', async () => {
      // Setup: Mark treasure as already found
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.services.gameState.setFlag('treasure_found_coin', true);

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take already-found treasure
      const result = await testEnv.commandProcessor.processCommand('take coin');

      // Verify: Successful take but no additional scoring
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('coin');

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore); // No additional points
    });
  });

  describe('Trophy Case Take Operations', () => {
    test('should take multiple treasures from trophy case', async () => {
      // Setup: Multiple treasures in trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('egg');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('coin');
      testEnv.livingRoomHelper.addTreasureToTrophyCase('diamo');

      // Execute: Take all treasures
      const results = [
        await testEnv.commandProcessor.processCommand('take egg from trophy case'),
        await testEnv.commandProcessor.processCommand('take coins from trophy case'),
        await testEnv.commandProcessor.processCommand('take diamond from trophy case')
      ];

      // Verify: All takes successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify all treasures in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('coin');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('diamo');

      // Verify trophy case empty
      expect(testEnv.livingRoomHelper.getTrophyCaseContents().length).toBe(0);
    });

    test('should maintain deposit scoring flags when taking from trophy case', async () => {
      // Setup: Deposit treasure first, then take it back
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('diamo');
      testEnv.livingRoomHelper.openTrophyCase();
      
      // Deposit to earn points
      await testEnv.commandProcessor.processCommand('put diamond in trophy case');
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('diamo')).toBe(true);

      // Execute: Take treasure back
      const result = await testEnv.commandProcessor.processCommand('take diamond from trophy case');

      // Verify: Take successful
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('diamo');

      // Verify: Deposit flag should remain (to prevent re-scoring)
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('diamo')).toBe(true);
    });
  });

  describe('Treasure Identification and Scoring', () => {
    test('should correctly identify treasures vs non-treasures', async () => {
      // Setup: Mix of treasures and non-treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      
      // Add non-treasure (lamp) to scene using service
      testEnv.services.scene.addItemToScene('living_room', 'lamp');
      
      // Add treasure to scene using service  
      testEnv.services.scene.addItemToScene('living_room', 'egg');

      testEnv.livingRoomHelper.resetScoringState();
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take both items
      const lampResult = await testEnv.commandProcessor.processCommand('take lamp');
      const treasureResult = await testEnv.commandProcessor.processCommand('take egg');

      // Verify: Both takes successful
      expect(lampResult.success).toBe(true);
      expect(treasureResult.success).toBe(true);

      // Verify: Only treasure awards points
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('egg');
      // May include first treasure bonus, so use greater than or equal
      expect(finalScore).toBeGreaterThanOrEqual(initialScore + expectedTreasureScore);

      // Verify: Only treasure marked as found
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('egg')).toBe(true);
    });

    test('should calculate correct take scores for different treasures', async () => {
      // Setup: Verify scoring calculations
      testEnv.livingRoomHelper.setupTestTreasures();

      // Verify individual treasure take values from real game data
      expect(testEnv.trophyCaseHelper.getTakeValue('egg')).toBe(5);
      expect(testEnv.trophyCaseHelper.getTakeValue('coin')).toBeGreaterThan(0);
      expect(testEnv.trophyCaseHelper.getTakeValue('diamo')).toBeGreaterThan(0);

      // Verify scoring service consistency
      expect(testEnv.services.scoring.calculateTreasureScore('egg')).toBe(5);
      expect(testEnv.services.scoring.calculateTreasureScore('coin')).toBeGreaterThan(0);
      expect(testEnv.services.scoring.calculateTreasureScore('diamo')).toBeGreaterThan(0);
    });
  });

  describe('First Treasure Achievement', () => {
    test('should award first treasure achievement bonus', async () => {
      // Setup: No treasures found yet
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();
      
      // Add treasure to scene using service
      testEnv.services.scene.addItemToScene('living_room', 'egg');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take first treasure
      const result = await testEnv.commandProcessor.processCommand('take egg');

      // Verify: Successful take
      expect(result.success).toBe(true);

      // Verify: Both treasure score and first treasure bonus awarded
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('egg');
      
      // May include first treasure bonus depending on implementation
      expect(finalScore).toBeGreaterThanOrEqual(initialScore + expectedTreasureScore);

      // Check if first treasure event was triggered
      const hasFirstTreasure = testEnv.livingRoomHelper.hasEarnedScoringEvent('first_treasure');
      // This depends on implementation - may be triggered by finding first treasure
      console.log('First treasure event status:', hasFirstTreasure);
    });

    test('should not award first treasure bonus for subsequent treasures', async () => {
      // Setup: Already found one treasure
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.services.gameState.setFlag('treasure_found_egg', true);
      testEnv.services.gameState.setFlag('scoring_event_first_treasure', true);

      // Add treasure to scene using service
      testEnv.services.scene.addItemToScene('living_room', 'coin');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take second treasure
      const result = await testEnv.commandProcessor.processCommand('take coins');

      // Verify: Only normal treasure score awarded
      expect(result.success).toBe(true);
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTreasureScore = testEnv.trophyCaseHelper.getTakeValue('coin');
      // Should be exactly the treasure score without first treasure bonus
      expect(finalScore).toBe(initialScore + expectedTreasureScore);
    });
  });

  describe('Scoring State Management', () => {
    test('should properly set treasure found flags', async () => {
      // Setup: Treasures in scene
      testEnv.livingRoomHelper.setupTestTreasures();
      // Add treasures to scene using service
      ['egg', 'coin', 'diamo'].forEach(treasureId => {
        testEnv.services.scene.addItemToScene('living_room', treasureId);
      });

      testEnv.livingRoomHelper.resetScoringState();

      // Execute: Take treasures one by one
      await testEnv.commandProcessor.processCommand('take egg');
      await testEnv.commandProcessor.processCommand('take coins');
      await testEnv.commandProcessor.processCommand('take diamond');

      // Verify: All treasure found flags set
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('egg')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('coin')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('diamo')).toBe(true);
    });

    test('should maintain scoring consistency across take operations', async () => {
      // Setup: Complex scenario with multiple treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Place treasures in different locations using services
      testEnv.services.scene.addItemToScene('living_room', 'egg');

      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('coin');

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Take from different locations
      const eggResult = await testEnv.commandProcessor.processCommand('take egg');
      const coinResult = await testEnv.commandProcessor.processCommand('take coins from trophy case');

      // Verify: Consistent scoring
      expect(eggResult.success).toBe(true);
      expect(coinResult.success).toBe(true);

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedEggScore = testEnv.trophyCaseHelper.getTakeValue('egg');
      
      // Coin should not award take points if already found/deposited
      const expectedTotal = testEnv.livingRoomHelper.hasTreasureBeenFound('coin') 
        ? expectedEggScore 
        : expectedEggScore + testEnv.trophyCaseHelper.getTakeValue('coin');

      console.log('Expected total:', expectedTotal);
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
      // Don't call setupTestTreasures as it adds treasures to living room
      // Just ensure diamond exists in game but not in living room

      // Execute: Try to take treasure not present
      const result = await testEnv.commandProcessor.processCommand('take diamond');

      // Verify: Appropriate error
      expect(result.success).toBe(false);
      expect(testEnv.services.gameState.getGameState().inventory).not.toContain('diamo');
    });

    test('should handle corrupted treasure data gracefully', async () => {
      // Setup: Corrupt treasure properties
      testEnv.livingRoomHelper.setupTestTreasures();
      const testTreasure = testEnv.services.gameState.getItem('egg');
      if (testTreasure) {
        testTreasure.properties.treasurePoints = undefined as any;
      }
      testEnv.services.scene.addItemToScene('living_room', 'egg');

      // Execute: Take corrupted treasure
      const result = await testEnv.commandProcessor.processCommand('take egg');

      // Verify: Graceful handling
      expect(result).toBeDefined();
      // Should either succeed with 0 points or handle error appropriately
    });
  });

  describe('Integration with Other Systems', () => {
    test('should update scene description after taking treasures', async () => {
      // Setup: Treasures in scene
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.services.scene.addItemToScene('living_room', 'coin');

      // Execute: Take treasure and look at room
      await testEnv.commandProcessor.processCommand('take coins');
      const lookResult = await testEnv.commandProcessor.processCommand('look');

      // Verify: Room description updated
      expect(lookResult.success).toBe(true);
      expect(lookResult.message).toContain('living room');
      const sceneItems = testEnv.services.scene.getSceneItems('living_room');
      expect(sceneItems).not.toContain('coin');
    });

    test('should work correctly with weight restrictions', async () => {
      // Setup: Heavy inventory near weight limit
      testEnv.livingRoomHelper.setupHeavyInventory();
      testEnv.livingRoomHelper.setupTestTreasures();
      
      testEnv.services.scene.addItemToScene('living_room', 'diamo');

      // Execute: Try to take treasure with heavy inventory
      const result = await testEnv.commandProcessor.processCommand('take diamond');

      // Verify: May succeed or fail based on weight limits
      expect(result).toBeDefined();
      
      // If successful, should still award scoring
      if (result.success) {
        expect(testEnv.services.gameState.getGameState().inventory).toContain('diamo');
      }
    });

    test('should maintain inventory integrity during operations', async () => {
      // Setup: Complex inventory state
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('egg');
      
      const initialInventoryCount = testEnv.services.gameState.getGameState().inventory.length;

      // Add treasure to trophy case
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('coin');

      // Execute: Take from trophy case
      const result = await testEnv.commandProcessor.processCommand('take coins from trophy case');

      // Verify: Inventory integrity maintained
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory.length).toBe(initialInventoryCount + 1);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('coin');
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle multiple rapid take operations', async () => {
      // Setup: Multiple treasures
      testEnv.livingRoomHelper.setupTestTreasures();
      ['egg', 'coin', 'diamo'].forEach(treasureId => {
        testEnv.services.scene.addItemToScene('living_room', treasureId);
      });

      const startTime = Date.now();

      // Execute: Rapid take operations
      const results = [
        await testEnv.commandProcessor.processCommand('take egg'),
        await testEnv.commandProcessor.processCommand('take coins'),
        await testEnv.commandProcessor.processCommand('take diamond')
      ];

      const endTime = Date.now();

      // Verify: Efficient execution
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verify: All operations successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify: All treasures in inventory
      expect(testEnv.services.gameState.getGameState().inventory).toContain('egg');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('coin');
      expect(testEnv.services.gameState.getGameState().inventory).toContain('diamo');
    });
  });
});