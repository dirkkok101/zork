/**
 * Integration Test Factory for Kitchen Scene
 * Creates and configures real services and game environment for integration testing
 */

import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer, Services } from '@/initializers/ServiceInitializer';
import { CommandInitializer } from '@/initializers/CommandInitializer';
import { CommandProcessor } from '@/services/CommandProcessor';
import LoggingService from '@/services/LoggingService';
import { KitchenHelper } from './kitchen_helper';
import { LookCommandHelper } from './look_command_helper';
import { MoveCommandHelper } from '../../move_command/helpers/move_command_helper';
import { OpenCommandHelper } from '../../open_command/helpers/open_command_helper';
import { CloseCommandHelper } from '../../close_command/helpers/close_command_helper';
import { ExamineCommandHelper } from '../../examine_command/helpers/examine_command_helper';
import log from 'loglevel';

export interface KitchenTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  kitchenHelper: KitchenHelper;
  lookCommandHelper: LookCommandHelper;
  moveCommandHelper: MoveCommandHelper;
  openCommandHelper: OpenCommandHelper;
  closeCommandHelper: CloseCommandHelper;
  examineCommandHelper: ExamineCommandHelper;
  cleanup: () => void;
}

export class KitchenIntegrationTestFactory {
  /**
   * Create a complete integration test environment with real services and data
   */
  static async createTestEnvironment(): Promise<KitchenTestEnvironment> {
    // Set up logging for tests
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN); // Reduce noise in tests
    
    // Use the same initialization path as production
    const gameData = await GameInitializer.initialize(loggingService);
    
    // Initialize real services with mock combat and persistence
    const services = ServiceInitializer.initialize(gameData, loggingService);
    
    // Replace null services with mocks for the ones we don't use in look command
    if (!services.combat) {
      services.combat = KitchenIntegrationTestFactory.createMockCombatService() as any;
    }
    if (!services.persistence) {
      services.persistence = KitchenIntegrationTestFactory.createMockPersistenceService() as any;
    }
    
    // Initialize command service and processor
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Ensure player starts in kitchen
    services.gameState.setCurrentScene('kitchen');
    
    // Create test helpers
    const kitchenHelper = new KitchenHelper(
      services.gameState as any,
      services.scene as any
    );
    
    const lookCommandHelper = new LookCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    const moveCommandHelper = new MoveCommandHelper(
      commandProcessor,
      services.gameState as any,
      services.scene as any
    );

    const openCommandHelper = new OpenCommandHelper(
      commandProcessor,
      services.gameState as any,
      services.items as any
    );

    const closeCommandHelper = new CloseCommandHelper(
      commandProcessor,
      services.gameState as any
    );

    const examineCommandHelper = new ExamineCommandHelper(
      commandProcessor,
      services.gameState as any
    );
    
    // Reset to clean state
    kitchenHelper.resetScene();
    
    const cleanup = () => {
      // Clean up any test data
      kitchenHelper.clearTestItems();
      kitchenHelper.resetScene();
    };
    
    return {
      services,
      commandProcessor,
      kitchenHelper,
      lookCommandHelper,
      moveCommandHelper,
      openCommandHelper,
      closeCommandHelper,
      examineCommandHelper,
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