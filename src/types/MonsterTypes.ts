import { GameState } from './GameState';

/**
 * Monster state enumeration
 * Represents the current behavior state of a monster
 */
export enum MonsterState {
    IDLE = 'idle',
    ALERT = 'alert',
    HOSTILE = 'hostile',
    FLEEING = 'fleeing',
    FRIENDLY = 'friendly',
    DEAD = 'dead',
    GUARDING = 'GUARDING',
    WANDERING = 'WANDERING',
    LURKING = 'LURKING',
    SLEEPING = 'SLEEPING'
}

/**
 * Movement pattern type
 * Defines how a monster moves through the game world
 */
export type MovementPattern = 'stationary' | 'random' | 'patrol' | 'follow' | 'flee';

/**
 * Monster interface
 * Represents a dynamic entity in the game world
 */
export interface Monster {
    /** Unique identifier for the monster */
    id: string;

    /** Display name of the monster */
    name: string;

    /** Brief description of the monster */
    description: string;

    /** Detailed description shown when examining the monster */
    examineText: string;

    /** Current health points */
    health: number;

    /** Maximum health points */
    maxHealth: number;

    /** Current behavior state */
    state: MonsterState;

    /** ID of the current scene */
    currentSceneId: string;

    /** Movement pattern */
    movementPattern: MovementPattern;

    /** Scenes this monster can move between */
    allowedScenes: string[];

    /** Items the monster is carrying */
    inventory: string[];

    /** Monster-specific state variables */
    variables: Record<string, any>;

    /** Monster behavior patterns */
    behaviors?: string[];

    /** Score awarded for defeating the monster */
    defeatScore?: number;

    /**
     * Update the monster's state
     * @param gameState Current game state
     */
    update(gameState: GameState): void;

    /**
     * Handle the monster attacking
     * @param gameState Current game state
     * @param target Target of the attack (if any)
     * @returns Attack result with message and optional score change
     */
    attack(gameState: GameState, target?: string): { message: string; scoreChange?: number; };

    /**
     * Handle the monster taking damage
     * @param gameState Current game state
     * @param damage Amount of damage
     * @param source Source of the damage
     * @returns Damage result with message and optional score change
     */
    takeDamage(gameState: GameState, damage: number, source?: string): { message: string; scoreChange?: number; };

    /**
     * Handle interaction with the monster
     * @param gameState Current game state
     * @param action Type of interaction
     * @param itemId Optional item used in the interaction
     * @returns Interaction result with message and optional score change
     */
    interact(gameState: GameState, action: string, itemId?: string): { message: string; scoreChange?: number; };

    /**
     * Move the monster to a new scene
     * @param gameState Current game state
     * @param targetSceneId ID of the destination scene
     * @returns Whether the move was successful
     */
    moveTo(gameState: GameState, targetSceneId: string): boolean;

    /**
     * Check if the monster can see the player
     * @param gameState Current game state
     * @returns Whether the monster can see the player
     */
    canSeePlayer(gameState: GameState): boolean;

    /**
     * Get the monster's description based on current state
     * @param gameState Current game state
     * @returns Description text
     */
    getDescription(gameState: GameState): string;
}
