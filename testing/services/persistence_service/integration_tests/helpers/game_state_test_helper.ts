/**
 * Game State Test Helper
 * Provides utilities for manipulating and verifying game state in persistence tests
 */

import { IGameStateService } from '@/services/interfaces/IGameStateService';
import { GameState } from '@/types/GameState';

/**
 * Helper class for managing game state in persistence tests
 */
export class GameStateTestHelper {
  constructor(
    private gameStateService: IGameStateService
  ) {}

  /**
   * Create a minimal game state for testing
   */
  createMinimalGameState(): GameState {
    this.resetToCleanState();
    return this.gameStateService.getGameState();
  }

  /**
   * Create a complex game state with various data
   */
  createComplexGameState(): GameState {
    this.resetToCleanState();

    // Change scene
    this.gameStateService.setCurrentScene('living_room');

    // Add items to inventory
    const gameState = this.gameStateService.getGameState();
    gameState.inventory.push('lamp', 'sword', 'rope');

    // Set score and moves
    this.gameStateService.addScore(275);
    gameState.moves = 156;

    // Set various flags
    this.gameStateService.setFlag('trophy_case_opened', true);
    this.gameStateService.setFlag('mailbox_opened', true);
    this.gameStateService.setFlag('first_treasure_found', true);
    this.gameStateService.setFlag('thief_encountered', true);
    this.gameStateService.setFlag('grating_open', false);

    // Set variables
    gameState.variables['lamp_fuel'] = 75;
    gameState.variables['thief_location'] = 'maze_1';
    gameState.variables['treasure_count'] = 3;
    gameState.variables['dam_state'] = 'closed';

    // Mark multiple scenes as visited
    this.gameStateService.markSceneVisited('west_of_house');
    this.gameStateService.markSceneVisited('behind_house');
    this.gameStateService.markSceneVisited('kitchen');
    this.gameStateService.markSceneVisited('living_room');
    this.gameStateService.markSceneVisited('attic');

    // Set scene runtime states
    this.gameStateService.updateSceneRuntimeState('living_room', {
      trophy_case_open: true,
      carpet_moved: false
    });
    this.gameStateService.updateSceneRuntimeState('kitchen', {
      window_open: true,
      food_taken: true
    });

    return this.gameStateService.getGameState();
  }

  /**
   * Create a large game state for performance testing
   */
  createLargeGameState(): GameState {
    this.resetToCleanState();

    // Change to a different scene
    this.gameStateService.setCurrentScene('maze_1');

    // Add many items to inventory (simulate a packrat player)
    const gameState = this.gameStateService.getGameState();
    const manyItems = [
      'lamp', 'sword', 'rope', 'bottle', 'garlic', 'coffin', 'trident',
      'coins', 'jewels', 'painting', 'torch', 'knife', 'axe', 'shovel'
    ];
    gameState.inventory.push(...manyItems);

    // High score and move count
    this.gameStateService.addScore(850);
    gameState.moves = 2500;

    // Set many flags (simulate extensive game progress)
    const flags = [
      'trophy_case_opened', 'mailbox_opened', 'first_treasure_found',
      'thief_encountered', 'thief_defeated', 'grating_open', 'dam_destroyed',
      'all_treasures_found', 'endgame_reached', 'maze_mapped',
      'boat_launched', 'reservoir_drained', 'machine_fixed',
      'temple_entered', 'altar_used', 'book_read', 'prayer_said'
    ];
    flags.forEach(flag => this.gameStateService.setFlag(flag, true));

    // Set many variables
    gameState.variables['lamp_fuel'] = 15;
    gameState.variables['thief_location'] = 'defeated';
    gameState.variables['treasure_count'] = 20;
    gameState.variables['dam_state'] = 'destroyed';
    gameState.variables['machine_state'] = 'running';
    gameState.variables['boat_location'] = 'reservoir';
    gameState.variables['player_health'] = 100;
    gameState.variables['turn_count'] = 2500;
    gameState.variables['death_count'] = 3;
    gameState.variables['max_score'] = 350;

    // Mark all scenes as visited (simulate thorough exploration)
    const sceneIds = [
      'west_of_house', 'north_of_house', 'south_of_house', 'behind_house',
      'kitchen', 'living_room', 'attic', 'cellar', 'east_of_chasm',
      'gallery', 'studio', 'maze_1', 'maze_2', 'maze_3', 'maze_4',
      'grating_room', 'troll_room', 'east_west_passage', 'round_room',
      'loud_room', 'deep_canyon', 'reservoir', 'dam', 'maintenance_room',
      'machine_room', 'boiler_room', 'coal_mine_1', 'coal_mine_2',
      'slide_room', 'cellar_2', 'temple', 'altar', 'forest_1', 'forest_2'
    ];
    sceneIds.forEach(sceneId => {
      try {
        this.gameStateService.markSceneVisited(sceneId);
      } catch (error) {
        // Some scenes might not exist in test data, ignore
      }
    });

    // Set complex scene runtime states
    this.gameStateService.updateSceneRuntimeState('living_room', {
      trophy_case_open: true,
      carpet_moved: true,
      treasures_deposited: ['coins', 'jewels', 'painting']
    });
    this.gameStateService.updateSceneRuntimeState('kitchen', {
      window_open: true,
      food_taken: true,
      bag_moved: true
    });
    this.gameStateService.updateSceneRuntimeState('attic', {
      rope_tied: true,
      table_moved: false
    });

    return this.gameStateService.getGameState();
  }

  /**
   * Reset game state to clean initial state
   */
  resetToCleanState(): void {
    // Reset to starting scene
    this.gameStateService.setCurrentScene('west_of_house');

    // Clear inventory
    const gameState = this.gameStateService.getGameState();
    gameState.inventory.length = 0;

    // Reset score and moves
    const currentScore = this.gameStateService.getScore();
    if (currentScore !== 0) {
      this.gameStateService.addScore(-currentScore);
    }
    gameState.moves = 0;

    // Clear all flags
    gameState.flags = {};

    // Clear variables
    gameState.variables = {};

    // Clear scene states
    gameState.sceneStates = {};
  }

  /**
   * Create snapshot of current game state
   */
  createGameStateSnapshot(): GameState {
    return JSON.parse(JSON.stringify(this.gameStateService.getGameState()));
  }

  /**
   * Verify game state integrity
   */
  verifyGameStateIntegrity(gameState: GameState): void {
    // Verify required properties exist
    expect(gameState).toHaveProperty('currentSceneId');
    expect(gameState).toHaveProperty('inventory');
    expect(gameState).toHaveProperty('sceneStates');
    expect(gameState).toHaveProperty('score');
    expect(gameState).toHaveProperty('moves');
    expect(gameState).toHaveProperty('flags');
    expect(gameState).toHaveProperty('variables');
    expect(gameState).toHaveProperty('items');
    expect(gameState).toHaveProperty('scenes');
    expect(gameState).toHaveProperty('monsters');

    // Verify data types
    expect(typeof gameState.currentSceneId).toBe('string');
    expect(Array.isArray(gameState.inventory)).toBe(true);
    expect(typeof gameState.sceneStates).toBe('object');
    expect(typeof gameState.score).toBe('number');
    expect(typeof gameState.moves).toBe('number');
    expect(typeof gameState.flags).toBe('object');
    expect(typeof gameState.variables).toBe('object');
    expect(typeof gameState.items).toBe('object');
    expect(typeof gameState.scenes).toBe('object');
    expect(typeof gameState.monsters).toBe('object');

    // Verify data integrity
    expect(gameState.score).toBeGreaterThanOrEqual(0);
    expect(gameState.moves).toBeGreaterThanOrEqual(0);
    expect(gameState.currentSceneId.length).toBeGreaterThan(0);

    // Verify game data is loaded
    expect(Object.keys(gameState.items).length).toBeGreaterThan(0);
    expect(Object.keys(gameState.scenes).length).toBeGreaterThan(0);
  }

  /**
   * Compare two game states and report differences
   */
  compareGameStates(state1: GameState, state2: GameState): {
    identical: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    // Compare basic properties
    if (state1.currentSceneId !== state2.currentSceneId) {
      differences.push(`currentSceneId: ${state1.currentSceneId} vs ${state2.currentSceneId}`);
    }

    if (state1.score !== state2.score) {
      differences.push(`score: ${state1.score} vs ${state2.score}`);
    }

    if (state1.moves !== state2.moves) {
      differences.push(`moves: ${state1.moves} vs ${state2.moves}`);
    }

    // Compare arrays
    if (JSON.stringify(state1.inventory) !== JSON.stringify(state2.inventory)) {
      differences.push(`inventory: ${JSON.stringify(state1.inventory)} vs ${JSON.stringify(state2.inventory)}`);
    }

    // Compare objects
    if (JSON.stringify(state1.flags) !== JSON.stringify(state2.flags)) {
      differences.push(`flags: different`);
    }

    if (JSON.stringify(state1.variables) !== JSON.stringify(state2.variables)) {
      differences.push(`variables: different`);
    }

    if (JSON.stringify(state1.sceneStates) !== JSON.stringify(state2.sceneStates)) {
      differences.push(`sceneStates: different`);
    }

    return {
      identical: differences.length === 0,
      differences
    };
  }

  /**
   * Get current game state size (for testing)
   */
  getGameStateSize(): number {
    const gameState = this.gameStateService.getGameState();
    return JSON.stringify(gameState).length;
  }

  /**
   * Validate that game state can be serialized and deserialized
   */
  validateSerializability(): void {
    const gameState = this.gameStateService.getGameState();
    
    // Test serialization
    let serialized: string;
    expect(() => {
      serialized = JSON.stringify(gameState);
    }).not.toThrow();

    // Test deserialization
    expect(() => {
      JSON.parse(serialized!);
    }).not.toThrow();

    // Verify no circular references
    expect(serialized!.length).toBeGreaterThan(0);
  }
}