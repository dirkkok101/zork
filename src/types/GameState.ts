/**
 * Core game state interface
 * Represents the complete state of the game at any point in time
 */
export interface GameState {
    /** Current scene ID */
    currentSceneId: string;

    /** Player's inventory items */
    inventory: string[];

    /** State of individual scenes */
    sceneStates: Record<string, SceneState>;

    /** Player's score */
    score: number;

    /** Number of moves made */
    moves: number;

    /** Game flags for tracking progress */
    flags: Record<string, boolean>;

    /** Game variables for tracking values */
    variables: Record<string, any>;

    /** Items in the game world */
    items: Record<string, any>;

    /** Scenes in the game world */
    scenes: Record<string, any>;
}

/**
 * Scene state interface
 * Represents the state of a specific scene
 */
export interface SceneState {
    /** Whether the player has visited this scene */
    visited: boolean;

    /** Items present in the scene */
    items: string[];

    /** Monsters present in the scene */
    monsters?: string[];

    /** Scene-specific state variables */
    variables: Record<string, any>;
}

/**
 * Initial game state factory
 * Creates a new game state with default values
 */
export function createInitialGameState(startingSceneId: string): GameState {
    return {
        currentSceneId: startingSceneId,
        inventory: [],
        sceneStates: {},
        score: 0,
        moves: 0,
        flags: {},
        variables: {},
        items: {},
        scenes: {}
    };
}
