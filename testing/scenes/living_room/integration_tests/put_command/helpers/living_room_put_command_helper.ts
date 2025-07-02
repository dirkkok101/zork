/**
 * Living Room Put Command Test Helper
 * Follows west of house pattern - focuses on authentic player experiences
 * Works with real Zork treasures and game mechanics
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { IGameStateService, IInventoryService, IItemService, ISceneService, IScoringService } from '@/services/interfaces/index';

export class LivingRoomPutCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService,
    private inventory: IInventoryService,
    private items: IItemService,
    private scene: ISceneService,
    private scoring: IScoringService
  ) {}

  // === Basic Command Execution ===

  /**
   * Execute a put command and return the result
   */
  executePut(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute "put <item> in <container>" command
   */
  executePutInContainer(item: string, container: string): CommandResult {
    return this.executePut(`put ${item} in ${container}`);
  }

  /**
   * Execute "put <item> on <object>" command
   */
  executePutOn(item: string, target: string): CommandResult {
    return this.executePut(`put ${item} on ${target}`);
  }

  /**
   * Execute "put down <item>" command
   */
  executePutDown(item: string): CommandResult {
    return this.executePut(`put down ${item}`);
  }

  /**
   * Execute a take command (for authentic setup)
   */
  executeTake(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute an open command (for authentic setup)
   */
  executeOpen(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  /**
   * Execute a close command (for authentic setup)
   */
  executeClose(input: string): CommandResult {
    return this.commandProcessor.processCommand(input);
  }

  // === State Inspection (Authentic Game State) ===

  /**
   * Check if an item is in the player's inventory
   */
  isInInventory(itemId: string): boolean {
    return this.inventory.hasItem(itemId);
  }

  /**
   * Check if an item is in the current scene
   */
  isInScene(itemId: string): boolean {
    const currentSceneId = this.gameState.getCurrentScene();
    const sceneItems = this.scene.getSceneItems(currentSceneId);
    return sceneItems.includes(itemId);
  }

  /**
   * Check if an item is in the trophy case
   */
  isInTrophyCase(itemId: string): boolean {
    const contents = this.items.getContainerContents('tcase');
    return contents.includes(itemId);
  }

  /**
   * Check if trophy case is open
   */
  isTrophyCaseOpen(): boolean {
    const trophyCase = this.gameState.getItem('tcase');
    return trophyCase?.state?.open === true;
  }

  /**
   * Get current inventory count
   */
  getInventoryCount(): number {
    return this.inventory.getItems().length;
  }

  /**
   * Get current player score
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }

  // === Authentic Treasure Management ===

  /**
   * Add authentic Zork treasure to scene for testing
   * Uses real game items: coin, egg, lamp, etc.
   */
  addTreasureToScene(treasureId: string): void {
    // Ensure the treasure exists in game data
    const treasure = this.gameState.getItem(treasureId);
    if (!treasure) {
      throw new Error(`Treasure ${treasureId} not found in game data`);
    }

    // Remove from any other locations first
    this.removeItemFromAllLocations(treasureId);

    // Add to living room scene
    this.scene.addItemToScene('living_room', treasureId);
    
    // Update item location to living room
    this.gameState.updateItemState(treasureId, { currentLocation: 'living_room' });
    
    // Verify the item is now accessible in the scene
    if (!this.isInScene(treasureId)) {
      throw new Error(`Failed to add ${treasureId} to living room scene`);
    }
  }

  /**
   * Remove item from all possible locations (inventory, scene, containers)
   */
  private removeItemFromAllLocations(itemId: string): void {
    // Remove from inventory if present
    if (this.isInInventory(itemId)) {
      this.inventory.removeItem(itemId);
    }
    
    // Remove from current scene if present
    if (this.isInScene(itemId)) {
      this.scene.removeItemFromScene('living_room', itemId);
    }
    
    // Remove from trophy case if present
    if (this.isInTrophyCase(itemId)) {
      this.items.removeFromContainer('tcase', itemId);
    }
  }

  /**
   * Setup authentic treasures for testing
   * Uses real Zork treasures with known scoring values
   */
  setupAuthenticTreasures(): void {
    // Real Zork treasures with known deposit values from tcase.json
    const treasures = ['coin', 'egg']; // Start with these two for testing
    
    treasures.forEach(treasureId => {
      this.addTreasureToScene(treasureId);
      // Verify each treasure was added correctly
      this.verifyItemLocation(treasureId, 'scene');
    });

    // Also add lamp as non-treasure item for contrast testing
    this.addTreasureToScene('lamp');
    this.verifyItemLocation('lamp', 'scene');
  }

  /**
   * Clean up test treasures from scene and inventory
   */
  cleanupTreasures(): void {
    const testTreasures = ['coin', 'egg', 'lamp'];
    
    // Remove from inventory
    testTreasures.forEach(treasureId => {
      if (this.isInInventory(treasureId)) {
        this.inventory.removeItem(treasureId);
      }
    });

    // Remove from scene
    testTreasures.forEach(treasureId => {
      if (this.isInScene(treasureId)) {
        this.scene.removeItemFromScene('living_room', treasureId);
      }
    });

    // Clear trophy case contents
    const trophyCaseContents = this.items.getContainerContents('tcase');
    trophyCaseContents.forEach(itemId => {
      this.items.removeFromContainer('tcase', itemId);
    });
  }

  // === Verification Methods ===

  /**
   * Verify that the command succeeded
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify that the command failed with optional message pattern
   */
  verifyFailure(result: CommandResult, expectedMessagePattern?: string | RegExp): void {
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify successful put message
   */
  verifyPutSuccess(result: CommandResult, itemName: string, targetName?: string): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(new RegExp(`put.*${itemName}`, 'i'));
    if (targetName) {
      expect(result.message).toMatch(new RegExp(targetName, 'i'));
    }
    expect(result.countsAsMove).toBe(true);
  }

  /**
   * Verify don't have item message
   */
  verifyDontHave(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't have.*${itemName}`, 'i'));
  }

  /**
   * Verify trophy case is closed message
   */
  verifyTrophyCaseClosed(result: CommandResult): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(/trophy case.*closed/i);
  }

  /**
   * Verify item was moved from inventory to trophy case
   */
  verifyItemMovedToTrophyCase(itemId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInTrophyCase(itemId)).toBe(true);
    expect(this.isInScene(itemId)).toBe(false);
  }

  /**
   * Verify item was moved from inventory to scene
   */
  verifyItemMovedToScene(itemId: string): void {
    expect(this.isInInventory(itemId)).toBe(false);
    expect(this.isInScene(itemId)).toBe(true);
    expect(this.isInTrophyCase(itemId)).toBe(false);
  }

  /**
   * Verify inventory count changed by expected amount
   */
  verifyInventoryCountChange(initialCount: number, expectedChange: number): void {
    const currentCount = this.getInventoryCount();
    expect(currentCount).toBe(initialCount + expectedChange);
  }

  // === Scoring Verification (Trophy Case Specific) ===

  /**
   * Check if an item is a treasure
   */
  isTreasure(itemId: string): boolean {
    return this.scoring.isTreasure(itemId);
  }

  /**
   * Get treasure's base points (for taking)
   */
  getTreasurePoints(treasureId: string): number {
    const treasure = this.gameState.getItem(treasureId);
    return treasure?.properties?.treasurePoints || 0;
  }

  /**
   * Get treasure's deposit value from trophy case
   */
  getDepositValue(treasureId: string): number {
    const trophyCase = this.gameState.getItem('tcase');
    return trophyCase?.properties?.depositValues?.[treasureId] || 0;
  }

  /**
   * Get treasure's deposit bonus (authentic Zork scoring logic)
   * In authentic Zork, depositing treasures awards the full deposit value
   */
  getDepositBonus(treasureId: string): number {
    // Return the full deposit value as per authentic Zork behavior
    return this.getDepositValue(treasureId);
  }

  /**
   * Verify successful treasury deposit with scoring
   */
  verifyTreasureDepositWithScoring(result: CommandResult, treasureId: string, itemName: string): void {
    // Verify basic put operation
    this.verifyPutSuccess(result, itemName, 'trophy case');
    this.verifyItemMovedToTrophyCase(treasureId);

    // Verify scoring if it's a treasure (using authentic Zork deposit bonus logic)
    if (this.isTreasure(treasureId)) {
      const expectedDepositBonus = this.getDepositBonus(treasureId);
      if (expectedDepositBonus > 0) {
        expect(result.scoreChange).toBe(expectedDepositBonus);
      }
    } else {
      // Non-treasures should not affect score
      expect(result.scoreChange).toBe(0);
    }
  }

  /**
   * Verify no scoring for non-treasure or repeat deposits
   */
  verifyNoScoring(result: CommandResult): void {
    expect(result.scoreChange).toBe(0);
  }

  /**
   * Check if treasure has been deposited (for double-deposit prevention)
   */
  hasTreasureBeenDeposited(treasureId: string): boolean {
    return this.gameState.getFlag(`treasure_deposited_${treasureId}`) === true;
  }

  /**
   * Reset scoring state for clean tests
   */
  resetScoringState(): void {
    // Reset score to 0
    const currentScore = this.gameState.getScore();
    if (currentScore > 0) {
      this.gameState.addScore(-currentScore);
    }
    
    // Clear treasure deposit flags
    const treasures = ['coin', 'egg', 'lamp']; // Known test treasures
    treasures.forEach(treasureId => {
      this.gameState.setFlag(`treasure_deposited_${treasureId}`, false);
      this.gameState.setFlag(`treasure_found_${treasureId}`, false);
    });
  }

  // === Debugging and State Verification ===

  /**
   * Get complete game state for debugging
   */
  getGameStateDebugInfo(): string {
    const inventory = this.inventory.getItems();
    const sceneItems = this.scene.getSceneItems('living_room');
    const trophyCaseContents = this.items.getContainerContents('tcase');
    const currentScore = this.getCurrentScore();
    
    return [
      `=== Game State Debug Info ===`,
      `Current Scene: ${this.gameState.getCurrentScene()}`,
      `Score: ${currentScore}`,
      `Inventory (${inventory.length}): [${inventory.join(', ')}]`,
      `Living Room Items (${sceneItems.length}): [${sceneItems.join(', ')}]`,
      `Trophy Case Contents (${trophyCaseContents.length}): [${trophyCaseContents.join(', ')}]`,
      `Trophy Case Open: ${this.isTrophyCaseOpen()}`,
      `=== End Debug Info ===`
    ].join('\n');
  }

  /**
   * Verify item is in expected location
   */
  verifyItemLocation(itemId: string, expectedLocation: 'inventory' | 'scene' | 'trophycase'): void {
    const inInventory = this.isInInventory(itemId);
    const inScene = this.isInScene(itemId);
    const inTrophyCase = this.isInTrophyCase(itemId);
    
    const locations = [];
    if (inInventory) locations.push('inventory');
    if (inScene) locations.push('scene');
    if (inTrophyCase) locations.push('trophycase');
    
    if (locations.length === 0) {
      throw new Error(`Item ${itemId} not found in any location. Expected: ${expectedLocation}\n${this.getGameStateDebugInfo()}`);
    }
    
    if (locations.length > 1) {
      throw new Error(`Item ${itemId} found in multiple locations: [${locations.join(', ')}]. Expected: ${expectedLocation}\n${this.getGameStateDebugInfo()}`);
    }
    
    if (locations[0] !== expectedLocation) {
      throw new Error(`Item ${itemId} found in ${locations[0]} but expected ${expectedLocation}\n${this.getGameStateDebugInfo()}`);
    }
  }

  // === Scene Management ===

  /**
   * Reset living room to initial state
   */
  resetLivingRoom(): void {
    // Ensure player is in living room
    this.gameState.setCurrentScene('living_room');
    
    // Clear visited flag for first visit behavior
    this.gameState.updateSceneRuntimeState('living_room', { visited: false });
    
    // Ensure trophy case is open (authentic Zork state)
    const trophyCase = this.gameState.getItem('tcase');
    if (trophyCase) {
      trophyCase.state = { ...trophyCase.state, open: true };
    }
  }
}