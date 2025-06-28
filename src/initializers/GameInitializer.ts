/**
 * Game Initializer
 * 
 * Responsible for loading all game data and initializing the starting game state.
 * This includes items, scenes, monsters, and the player's initial state.
 */

import { ItemDataLoader } from '../data_loaders';
import { SceneDataLoader } from '../data_loaders/SceneDataLoader';
import { MonsterDataLoader } from '../data_loaders/MonsterDataLoader';
import { LoggingService } from '../services';
import { Item } from '../types/ItemTypes';
import { Scene } from '../types/SceneTypes';
import { Monster } from '../types/Monster';
import {GameState} from '../types/GameState';

/**
 * Game data loaded from files
 */
export interface GameData {
  items: Item[];
  scenes: Scene[];
  monsters: Monster[];
  gameState: GameState;
}

/**
 * Game Initializer Class
 * Handles all game data loading and initial state setup
 */
export class GameInitializer {
  /**
   * Initialize all game data and starting state
   * @param loggingService Logging service for creating loggers
   * @returns Promise resolving to loaded game data
   */
  static async initialize(loggingService: LoggingService): Promise<GameData> {
    const logger = loggingService.getLogger('GameInitializer');
    
    logger.info('🎮 Starting game data initialization...');
    
    try {
      // Phase 1: Load all game data
      logger.info('📚 Loading game data from files...');
      const startTime = Date.now();
      
      // Use environment-appropriate paths
      const dataPathPrefix = typeof window !== 'undefined' ? '/' : 'data/';
      
      const itemLoader = new ItemDataLoader(`${dataPathPrefix}items/`, loggingService.getLogger('ItemDataLoader'));
      const sceneLoader = new SceneDataLoader(`${dataPathPrefix}scenes/`, loggingService.getLogger('SceneDataLoader'));
      const monsterLoader = new MonsterDataLoader(`${dataPathPrefix}monsters/`, loggingService.getLogger('MonsterDataLoader'));
      
      // Load all data in parallel for performance
      const [items, scenes, monsters] = await Promise.all([
        itemLoader.loadAllItems(),
        sceneLoader.loadAllScenes(),
        monsterLoader.loadAllMonsters()
      ]);
      
      const loadTime = Date.now() - startTime;
      logger.info(`✅ Loaded ${items.length} items, ${scenes.length} scenes, ${monsters.length} monsters in ${loadTime}ms`);
      
      // Phase 2: Initialize starting game state
      logger.debug('Initializing starting game state...');
      const gameState = this.createInitialGameState(items, scenes, monsters);
      logger.debug(`Game state initialized with starting scene: ${gameState.currentSceneId}`);
      
      const gameData: GameData = {
        items,
        scenes,
        monsters,
        gameState
      };
      
      logger.info('✅ Game data initialization complete!');
      return gameData;
      
    } catch (error) {
      logger.error('❌ Failed to initialize game data:', error);
      throw error;
    }
  }
  
  /**
   * Create the initial game state
   * @param items Loaded items array
   * @param scenes Loaded scenes array  
   * @param monsters Loaded monsters array
   * @returns Initial game state configuration
   */
  private static createInitialGameState(items: Item[], scenes: Scene[], monsters: Monster[]): GameState {
    // Convert arrays to Records indexed by id
    const itemsRecord: Record<string, Item> = {};
    items.forEach(item => {
      itemsRecord[item.id] = item;
    });
    
    const scenesRecord: Record<string, Scene> = {};
    scenes.forEach(scene => {
      scenesRecord[scene.id] = scene;
    });
    
    const monstersRecord: Record<string, Monster> = {};
    monsters.forEach(monster => {
      monstersRecord[monster.id] = monster;
    });
    
    return {
      currentSceneId: 'west_of_house', // Starting location in Zork
      inventory: [],                   // Empty inventory
      sceneStates: {},                 // No scenes visited yet
      score: 0,                       // Starting score
      moves: 0,                       // No moves taken yet
      flags: {},                      // No flags set initially (Record, not Map)
      variables: {},                  // No variables set initially
      items: itemsRecord,             // Items indexed by id
      scenes: scenesRecord,           // Scenes indexed by id
      monsters: monstersRecord        // Monsters indexed by id
    };
  }
  
  /**
   * Validate that essential game data was loaded
   * @param gameData Game data to validate
   * @param loggingService Logging service for validation logging
   * @throws Error if validation fails
   */
  static validateGameData(gameData: GameData, loggingService?: LoggingService): void {
    const logger = loggingService?.getLogger('GameInitializer');
    
    if (!gameData.items || gameData.items.length === 0) {
      throw new Error('No items were loaded');
    }
    
    if (!gameData.scenes || gameData.scenes.length === 0) {
      throw new Error('No scenes were loaded');
    }
    
    if (!gameData.monsters || gameData.monsters.length === 0) {
      throw new Error('No monsters were loaded');
    }
    
    // Validate starting scene exists
    const startingScene = gameData.scenes.find(scene => scene.id === gameData.gameState.currentSceneId);
    if (!startingScene) {
      throw new Error(`Starting scene '${gameData.gameState.currentSceneId}' not found in loaded scenes`);
    }
    
    if (logger) {
      logger.debug('✅ Game data validation passed');
    }
  }
}
