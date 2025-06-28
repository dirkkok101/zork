import { LightingCondition } from '../../types/SceneTypes';
import { GameState } from '../../types/GameState';

/**
 * Light source information
 */
export interface LightSource {
    /** ID of the light source item */
    itemId: string;
    
    /** Whether the light source is currently lit */
    isLit: boolean;
    
    /** Light intensity (0-100) */
    intensity: number;
    
    /** Remaining fuel/battery (0-100, -1 for unlimited) */
    fuel: number;
    
    /** Whether this light source can be turned on/off */
    controllable: boolean;
}

/**
 * Lighting evaluation result
 */
export interface LightingEvaluation {
    /** Overall lighting condition in the scene */
    condition: LightingCondition;
    
    /** Whether the player can see clearly */
    canSee: boolean;
    
    /** Active light sources contributing to visibility */
    activeLightSources: LightSource[];
    
    /** Description of the lighting situation */
    description: string;
    
    /** Whether artificial light is required */
    needsLight: boolean;
}

/**
 * Scene Lighting Service Interface
 * 
 * Manages all lighting-related functionality following Single Responsibility Principle.
 * Extracted from the monolithic SceneService to achieve proper SOLID compliance.
 * 
 * Responsibilities:
 * - Light source detection and management
 * - Visibility calculations
 * - Lighting condition evaluation
 * - Environmental lighting effects
 * 
 * Dependencies:
 * - Item service for light source properties
 * - Game state for inventory and scene state
 * - Scene data for environmental lighting
 */
export interface ISceneLightingService {
    /**
     * Evaluate the current lighting conditions in a scene
     * @param sceneId Scene ID to evaluate
     * @param gameState Current game state
     * @returns Complete lighting evaluation
     */
    evaluateLighting(sceneId: string, gameState: GameState): Promise<LightingEvaluation>;
    
    /**
     * Check if the player can see in the current lighting conditions
     * @param sceneId Scene ID to check
     * @param gameState Current game state
     * @returns Whether the player has sufficient light to see
     */
    canPlayerSee(sceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get all active light sources available to the player
     * Includes inventory items and scene items
     * @param gameState Current game state
     * @returns Array of active light sources
     */
    getActiveLightSources(gameState: GameState): Promise<LightSource[]>;
    
    /**
     * Check if a specific item is a light source
     * @param itemId Item ID to check
     * @returns Whether the item can provide light
     */
    isLightSource(itemId: string): Promise<boolean>;
    
    /**
     * Get light source information for a specific item
     * @param itemId Item ID to examine
     * @param gameState Current game state for item state
     * @returns Light source info or null if not a light source
     */
    getLightSourceInfo(itemId: string, gameState: GameState): Promise<LightSource | null>;
    
    /**
     * Light a light source item
     * @param itemId Light source item ID
     * @param ignitionSource Optional item used to light it
     * @param gameState Current game state
     * @returns Success and message
     */
    lightSource(itemId: string, ignitionSource: string | null, gameState: GameState): Promise<{
        success: boolean;
        message: string;
    }>;
    
    /**
     * Extinguish a light source item
     * @param itemId Light source item ID
     * @param gameState Current game state
     * @returns Success and message
     */
    extinguishSource(itemId: string, gameState: GameState): Promise<{
        success: boolean;
        message: string;
    }>;
    
    /**
     * Get the natural lighting condition of a scene
     * Based on scene type, time of day, weather, etc.
     * @param sceneId Scene ID to check
     * @returns Natural lighting condition
     */
    getNaturalLighting(sceneId: string): Promise<LightingCondition>;
    
    /**
     * Get a description of the current lighting situation
     * @param sceneId Scene ID
     * @param gameState Current game state
     * @returns Human-readable lighting description
     */
    getLightingDescription(sceneId: string, gameState: GameState): Promise<string>;
    
    /**
     * Check if an item is visible in current lighting conditions
     * @param itemId Item ID to check
     * @param sceneId Scene containing the item
     * @param gameState Current game state
     * @returns Whether the item is visible
     */
    isItemVisible(itemId: string, sceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get all visible items in a scene based on lighting
     * @param sceneId Scene ID to check
     * @param gameState Current game state
     * @returns Array of visible item IDs
     */
    getVisibleItems(sceneId: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Update light source fuel/battery levels
     * Called periodically to simulate consumption
     * @param gameState Current game state
     * @returns Updated game state with new fuel levels
     */
    updateLightSourceFuel(gameState: GameState): Promise<GameState>;
    
    /**
     * Check if any light sources are running low on fuel
     * @param gameState Current game state
     * @returns Array of light source IDs with low fuel
     */
    getLowFuelLightSources(gameState: GameState): Promise<string[]>;
    
    /**
     * Get the effective range of a light source
     * Some lights may only illuminate the immediate area
     * @param itemId Light source item ID
     * @param gameState Current game state
     * @returns Range in arbitrary units (0 = current scene only)
     */
    getLightRange(itemId: string, gameState: GameState): Promise<number>;
    
    /**
     * Check if lighting conditions allow reading
     * Reading may require better lighting than just seeing
     * @param sceneId Scene ID where reading would occur
     * @param gameState Current game state
     * @returns Whether reading is possible
     */
    canRead(sceneId: string, gameState: GameState): Promise<boolean>;
}