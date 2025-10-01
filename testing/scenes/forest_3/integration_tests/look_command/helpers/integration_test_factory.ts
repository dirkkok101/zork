/**
 * Integration Test Factory for Forest
 * Auto-generated factory for forest_3 scene tests
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import LoggingService from '@/services/LoggingService';
import { Forest3Helper } from './forest_3_helper';
import { LookCommandHelper } from '@testing/helpers/LookCommandHelper';
import log from 'loglevel';

export interface Forest3TestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  forest3Helper: Forest3Helper;
  lookCommandHelper: LookCommandHelper;
  cleanup: () => void;
  resetScoring: () => void;
}

export class Forest3IntegrationTestFactory {
  /**
   * Create a complete integration test environment for Forest
   */
  static async createTestEnvironment(): Promise<Forest3TestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);

    // Initialize game data and services
    const gameData = await GameInitializer.initialize(loggingService);
    const services = ServiceInitializer.initialize(gameData, loggingService);

    // Add mock services if needed
    if (!services.combat) {
      services.combat = Forest3IntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = Forest3IntegrationTestFactory.createMockPersistenceService() as any;
    }

    // Initialize commands
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );

    // Set player to forest_3 scene
    services.gameState.setCurrentScene('forest_3');

    // Create helpers
    const forest3Helper = new Forest3Helper(
      services.gameState as any,
      services.scene as any
    );

    const lookCommandHelper = new LookCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    // Reset scene to clean state
    forest3Helper.resetScene();

    const cleanup = () => {
      forest3Helper.resetScene();
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
      forest3Helper,
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
