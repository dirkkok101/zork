import {Item, ItemType} from '@/types/ItemTypes';

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
}
