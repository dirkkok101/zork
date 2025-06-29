/**
 * Test setup for Behind House Scene Look Command Tests
 * Configures Jest environment and timeouts for integration testing
 */

// Increase timeout for integration tests that load real game data
jest.setTimeout(30000);

// Global test configuration
beforeAll(() => {
  // Suppress console output during tests to reduce noise
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'info').mockImplementation();
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});