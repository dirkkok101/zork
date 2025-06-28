import { GameState } from '../../types/GameState';

/**
 * Flag change event information
 */
export interface FlagChangeEvent {
    /** Name of the flag that changed */
    flagName: string;
    
    /** Previous value of the flag */
    oldValue: boolean;
    
    /** New value of the flag */
    newValue: boolean;
    
    /** Timestamp of the change */
    timestamp: number;
    
    /** Optional context about why the flag changed */
    context?: string;
}

/**
 * Variable change event information
 */
export interface VariableChangeEvent {
    /** Name of the variable that changed */
    variableName: string;
    
    /** Previous value of the variable */
    oldValue: any;
    
    /** New value of the variable */
    newValue: any;
    
    /** Timestamp of the change */
    timestamp: number;
    
    /** Optional context about why the variable changed */
    context?: string;
}

/**
 * Flag query result
 */
export interface FlagQuery {
    /** Name of the flag */
    name: string;
    
    /** Current value */
    value: boolean;
    
    /** When the flag was last modified */
    lastModified?: number;
    
    /** How many times this flag has been changed */
    changeCount?: number;
}

/**
 * Game Flag and Variable Service Interface
 * 
 * Manages all game flags and variables following Single Responsibility Principle.
 * Extracted from the monolithic GameStateService to achieve proper SOLID compliance.
 * 
 * Responsibilities:
 * - Flag state management and persistence
 * - Variable state management and persistence
 * - Change tracking and event notifications
 * - Bulk flag operations
 * 
 * Dependencies:
 * - Game state structure for storage
 * - Event system for change notifications (optional)
 */
export interface IGameFlagService {
    /**
     * Set a game flag to a specific value
     * @param flagName Name of the flag
     * @param value Value to set
     * @param gameState Current game state
     * @param context Optional context for the change
     * @returns Updated game state
     */
    setFlag(flagName: string, value: boolean, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Get the value of a game flag
     * @param flagName Name of the flag
     * @param gameState Current game state
     * @returns Flag value (false if not set)
     */
    getFlag(flagName: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Toggle a game flag (true becomes false, false becomes true)
     * @param flagName Name of the flag
     * @param gameState Current game state
     * @param context Optional context for the change
     * @returns Updated game state with new flag value
     */
    toggleFlag(flagName: string, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Set multiple flags at once
     * @param flags Object mapping flag names to values
     * @param gameState Current game state
     * @param context Optional context for the changes
     * @returns Updated game state
     */
    setFlags(flags: Record<string, boolean>, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Get multiple flag values at once
     * @param flagNames Array of flag names to retrieve
     * @param gameState Current game state
     * @returns Object mapping flag names to values
     */
    getFlags(flagNames: string[], gameState: GameState): Promise<Record<string, boolean>>;
    
    /**
     * Get all flags and their values
     * @param gameState Current game state
     * @returns Object mapping all flag names to values
     */
    getAllFlags(gameState: GameState): Promise<Record<string, boolean>>;
    
    /**
     * Clear a flag (remove it from the game state)
     * @param flagName Name of the flag to clear
     * @param gameState Current game state
     * @returns Updated game state
     */
    clearFlag(flagName: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Clear multiple flags at once
     * @param flagNames Array of flag names to clear
     * @param gameState Current game state
     * @returns Updated game state
     */
    clearFlags(flagNames: string[], gameState: GameState): Promise<GameState>;
    
    /**
     * Check if a flag exists in the game state
     * @param flagName Name of the flag
     * @param gameState Current game state
     * @returns Whether the flag exists
     */
    hasFlag(flagName: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get detailed information about a flag
     * @param flagName Name of the flag
     * @param gameState Current game state
     * @returns Flag query result with metadata
     */
    getFlagInfo(flagName: string, gameState: GameState): Promise<FlagQuery | null>;
    
    /**
     * Set a game variable to a specific value
     * @param variableName Name of the variable
     * @param value Value to set
     * @param gameState Current game state
     * @param context Optional context for the change
     * @returns Updated game state
     */
    setVariable(variableName: string, value: any, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Get the value of a game variable
     * @param variableName Name of the variable
     * @param gameState Current game state
     * @returns Variable value (undefined if not set)
     */
    getVariable(variableName: string, gameState: GameState): Promise<any>;
    
    /**
     * Increment a numeric variable by a specified amount
     * @param variableName Name of the variable
     * @param amount Amount to increment (default: 1)
     * @param gameState Current game state
     * @param context Optional context for the change
     * @returns Updated game state with new variable value
     */
    incrementVariable(variableName: string, amount: number, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Set multiple variables at once
     * @param variables Object mapping variable names to values
     * @param gameState Current game state
     * @param context Optional context for the changes
     * @returns Updated game state
     */
    setVariables(variables: Record<string, any>, gameState: GameState, context?: string): Promise<GameState>;
    
    /**
     * Get multiple variable values at once
     * @param variableNames Array of variable names to retrieve
     * @param gameState Current game state
     * @returns Object mapping variable names to values
     */
    getVariables(variableNames: string[], gameState: GameState): Promise<Record<string, any>>;
    
    /**
     * Get all variables and their values
     * @param gameState Current game state
     * @returns Object mapping all variable names to values
     */
    getAllVariables(gameState: GameState): Promise<Record<string, any>>;
    
    /**
     * Clear a variable (remove it from the game state)
     * @param variableName Name of the variable to clear
     * @param gameState Current game state
     * @returns Updated game state
     */
    clearVariable(variableName: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Clear multiple variables at once
     * @param variableNames Array of variable names to clear
     * @param gameState Current game state
     * @returns Updated game state
     */
    clearVariables(variableNames: string[], gameState: GameState): Promise<GameState>;
    
    /**
     * Check if a variable exists in the game state
     * @param variableName Name of the variable
     * @param gameState Current game state
     * @returns Whether the variable exists
     */
    hasVariable(variableName: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Subscribe to flag changes
     * @param callback Function to call when flags change
     * @returns Unsubscribe function
     */
    onFlagChanged(callback: (event: FlagChangeEvent) => void): () => void;
    
    /**
     * Subscribe to variable changes
     * @param callback Function to call when variables change
     * @returns Unsubscribe function
     */
    onVariableChanged(callback: (event: VariableChangeEvent) => void): () => void;
    
    /**
     * Get the history of flag changes (if tracking is enabled)
     * @param flagName Optional specific flag name to filter
     * @returns Array of flag change events
     */
    getFlagHistory(flagName?: string): Promise<FlagChangeEvent[]>;
    
    /**
     * Get the history of variable changes (if tracking is enabled)
     * @param variableName Optional specific variable name to filter
     * @returns Array of variable change events
     */
    getVariableHistory(variableName?: string): Promise<VariableChangeEvent[]>;
    
    /**
     * Clear all change history
     * @returns Whether the operation was successful
     */
    clearHistory(): Promise<boolean>;
    
    /**
     * Enable or disable change tracking
     * @param enabled Whether to track changes
     * @returns Whether the operation was successful
     */
    setChangeTracking(enabled: boolean): Promise<boolean>;
    
    /**
     * Reset all flags to their default values
     * @param gameState Current game state
     * @returns Updated game state with reset flags
     */
    resetAllFlags(gameState: GameState): Promise<GameState>;
    
    /**
     * Reset all variables to their default values
     * @param gameState Current game state
     * @returns Updated game state with reset variables
     */
    resetAllVariables(gameState: GameState): Promise<GameState>;
}