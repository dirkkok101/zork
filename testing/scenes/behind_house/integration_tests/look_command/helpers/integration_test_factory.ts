/**
 * Integration Test Factory for Behind House
 * Auto-generated factory for behind_house scene tests
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import LoggingService from '@/services/LoggingService';
import { BehindHouseHelper } from './behind_house_helper';
import { LookCommandHelper } from '@testing/helpers/LookCommandHelper';
import log from 'loglevel';

export interface BehindHouseTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  behindHouseHelper: BehindHouseHelper;
  lookCommandHelper: LookCommandHelper;
  cleanup: () => void;
  resetScoring: () => void;
}

export class BehindHouseIntegrationTestFactory {
  /**
   * Create a complete integration test environment for Behind House
   */
  static async createTestEnvironment(): Promise<BehindHouseTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);

    // Initialize game data and services
    const gameData = await GameInitializer.initialize(loggingService);
    const services = ServiceInitializer.initialize(gameData, loggingService);

    // Add mock services if needed
    if (!services.combat) {
      services.combat = BehindHouseIntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = BehindHouseIntegrationTestFactory.createMockPersistenceService() as any;
    }

    // Initialize commands
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );

    // Set player to behind_house scene
    services.gameState.setCurrentScene('behind_house');

    // Create helpers
    const behindHouseHelper = new BehindHouseHelper(
      services.gameState as any,
      services.scene as any
    );

    const lookCommandHelper = new LookCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    // Reset scene to clean state
    behindHouseHelper.resetScene();

    const cleanup = () => {
      behindHouseHelper.resetScene();
    };

    const resetScoring = () => {
      // Reset score to 0
      services.gameState.addScore(-services.gameState.getScore());

      // Clear treasure flags
      const treasureIds = ['coin', 'lamp', 'egg', 'bar', 'emera', 'ruby', 'diamo', 'saffr', 'chali', 'tride', 'bauble', 'coffi'];
      treasureIds.forEach(treasureId => {
        services.gameState.setFlag(`treasure_found_${treasureId}`, false);
        services.gameState.setFlag(`treasure_deposited_${treasureId}`, false);
      });

      // Clear scoring event flags
      const eventIds = ['first_treasure', 'defeat_troll', 'defeat_thief', 'open_trophy_case', 'solve_maze', 'reach_endgame'];
      eventIds.forEach(eventId => {
        services.gameState.setFlag(`scoring_event_${eventId}`, false);
      });
    };

    return {
      services,
      commandProcessor,
      behindHouseHelper,
      lookCommandHelper,
      cleanup,
      resetScoring
    };
  }

  /**
   * Create mock combat service
   */
  private static createMockCombatService(): any {
    return {
      initiateCombat: jest.fn(),
      processCombatTurn: jest.fn(),
      getCombatState: jest.fn(() => null),
      isInCombat: jest.fn(() => false),
      endCombat: jest.fn()
    };
  }

  /**
   * Create mock persistence service
   */
  private static createMockPersistenceService(): any {
    return {
      saveGame: jest.fn(),
      loadGame: jest.fn(),
      listSaves: jest.fn(() => []),
      deleteSave: jest.fn()
    };
  }
}
