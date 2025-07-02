/**
 * Save Command Integration Test Factory
 * Creates and configures test environment for SaveCommand integration testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import { PersistenceService } from '@/services/PersistenceService';
import LoggingService from '@/services/LoggingService';
import { SaveCommandHelper } from './save_command_helper';
import { GameStateManipulationHelper } from './game_state_manipulation_helper';
import log from 'loglevel';

export interface SaveCommandIntegrationTestEnvironment {
  services: Services;
  persistenceService: PersistenceService;
  commandProcessor: CommandProcessor;
  saveCommandHelper: SaveCommandHelper;
  gameStateHelper: GameStateManipulationHelper;
  cleanup: () => void;
  resetGameState: () => void;
}

export class SaveCommandIntegrationTestFactory {
  /**
   * Create a complete test environment for SaveCommand integration testing
   */
  static async createTestEnvironment(): Promise<SaveCommandIntegrationTestEnvironment> {
    // Set up logging for tests (reduce noise)
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);
    
    // Initialize real game data
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Ensure we have a real PersistenceService
    if (!services.persistence || typeof services.persistence.saveGame !== 'function') {
      throw new Error('PersistenceService not properly initialized in SaveCommand test environment');
    }
    
    const persistenceService = services.persistence as PersistenceService;
    
    // Add mock combat service if needed
    if (!services.combat) {
      services.combat = SaveCommandIntegrationTestFactory.createMockCombatService() as any;
    }
    
    // Initialize command service and processor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Create test helpers
    const saveCommandHelper = new SaveCommandHelper(
      commandProcessor,
      persistenceService,
      services.gameState
    );
    
    const gameStateHelper = new GameStateManipulationHelper(
      services.gameState,
      services.scene,
      services.inventory,
      services.items
    );
    
    // Set up initial clean game state
    SaveCommandIntegrationTestFactory.setupCleanGameState(services);
    
    const cleanup = () => {
      // Clear localStorage
      localStorage.clear();
      
      // Clear in-memory storage
      PersistenceService.clearInMemoryStorage();
      
      // Reset game state
      SaveCommandIntegrationTestFactory.setupCleanGameState(services);
    };
    
    const resetGameState = () => {
      SaveCommandIntegrationTestFactory.setupCleanGameState(services);
    };
    
    return {
      services,
      persistenceService,
      commandProcessor,
      saveCommandHelper,
      gameStateHelper,
      cleanup,
      resetGameState
    };
  }
  
  /**
   * Set up a clean initial game state for testing
   */
  private static setupCleanGameState(services: Services): void {
    // Reset to west_of_house
    services.gameState.setCurrentScene('west_of_house');
    
    // Clear inventory
    const currentInventory = services.gameState.getGameState().inventory;
    currentInventory.length = 0;
    
    // Reset score and moves
    const currentScore = services.gameState.getScore();
    if (currentScore !== 0) {
      services.gameState.addScore(-currentScore);
    }
    
    // Reset moves counter
    const gameState = services.gameState.getGameState();
    gameState.moves = 0;
    
    // Clear all flags
    gameState.flags = {};
    
    // Clear variables
    gameState.variables = {};
    
    // Clear scene states
    gameState.sceneStates = {};
  }
  
  /**
   * Create a specific game state scenario for testing
   */
  static createTestScenario(
    services: Services,
    scenario: 'minimal' | 'complex' | 'large' | 'endgame'
  ): void {
    SaveCommandIntegrationTestFactory.setupCleanGameState(services);
    
    switch (scenario) {
      case 'minimal':
        // Already clean - minimal state
        break;
        
      case 'complex':
        // Set up complex game state
        services.gameState.setCurrentScene('living_room');
        const gameState = services.gameState.getGameState();
        gameState.inventory.push('lamp', 'sword');
        services.gameState.addScore(125);
        gameState.moves = 45;
        services.gameState.setFlag('trophy_case_opened', true);
        services.gameState.setFlag('mailbox_opened', true);
        gameState.variables['lamp_fuel'] = 80;
        services.gameState.markSceneVisited('west_of_house');
        services.gameState.markSceneVisited('behind_house');
        break;
        
      case 'large':
        // Set up large game state with many elements
        services.gameState.setCurrentScene('maze_1');
        const largeState = services.gameState.getGameState();
        largeState.inventory.push('lamp', 'sword', 'rope', 'bottle', 'garlic', 'coins');
        services.gameState.addScore(650);
        largeState.moves = 1250;
        
        // Many flags
        const flags = ['trophy_case_opened', 'mailbox_opened', 'thief_encountered', 
                      'grating_open', 'dam_destroyed', 'all_treasures_found'];
        flags.forEach(flag => services.gameState.setFlag(flag, true));
        
        // Many variables
        largeState.variables['lamp_fuel'] = 25;
        largeState.variables['thief_location'] = 'defeated';
        largeState.variables['treasure_count'] = 15;
        largeState.variables['player_health'] = 100;
        
        // Many visited scenes
        const scenes = ['west_of_house', 'behind_house', 'kitchen', 'living_room', 
                       'attic', 'cellar', 'grating_room', 'troll_room'];
        scenes.forEach(scene => {
          try {
            services.gameState.markSceneVisited(scene);
          } catch (error) {
            // Some scenes might not exist in test data
          }
        });
        break;
        
      case 'endgame':
        // Set up near-endgame state
        services.gameState.setCurrentScene('treasure_room');
        const endState = services.gameState.getGameState();
        endState.inventory.push('lamp');
        services.gameState.addScore(350);
        endState.moves = 500;
        services.gameState.setFlag('all_treasures_found', true);
        services.gameState.setFlag('endgame_reached', true);
        endState.variables['final_score'] = 350;
        break;
    }
  }
  
  /**
   * Create mock combat service for testing
   */
  private static createMockCombatService() {
    return {
      getMonstersInScene: jest.fn(() => []),
      isInCombat: jest.fn(() => false),
      startCombat: jest.fn(),
      endCombat: jest.fn(),
      processCombatTurn: jest.fn(() => ({ success: true, message: 'Mock combat' }))
    };
  }
  
  /**
   * Verify test environment is properly set up
   */
  static verifyTestEnvironment(env: SaveCommandIntegrationTestEnvironment): void {
    // Verify localStorage is available
    expect(typeof localStorage).toBe('object');
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
    
    // Verify services are real (not mocks)
    expect(env.persistenceService).toBeInstanceOf(PersistenceService);
    expect(typeof env.persistenceService.saveGame).toBe('function');
    
    // Verify command processor is configured
    expect(env.commandProcessor).toBeDefined();
    expect(typeof env.commandProcessor.processCommand).toBe('function');
    
    // Verify game state is properly initialized
    expect(env.services.gameState.getCurrentScene()).toBe('west_of_house');
    expect(env.services.gameState.getScore()).toBe(0);
    
    // Verify localStorage is empty initially
    expect(localStorage.length).toBe(0);
    
    // Verify SaveCommand is registered
    const saveResult = env.commandProcessor.processCommand('save');
    expect(saveResult).toBeDefined();
    expect(typeof saveResult.success).toBe('boolean');
  }
  
  /**
   * Create multiple test environments for concurrent testing
   */
  static async createMultipleTestEnvironments(
    count: number
  ): Promise<SaveCommandIntegrationTestEnvironment[]> {
    const environments: SaveCommandIntegrationTestEnvironment[] = [];
    
    for (let i = 0; i < count; i++) {
      const env = await SaveCommandIntegrationTestFactory.createTestEnvironment();
      environments.push(env);
    }
    
    return environments;
  }
}