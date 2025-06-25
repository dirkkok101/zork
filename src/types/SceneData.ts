
/**
 * Interface representing scene data as stored in JSON files
 * This is separate from the runtime Scene interface
 */
export interface SceneData {
    /** Unique identifier for the scene */
    id: string;

    /** Display title of the scene */
    title: string;

    /** Primary description of the scene */
    description: string;

    /** Description shown only on first visit */
    firstVisitDescription?: string;

    /** Available exits from the scene - map of direction to destination */
    exits: Record<string, string | {
        /** ID of the destination scene */
        to: string;

        /** Optional description of the exit */
        description?: string;

        /**
         * Condition for the exit to be available
         * Can be a single flag (string) or multiple flags (string[])
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

        /** Message to show when exit conditions are not met */
        failureMessage?: string;
    }>;

    /** Items present in the scene - can be string IDs or objects with properties */
    items: (string | {
        /** ID of the item */
        itemId: string;

        /** Whether the item is visible */
        visible?: boolean;

        /** Condition for the item to be present (as a string to be evaluated) */
        condition?: string;
    })[];

    /** Monsters present in the scene - can be string IDs or objects with properties */
    monsters: (string | {
        /** ID of the monster */
        monsterId: string;

        /** Condition for the monster to be present (as a string to be evaluated) */
        condition?: string;
    })[];

    /** Scene-specific state */
    state: Record<string, any>;

    /** Current lighting condition */
    lighting: string;

    /** Region the scene belongs to */
    region?: string;

    /** Random atmospheric messages */
    atmosphere?: string[];

    /** Actions triggered when entering the scene */
    entryActions?: {
        /** Action name to execute */
        action?: string;

        /** Condition for the action to be available (as a string to be evaluated) */
        condition?: string;

        /** Message to display when the action is executed */
        message?: string;

        /** Whether the action should only be executed once */
        once?: boolean;

        /** Additional data for the action */
        payload?: Record<string, any>;
    }[];

    /** Tags for categorizing the scene */
    tags: string[];
}
