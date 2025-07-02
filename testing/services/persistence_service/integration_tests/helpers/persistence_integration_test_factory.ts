/**
 * Persistence Integration Test Factory
 * Creates and configures real services and game environment for persistence testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import { PersistenceService } from '@/services/PersistenceService';
import LoggingService from '@/services/LoggingService';
import { PersistenceTestHelper } from './persistence_test_helper';
import { GameStateTestHelper } from './game_state_test_helper';
import log from 'loglevel';

export interface PersistenceIntegrationTestEnvironment {
  services: Services;
  persistenceService: PersistenceService;
  commandProcessor: CommandProcessor;
  persistenceHelper: PersistenceTestHelper;
  gameStateHelper: GameStateTestHelper;
  cleanup: () => void;
  resetGameState: () => void;
}

export class PersistenceIntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and localStorage
   */
  static async createTestEnvironment(): Promise<PersistenceIntegrationTestEnvironment> {
    // Set up logging for tests (reduce noise)
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);
    
    // Initialize real game data
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Ensure we have a real PersistenceService (not mock)
    if (!services.persistence || typeof services.persistence.saveGame !== 'function') {
      throw new Error('PersistenceService not properly initialized in test environment');
    }
    
    const persistenceService = services.persistence as PersistenceService;
    
    // Add mock combat service if needed
    if (!services.combat) {
      services.combat = PersistenceIntegrationTestFactory.createMockCombatService() as any;
    }
    
    // Initialize command service and processor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Create test helpers
    const persistenceHelper = new PersistenceTestHelper(
      persistenceService,
      services.gameState
    );
    
    const gameStateHelper = new GameStateTestHelper(
      services.gameState
    );
    
    // Set up initial game state
    PersistenceIntegrationTestFactory.setupInitialGameState(services);
    
    const cleanup = () => {
      // Clear localStorage
      localStorage.clear();
      
      // Clear in-memory storage
      PersistenceService.clearInMemoryStorage();
      
      // Reset game state
      PersistenceIntegrationTestFactory.setupInitialGameState(services);
    };
    
    const resetGameState = () => {
      PersistenceIntegrationTestFactory.setupInitialGameState(services);
    };
    
    return {
      services,
      persistenceService,
      commandProcessor,
      persistenceHelper,
      gameStateHelper,
      cleanup,
      resetGameState
    };
  }
  
  /**
   * Set up a clean initial game state for testing
   */
  private static setupInitialGameState(services: Services): void {
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
   * Create a complex game state for testing
   */
  static createComplexGameState(services: Services): void {
    // Set different scene
    services.gameState.setCurrentScene('living_room');
    
    // Add items to inventory
    const gameState = services.gameState.getGameState();
    gameState.inventory.push('lamp', 'sword');
    
    // Set score and moves
    services.gameState.addScore(150);
    gameState.moves = 42;
    
    // Set various flags
    services.gameState.setFlag('trophy_case_opened', true);
    services.gameState.setFlag('mailbox_opened', true);
    services.gameState.setFlag('first_treasure_found', true);
    
    // Set variables
    gameState.variables['lamp_fuel'] = 85;
    gameState.variables['thief_location'] = 'maze';
    
    // Mark scenes as visited
    services.gameState.markSceneVisited('west_of_house');
    services.gameState.markSceneVisited('behind_house');
    services.gameState.markSceneVisited('kitchen');
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
  static verifyTestEnvironment(env: PersistenceIntegrationTestEnvironment): void {
    // Verify localStorage is available
    expect(typeof localStorage).toBe('object');
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
    
    // Verify services are real (not mocks)
    expect(env.persistenceService).toBeInstanceOf(PersistenceService);
    expect(typeof env.persistenceService.saveGame).toBe('function');
    expect(typeof env.persistenceService.restoreGame).toBe('function');
    expect(typeof env.persistenceService.hasSavedGame).toBe('function');
    
    // Verify game state is properly initialized
    expect(env.services.gameState.getCurrentScene()).toBe('west_of_house');
    expect(env.services.gameState.getScore()).toBe(0);
    
    // Verify localStorage is empty initially
    expect(localStorage.length).toBe(0);
  }
}