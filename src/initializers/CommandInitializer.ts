/**
 * Command Initializer
 * 
 * Responsible for creating all game commands and registering them with the CommandService.
 * Uses dependency injection to provide services to commands.
 */

import { LoggingService, CommandService } from '../services';
import { 
  LookCommand, 
  ExamineCommand, 
  MoveCommand, 
  TakeCommand, 
  DropCommand, 
  InventoryCommand, 
  OpenCommand, 
  CloseCommand, 
  PutCommand, 
  ReadCommand 
} from '../commands';
import { Services } from './ServiceInitializer';

/**
 * Command Initializer Class
 * Handles creation and registration of all game commands
 */
export class CommandInitializer {
  /**
   * Initialize and register all game commands
   * @param services Configured game services
   * @param loggingService Logging service for creating loggers
   * @returns Configured CommandService with all commands registered
   */
  static initialize(
    services: Services, 
    loggingService: LoggingService
  ): CommandService {
    const logger = loggingService.getLogger('CommandInitializer');
    
    logger.info('🎯 Initializing game commands...');
    
    try {
      // Create CommandService
      const commandService = new CommandService(loggingService.getLogger('CommandService'));
      
      // Create and register all commands
      const commands = this.createCommands(services, loggingService);
      commandService.registerCommands(commands);
      
      // Log registration results
      const registeredCommands = commandService.getAllCommands();
      const commandNames = registeredCommands.map(c => c.name).join(', ');
      logger.debug(`Registered ${registeredCommands.length} commands: ${commandNames}`);
      
      logger.info('✅ Game commands initialized successfully');
      return commandService;
      
    } catch (error) {
      logger.error('❌ Failed to initialize commands:', error);
      throw error;
    }
  }
  
  /**
   * Create all game commands with service injection
   * @param services Game services to inject into commands
   * @param loggingService Logging service for command loggers
   * @returns Array of configured command instances
   */
  private static createCommands(services: Services, loggingService: LoggingService) {
    const logger = loggingService.getLogger('CommandInitializer');
    
    logger.debug('Creating command instances...');
    
    // Create all available commands with service injection
    const commands = [
      new LookCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('LookCommand')
      ),
      new ExamineCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('ExamineCommand')
      ),
      new MoveCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('MoveCommand')
      ),
      new TakeCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('TakeCommand')
      ),
      new DropCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('DropCommand')
      ),
      new InventoryCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('InventoryCommand')
      ),
      new OpenCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('OpenCommand')
      ),
      new CloseCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('CloseCommand')
      ),
      new PutCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('PutCommand')
      ),
      new ReadCommand(
        services.gameState,
        services.scene,
        services.inventory,
        services.items,
        services.combat,
        services.persistence,
        services.output,
        services.scoring,
        loggingService.getLogger('ReadCommand')
      )
    ];
    
    logger.debug(`Created ${commands.length} command instances`);
    return commands;
  }
  
  /**
   * Get information about registered commands
   * @param commandService CommandService to analyze
   * @returns Command registration information
   */
  static getCommandInfo(commandService: CommandService): {
    totalCommands: number;
    commandNames: string[];
    totalAliases: number;
  } {
    const commands = commandService.getAllCommands();
    const totalAliases = commands.reduce((total, cmd) => total + cmd.aliases.length, 0);
    
    return {
      totalCommands: commands.length,
      commandNames: commands.map(cmd => cmd.name),
      totalAliases
    };
  }
  
  /**
   * Validate that essential commands are registered
   * @param commandService CommandService to validate
   * @param loggingService Logging service for validation logging
   * @throws Error if validation fails
   */
  static validateCommands(commandService: CommandService, loggingService?: LoggingService): void {
    const logger = loggingService?.getLogger('CommandInitializer');
    
    const essentialCommands = ['look', 'examine', 'move', 'take', 'inventory'];
    const registeredCommands = commandService.getAllCommands();
    const registeredNames = registeredCommands.map(cmd => cmd.name);
    
    for (const commandName of essentialCommands) {
      if (!registeredNames.includes(commandName)) {
        throw new Error(`Essential command '${commandName}' is not registered`);
      }
    }
    
    if (logger) {
      logger.debug('✅ Command validation passed - essential commands present');
    }
  }
}
