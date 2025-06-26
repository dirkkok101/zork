import { ItemOperationResult, LightSourceItem } from '../../types/ItemTypes';

/**
 * Light Source Service Interface
 * Manages light sources and scene lighting conditions
 * Following Single Responsibility Principle - focused only on lighting mechanics
 */
export interface ILightSourceService {
  /**
   * Check if a scene is dark and requires a light source
   * @param sceneId ID of the scene to check
   * @returns Whether the scene is dark
   */
  isSceneDark(sceneId: string): boolean;

  /**
   * Check if the player has a lit light source
   * @returns Whether the player has a lit light source
   */
  hasLitLightSource(): boolean;

  /**
   * Check if a scene requires a light source and if the player has one
   * @param sceneId ID of the scene to check
   * @returns Whether the scene is too dark to see
   */
  isSceneTooDarkToSee(sceneId: string): boolean;

  /**
   * Get all light sources in inventory
   * @param litOnly Whether to only return lit light sources
   * @returns Array of light source items
   */
  getLightSourcesInInventory(litOnly?: boolean): LightSourceItem[];

  /**
   * Get all light sources in the current scene
   * @param litOnly Whether to only return lit light sources
   * @returns Array of light source items in the current scene
   */
  getLightSourcesInScene(litOnly?: boolean): LightSourceItem[];

  /**
   * Light a light source
   * @param lightSourceNameOrId Name or ID of the light source to light
   * @returns Result of the lighting operation
   */
  lightSource(lightSourceNameOrId: string): ItemOperationResult;

  /**
   * Extinguish a light source
   * @param lightSourceNameOrId Name or ID of the light source to extinguish
   * @returns Result of the extinguish operation
   */
  extinguishSource(lightSourceNameOrId: string): ItemOperationResult;

  /**
   * Light a light source using another item as ignition
   * @param lightSourceNameOrId Name or ID of the light source to light
   * @param ignitionSourceNameOrId Name or ID of the ignition source
   * @returns Result of the lighting operation
   */
  lightWithIgnitionSource(lightSourceNameOrId: string, ignitionSourceNameOrId: string): ItemOperationResult;

  /**
   * Get the light intensity of a light source
   * @param lightSourceNameOrId Name or ID of the light source
   * @returns Light intensity value (0 = no light, higher = brighter)
   */
  getLightIntensity(lightSourceNameOrId: string): number;

  /**
   * Check if an item can be lit using another item as ignition source
   * @param itemNameOrId Name or ID of the item to light
   * @param ignitionSourceNameOrId Name or ID of the ignition source
   * @returns Whether the lighting is possible
   */
  canLightWithSource(itemNameOrId: string, ignitionSourceNameOrId: string): boolean;

  /**
   * Get remaining fuel for a light source
   * @param lightSourceNameOrId Name or ID of the light source
   * @returns Remaining fuel (-1 for infinite, 0 for empty, positive for remaining)
   */
  getRemainingFuel(lightSourceNameOrId: string): number;

  /**
   * Add fuel to a light source
   * @param lightSourceNameOrId Name or ID of the light source
   * @param fuelAmount Amount of fuel to add
   * @returns Result of the refueling operation
   */
  refuelLightSource(lightSourceNameOrId: string, fuelAmount: number): ItemOperationResult;

  /**
   * Check if a light source is functional (has fuel, not broken)
   * @param lightSourceNameOrId Name or ID of the light source
   * @returns Whether the light source can be lit
   */
  isLightSourceFunctional(lightSourceNameOrId: string): boolean;

  /**
   * Get the effective illumination radius for the current lit light sources
   * @returns Radius of illumination in the current scene
   */
  getCurrentIlluminationRadius(): number;

  /**
   * Check if there's enough light to perform a specific action
   * @param action The action to check lighting requirements for
   * @returns Whether there's sufficient light
   */
  hasSufficientLightFor(action: string): boolean;

  /**
   * Update all light sources (fuel consumption, burnout, etc.)
   * @param timeDelta Time passed since last update
   * @returns Array of messages about light source events
   */
  updateLightSources(timeDelta: number): string[];

  /**
   * Check for light source warnings (low fuel, about to burn out)
   * @returns Array of warning messages
   */
  getLightSourceWarnings(): string[];

  /**
   * Get the illumination level description of the current scene
   * @returns Description of the lighting conditions
   */
  getCurrentSceneIllumination(): string;
}