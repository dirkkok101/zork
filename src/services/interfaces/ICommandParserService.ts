import { GameState } from '../../types/GameState';

/**
 * Parsed command structure
 */
export interface ParsedCommand {
    /** Primary verb (canonical form) */
    verb: string;
    
    /** Direct object (if any) */
    directObject?: string;
    
    /** Indirect object (if any) */
    indirectObject?: string;
    
    /** Preposition connecting objects */
    preposition?: string;
    
    /** Original raw input */
    rawInput: string;
    
    /** Normalized input after processing */
    normalizedInput: string;
    
    /** Confidence level of the parse (0-1) */
    confidence: number;
    
    /** Alternative interpretations */
    alternatives: ParsedCommand[];
}

/**
 * Command suggestion
 */
export interface CommandSuggestion {
    /** Suggested command text */
    command: string;
    
    /** Human-readable description */
    description: string;
    
    /** Relevance score (0-1) */
    relevance: number;
    
    /** Category of the suggestion */
    category: 'movement' | 'object' | 'system' | 'interaction' | 'magic';
    
    /** Whether this suggestion is available in current context */
    available: boolean;
}

/**
 * Parse error information
 */
export interface ParseError {
    /** Type of error */
    type: 'unknown_verb' | 'unknown_object' | 'ambiguous' | 'syntax_error' | 'context_error';
    
    /** Human-readable error message */
    message: string;
    
    /** Suggested corrections */
    suggestions: string[];
    
    /** Position in input where error occurred */
    position?: number;
}

/**
 * Command validation result
 */
export interface CommandValidation {
    /** Whether the command is valid in current context */
    valid: boolean;
    
    /** Validation errors (if any) */
    errors: ParseError[];
    
    /** Warnings that don't prevent execution */
    warnings: string[];
    
    /** Suggested improvements */
    improvements: string[];
}

/**
 * Command Parser Service Interface
 * 
 * Handles all command parsing, validation, and suggestion functionality.
 * Critical for supporting the 150+ Zork commands identified in the analysis.
 * 
 * Responsibilities:
 * - Natural language command parsing
 * - Verb and object recognition
 * - Synonym and alias resolution
 * - Context-aware command suggestions
 * - Syntax validation and error handling
 * 
 * Dependencies:
 * - Game state for context awareness
 * - Item service for object recognition
 * - Scene service for location context
 * - Interaction data for command definitions
 */
export interface ICommandParserService {
    /**
     * Parse a raw command input into structured format
     * @param input Raw user input
     * @param gameState Current game state for context
     * @returns Parsed command structure
     */
    parseCommand(input: string, gameState: GameState): Promise<ParsedCommand>;
    
    /**
     * Validate a parsed command in the current context
     * @param command Parsed command to validate
     * @param gameState Current game state
     * @returns Validation result with errors and suggestions
     */
    validateCommand(command: ParsedCommand, gameState: GameState): Promise<CommandValidation>;
    
    /**
     * Get command suggestions based on current context
     * @param partialInput Partial user input (can be empty)
     * @param gameState Current game state
     * @param maxSuggestions Maximum number of suggestions to return
     * @returns Array of relevant command suggestions
     */
    getCommandSuggestions(partialInput: string, gameState: GameState, maxSuggestions?: number): Promise<CommandSuggestion[]>;
    
    /**
     * Resolve a verb to its canonical form
     * @param verb Input verb (may be alias or synonym)
     * @returns Canonical verb name or null if unknown
     */
    resolveVerb(verb: string): Promise<string | null>;
    
    /**
     * Resolve an object reference to its canonical ID
     * @param objectRef Object reference (name, alias, or partial name)
     * @param gameState Current game state for context
     * @returns Canonical object ID or null if not found
     */
    resolveObject(objectRef: string, gameState: GameState): Promise<string | null>;
    
    /**
     * Get all valid verbs that can be used with a specific object
     * @param objectId Object ID to check
     * @param gameState Current game state
     * @returns Array of applicable verb names
     */
    getValidVerbs(objectId: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Get all objects that can be used with a specific verb
     * @param verb Verb name
     * @param gameState Current game state
     * @returns Array of applicable object IDs
     */
    getValidObjects(verb: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Check if a verb requires a direct object
     * @param verb Verb name
     * @returns Whether the verb requires an object
     */
    verbRequiresObject(verb: string): Promise<boolean>;
    
    /**
     * Check if a verb can accept an indirect object
     * @param verb Verb name
     * @returns Whether the verb can use indirect objects
     */
    verbAcceptsIndirectObject(verb: string): Promise<boolean>;
    
    /**
     * Get valid prepositions for a verb
     * @param verb Verb name
     * @returns Array of valid prepositions
     */
    getValidPrepositions(verb: string): Promise<string[]>;
    
    /**
     * Expand abbreviations and shortcuts
     * @param input Input that may contain abbreviations
     * @returns Expanded input
     */
    expandAbbreviations(input: string): Promise<string>;
    
    /**
     * Get all known aliases for a verb
     * @param verb Canonical verb name
     * @returns Array of aliases and synonyms
     */
    getVerbAliases(verb: string): Promise<string[]>;
    
    /**
     * Get all known aliases for an object
     * @param objectId Object ID
     * @returns Array of names and aliases
     */
    getObjectAliases(objectId: string): Promise<string[]>;
    
    /**
     * Handle ambiguous object references
     * @param objectRef Ambiguous object reference
     * @param gameState Current game state
     * @returns Array of possible matches with context
     */
    resolveAmbiguity(objectRef: string, gameState: GameState): Promise<Array<{
        objectId: string;
        name: string;
        context: string;
        probability: number;
    }>>;
    
    /**
     * Check if input matches a special command pattern
     * @param input Raw input to check
     * @returns Special command type or null
     */
    checkSpecialCommands(input: string): Promise<string | null>;
    
    /**
     * Get help text for a specific verb
     * @param verb Verb name
     * @returns Help text explaining the verb usage
     */
    getVerbHelp(verb: string): Promise<string | null>;
    
    /**
     * Get example commands for demonstration
     * @param category Optional category to filter by
     * @returns Array of example command strings
     */
    getExampleCommands(category?: string): Promise<string[]>;
    
    /**
     * Normalize input text (trim, lowercase, etc.)
     * @param input Raw input text
     * @returns Normalized input
     */
    normalizeInput(input: string): Promise<string>;
    
    /**
     * Check if input is likely a typo and suggest corrections
     * @param input Input text to check
     * @param gameState Current game state for context
     * @returns Array of suggested corrections
     */
    suggestTypoCorrections(input: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Get commands available in the current scene
     * @param gameState Current game state
     * @returns Array of contextually relevant commands
     */
    getContextualCommands(gameState: GameState): Promise<CommandSuggestion[]>;
    
    /**
     * Parse multiple commands separated by delimiters
     * @param input Input containing multiple commands
     * @param gameState Current game state
     * @returns Array of parsed commands
     */
    parseMultipleCommands(input: string, gameState: GameState): Promise<ParsedCommand[]>;
    
    /**
     * Validate command syntax without parsing
     * @param input Raw input to validate
     * @returns Whether the syntax is valid
     */
    isValidSyntax(input: string): Promise<boolean>;
    
    /**
     * Get the last parsed command for "again" functionality
     * @returns Last successfully parsed command or null
     */
    getLastCommand(): Promise<ParsedCommand | null>;
    
    /**
     * Store a command for "again" functionality
     * @param command Command to store
     */
    setLastCommand(command: ParsedCommand): Promise<void>;
    
    /**
     * Reset parser state (useful for testing)
     */
    reset(): Promise<void>;
}