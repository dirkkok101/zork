import { Scene } from '../../types/SceneTypes';

/**
 * Interface defining the contract for scene data loading operations.
 * 
 * The SceneDataLoader follows a stateless architecture with no internal caching.
 * Each method call performs fresh file I/O operations, ensuring consistent behavior
 * and eliminating memory overhead from cached data.
 * 
 * Data Structure:
 * - 195 scenes stored in flat file structure (data/scenes/)
 * - No hierarchical category folders
 * - Scenes indexed by index.json containing regional organization
 * 
 * Regional Distribution:
 * - Above Ground: 11 scenes (5.6% - outdoor areas with natural lighting)
 * - Underground: 162 scenes (83.1% - indoor and subterranean areas)
 * - Maze: 17 scenes (8.7% - confusing maze passages and dead ends)
 * - Endgame: 5 scenes (2.6% - final game areas)
 * 
 * Lighting Distribution:
 * - Daylight: 11 scenes (above ground outdoor areas)
 * - Lit: ~25 scenes (indoor areas with natural/artificial lighting)
 * - Dark: ~159 scenes (underground passages, caves, maze areas)
 * 
 * Exit Complexity:
 * - Simple exits: String destination (e.g., "north": "living_room")
 * - Conditional exits: Objects with conditions, locks, keys, failure messages
 * - Blocked exits: NoExit entries with failure messages
 * - Door-based exits: Exits requiring door interaction
 */
export interface ISceneDataLoader {
    /**
     * Load all scenes from flat structure.
     * Performs fresh file I/O on each call (no caching).
     * @returns Promise resolving to array of all 195 scenes
     */
    loadAllScenes(): Promise<Scene[]>;
}
