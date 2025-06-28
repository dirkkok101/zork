import { SceneData } from '../types/SceneData';
import { Scene, LightingCondition, Exit, SceneItem, SceneAction } from '../types/SceneTypes';
import { ISceneDataLoader } from './ISceneDataLoader';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Scene index data structure from index.json
 */
export interface SceneIndexData {
    /** Array of scene filenames */
    scenes: string[];
    
    /** Total number of scenes */
    total: number;
    
    /** Regional organization mapping region names to scene filename arrays */
    regions: Record<string, string[]>;
    
    /** Timestamp of last update */
    lastUpdated: string;
}

/**
 * Implementation of stateless scene data loading.
 * 
 * Key Characteristics:
 * - No internal caching - fresh file I/O on each operation
 * - Thread-safe design with no shared state
 * - Flat file structure (data/scenes/*.json)
 * - Type-safe conversion from raw JSON to typed interfaces
 * - Comprehensive validation and error handling
 * - Complex exit transformation from objects to arrays
 * - Regional organization for efficient querying
 * 
 * Performance Characteristics:
 * - loadScene(): Single file read (~10ms)
 * - loadAllScenes(): Reads 195 files (~400-800ms)
 * - getScenesByRegion(): Optimized to load only regional scenes
 * - Other filter methods: Call loadAllScenes() + client-side filtering
 * 
 * Follows single responsibility principle and TypeScript strict mode.
 */
export class SceneDataLoader implements ISceneDataLoader {
    private readonly dataPath: string;

    /**
     * Initialize the SceneDataLoader
     * @param dataPath Base path to the scenes data directory
     */
    constructor(dataPath: string = 'data/scenes/') {
        this.dataPath = dataPath;
    }

    /**
     * Load all scenes from flat structure
     */
    public async loadAllScenes(): Promise<Scene[]> {
        const index = await this.loadIndex();
        const allScenes: Scene[] = [];

        for (const filename of index.scenes) {
            try {
                const scene = await this.loadSceneFromFile(filename);
                allScenes.push(scene);
            } catch (error) {
                console.error(`Failed to load scene from ${filename}:`, error);
                // Continue loading other scenes instead of failing completely
            }
        }

        return allScenes;
    }

    /**
     * Load the scene index
     */
    private async loadIndex(): Promise<SceneIndexData> {
        try {
            const indexPath = join(this.dataPath, 'index.json');
            const indexContent = await readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexContent) as SceneIndexData;
            
            this.validateIndexData(indexData);
            return indexData;
        } catch (error) {
            throw new Error(`Failed to load scene index: ${error}`);
        }
    }

    /**
     * Load and convert a scene from a JSON file
     */
    private async loadSceneFromFile(filename: string): Promise<Scene> {
        try {
            const fullPath = join(this.dataPath, filename);
            const fileContent = await readFile(fullPath, 'utf-8');
            const sceneData = JSON.parse(fileContent) as SceneData;
            
            this.validateSceneData(sceneData);
            return this.convertSceneDataToScene(sceneData);
        } catch (error) {
            throw new Error(`Failed to load scene from ${filename}: ${error}`);
        }
    }

    /**
     * Convert SceneData (raw JSON) to Scene (typed interface)
     */
    private convertSceneDataToScene(sceneData: SceneData): Scene {
        const sceneResult: Scene = {
            id: sceneData.id,
            title: sceneData.title,
            description: sceneData.description,
            exits: this.convertExits(sceneData.exits),
            items: this.convertItems(sceneData.items),
            monsters: this.convertMonsters(sceneData.monsters),
            lighting: this.parseLightingCondition(sceneData.lighting),
            visited: false, // Runtime default
            atmosphere: sceneData.atmosphere || [],
            entryActions: this.convertEntryActions(sceneData.entryActions || []),
            state: { ...sceneData.state },
            tags: sceneData.tags,
            
            // Runtime methods with default implementations
            getDescription: function(_gameState) {
                if (!this.visited && this.firstVisitDescription) {
                    return this.firstVisitDescription;
                }
                return this.description;
            },
            
            getAvailableExits: function(_gameState) {
                // Return all exits - Services layer will handle condition evaluation
                return this.exits;
            },
            
            getVisibleItems: function(_gameState) {
                // Return all items - Services layer will handle visibility/condition evaluation
                return this.items;
            },
            
            canEnter: function(_gameState) {
                // Default: all scenes can be entered - Services layer can override
                return true;
            },
            
            onEnter: function(_gameState) {
                // Mark as visited
                this.visited = true;
                // Services layer will handle entry actions
            },
            
            onExit: function(_gameState) {
                // Default: no action on exit - Services layer can override
            },
            
            onLook: function(gameState) {
                return this.getDescription(gameState);
            },
            
            updateState: function(updates) {
                Object.assign(this.state, updates);
            }
        };

        // Handle optional properties with exactOptionalPropertyTypes compliance
        if (sceneData.firstVisitDescription !== undefined) {
            sceneResult.firstVisitDescription = sceneData.firstVisitDescription;
        }

        if (sceneData.region !== undefined) {
            sceneResult.region = sceneData.region;
        }

        return sceneResult;
    }

    /**
     * Convert exits from Record<string, string | object> to Exit[]
     */
    private convertExits(exitsData: SceneData['exits']): Exit[] {
        const exits: Exit[] = [];
        
        for (const [direction, exitInfo] of Object.entries(exitsData)) {
            if (typeof exitInfo === 'string') {
                // Simple exit: "north": "living_room"
                exits.push({
                    direction,
                    to: exitInfo
                });
            } else if (exitInfo && typeof exitInfo === 'object') {
                // Complex exit with conditions, locks, etc.
                const exit: Exit = {
                    direction,
                    to: exitInfo.to
                };

                // Handle optional properties with exactOptionalPropertyTypes compliance
                if (exitInfo.description !== undefined) {
                    exit.description = exitInfo.description;
                }
                if (exitInfo.condition !== undefined) {
                    exit.condition = exitInfo.condition;
                }
                if (exitInfo.locked !== undefined) {
                    exit.locked = exitInfo.locked;
                }
                if (exitInfo.keyId !== undefined) {
                    exit.keyId = exitInfo.keyId;
                }
                if (exitInfo.hidden !== undefined) {
                    exit.hidden = exitInfo.hidden;
                }
                if (exitInfo.oneWay !== undefined) {
                    exit.oneWay = exitInfo.oneWay;
                }

                exits.push(exit);
            }
        }
        
        return exits;
    }

    /**
     * Convert items from mixed array to SceneItem[]
     */
    private convertItems(itemsData: SceneData['items']): SceneItem[] {
        return itemsData.map(item => {
            if (typeof item === 'string') {
                // Simple item: "lamp"
                return {
                    itemId: item,
                    visible: true // Default visible
                };
            } else {
                // Complex item with properties
                const sceneItem: SceneItem = {
                    itemId: item.itemId,
                    visible: item.visible ?? true
                };

                // Handle optional condition property
                if (item.condition !== undefined) {
                    sceneItem.condition = item.condition;
                }

                return sceneItem;
            }
        });
    }

    /**
     * Convert monsters from mixed array to string array
     */
    private convertMonsters(monstersData: SceneData['monsters']): (string | { monsterId: string })[] {
        return monstersData.map(monster => {
            if (typeof monster === 'string') {
                return monster;
            } else {
                return {
                    monsterId: monster.monsterId
                };
            }
        });
    }

    /**
     * Convert entry actions from SceneData format to SceneAction[]
     */
    private convertEntryActions(entryActionsData: NonNullable<SceneData['entryActions']>): SceneAction[] {
        return entryActionsData.map(actionData => {
            const sceneAction: SceneAction = {
                action: function(_gameState) {
                    // Services layer will implement actual action logic
                    console.log(`Entry action: ${actionData.action}`);
                }
            };

            // Handle optional properties with exactOptionalPropertyTypes compliance
            if (actionData.condition !== undefined) {
                sceneAction.condition = actionData.condition;
            }
            if (actionData.message !== undefined) {
                sceneAction.message = actionData.message;
            }
            if (actionData.once !== undefined) {
                sceneAction.once = actionData.once;
            }

            return sceneAction;
        });
    }

    /**
     * Parse and validate lighting string to enum
     */
    private parseLightingCondition(lightingString: string): LightingCondition {
        const validLighting = Object.values(LightingCondition);
        if (!validLighting.includes(lightingString as LightingCondition)) {
            throw new Error(`Invalid lighting condition: ${lightingString}`);
        }
        return lightingString as LightingCondition;
    }

    /**
     * Validate index data structure
     */
    private validateIndexData(data: any): asserts data is SceneIndexData {
        if (!data || typeof data !== 'object') {
            throw new Error('Index data must be an object');
        }
        if (!Array.isArray(data.scenes)) {
            throw new Error('Index data must have scenes array');
        }
        if (typeof data.total !== 'number') {
            throw new Error('Index data must have total number');
        }
        if (!data.regions || typeof data.regions !== 'object') {
            throw new Error('Index data must have regions object');
        }
    }

    /**
     * Validate scene data structure
     */
    private validateSceneData(data: any): asserts data is SceneData {
        if (!data || typeof data !== 'object') {
            throw new Error('Scene data must be an object');
        }
        
        const requiredFields = [
            'id', 'title', 'description', 'exits', 'items', 'monsters', 
            'state', 'lighting', 'tags'
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Scene data missing required field: ${field}`);
            }
        }

        if (typeof data.id !== 'string' || !data.id) {
            throw new Error('Scene ID must be a non-empty string');
        }
        if (!Array.isArray(data.items)) {
            throw new Error('Scene items must be an array');
        }
        if (!Array.isArray(data.monsters)) {
            throw new Error('Scene monsters must be an array');
        }
        if (!Array.isArray(data.tags)) {
            throw new Error('Scene tags must be an array');
        }
        if (typeof data.exits !== 'object') {
            throw new Error('Scene exits must be an object');
        }
    }
}
