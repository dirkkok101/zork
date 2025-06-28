/**
 * UI Initializer
 * 
 * Responsible for detecting the environment and initializing the appropriate user interface.
 * Handles both web browser and console environments.
 */

import { LoggingService, CommandService } from '../services';
import { GameInterface } from '../ui/GameInterface';
import { GameData } from '../initializers/GameInitializer';

/**
 * UI initialization result
 */
export interface UIResult {
  environment: 'web' | 'console';
  interface: GameInterface | null;
  isReady: boolean;
}

/**
 * UI Initializer Class
 * Handles environment detection and UI setup
 */
export class UIInitializer {
  /**
   * Initialize the appropriate UI for the detected environment
   * @param gameData Loaded game data
   * @param commandService Configured command service
   * @param loggingService Logging service for creating loggers
   * @returns UI initialization result
   */
  static initialize(
    gameData: GameData,
    commandService: CommandService,
    loggingService: LoggingService
  ): UIResult {
    const logger = loggingService.getLogger('UIInitializer');
    
    logger.info('🌐 Initializing user interface...');
    
    try {
      const environment = this.detectEnvironment();
      logger.debug(`Environment detected: ${environment}`);
      
      if (environment === 'web') {
        return this.initializeWebInterface(gameData, commandService, loggingService);
      } else {
        return this.initializeConsoleInterface(gameData, commandService, loggingService);
      }
      
    } catch (error) {
      logger.error('❌ Failed to initialize UI:', error);
      throw error;
    }
  }
  
  /**
   * Detect the current environment
   * @returns Environment type
   */
  private static detectEnvironment(): 'web' | 'console' {
    return typeof window !== 'undefined' ? 'web' : 'console';
  }
  
  /**
   * Initialize web browser interface
   * @param gameData Game data
   * @param commandService Command service
   * @param loggingService Logging service
   * @returns Web UI result
   */
  private static initializeWebInterface(
    _gameData: GameData,
    commandService: CommandService,
    loggingService: LoggingService
  ): UIResult {
    const logger = loggingService.getLogger('UIInitializer');
    
    logger.info('🌐 Initializing web interface...');
    
    // Create and initialize GameInterface
    const gameInterface = new GameInterface(loggingService.getLogger('GameInterface'));
    gameInterface.initialize(commandService);
    
    // Display welcome messages
    this.displayWebWelcomeMessages(gameInterface);
    
    logger.info('✅ Web interface initialized successfully');
    
    return {
      environment: 'web',
      interface: gameInterface,
      isReady: true
    };
  }
  
  /**
   * Initialize console interface (Node.js environment)
   * @param gameData Game data
   * @param commandService Command service
   * @param loggingService Logging service
   * @returns Console UI result
   */
  private static initializeConsoleInterface(
    gameData: GameData,
    commandService: CommandService,
    loggingService: LoggingService
  ): UIResult {
    const logger = loggingService.getLogger('UIInitializer');
    
    logger.info('🖥️ Console environment detected');
    
    // Display game data summary for console
    this.displayConsoleSummary(gameData, commandService, logger);
    
    logger.info('✅ Console interface ready');
    
    return {
      environment: 'console',
      interface: null,
      isReady: true
    };
  }
  
  /**
   * Display welcome messages in web interface
   * @param gameInterface Web game interface
   */
  private static displayWebWelcomeMessages(gameInterface: GameInterface): void {
    // Display authentic Zork welcome
    gameInterface.displayMessage('ZORK I: The Great Underground Empire', 'title');
    gameInterface.displayMessage('Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.', 'subtitle');
    gameInterface.displayMessage('ZORK is a registered trademark of Infocom, Inc.');
    gameInterface.displayMessage('Revision 88 / Serial number 840726');
    gameInterface.displayMessage('');
    
    // Display starting location
    gameInterface.displayMessage('West of House');
    gameInterface.displayMessage('You are standing in an open field west of a white house, with a boarded front door.');
    gameInterface.displayMessage('There is a small mailbox here.');
    gameInterface.displayMessage('');
  }
  
  /**
   * Display summary information in console
   * @param gameData Game data to summarize
   * @param commandService Command service
   * @param logger Logger instance
   */
  private static displayConsoleSummary(
    gameData: GameData,
    commandService: CommandService,
    logger: any
  ): void {
    logger.info('📊 Game Data Summary:');
    logger.info(`  Items: ${gameData.items.length}`);
    logger.info(`  Scenes: ${gameData.scenes.length}`);
    logger.info(`  Monsters: ${gameData.monsters.length}`);
    logger.info(`  Commands: ${commandService.getAllCommands().length}`);
    logger.info('🎯 Ready for web interface testing');
  }
  
  /**
   * Validate UI initialization
   * @param result UI result to validate
   * @param loggingService Logging service for validation logging
   * @throws Error if validation fails
   */
  static validateUI(result: UIResult, loggingService?: LoggingService): void {
    const logger = loggingService?.getLogger('UIInitializer');
    
    if (!result.isReady) {
      throw new Error('UI initialization failed - not ready');
    }
    
    if (result.environment === 'web' && !result.interface) {
      throw new Error('Web environment requires GameInterface instance');
    }
    
    if (result.environment === 'console' && result.interface !== null) {
      throw new Error('Console environment should not have GameInterface instance');
    }
    
    if (logger) {
      logger.debug(`✅ UI validation passed for ${result.environment} environment`);
    }
  }
  
  /**
   * Get UI status information
   * @param result UI result to analyze
   * @returns UI status information
   */
  static getUIStatus(result: UIResult): {
    environment: string;
    hasInterface: boolean;
    isReady: boolean;
    interfaceType: string;
  } {
    return {
      environment: result.environment,
      hasInterface: result.interface !== null,
      isReady: result.isReady,
      interfaceType: result.environment === 'web' ? 'GameInterface' : 'Console'
    };
  }
}
