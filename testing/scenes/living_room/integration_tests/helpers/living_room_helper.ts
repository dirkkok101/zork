import { IGameStateService } from '@/services/interfaces/IGameStateService';
import { ISceneService } from '@/services/interfaces/ISceneService';
import { IScoringService } from '@/services/interfaces/IScoringService';
import { Item } from '@/types/ItemTypes';

/**
 * Living Room Helper
 * Provides utilities for testing living room specific functionality
 * Focuses on trophy case mechanics, scoring, and weight-based exit restrictions
 */
export class LivingRoomHelper {
  constructor(
    private gameStateService: IGameStateService,
    private sceneService: ISceneService,
    private scoringService: IScoringService
  ) {
    // scoringService is kept for potential future use
    this.scoringService; // Reference to avoid unused warning
  }

  /**
   * Set up the living room scene with player present
   */
  setupLivingRoom(): void {
    this.gameStateService.setCurrentScene('living_room');
    // The scene state is managed by the services - no need to manually set items
  }

  /**
   * Get the trophy case item
   */
  getTrophyCase(): Item | undefined {
    return this.gameStateService.getItem('tcase');
  }

  /**
   * Check if trophy case is open
   */
  isTrophyCaseOpen(): boolean {
    const trophyCase = this.getTrophyCase();
    return trophyCase?.state?.open === true;
  }

  /**
   * Open the trophy case
   */
  openTrophyCase(): void {
    const trophyCase = this.getTrophyCase();
    if (trophyCase) {
      trophyCase.state.open = true;
    }
  }

  /**
   * Close the trophy case
   */
  closeTrophyCase(): void {
    const trophyCase = this.getTrophyCase();
    if (trophyCase) {
      trophyCase.state.open = false;
    }
  }

  /**
   * Add a treasure to the trophy case
   */
  addTreasureToTrophyCase(treasureId: string): void {
    const trophyCase = this.getTrophyCase() as any;
    if (trophyCase) {
      if (!trophyCase.contents) {
        trophyCase.contents = [];
      }
      if (!trophyCase.contents.includes(treasureId)) {
        trophyCase.contents.push(treasureId);
      }
      
      // Update item location
      const treasure = this.gameStateService.getItem(treasureId);
      if (treasure) {
        this.gameStateService.updateItemState(treasureId, { currentLocation: 'tcase' });
      }
    }
  }

  /**
   * Remove a treasure from the trophy case
   */
  removeTreasureFromTrophyCase(treasureId: string): void {
    const trophyCase = this.getTrophyCase() as any;
    if (trophyCase && trophyCase.contents) {
      const index = trophyCase.contents.indexOf(treasureId);
      if (index > -1) {
        trophyCase.contents.splice(index, 1);
      }
      
      // Update item location
      const treasure = this.gameStateService.getItem(treasureId);
      if (treasure) {
        this.gameStateService.updateItemState(treasureId, { currentLocation: 'living_room' });
      }
    }
  }

  /**
   * Get treasures currently in the trophy case
   */
  getTrophyCaseContents(): string[] {
    const trophyCase = this.getTrophyCase();
    // Use the same pattern as ItemService.getContainerContents()
    return (trophyCase as any)?.contents || [];
  }

  /**
   * Add treasure to player inventory
   */
  addTreasureToInventory(treasureId: string): void {
    const gameState = this.gameStateService.getGameState();
    if (!gameState.inventory.includes(treasureId)) {
      // First add item to inventory using the game state directly
      gameState.inventory.push(treasureId);
      
      // Update item location to indicate it's in inventory
      const treasure = this.gameStateService.getItem(treasureId);
      if (treasure) {
        this.gameStateService.updateItemState(treasureId, { currentLocation: 'inventory' });
      }
    }
  }

  /**
   * Add a real treasure to the living room for testing
   * Note: This method is deprecated - use addRealTreasureToLivingRoom instead
   * @param id - Test treasure ID (mapped to real treasure)
   * @param takePoints - Unused (real treasure values from data)
   * @param depositPoints - Unused (real treasure values from data)
   */
  createTestTreasure(id: string, takePoints: number, depositPoints: number): void {
    // Parameters not used - real treasures have values from game data
    console.log(`Creating test treasure ${id} (ignoring points: ${takePoints}, ${depositPoints})`);
    
    // Map test treasure IDs to real treasure IDs
    const testToRealMap: Record<string, string> = {
      'test_egg': 'egg',    // jewel-encrusted egg
      'test_coin': 'coin',  // coins
      'test_gem': 'diamo'   // diamond (closest to gem)
    };
    
    const realTreasureId = testToRealMap[id];
    if (!realTreasureId) {
      throw new Error(`No real treasure mapping for test treasure: ${id}`);
    }
    
    this.addRealTreasureToLivingRoom(realTreasureId);
  }
  
  /**
   * Add a real treasure from game data to the living room
   */
  private addRealTreasureToLivingRoom(treasureId: string): void {
    // Get the real treasure from game data
    const treasure = this.gameStateService.getItem(treasureId);
    if (!treasure) {
      throw new Error(`Treasure ${treasureId} not found in game data`);
    }
    
    // Update item location
    this.gameStateService.updateItemState(treasureId, {
      currentLocation: 'living_room'
    });
    
    // Add to scene using service
    this.sceneService.addItemToScene('living_room', treasureId);
  }

  /**
   * Set up test treasures for scoring tests
   */
  setupTestTreasures(): void {
    // Add real treasures to the living room for testing
    this.addRealTreasureToLivingRoom('egg');    // jewel-encrusted egg
    this.addRealTreasureToLivingRoom('coin');   // coins
    this.addRealTreasureToLivingRoom('diamo');  // diamond

    // Update trophy case deposit values to include real treasures
    const trophyCase = this.getTrophyCase();
    if (trophyCase && trophyCase.properties) {
      if (!trophyCase.properties.depositValues) {
        trophyCase.properties.depositValues = {};
      }
      // Set deposit values for real treasures
      trophyCase.properties.depositValues['egg'] = 10;
      trophyCase.properties.depositValues['coin'] = 22;
      trophyCase.properties.depositValues['diamo'] = 25;
    }
  }

  /**
   * Clear test treasures
   */
  clearTreasures(): void {
    const gameState = this.gameStateService.getGameState();
    const testIds = ['test_egg', 'test_coin', 'test_gem', 'heavy_test_item'];
    
    // Remove from game state
    testIds.forEach(id => {
      delete gameState.items[id];
    });
    
    // Remove from scenes - items are managed by services
    // We can't directly manipulate scene items
    
    // Remove from inventory
    gameState.inventory = gameState.inventory.filter(id => !testIds.includes(id));
    
    // Clean up trophy case deposit values for test items
    const trophyCase = this.getTrophyCase();
    if (trophyCase?.properties?.depositValues) {
      const updatedDepositValues = { ...trophyCase.properties.depositValues };
      testIds.forEach(id => {
        delete updatedDepositValues[id];
      });
      this.gameStateService.updateItemState('tcase', { 
        properties: { ...trophyCase.properties, depositValues: updatedDepositValues } 
      });
    }
  }

  /**
   * Calculate total inventory weight
   */
  getTotalInventoryWeight(): number {
    const gameState = this.gameStateService.getGameState();
    return gameState.inventory.reduce((total: number, itemId: string) => {
      const item = this.gameStateService.getItem(itemId);
      return total + (item?.weight || 0);
    }, 0);
  }

  /**
   * Set up heavy inventory to test weight restrictions
   */
  setupHeavyInventory(): void {
    // Clear current inventory
    const gameState = this.gameStateService.getGameState();
    gameState.inventory = [];
    
    // Add heavy items to exceed weight limit for kitchen exit
    const heavyItem = {
      id: 'heavy_test_item',
      name: 'Heavy Test Item',
      aliases: ['HEAVY'],
      description: 'A very heavy test item',
      examineText: 'This item is extremely heavy.',
      type: 'TOOL' as any,
      portable: true,
      visible: true,
      weight: 100, // Very heavy
      size: 'LARGE' as any,
      tags: ['heavy'],
      properties: {},
      interactions: [],
      currentLocation: 'living_room',
      state: {},
      flags: {}
    };

    // Add to game state
    gameState.items['heavy_test_item'] = heavyItem;
    
    // Add directly to inventory instead of using takeItem service
    // This ensures the test works regardless of service implementation issues
    gameState.inventory.push('heavy_test_item');
    
    // Update item location to indicate it's in inventory
    heavyItem.currentLocation = 'inventory';
  }

  /**
   * Get player's current score
   */
  getCurrentScore(): number {
    return this.gameStateService.getScore();
  }

  /**
   * Mark scene as visited for testing
   */
  markSceneVisited(sceneId: string): void {
    this.gameStateService.setFlag(`scene_visited_${sceneId}`, true);
  }

  /**
   * Check if player has earned specific scoring event
   */
  hasEarnedScoringEvent(eventId: string): boolean {
    return this.gameStateService.getFlag(`scoring_event_${eventId}`) === true;
  }

  /**
   * Check if treasure has been found (for scoring)
   */
  hasTreasureBeenFound(treasureId: string): boolean {
    return this.gameStateService.getFlag(`treasure_found_${treasureId}`) === true;
  }

  /**
   * Check if treasure has been deposited (for scoring)
   */
  hasTreasureBeenDeposited(treasureId: string): boolean {
    return this.gameStateService.getFlag(`treasure_deposited_${treasureId}`) === true;
  }

  /**
   * Reset scoring state for clean tests
   */
  resetScoringState(): void {
    // Reset score to 0
    const currentScore = this.gameStateService.getScore();
    if (currentScore > 0) {
      this.gameStateService.addScore(-currentScore);
    }
    
    // Clear all scoring-related flags
    const gameState = this.gameStateService.getGameState();
    Object.keys(gameState.flags).forEach(flag => {
      if (flag.startsWith('treasure_') || flag.startsWith('scoring_event_') || flag.startsWith('scene_visited_')) {
        this.gameStateService.setFlag(flag, false);
      }
    });
  }

  /**
   * Verify living room scene structure
   */
  verifyLivingRoomStructure(): boolean {
    const scene = this.gameStateService.getScene('living_room');
    if (!scene) return false;

    // Check required items are present
    const requiredItems = ['tcase', 'lamp', 'rug', 'paper', 'sword'];
    // Get items from the scene object
    const sceneItemIds = scene.items.map(item => 
      typeof item === 'string' ? item : item.itemId
    );
    
    return requiredItems.every(item => sceneItemIds.includes(item));
  }

  /**
   * Verify trophy case is properly configured
   */
  verifyTrophyCaseConfiguration(): boolean {
    const trophyCase = this.getTrophyCase();
    if (!trophyCase) return false;

    // Check trophy case properties
    return (
      trophyCase.type === 'CONTAINER' &&
      trophyCase.properties?.container === true &&
      trophyCase.properties?.depositValues !== undefined &&
      typeof trophyCase.properties.depositValues === 'object'
    );
  }

  /**
   * Verify a command result shows expected score change
   */
  verifyScoreChange(result: any, expectedPoints: number): void {
    expect(result.scoreChange).toBe(expectedPoints);
    expect(result.scoreChange).toBeGreaterThan(0);
  }

  /**
   * Verify a command result shows no score change
   */
  verifyNoScoreChange(result: any): void {
    expect(result.scoreChange).toBe(0);
  }

  /**
   * Verify first visit scoring (1 point for living room)
   */
  verifyFirstVisitScoring(result: any): void {
    this.verifyScoreChange(result, 1);
  }

  /**
   * Verify score increased by expected amount
   */
  verifyScoreIncrease(initialScore: number, expectedIncrease: number): void {
    const currentScore = this.getCurrentScore();
    expect(currentScore).toBe(initialScore + expectedIncrease);
    expect(currentScore).toBeGreaterThan(initialScore);
  }

  /**
   * Verify scene has the expected first visit points
   */
  verifyFirstVisitPoints(): void {
    const scene = this.gameStateService.getScene('living_room');
    expect(scene?.firstVisitPoints).toBe(1);
  }

  /**
   * Verify scoring configuration matches expected values
   */
  verifyScoringConfiguration(): void {
    const scene = this.gameStateService.getScene('living_room');
    expect(scene).toBeDefined();
    expect(scene?.firstVisitPoints).toBe(1);
    expect(typeof scene?.firstVisitPoints).toBe('number');
  }

  /**
   * Test helper to simulate fresh game start for scoring tests
   */
  simulateGameStart(): void {
    // Reset to clean state
    this.resetScoringState();
    this.setupLivingRoom();
    
    // Ensure score starts at 0
    const currentScore = this.getCurrentScore();
    if (currentScore !== 0) {
      // Reset game state score if needed
      this.gameStateService.addScore(-currentScore);
    }
    
    // Clear visited status - reset scene state to unvisited
    // Note: We need to reset the scene state directly since hasVisitedScene() checks sceneStates
    const gameState = this.gameStateService.getGameState();
    if (gameState.sceneStates['living_room']) {
      gameState.sceneStates['living_room'].visited = false;
    }
    
    // Verify clean state
    expect(this.isFirstVisit()).toBe(true);
    expect(this.getCurrentScore()).toBe(0);
  }

  /**
   * Check if this is the first visit to the living room
   */
  isFirstVisit(): boolean {
    return !this.gameStateService.hasVisitedScene('living_room');
  }
}