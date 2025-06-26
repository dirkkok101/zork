/**
 * Service Registry Interface
 * Central registry for all game services following Dependency Injection principle
 * Allows for loose coupling and easy testing/mocking of services
 */

import { IItemService } from './IItemService';
import { IContainerService } from './IContainerService';
import { ILightSourceService } from './ILightSourceService';
import { IPhysicalInteractionService } from './IPhysicalInteractionService';
import { IWeaponService } from './IWeaponService';
import { IConsumableService } from './IConsumableService';
import { IFireService } from './IFireService';
import { IVehicleService } from './IVehicleService';

/**
 * Service Registry Interface
 * Provides access to all game services through dependency injection
 * Following Dependency Inversion Principle - depends on abstractions, not concretions
 */
export interface IServiceRegistry {
  // Core item services
  getItemService(): IItemService;
  getContainerService(): IContainerService;
  getLightSourceService(): ILightSourceService;
  
  // Specialized interaction services
  getPhysicalInteractionService(): IPhysicalInteractionService;
  getWeaponService(): IWeaponService;
  getConsumableService(): IConsumableService;
  getFireService(): IFireService;
  getVehicleService(): IVehicleService;
  
  // Service lifecycle management
  initializeServices(): Promise<void>;
  shutdownServices(): Promise<void>;
  
  // Service health checking
  checkServiceHealth(): Promise<ServiceHealthReport>;
  
  // Service configuration
  configureServices(config: ServiceConfiguration): void;
  getServiceConfiguration(): ServiceConfiguration;
}

/**
 * Service health report interface
 */
export interface ServiceHealthReport {
  /** Overall health status */
  healthy: boolean;
  
  /** Individual service health statuses */
  services: {
    itemService: boolean;
    containerService: boolean;
    lightSourceService: boolean;
    physicalInteractionService: boolean;
    weaponService: boolean;
    consumableService: boolean;
    fireService: boolean;
    vehicleService: boolean;
  };
  
  /** Any error messages */
  errors: string[];
  
  /** Timestamp of the health check */
  timestamp: Date;
  
  /** Performance metrics */
  performance?: {
    averageResponseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}

/**
 * Service configuration interface
 * Allows for configurable service behavior
 */
export interface ServiceConfiguration {
  /** Enable debug logging for services */
  debugMode?: boolean;
  
  /** Maximum inventory capacity */
  maxInventorySize?: number;
  
  /** Enable auto-save of game state after service operations */
  autoSave?: boolean;
  
  /** Custom validation rules for item interactions */
  customValidationRules?: Record<string, (context: any) => boolean>;
  
  /** Service-specific configurations */
  weaponConfig?: {
    enableCriticalHits?: boolean;
    baseCriticalChance?: number;
    enableDurability?: boolean;
  };
  
  fireConfig?: {
    enableFireSpread?: boolean;
    defaultBurnDuration?: number;
    fireSpreadChance?: number;
  };
  
  vehicleConfig?: {
    enableFuelConsumption?: boolean;
    defaultFuelCapacity?: number;
    enableVehicleDamage?: boolean;
  };
  
  consumableConfig?: {
    enableNutrition?: boolean;
    hungerDecayRate?: number;
    thirstDecayRate?: number;
  };
  
  lightConfig?: {
    enableFuelConsumption?: boolean;
    defaultLightDuration?: number;
    lightFadeWarning?: boolean;
  };
}