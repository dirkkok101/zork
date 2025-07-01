import { IntegrationTestFactory } from '../integration_tests/helpers/integration_test_factory';

describe('Living Room - Trophy Case Workflow User Journey Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Complete Trophy Case Discovery and Usage Workflows', () => {
    test('should complete first-time trophy case discovery workflow', async () => {
      // User Journey: New player discovers and learns about trophy case

      // Step 1: Player enters living room for first time
      testEnv.livingRoomHelper.resetScoringState();
      testEnv.livingRoomHelper.clearTreasures();
      delete testEnv.services.gameState.getFlag('scene_visited_living_room');

      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);
      expect(lookResult.message).toContain('living room');
      expect(lookResult.message).toContain('trophy case');

      // Step 2: Player examines trophy case to learn about it
      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineResult.success).toBe(true);
      expect(examineResult.message).toContain('trophy case');

      // Step 3: Player tries to open trophy case
      const openResult = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult.success).toBe(true);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);

      // Step 4: Player examines open empty trophy case
      const examineOpenResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineOpenResult.success).toBe(true);

      // Step 5: Player closes trophy case
      const closeResult = await testEnv.commandProcessor.processCommand('close trophy case');
      expect(closeResult.success).toBe(true);
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(false);

      // Verify: Player has learned about trophy case without breaking anything
      const validation = testEnv.trophyCaseHelper.validateInitialState();
      expect(validation.isValid).toBe(true);
    });

    test('should complete treasure collection and deposit workflow', async () => {
      // User Journey: Player finds treasures and deposits them in trophy case

      // Setup: Place treasures in scene for discovery
      testEnv.livingRoomHelper.setupTestTreasures();
      ['test_egg', 'test_coin'].forEach(treasureId => {
        const treasure = testEnv.itemService.getItem(treasureId);
        if (treasure) {
          treasure.currentLocation = 'living_room';
        }
        testEnv.gameState.sceneStates['living_room'].items.push(treasureId);
      });

      testEnv.livingRoomHelper.resetScoringState();
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Step 1: Player discovers treasures in room
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Step 2: Player examines and takes first treasure
      const examineEggResult = await testEnv.commandProcessor.processCommand('examine test_egg');
      expect(examineEggResult.success).toBe(true);

      const takeEggResult = await testEnv.commandProcessor.processCommand('take test_egg');
      expect(takeEggResult.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_egg');

      // Step 3: Player takes second treasure
      const takeCoinResult = await testEnv.commandProcessor.processCommand('take test_coin');
      expect(takeCoinResult.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_coin');

      // Step 4: Player opens trophy case
      const openResult = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult.success).toBe(true);

      // Step 5: Player deposits treasures
      const putEggResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(putEggResult.success).toBe(true);

      const putCoinResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(putCoinResult.success).toBe(true);

      // Step 6: Player examines trophy case with treasures
      const examineFullResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineFullResult.success).toBe(true);

      // Verify: Complete workflow successful with proper scoring
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents).toContain('test_egg');
      expect(contents).toContain('test_coin');
      expect(testEnv.services.gameState.getGameState().inventory).not.toContain('test_egg');
      expect(testEnv.services.gameState.getGameState().inventory).not.toContain('test_coin');

      // Verify scoring for take + deposit bonuses
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThan(initialScore);
    });

    test('should complete treasure reorganization workflow', async () => {
      // User Journey: Player rearranges treasures in and out of trophy case

      // Setup: Start with some treasures in trophy case, some in inventory
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');

      // Step 1: Player examines current state
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineResult.success).toBe(true);

      // Step 2: Player takes treasure from trophy case
      const takeFromCaseResult = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');
      expect(takeFromCaseResult.success).toBe(true);
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');

      // Step 3: Player puts different treasure in trophy case
      const putInCaseResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(putInCaseResult.success).toBe(true);
      expect(testEnv.livingRoomHelper.getTrophyCaseContents()).toContain('test_egg');

      // Step 4: Player decides to put first treasure back
      const putBackResult = await testEnv.commandProcessor.processCommand('put test_gem in trophy case');
      expect(putBackResult.success).toBe(true);

      // Step 5: Player closes trophy case when satisfied
      const closeResult = await testEnv.commandProcessor.processCommand('close trophy case');
      expect(closeResult.success).toBe(true);

      // Verify: Final state is as expected
      const finalContents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(finalContents).toContain('test_egg');
      expect(finalContents).toContain('test_gem');
      expect(finalContents.length).toBe(2);
    });
  });

  describe('Complex Multi-Session Workflows', () => {
    test('should handle interrupted treasure collection session', async () => {
      // User Journey: Player collects some treasures, leaves, returns later

      // Phase 1: Initial treasure collection
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.openTrophyCase();
      await testEnv.commandProcessor.processCommand('put test_egg in trophy case');

      // Phase 2: Player "leaves" (simulate by closing trophy case and changing context)
      await testEnv.commandProcessor.processCommand('close trophy case');
      const midSessionState = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getInventory().length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };

      // Phase 3: Player returns and continues
      await testEnv.commandProcessor.processCommand('look');
      const examineAfterReturnResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineAfterReturnResult.success).toBe(true);

      await testEnv.commandProcessor.processCommand('open trophy case');
      
      // Add another treasure
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      const putSecondResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(putSecondResult.success).toBe(true);

      // Verify: Session continuity maintained
      const finalContents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(finalContents).toContain('test_egg');
      expect(finalContents).toContain('test_coin');
      expect(finalContents.length).toBe(2);
    });

    test('should handle weight-limited treasure collection workflow', async () => {
      // User Journey: Player with heavy inventory manages treasure collection

      // Setup: Heavy inventory that limits movement
      testEnv.livingRoomHelper.setupHeavyInventory();
      testEnv.livingRoomHelper.setupTestTreasures();

      // Add light treasures to scene
      ['test_egg', 'test_coin'].forEach(treasureId => {
        const treasure = testEnv.itemService.getItem(treasureId);
        if (treasure) {
          treasure.currentLocation = 'living_room';
          treasure.weight = 1; // Light treasures
        }
        testEnv.gameState.sceneStates['living_room'].items.push(treasureId);
      });

      const initialWeight = testEnv.livingRoomHelper.getTotalInventoryWeight();

      // Step 1: Player realizes they can't move to kitchen due to weight
      const tryMoveResult = await testEnv.commandProcessor.processCommand('east'); // Try to go to kitchen
      // May fail due to weight restrictions

      // Step 2: Player decides to use trophy case to manage weight
      await testEnv.commandProcessor.processCommand('open trophy case');

      // Step 3: Player takes light treasures
      const takeEggResult = await testEnv.commandProcessor.processCommand('take test_egg');
      expect(takeEggResult.success).toBe(true);

      const takeCoinResult = await testEnv.commandProcessor.processCommand('take test_coin');
      expect(takeCoinResult.success).toBe(true);

      // Step 4: Player deposits treasures to maintain manageable weight
      const putEggResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(putEggResult.success).toBe(true);

      const putCoinResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(putCoinResult.success).toBe(true);

      // Verify: Weight managed effectively
      const finalWeight = testEnv.livingRoomHelper.getTotalInventoryWeight();
      expect(finalWeight).toBe(initialWeight); // Back to original weight
      
      const contents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(contents.length).toBe(2);
    });
  });

  describe('Error Recovery Workflows', () => {
    test('should handle and recover from closed trophy case errors', async () => {
      // User Journey: Player makes mistakes with closed trophy case

      // Setup: Treasure in inventory, closed trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Step 1: Player tries to put treasure in closed case (error)
      const putClosedResult = await testEnv.commandProcessor.processCommand('put test_gem in trophy case');
      // This should fail or give guidance

      // Step 2: Player realizes mistake and opens trophy case
      const openResult = await testEnv.commandProcessor.processCommand('open trophy case');
      expect(openResult.success).toBe(true);

      // Step 3: Player successfully deposits treasure
      const putOpenResult = await testEnv.commandProcessor.processCommand('put test_gem in trophy case');
      expect(putOpenResult.success).toBe(true);

      // Step 4: Player tries to take from closed case (error)
      await testEnv.commandProcessor.processCommand('close trophy case');
      const takeClosedResult = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');
      // Should fail or provide guidance

      // Step 5: Player corrects mistake
      await testEnv.commandProcessor.processCommand('open trophy case');
      const takeOpenResult = await testEnv.commandProcessor.processCommand('take test_gem from trophy case');
      expect(takeOpenResult.success).toBe(true);

      // Verify: Player successfully recovered from errors
      expect(testEnv.services.gameState.getGameState().inventory).toContain('test_gem');
    });

    test('should handle invalid item workflows gracefully', async () => {
      // User Journey: Player tries invalid operations

      testEnv.livingRoomHelper.openTrophyCase();

      // Step 1: Player tries to put non-existent item
      const putNonExistentResult = await testEnv.commandProcessor.processCommand('put magical_sword in trophy case');
      expect(putNonExistentResult.success).toBe(false);

      // Step 2: Player tries to take non-existent item
      const takeNonExistentResult = await testEnv.commandProcessor.processCommand('take golden_crown from trophy case');
      expect(takeNonExistentResult.success).toBe(false);

      // Step 3: Player performs valid operations
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      
      const putValidResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(putValidResult.success).toBe(true);

      // Verify: System remains stable after invalid attempts
      const validation = testEnv.trophyCaseHelper.validateInitialState();
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Advanced Trophy Case Usage Patterns', () => {
    test('should support treasure sorting and organization workflow', async () => {
      // User Journey: Player organizes treasures by value/type

      // Setup: Multiple treasures with different values
      testEnv.livingRoomHelper.setupTestTreasures();
      ['test_egg', 'test_coin', 'test_gem'].forEach(id => {
        testEnv.livingRoomHelper.addTreasureToInventory(id);
      });

      testEnv.livingRoomHelper.openTrophyCase();

      // Step 1: Player deposits treasures in order of value (low to high)
      const eggResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case'); // 5 points
      expect(eggResult.success).toBe(true);

      const coinResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case'); // 10 points
      expect(coinResult.success).toBe(true);

      const gemResult = await testEnv.commandProcessor.processCommand('put test_gem in trophy case'); // 15 points
      expect(gemResult.success).toBe(true);

      // Step 2: Player examines organized collection
      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineResult.success).toBe(true);

      // Step 3: Player decides to retrieve specific treasure
      const takeSpecificResult = await testEnv.commandProcessor.processCommand('take test_coin from trophy case');
      expect(takeSpecificResult.success).toBe(true);

      // Step 4: Player puts it back in different order
      const putBackResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(putBackResult.success).toBe(true);

      // Verify: All treasures properly managed
      const finalContents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(finalContents.length).toBe(3);
      expect(finalContents).toContain('test_egg');
      expect(finalContents).toContain('test_coin');
      expect(finalContents).toContain('test_gem');
    });

    test('should support treasure audit and scoring verification workflow', async () => {
      // User Journey: Player checks their treasure collection progress

      // Setup: Mixed state with some treasures found, some deposited
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Find and deposit some treasures
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      testEnv.livingRoomHelper.openTrophyCase();

      await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      await testEnv.commandProcessor.processCommand('put test_coin in trophy case');

      // Phase 2: Player audits their progress
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      const examineResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineResult.success).toBe(true);

      // Phase 3: Player checks remaining treasures to find
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.totalTreasures).toBe(2);
      expect(trophyCaseStatus.depositValuesConfigured).toBe(true);

      // Verify: Player can track their progress effectively
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThan(initialScore);

      const depositedFlags = [
        testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_egg'),
        testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_coin')
      ];
      expect(depositedFlags.every(flag => flag)).toBe(true);
    });
  });

  describe('Edge Case Workflows', () => {
    test('should handle rapid open/close/deposit workflow', async () => {
      // User Journey: Player rapidly manipulates trophy case

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');

      // Rapid sequence of operations
      const operations = [
        'open trophy case',
        'close trophy case',
        'open trophy case',
        'put test_gem in trophy case',
        'close trophy case',
        'open trophy case',
        'examine trophy case'
      ];

      const results = operations.map(cmd => testEnv.executeCommand(cmd));

      // Verify: All operations handled correctly
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify: Final state is correct
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
      expect(testEnv.livingRoomHelper.getTrophyCaseContents()).toContain('test_gem');
    });

    test('should handle empty trophy case workflow variations', async () => {
      // User Journey: Player interacts with empty trophy case in various ways

      // Step 1: Examine closed empty case
      testEnv.livingRoomHelper.closeTrophyCase();
      const examineClosedResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineClosedResult.success).toBe(true);

      // Step 2: Open and examine empty case
      await testEnv.commandProcessor.processCommand('open trophy case');
      const examineOpenResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(examineOpenResult.success).toBe(true);

      // Step 3: Try to take from empty case
      const takeFromEmptyResult = await testEnv.commandProcessor.processCommand('take treasure from trophy case');
      expect(takeFromEmptyResult.success).toBe(false);

      // Step 4: Look at room with open empty case
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      // Verify: All interactions handled appropriately
      expect(testEnv.livingRoomHelper.isTrophyCaseOpen()).toBe(true);
      expect(testEnv.livingRoomHelper.getTrophyCaseContents().length).toBe(0);
    });
  });
});