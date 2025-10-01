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
    TREASURE = 'TREASURE',
    FOOD = 'FOOD',
    LIGHT_SOURCE = 'LIGHT_SOURCE',
    VEHICLE = 'VEHICLE',
    MECHANISM = 'MECHANISM',
    FIXTURE = 'FIXTURE',
    DOOR = 'DOOR',
    KEY = 'KEY',
    ROPE = 'ROPE',
    READABLE = 'READABLE'
}

/**
 * Item interaction interface
 * Represents an interaction that can be performed with an item
 */
export interface ItemInteraction {
    /** The command that triggers this interaction */
    command: string;
    
    /** Flexible conditions that must be met for the interaction to occur */
    condition?: string | string[] | ((gameState: any) => boolean);
    
    /** Flexible effects that occur when the interaction is triggered */
    effect?: string | string[] | ((gameState: any) => void);
    
    /** Message displayed when the interaction occurs */
    message: string;
    
    /** Score change when this interaction is performed */
    scoreChange?: number;
    
    /** Whether the interaction is successful (default: true) */
    success?: boolean;
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
    properties: import('../types/ItemData').ItemProperties;

    /** Available interactions for this item */
    interactions: ItemInteraction[];

    /** Current location of the item (scene ID or 'inventory') */
    currentLocation: string;

    /** Runtime state flags for dynamic behavior */
    state: Record<string, any>;

    /** Item-specific flags for conditional logic */
    flags: Record<string, boolean>;

    /** Whether this item has been AI-enhanced */
    expanded?: boolean;
}

/**
 * Common result interface for all item operations
 * Used by all service methods to provide consistent responses
 */
export interface ItemOperationResult {
    /** Whether the operation was successful */
    success: boolean;
    
    /** Message to display to the player */
    message: string;
    
    /** Optional score change from this operation */
    scoreChange?: number;
    
    /** Optional state updates to apply to the game */
    stateUpdates?: any;
}

/**
 * Consumption effects for food and drink items
 */
export interface ConsumptionEffects {
    /** Health change */
    health?: number;
    
    /** Thirst change */
    thirst?: number;
    
    /** Hunger change */
    hunger?: number;
    
    /** Special effects or flags to set */
    effects?: Record<string, any>;
}

/**
 * Weapon item interface
 * Extends base Item with weapon-specific properties
 */
export interface WeaponItem extends Item {
    /** Base damage dealt by this weapon */
    damage: number;
    
    /** Type of weapon for combat calculations */
    weaponType: 'SWORD' | 'AXE' | 'KNIFE' | 'BLUNT' | 'PROJECTILE';
    
    /** Whether the weapon is currently wielded */
    isWielded: boolean;
    
    /** Weapon durability (optional) */
    durability?: number;
    
    /** Maximum durability (optional) */
    maxDurability?: number;
}

/**
 * Vehicle item interface
 * Extends base Item with vehicle-specific properties
 */
export interface VehicleItem extends Item {
    /** Maximum number of items the vehicle can carry */
    capacity: number;
    
    /** Maximum weight the vehicle can carry */
    maxWeight: number;
    
    /** Current passengers in the vehicle */
    passengers: string[];
    
    /** Items currently in the vehicle */
    contents: string[];
}

/**
 * Consumable item interface
 * Extends base Item with consumable-specific properties
 */
export interface ConsumableItem extends Item {
    /** Type of consumable */
    consumptionType: 'FOOD' | 'DRINK';
    
    /** Nutritional or hydration value */
    value?: number;
    
    /** Effects when consumed */
    effects?: ConsumptionEffects;
    
    /** Whether the item is consumed after use */
    destroyOnConsumption?: boolean;
}

/**
 * Container item interface
 * Extends base Item with container-specific properties
 */
export interface ContainerItem extends Item {
    /** Items currently in the container */
    contents: string[];
    
    /** Maximum number of items the container can hold */
    capacity?: number;
    
    /** Maximum weight the container can hold */
    maxWeight?: number;
    
    /** Whether the container is currently open */
    isOpen?: boolean;
    
    /** Whether the container is locked */
    isLocked?: boolean;
    
    /** Whether container contents are visible when closed */
    contentsVisible?: boolean;
}

/**
 * Light source item interface
 * Pure data structure extending base Item with light source properties
 * All behavior handled by services
 */
export interface LightSourceItem extends Item {
    /** Whether the light source is currently lit */
    isLit: boolean;
    
    /** Remaining fuel/battery (-1 for infinite) */
    remainingFuel?: number;
    
    /** Maximum fuel capacity */
    maxFuel?: number;
    
    /** Light intensity (affects how much area is illuminated) */
    intensity?: number;
}

/**
 * Openable item interface
 * Pure data structure for items that can be opened and closed
 * All behavior handled by services
 */
export interface OpenableItem extends Item {
    /** Whether the item is currently open */
    isOpen: boolean;
}

/**
 * Lockable item interface
 * Pure data structure for items that can be locked and unlocked
 * All behavior handled by services
 */
export interface LockableItem extends Item {
    /** Whether the item is currently locked */
    isLocked: boolean;
    
    /** Required key ID to unlock this item */
    requiredKey?: string;
}

