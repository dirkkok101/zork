/**
 * Item size enumeration
 * Represents the physical size of an item
 * Based on actual values found in item data files
 */
export enum Size {
    TINY = 'TINY',
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE',
    HUGE = 'HUGE'
}

/**
 * Item type enumeration
 * Categorizes items by their primary function
 * Based on actual values found in item data files
 */
export enum ItemType {
    TOOL = 'TOOL',
    WEAPON = 'WEAPON',
    CONTAINER = 'CONTAINER',
    TREASURE = 'TREASURE'
}

/**
 * Item interaction interface
 * Represents an interaction that can be performed with an item
 */
export interface ItemInteraction {
    /** The command that triggers this interaction */
    command: string;
    
    /** Flag-based conditions that must be met for the interaction to occur */
    condition?: string[];
    
    /** Flag-based effects that occur when the interaction is triggered */
    effect?: string[];
    
    /** Message displayed when the interaction occurs */
    message: string;
}

/**
 * Base item interface
 * Represents a game item with static data and runtime state
 * No methods - pure data structure for use with Services layer
 */
export interface Item {
    /** Unique identifier for the item */
    id: string;

    /** Display name of the item */
    name: string;

    /** Alternative names that can be used to refer to the item */
    aliases: string[];

    /** Brief description of the item */
    description: string;

    /** Detailed description shown when examining the item */
    examineText: string;

    /** Item type category */
    type: ItemType;

    /** Whether the item can be picked up */
    portable: boolean;

    /** Whether the item is visible to the player */
    visible: boolean;

    /** Weight of the item (affects inventory capacity) */
    weight: number;

    /** Item size category */
    size: Size;

    /** Tags for categorizing the item */
    tags: string[];

    /** Additional properties from the data file */
    properties: Record<string, any>;

    /** Available interactions for this item */
    interactions: ItemInteraction[];

    /** Current location of the item (scene ID or 'inventory') */
    currentLocation: string;

    /** Runtime state flags for dynamic behavior */
    state: Record<string, any>;

    /** Item-specific flags for conditional logic */
    flags: Record<string, boolean>;
}

