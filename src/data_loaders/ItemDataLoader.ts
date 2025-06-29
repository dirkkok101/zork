
import * as log from 'loglevel';
import {IItemDataLoader} from './interfaces/IItemDataLoader';
import {Item, ItemInteraction, ItemType, Size} from '../types/ItemTypes';
import {ItemData, ItemIndexData, ItemInteractionData, ItemProperties} from '../types/ItemData';



/**
 * Implementation of stateless item data loading.
 * 
 * Key Characteristics:
 * - No internal caching - fresh file I/O on each operation
 * - Thread-safe design with no shared state
 * - Flat file structure (data/items/*.json)
 * - Type-safe conversion from raw JSON to typed interfaces
 * - Comprehensive validation and error handling
 * - Flag-based condition/effect parsing for game logic
 * 
 * Performance Characteristics:
 * - loadItem(): Single file read (~10ms)
 * - loadAllItems(): Reads 214 files (~200-500ms)
 * - getItemsByType/Location(): Calls loadAllItems() + client-side filtering
 * 
 * Follows single responsibility principle and TypeScript strict mode.
 */
export class ItemDataLoader implements IItemDataLoader {
    private readonly dataPath: string;
    private readonly logger: log.Logger;

    /**
     * Initialize the ItemDataLoader
     * @param dataPath Base URL to the items data directory
     * @param logger Logger instance for this loader
     */
    constructor(dataPath: string = '/items/', logger?: log.Logger) {
        this.dataPath = dataPath;
        this.logger = logger || log.getLogger('ItemDataLoader');
    }

    /**
     * Load all items from flat structure
     */
    public async loadAllItems(): Promise<Item[]> {
        const startTime = Date.now();
        this.logger.info(`Loading all items from ${this.dataPath}...`);
        
        const index = await this.loadIndex();
        const allItems: Item[] = [];
        const totalItems = index.items.length;
        let loadedCount = 0;
        let errorCount = 0;

        for (const filename of index.items) {
            try {
                const itemStartTime = Date.now();
                const item = await this.loadItemFromFile(filename);
                allItems.push(item);
                loadedCount++;
                
                const itemLoadTime = Date.now() - itemStartTime;
                this.logger.debug(`Loaded item ${item.id} from ${filename} in ${itemLoadTime}ms`);
                
                // Log progress every 50 items
                if (loadedCount % 50 === 0) {
                    this.logger.debug(`Progress: ${loadedCount}/${totalItems} items loaded`);
                }
            } catch (error) {
                errorCount++;
                this.logger.error(`Failed to load item from ${filename}:`, error);
                // Continue loading other items instead of failing completely
            }
        }

        const totalTime = Date.now() - startTime;
        this.logger.info(`✅ Loaded ${loadedCount}/${totalItems} items in ${totalTime}ms (${errorCount} errors)`);
        
        if (errorCount > 0) {
            this.logger.warn(`⚠️ ${errorCount} items failed to load`);
        }

        return allItems;
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
     * Load the item index
     */
    private async loadIndex(): Promise<ItemIndexData> {
        try {
            const indexUrl = `${this.dataPath}index.json`;
            this.logger.debug(`Loading item index from ${indexUrl}`);
            
            const jsonContent = await this.loadFileContent(indexUrl);
            const indexData = JSON.parse(jsonContent) as ItemIndexData;
            
            this.validateIndexData(indexData);
            this.logger.debug(`Index loaded: ${indexData.total} items found`);
            
            return indexData;
        } catch (error) {
            this.logger.error(`Failed to load item index:`, error);
            throw new Error(`Failed to load item index: ${error}`);
        }
    }

    /**
     * Load and convert an item from a JSON file
     */
    private async loadItemFromFile(filename: string): Promise<Item> {
        try {
            const itemUrl = `${this.dataPath}${filename}`;
            this.logger.trace(`Loading item from ${itemUrl}`);
            
            const jsonContent = await this.loadFileContent(itemUrl);
            const itemData = JSON.parse(jsonContent) as ItemData;
            
            this.validateItemData(itemData);
            const item = this.convertItemDataToItem(itemData);
            
            this.logger.trace(`Successfully converted item ${item.id} (${item.name})`);
            return item;
        } catch (error) {
            this.logger.error(`Failed to load item from ${filename}:`, error);
            throw new Error(`Failed to load item from ${filename}: ${error}`);
        }
    }

    /**
     * Convert ItemData (raw JSON) to Item (typed interface)
     */
    private convertItemDataToItem(itemData: ItemData): Item {
        const item = {
            id: itemData.id,
            name: itemData.name,
            aliases: itemData.aliases,
            description: itemData.description,
            examineText: itemData.examineText,
            type: this.parseItemType(itemData.type),
            portable: itemData.portable,
            visible: itemData.visible,
            weight: itemData.weight,
            size: this.parseSize(itemData.size),
            tags: itemData.tags,
            properties: this.convertProperties(itemData.properties),
            interactions: this.parseInteractions(itemData.interactions),
            currentLocation: itemData.initialLocation,
            state: { ...itemData.initialState },
            flags: {}
        };

        // For container items, initialize contents from initialState
        if (itemData.type === 'CONTAINER' && itemData.initialState?.contents) {
            (item as any).contents = [...itemData.initialState.contents];
        }

        return item;
    }

    /**
     * Parse and validate item type string to enum
     */
    private parseItemType(typeString: string): ItemType {
        const validTypes = Object.values(ItemType);
        if (!validTypes.includes(typeString as ItemType)) {
            throw new Error(`Invalid item type: ${typeString}`);
        }
        return typeString as ItemType;
    }

    /**
     * Parse and validate size string to enum
     */
    private parseSize(sizeString: string): Size {
        const validSizes = Object.values(Size);
        if (!validSizes.includes(sizeString as Size)) {
            throw new Error(`Invalid item size: ${sizeString}`);
        }
        return sizeString as Size;
    }

    /**
     * Parse interactions and convert condition/effect strings to flexible types
     */
    private parseInteractions(interactionData: ItemInteractionData[]): ItemInteraction[] {
        return interactionData.map(interaction => {
            const result: ItemInteraction = {
                command: interaction.command,
                message: interaction.message
            };
            
            if (interaction.condition) {
                result.condition = this.parseCondition(interaction.condition);
            }
            
            if (interaction.effect) {
                result.effect = this.parseEffect(interaction.effect);
            }
            
            // Handle additional properties that may exist in the data
            if (interaction.scoreChange !== undefined) {
                result.scoreChange = interaction.scoreChange;
            }
            
            if (interaction.success !== undefined) {
                result.success = interaction.success;
            }
            
            return result;
        });
    }

    /**
     * Parse condition string into flexible condition type
     * Returns the condition as-is to preserve flexibility for services
     * Example: "!state.open" -> "!state.open" (string)
     */
    private parseCondition(condition: string): string | string[] | ((gameState: any) => boolean) {
        // Return condition as string to let services handle the parsing
        // This maintains flexibility for different condition formats
        return condition;
    }

    /**
     * Parse effect string into flexible effect type
     * Returns the effect as-is to preserve flexibility for services
     * Example: "state.open = true" -> "state.open = true" (string)
     */
    private parseEffect(effect: string): string | string[] | ((gameState: any) => void) {
        // Return effect as string to let services handle the parsing
        // This maintains flexibility for different effect formats
        return effect;
    }

    /**
     * Convert raw properties to structured ItemProperties interface
     * Maps known properties to typed fields while preserving unknown ones
     */
    private convertProperties(rawProperties: Record<string, any>): ItemProperties {
        const properties: ItemProperties = {};

        // Map known properties to typed fields
        if (rawProperties.size !== undefined) {
            properties.size = rawProperties.size;
        }
        if (rawProperties.value !== undefined) {
            properties.value = rawProperties.value;
        }
        if (rawProperties.treasurePoints !== undefined) {
            properties.treasurePoints = rawProperties.treasurePoints;
        }
        if (rawProperties.capacity !== undefined) {
            properties.capacity = rawProperties.capacity;
        }
        if (rawProperties.readText !== undefined) {
            properties.readText = rawProperties.readText;
        }
        if (rawProperties.lightTimer !== undefined) {
            properties.lightTimer = rawProperties.lightTimer;
        }
        if (rawProperties.matchCount !== undefined) {
            properties.matchCount = rawProperties.matchCount;
        }

        // Preserve any other properties using the index signature
        for (const [key, value] of Object.entries(rawProperties)) {
            if (!['size', 'value', 'treasurePoints', 'capacity', 'readText', 'lightTimer', 'matchCount'].includes(key)) {
                properties[key] = value;
            }
        }

        return properties;
    }

    /**
     * Validate index data structure
     */
    private validateIndexData(data: any): asserts data is ItemIndexData {
        if (!data || typeof data !== 'object') {
            throw new Error('Index data must be an object');
        }
        if (!Array.isArray(data.items)) {
            throw new Error('Index data must have items array');
        }
        if (typeof data.total !== 'number') {
            throw new Error('Index data must have total number');
        }
    }

    /**
     * Validate item data structure
     */
    private validateItemData(data: any): asserts data is ItemData {
        if (!data || typeof data !== 'object') {
            throw new Error('Item data must be an object');
        }
        
        const requiredFields = [
            'id', 'name', 'description', 'examineText', 'aliases', 
            'type', 'portable', 'visible', 'weight', 'size', 
            'initialState', 'tags', 'properties', 'interactions', 'initialLocation'
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Item data missing required field: ${field}`);
            }
        }

        if (typeof data.id !== 'string' || !data.id) {
            throw new Error('Item ID must be a non-empty string');
        }
        if (!Array.isArray(data.aliases)) {
            throw new Error('Item aliases must be an array');
        }
        if (!Array.isArray(data.tags)) {
            throw new Error('Item tags must be an array');
        }
        if (!Array.isArray(data.interactions)) {
            throw new Error('Item interactions must be an array');
        }
    }
}
