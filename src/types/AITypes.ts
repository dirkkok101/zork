/**
 * AI Enhancement Type Definitions
 * Types specific to the AI-enhanced game mode
 */

import { GameStyle } from './GameState';

/**
 * Chat message for AI API communication
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';

  /** Content of the message */
  content: string;
}

/**
 * Expanded scene data from AI
 */
export interface ExpandedScene {
  /** Enhanced display name for the scene */
  displayName: string;

  /** Enhanced description of the scene */
  description: string;

  /** Enhanced descriptions for each exit */
  exitDescriptions: Record<string, string>;
}

/**
 * Expanded item data from AI
 */
export interface ExpandedItem {
  /** Enhanced display name for the item */
  displayName: string;

  /** Enhanced brief description */
  description: string;

  /** Enhanced detailed examination text */
  examineText: string;

  /** Original readable text (preserved exactly) or null if not readable */
  readText?: string | null;
}

/**
 * Expanded monster data from AI
 */
export interface ExpandedMonster {
  /** Enhanced display name for the monster */
  displayName: string;

  /** Enhanced description of the monster */
  description: string;
}

/**
 * Complete scene context with all expanded entities
 */
export interface SceneContext {
  /** Expanded scene data */
  scene: ExpandedScene;

  /** Map of item ID to expanded item data */
  items: Record<string, ExpandedItem>;

  /** Map of monster ID to expanded monster data */
  monsters: Record<string, ExpandedMonster>;
}

/**
 * Entity type for expansion tracking
 */
export type EntityType = 'scene' | 'item' | 'monster';

/**
 * OpenRouter API request format
 */
export interface OpenRouterRequest {
  /** Model identifier */
  model: string;

  /** Array of chat messages */
  messages: ChatMessage[];

  /** Temperature for response generation (0-1) */
  temperature?: number;

  /** Maximum tokens in response */
  max_tokens?: number;

  /** Top-p sampling parameter */
  top_p?: number;

  /** Frequency penalty */
  frequency_penalty?: number;

  /** Presence penalty */
  presence_penalty?: number;
}

/**
 * OpenRouter API response format
 */
export interface OpenRouterResponse {
  /** Response ID */
  id: string;

  /** Model used */
  model: string;

  /** Response choices */
  choices: Array<{
    /** Response message */
    message: {
      /** Message role */
      role: 'assistant';

      /** Message content (JSON string to parse) */
      content: string;
    };

    /** Reason for completion */
    finish_reason: string;
  }>;

  /** Token usage information */
  usage: {
    /** Tokens in prompt */
    prompt_tokens: number;

    /** Tokens in completion */
    completion_tokens: number;

    /** Total tokens used */
    total_tokens: number;
  };
}

/**
 * AI Enhancement configuration
 */
export interface AIConfig {
  /** OpenRouter API key */
  apiKey: string;

  /** Model identifier */
  model: string;

  /** API base URL */
  baseURL: string;

  /** Request timeout in milliseconds */
  timeout: number;

  /** Maximum tokens in response */
  maxTokens: number;

  /** Temperature for generation */
  temperature: number;

  /** Maximum retry attempts */
  maxRetries: number;
}

/**
 * Save file format for enhanced mode
 */
export interface EnhancedSaveData {
  /** Save format version */
  version: string;

  /** Game mode */
  mode: 'enhanced' | 'classic';

  /** Player's chosen name */
  playerName: string;

  /** Game style */
  gameStyle: GameStyle;

  /** Timestamp of save */
  timestamp: number;

  /** Base game state */
  gameState: any; // Will be the actual GameState

  /** Expanded scenes */
  expandedScenes: Array<{
    id: string;
    name: string;
    description: string;
    exits: Record<string, { to: string; description?: string }>;
  }>;

  /** Expanded items */
  expandedItems: Array<{
    id: string;
    name: string;
    description: string;
    examineText: string;
    readText?: string;
  }>;

  /** Expanded monsters */
  expandedMonsters: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}
