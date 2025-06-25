import { GameState } from './GameState';

/**
 * Item size enumeration
 * Represents the physical size of an item
 */
export enum Size {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    HUGE = 'huge'
}

/**
 * Item type enumeration
 * Categorizes items by their primary function
 */
export enum ItemType {
    TREASURE = 'TREASURE',
    TOOL = 'TOOL',
    WEAPON = 'WEAPON',
    LIGHT_SOURCE = 'LIGHT_SOURCE',
    LIGHT = 'LIGHT',
    KEY = 'KEY',
    CONTAINER = 'CONTAINER',
    OPENABLE = 'OPENABLE',
    OPENABLE_CONTAINER = 'OPENABLE_CONTAINER',
    LOCKABLE = 'LOCKABLE',
    FIXTURE = 'FIXTURE',
    CONSUMABLE = 'CONSUMABLE',
    MECHANISM = 'MECHANISM',
    FOOD = 'FOOD',
    VALUABLE = 'VALUABLE',
    GENERIC = 'GENERIC'
}

export interface ItemInteraction {
    /** The command that triggers this interaction */
    command: string;
    /** Condition that must be met for the interaction to occur */
    condition?: string | ((gameState: GameState) => boolean);
    /** Effect that occurs when the interaction is triggered */
    effect?: string | ((gameState: GameState) => void);
    /** Message displayed when the interaction occurs */
    message: string;
    /** Whether the interaction was successful */
    success?: boolean;
    /** Score change associated with the interaction */
    scoreChange?: number;
}

/**
 * Base item interface
 * Defines the core properties and methods for all items
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

    /** Interactions available for this item */
    interactions?: ItemInteraction[];

    /** Item size category */
    size: Size;

    /** Item type categories (can have multiple) */
    types: ItemType[];

    /** Value of the item (for treasures) */
    value?: number;

    /** Whether the item can be picked up */
    canTake: boolean;

    /** Whether the item can be thrown */
    canThrow?: boolean;

    /** Whether the item is fragile and breaks when thrown */
    isFragile?: boolean;

    /** Weight of the item (affects inventory capacity) */
    weight: number;

    /**
     * Called when the player attempts to take the item
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    onTake(gameState: GameState): { success: boolean; message: string };

    /**
     * Called when the player attempts to drop the item
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    onDrop(gameState: GameState): { success: boolean; message: string };

    /**
     * Called when the player attempts to use the item
     * @param gameState Current game state
     * @param target Optional target item or scene for the use action
     * @returns Result message and whether the action was successful
     */
    onUse(gameState: GameState, target?: string): { success: boolean; message: string };

    /**
     * Called when the player examines the item
     * @param gameState Current game state
     * @returns Examination text
     */
    onExamine(gameState: GameState): string;



    /**
     * Called when the player throws the item
     * @param gameState Current game state
     * @returns Result message, whether the action was successful, and if the item should be destroyed
     */
    onThrow?(gameState: GameState): { success: boolean; message: string; destroyItem?: boolean };

    /**
     * Called when the item is hit by another item
     * @param item The item that hit this item
     * @returns Result message and whether the action was successful
     */
    onHit?(item: Item): { success: boolean; message: string; state?: Record<string, any> };
}

/**
 * Container item interface
 * Extends the base item with container functionality
 */
export interface ContainerItem extends Item {
    /** Items contained within this container */
    contents: string[];

    /** Maximum capacity of the container (by count) */
    capacity: number;

    /** Maximum weight the container can hold */
    maxWeight: number;

    /** Whether the contents are visible without opening */
    contentsVisible: boolean;

    /**
     * Add an item to the container
     * @param itemId ID of the item to add
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    addItem(itemId: string, gameState: GameState): { success: boolean; message: string };

    /**
     * Remove an item from the container
     * @param itemId ID of the item to remove
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    removeItem(itemId: string, gameState: GameState): { success: boolean; message: string };

    /**
     * Get the visible contents of the container
     * @param gameState Current game state
     * @returns Array of visible item IDs
     */
    getVisibleContents(gameState: GameState): string[];
}

/**
 * Openable item interface
 * Extends container items with open/close functionality
 */
export interface OpenableItem extends ContainerItem {
    /** Whether the container is currently open */
    isOpen: boolean;

    /**
     * Open the container
     * @param gameState Current game state
     * @returns Result message, whether the action was successful, and optional state updates
     */
    open(gameState: GameState): { success: boolean; message: string; stateUpdates?: any };

    /**
     * Close the container
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    close(gameState: GameState): { success: boolean; message: string };
}

/**
 * Lockable item interface
 * Extends openable items with lock functionality
 */
export interface LockableItem extends OpenableItem {
    /** Whether the container is currently locked */
    isLocked: boolean;

    /** ID of the key that can unlock this container */
    keyId: string;

    /**
     * Lock the container
     * @param gameState Current game state
     * @param keyId ID of the key being used
     * @returns Result message and whether the action was successful
     */
    lock(gameState: GameState, keyId?: string): { success: boolean; message: string };

    /**
     * Unlock the container
     * @param gameState Current game state
     * @param keyId ID of the key being used
     * @returns Result message and whether the action was successful
     */
    unlock(gameState: GameState, keyId?: string): { success: boolean; message: string };
}

/**
 * Light source item interface
 * Extends the base item with light source functionality
 */
export interface LightSourceItem extends Item {
    /** Whether the light source is currently on */
    isLit: boolean;

    /** Remaining fuel/battery life (-1 for unlimited) */
    remainingFuel: number;

    /**
     * Turn on the light source
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    lightOn(gameState: GameState): { success: boolean; message: string };

    /**
     * Turn off the light source
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    lightOff(gameState: GameState): { success: boolean; message: string };

    /**
     * Check if the light source is functional
     * @param gameState Current game state
     * @returns Whether the light source can be used
     */
    isFunctional(gameState: GameState): boolean;
}

/**
 * Weapon item interface
 * Extends the base item with weapon functionality
 */
export interface WeaponItem extends Item {
    /** Base damage of the weapon */
    damage: number;

    /** Durability of the weapon (-1 for unbreakable) */
    durability: number;

    /**
     * Calculate the actual damage based on current state
     * @param gameState Current game state
     * @returns Calculated damage value
     */
    calculateDamage(gameState: GameState): number;

    /**
     * Reduce durability after use
     * @param gameState Current game state
     * @returns Whether the weapon is still usable
     */
    reduceDurability(gameState: GameState): boolean;
}

/**
 * Consumable item interface
 * Extends the base item with consumable functionality
 */
export interface ConsumableItem extends Item {
    /** Number of uses remaining */
    usesRemaining: number;

    /** Effects applied when consumed */
    effects: Record<string, any>;

    /**
     * Consume the item
     * @param gameState Current game state
     * @returns Result message and whether the action was successful
     */
    consume(gameState: GameState): { success: boolean; message: string };
}

/**
 * Monster interface
 * Defines the properties and methods for monsters in the game
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

    /** Whether the monster is hostile to the player */
    isHostile: boolean;

    /** Health points of the monster */
    health: number;

    /** Damage the monster can inflict */
    damage: number;

    /**
     * Called when the monster is hit by an item
     * @param item The item that hit the monster
     * @returns Result message and whether the action was successful
     */
    onHit(item: Item): { success: boolean; message: string };
}
