import log from 'loglevel';

/**
 * Logging Service
 * Provides centralized logging management with per-service loggers
 */
export default class LoggingService {
  private loggers: Map<string, log.Logger> = new Map();
  private defaultLevel: log.LogLevelDesc = 'warn';

  constructor() {
    this.configureFromEnvironment();
  }

  /**
   * Get or create a logger for a specific service
   * @param serviceName Name of the service
   * @returns Logger instance for the service
   */
  public getLogger(serviceName: string): log.Logger {
    if (!this.loggers.has(serviceName)) {
      const logger = log.getLogger(serviceName);
      logger.setLevel(this.defaultLevel);
      this.loggers.set(serviceName, logger);
    }
    return this.loggers.get(serviceName)!;
  }

  /**
   * Set log level for a specific service
   * @param serviceName Name of the service
   * @param level Log level to set
   */
  public setServiceLevel(serviceName: string, level: log.LogLevelDesc): void {
    const logger = this.getLogger(serviceName);
    logger.setLevel(level);
  }

  /**
   * Set default log level for new loggers
   * @param level Default log level
   */
  public setDefaultLevel(level: log.LogLevelDesc): void {
    this.defaultLevel = level;
    // Update existing loggers
    for (const logger of this.loggers.values()) {
      logger.setLevel(level);
    }
  }

  /**
   * Enable debug mode for specific services
   * @param serviceNames Array of service names to enable debug for
   */
  public enableDebugFor(serviceNames: string[]): void {
    for (const serviceName of serviceNames) {
      this.setServiceLevel(serviceName, 'debug');
    }
  }

  /**
   * Configure logging from environment/localStorage
   */
  private configureFromEnvironment(): void {
    try {
      // Only access localStorage if available (browser environment)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Check for global log level setting
        const globalLevel = localStorage.getItem('LOG_LEVEL');
        if (globalLevel && this.isValidLogLevel(globalLevel)) {
          this.defaultLevel = globalLevel as log.LogLevelDesc;
        }

        // Check for debug services setting
        const debugServices = localStorage.getItem('DEBUG_SERVICES');
        if (debugServices) {
          const services = debugServices.split(',').map(s => s.trim());
          // Defer enabling debug until services are created
          setTimeout(() => this.enableDebugFor(services), 0);
        }
      }
    } catch (error) {
      // localStorage might not be available in some environments
      console.warn('Could not configure logging from localStorage:', error);
    }
  }

  /**
   * Check if a string is a valid log level
   * @param level String to check
   * @returns Whether the string is a valid log level
   */
  private isValidLogLevel(level: string): boolean {
    return ['trace', 'debug', 'info', 'warn', 'error', 'silent'].includes(level);
  }

  /**
   * Get all registered logger names
   * @returns Array of service names that have loggers
   */
  public getRegisteredServices(): string[] {
    return Array.from(this.loggers.keys());
  }

  /**
   * Set level for all registered loggers
   * @param level Log level to set for all services
   */
  public setAllLevels(level: log.LogLevelDesc): void {
    this.defaultLevel = level;
    for (const logger of this.loggers.values()) {
      logger.setLevel(level);
    }
  }
}
