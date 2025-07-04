/**
 * Interface representing item data as stored in JSON files
 * This interface matches the exact structure found in the data/items/ directory
 */
export interface ItemData {
    /** Unique identifier for the item */
    id: string;

    /** Display name of the item */
    name: string;

    /** Brief description of the item */
    description: string;

    /** Detailed description shown when examining the item */
    examineText: string;

    /** Alternative names that can be used to refer to the item */
    aliases: string[];

    /** Item type as string (converted to enum by DataLoader) */
    type: string;

    /** Whether the item can be picked up */
    portable: boolean;

    /** Whether the item is visible to the player */
    visible: boolean;

    /** Weight of the item (affects inventory capacity) */
    weight: number;

    /** Size category as string (converted to enum by DataLoader) */
    size: string;

    /** Initial state object - always empty in JSON files */
    initialState: Record<string, any>;

    /** Tags for categorizing the item - can be empty array */
    tags: string[];

    /** Additional properties - usually empty object, sometimes contains size */
    properties: ItemProperties;

    /** Available interactions for this item */
    interactions: ItemInteractionData[];

    /** Initial location of the item - currently "unknown" for all items */
    initialLocation: string;
}

/**
 * Interface representing item interaction data as stored in JSON files
 * Defines how players can interact with items
 */
export interface ItemInteractionData {
    /** The command that triggers this interaction */
    command: string;

    /** Condition that must be met for the interaction to occur (optional) */
    condition?: string;

    /** Effect that occurs when the interaction is triggered (optional) */
    effect?: string;

    /** Message displayed when the interaction occurs */
    message: string;

    /** Score change when this interaction is performed (optional) */
    scoreChange?: number;

    /** Whether the interaction is successful (optional) */
    success?: boolean;
}

/**
 * Interface representing item properties extracted from reference data
 * These correspond to MDL object properties like OSIZE, OFVAL, OTVAL, etc.
 */
export interface ItemProperties {
    /** Size/weight value from OSIZE */
    size?: number;

    /** Fence value from OFVAL (what thief values it at) */
    value?: number;

    /** Treasure points from OTVAL (score awarded to player) */
    treasurePoints?: number;

    /** Container capacity from OCAPAC */
    capacity?: number;

    /** Readable text from OREAD */
    readText?: string;

    /** Light timer duration from OLINT */
    lightTimer?: number;

    /** Match count from OMATCH */
    matchCount?: number;

    /** Deposit values for trophy case - maps item ID to deposit score */
    depositValues?: Record<string, number>;

    /** Any other properties not yet categorized */
    [key: string]: any;
}

/**
 * Interface representing the item index structure
 * Used for flat item organization
 */
export interface ItemIndexData {
    /** Flat array of item filenames */
    items: string[];

    /** Total number of items */
    total: number;

    /** Last updated timestamp */
    lastUpdated: string;
}