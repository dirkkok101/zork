/**
 * AI Enhancement Service
 * Handles AI-powered content expansion for scenes, items, and monsters
 */

import { IAIEnhancementService } from './interfaces/IAIEnhancementService';
import { IOpenRouterClient } from '../clients/interfaces/IOpenRouterClient';
import { IGameStateService } from './interfaces/IGameStateService';
import { ISceneService } from './interfaces/ISceneService';
import { IItemService } from './interfaces/IItemService';
import { PromptBuilder } from '../utils/PromptBuilder';
import {
  ExpandedScene,
  ExpandedItem,
  ExpandedMonster,
  SceneContext,
  EntityType
} from '../types/AITypes';
import { GameStyle } from '../types/GameState';
import { Scene } from '../types/SceneTypes';
import { Item } from '../types/ItemTypes';
import { Monster } from '../types/Monster';

/**
 * AI Enhancement Service Implementation
 */
export class AIEnhancementService implements IAIEnhancementService {
  private openRouterClient: IOpenRouterClient;
  private gameStateService!: IGameStateService;
  private sceneService!: ISceneService;
  private itemService!: IItemService;

  constructor(openRouterClient: IOpenRouterClient) {
    this.openRouterClient = openRouterClient;
  }

  /**
   * Set service dependencies (setter injection for circular dependencies)
   */
  public setDependencies(
    gameStateService: IGameStateService,
    sceneService: ISceneService,
    itemService: IItemService
  ): void {
    this.gameStateService = gameStateService;
    this.sceneService = sceneService;
    this.itemService = itemService;
  }

  /**
   * Expand a scene with AI-generated content
   */
  public async expandScene(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedScene> {
    // Check if AI is configured
    if (!this.openRouterClient.isConfigured()) {
      console.warn('AI not configured, using original scene');
      return this.getOriginalSceneData(sceneId);
    }

    try {
      // Get scene data
      const scene = this.gameStateService.getScene(sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${sceneId}`);
      }

      // Get items and monsters in scene
      const sceneItems = this.getSceneItems(scene);
      const sceneMonsters = this.getSceneMonsters(scene);

      // Build prompt
      const messages = PromptBuilder.buildScenePrompt(
        scene,
        playerName,
        style,
        sceneItems,
        sceneMonsters
      );

      // Call AI API
      const response = await this.openRouterClient.callAPI(messages);

      // Parse and validate response
      const expandedScene = this.parseSceneResponse(response);

      return expandedScene;

    } catch (error) {
      console.error('AI scene expansion failed:', error);
      return this.getOriginalSceneData(sceneId);
    }
  }

  /**
   * Expand an item with AI-generated content
   */
  public async expandItem(
    itemId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedItem> {
    // Check if AI is configured
    if (!this.openRouterClient.isConfigured()) {
      console.warn('AI not configured, using original item');
      return this.getOriginalItemData(itemId);
    }

    try {
      // Get item data
      const item = this.gameStateService.getItem(itemId);
      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      // Build prompt
      const messages = PromptBuilder.buildItemPrompt(
        item,
        sceneContext,
        playerName,
        style
      );

      // Call AI API
      const response = await this.openRouterClient.callAPI(messages);

      // Parse and validate response
      const expandedItem = this.parseItemResponse(response);

      return expandedItem;

    } catch (error) {
      console.error('AI item expansion failed:', error);
      return this.getOriginalItemData(itemId);
    }
  }

  /**
   * Expand a monster with AI-generated content
   */
  public async expandMonster(
    monsterId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedMonster> {
    // Check if AI is configured
    if (!this.openRouterClient.isConfigured()) {
      console.warn('AI not configured, using original monster');
      return this.getOriginalMonsterData(monsterId);
    }

    try {
      // Get monster data
      const monster = this.gameStateService.getGameState().monsters[monsterId];
      if (!monster) {
        throw new Error(`Monster not found: ${monsterId}`);
      }

      // Build prompt
      const messages = PromptBuilder.buildMonsterPrompt(
        monster,
        sceneContext,
        playerName,
        style
      );

      // Call AI API
      const response = await this.openRouterClient.callAPI(messages);

      // Parse and validate response
      const expandedMonster = this.parseMonsterResponse(response);

      return expandedMonster;

    } catch (error) {
      console.error('AI monster expansion failed:', error);
      return this.getOriginalMonsterData(monsterId);
    }
  }

  /**
   * Check if an entity has been expanded
   */
  public isExpanded(entityId: string, entityType: EntityType): boolean {
    const gameState = this.gameStateService.getGameState();

    switch (entityType) {
      case 'scene':
        return gameState.scenes[entityId]?.expanded === true;
      case 'item':
        return gameState.items[entityId]?.expanded === true;
      case 'monster':
        return gameState.monsters[entityId]?.expanded === true;
      default:
        return false;
    }
  }

  /**
   * Expand all entities in current scene
   * Main orchestration method called when entering a scene
   */
  public async expandSceneContext(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<SceneContext> {
    // 1. Check if scene already expanded
    if (this.isExpanded(sceneId, 'scene')) {
      // Return existing expansions
      return this.getExistingSceneContext(sceneId);
    }

    // 2. Expand scene
    const expandedScene = await this.expandScene(sceneId, playerName, style);

    // 3. Get scene data
    const scene = this.gameStateService.getScene(sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    // 4. Expand items in scene
    const sceneItems = this.getSceneItems(scene);
    const expandedItems: Record<string, ExpandedItem> = {};

    console.log(`Expanding ${sceneItems.length} items in scene ${sceneId}...`);

    for (const item of sceneItems) {
      if (!this.isExpanded(item.id, 'item')) {
        console.log(`  Expanding item: ${item.id}`);
        expandedItems[item.id] = await this.expandItem(
          item.id,
          expandedScene.description,
          playerName,
          style
        );
        console.log(`  ✅ Item ${item.id} expanded`);
      } else {
        console.log(`  Item ${item.id} already expanded, skipping`);
      }
    }

    // 4b. Expand items inside containers (recursively)
    await this.expandContainerContents(sceneItems, expandedScene.description, playerName, style, expandedItems);

    // 5. Expand monsters in scene
    const sceneMonsters = this.getSceneMonsters(scene);
    const expandedMonsters: Record<string, ExpandedMonster> = {};

    for (const monster of sceneMonsters) {
      if (!this.isExpanded(monster.id, 'monster')) {
        expandedMonsters[monster.id] = await this.expandMonster(
          monster.id,
          expandedScene.description,
          playerName,
          style
        );
      }
    }

    // 6. Apply expansions to in-memory objects
    this.applyExpansions(sceneId, expandedScene, expandedItems, expandedMonsters);

    return {
      scene: expandedScene,
      items: expandedItems,
      monsters: expandedMonsters
    };
  }

  /**
   * Recursively expand items inside containers
   */
  private async expandContainerContents(
    items: Item[],
    sceneContext: string,
    playerName: string,
    style: GameStyle,
    expandedItems: Record<string, ExpandedItem>
  ): Promise<void> {
    const gameState = this.gameStateService.getGameState();

    for (const item of items) {
      // Check if container is a container type
      const isContainerType = this.itemService.isContainer(item.id);
      if (!isContainerType) {
        continue;
      }

      // Get container contents using ItemService
      const containerContents = this.itemService.getContainerContents(item.id);
      if (!containerContents || containerContents.length === 0) {
        console.log(`  Container ${item.id} has no contents, skipping`);
        continue;
      }

      // Check if container is open or openable (we expand contents proactively for openable containers)
      const isOpen = this.itemService.isContainerOpen(item.id);
      const canOpen = this.itemService.canOpen(item.id);

      // Only expand contents if container is open or openable
      if (!isOpen && !canOpen) {
        console.log(`  Container ${item.id} is not openable, skipping contents`);
        continue;
      }

      console.log(`  Expanding ${containerContents.length} items inside container ${item.id}...`);

      // Get contained items
      const containedItems: Item[] = [];
      for (const containedItemId of containerContents) {
        const containedItem = gameState.items[containedItemId];
        if (containedItem) {
          containedItems.push(containedItem);
        }
      }

      // Expand each contained item
      for (const containedItem of containedItems) {
        if (!this.isExpanded(containedItem.id, 'item')) {
          console.log(`    Expanding contained item: ${containedItem.id}`);
          try {
            expandedItems[containedItem.id] = await this.expandItem(
              containedItem.id,
              `inside ${item.name}`,
              playerName,
              style
            );

            // Apply expansion immediately
            containedItem.name = expandedItems[containedItem.id].displayName;
            containedItem.description = expandedItems[containedItem.id].description;
            containedItem.examineText = expandedItems[containedItem.id].examineText;
            // Apply readText if AI generated it
            if (expandedItems[containedItem.id].readText) {
              containedItem.readText = expandedItems[containedItem.id].readText;
            }
            containedItem.expanded = true;

            console.log(`    ✅ Contained item ${containedItem.id} expanded`);
          } catch (error) {
            console.warn(`    Failed to expand contained item ${containedItem.id}:`, error);
          }
        } else {
          console.log(`    Contained item ${containedItem.id} already expanded, skipping`);
        }
      }

      // Recursively expand nested containers
      await this.expandContainerContents(containedItems, sceneContext, playerName, style, expandedItems);
    }
  }

  /**
   * Apply expanded content to in-memory game objects
   */
  private applyExpansions(
    sceneId: string,
    expandedScene: ExpandedScene,
    expandedItems: Record<string, ExpandedItem>,
    expandedMonsters: Record<string, ExpandedMonster>
  ): void {
    const gameState = this.gameStateService.getGameState();

    // Overwrite scene object
    const scene = gameState.scenes[sceneId];
    if (scene) {
      scene.title = expandedScene.displayName;
      scene.description = expandedScene.description;
      scene.expanded = true;

      // Update exits with descriptions
      for (const [direction, description] of Object.entries(expandedScene.exitDescriptions)) {
        const exit = scene.exits.find(e => e.direction === direction);
        if (exit) {
          exit.description = description;
        }
      }
    }

    // Overwrite item objects
    for (const [itemId, expandedItem] of Object.entries(expandedItems)) {
      const item = gameState.items[itemId];
      if (item) {
        item.name = expandedItem.displayName;
        item.description = expandedItem.description;
        item.examineText = expandedItem.examineText;
        // Apply readText if AI generated it (preserving original readable content)
        if (expandedItem.readText) {
          item.readText = expandedItem.readText;
        }
        item.expanded = true;
      }
    }

    // Overwrite monster objects
    for (const [monsterId, expandedMonster] of Object.entries(expandedMonsters)) {
      const monster = gameState.monsters[monsterId];
      if (monster) {
        monster.name = expandedMonster.displayName;
        monster.description = expandedMonster.description;
        monster.expanded = true;
      }
    }
  }

  /**
   * Get existing scene context (already expanded)
   */
  private getExistingSceneContext(sceneId: string): SceneContext {
    const gameState = this.gameStateService.getGameState();
    const scene = gameState.scenes[sceneId];

    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    const sceneItems = this.getSceneItems(scene);
    const sceneMonsters = this.getSceneMonsters(scene);

    return {
      scene: {
        displayName: scene.title,
        description: scene.description,
        exitDescriptions: this.getExitDescriptions(scene)
      },
      items: this.getExpandedItems(sceneItems),
      monsters: this.getExpandedMonsters(sceneMonsters)
    };
  }

  /**
   * Get exit descriptions from scene
   */
  private getExitDescriptions(scene: Scene): Record<string, string> {
    const exitDescriptions: Record<string, string> = {};
    for (const exit of scene.exits) {
      if (exit.description) {
        exitDescriptions[exit.direction] = exit.description;
      }
    }
    return exitDescriptions;
  }

  /**
   * Get expanded items
   */
  private getExpandedItems(items: Item[]): Record<string, ExpandedItem> {
    const expandedItems: Record<string, ExpandedItem> = {};
    for (const item of items) {
      if (item.expanded) {
        expandedItems[item.id] = {
          displayName: item.name,
          description: item.description,
          examineText: item.examineText,
          readText: null
        };
      }
    }
    return expandedItems;
  }

  /**
   * Get expanded monsters
   */
  private getExpandedMonsters(monsters: Monster[]): Record<string, ExpandedMonster> {
    const expandedMonsters: Record<string, ExpandedMonster> = {};
    for (const monster of monsters) {
      if (monster.expanded) {
        expandedMonsters[monster.id] = {
          displayName: monster.name,
          description: monster.description
        };
      }
    }
    return expandedMonsters;
  }

  /**
   * Get items in a scene
   */
  private getSceneItems(scene: Scene): Item[] {
    const items: Item[] = [];
    const gameState = this.gameStateService.getGameState();

    for (const sceneItem of scene.items) {
      const item = gameState.items[sceneItem.itemId];
      if (item && sceneItem.visible) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Get monsters in a scene
   */
  private getSceneMonsters(scene: Scene): Monster[] {
    const monsters: Monster[] = [];
    const gameState = this.gameStateService.getGameState();

    if (!scene.monsters) {
      return monsters;
    }

    for (const monsterRef of scene.monsters) {
      const monsterId = typeof monsterRef === 'string' ? monsterRef : monsterRef.monsterId;
      const monster = gameState.monsters[monsterId];
      if (monster) {
        monsters.push(monster);
      }
    }

    return monsters;
  }

  /**
   * Parse scene response from AI
   */
  private parseSceneResponse(response: string): ExpandedScene {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.displayName || !parsed.description) {
        throw new Error('Invalid AI response: missing required fields');
      }

      return {
        displayName: parsed.displayName,
        description: parsed.description,
        exitDescriptions: parsed.exitDescriptions || {}
      };
    } catch (error) {
      throw new Error(`Failed to parse AI scene response: ${error}`);
    }
  }

  /**
   * Parse item response from AI
   */
  private parseItemResponse(response: string): ExpandedItem {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.displayName || !parsed.description || !parsed.examineText) {
        throw new Error('Invalid AI response: missing required fields');
      }

      return {
        displayName: parsed.displayName,
        description: parsed.description,
        examineText: parsed.examineText,
        readText: parsed.readText || null
      };
    } catch (error) {
      throw new Error(`Failed to parse AI item response: ${error}`);
    }
  }

  /**
   * Parse monster response from AI
   */
  private parseMonsterResponse(response: string): ExpandedMonster {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.displayName || !parsed.description) {
        throw new Error('Invalid AI response: missing required fields');
      }

      return {
        displayName: parsed.displayName,
        description: parsed.description
      };
    } catch (error) {
      throw new Error(`Failed to parse AI monster response: ${error}`);
    }
  }

  /**
   * Get original scene data (fallback)
   */
  private getOriginalSceneData(sceneId: string): ExpandedScene {
    const scene = this.gameStateService.getScene(sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    return {
      displayName: scene.title,
      description: scene.description,
      exitDescriptions: {}
    };
  }

  /**
   * Get original item data (fallback)
   */
  private getOriginalItemData(itemId: string): ExpandedItem {
    const item = this.gameStateService.getItem(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return {
      displayName: item.name,
      description: item.description,
      examineText: item.examineText,
      readText: null
    };
  }

  /**
   * Get original monster data (fallback)
   */
  private getOriginalMonsterData(monsterId: string): ExpandedMonster {
    const monster = this.gameStateService.getGameState().monsters[monsterId];
    if (!monster) {
      throw new Error(`Monster not found: ${monsterId}`);
    }

    return {
      displayName: monster.name,
      description: monster.description
    };
  }

  /**
   * Preload AI expansions for adjacent scenes in the background
   * This runs asynchronously and doesn't block the main thread
   */
  public preloadAdjacentScenes(
    currentSceneId: string,
    playerName: string,
    style: GameStyle
  ): void {
    // Don't preload if AI is not configured
    if (!this.openRouterClient.isConfigured()) {
      return;
    }

    // Get current scene
    const currentScene = this.gameStateService.getScene(currentSceneId);
    if (!currentScene) {
      return;
    }

    // Get all available exits (adjacent scenes)
    const exits = this.sceneService.getAvailableExits(currentSceneId);
    const adjacentSceneIds = exits
      .map(exit => exit.to)
      .filter(sceneId => sceneId && sceneId.length > 0);

    console.log(`Preloading ${adjacentSceneIds.length} adjacent scenes in background...`);

    // Preload each adjacent scene in the background
    adjacentSceneIds.forEach(sceneId => {
      // Skip if already expanded
      if (this.isExpanded(sceneId, 'scene')) {
        console.log(`Scene ${sceneId} already expanded, skipping preload`);
        return;
      }

      // Expand in background - fire and forget, log errors silently
      this.expandSceneContext(sceneId, playerName, style)
        .then(() => {
          console.log(`✅ Background preload complete for scene: ${sceneId}`);
        })
        .catch(error => {
          console.warn(`Background preload failed for scene ${sceneId}:`, error.message);
          // Don't throw - this is background work, failures are acceptable
        });
    });
  }

  /**
   * Expand items currently in player inventory
   */
  public async expandInventoryItems(
    playerName: string,
    style: GameStyle
  ): Promise<void> {
    // Don't expand if AI is not configured
    if (!this.openRouterClient.isConfigured()) {
      return;
    }

    const gameState = this.gameStateService.getGameState();
    const inventoryItems = gameState.inventory || [];

    console.log(`Expanding ${inventoryItems.length} inventory items...`);

    for (const itemId of inventoryItems) {
      // Skip if already expanded
      if (this.isExpanded(itemId, 'item')) {
        console.log(`  Inventory item ${itemId} already expanded`);
        continue;
      }

      const item = gameState.items[itemId];
      if (!item) {
        continue;
      }

      try {
        console.log(`  Expanding inventory item: ${itemId}`);
        const expandedItem = await this.expandItem(
          itemId,
          'item in your possession',
          playerName,
          style
        );

        // Apply expansion
        item.name = expandedItem.displayName;
        item.description = expandedItem.description;
        item.examineText = expandedItem.examineText;
        // Apply readText if AI generated it
        if (expandedItem.readText) {
          item.readText = expandedItem.readText;
        }
        item.expanded = true;

        console.log(`  ✅ Inventory item ${itemId} expanded`);
      } catch (error) {
        console.warn(`  Failed to expand inventory item ${itemId}:`, error);
      }
    }
  }
}
