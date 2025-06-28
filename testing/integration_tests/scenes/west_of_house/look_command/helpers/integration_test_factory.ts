/**
 * Integration Test Factory
 * Creates and configures real services and game environment for integration testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import LoggingService from '@/services/LoggingService';
import { WestOfHouseHelper } from './west_of_house_helper';
import { LookCommandHelper } from './look_command_helper';
import log from 'loglevel';

export interface IntegrationTestEnvironment {
  services: Services;
  westOfHouseHelper: WestOfHouseHelper;
  lookCommandHelper: LookCommandHelper;
  cleanup: () => void;
}

export class IntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and data
   */
  static async createTestEnvironment(): Promise<IntegrationTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN); // Reduce noise in tests
    
    // Use the same initialization path as production
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services with mock combat and persistence
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Replace null services with mocks for the ones we don't use in look command
    if (!services.combat) {
      services.combat = IntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = IntegrationTestFactory.createMockPersistenceService() as any;
    }
    
    // Ensure player starts in west_of_house
    services.gameState.setCurrentScene('west_of_house');
    
    // Create test helpers
    const westOfHouseHelper = new WestOfHouseHelper(
      services.gameState as any,
      services.scene as any
    );
    
    const lookCommandHelper = new LookCommandHelper(
      services.gameState as any,
      services.scene as any,
      services.inventory as any,
      services.items as any,
      services.combat,
      services.persistence,
      services.output as any
    );
    
    // Reset to clean state
    westOfHouseHelper.resetScene();
    
    const cleanup = () => {
      // Clean up any test data
      westOfHouseHelper.clearTestItems();
      westOfHouseHelper.resetScene();
    };
    
    return {
      services,
      westOfHouseHelper,
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