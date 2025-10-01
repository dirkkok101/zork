/**
 * Zork Game Entry Point
 * 
 * Clean main entry point that orchestrates the game initialization
 * using modular initializers with proper dependency injection.
 */

import { LoggingService } from './services';
import { CommandProcessor } from './services/CommandProcessor';
import {
  GameInitializer,
  ServiceInitializer,
  CommandInitializer,
  UIInitializer
} from './initializers';

/**
 * Initialize logging service based on environment
 * @returns Configured LoggingService instance
 */
function initializeLogging(): LoggingService {
  const loggingService = new LoggingService();
  
  // Configure logging level based on environment
  const isDevelopment = typeof process !== 'undefined' ? 
    process.env.NODE_ENV !== 'production' : 
    !window.location.hostname.includes('production');

  if (isDevelopment) {
    loggingService.setDefaultLevel('debug');
  } else {
    loggingService.setDefaultLevel('warn');
  }
  
  return loggingService;
}

/**
 * Main initialization function using modular initializers
 */
async function initializeGame(loggingService: LoggingService) {
  const logger = loggingService.getLogger('GameMain');
  
  logger.info('🎮 Starting Zork - Great Underground Empire');
  
  try {
    // Phase 1: Initialize game data (items, scenes, monsters, initial state)
    const gameData = await GameInitializer.initialize(loggingService);
    GameInitializer.validateGameData(gameData, loggingService);
    
    // Phase 2: Initialize services (currently mocks, will be replaced incrementally)
    const services = ServiceInitializer.initialize(gameData, loggingService);
    ServiceInitializer.validateServices(services, loggingService);
    
    // Phase 3: Initialize commands and command service
    const commandService = CommandInitializer.initialize(services, loggingService);
    CommandInitializer.validateCommands(commandService, loggingService);
    
    // Phase 3.5: Create CommandProcessor to handle command execution and state updates
    const commandProcessor = new CommandProcessor(
      commandService,
      services.gameState,
      loggingService.getLogger('CommandProcessor')
    );
    
    // Phase 4: Initialize UI (web or console)
    const uiResult = await UIInitializer.initialize(gameData, commandProcessor, services, loggingService);
    UIInitializer.validateUI(uiResult, loggingService);
    
    logger.info('✅ Game initialization complete!');
    
    return {
      gameData,
      services,
      commandService,
      commandProcessor,
      uiResult,
      loggingService
    };
    
  } catch (error) {
    logger.error('❌ Failed to initialize game:', error);
    throw error;
  }
}

/**
 * Start the game - clean orchestration with logging as first service
 */
async function main() {
  // Phase 0: Initialize logging service first
  const loggingService = initializeLogging();
  const logger = loggingService.getLogger('GameMain');
  
  try {
    await initializeGame(loggingService);
    logger.info('🎯 Game startup successful - ready for play!');
    
  } catch (error) {
    logger.error('💥 Game startup failed:', error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Auto-start based on environment
if (typeof window !== 'undefined') {
  // Web environment - wait for DOM
  document.addEventListener('DOMContentLoaded', main);
} else if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment - start immediately
  main();
}

export { initializeGame };
