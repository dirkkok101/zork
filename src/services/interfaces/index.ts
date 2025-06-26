/**
 * Service Interfaces Index
 * Exports all service interfaces following SOLID principles
 * Each interface has a single responsibility and is dependency-inverted
 */

// Core service interfaces
export { IItemService } from './IItemService';
export { IContainerService, ContainerResult } from './IContainerService';
export { ILightSourceService } from './ILightSourceService';

// Specialized interaction service interfaces
export { IPhysicalInteractionService } from './IPhysicalInteractionService';
export { IWeaponService, CombatResult } from './IWeaponService';
export { IConsumableService, ConsumptionResult, NutritionStatus } from './IConsumableService';
export { IFireService, FireResult, FireHazard } from './IFireService';
export { IVehicleService, VehicleResult, TravelRoute } from './IVehicleService';

// Service registry interface
export {
  IServiceRegistry,
  ServiceHealthReport,
  ServiceConfiguration
} from './IServiceRegistry';

// Re-export common types from ItemTypes
export type {
  ItemOperationResult,
  ConsumptionEffects,
  WeaponItem,
  VehicleItem,
  ConsumableItem,
  ContainerItem,
  LightSourceItem,
  OpenableItem,
  LockableItem,
  Item,
  ItemInteraction,
  ItemType,
  Size
} from '../../types/ItemTypes';