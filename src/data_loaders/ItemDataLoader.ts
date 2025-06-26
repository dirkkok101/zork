import { ItemData, ItemInteractionData, ItemIndexData, ItemProperties } from '../types/ItemData';
import { Item, ItemType, Size, ItemInteraction } from '../types/ItemTypes';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Interface defining the contract for item data loading operations.
 * 
 * The ItemDataLoader follows a stateless architecture with no internal caching.
 * Each method call performs fresh file I/O operations, ensuring consistent behavior
 * and eliminating memory overhead from cached data.
 * 
 * Data Structure:
 * - 214 items stored in flat file structure (data/items/)
 * - No hierarchical category folders
 * - Items indexed by index.json containing array of filenames
 * 
 * Type Distribution:
 * - TOOL: 164 items (76.6% - includes weapons, treasures, consumables)
 * - CONTAINER: 36 items
 * - FOOD: 7 items  
 * - WEAPON: 5 items
 * - LIGHT_SOURCE: 2 items
 * - TREASURE: 0 items (enum exists but unused)
 */
export interface IItemDataLoader {
    /**
     * Load all items from flat structure.
     * Performs fresh file I/O on each call (no caching).
     * @returns Promise resolving to array of all 214 items
     */
    loadAllItems(): Promise<Item[]>;

    /**
     * Load a specific item by its ID
     * @param itemId Unique identifier of the item
     * @returns Promise resolving to the item
     * @throws Error if item not found
     */
    loadItem(itemId: string): Promise<Item>;

    /**
     * Load items of a specific type.
     * Loads all items and filters client-side (no caching optimization).
     * @param type Item type enum value
     * @returns Promise resolving to array of items with the specified type
     */
    getItemsByType(type: ItemType): Promise<Item[]>;

    /**
     * Load items currently at a specific location.
     * Loads all items and filters client-side (no caching optimization).
     * @param location Scene ID or 'inventory'
     * @returns Promise resolving to array of items at the location
     */
    getItemsByLocation(location: string): Promise<Item[]>;

    /**
     * Get total item count from index.json.
     * @returns Promise resolving to total number of items (214)
     */
    getTotalCount(): Promise<number>;
}

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

    /**
     * Initialize the ItemDataLoader
     * @param dataPath Base path to the items data directory
     */
    constructor(dataPath: string = 'data/items/') {
        this.dataPath = dataPath;
    }

    /**
     * Load all items from flat structure
     */
    public async loadAllItems(): Promise<Item[]> {
        const index = await this.loadIndex();
        const allItems: Item[] = [];

        for (const filename of index.items) {
            try {
                const item = await this.loadItemFromFile(filename);
                allItems.push(item);
            } catch (error) {
                console.error(`Failed to load item from ${filename}:`, error);
                // Continue loading other items instead of failing completely
            }
        }

        return allItems;
    }

    /**
     * Load a specific item by its ID
     */
    public async loadItem(itemId: string): Promise<Item> {
        const index = await this.loadIndex();
        const filename = `${itemId}.json`;
        
        if (!index.items.includes(filename)) {
            throw new Error(`Item with ID '${itemId}' not found`);
        }

        return await this.loadItemFromFile(filename);
    }

    /**
     * Load items of a specific type
     */
    public async getItemsByType(type: ItemType): Promise<Item[]> {
        const allItems = await this.loadAllItems();
        return allItems.filter(item => item.type === type);
    }

    /**
     * Load items currently at a specific location
     */
    public async getItemsByLocation(location: string): Promise<Item[]> {
        const allItems = await this.loadAllItems();
        return allItems.filter(item => item.currentLocation === location);
    }

    /**
     * Get total item count
     */
    public async getTotalCount(): Promise<number> {
        const index = await this.loadIndex();
        return index.total;
    }

    /**
     * Load the item index
     */
    private async loadIndex(): Promise<ItemIndexData> {
        try {
            const indexPath = join(this.dataPath, 'index.json');
            const indexContent = await readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexContent) as ItemIndexData;
            
            this.validateIndexData(indexData);
            return indexData;
        } catch (error) {
            throw new Error(`Failed to load item index: ${error}`);
        }
    }

    /**
     * Load and convert an item from a JSON file
     */
    private async loadItemFromFile(filename: string): Promise<Item> {
        try {
            const fullPath = join(this.dataPath, filename);
            const fileContent = await readFile(fullPath, 'utf-8');
            const itemData = JSON.parse(fileContent) as ItemData;
            
            this.validateItemData(itemData);
            return this.convertItemDataToItem(itemData);
        } catch (error) {
            throw new Error(`Failed to load item from ${filename}: ${error}`);
        }
    }

    /**
     * Convert ItemData (raw JSON) to Item (typed interface)
     */
    private convertItemDataToItem(itemData: ItemData): Item {
        return {
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