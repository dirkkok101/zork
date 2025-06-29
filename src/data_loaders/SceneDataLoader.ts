import { SceneData } from '../types/SceneData';
import { Scene, LightingCondition, Exit, SceneItem, SceneAction } from '../types/SceneTypes';
import { ISceneDataLoader } from './interfaces/ISceneDataLoader';
import * as log from 'loglevel';

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
    private readonly logger: log.Logger;

    /**
     * Initialize the SceneDataLoader
     * @param dataPath Base path to the scenes data directory
     * @param logger Logger instance for this loader
     */
    constructor(dataPath: string = '/scenes/', logger?: log.Logger) {
        this.dataPath = dataPath;
        this.logger = logger || log.getLogger('SceneDataLoader');
    }

    /**
     * Load all scenes from flat structure
     */
    public async loadAllScenes(): Promise<Scene[]> {
        const startTime = Date.now();
        this.logger.info(`Loading all scenes from ${this.dataPath}...`);
        
        const index = await this.loadIndex();
        const allScenes: Scene[] = [];
        const totalScenes = index.scenes.length;
        let loadedCount = 0;
        let errorCount = 0;

        for (const filename of index.scenes) {
            try {
                const sceneStartTime = Date.now();
                const scene = await this.loadSceneFromFile(filename);
                allScenes.push(scene);
                loadedCount++;
                
                const sceneLoadTime = Date.now() - sceneStartTime;
                this.logger.debug(`Loaded scene ${scene.id} from ${filename} in ${sceneLoadTime}ms`);
                
                // Log progress every 50 scenes
                if (loadedCount % 50 === 0) {
                    this.logger.debug(`Progress: ${loadedCount}/${totalScenes} scenes loaded`);
                }
            } catch (error) {
                errorCount++;
                this.logger.error(`Failed to load scene from ${filename}:`, error);
                // Continue loading other scenes instead of failing completely
            }
        }

        const totalTime = Date.now() - startTime;
        this.logger.info(`✅ Loaded ${loadedCount}/${totalScenes} scenes in ${totalTime}ms (${errorCount} errors)`);
        
        if (errorCount > 0) {
            this.logger.warn(`⚠️ ${errorCount} scenes failed to load`);
        }

        return allScenes;
    }

    /**
     * Load file content - works in both browser (fetch) and Node.js (fs) environments
     */
    private async loadFileContent(filePath: string): Promise<string> {
        if (typeof window !== 'undefined') {
            // Browser environment - use fetch
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            return response.text();
        } else {
            // Node.js environment - use fs.readFile
            const fs = await import('fs/promises');
            const path = await import('path');
            const fullPath = path.resolve(process.cwd(), filePath);
            return fs.readFile(fullPath, 'utf-8');
        }
    }

    /**
     * Load the scene index
     */
    private async loadIndex(): Promise<SceneIndexData> {
        try {
            const indexUrl = `${this.dataPath}index.json`;
            this.logger.debug(`Loading scene index from ${indexUrl}`);
            
            const jsonContent = await this.loadFileContent(indexUrl);
            const indexData = JSON.parse(jsonContent) as SceneIndexData;
            
            this.validateIndexData(indexData);
            this.logger.debug(`Index loaded: ${indexData.total} scenes found in ${Object.keys(indexData.regions).length} regions`);
            
            return indexData;
        } catch (error) {
            this.logger.error(`Failed to load scene index:`, error);
            throw new Error(`Failed to load scene index: ${error}`);
        }
    }

    /**
     * Load and convert a scene from a JSON file
     */
    private async loadSceneFromFile(filename: string): Promise<Scene> {
        try {
            const sceneUrl = `${this.dataPath}${filename}`;
            this.logger.trace(`Loading scene from ${sceneUrl}`);
            
            const jsonContent = await this.loadFileContent(sceneUrl);
            const sceneData = JSON.parse(jsonContent) as SceneData;
            
            this.validateSceneData(sceneData);
            const scene = this.convertSceneDataToScene(sceneData);
            
            this.logger.trace(`Successfully converted scene ${scene.id} (${scene.title})`);
            return scene;
        } catch (error) {
            this.logger.error(`Failed to load scene from ${filename}:`, error);
            throw new Error(`Failed to load scene from ${filename}: ${error}`);
        }
    }

    /**
     * Convert SceneData (raw JSON) to Scene (typed interface)
     * Returns pure data Scene objects without methods, following our data/behavior separation architecture
     */
    private convertSceneDataToScene(sceneData: SceneData): Scene {
        
        const scene: Scene = {
            id: sceneData.id,
            title: sceneData.title,
            description: sceneData.description,
            exits: this.convertExits(sceneData.exits),
            items: this.convertItems(sceneData.items),
            monsters: this.convertMonsters(sceneData.monsters),
            lighting: this.parseLightingCondition(sceneData.lighting),
            atmosphere: sceneData.atmosphere || [],
            entryActions: this.convertEntryActions(sceneData.entryActions || []),
            state: { ...sceneData.state },
            tags: sceneData.tags
            // NO METHODS - pure data only, behavior handled by SceneService
        };
        

        // Handle optional properties with exactOptionalPropertyTypes compliance
        if (sceneData.firstVisitDescription !== undefined) {
            scene.firstVisitDescription = sceneData.firstVisitDescription;
        }

        if (sceneData.region !== undefined) {
            scene.region = sceneData.region;
        }

        return scene;
    }

    /**
     * Convert exits from Record<string, string | object> to Exit[]
     * Filters out blocked exits (where blocked=true or to=null)
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
                // Skip blocked exits - they should not be in the Scene.exits array
                if (exitInfo.blocked === true || exitInfo.to === null) {
                    this.logger.debug(`Skipping blocked exit ${direction} (blocked: ${exitInfo.blocked}, to: ${exitInfo.to})`);
                    continue;
                }

                // Only process exits with valid string destinations
                if (exitInfo.to && typeof exitInfo.to === 'string') {
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
                    if (exitInfo.failureMessage !== undefined) {
                        exit.failureMessage = exitInfo.failureMessage;
                    }

                    exits.push(exit);
                } else {
                    this.logger.warn(`Skipping exit ${direction} with invalid destination: ${exitInfo.to}`);
                }
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
