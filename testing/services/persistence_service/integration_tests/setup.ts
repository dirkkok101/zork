/**
 * PersistenceService Integration Test Setup
 * Configures localStorage mocking and test environment for persistence testing
 */

// Import jest-localstorage-mock to set up localStorage in Node.js environment
import 'jest-localstorage-mock';
import { jest } from '@jest/globals';

/**
 * Setup for PersistenceService integration tests
 * - Configures localStorage mock
 * - Sets up test environment variables
 * - Ensures clean state between tests
 */
export function setupPersistenceIntegrationTest(): void {
  // Unmock fs for integration tests - we want to load real game data
  jest.unmock('fs/promises');
  jest.unmock('fs');
  
  // Set environment to indicate we're running integration tests
  process.env.NODE_ENV = 'integration_test';
  process.env.PERSISTENCE_INTEGRATION_TEST = 'true';
  
  // Increase timeout for integration tests that may involve async operations
  jest.setTimeout(15000);
}

/**
 * Cleanup after persistence integration tests
 */
export function teardownPersistenceIntegrationTest(): void {
  // Reset environment
  delete process.env.NODE_ENV;
  delete process.env.PERSISTENCE_INTEGRATION_TEST;
  
  // Reset timeout to default
  jest.setTimeout(5000);
  
  // Clear localStorage
  localStorage.clear();
}

/**
 * Mock localStorage quota exceeded error for testing
 */
export function mockLocalStorageQuotaExceeded(): () => void {
  // Use jest.spyOn to properly mock the method
  const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
    const error = new Error('QuotaExceededError');
    error.name = 'QuotaExceededError';
    throw error;
  });
  
  // Return function to restore original behavior
  return () => {
    setItemSpy.mockRestore();
  };
}

/**
 * Mock localStorage access error for testing
 */
export function mockLocalStorageAccessError(): () => void {
  // Use jest.spyOn to properly mock the methods
  const getItemSpy = jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw new Error('localStorage access denied');
  });
  
  const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('localStorage access denied');
  });
  
  // Return function to restore original behavior
  return () => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  };
}

/**
 * Get localStorage usage statistics for testing
 */
export function getLocalStorageStats(): {
  itemCount: number;
  totalSize: number;
  keys: string[];
} {
  const keys = Object.keys(localStorage);
  const totalSize = keys.reduce((size, key) => {
    return size + (localStorage.getItem(key)?.length || 0);
  }, 0);
  
  return {
    itemCount: keys.length,
    totalSize,
    keys
  };
}

/**
 * Set up localStorage with predefined test data
 */
export function setupTestLocalStorage(testData: Record<string, string>): void {
  localStorage.clear();
  Object.entries(testData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

// Global setup for all tests in this directory
beforeAll(() => {
  setupPersistenceIntegrationTest();
});

afterAll(() => {
  teardownPersistenceIntegrationTest();
});

// Ensure localStorage is cleared between tests (single hook definition)
beforeEach(() => {
  localStorage.clear();
  
  // Also clear our in-memory storage for consistency
  if ((global as any).PersistenceService) {
    (global as any).PersistenceService.clearInMemoryStorage();
  }
});

afterEach(() => {
  localStorage.clear();
});