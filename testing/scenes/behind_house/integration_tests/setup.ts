/**
 * Test Setup for Integration Tests
 * Provides real data loading and service initialization for integration testing
 */

import { jest } from '@jest/globals';

/**
 * Setup for integration tests - unmock fs and enable real file system access
 * This allows us to load real game data for integration testing
 */
export function setupIntegrationTest(): void {
  // Unmock fs for integration tests - we want to load real data
  jest.unmock('fs/promises');
  jest.unmock('fs');

  // Set environment to indicate we're running integration tests
  process.env.NODE_ENV = 'integration_test';

  // Increase timeout for integration tests that load real data
  jest.setTimeout(15000);
}

/**
 * Cleanup after integration tests
 */
export function teardownIntegrationTest(): void {
  // Reset environment
  delete process.env.NODE_ENV;

  // Reset timeout to default
  jest.setTimeout(5000);
}

// Global setup for all tests in this directory
beforeAll(() => {
  setupIntegrationTest();
});

afterAll(() => {
  teardownIntegrationTest();
});
