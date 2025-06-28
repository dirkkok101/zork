import { GameState } from '../../types/GameState';

/**
 * Effect execution result
 */
export interface EffectResult {
    /** Whether the effect was successfully applied */
    success: boolean;
    
    /** Updated game state after effect application */
    gameState: GameState;
    
    /** Human-readable message describing what happened */
    message: string;
    
    /** Array of specific changes made */
    changes: EffectChange[];
    
    /** Any errors that occurred during execution */
    errors: string[];
    
    /** Warnings that don't prevent execution */
    warnings: string[];
}

/**
 * Individual change made by an effect
 */
export interface EffectChange {
    /** Type of change made */
    type: 'flag' | 'variable' | 'inventory' | 'scene' | 'item' | 'score' | 'custom';
    
    /** Target of the change (flag name, item ID, etc.) */
    target: string;
    
    /** Previous value */
    oldValue: any;
    
    /** New value */
    newValue: any;
    
    /** Optional description of the change */
    description?: string;
}

/**
 * Effect expression types supported by the applicator
 */
export type EffectExpression = 
    | string                    // Simple effect string: "set flag door_open true"
    | EffectObject              // Complex effect object
    | EffectFunction            // Function-based effect
    | EffectExpression[];       // Array of effects to apply

/**
 * Complex effect object structure
 */
export interface EffectObject {
    /** Type of effect */
    type: 'set_flag' | 'set_variable' | 'add_item' | 'remove_item' | 'move_player' | 
          'add_score' | 'show_message' | 'play_sound' | 'change_scene' | 'custom';
    
    /** Target of the effect */
    target: string;
    
    /** Value to set/add/etc. */
    value?: any;
    
    /** Optional condition to check before applying */
    condition?: string;
    
    /** Optional delay before applying (in moves) */
    delay?: number;
    
    /** Whether this effect should only be applied once */
    once?: boolean;
    
    /** Optional description for debugging */
    description?: string;
    
    /** Additional parameters for custom effects */
    parameters?: Record<string, any>;
}

/**
 * Function-based effect
 */
export type EffectFunction = (gameState: GameState) => GameState | Promise<GameState>;

/**
 * Effect context for application
 */
export interface EffectContext {
    /** Source of the effect (for debugging) */
    source: string;
    
    /** Current scene ID */
    sceneId: string;
    
    /** Player performing the action */
    playerId?: string;
    
    /** Additional context variables */
    variables: Record<string, any>;
    
    /** Whether to skip validation */
    skipValidation?: boolean;
}

/**
 * Effect Application Service Interface
 * 
 * Provides centralized effect application for all game systems.
 * Essential for handling state changes from interactions, commands, and events.
 * 
 * Responsibilities:
 * - Parse and apply effect expressions
 * - Manage state changes safely
 * - Provide rollback capabilities
 * - Handle delayed and conditional effects
 * 
 * Dependencies:
 * - Game state for modifications
 * - Flag service for flag changes
 * - Item service for inventory modifications
 * - Scene service for location changes
 * - Condition service for effect prerequisites
 */
export interface IEffectApplicationService {
    /**
     * Apply an effect expression to the game state
     * @param effect Effect to apply
     * @param gameState Current game state
     * @param context Optional additional context
     * @returns Effect result with updated game state
     */
    apply(effect: EffectExpression, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Apply multiple effects in sequence
     * @param effects Array of effects to apply
     * @param gameState Current game state
     * @param context Optional additional context
     * @returns Combined effect result
     */
    applyMultiple(effects: EffectExpression[], gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Set a flag value
     * @param flagName Name of the flag
     * @param value Value to set
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    setFlag(flagName: string, value: boolean, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Set a variable value
     * @param variableName Name of the variable
     * @param value Value to set
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    setVariable(variableName: string, value: any, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Add an item to the player's inventory
     * @param itemId Item ID to add
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    addItemToInventory(itemId: string, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Remove an item from the player's inventory
     * @param itemId Item ID to remove
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    removeItemFromInventory(itemId: string, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Move an item from one location to another
     * @param itemId Item ID to move
     * @param fromLocation Source location
     * @param toLocation Destination location
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    moveItem(itemId: string, fromLocation: string, toLocation: string, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Move the player to a different scene
     * @param sceneId Destination scene ID
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    movePlayer(sceneId: string, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Add points to the player's score
     * @param points Points to add (can be negative)
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    addScore(points: number, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Change an item's state
     * @param itemId Item ID to modify
     * @param stateName State property to change
     * @param value New value
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    changeItemState(itemId: string, stateName: string, value: any, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Change a scene's state
     * @param sceneId Scene ID to modify
     * @param stateName State property to change
     * @param value New value
     * @param gameState Current game state
     * @param context Optional context
     * @returns Effect result
     */
    changeSceneState(sceneId: string, stateName: string, value: any, gameState: GameState, context?: EffectContext): Promise<EffectResult>;
    
    /**
     * Parse an effect string into a structured format
     * @param effectString String representation of effect
     * @returns Parsed effect object
     */
    parseEffect(effectString: string): Promise<EffectExpression>;
    
    /**
     * Validate an effect expression for syntax errors
     * @param effect Effect to validate
     * @returns Whether the effect is valid
     */
    validateEffect(effect: EffectExpression): Promise<boolean>;
    
    /**
     * Get a human-readable description of an effect
     * @param effect Effect to describe
     * @returns Human-readable description
     */
    describeEffect(effect: EffectExpression): Promise<string>;
    
    /**
     * Preview what an effect would do without applying it
     * @param effect Effect to preview
     * @param gameState Current game state
     * @param context Optional context
     * @returns Preview of changes without modifying state
     */
    previewEffect(effect: EffectExpression, gameState: GameState, context?: EffectContext): Promise<EffectChange[]>;
    
    /**
     * Register a custom effect type
     * @param typeName Name of the effect type
     * @param handler Function to handle the effect
     */
    registerEffect(typeName: string, handler: EffectFunction): Promise<void>;
    
    /**
     * Unregister a custom effect type
     * @param typeName Name of the effect type to remove
     */
    unregisterEffect(typeName: string): Promise<void>;
    
    /**
     * Get all registered custom effect types
     * @returns Array of custom effect type names
     */
    getRegisteredEffects(): Promise<string[]>;
    
    /**
     * Schedule a delayed effect
     * @param effect Effect to schedule
     * @param delay Delay in moves
     * @param gameState Current game state
     * @param context Optional context
     * @returns Whether the effect was scheduled
     */
    scheduleDelayedEffect(effect: EffectExpression, delay: number, gameState: GameState, context?: EffectContext): Promise<boolean>;
    
    /**
     * Process all pending delayed effects
     * @param gameState Current game state
     * @returns Results of all processed effects
     */
    processDelayedEffects(gameState: GameState): Promise<EffectResult[]>;
    
    /**
     * Get all pending delayed effects
     * @returns Array of scheduled effects with their delays
     */
    getPendingEffects(): Promise<Array<{
        effect: EffectExpression;
        remainingDelay: number;
        context: EffectContext;
    }>>;
    
    /**
     * Cancel a scheduled effect
     * @param effectId ID of the effect to cancel
     * @returns Whether the effect was cancelled
     */
    cancelDelayedEffect(effectId: string): Promise<boolean>;
    
    /**
     * Create a transaction for multiple effects
     * @returns Transaction ID for rollback purposes
     */
    beginTransaction(): Promise<string>;
    
    /**
     * Commit a transaction, making all changes permanent
     * @param transactionId Transaction ID to commit
     * @returns Whether the commit was successful
     */
    commitTransaction(transactionId: string): Promise<boolean>;
    
    /**
     * Rollback a transaction, undoing all changes
     * @param transactionId Transaction ID to rollback
     * @returns Whether the rollback was successful
     */
    rollbackTransaction(transactionId: string): Promise<boolean>;
    
    /**
     * Create an effect context from current game state
     * @param gameState Current game state
     * @param source Source identifier
     * @returns Effect context object
     */
    createContext(gameState: GameState, source: string): Promise<EffectContext>;
    
    /**
     * Batch multiple effects for atomic application
     * @param effects Array of effects to batch
     * @param gameState Current game state
     * @param context Optional context
     * @returns Batched effect result (all or nothing)
     */
    batchEffects(effects: EffectExpression[], gameState: GameState, context?: EffectContext): Promise<EffectResult>;
}