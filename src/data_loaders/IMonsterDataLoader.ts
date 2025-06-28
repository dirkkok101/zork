import { Monster } from '../types/Monster';
import { MonsterType } from '../types/MonsterTypes';

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

    /**
     * Load a specific monster by its ID
     * @param monsterId Unique identifier of the monster
     * @returns Promise resolving to the monster
     * @throws Error if monster not found
     */
    loadMonster(monsterId: string): Promise<Monster>;

    /**
     * Load monsters of a specific type.
     * Loads all monsters and filters client-side (no caching optimization).
     * @param type Monster type enum value
     * @returns Promise resolving to array of monsters with the specified type
     */
    getMonstersByType(type: MonsterType): Promise<Monster[]>;

    /**
     * Load monsters currently at a specific scene.
     * Loads all monsters and filters client-side (no caching optimization).
     * @param sceneId Scene ID to check
     * @returns Promise resolving to array of monsters at the scene
     */
    getMonstersInScene(sceneId: string): Promise<Monster[]>;

    /**
     * Get total monster count from index.json.
     * @returns Promise resolving to total number of monsters (9)
     */
    getTotalCount(): Promise<number>;

    /**
     * Check if a monster exists by ID
     * @param monsterId Unique identifier of the monster
     * @returns Promise resolving to boolean indicating existence
     */
    monsterExists(monsterId: string): Promise<boolean>;
}