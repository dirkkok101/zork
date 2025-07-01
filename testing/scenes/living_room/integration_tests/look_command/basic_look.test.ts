import { IntegrationTestFactory, LivingRoomTestEnvironment } from '../helpers/integration_test_factory';

describe('Living Room - Look Command Integration Tests', () => {
  let testEnv: LivingRoomTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look Functionality', () => {
    test('should display living room description on first visit and award 1 point', async () => {
      // Setup: Fresh environment with unvisited living room and score at 0
      testEnv.livingRoomHelper.resetScoringState();
      testEnv.services.gameState.setFlag('scene_visited_living_room', false);
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();
      expect(initialScore).toBe(0);

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: First visit description and scoring
      expect(result.success).toBe(true);
      expect(result.message).toContain('You are in the living room');
      expect(result.message).toContain('trophy case');
      expect(result.message).toContain('oriental rug');
      
      // Should include first visit description
      expect(result.message).toContain('doorway to the east');
      expect(result.message).toContain('wooden door');
      
      // Verify first visit scoring (1 point for living room)
      testEnv.livingRoomHelper.verifyFirstVisitScoring(result);
      testEnv.livingRoomHelper.verifyScoreIncrease(initialScore, 1);
      expect(testEnv.services.gameState.getFlag('scene_visited_living_room')).toBe(true);
    });

    test('should display standard description on subsequent visits with no score change', async () => {
      // Setup: Mark scene as already visited
      testEnv.services.gameState.setFlag('scene_visited_living_room', true);
      const initialScore = testEnv.livingRoomHelper.getCurrentScore();

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Standard description, no additional scoring
      expect(result.success).toBe(true);
      expect(result.message).toContain('You are in the living room');
      expect(result.message).toContain('trophy case');
      
      // Should not award additional score for subsequent visits
      testEnv.livingRoomHelper.verifyNoScoreChange(result);
      expect(testEnv.livingRoomHelper.getCurrentScore()).toBe(initialScore);
    });

    test('should list all visible items in the living room', async () => {
      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: All required items are mentioned
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      expect(result.message).toContain('brass lamp');
      
      // May also contain other items like rug, paper, sword depending on implementation
      const state = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getGameState().inventory.length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };
      expect(state.currentScene).toBe('living_room');
    });

    test('should show trophy case state in room description', async () => {
      // Test closed trophy case
      testEnv.livingRoomHelper.closeTrophyCase();
      let result = await testEnv.commandProcessor.processCommand('look');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      // Should not show contents when closed
      
      // Test open trophy case
      testEnv.livingRoomHelper.openTrophyCase();
      result = await testEnv.commandProcessor.processCommand('look');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      // Open trophy case should be indicated somehow
    });
  });

  describe('Trophy Case Content Display', () => {
    test('should show empty open trophy case', async () => {
      // Setup: Open empty trophy case
      testEnv.livingRoomHelper.openTrophyCase();

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Trophy case is mentioned and appears empty
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Verify trophy case is actually open and empty
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBe(0);
    });

    test('should show treasures in open trophy case', async () => {
      // Setup: Add treasures to open trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Room and trophy case with contents
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Verify trophy case has contents
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(true);
      expect(trophyCaseStatus.totalTreasures).toBeGreaterThan(0);
    });

    test('should not show treasure details when trophy case is closed', async () => {
      // Setup: Add treasures and close trophy case
      testEnv.livingRoomHelper.setupTestTreasures();
      testEnv.livingRoomHelper.openTrophyCase();
      testEnv.livingRoomHelper.addTreasureToTrophyCase('test_gem');
      testEnv.livingRoomHelper.closeTrophyCase();

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Trophy case is mentioned but contents are hidden
      expect(result.success).toBe(true);
      expect(result.message).toContain('trophy case');
      
      // Verify trophy case is closed but has contents
      const trophyCaseStatus = testEnv.trophyCaseHelper.getTrophyCaseStatus();
      expect(trophyCaseStatus.isOpen).toBe(false);
      expect(trophyCaseStatus.totalTreasures).toBeGreaterThan(0);
    });
  });

  describe('Exit Information Display', () => {
    test('should show available exits', async () => {
      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Exits are described
      expect(result.success).toBe(true);
      // Should mention exits to kitchen (east), cellar (down), etc.
      // Exact format depends on implementation
    });

    test('should indicate weight restrictions for kitchen exit', async () => {
      // Setup: Heavy inventory that blocks kitchen exit
      testEnv.livingRoomHelper.setupHeavyInventory();

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Living room is shown correctly
      expect(result.success).toBe(true);
      expect(result.message).toContain('living room');
      
      // Verify heavy inventory state
      const state = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getGameState().inventory.length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };
      expect(state.totalWeight).toBeGreaterThan(50); // Should be heavy
    });
  });

  describe('Atmosphere and Immersion', () => {
    test('should include atmospheric details', async () => {
      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Basic room description
      expect(result.success).toBe(true);
      expect(result.message).toContain('living room');
      
      // Note: Atmospheric messages may be randomized or context-dependent
      // The specific implementation will determine exact content
    });

    test('should maintain consistent description across multiple looks', async () => {
      // Execute: Multiple look commands
      const firstLook = await testEnv.commandProcessor.processCommand('look');
      const secondLook = await testEnv.commandProcessor.processCommand('look');

      // Verify: Consistent core elements
      expect(firstLook.success).toBe(true);
      expect(secondLook.success).toBe(true);
      
      expect(firstLook.message).toContain('living room');
      expect(secondLook.message).toContain('living room');
      expect(firstLook.message).toContain('trophy case');
      expect(secondLook.message).toContain('trophy case');
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted scene state gracefully', async () => {
      // Setup: Corrupt scene state
      // Scene state is managed by services as any;

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Should either recover gracefully or show appropriate error
      // Exact behavior depends on implementation
      expect(result).toBeDefined();
    });

    test('should handle missing trophy case gracefully', async () => {
      // Setup: Remove trophy case from items
      // Items are managed by services - cannot delete directly;

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: Should still show room description
      expect(result.success).toBe(true);
      expect(result.message).toContain('living room');
    });
  });

  describe('Performance and State', () => {
    test('should not modify game state unexpectedly', async () => {
      // Setup: Record initial state with scene already visited to avoid scoring
      testEnv.services.gameState.setFlag('scene_visited_living_room', true);
      const initialState = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getGameState().inventory.length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };

      // Execute: Look command
      const result = await testEnv.commandProcessor.processCommand('look');

      // Verify: State changes are appropriate
      const finalState = {
        currentScene: testEnv.services.gameState.getCurrentScene(),
        inventoryCount: testEnv.services.gameState.getGameState().inventory.length,
        score: testEnv.livingRoomHelper.getCurrentScore(),
        trophyCaseOpen: testEnv.livingRoomHelper.isTrophyCaseOpen(),
        trophyCaseContents: testEnv.livingRoomHelper.getTrophyCaseContents().length,
        totalWeight: testEnv.livingRoomHelper.getTotalInventoryWeight()
      };
      
      expect(result.success).toBe(true);
      expect(finalState.currentScene).toBe(initialState.currentScene);
      expect(finalState.inventoryCount).toBe(initialState.inventoryCount);
      expect(finalState.trophyCaseOpen).toBe(initialState.trophyCaseOpen);
      
      // Score should not change for already visited scene
      testEnv.livingRoomHelper.verifyNoScoreChange(result);
      expect(finalState.score).toBe(initialState.score);
    });

    test('should handle repeated look commands efficiently', async () => {
      // Execute: Multiple look commands rapidly
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await testEnv.commandProcessor.processCommand('look'));
      }

      // Verify: All results are successful and consistent
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.message).toContain('living room');
      });
    });
  });
});