import { ItemOperationResult, VehicleItem } from '../../types/ItemTypes';

/**
 * Vehicle result interface
 * Extends ItemOperationResult with vehicle-specific data
 */
export interface VehicleResult extends ItemOperationResult {
  /** Current vehicle after the operation */
  currentVehicle?: VehicleItem;
  
  /** Previous location before vehicle movement */
  previousLocation?: string;
  
  /** New location after vehicle movement */
  newLocation?: string;
  
  /** Passengers affected by the operation */
  passengers?: string[];
  
  /** Item involved in the operation */
  item?: string;
  
  /** Vehicle involved in the operation */
  vehicle?: string;
}

/**
 * Travel route information interface
 */
export interface TravelRoute {
  /** Starting scene ID */
  fromScene: string;
  
  /** Destination scene ID */
  toScene: string;
  
  /** Whether this route is available */
  available: boolean;
  
  /** Requirements to use this route */
  requirements?: string[];
  
  /** Travel time (in game turns) */
  travelTime?: number;
  
  /** Route description */
  description?: string;
}

/**
 * Vehicle Service Interface
 * Handles all vehicle and transportation mechanics
 * Following Single Responsibility Principle - focused only on vehicle operations
 */
export interface IVehicleService {
  /**
   * Board a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle to board
   * @returns Result of the boarding operation
   */
  boardVehicle(vehicleNameOrId: string): VehicleResult;

  /**
   * Disembark from the current vehicle
   * @returns Result of the disembark operation
   */
  disembarkVehicle(): VehicleResult;

  /**
   * Get the currently boarded vehicle
   * @returns The current vehicle or undefined if not in a vehicle
   */
  getCurrentVehicle(): VehicleItem | undefined;

  /**
   * Check if the player is currently in a vehicle
   * @returns Whether the player is in a vehicle
   */
  isInVehicle(): boolean;

  /**
   * Check if the player can travel between scenes with a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @param fromSceneId Scene ID to travel from
   * @param toSceneId Scene ID to travel to
   * @returns Whether travel is possible
   */
  canTravel(vehicleNameOrId: string, fromSceneId: string, toSceneId: string): boolean;

  /**
   * Move a vehicle between scenes
   * @param vehicleNameOrId Name or ID of the vehicle
   * @param toSceneId Scene ID to move to
   * @returns Result of the movement operation
   */
  moveVehicle(vehicleNameOrId: string, toSceneId: string): VehicleResult;

  /**
   * Travel to a destination using the current vehicle
   * @param destinationSceneId Scene ID to travel to
   * @returns Result of the travel operation
   */
  travelTo(destinationSceneId: string): VehicleResult;

  /**
   * Get the carrying capacity of a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Maximum number of items the vehicle can carry
   */
  getVehicleCapacity(vehicleNameOrId: string): number;

  /**
   * Get the weight capacity of a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Maximum weight the vehicle can carry
   */
  getVehicleWeightCapacity(vehicleNameOrId: string): number;

  /**
   * Get remaining capacity of a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Remaining item capacity
   */
  getRemainingCapacity(vehicleNameOrId: string): number;

  /**
   * Get remaining weight capacity of a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Remaining weight capacity
   */
  getRemainingWeightCapacity(vehicleNameOrId: string): number;

  /**
   * Put an item into a vehicle
   * @param itemNameOrId Name or ID of the item to put
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Result of the put operation
   */
  putItemInVehicle(itemNameOrId: string, vehicleNameOrId: string): VehicleResult;

  /**
   * Take an item from a vehicle
   * @param itemNameOrId Name or ID of the item to take
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Result of the take operation
   */
  takeItemFromVehicle(itemNameOrId: string, vehicleNameOrId: string): VehicleResult;

  /**
   * Get all items currently in a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Array of item IDs in the vehicle
   */
  getVehicleContents(vehicleNameOrId: string): string[];

  /**
   * Check if a vehicle is currently occupied
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Whether the vehicle has passengers
   */
  isVehicleOccupied(vehicleNameOrId: string): boolean;

  /**
   * Get all passengers in a vehicle
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Array of passenger IDs
   */
  getVehiclePassengers(vehicleNameOrId: string): string[];

  /**
   * Check if an item can be used as a vehicle
   * @param itemNameOrId Name or ID of the item to check
   * @returns Whether the item is a vehicle
   */
  isVehicle(itemNameOrId: string): boolean;

  /**
   * Get all available vehicles in the current scene
   * @returns Array of vehicle items in the current scene
   */
  getAvailableVehicles(): VehicleItem[];

  /**
   * Check if a vehicle is functional and can be used
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Whether the vehicle is in working condition
   */
  isVehicleFunctional(vehicleNameOrId: string): boolean;

  /**
   * Get available travel routes from the current location
   * @param vehicleNameOrId Optional specific vehicle to check routes for
   * @returns Array of available travel routes
   */
  getAvailableRoutes(vehicleNameOrId?: string): TravelRoute[];

  /**
   * Get travel time between two scenes
   * @param fromSceneId Starting scene ID
   * @param toSceneId Destination scene ID
   * @param vehicleNameOrId Optional vehicle to use for calculation
   * @returns Travel time in game turns
   */
  getTravelTime(fromSceneId: string, toSceneId: string, vehicleNameOrId?: string): number;

  /**
   * Check if a vehicle needs fuel or maintenance
   * @param vehicleNameOrId Name or ID of the vehicle
   * @returns Whether the vehicle needs attention
   */
  needsMaintenance(vehicleNameOrId: string): boolean;
}