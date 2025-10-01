/**
 * Service Initializer
 * 
 * Responsible for creating and configuring all game services.
 * Currently uses mock implementations that will be replaced with real services incrementally.
 */

import { LoggingService } from '../services';
import { GameData } from './GameInitializer';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService,
  IScoringService,
  IAIEnhancementService
} from '../services/interfaces';
import { GameStateService } from '../services/GameStateService';
import { SceneService } from '../services/SceneService';
import { InventoryService } from '../services/InventoryService';
import { ItemService } from '../services/ItemService';
import { OutputService } from '../services/OutputService';
import { ScoringService } from '../services/ScoringService';
import { PersistenceService } from '../services/PersistenceService';
import { AIEnhancementService } from '../services/AIEnhancementService';
import { OpenRouterClient } from '../clients/OpenRouterClient';

/**
 * Collection of all game services
 */
export interface Services {
  gameState: IGameStateService;
  scene: ISceneService;
  inventory: IInventoryService;
  items: IItemService;
  combat: ICombatService;
  persistence: IPersistenceService;
  output: IOutputService;
  scoring: IScoringService;
  aiEnhancement: IAIEnhancementService;
}

/**
 * Service Initializer Class
 * Handles creation and configuration of all game services
 */
export class ServiceInitializer {
  /**
   * Initialize all game services
   * @param gameData Loaded game data (items, scenes, monsters, etc.)
   * @param loggingService Logging service for creating loggers
   * @returns Configured service instances
   */
  static initialize(gameData: GameData, loggingService: LoggingService): Services {
    const logger = loggingService.getLogger('ServiceInitializer');
    
    logger.info('⚙️ Initializing game services...');
    
    try {
      // Create mock services (to be replaced with real implementations later)
      const services = this.createMockServices(gameData, loggingService);
      
      logger.debug('Services created:', Object.keys(services));
      logger.info('✅ Game services initialized successfully');
      
      return services;
      
    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }
  
  /**
   * Create service implementations
   * Mix of real and mock implementations as services are built incrementally
   * @param gameData Game data for service initialization
   * @param loggingService Logging service
   * @returns Service implementations
   */
  private static createMockServices(gameData: GameData, loggingService: LoggingService): Services {
    const logger = loggingService.getLogger('ServiceInitializer');
    
    logger.debug('Creating service implementations...');
    
    // Create real services that are implemented
    const gameStateService = new GameStateService('west_of_house', logger);
    
    // Convert arrays to Records for service consumption
    const itemsRecord = gameData.items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
    const scenesRecord = gameData.scenes.reduce((acc, scene) => ({ ...acc, [scene.id]: scene }), {});
    const monstersRecord = gameData.monsters.reduce((acc, monster) => ({ ...acc, [monster.id]: monster }), {});
    
    gameStateService.loadGameData(itemsRecord, scenesRecord, monstersRecord);
    
    const sceneService = new SceneService(gameStateService, logger);
    const inventoryService = new InventoryService(gameStateService, logger);
    const itemService = new ItemService(gameStateService, logger);
    const outputService = new OutputService(logger);
    const scoringService = new ScoringService(gameStateService, logger);
    const persistenceService = new PersistenceService(gameStateService, logger);

    // Create OpenRouter client and AI Enhancement Service
    const openRouterClient = new OpenRouterClient();
    const aiEnhancementService = new AIEnhancementService(openRouterClient);

    // Inject inventory service into scene service to handle dynamic conditions
    sceneService.setInventoryService(inventoryService);

    // Inject scoring service into scene service to handle first visit scoring
    sceneService.setScoringService(scoringService);

    // Inject dependencies into AI Enhancement Service (setter injection for circular deps)
    aiEnhancementService.setDependencies(gameStateService, sceneService, itemService);

    const services: Services = {
      gameState: gameStateService,
      scene: sceneService,
      inventory: inventoryService,
      items: itemService,
      combat: null as any, // Still mock - not needed for current commands
      persistence: persistenceService,
      output: outputService,
      scoring: scoringService,
      aiEnhancement: aiEnhancementService
    };
    
    logger.debug('✅ Services created (mix of real and mock implementations)');
    
    return services;
  }
  
  /**
   * Validate that all required services are available
   * @param services Services to validate
   * @param loggingService Logging service for validation logging
   * @throws Error if validation fails
   */
  static validateServices(services: Services, loggingService?: LoggingService): void {
    const logger = loggingService?.getLogger('ServiceInitializer');
    
    const requiredServices = [
      'gameState', 'scene', 'inventory', 'items', 
      'combat', 'persistence', 'output'
    ] as const;
    
    for (const serviceName of requiredServices) {
      // For now, we allow null services since they are mocks
      // This validation will be stricter when real services are implemented
      if (!(serviceName in services)) {
        throw new Error(`Required service '${serviceName}' is missing`);
      }
    }
    
    if (logger) {
      logger.debug('✅ Service validation passed (mock services present)');
    }
  }
  
  /**
   * Get information about which services are real vs mock
   * Useful for debugging and development
   * @param services Services to analyze
   * @returns Service implementation status
   */
  static getServiceStatus(services: Services): Record<string, 'mock' | 'real'> {
    return {
      gameState: services.gameState === null ? 'mock' : 'real',
      scene: services.scene === null ? 'mock' : 'real',
      inventory: services.inventory === null ? 'mock' : 'real',
      items: services.items === null ? 'mock' : 'real',
      combat: services.combat === null ? 'mock' : 'real',
      persistence: services.persistence === null ? 'mock' : 'real',
      output: services.output === null ? 'mock' : 'real'
    };
  }
}