/**
 * Integration test setup - NO MOCKING
 * This setup is specifically for integration tests that need real file system access
 */

// Unmock fs/promises for integration tests
jest.unmock('fs/promises');

// Integration test configuration
beforeAll(() => {
  // Set up integration test environment
  process.env.NODE_ENV = 'test';
  process.env.INTEGRATION_TEST = 'true';
});

beforeEach(() => {
  // Only clear mocks that we want to clear for integration tests
  // Don't clear fs/promises mocks since we need real file access
});

afterEach(() => {
  // Minimal cleanup for integration tests
});

afterAll(() => {
  // Cleanup
  delete process.env.INTEGRATION_TEST;
});

export {};