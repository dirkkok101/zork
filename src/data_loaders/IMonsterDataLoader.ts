import {Monster} from '@/types/Monster';

/**
 * Interface defining the contract for monster data loading operations.
 * 
 * The MonsterDataLoader follows a stateless architecture with no internal caching.
 * Each method call performs fresh file I/O operations, ensuring consistent behavior
 * and eliminating memory overhead from cached data.
 * 
 * Data Structure:
 * - 9 monsters stored in flat file structure (data/monsters/)
 * - No hierarchical category folders
 * - Monsters indexed by index.json containing array of monster IDs
 * 
 * Type Distribution:
 * - HUMANOID: 3 monsters (thief, troll, cyclops)
 * - CREATURE: 5 monsters (grue, bat, vampire_bat, gnome_of_zurich, volcano_gnome)
 * - ENVIRONMENTAL: 1 monster (ghost)
 */
export interface IMonsterDataLoader {
    /**
     * Load all monsters from flat structure.
     * Performs fresh file I/O on each call (no caching).
     * @returns Promise resolving to array of all 9 monsters
     */
    loadAllMonsters(): Promise<Monster[]>;


}
