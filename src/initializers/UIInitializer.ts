/**
 * UI Initializer
 * 
 * Responsible for detecting the environment and initializing the appropriate user interface.
 * Handles both web browser and console environments.
 */

import { LoggingService } from '../services';
import { CommandProcessor } from '../services/CommandProcessor';
import { GameInterface, ModeSelectionDialog, EnhancedModeSetup } from '../ui';
import { GameData } from '../initializers/GameInitializer';
import { Services } from '../initializers/ServiceInitializer';

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
   * @param commandProcessor Configured command processor
   * @param services All game services
   * @param loggingService Logging service for creating loggers
   * @returns Promise that resolves to UI initialization result
   */
  static async initialize(
    gameData: GameData,
    commandProcessor: CommandProcessor,
    services: Services,
    loggingService: LoggingService
  ): Promise<UIResult> {
    const logger = loggingService.getLogger('UIInitializer');

    logger.info('🌐 Initializing user interface...');

    try {
      const environment = this.detectEnvironment();
      logger.debug(`Environment detected: ${environment}`);

      if (environment === 'web') {
        return await this.initializeWebInterface(gameData, commandProcessor, services, loggingService);
      } else {
        return this.initializeConsoleInterface(gameData, loggingService);
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
   * @param commandProcessor Command processor
   * @param services All game services
   * @param loggingService Logging service
   * @returns Promise that resolves to Web UI result
   */
  private static async initializeWebInterface(
    _gameData: GameData,
    commandProcessor: CommandProcessor,
    services: Services,
    loggingService: LoggingService
  ): Promise<UIResult> {
    const logger = loggingService.getLogger('UIInitializer');

    logger.info('🌐 Initializing web interface...');

    // Show mode selection dialog
    const modeDialog = new ModeSelectionDialog(loggingService.getLogger('ModeSelectionDialog'));
    const modeResult = await modeDialog.show();

    logger.info(`Mode selected: ${modeResult.mode}`);

    // If enhanced mode, show setup dialog
    if (modeResult.mode === 'enhanced') {
      const setupDialog = new EnhancedModeSetup(loggingService.getLogger('EnhancedModeSetup'));
      const setupResult = await setupDialog.show();

      logger.info(`Enhanced mode configured: ${setupResult.playerName}, ${setupResult.gameStyle}`);

      // Configure game state for enhanced mode
      services.gameState.setPlayerName(setupResult.playerName);
      services.gameState.setGameStyle(setupResult.gameStyle);
    } else {
      // Set classic mode
      services.gameState.setGameStyle('classic');
    }

    // Create and initialize GameInterface with required services
    const gameInterface = new GameInterface(loggingService.getLogger('GameInterface'));
    gameInterface.initialize(
      commandProcessor,
      services.gameState,
      services.scene,
      services.aiEnhancement
    );

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
   * @param loggingService Logging service
   * @returns Console UI result
   */
  private static initializeConsoleInterface(
    gameData: GameData,
    loggingService: LoggingService
  ): UIResult {
    const logger = loggingService.getLogger('UIInitializer');
    
    logger.info('🖥️ Console environment detected');
    
    // Display game data summary for console
    this.displayConsoleSummary(gameData, logger);
    
    logger.info('✅ Console interface ready');
    
    return {
      environment: 'console',
      interface: null,
      isReady: true
    };
  }
  
  
  /**
   * Display summary information in console
   * @param gameData Game data to summarize
   * @param logger Logger instance
   */
  private static displayConsoleSummary(
    gameData: GameData,
    logger: any
  ): void {
    logger.info('📊 Game Data Summary:');
    logger.info(`  Items: ${gameData.items.length}`);
    logger.info(`  Scenes: ${gameData.scenes.length}`);
    logger.info(`  Monsters: ${gameData.monsters.length}`);
    logger.info('🎮 Game ready for web interface');
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
