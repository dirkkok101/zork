/**
 * Game State Manipulation Helper
 * Provides utilities for creating and manipulating game states for SaveCommand testing
 */

import { IGameStateService } from '@/services/interfaces/IGameStateService';
import { ISceneService } from '@/services/interfaces/ISceneService';
import { IInventoryService } from '@/services/interfaces/IInventoryService';
import { IItemService } from '@/services/interfaces/IItemService';
import { GameState } from '@/types/GameState';

export class GameStateManipulationHelper {
  constructor(
    private gameStateService: IGameStateService,
    private sceneService: ISceneService,
    private inventoryService: IInventoryService,
    private itemService: IItemService
  ) {}

  /**
   * Reset to clean initial state
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
   * Create minimal game state (default starting state)
   */
  createMinimalState(): GameState {
    this.resetToCleanState();
    return this.gameStateService.getGameState();
  }

  /**
   * Create early game state (just started playing)
   */
  createEarlyGameState(): GameState {
    this.resetToCleanState();

    // Basic exploration and item collection
    this.gameStateService.setCurrentScene('behind_house');
    const gameState = this.gameStateService.getGameState();
    gameState.inventory.push('lamp');
    this.gameStateService.addScore(25);
    gameState.moves = 15;

    // Basic flags
    this.gameStateService.setFlag('mailbox_opened', true);
    this.gameStateService.setFlag('window_open', true);

    // Basic variables
    gameState.variables['lamp_fuel'] = 100;

    // Few visited scenes
    this.gameStateService.markSceneVisited('west_of_house');
    this.gameStateService.markSceneVisited('behind_house');

    return this.gameStateService.getGameState();
  }

  /**
   * Create mid-game state (significant progress)
   */
  createMidGameState(): GameState {
    this.resetToCleanState();

    // Mid-game location
    this.gameStateService.setCurrentScene('living_room');
    const gameState = this.gameStateService.getGameState();
    
    // Mid-game inventory
    gameState.inventory.push('lamp', 'sword', 'rope', 'bottle');
    this.gameStateService.addScore(180);
    gameState.moves = 120;

    // Mid-game flags
    this.gameStateService.setFlag('trophy_case_opened', true);
    this.gameStateService.setFlag('mailbox_opened', true);
    this.gameStateService.setFlag('first_treasure_found', true);
    this.gameStateService.setFlag('thief_encountered', true);
    this.gameStateService.setFlag('grating_open', true);

    // Mid-game variables
    gameState.variables['lamp_fuel'] = 65;
    gameState.variables['thief_location'] = 'maze_1';
    gameState.variables['treasure_count'] = 5;

    // Multiple visited scenes
    const scenes = ['west_of_house', 'behind_house', 'kitchen', 'living_room', 
                   'attic', 'cellar', 'grating_room'];
    scenes.forEach(scene => {
      try {
        this.gameStateService.markSceneVisited(scene);
      } catch (error) {
        // Some scenes might not exist in test data
      }
    });

    // Scene runtime states
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
   * Create late game state (near completion)
   */
  createLateGameState(): GameState {
    this.resetToCleanState();

    // Late game location
    this.gameStateService.setCurrentScene('treasure_room');
    const gameState = this.gameStateService.getGameState();
    
    // Late game inventory
    gameState.inventory.push('lamp', 'sword');
    this.gameStateService.addScore(320);
    gameState.moves = 450;

    // Late game flags
    this.gameStateService.setFlag('trophy_case_opened', true);
    this.gameStateService.setFlag('all_treasures_found', true);
    this.gameStateService.setFlag('thief_defeated', true);
    this.gameStateService.setFlag('dam_destroyed', true);
    this.gameStateService.setFlag('endgame_reached', true);
    this.gameStateService.setFlag('temple_entered', true);

    // Late game variables
    gameState.variables['lamp_fuel'] = 10;
    gameState.variables['thief_location'] = 'defeated';
    gameState.variables['treasure_count'] = 20;
    gameState.variables['final_puzzle_solved'] = true;

    // Many visited scenes
    const scenes = [
      'west_of_house', 'behind_house', 'kitchen', 'living_room', 'attic',
      'cellar', 'grating_room', 'troll_room', 'maze_1', 'maze_2',
      'dam', 'reservoir', 'temple', 'altar', 'treasure_room'
    ];
    scenes.forEach(scene => {
      try {
        this.gameStateService.markSceneVisited(scene);
      } catch (error) {
        // Some scenes might not exist in test data
      }
    });

    return this.gameStateService.getGameState();
  }

  /**
   * Create game over state
   */
  createGameOverState(): GameState {
    this.createMidGameState();
    this.gameStateService.endGame('test game over');
    return this.gameStateService.getGameState();
  }

  /**
   * Create state with maximum data (stress test)
   */
  createMaximumDataState(): GameState {
    this.resetToCleanState();

    const gameState = this.gameStateService.getGameState();
    
    // Maximum inventory (within reasonable limits)
    const maxItems = ['lamp', 'sword', 'rope', 'bottle', 'garlic', 'coffin', 
                     'trident', 'coins', 'jewels', 'painting', 'torch'];
    gameState.inventory.push(...maxItems);
    
    this.gameStateService.addScore(999);
    gameState.moves = 9999;

    // Maximum flags
    for (let i = 0; i < 50; i++) {
      this.gameStateService.setFlag(`test_flag_${i}`, i % 2 === 0);
      this.gameStateService.setFlag(`achievement_${i}`, true);
      this.gameStateService.setFlag(`puzzle_${i}_solved`, i % 3 === 0);
    }

    // Maximum variables with various data types
    for (let i = 0; i < 50; i++) {
      gameState.variables[`test_var_${i}`] = `Large data content repeated many times `.repeat(20);
      gameState.variables[`number_var_${i}`] = i * 1.5;
      gameState.variables[`array_var_${i}`] = [1, 2, 3, i];
      gameState.variables[`object_var_${i}`] = { value: i, active: true };
    }

    // Special characters and edge cases
    gameState.variables['unicode_test'] = 'Unicode: 🎮🗡️🏰 Symbols: ∀∃∈∅';
    gameState.variables['quotes_test'] = 'Text with "quotes" and \'apostrophes\'';
    gameState.variables['special_chars'] = '<>&"\'\\n\\t\\r';
    gameState.variables['null_test'] = null;
    gameState.variables['empty_string'] = '';
    gameState.variables['boolean_false'] = false;
    gameState.variables['zero_number'] = 0;

    return this.gameStateService.getGameState();
  }

  /**
   * Create state with specific score value
   */
  createStateWithScore(targetScore: number): GameState {
    this.resetToCleanState();
    this.gameStateService.addScore(targetScore);
    return this.gameStateService.getGameState();
  }

  /**
   * Create state in specific scene
   */
  createStateInScene(sceneId: string): GameState {
    this.resetToCleanState();
    this.gameStateService.setCurrentScene(sceneId);
    return this.gameStateService.getGameState();
  }

  /**
   * Create state with specific inventory
   */
  createStateWithInventory(items: string[]): GameState {
    this.resetToCleanState();
    const gameState = this.gameStateService.getGameState();
    gameState.inventory.push(...items);
    return this.gameStateService.getGameState();
  }

  /**
   * Create state with specific flags
   */
  createStateWithFlags(flags: Record<string, boolean>): GameState {
    this.resetToCleanState();
    Object.entries(flags).forEach(([flag, value]) => {
      this.gameStateService.setFlag(flag, value);
    });
    return this.gameStateService.getGameState();
  }

  /**
   * Create state with complex scene states
   */
  createStateWithComplexSceneStates(): GameState {
    this.resetToCleanState();

    // Complex scene runtime states
    this.gameStateService.updateSceneRuntimeState('living_room', {
      trophy_case_open: true,
      carpet_moved: true,
      treasures_deposited: ['coins', 'jewels'],
      furniture_arrangement: 'custom',
      lighting_level: 'bright'
    });

    this.gameStateService.updateSceneRuntimeState('kitchen', {
      window_open: true,
      food_taken: true,
      bag_moved: true,
      water_status: 'flowing',
      items_on_table: ['bread', 'water']
    });

    this.gameStateService.updateSceneRuntimeState('attic', {
      rope_tied: true,
      table_moved: false,
      window_broken: false,
      items_discovered: ['knife', 'rope']
    });

    return this.gameStateService.getGameState();
  }

  /**
   * Modify current state randomly for testing
   */
  modifyStateRandomly(): void {
    const gameState = this.gameStateService.getGameState();
    
    // Random score change
    this.gameStateService.addScore(Math.floor(Math.random() * 100) - 50);
    
    // Random moves
    gameState.moves += Math.floor(Math.random() * 20);
    
    // Random flag
    this.gameStateService.setFlag(`random_flag_${Date.now()}`, Math.random() > 0.5);
    
    // Random variable
    gameState.variables[`random_var_${Date.now()}`] = Math.random().toString();
  }

  /**
   * Get state size for performance testing
   */
  getStateSize(): number {
    const gameState = this.gameStateService.getGameState();
    return JSON.stringify(gameState).length;
  }

  /**
   * Verify state integrity
   */
  verifyStateIntegrity(): void {
    const gameState = this.gameStateService.getGameState();
    
    // Verify required properties exist
    expect(gameState).toHaveProperty('currentSceneId');
    expect(gameState).toHaveProperty('inventory');
    expect(gameState).toHaveProperty('score');
    expect(gameState).toHaveProperty('moves');
    expect(gameState).toHaveProperty('flags');
    expect(gameState).toHaveProperty('variables');
    expect(gameState).toHaveProperty('sceneStates');
    expect(gameState).toHaveProperty('items');
    expect(gameState).toHaveProperty('scenes');
    expect(gameState).toHaveProperty('monsters');

    // Verify data types
    expect(typeof gameState.currentSceneId).toBe('string');
    expect(Array.isArray(gameState.inventory)).toBe(true);
    expect(typeof gameState.score).toBe('number');
    expect(typeof gameState.moves).toBe('number');
    expect(typeof gameState.flags).toBe('object');
    expect(typeof gameState.variables).toBe('object');
    expect(typeof gameState.sceneStates).toBe('object');

    // Verify ranges
    expect(gameState.score).toBeGreaterThanOrEqual(0);
    expect(gameState.moves).toBeGreaterThanOrEqual(0);
  }

  /**
   * Create snapshot of current state
   */
  createStateSnapshot(): GameState {
    return JSON.parse(JSON.stringify(this.gameStateService.getGameState()));
  }

  /**
   * Compare two game states
   */
  compareStates(state1: GameState, state2: GameState): {
    identical: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    if (state1.currentSceneId !== state2.currentSceneId) {
      differences.push(`currentSceneId: ${state1.currentSceneId} vs ${state2.currentSceneId}`);
    }

    if (state1.score !== state2.score) {
      differences.push(`score: ${state1.score} vs ${state2.score}`);
    }

    if (state1.moves !== state2.moves) {
      differences.push(`moves: ${state1.moves} vs ${state2.moves}`);
    }

    if (JSON.stringify(state1.inventory) !== JSON.stringify(state2.inventory)) {
      differences.push(`inventory: different`);
    }

    if (JSON.stringify(state1.flags) !== JSON.stringify(state2.flags)) {
      differences.push(`flags: different`);
    }

    if (JSON.stringify(state1.variables) !== JSON.stringify(state2.variables)) {
      differences.push(`variables: different`);
    }

    return {
      identical: differences.length === 0,
      differences
    };
  }
}