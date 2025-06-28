import { GameState } from '../../types/GameState';

/**
 * Condition evaluation result
 */
export interface ConditionResult {
    /** Whether the condition is satisfied */
    satisfied: boolean;
    
    /** Human-readable explanation of the result */
    explanation: string;
    
    /** Array of specific requirements that failed */
    failedRequirements: string[];
    
    /** Array of specific requirements that passed */
    passedRequirements: string[];
    
    /** Confidence level of the evaluation (0-1) */
    confidence: number;
}

/**
 * Condition expression types supported by the evaluator
 */
export type ConditionExpression = 
    | string                    // Simple flag name: "door_open"
    | string[]                  // Array of flags (all must be true): ["has_key", "door_unlocked"]
    | ConditionObject           // Complex condition object
    | ConditionFunction;        // Function-based condition

/**
 * Complex condition object structure
 */
export interface ConditionObject {
    /** Logical operator */
    operator: 'and' | 'or' | 'not';
    
    /** Operands (can be nested conditions) */
    operands: ConditionExpression[];
    
    /** Optional description for debugging */
    description?: string;
}

/**
 * Function-based condition
 */
export type ConditionFunction = (gameState: GameState) => boolean | Promise<boolean>;

/**
 * Condition context for evaluation
 */
export interface ConditionContext {
    /** Current scene ID */
    sceneId: string;
    
    /** Player's current inventory */
    inventory: string[];
    
    /** Additional context variables */
    variables: Record<string, any>;
    
    /** Source of the condition (for debugging) */
    source?: string;
}

/**
 * Condition Evaluation Service Interface
 * 
 * Provides centralized condition evaluation for all game systems.
 * Essential for handling complex conditional logic throughout Zork.
 * 
 * Responsibilities:
 * - Parse and evaluate condition expressions
 * - Support complex logical operations (AND, OR, NOT)
 * - Provide detailed evaluation results
 * - Handle flag, variable, and function-based conditions
 * 
 * Dependencies:
 * - Game state for flag and variable access
 * - Flag service for flag evaluation
 * - Item service for inventory checks
 * - Scene service for location context
 */
export interface IConditionEvaluationService {
    /**
     * Evaluate a condition expression
     * @param condition Condition to evaluate
     * @param gameState Current game state
     * @param context Optional additional context
     * @returns Detailed evaluation result
     */
    evaluate(condition: ConditionExpression, gameState: GameState, context?: ConditionContext): Promise<ConditionResult>;
    
    /**
     * Evaluate multiple conditions with logical operations
     * @param conditions Array of conditions to evaluate
     * @param operator Logical operator to apply ('and' | 'or')
     * @param gameState Current game state
     * @param context Optional additional context
     * @returns Combined evaluation result
     */
    evaluateMultiple(
        conditions: ConditionExpression[], 
        operator: 'and' | 'or', 
        gameState: GameState, 
        context?: ConditionContext
    ): Promise<ConditionResult>;
    
    /**
     * Check if a simple flag condition is satisfied
     * @param flagName Flag name to check
     * @param gameState Current game state
     * @returns Whether the flag is set
     */
    checkFlag(flagName: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if a variable condition is satisfied
     * @param variableName Variable name
     * @param expectedValue Expected value (or comparison function)
     * @param gameState Current game state
     * @returns Whether the condition is satisfied
     */
    checkVariable(variableName: string, expectedValue: any, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if the player has a specific item
     * @param itemId Item ID to check for
     * @param gameState Current game state
     * @returns Whether the player has the item
     */
    hasItem(itemId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if an item is in a specific location
     * @param itemId Item ID to check
     * @param locationId Location ID (scene or container)
     * @param gameState Current game state
     * @returns Whether the item is in the location
     */
    itemInLocation(itemId: string, locationId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if the player is in a specific scene
     * @param sceneId Scene ID to check
     * @param gameState Current game state
     * @returns Whether the player is in the scene
     */
    inScene(sceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if a scene has been visited
     * @param sceneId Scene ID to check
     * @param gameState Current game state
     * @returns Whether the scene has been visited
     */
    sceneVisited(sceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if the player's score meets a threshold
     * @param threshold Minimum score required
     * @param gameState Current game state
     * @returns Whether the score requirement is met
     */
    scoreAtLeast(threshold: number, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if a certain number of moves have passed
     * @param threshold Minimum move count
     * @param gameState Current game state
     * @returns Whether the move requirement is met
     */
    movesAtLeast(threshold: number, gameState: GameState): Promise<boolean>;
    
    /**
     * Parse a condition string into a structured format
     * @param conditionString String representation of condition
     * @returns Parsed condition object
     */
    parseCondition(conditionString: string): Promise<ConditionExpression>;
    
    /**
     * Validate a condition expression for syntax errors
     * @param condition Condition to validate
     * @returns Whether the condition is valid
     */
    validateCondition(condition: ConditionExpression): Promise<boolean>;
    
    /**
     * Get a human-readable description of a condition
     * @param condition Condition to describe
     * @returns Human-readable description
     */
    describeCondition(condition: ConditionExpression): Promise<string>;
    
    /**
     * Find all flags referenced in a condition
     * @param condition Condition to analyze
     * @returns Array of flag names used
     */
    getReferencedFlags(condition: ConditionExpression): Promise<string[]>;
    
    /**
     * Find all variables referenced in a condition
     * @param condition Condition to analyze
     * @returns Array of variable names used
     */
    getReferencedVariables(condition: ConditionExpression): Promise<string[]>;
    
    /**
     * Check if lighting conditions allow an action
     * @param sceneId Scene to check
     * @param actionType Type of action ('see', 'read', 'examine')
     * @param gameState Current game state
     * @returns Whether lighting is adequate
     */
    checkLighting(sceneId: string, actionType: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Check if an item is in a usable state
     * @param itemId Item to check
     * @param actionType Type of action being attempted
     * @param gameState Current game state
     * @returns Whether the item can be used for the action
     */
    checkItemState(itemId: string, actionType: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Evaluate a complex conditional chain
     * @param conditions Array of conditions with operators
     * @param gameState Current game state
     * @param context Optional context
     * @returns Final evaluation result
     */
    evaluateChain(
        conditions: Array<{
            condition: ConditionExpression;
            operator?: 'and' | 'or' | 'not';
        }>, 
        gameState: GameState, 
        context?: ConditionContext
    ): Promise<ConditionResult>;
    
    /**
     * Register a custom condition function
     * @param name Name of the condition
     * @param func Function to register
     */
    registerCondition(name: string, func: ConditionFunction): Promise<void>;
    
    /**
     * Unregister a custom condition function
     * @param name Name of the condition to remove
     */
    unregisterCondition(name: string): Promise<void>;
    
    /**
     * Get all registered custom conditions
     * @returns Array of custom condition names
     */
    getRegisteredConditions(): Promise<string[]>;
    
    /**
     * Create a condition context from current game state
     * @param gameState Current game state
     * @param source Optional source identifier
     * @returns Condition context object
     */
    createContext(gameState: GameState, source?: string): Promise<ConditionContext>;
    
    /**
     * Optimize a condition expression for better performance
     * @param condition Condition to optimize
     * @returns Optimized condition expression
     */
    optimizeCondition(condition: ConditionExpression): Promise<ConditionExpression>;
    
    /**
     * Debug a condition evaluation step by step
     * @param condition Condition to debug
     * @param gameState Current game state
     * @param context Optional context
     * @returns Detailed debug information
     */
    debugEvaluation(
        condition: ConditionExpression, 
        gameState: GameState, 
        context?: ConditionContext
    ): Promise<{
        steps: Array<{
            step: string;
            result: boolean;
            explanation: string;
        }>;
        finalResult: boolean;
    }>;
}