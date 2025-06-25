import { ItemType, Size } from '../types/ItemTypes';
import { readFile } from 'fs/promises';
import { join } from 'path';
/**
 * Implementation of simple, stateless item data loading
 * Follows single responsibility principle and TypeScript strict mode
 */
export class ItemDataLoader {
    /**
     * Initialize the ItemDataLoader
     * @param dataPath Base path to the items data directory
     */
    constructor(dataPath = 'data/items/') {
        this.dataPath = dataPath;
    }
    /**
     * Load all items from flat structure
     */
    async loadAllItems() {
        const index = await this.loadIndex();
        const allItems = [];
        for (const filename of index.items) {
            try {
                const item = await this.loadItemFromFile(filename);
                allItems.push(item);
            }
            catch (error) {
                console.error(`Failed to load item from ${filename}:`, error);
                // Continue loading other items instead of failing completely
            }
        }
        return allItems;
    }
    /**
     * Load a specific item by its ID
     */
    async loadItem(itemId) {
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
    async getItemsByType(type) {
        const allItems = await this.loadAllItems();
        return allItems.filter(item => item.type === type);
    }
    /**
     * Load items currently at a specific location
     */
    async getItemsByLocation(location) {
        const allItems = await this.loadAllItems();
        return allItems.filter(item => item.currentLocation === location);
    }
    /**
     * Get total item count
     */
    async getTotalCount() {
        const index = await this.loadIndex();
        return index.total;
    }
    /**
     * Load the item index
     */
    async loadIndex() {
        try {
            const indexPath = join(this.dataPath, 'index.json');
            const indexContent = await readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexContent);
            this.validateIndexData(indexData);
            return indexData;
        }
        catch (error) {
            throw new Error(`Failed to load item index: ${error}`);
        }
    }
    /**
     * Load and convert an item from a JSON file
     */
    async loadItemFromFile(filename) {
        try {
            const fullPath = join(this.dataPath, filename);
            const fileContent = await readFile(fullPath, 'utf-8');
            const itemData = JSON.parse(fileContent);
            this.validateItemData(itemData);
            return this.convertItemDataToItem(itemData);
        }
        catch (error) {
            throw new Error(`Failed to load item from ${filename}: ${error}`);
        }
    }
    /**
     * Convert ItemData (raw JSON) to Item (typed interface)
     */
    convertItemDataToItem(itemData) {
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
    parseItemType(typeString) {
        const validTypes = Object.values(ItemType);
        if (!validTypes.includes(typeString)) {
            throw new Error(`Invalid item type: ${typeString}`);
        }
        return typeString;
    }
    /**
     * Parse and validate size string to enum
     */
    parseSize(sizeString) {
        const validSizes = Object.values(Size);
        if (!validSizes.includes(sizeString)) {
            throw new Error(`Invalid item size: ${sizeString}`);
        }
        return sizeString;
    }
    /**
     * Parse interactions and convert condition/effect strings to flag arrays
     */
    parseInteractions(interactionData) {
        return interactionData.map(interaction => {
            const result = {
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
    parseCondition(condition) {
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
    parseEffect(effect) {
        const assignmentMatch = effect.match(/^(\w+(?:\.\w+)*)\s*=\s*(.+)$/);
        if (assignmentMatch && assignmentMatch[1] && assignmentMatch[2]) {
            return ["set", assignmentMatch[1], assignmentMatch[2]];
        }
        return [effect];
    }
    /**
     * Validate index data structure
     */
    validateIndexData(data) {
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
    validateItemData(data) {
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
