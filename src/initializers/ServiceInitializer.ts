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
  IOutputService
} from '../services/interfaces';

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
   * Create mock service implementations
   * These will be replaced with real services incrementally
   * @param gameData Game data for service initialization
   * @param loggingService Logging service
   * @returns Mock service implementations
   */
  private static createMockServices(_gameData: GameData, loggingService: LoggingService): Services {
    const logger = loggingService.getLogger('ServiceInitializer');
    
    logger.debug('Creating mock service implementations...');
    
    // TODO: Replace these mocks with real service implementations as they are built
    const services: Services = {
      gameState: null as any,
      scene: null as any,
      inventory: null as any,
      items: null as any,
      combat: null as any,
      persistence: null as any,
      output: null as any
    };
    
    logger.debug('✅ Mock services created (ready for real implementations)');
    
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