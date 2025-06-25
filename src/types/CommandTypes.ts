import { GameState } from './GameState';

/**
 * Command result interface
 * Represents the result of executing a command
 */
export interface CommandResult {
    /** Success status of the command */
    success: boolean;

    /** Message to display to the player */
    message: string;

    /** Whether the command counts as a move */
    countsAsMove: boolean;

    /** Score change from the command (if any) */
    scoreChange?: number;

    /** State updates to apply (if any) */
    stateUpdates?: Partial<GameState>;
}

/**
 * Command interface
 * Represents a command that can be executed by the player
 */
export interface Command {
    /** Primary name of the command */
    name: string;

    /** Alternative names for the command */
    aliases: string[];

    /** Usage description */
    usage: string;

    /** Help text for the command */
    helpText: string;

    /**
     * Check if the command matches the input
     * @param input User input text
     * @returns Whether the command matches
     */
    matches(input: string): boolean;

    /**
     * Check if the command can be executed in the current context
     * @returns Whether the command can be executed
     */
    canExecute(): boolean;

    /**
     * Execute the command
     * @param input User input text
     * @returns Command execution result
     */
    execute(input: string): CommandResult;

    /**
     * Get suggestions for command completion
     * @param input Partial user input
     * @returns Array of suggestion strings
     */
    getSuggestions(input: string): string[];
}
