/**
 * OpenRouter Client Interface
 * Defines the contract for AI API communication
 */

import { ChatMessage } from '../../types/AITypes';

/**
 * Interface for OpenRouter API client
 */
export interface IOpenRouterClient {
  /**
   * Call OpenRouter API with chat messages
   * @param messages - Array of chat messages for the API
   * @returns Promise with the API response content
   * @throws Error if API call fails or returns invalid response
   */
  callAPI(messages: ChatMessage[]): Promise<string>;

  /**
   * Check if API is configured correctly
   * @returns True if API key exists and is valid
   */
  isConfigured(): boolean;
}
