import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import LoggingService from '@/services/LoggingService';
import { LivingRoomHelper } from './living_room_helper';
import { TrophyCaseHelper } from './trophy_case_helper';
import log from 'loglevel';

export interface LivingRoomTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  livingRoomHelper: LivingRoomHelper;
  trophyCaseHelper: TrophyCaseHelper;
  cleanup: () => void;
}

/**
 * Integration Test Factory for Living Room
 * Creates a complete test environment with all services and helpers
 * Follows the same pattern as kitchen tests - loads real data from JSON files
 * Specialized for testing trophy case mechanics and scoring integration
 */
export class IntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and data
   * Follows the kitchen test pattern using GameInitializer to load actual JSON data
   */
  static async createTestEnvironment(): Promise<LivingRoomTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN); // Reduce noise in tests
    
    // Use the same initialization path as production - loads real JSON data
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services with mock combat and persistence
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Replace null services with mocks for the ones we don't use in living room tests
    if (!services.combat) {
      services.combat = IntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = IntegrationTestFactory.createMockPersistenceService() as any;
    }
    
    // Initialize command service and processor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Ensure player starts in living room
    services.gameState.setCurrentScene('living_room');
    
    // Create test helpers
    const livingRoomHelper = new LivingRoomHelper(
      services.gameState as any,
      services.items as any,
      services.scene as any,
      services.scoring as any
    );
    
    const trophyCaseHelper = new TrophyCaseHelper(
      services.gameState as any,
      services.items as any,
      services.scoring as any,
      livingRoomHelper
    );
    
    // Reset to clean state
    livingRoomHelper.setupLivingRoom();
    livingRoomHelper.resetScoringState();
    
    const cleanup = () => {
      // Clean up any test data
      livingRoomHelper.clearTreasures();
      livingRoomHelper.resetScoringState();
    };
    
    return {
      services,
      commandProcessor,
      livingRoomHelper,
      trophyCaseHelper,
      cleanup
    };
  }

  /**
   * Create a test environment with mock combat service
   * Combat isn't needed for living room tests but is required by interfaces
   */
  static createMockCombatService() {
    return {
      getMonstersInScene: jest.fn().mockReturnValue([]),
      canAttack: jest.fn().mockReturnValue(false),
      attack: jest.fn().mockReturnValue({ success: false, message: 'Mock combat' }),
      giveToMonster: jest.fn().mockReturnValue({ success: false, message: 'Mock give' }),
      sayToMonster: jest.fn().mockReturnValue({ success: false, message: 'Mock say' })
    };
  }

  /**
   * Create a test environment with mock persistence service
   * Persistence isn't needed for living room tests but is required by interfaces
   */
  static createMockPersistenceService() {
    return {
      saveGame: jest.fn().mockResolvedValue(true),
      restoreGame: jest.fn().mockResolvedValue(true),
      hasSavedGame: jest.fn().mockReturnValue(false)
    };
  }

}