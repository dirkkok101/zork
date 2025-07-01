import { IGameStateService } from '@/services/interfaces/IGameStateService';
import { IItemService } from '@/services/interfaces/IItemService';
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
    private itemService: IItemService,
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
   * Create a test treasure item
   */
  createTestTreasure(id: string, takePoints: number, _depositPoints: number): void {
    const testTreasure = {
      id,
      name: `Test ${id}`,
      aliases: [id.toUpperCase()],
      description: `A test treasure: ${id}`,
      examineText: `This is a test treasure used for scoring tests.`,
      type: 'TREASURE' as any,
      portable: true,
      visible: true,
      weight: 5,
      size: 'SMALL' as any,
      tags: ['treasure', 'portable'],
      properties: {
        treasurePoints: takePoints,
        value: takePoints
      },
      interactions: [
        {
          command: 'examine',
          message: `This is a test treasure used for scoring tests.`
        },
        {
          command: 'take',
          message: `You take the test ${id}.`
        }
      ],
      currentLocation: 'living_room',
      state: {},
      flags: {}
    };
    
    // Add to game state items
    const gameState = this.gameStateService.getGameState();
    gameState.items[id] = testTreasure;
    
    // Add to scene
    this.sceneService.addItemToScene('living_room', id);
  }

  /**
   * Set up test treasures for scoring tests
   */
  setupTestTreasures(): void {
    // Create test treasures with known scoring values
    this.createTestTreasure('test_egg', 5, 10);
    this.createTestTreasure('test_coin', 10, 22);
    this.createTestTreasure('test_gem', 15, 25);

    // Update trophy case deposit values to include test treasures
    const trophyCase = this.getTrophyCase();
    if (trophyCase && trophyCase.properties) {
      if (!trophyCase.properties.depositValues) {
        trophyCase.properties.depositValues = {};
      }
      trophyCase.properties.depositValues['test_egg'] = 10;
      trophyCase.properties.depositValues['test_coin'] = 22;
      trophyCase.properties.depositValues['test_gem'] = 25;
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
    
    // Add to scene first
    this.sceneService.addItemToScene('living_room', 'heavy_test_item');
    
    // Then take it into inventory
    this.itemService.takeItem('heavy_test_item');
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
}