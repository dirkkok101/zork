/**
 * Attic Integration Test Factory
 * Creates and configures real services and game environment for attic integration testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import LoggingService from '@/services/LoggingService';
import { AtticHelper } from './attic_helper';
import { LookCommandHelper } from './look_command_helper';
import { MoveCommandHelper } from '../../move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '../../open_command/helpers/open_command_helper';
import { TakeCommandHelper } from '../../take_command/helpers/take_command_helper';
import { ExamineCommandHelper } from '../../examine_command/helpers/examine_command_helper';
import { WeightBasedExitHelper } from '../../weight_based_exit/helpers/weight_based_exit_helper';
import log from 'loglevel';

export interface AtticTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  atticHelper: AtticHelper;
  lookCommandHelper: LookCommandHelper;
  moveCommandHelper: MoveCommandHelper;
  openCommandHelper: OpenCommandHelper;
  takeCommandHelper: TakeCommandHelper;
  examineCommandHelper: ExamineCommandHelper;
  weightBasedExitHelper: WeightBasedExitHelper;
  cleanup: () => void;
}

export class AtticIntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and data
   */
  static async createTestEnvironment(): Promise<AtticTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN); // Reduce noise in tests
    
    // Use the same initialization path as production
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services with mock combat and persistence
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Replace null services with mocks for the ones we don't use in attic tests
    if (!services.combat) {
      services.combat = AtticIntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = AtticIntegrationTestFactory.createMockPersistenceService() as any;
    }
    
    // Initialize command service and processor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Ensure player starts in attic
    services.gameState.setCurrentScene('attic');
    
    // Create test helpers
    const atticHelper = new AtticHelper(
      services.gameState as any,
      services.scene as any,
      services.items as any
    );
    
    const lookCommandHelper = new LookCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    const moveCommandHelper = new MoveCommandHelper(
      commandProcessor,
      services.gameState as any,
      services.scene as any,
      services.items as any
    );

    const openCommandHelper = new OpenCommandHelper(
      commandProcessor,
      services.gameState as any,
      services.items as any
    );

    const takeCommandHelper = new TakeCommandHelper(
      commandProcessor,
      services.gameState as any,
      services.items as any
    );

    const examineCommandHelper = new ExamineCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    const weightBasedExitHelper = new WeightBasedExitHelper(
      commandProcessor,
      services.gameState as any,
      services.scene as any,
      services.items as any
    );
    
    // Reset to clean state
    atticHelper.resetScene();
    
    const cleanup = () => {
      // Clean up any test data
      atticHelper.clearTestItems();
      atticHelper.resetScene();
    };
    
    return {
      services,
      commandProcessor,
      atticHelper,
      lookCommandHelper,
      moveCommandHelper,
      openCommandHelper,
      takeCommandHelper,
      examineCommandHelper,
      weightBasedExitHelper,
      cleanup
    };
  }

  /**
   * Create a test environment with mock combat and persistence services
   * These aren't needed for attic tests but are required by the interfaces
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