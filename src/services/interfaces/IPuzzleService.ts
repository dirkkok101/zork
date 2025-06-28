import { GameState } from '../../types/GameState';

/**
 * Puzzle state enumeration
 */
export enum PuzzleState {
    LOCKED = 'locked',
    UNLOCKED = 'unlocked',
    SOLVED = 'solved',
    FAILED = 'failed',
    INCOMPLETE = 'incomplete'
}

/**
 * Puzzle attempt result
 */
export interface PuzzleAttemptResult {
    /** Whether the attempt was successful */
    success: boolean;
    
    /** Current state of the puzzle after the attempt */
    state: PuzzleState;
    
    /** Message to display to the player */
    message: string;
    
    /** Whether the puzzle is now complete */
    complete: boolean;
    
    /** Updated game state */
    gameState: GameState;
    
    /** Hints available (if applicable) */
    hints: string[];
    
    /** Progress indication (0-1) */
    progress: number;
}

/**
 * Puzzle definition
 */
export interface Puzzle {
    /** Unique puzzle identifier */
    id: string;
    
    /** Human-readable name */
    name: string;
    
    /** Description of the puzzle */
    description: string;
    
    /** Current state */
    state: PuzzleState;
    
    /** Required items to solve */
    requiredItems: string[];
    
    /** Required flags to be set */
    requiredFlags: string[];
    
    /** Solution value or pattern */
    solution: any;
    
    /** Number of attempts allowed (-1 for unlimited) */
    maxAttempts: number;
    
    /** Current attempt count */
    attempts: number;
    
    /** Hints available for this puzzle */
    hints: PuzzleHint[];
    
    /** Rewards for solving */
    rewards: PuzzleReward[];
    
    /** Optional time limit (in moves) */
    timeLimit?: number;
    
    /** Moves remaining (if time limited) */
    movesRemaining?: number;
}

/**
 * Puzzle hint information
 */
export interface PuzzleHint {
    /** Unique hint identifier */
    id: string;
    
    /** Hint text */
    text: string;
    
    /** Whether this hint has been revealed */
    revealed: boolean;
    
    /** Condition required to reveal hint */
    revealCondition?: string;
    
    /** Cost to reveal hint (in points, items, etc.) */
    cost?: number;
}

/**
 * Puzzle reward information
 */
export interface PuzzleReward {
    /** Type of reward */
    type: 'score' | 'item' | 'flag' | 'access' | 'knowledge';
    
    /** Value or identifier of the reward */
    value: any;
    
    /** Whether this reward has been claimed */
    claimed: boolean;
    
    /** Optional description */
    description?: string;
}

/**
 * Puzzle Service Interface
 * 
 * Manages complex puzzles and logic systems throughout Zork.
 * Handles multi-step puzzles, combination locks, riddles, and mechanical systems.
 * 
 * Responsibilities:
 * - Puzzle state management
 * - Solution validation
 * - Hint system management
 * - Progress tracking
 * - Reward distribution
 * 
 * Dependencies:
 * - Game state for puzzle persistence
 * - Condition service for prerequisite checking
 * - Effect service for reward application
 * - Flag service for puzzle state flags
 */
export interface IPuzzleService {
    /**
     * Get information about a specific puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Puzzle information or null if not found
     */
    getPuzzle(puzzleId: string, gameState: GameState): Promise<Puzzle | null>;
    
    /**
     * Attempt to solve a puzzle with a given input
     * @param puzzleId Puzzle identifier
     * @param attempt Solution attempt (string, number, array, etc.)
     * @param gameState Current game state
     * @returns Result of the attempt
     */
    attemptSolution(puzzleId: string, attempt: any, gameState: GameState): Promise<PuzzleAttemptResult>;
    
    /**
     * Check if a puzzle is available to the player
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Whether the puzzle can be accessed
     */
    isPuzzleAvailable(puzzleId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get all puzzles available in the current scene
     * @param sceneId Scene identifier
     * @param gameState Current game state
     * @returns Array of available puzzles
     */
    getScenePuzzles(sceneId: string, gameState: GameState): Promise<Puzzle[]>;
    
    /**
     * Reveal a hint for a puzzle
     * @param puzzleId Puzzle identifier
     * @param hintId Hint identifier
     * @param gameState Current game state
     * @returns Updated puzzle with revealed hint
     */
    revealHint(puzzleId: string, hintId: string, gameState: GameState): Promise<PuzzleAttemptResult>;
    
    /**
     * Get available hints for a puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Array of hints that can be revealed
     */
    getAvailableHints(puzzleId: string, gameState: GameState): Promise<PuzzleHint[]>;
    
    /**
     * Get revealed hints for a puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Array of already revealed hints
     */
    getRevealedHints(puzzleId: string, gameState: GameState): Promise<PuzzleHint[]>;
    
    /**
     * Reset a puzzle to its initial state
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Updated game state
     */
    resetPuzzle(puzzleId: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Check if a puzzle has been solved
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Whether the puzzle is solved
     */
    isPuzzleSolved(puzzleId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get the current progress of a puzzle (0-1)
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Progress as a decimal
     */
    getPuzzleProgress(puzzleId: string, gameState: GameState): Promise<number>;
    
    /**
     * Initialize a puzzle (set up initial state)
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Updated game state
     */
    initializePuzzle(puzzleId: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Get all solved puzzles
     * @param gameState Current game state
     * @returns Array of solved puzzle IDs
     */
    getSolvedPuzzles(gameState: GameState): Promise<string[]>;
    
    /**
     * Get all available puzzles (regardless of scene)
     * @param gameState Current game state
     * @returns Array of all accessible puzzles
     */
    getAllAvailablePuzzles(gameState: GameState): Promise<Puzzle[]>;
    
    /**
     * Check prerequisites for attempting a puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Whether prerequisites are met
     */
    checkPrerequisites(puzzleId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Get missing prerequisites for a puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Array of missing requirements
     */
    getMissingPrerequisites(puzzleId: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Handle time-based puzzle mechanics
     * @param gameState Current game state
     * @returns Updated game state with time progression
     */
    updateTimedPuzzles(gameState: GameState): Promise<GameState>;
    
    /**
     * Get remaining time for a timed puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Moves remaining (-1 if not timed)
     */
    getRemainingTime(puzzleId: string, gameState: GameState): Promise<number>;
    
    /**
     * Grant rewards for solving a puzzle
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Updated game state with rewards applied
     */
    grantRewards(puzzleId: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Check if puzzle rewards have been claimed
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Whether rewards have been claimed
     */
    areRewardsClaimed(puzzleId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Validate a puzzle solution format
     * @param puzzleId Puzzle identifier
     * @param attempt Solution attempt
     * @returns Whether the format is valid
     */
    validateSolutionFormat(puzzleId: string, attempt: any): Promise<boolean>;
    
    /**
     * Get a description of the expected solution format
     * @param puzzleId Puzzle identifier
     * @returns Description of what type of input is expected
     */
    getSolutionFormat(puzzleId: string): Promise<string>;
    
    /**
     * Register a custom puzzle type
     * @param typeName Name of the puzzle type
     * @param handler Functions to handle the puzzle
     */
    registerPuzzleType(typeName: string, handler: {
        validate: (attempt: any, solution: any) => boolean;
        getProgress: (attempt: any, solution: any) => number;
        getHint?: (progress: number) => string;
    }): Promise<void>;
    
    /**
     * Unregister a custom puzzle type
     * @param typeName Name of the puzzle type to remove
     */
    unregisterPuzzleType(typeName: string): Promise<void>;
    
    /**
     * Get all registered puzzle types
     * @returns Array of puzzle type names
     */
    getRegisteredPuzzleTypes(): Promise<string[]>;
    
    /**
     * Create a new puzzle instance
     * @param puzzleData Puzzle configuration
     * @param gameState Current game state
     * @returns Updated game state with new puzzle
     */
    createPuzzle(puzzleData: Partial<Puzzle>, gameState: GameState): Promise<GameState>;
    
    /**
     * Remove a puzzle from the game
     * @param puzzleId Puzzle identifier
     * @param gameState Current game state
     * @returns Updated game state without the puzzle
     */
    removePuzzle(puzzleId: string, gameState: GameState): Promise<GameState>;
    
    /**
     * Get puzzle statistics (attempts, success rate, etc.)
     * @param puzzleId Optional specific puzzle ID
     * @returns Statistics object
     */
    getPuzzleStatistics(puzzleId?: string): Promise<{
        totalAttempts: number;
        successfulSolutions: number;
        successRate: number;
        averageAttempts: number;
        hintsUsed: number;
    }>;
}