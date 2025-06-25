import { GameState } from './GameState';

/**
 * Direction type
 * Represents possible movement directions
 */
export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down' | 'in' | 'out' | string;

/**
 * Lighting condition enumeration
 * Represents the lighting state of a scene
 */
export enum LightingCondition {
    DAYLIGHT = 'daylight', // Always lit
    LIT = 'lit',           // Currently lit
    DARK = 'dark',         // Requires light source
    PITCH_BLACK = 'pitchBlack' // Cannot be lit
}

/**
 * Exit interface
 * Represents a connection between scenes
 */
export interface Exit {
    /** Direction of the exit */
    direction: Direction;

    /** ID of the destination scene */
    to: string;

    /** Optional description of the exit */
    description?: string;

    /**
     * Condition for the exit to be available
     * A string or array of strings representing flag checks (e.g., "has_rope", "visited_cave")
     *
     * Examples:
     * - Single flag: "has_rope"
     * - Multiple flags (all required): ["has_rope", "daytime"]
     *
     * The game services will handle checking these flags against the game state.
     */
    condition?: string | string[];

    /** Whether the exit is locked */
    locked?: boolean;

    /** ID of the key that can unlock this exit */
    keyId?: string;

    /** Whether the exit is hidden */
    hidden?: boolean;

    /** Whether the exit is one-way */
    oneWay?: boolean;
}

/**
 * Scene item interface
 * Represents an item placed in a scene
 */
export interface SceneItem {
    /** ID of the item */
    itemId: string;

    /** Whether the item is visible */
    visible: boolean;

    /**
     * Condition for the item to be present
     * A string or array of strings representing flag checks (e.g., "has_lamp", "defeated_troll")
     *
     * Examples:
     * - Single flag: "has_lamp"
     * - Multiple flags (all required): ["defeated_troll", "daytime"]
     */
    condition?: string | string[];
}

/**
 * Scene action interface
 * Represents an action that can be triggered in a scene
 */
export interface SceneAction {
    /**
     * Condition for the action to be available
     * A string or array of strings representing flag checks (e.g., "door_unlocked", "has_treasure")
     *
     * Examples:
     * - Single flag: "door_unlocked"
     * - Multiple flags (all required): ["has_treasure", "nighttime"]
     */
    condition?: string | string[];

    /** The action to execute */
    action: (gameState: GameState) => void;

    /** Message to display when the action is executed */
    message?: string;

    /** Whether the action should only be executed once */
    once?: boolean;
}

/**
 * Scene interface
 * Represents a location in the game world
 */
export interface Scene {
    /** Unique identifier for the scene */
    id: string;

    /** Display title of the scene */
    title: string;

    /** Primary description of the scene */
    description: string;

    /** Description shown only on first visit */
    firstVisitDescription?: string;

    /** Available exits from the scene */
    exits: Exit[];

    /** Items present in the scene */
    items: SceneItem[];

    /** Monsters present in the scene */
    monsters?: (string | { monsterId: string })[];

    /** Current lighting condition */
    lighting: LightingCondition;

    /** Whether the player has visited this scene */
    visited: boolean;

    /** Region the scene belongs to */
    region?: string;

    /** Random atmospheric messages */
    atmosphere?: string[];

    /** Actions triggered when entering the scene */
    entryActions?: SceneAction[];

    /** Scene-specific state */
    state: Record<string, any>;

    /** Tags for categorizing the scene */
    tags: string[];

    /**
     * Get the description of the scene
     * @param gameState Current game state
     * @returns Scene description text
     */
    getDescription(gameState: GameState): string;

    /**
     * Get available exits from the scene
     * @param gameState Current game state
     * @returns Array of available exits
     */
    getAvailableExits(gameState: GameState): Exit[];

    /**
     * Get visible items in the scene
     * @param gameState Current game state
     * @returns Array of visible scene items
     */
    getVisibleItems(gameState: GameState): SceneItem[];

    /**
     * Check if the player can enter this scene
     * @param gameState Current game state
     * @returns Whether entry is allowed
     */
    canEnter(gameState: GameState): boolean;

    /**
     * Called when the player enters the scene
     * @param gameState Current game state
     */
    onEnter(gameState: GameState): void;

    /**
     * Called when the player exits the scene
     * @param gameState Current game state
     */
    onExit(gameState: GameState): void;

    /**
     * Called when the player looks around the scene
     * @param gameState Current game state
     * @returns Look description text
     */
    onLook(gameState: GameState): string;

    /**
     * Update the scene state
     * @param updates Partial state updates
     */
    updateState(updates: Partial<Record<string, any>>): void;
}
