/**
 * AI Enhancement Service Interface
 * Defines the contract for AI-powered content expansion
 */

import { ExpandedScene, ExpandedItem, ExpandedMonster, SceneContext, EntityType } from '../../types/AITypes';
import { GameStyle } from '../../types/GameState';

/**
 * Interface for AI enhancement service
 */
export interface IAIEnhancementService {
  /**
   * Expand a scene with AI-generated content
   * @param sceneId - Scene identifier (e.g., "west_of_house")
   * @param playerName - Player's chosen name
   * @param style - Game style (fantasy, scifi, modern)
   * @returns Promise with expanded scene data
   */
  expandScene(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedScene>;

  /**
   * Expand an item with AI-generated content
   * @param itemId - Item identifier
   * @param sceneContext - Context of current scene for relevance
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Promise with expanded item data
   */
  expandItem(
    itemId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedItem>;

  /**
   * Expand a monster with AI-generated content
   * @param monsterId - Monster identifier
   * @param sceneContext - Context of current scene
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Promise with expanded monster data
   */
  expandMonster(
    monsterId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedMonster>;

  /**
   * Check if an entity has been expanded
   * @param entityId - Entity identifier
   * @param entityType - Type of entity
   * @returns True if already expanded
   */
  isExpanded(
    entityId: string,
    entityType: EntityType
  ): boolean;

  /**
   * Expand all entities in current scene
   * @param sceneId - Scene to expand
   * @param playerName - Player name
   * @param style - Game style
   * @returns Promise with all expanded entities
   */
  expandSceneContext(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<SceneContext>;

  /**
   * Preload AI expansions for adjacent scenes in the background
   * @param currentSceneId - Current scene ID
   * @param playerName - Player name
   * @param style - Game style
   * @returns Void - runs in background, doesn't block
   */
  preloadAdjacentScenes(
    currentSceneId: string,
    playerName: string,
    style: GameStyle
  ): void;

  /**
   * Expand items currently in player inventory
   * @param playerName - Player name
   * @param style - Game style
   * @returns Void - runs in background
   */
  expandInventoryItems(
    playerName: string,
    style: GameStyle
  ): Promise<void>;
}
