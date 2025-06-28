import { MonsterData, MonsterIndex } from '../types/MonsterData';
import { Monster } from '../types/Monster';
import { MonsterState, MovementPattern } from '../types/MonsterTypes';
import { IMonsterDataLoader } from './interfaces/IMonsterDataLoader';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as log from 'loglevel';

/**
 * Implementation of stateless monster data loading.
 * 
 * Key Characteristics:
 * - No internal caching - fresh file I/O on each operation
 * - Thread-safe design with no shared state
 * - Flat file structure (data/monsters/*.json)
 * - Type-safe conversion from raw JSON to typed interfaces
 * - Comprehensive validation and error handling
 * - MDL property mapping (behaviorFunction, movementDemon, combatStrength)
 * 
 * Performance Characteristics:
 * - loadMonster(): Single file read (~10ms)
 * - loadAllMonsters(): Reads 9 files (~50-100ms)
 * - getMonstersByType/Scene(): Calls loadAllMonsters() + client-side filtering
 * 
 * Follows single responsibility principle and TypeScript strict mode.
 */
export class MonsterDataLoader implements IMonsterDataLoader {
    private readonly dataPath: string;
    private readonly logger: log.Logger;

    /**
     * Initialize the MonsterDataLoader
     * @param dataPath Base path to the monsters data directory
     * @param logger Logger instance for this loader
     */
    constructor(dataPath: string = 'data/monsters/', logger?: log.Logger) {
        this.dataPath = dataPath;
        this.logger = logger || log.getLogger('MonsterDataLoader');
    }

    /**
     * Load all monsters from flat structure
     */
    public async loadAllMonsters(): Promise<Monster[]> {
        const startTime = Date.now();
        this.logger.info(`Loading all monsters from ${this.dataPath}...`);
        
        const index = await this.loadIndex();
        const allMonsters: Monster[] = [];
        const totalMonsters = index.monsters.length;
        let loadedCount = 0;
        let errorCount = 0;

        for (const monsterId of index.monsters) {
            try {
                const monsterStartTime = Date.now();
                const monster = await this.loadMonsterFromFile(monsterId);
                allMonsters.push(monster);
                loadedCount++;
                
                const monsterLoadTime = Date.now() - monsterStartTime;
                this.logger.debug(`Loaded monster ${monster.id} in ${monsterLoadTime}ms`);
            } catch (error) {
                errorCount++;
                this.logger.error(`Failed to load monster ${monsterId}:`, error);
                // Continue loading other monsters instead of failing completely
            }
        }

        const totalTime = Date.now() - startTime;
        this.logger.info(`✅ Loaded ${loadedCount}/${totalMonsters} monsters in ${totalTime}ms (${errorCount} errors)`);
        
        if (errorCount > 0) {
            this.logger.warn(`⚠️ ${errorCount} monsters failed to load`);
        }

        return allMonsters;
    }

    

    /**
     * Load the monster index
     */
    private async loadIndex(): Promise<MonsterIndex> {
        try {
            const indexPath = join(this.dataPath, 'index.json');
            this.logger.debug(`Loading monster index from ${indexPath}`);
            
            const indexContent = await readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexContent) as MonsterIndex;
            
            this.validateIndexData(indexData);
            this.logger.debug(`Index loaded: ${indexData.total} monsters found`);
            
            return indexData;
        } catch (error) {
            this.logger.error(`Failed to load monster index:`, error);
            throw new Error(`Failed to load monster index: ${error}`);
        }
    }

    /**
     * Load and convert a monster from a JSON file
     */
    private async loadMonsterFromFile(monsterId: string): Promise<Monster> {
        try {
            const filename = `${monsterId}.json`;
            const fullPath = join(this.dataPath, filename);
            const fileContent = await readFile(fullPath, 'utf-8');
            const monsterData = JSON.parse(fileContent) as MonsterData;
            
            this.validateMonsterData(monsterData);
            return this.convertMonsterDataToMonster(monsterData);
        } catch (error) {
            throw new Error(`Failed to load monster ${monsterId}: ${error}`);
        }
    }

    /**
     * Convert MonsterData (raw JSON) to Monster (typed interface)
     */
    private convertMonsterDataToMonster(data: MonsterData): Monster {
        // Determine initial state based on data
        const initialState = this.determineInitialState(data);
        
        // Convert movement pattern
        const movementPattern = this.convertMovementPattern(data);

        return {
            // Core properties
            id: data.id,
            name: data.name,
            description: data.description,
            examineText: data.examineText,
            
            // Health
            health: data.health ?? data.maxHealth ?? 100,
            maxHealth: data.maxHealth ?? 100,
            
            // State and location
            state: initialState,
            currentSceneId: data.currentSceneId !== undefined ? data.currentSceneId : (data.startingSceneId || null),
            startingSceneId: data.startingSceneId || null,
            
            // Movement
            movementPattern: movementPattern,
            allowedScenes: this.extractAllowedScenes(data),
            
            // Inventory
            inventory: data.inventory || [],
            
            // MDL properties
            synonyms: data.synonyms || [],
            flags: data.flags || {},
            combatStrength: data.combatStrength,
            meleeMessages: data.meleeMessages,
            behaviorFunction: data.behaviorFunction,
            movementDemon: data.movementDemon,
            
            // Type and properties
            type: data.type,
            properties: data.properties || {},
            variables: this.initializeVariables(data),
            
            // Optional properties
            defeatScore: data.onDefeat?.grantScore,
            behaviors: this.extractBehaviors(data)
        };
    }

    /**
     * Determine initial monster state based on data
     */
    private determineInitialState(data: MonsterData): MonsterState {
        // Check for explicit state
        if (data.state) {
            return this.parseMonsterState(data.state);
        }
        
        // Infer from flags (VILLAIN takes precedence)
        if (data.flags?.VILLAIN) {
            return MonsterState.HOSTILE;
        }
        if (data.flags?.INVISIBLE || data.flags?.OVISON) {
            return MonsterState.LURKING;
        }
        if (data.behaviorFunction?.includes('GUARD')) {
            return MonsterState.GUARDING;
        }
        
        // Default based on type
        switch (data.type) {
            case 'humanoid':
                return MonsterState.IDLE;
            case 'creature':
                return MonsterState.WANDERING;
            case 'environmental':
                return MonsterState.LURKING;
            default:
                return MonsterState.IDLE;
        }
    }

    /**
     * Convert movement pattern data
     */
    private convertMovementPattern(data: MonsterData): MovementPattern {
        // Check explicit pattern
        if (data.movementPattern?.type) {
            return data.movementPattern.type as MovementPattern;
        }
        
        // Infer from demon name
        if (data.movementDemon) {
            // ROBBER demons follow the player
            if (data.movementDemon.includes('ROBBER') || data.movementDemon.includes('FOLLOW')) {
                return 'follow';
            }
            if (data.movementDemon.includes('FLEE')) {
                return 'flee';
            }
            if (data.movementDemon.includes('PATROL')) {
                return 'patrol';
            }
            if (data.movementDemon.includes('RANDOM')) {
                return 'random';
            }
        }
        
        // Default to stationary
        return 'stationary';
    }

    /**
     * Extract allowed scenes from data
     */
    private extractAllowedScenes(data: MonsterData): string[] {
        // Check movement pattern data
        if (data.movementPattern?.data?.validScenes) {
            return data.movementPattern.data.validScenes;
        }
        
        // Check properties
        if (data.properties?.allowedScenes && Array.isArray(data.properties.allowedScenes)) {
            return data.properties.allowedScenes;
        }
        
        // Empty array means all scenes allowed
        return [];
    }

    /**
     * Initialize monster-specific variables
     */
    private initializeVariables(data: MonsterData): Record<string, any> {
        const variables: Record<string, any> = {};
        
        // Add thief-specific variables
        if (data.id === 'thief') {
            variables.hasStolen = false;
            variables.stolenItems = [];
            variables.engagedInCombat = false;
        }
        
        // Add troll-specific variables
        if (data.id === 'troll') {
            variables.hasBeenPaid = false;
            variables.isGuarding = true;
        }
        
        // Add cyclops-specific variables
        if (data.id === 'cyclops') {
            variables.isAsleep = true;
            variables.hasBeenAwakened = false;
        }
        
        // Add any variables from data
        if (data.properties?.variables) {
            Object.assign(variables, data.properties.variables);
        }
        
        return variables;
    }

    /**
     * Extract behaviors from data
     */
    private extractBehaviors(data: MonsterData): string[] | undefined {
        const behaviors: string[] = [];
        
        // Extract from behavior function
        if (data.behaviorFunction) {
            if (data.behaviorFunction.includes('ROBBER')) {
                behaviors.push('steal');
            }
            if (data.behaviorFunction.includes('GUARD')) {
                behaviors.push('guard');
            }
            if (data.behaviorFunction.includes('VANISH')) {
                behaviors.push('vanish');
            }
        }
        
        // Extract from special abilities
        if (data.specialAbilities) {
            behaviors.push(...data.specialAbilities);
        }
        
        // Extract from properties
        if (data.properties?.behaviors && Array.isArray(data.properties.behaviors)) {
            behaviors.push(...data.properties.behaviors);
        }
        
        return behaviors.length > 0 ? behaviors : undefined;
    }

    /**
     * Parse monster state string to enum
     */
    private parseMonsterState(stateString: string): MonsterState {
        const normalizedState = stateString.toLowerCase();
        const validStates = Object.values(MonsterState);
        
        if (validStates.includes(normalizedState as MonsterState)) {
            return normalizedState as MonsterState;
        }
        
        // Default to idle if invalid
        console.warn(`Invalid monster state: ${stateString}, defaulting to idle`);
        return MonsterState.IDLE;
    }

    /**
     * Validate index data structure
     */
    private validateIndexData(data: any): asserts data is MonsterIndex {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Index data must be an object');
        }
        if (!Array.isArray(data.monsters)) {
            throw new Error('Index data must have monsters array');
        }
        if (typeof data.total !== 'number') {
            throw new Error('Index data must have total number');
        }
        if (!data.types || typeof data.types !== 'object' || Array.isArray(data.types)) {
            throw new Error('Index data must have types object');
        }
    }

    /**
     * Validate monster data structure
     */
    private validateMonsterData(data: any): asserts data is MonsterData {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Monster data must be an object');
        }
        
        const requiredFields = [
            'id', 'name', 'type', 'description', 'examineText',
            'inventory', 'synonyms', 'flags', 'properties'
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Monster data missing required field: ${field}`);
            }
        }

        if (typeof data.id !== 'string' || !data.id) {
            throw new Error('Monster ID must be a non-empty string');
        }
        if (!['humanoid', 'creature', 'environmental'].includes(data.type)) {
            throw new Error(`Invalid monster type: ${data.type}`);
        }
        if (!Array.isArray(data.inventory)) {
            throw new Error('Monster inventory must be an array');
        }
        if (!Array.isArray(data.synonyms)) {
            throw new Error('Monster synonyms must be an array');
        }
    }
}
