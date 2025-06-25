import { ItemData, ItemInteractionData, ItemIndexData } from '../types/ItemData';
import { Item, ItemType, Size, ItemInteraction } from '../types/ItemTypes';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Interface defining the contract for item data loading operations
 * Follows dependency inversion principle for testability
 */
export interface IItemDataLoader {
    /**
     * Load all items from all categories
     * @returns Promise resolving to array of all items
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
     * Load items from a specific category
     * @param category Category name (treasures, tools, containers, weapons, consumables)
     * @returns Promise resolving to array of items in the category
     */
    getItemsByCategory(category: string): Promise<Item[]>;

    /**
     * Load items of a specific type
     * @param type Item type enum value
     * @returns Promise resolving to array of items with the specified type
     */
    getItemsByType(type: ItemType): Promise<Item[]>;

    /**
     * Load items currently at a specific location
     * @param location Scene ID or 'inventory'
     * @returns Promise resolving to array of items at the location
     */
    getItemsByLocation(location: string): Promise<Item[]>;

    /**
     * Get available item categories
     * @returns Promise resolving to array of category names
     */
    getCategories(): Promise<string[]>;

    /**
     * Get total item count
     * @returns Promise resolving to total number of items
     */
    getTotalCount(): Promise<number>;
}

/**
 * Implementation of item data loading with caching and validation
 * Follows single responsibility principle and TypeScript strict mode
 */
export class ItemDataLoader implements IItemDataLoader {
    private readonly dataPath: string;
    private itemCache: Map<string, Item> = new Map();
    private categoryCache: Map<string, Item[]> = new Map();
    private indexCache: ItemIndexData | null = null;
    private allItemsCache: Item[] | null = null;

    /**
     * Initialize the ItemDataLoader
     * @param dataPath Base path to the items data directory
     */
    constructor(dataPath: string = 'data/items/') {
        this.dataPath = dataPath;
    }

    /**
     * Load all items from all categories
     */
    public async loadAllItems(): Promise<Item[]> {
        if (this.allItemsCache) {
            return this.allItemsCache;
        }

        const index = await this.loadIndex();
        const allItems: Item[] = [];

        for (const category of Object.keys(index.categories)) {
            const categoryItems = await this.getItemsByCategory(category);
            allItems.push(...categoryItems);
        }

        this.allItemsCache = allItems;
        return allItems;
    }

    /**
     * Load a specific item by its ID
     */
    public async loadItem(itemId: string): Promise<Item> {
        if (this.itemCache.has(itemId)) {
            return this.itemCache.get(itemId)!;
        }

        // Find the item in the index
        const index = await this.loadIndex();
        let itemFilePath: string | null = null;

        for (const [, files] of Object.entries(index.categories)) {
            const filePath = files.find(f => f.includes(`${itemId}.json`));
            if (filePath) {
                itemFilePath = filePath;
                break;
            }
        }

        if (!itemFilePath) {
            throw new Error(`Item with ID '${itemId}' not found`);
        }

        return await this.loadOrGetCachedItem(itemFilePath);
    }

    /**
     * Load items from a specific category
     */
    public async getItemsByCategory(category: string): Promise<Item[]> {
        if (this.categoryCache.has(category)) {
            return this.categoryCache.get(category)!;
        }

        const index = await this.loadIndex();
        const categoryFiles = index.categories[category];

        if (!categoryFiles) {
            throw new Error(`Category '${category}' not found`);
        }

        const items: Item[] = [];
        for (const filePath of categoryFiles) {
            try {
                const item = await this.loadOrGetCachedItem(filePath);
                items.push(item);
            } catch (error) {
                console.error(`Failed to load item from ${filePath}:`, error);
                // Continue loading other items instead of failing completely
            }
        }

        this.categoryCache.set(category, items);
        return items;
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
     * Get available item categories
     */
    public async getCategories(): Promise<string[]> {
        const index = await this.loadIndex();
        return Object.keys(index.categories);
    }

    /**
     * Get total item count
     */
    public async getTotalCount(): Promise<number> {
        const index = await this.loadIndex();
        return index.total;
    }

    /**
     * Load and cache the item index
     */
    private async loadIndex(): Promise<ItemIndexData> {
        if (this.indexCache) {
            return this.indexCache;
        }

        try {
            const indexPath = join(this.dataPath, 'index.json');
            const indexContent = await readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexContent) as ItemIndexData;
            
            this.validateIndexData(indexData);
            this.indexCache = indexData;
            return indexData;
        } catch (error) {
            throw new Error(`Failed to load item index: ${error}`);
        }
    }

    /**
     * Load an item with caching - checks item cache first, then loads from file
     */
    private async loadOrGetCachedItem(filePath: string): Promise<Item> {
        // Extract item ID from file path to check cache
        const fileNameWithExt = filePath.split('/').pop() || '';
        const itemId = fileNameWithExt.replace('.json', '');
        
        // Check if already in item cache
        if (this.itemCache.has(itemId)) {
            return this.itemCache.get(itemId)!;
        }
        
        // Load from file and cache
        const item = await this.loadItemFromFile(filePath);
        this.itemCache.set(itemId, item);
        return item;
    }

    /**
     * Load and convert an item from a JSON file
     */
    private async loadItemFromFile(filePath: string): Promise<Item> {
        try {
            const fullPath = join(this.dataPath, filePath);
            const fileContent = await readFile(fullPath, 'utf-8');
            const itemData = JSON.parse(fileContent) as ItemData;
            
            this.validateItemData(itemData);
            return this.convertItemDataToItem(itemData);
        } catch (error) {
            throw new Error(`Failed to load item from ${filePath}: ${error}`);
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
            properties: itemData.properties,
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
     * Parse interactions and convert condition/effect strings to flag arrays
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
            
            return result;
        });
    }

    /**
     * Parse condition string into flag-based condition array
     * Example: "!state.open" -> ["not", "state.open"]
     */
    private parseCondition(condition: string): string[] {
        // Handle negation
        if (condition.startsWith('!')) {
            return ["not", condition.substring(1)];
        }
        return [condition];
    }

    /**
     * Parse effect string into flag-based effect array
     * Example: "state.open = true" -> ["set", "state.open", "true"]
     */
    private parseEffect(effect: string): string[] {
        const assignmentMatch = effect.match(/^(\w+(?:\.\w+)*)\s*=\s*(.+)$/);
        if (assignmentMatch && assignmentMatch[1] && assignmentMatch[2]) {
            return ["set", assignmentMatch[1], assignmentMatch[2]];
        }
        return [effect];
    }

    /**
     * Validate index data structure
     */
    private validateIndexData(data: any): asserts data is ItemIndexData {
        if (!data || typeof data !== 'object') {
            throw new Error('Index data must be an object');
        }
        if (!data.categories || typeof data.categories !== 'object') {
            throw new Error('Index data must have categories object');
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