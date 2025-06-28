/**
 * Monster Data Types
 * Defines the structure of monster data as stored in JSON files
 * This is the raw data format that gets converted to Monster runtime types
 */

/**
 * Monster type categories
 */
export type MonsterType = 'humanoid' | 'creature' | 'environmental';

/**
 * Movement pattern types and their data structures
 */
export interface MovementPatternData {
    type: 'stationary' | 'random' | 'patrol' | 'follow' | 'flee';
    data?: {
        excludedScenes?: string[];
        validScenes?: string[];
        guardedScenes?: string[];
        patrolRoute?: string[];
        onlyInDarkness?: boolean;
        followDistance?: number;
    };
}

/**
 * Monster behavior definition
 */
export interface MonsterBehavior {
    /** Type of behavior */
    type: string;
    
    /** Chance of this behavior occurring (0.0 to 1.0) */
    chance: number;
    
    /** Conditions that must be met for behavior to trigger */
    condition?: string;
    
    /** Effect that occurs when behavior triggers */
    effect: string;
    
    /** Optional parameters for the effect */
    parameters?: Record<string, any>;
}

/**
 * Monster dialogue entry
 */
export interface MonsterDialogue {
    /** Word or phrase that triggers this dialogue */
    trigger: string;
    
    /** Response text */
    response: string;
    
    /** Optional condition for this dialogue */
    condition?: string;
    
    /** Optional effect when dialogue is triggered */
    effect?: string;
}

/**
 * Melee message tables for combat
 */
export interface MeleeMessages {
    /** Messages when monster misses */
    miss?: string[];
    
    /** Messages when knocking unconscious */
    unconscious?: string[];
    
    /** Messages when killing */
    kill?: string[];
    
    /** Messages for light wounds */
    light_wound?: string[];
    
    /** Messages for severe wounds */
    severe_wound?: string[];
    
    /** Messages for staggering */
    stagger?: string[];
    
    /** Messages for disarming */
    disarm?: string[];
}

/**
 * Monster defeat information
 */
export interface MonsterDefeat {
    /** Message displayed when monster is defeated */
    message: string;
    
    /** Items dropped on defeat */
    dropItems?: string[];
    
    /** Score granted for defeating */
    grantScore?: number;
    
    /** Optional effects triggered on defeat */
    effects?: string[];
    
    /** Flags to set on defeat */
    setFlags?: Record<string, boolean>;
}

/**
 * Complete monster data structure
 */
export interface MonsterData {
    /** Unique identifier */
    id: string;
    
    /** Display name */
    name: string;
    
    /** Monster type category */
    type: MonsterType;
    
    /** Brief description shown in room */
    description: string;
    
    /** Detailed examine text */
    examineText: string;
    
    /** Starting scene ID (optional - not all monsters have fixed starting locations) */
    startingSceneId?: string;
    
    /** Current scene ID (usually same as starting) */
    currentSceneId?: string;
    
    /** Items in monster's inventory */
    inventory: string[];
    
    /** Monster synonyms from MDL */
    synonyms: string[];
    
    /** MDL flags */
    flags: Record<string, boolean>;
    
    /** Combat strength (OSTRENGTH) */
    combatStrength?: number;
    
    /** Melee combat messages */
    meleeMessages?: MeleeMessages;
    
    /** Behavior function name */
    behaviorFunction?: string;
    
    /** Movement demon name */
    movementDemon?: string;
    
    /** Monster-specific properties */
    properties: Record<string, any>;
    
    /** Optional state (for compatibility) */
    state?: string;
    
    /** Optional health values (derived from game logic) */
    health?: number;
    maxHealth?: number;
    
    /** Optional movement pattern (derived from demon) */
    movementPattern?: MovementPatternData;
    
    /** Optional behaviors (derived from function) */
    behaviors?: MonsterBehavior[];
    
    /** Optional dialogue */
    dialogue?: MonsterDialogue[];
    
    /** Optional defeat information */
    onDefeat?: MonsterDefeat;
    
    /** Optional aggression level */
    aggressionLevel?: number;
    
    /** Optional intelligence level */
    intelligence?: number;
    
    /** Optional special abilities */
    specialAbilities?: string[];
    
    /** Optional weaknesses */
    weaknesses?: string[];
}

/**
 * Monster index structure
 */
export interface MonsterIndex {
    /** List of all monster IDs */
    monsters: string[];
    
    /** Total number of monsters */
    total: number;
    
    /** Monsters grouped by type */
    types: {
        humanoid: string[];
        creature: string[];
        environmental: string[];
    };
}