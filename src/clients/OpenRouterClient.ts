/**
 * OpenRouter API Client
 * Handles all communication with OpenRouter API for AI content generation
 */

import { IOpenRouterClient } from './interfaces/IOpenRouterClient';
import { ChatMessage, OpenRouterRequest, OpenRouterResponse } from '../types/AITypes';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  model: 'x-ai/grok-2-1212',
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 10000,
  maxTokens: 1000,
  temperature: 0.7,
  maxRetries: 2
};

/**
 * OpenRouter API client implementation
 */
export class OpenRouterClient implements IOpenRouterClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private timeout: number;
  private maxTokens: number;
  private temperature: number;
  private maxRetries: number;

  constructor() {
    // Load configuration from environment variables with fallbacks
    // Check VITE_ prefix first (for Vite/browser), then fall back to unprefixed (for Node.js)
    this.apiKey = this.getEnvVar('VITE_OPENROUTER_API_KEY', this.getEnvVar('OPENROUTER_API_KEY', ''));
    this.model = this.getEnvVar('VITE_OPENROUTER_MODEL', this.getEnvVar('OPENROUTER_MODEL', DEFAULT_CONFIG.model));
    this.baseURL = this.getEnvVar('VITE_OPENROUTER_BASE_URL', this.getEnvVar('OPENROUTER_BASE_URL', DEFAULT_CONFIG.baseURL));
    this.timeout = parseInt(this.getEnvVar('VITE_OPENROUTER_TIMEOUT', this.getEnvVar('OPENROUTER_TIMEOUT', DEFAULT_CONFIG.timeout.toString())), 10);
    this.maxTokens = parseInt(this.getEnvVar('VITE_OPENROUTER_MAX_TOKENS', this.getEnvVar('OPENROUTER_MAX_TOKENS', DEFAULT_CONFIG.maxTokens.toString())), 10);
    this.temperature = parseFloat(this.getEnvVar('VITE_OPENROUTER_TEMPERATURE', this.getEnvVar('OPENROUTER_TEMPERATURE', DEFAULT_CONFIG.temperature.toString())));
    this.maxRetries = parseInt(this.getEnvVar('VITE_OPENROUTER_MAX_RETRIES', this.getEnvVar('OPENROUTER_MAX_RETRIES', DEFAULT_CONFIG.maxRetries.toString())), 10);

    // Debug logging
    console.log('OpenRouter Config:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      model: this.model,
      baseURL: this.baseURL
    });

    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found in environment variables. AI features will be disabled.');
      console.warn('For Vite projects, make sure to prefix with VITE_ (e.g., VITE_OPENROUTER_API_KEY)');
      console.warn('Available env vars:', Object.keys(import.meta.env || {}));
    }
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue: string): string {
    // Check process.env (Node.js) or import.meta.env (Vite)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
    return defaultValue;
  }

  /**
   * Check if API is configured
   */
  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Call OpenRouter API with retry logic
   */
  public async callAPI(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeAPICall(messages);
      } catch (error) {
        lastError = error as Error;
        console.error(`OpenRouter API call failed (attempt ${attempt + 1}/${this.maxRetries + 1}):`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error)) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('OpenRouter API call failed');
  }

  /**
   * Make a single API call
   */
  private async makeAPICall(messages: ChatMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const request: OpenRouterRequest = {
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/yourusername/zork', // Required by OpenRouter
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('OpenRouter API returned no choices');
      }

      return data.choices[0].message.content;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`OpenRouter API timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();

    // Don't retry on authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
      return true;
    }

    // Don't retry on invalid request errors
    if (errorMessage.includes('400') || errorMessage.includes('invalid')) {
      return true;
    }

    return false;
  }

  /**
   * Delay utility for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
