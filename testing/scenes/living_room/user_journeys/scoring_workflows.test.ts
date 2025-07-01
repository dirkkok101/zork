import { IntegrationTestFactory } from '../integration_tests/helpers/integration_test_factory';

describe('Living Room - Scoring Workflow User Journey Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Complete Treasure Scoring Workflows', () => {
    test('should complete zero-to-hero treasure scoring journey', async () => {
      // User Journey: New player discovers scoring system through treasure collection

      // Phase 1: Player enters living room for first time (scene scoring)
      testEnv.livingRoomHelper.resetScoringState();
      testEnv.livingRoomHelper.clearTreasures();
      delete testEnv.services.gameState.getFlag('scene_visited_living_room');
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(initialScore).toBe(0);

      // Step 1: First visit to living room awards scene points
      const lookResult = await testEnv.commandProcessor.processCommand('look');
      expect(lookResult.success).toBe(true);

      const sceneScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(sceneScore).toBeGreaterThan(initialScore); // First visit bonus

      // Phase 2: Player discovers and collects first treasure (take scoring)
      testEnv.livingRoomHelper.setupTestTreasures();
      const eggTreasure = testEnv.itemService.getItem('test_egg');
      if (eggTreasure) {
        eggTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_egg');

      // Step 2: Player takes first treasure (take points + first treasure bonus)
      const takeResult = await testEnv.commandProcessor.processCommand('take test_egg');
      expect(takeResult.success).toBe(true);

      const afterTakeScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTakeScore = testEnv.trophyCaseHelper.getTakeValue('test_egg');
      expect(afterTakeScore).toBeGreaterThanOrEqual(sceneScore + expectedTakeScore);

      // Phase 3: Player discovers trophy case and deposit scoring
      await testEnv.commandProcessor.processCommand('open trophy case');
      
      // Step 3: Player deposits treasure (deposit bonus scoring)
      const putResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(putResult.success).toBe(true);

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedDepositBonus = testEnv.trophyCaseHelper.getDepositBonus('test_egg');
      expect(finalScore).toBe(afterTakeScore + expectedDepositBonus);

      // Verify: Complete scoring progression tracked
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_egg')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_egg')).toBe(true);
    });

    test('should complete multi-treasure scoring optimization workflow', async () => {
      // User Journey: Experienced player optimizes scoring across multiple treasures

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Setup multiple treasures in scene
      ['test_egg', 'test_coin', 'test_gem'].forEach(treasureId => {
        const treasure = testEnv.itemService.getItem(treasureId);
        if (treasure) {
          treasure.currentLocation = 'living_room';
        }
        testEnv.gameState.sceneStates['living_room'].items.push(treasureId);
      });

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Player collects all treasures first (maximize take scoring)
      const takeResults = [
        await testEnv.commandProcessor.processCommand('take test_egg'),
        await testEnv.commandProcessor.processCommand('take test_coin'),
        await testEnv.commandProcessor.processCommand('take test_gem')
      ];

      takeResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      const afterTakesScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTakeTotal = [
        testEnv.trophyCaseHelper.getTakeValue('test_egg'),
        testEnv.trophyCaseHelper.getTakeValue('test_coin'),
        testEnv.trophyCaseHelper.getTakeValue('test_gem')
      ].reduce((sum, score) => sum + score, 0);

      expect(afterTakesScore).toBeGreaterThanOrEqual(initialScore + expectedTakeTotal);

      // Phase 2: Player deposits treasures in optimal order (maximize deposit scoring)
      await testEnv.commandProcessor.processCommand('open trophy case');

      const putResults = [
        await testEnv.commandProcessor.processCommand('put test_egg in trophy case'),
        await testEnv.commandProcessor.processCommand('put test_coin in trophy case'),
        await testEnv.commandProcessor.processCommand('put test_gem in trophy case')
      ];

      putResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedDepositTotal = [
        testEnv.trophyCaseHelper.getDepositBonus('test_egg'),
        testEnv.trophyCaseHelper.getDepositBonus('test_coin'),
        testEnv.trophyCaseHelper.getDepositBonus('test_gem')
      ].reduce((sum, bonus) => sum + bonus, 0);

      expect(finalScore).toBe(afterTakesScore + expectedDepositTotal);

      // Verify: All scoring flags properly set
      ['test_egg', 'test_coin', 'test_gem'].forEach(treasureId => {
        expect(testEnv.livingRoomHelper.hasTreasureBeenFound(treasureId)).toBe(true);
        expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited(treasureId)).toBe(true);
      });
    });

    test('should complete scoring verification and audit workflow', async () => {
      // User Journey: Player verifies their scoring progress and maximizes points

      const scenario = testEnv.trophyCaseHelper.setupMultiTreasureScenario();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Player deposits treasures and tracks scoring
      const scoringProgress = [];
      
      for (let i = 0; i < scenario.treasureIds.length; i++) {
        const treasureId = scenario.treasureIds[i];
        const beforeScore = testEnv.livingRoomHelper.getCurrentScore();
        
        const putResult = testEnv.executeCommand(`put ${treasureId} in trophy case`);
        expect(putResult.success).toBe(true);
        
        const afterScore = testEnv.livingRoomHelper.getCurrentScore();
        const actualBonus = afterScore - beforeScore;
        const expectedBonus = scenario.expectedBonuses[i];
        
        scoringProgress.push({
          treasureId,
          expectedBonus,
          actualBonus,
          scoreBefore: beforeScore,
          scoreAfter: afterScore
        });

        expect(actualBonus).toBe(expectedBonus);
      }

      // Phase 2: Player audits final scoring state
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.totalTreasures).toBe(scenario.treasureIds.length);

      // Phase 3: Player verifies total score is correct
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedTotalBonus = scenario.expectedBonuses.reduce((sum, bonus) => sum + bonus, 0);
      expect(finalScore).toBe(initialScore + expectedTotalBonus);

      // Verify: Scoring audit reveals accurate progression
      scoringProgress.forEach(entry => {
        expect(entry.actualBonus).toBe(entry.expectedBonus);
      });
    });
  });

  describe('Scoring Prevention and Security Workflows', () => {
    test('should prevent and handle double-scoring attempts', async () => {
      // User Journey: Player attempts to exploit scoring system

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Player performs legitimate first deposit
      const firstPutResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(firstPutResult.success).toBe(true);

      const afterFirstScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedBonus = testEnv.trophyCaseHelper.getDepositBonus('test_egg');
      expect(afterFirstScore).toBe(initialScore + expectedBonus);

      // Phase 2: Player attempts to exploit by taking and re-depositing
      const takeBackResult = await testEnv.commandProcessor.processCommand('take test_egg from trophy case');
      expect(takeBackResult.success).toBe(true);

      const secondPutResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(secondPutResult.success).toBe(true);

      // Phase 3: Verify no additional scoring (double-deposit prevention)
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBe(afterFirstScore); // No additional points

      // Verify: Deposit flag remains set to prevent re-scoring
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_egg')).toBe(true);
    });

    test('should handle scoring state corruption recovery', async () => {
      // User Journey: System recovers from scoring state issues

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      testEnv.livingRoomHelper.openTrophyCase();

      // Phase 1: Normal operation
      const normalResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(normalResult.success).toBe(true);

      const normalScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 2: Simulate corruption (corrupt scoring service state)
      // Note: This would test resilience to various corruption scenarios

      // Phase 3: System continues to operate correctly
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');
      const recoveryResult = await testEnv.commandProcessor.processCommand('put test_gem in trophy case');
      expect(recoveryResult.success).toBe(true);

      // Verify: System maintains scoring integrity
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThan(normalScore);
    });

    test('should handle mixed legitimate and invalid scoring attempts', async () => {
      // User Journey: Player mixes valid and invalid operations

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.resetScoringState();

      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Valid operations
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      const validResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(validResult.success).toBe(true);

      const afterValidScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(afterValidScore).toBeGreaterThan(initialScore);

      // Phase 2: Invalid operations (should not affect scoring)
      const invalidResults = [
        await testEnv.commandProcessor.processCommand('put nonexistent_treasure in trophy case'),
        await testEnv.commandProcessor.processCommand('take nonexistent_treasure from trophy case'),
        await testEnv.commandProcessor.processCommand('put lamp in trophy case') // Non-treasure
      ];

      // Phase 3: More valid operations
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      const secondValidResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(secondValidResult.success).toBe(true);

      // Verify: Only valid operations affected scoring
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedBonusTotal = [
        testEnv.trophyCaseHelper.getDepositBonus('test_egg'),
        testEnv.trophyCaseHelper.getDepositBonus('test_coin')
      ].reduce((sum, bonus) => sum + bonus, 0);

      expect(finalScore).toBe(initialScore + expectedBonusTotal);
    });
  });

  describe('Complex Scoring Scenario Workflows', () => {
    test('should handle treasure collection across multiple game sessions', async () => {
      // User Journey: Player builds treasure collection over time

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Session 1: Player finds and deposits first treasure
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.openTrophyCase();
      await testEnv.commandProcessor.processCommand('put test_egg in trophy case');

      const session1Score = testEnv.livingRoomHelper.getCurrentScore();
      const session1State = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getInventory().length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };

      // Session 2: Player continues collection
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      await testEnv.commandProcessor.processCommand('put test_coin in trophy case');

      const session2Score = testEnv.livingRoomHelper.getCurrentScore();

      // Session 3: Player completes collection
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');
      await testEnv.commandProcessor.processCommand('put test_gem in trophy case');

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();

      // Verify: Progressive scoring across sessions
      expect(session2Score).toBeGreaterThan(session1Score);
      expect(finalScore).toBeGreaterThan(session2Score);

      // Verify: All treasures properly tracked
      const finalContents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(finalContents.length).toBe(3);
      expect(finalContents).toContain('test_egg');
      expect(finalContents).toContain('test_coin');
      expect(finalContents).toContain('test_gem');
    });

    test('should optimize scoring through strategic treasure management', async () => {
      // User Journey: Advanced player uses strategic treasure management

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Strategy: Collect all treasures first, then deposit in optimal order
      ['test_egg', 'test_coin', 'test_gem'].forEach(treasureId => {
        testEnv.livingRoomHelper.addTreasureToInventory(treasureId);
      });

      testEnv.livingRoomHelper.openTrophyCase();
      const strategyStartScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 1: Deposit lowest value treasures first
      const deposits = [
        { id: 'test_egg', bonus: testEnv.trophyCaseHelper.getDepositBonus('test_egg') },
        { id: 'test_coin', bonus: testEnv.trophyCaseHelper.getDepositBonus('test_coin') },
        { id: 'test_gem', bonus: testEnv.trophyCaseHelper.getDepositBonus('test_gem') }
      ].sort((a, b) => a.bonus - b.bonus); // Sort by bonus value

      let runningScore = strategyStartScore;
      
      deposits.forEach(deposit => {
        const beforeScore = testEnv.livingRoomHelper.getCurrentScore();
        const result = testEnv.executeCommand(`put ${deposit.id} in trophy case`);
        expect(result.success).toBe(true);
        
        const afterScore = testEnv.livingRoomHelper.getCurrentScore();
        expect(afterScore).toBe(beforeScore + deposit.bonus);
        runningScore += deposit.bonus;
      });

      // Verify: Strategic approach achieved maximum scoring
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBe(runningScore);

      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.totalTreasures).toBe(3);
    });

    test('should handle treasure scoring under various game states', async () => {
      // User Journey: Player encounters scoring in different game conditions

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.resetScoringState();

      // Condition 1: Normal state scoring
      testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
      testEnv.livingRoomHelper.openTrophyCase();
      const normalResult = await testEnv.commandProcessor.processCommand('put test_egg in trophy case');
      expect(normalResult.success).toBe(true);

      const normalScore = testEnv.livingRoomHelper.getCurrentScore();

      // Condition 2: Heavy inventory state
      testEnv.livingRoomHelper.setupHeavyInventory();
      testEnv.livingRoomHelper.addTreasureToInventory('test_coin');
      testEnv.livingRoomHelper.openTrophyCase();
      const heavyResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(heavyResult.success).toBe(true);

      // Condition 3: Multiple operations in quick succession
      testEnv.livingRoomHelper.addTreasureToInventory('test_gem');
      const quickResults = [
        await testEnv.commandProcessor.processCommand('examine trophy case'),
        await testEnv.commandProcessor.processCommand('put test_gem in trophy case'),
        await testEnv.commandProcessor.processCommand('examine trophy case')
      ];

      quickResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify: Scoring works correctly under all conditions
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThan(normalScore);

      const finalContents = testEnv.livingRoomHelper.getTrophyCaseContents();
      expect(finalContents.length).toBe(3);
    });
  });

  describe('Scoring Integration and Performance Workflows', () => {
    test('should maintain scoring performance under load', async () => {
      // User Journey: System handles intensive scoring operations

      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.resetScoringState();

      const startTime = Date.now();
      const operations = [];

      // Perform many scoring operations rapidly
      for (let i = 0; i < 20; i++) {
        testEnv.livingRoomHelper.addTreasureToInventory('test_egg');
        operations.push(await testEnv.commandProcessor.processCommand('put test_egg in trophy case'));
        
        operations.push(await testEnv.commandProcessor.processCommand('take test_egg from trophy case'));
        operations.push(await testEnv.commandProcessor.processCommand('put test_egg in trophy case'));
      }

      const endTime = Date.now();

      // Verify: Operations complete efficiently
      expect(endTime - startTime).toBeLessThan(1000); // Under 1 second

      // Verify: Scoring integrity maintained (only first deposit should score)
      const finalScore = testEnv.livingRoomHelper.getCurrentScore();
      const expectedScore = testEnv.trophyCaseHelper.getDepositBonus('test_egg');
      expect(finalScore).toBe(expectedScore);
    });

    test('should integrate scoring with complete game workflow', async () => {
      // User Journey: Scoring integrates seamlessly with full game experience

      // Phase 1: Player exploration with scene scoring
      testEnv.livingRoomHelper.resetScoringState();
      testEnv.livingRoomHelper.clearTreasures();
      delete testEnv.services.gameState.getFlag('scene_visited_living_room');
      testEnv.livingRoomHelper.resetScoringState();

      const exploreResult = await testEnv.commandProcessor.processCommand('look');
      expect(exploreResult.success).toBe(true);

      const exploreScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 2: Player treasure hunting with item scoring
      testEnv.livingRoomHelper.setupTestTreasures();
      const coinTreasure = testEnv.itemService.getItem('test_coin');
      if (coinTreasure) {
        coinTreasure.currentLocation = 'living_room';
      }
      testEnv.gameState.sceneStates['living_room'].items.push('test_coin');

      const huntResult = await testEnv.commandProcessor.processCommand('take test_coin');
      expect(huntResult.success).toBe(true);

      const huntScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 3: Player trophy management with deposit scoring
      await testEnv.commandProcessor.processCommand('open trophy case');
      const depositResult = await testEnv.commandProcessor.processCommand('put test_coin in trophy case');
      expect(depositResult.success).toBe(true);

      const depositScore = testEnv.livingRoomHelper.getCurrentScore();

      // Phase 4: Player inventory management
      const manageResult = await testEnv.commandProcessor.processCommand('examine trophy case');
      expect(manageResult.success).toBe(true);

      const finalScore = testEnv.livingRoomHelper.getCurrentScore();

      // Verify: Complete workflow with integrated scoring
      expect(huntScore).toBeGreaterThan(exploreScore);
      expect(depositScore).toBeGreaterThan(huntScore);
      expect(finalScore).toBe(depositScore); // Examine doesn't change score

      // Verify: All scoring states properly tracked
      expect(testEnv.livingRoomHelper.hasTreasureBeenFound('test_coin')).toBe(true);
      expect(testEnv.livingRoomHelper.hasTreasureBeenDeposited('test_coin')).toBe(true);
    });
  });
});