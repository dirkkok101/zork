import { GameState } from '../../types/GameState';
import { ParsedCommand } from './ICommandParserService';

/**
 * Command execution result
 */
export interface CommandExecutionResult {
    /** Whether the command was executed successfully */
    success: boolean;
    
    /** Updated game state after command execution */
    gameState: GameState;
    
    /** Message to display to the player */
    message: string;
    
    /** Additional messages (for complex commands) */
    additionalMessages: string[];
    
    /** Whether the game state changed */
    stateChanged: boolean;
    
    /** Whether the command should be added to history */
    addToHistory: boolean;
    
    /** Whether to increment the move counter */
    incrementMoves: boolean;
    
    /** Any errors that occurred */
    errors: string[];
    
    /** Warnings to display */
    warnings: string[];
}

/**
 * Game event information
 */
export interface GameEvent {
    /** Event type identifier */
    type: string;
    
    /** Event data */
    data: any;
    
    /** Timestamp of the event */
    timestamp: number;
    
    /** Source of the event */
    source: string;
    
    /** Whether this event should be persisted */
    persist: boolean;
}

/**
 * Turn processing result
 */
export interface TurnResult {
    /** Main command execution result */
    commandResult: CommandExecutionResult;
    
    /** Events triggered during the turn */
    events: GameEvent[];
    
    /** Environmental changes */
    environmentalChanges: string[];
    
    /** Time-based updates */
    timeBasedUpdates: string[];
    
    /** Updated game state */
    gameState: GameState;
}

/**
 * Game orchestration context
 */
export interface OrchestrationContext {
    /** Current player ID */
    playerId: string;
    
    /** Session ID for tracking */
    sessionId: string;
    
    /** Turn number */
    turnNumber: number;
    
    /** Additional context data */
    metadata: Record<string, any>;
}

/**
 * Game Orchestration Service Interface
 * 
 * Central coordinator that orchestrates interactions between all other services.
 * Manages the game loop, command execution flow, and cross-service coordination.
 * 
 * Responsibilities:
 * - Command execution coordination
 * - Service interaction orchestration
 * - Game loop management
 * - Event processing and distribution
 * - Turn-based mechanics
 * 
 * Dependencies:
 * - All other game services for coordination
 * - Command parser for input processing
 * - Game state for state management
 * - Event system for notifications
 */
export interface IGameOrchestrationService {
    /**
     * Execute a complete turn from user input
     * @param input Raw user input
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Complete turn result
     */
    executeTurn(input: string, gameState: GameState, context: OrchestrationContext): Promise<TurnResult>;
    
    /**
     * Execute a parsed command
     * @param command Parsed command to execute
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Command execution result
     */
    executeCommand(command: ParsedCommand, gameState: GameState, context: OrchestrationContext): Promise<CommandExecutionResult>;
    
    /**
     * Process environmental updates (time, puzzles, etc.)
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Environmental changes and updated state
     */
    processEnvironmentalUpdates(gameState: GameState, context: OrchestrationContext): Promise<{
        changes: string[];
        gameState: GameState;
    }>;
    
    /**
     * Initialize a new game
     * @param startingSceneId Optional starting scene (uses default if not provided)
     * @param context Orchestration context
     * @returns Initial game state
     */
    initializeGame(startingSceneId?: string, context?: Partial<OrchestrationContext>): Promise<GameState>;
    
    /**
     * Save the current game state
     * @param gameState Current game state
     * @param slotName Save slot name
     * @param context Orchestration context
     * @returns Whether the save was successful
     */
    saveGame(gameState: GameState, slotName: string, context: OrchestrationContext): Promise<boolean>;
    
    /**
     * Load a saved game state
     * @param slotName Save slot name
     * @param context Orchestration context
     * @returns Loaded game state or null if failed
     */
    loadGame(slotName: string, context: OrchestrationContext): Promise<GameState | null>;
    
    /**
     * Handle special system commands (save, load, quit, etc.)
     * @param command System command to handle
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Command execution result
     */
    handleSystemCommand(command: string, gameState: GameState, context: OrchestrationContext): Promise<CommandExecutionResult>;
    
    /**
     * Get the current scene description and status
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Complete scene description
     */
    getSceneDescription(gameState: GameState, context: OrchestrationContext): Promise<string>;
    
    /**
     * Get available commands in the current context
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Array of available command suggestions
     */
    getAvailableCommands(gameState: GameState, context: OrchestrationContext): Promise<string[]>;
    
    /**
     * Validate a command before execution
     * @param command Parsed command to validate
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Validation result
     */
    validateCommand(command: ParsedCommand, gameState: GameState, context: OrchestrationContext): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    
    /**
     * Process game events
     * @param events Array of events to process
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Updated game state and event results
     */
    processEvents(events: GameEvent[], gameState: GameState, context: OrchestrationContext): Promise<{
        gameState: GameState;
        results: string[];
    }>;
    
    /**
     * Check for game over conditions
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Game over status and message
     */
    checkGameOver(gameState: GameState, context: OrchestrationContext): Promise<{
        gameOver: boolean;
        victory: boolean;
        message: string;
    }>;
    
    /**
     * Get player statistics
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Player statistics object
     */
    getPlayerStatistics(gameState: GameState, context: OrchestrationContext): Promise<{
        score: number;
        moves: number;
        scenesVisited: number;
        itemsCollected: number;
        puzzlesSolved: number;
        timeElapsed: number;
    }>;
    
    /**
     * Handle the "look" command comprehensively
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Complete look description
     */
    look(gameState: GameState, context: OrchestrationContext): Promise<string>;
    
    /**
     * Handle the "inventory" command
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Inventory description
     */
    showInventory(gameState: GameState, context: OrchestrationContext): Promise<string>;
    
    /**
     * Handle navigation commands
     * @param direction Direction to move
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Navigation result
     */
    navigate(direction: string, gameState: GameState, context: OrchestrationContext): Promise<CommandExecutionResult>;
    
    /**
     * Handle item interaction commands
     * @param verb Action verb
     * @param itemId Target item
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Interaction result
     */
    interactWithItem(verb: string, itemId: string, gameState: GameState, context: OrchestrationContext): Promise<CommandExecutionResult>;
    
    /**
     * Coordinate between multiple services for complex operations
     * @param operation Operation type
     * @param parameters Operation parameters
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Coordination result
     */
    coordinateServices(operation: string, parameters: any, gameState: GameState, context: OrchestrationContext): Promise<any>;
    
    /**
     * Register a service with the orchestrator
     * @param serviceName Name of the service
     * @param service Service instance
     * @returns Whether registration was successful
     */
    registerService(serviceName: string, service: any): Promise<boolean>;
    
    /**
     * Unregister a service from the orchestrator
     * @param serviceName Name of the service to remove
     * @returns Whether unregistration was successful
     */
    unregisterService(serviceName: string): Promise<boolean>;
    
    /**
     * Get a registered service by name
     * @param serviceName Name of the service
     * @returns Service instance or null if not found
     */
    getService(serviceName: string): Promise<any>;
    
    /**
     * Get all registered service names
     * @returns Array of service names
     */
    getRegisteredServices(): Promise<string[]>;
    
    /**
     * Handle error recovery during command execution
     * @param error Error that occurred
     * @param gameState Game state when error occurred
     * @param context Orchestration context
     * @returns Recovery result
     */
    handleError(error: Error, gameState: GameState, context: OrchestrationContext): Promise<{
        recovered: boolean;
        gameState: GameState;
        message: string;
    }>;
    
    /**
     * Create an orchestration context
     * @param playerId Player identifier
     * @param sessionId Session identifier
     * @param metadata Additional context data
     * @returns Orchestration context
     */
    createContext(playerId: string, sessionId: string, metadata?: Record<string, any>): Promise<OrchestrationContext>;
    
    /**
     * Update orchestration context
     * @param context Existing context
     * @param updates Context updates
     * @returns Updated context
     */
    updateContext(context: OrchestrationContext, updates: Partial<OrchestrationContext>): Promise<OrchestrationContext>;
    
    /**
     * Process the game loop for automated updates
     * @param gameState Current game state
     * @param context Orchestration context
     * @returns Updated game state with automated changes
     */
    processGameLoop(gameState: GameState, context: OrchestrationContext): Promise<GameState>;
    
    /**
     * Set up event listeners for service coordination
     * @returns Whether setup was successful
     */
    setupEventListeners(): Promise<boolean>;
    
    /**
     * Clean up resources and event listeners
     * @returns Whether cleanup was successful
     */
    cleanup(): Promise<boolean>;
    
    /**
     * Get service health status
     * @returns Health status of all registered services
     */
    getServiceHealth(): Promise<Record<string, {
        healthy: boolean;
        lastCheck: number;
        errors: string[];
    }>>;
    
    /**
     * Perform a health check on all services
     * @returns Overall system health status
     */
    performHealthCheck(): Promise<{
        healthy: boolean;
        serviceStatuses: Record<string, boolean>;
        errors: string[];
    }>;
}