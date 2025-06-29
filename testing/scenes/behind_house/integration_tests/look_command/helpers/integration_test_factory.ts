/**
 * Integration Test Factory for Behind House Scene
 * Creates and configures real services and game environment for integration testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import LoggingService from '@/services/LoggingService';
import { CommandProcessor } from '@/services/CommandProcessor';
import { BehindHouseHelper } from './behind_house_helper';
import { LookCommandHelper } from './look_command_helper';
import log from 'loglevel';

export interface BehindHouseTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  behindHouseHelper: BehindHouseHelper;
  lookCommandHelper: LookCommandHelper;
  cleanup: () => void;
}

export class BehindHouseIntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and data
   */
  static async createTestEnvironment(): Promise<BehindHouseTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN); // Reduce noise in tests
    
    // Use the same initialization path as production
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services with mock combat and persistence
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Replace null services with mocks for the ones we don't use in look command
    if (!services.combat) {
      services.combat = BehindHouseIntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = BehindHouseIntegrationTestFactory.createMockPersistenceService() as any;
    }
    
    // Ensure player starts in behind_house
    services.gameState.setCurrentScene('behind_house');
    
    // Initialize commands and create CommandProcessor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Create test helpers
    const behindHouseHelper = new BehindHouseHelper(
      services.gameState as any,
      services.scene as any
    );
    
    const lookCommandHelper = new LookCommandHelper(
      commandProcessor,
      services.gameState
    );
    
    // Reset to clean state
    behindHouseHelper.resetScene();
    
    const cleanup = () => {
      // Clean up any test data
      behindHouseHelper.clearTestItems();
      behindHouseHelper.resetScene();
    };
    
    return {
      services,
      commandProcessor,
      behindHouseHelper,
      lookCommandHelper,
      cleanup
    };
  }

  /**
   * Create a test environment with mock combat and persistence services
   * These aren't needed for look command tests but are required by the interfaces
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

  static createMockPersistenceService() {
    return {
      saveGame: jest.fn().mockResolvedValue(true),
      restoreGame: jest.fn().mockResolvedValue(true),
      hasSavedGame: jest.fn().mockReturnValue(false)
    };
  }
}