/**
 * Save Command Integration Test Setup
 * Configures environment for testing SaveCommand with real services and localStorage
 */

// Import jest-localstorage-mock to set up localStorage in Node.js environment
import 'jest-localstorage-mock';
import { jest } from '@jest/globals';

/**
 * Setup for SaveCommand integration tests
 * - Configures localStorage mock
 * - Sets up test environment variables
 * - Ensures clean state between tests
 */
export function setupSaveCommandIntegrationTest(): void {
  // Unmock fs for integration tests - we want to load real game data
  jest.unmock('fs/promises');
  jest.unmock('fs');
  
  // Set environment to indicate we're running integration tests
  process.env.NODE_ENV = 'integration_test';
  process.env.SAVE_COMMAND_INTEGRATION_TEST = 'true';
  
  // Increase timeout for integration tests that may involve async operations
  jest.setTimeout(15000);
  
  // Clear localStorage before each test to ensure clean state
  beforeEach(() => {
    localStorage.clear();
    
    // Also clear our in-memory storage for consistency
    if ((global as any).PersistenceService) {
      (global as any).PersistenceService.clearInMemoryStorage();
    }
  });
}

/**
 * Cleanup after save command integration tests
 */
export function teardownSaveCommandIntegrationTest(): void {
  // Reset environment
  delete process.env.NODE_ENV;
  delete process.env.SAVE_COMMAND_INTEGRATION_TEST;
  
  // Reset timeout to default
  jest.setTimeout(5000);
  
  // Clear localStorage
  localStorage.clear();
}

/**
 * Set up a pre-saved game for restore testing
 */
export function setupPreSavedGame(gameStateData: any): void {
  const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    gameState: gameStateData
  };
  
  localStorage.setItem('zork-save', JSON.stringify(saveData));
}

/**
 * Mock localStorage save failure for error testing
 */
export function mockSaveFailure(): () => void {
  const originalSetItem = localStorage.setItem;
  
  localStorage.setItem = jest.fn().mockImplementation(() => {
    throw new Error('Save failed - localStorage unavailable');
  });
  
  // Return function to restore original behavior
  return () => {
    localStorage.setItem = originalSetItem;
  };
}

/**
 * Verify save command behavior patterns
 */
export function verifySaveCommandBehavior(result: any): void {
  // Save command should count as a move (traditional Zork behavior)
  expect(result.countsAsMove).toBe(true);
  
  // Should provide clear feedback
  expect(result.message).toBeDefined();
  expect(typeof result.message).toBe('string');
  expect(result.message.length).toBeGreaterThan(0);
}

/**
 * Verify save operation completed successfully
 */
export function verifySaveSuccess(result: any): void {
  expect(result.success).toBe(true);
  expect(result.message).toContain('saved');
  verifySaveCommandBehavior(result);
}

/**
 * Verify save operation failed gracefully
 */
export function verifySaveFailure(result: any, expectedPattern?: string | RegExp): void {
  expect(result.success).toBe(false);
  verifySaveCommandBehavior(result);
  
  if (expectedPattern) {
    if (typeof expectedPattern === 'string') {
      expect(result.message).toContain(expectedPattern);
    } else {
      expect(result.message).toMatch(expectedPattern);
    }
  }
}

// Global setup for all tests in this directory
beforeAll(() => {
  setupSaveCommandIntegrationTest();
});

afterAll(() => {
  teardownSaveCommandIntegrationTest();
});

// Ensure localStorage is cleared between tests
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});