/**
 * Global test setup configuration
 * This file is run before each test file is executed
 */

// Mock fs/promises only for unit tests, not integration tests
// Integration tests need real file system access
const testPath = expect.getState().testPath || '';
const isIntegrationTest = testPath.includes('integration_tests');

if (!isIntegrationTest) {
  jest.mock('fs/promises', () => ({
    readFile: jest.fn()
  }));
}

// Global test configuration
beforeAll(() => {
  // Set up global test environment
  process.env.NODE_ENV = 'test';
  
  // Configure console for tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset any global state
  if (global.gc) {
    global.gc();
  }
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});

afterAll(() => {
  // Final cleanup
  delete process.env.NODE_ENV;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidItemData(): R;
      toBeValidItem(): R;
      toHaveValidEnumValue(enumObject: any): R;
    }
  }
}

// Custom Jest matchers for ItemDataLoader testing
expect.extend({
  toBeValidItemData(received: any) {
    const requiredFields = [
      'id', 'name', 'description', 'examineText', 'aliases',
      'type', 'portable', 'visible', 'weight', 'size',
      'initialState', 'tags', 'properties', 'interactions', 'initialLocation'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length > 0) {
      return {
        message: () => `Expected object to have all required ItemData fields. Missing: ${missingFields.join(', ')}`,
        pass: false
      };
    }
    
    return {
      message: () => `Expected object not to be valid ItemData`,
      pass: true
    };
  },
  
  toBeValidItem(received: any) {
    const requiredFields = [
      'id', 'name', 'aliases', 'description', 'examineText',
      'type', 'portable', 'visible', 'weight', 'size',
      'tags', 'properties', 'interactions', 'currentLocation',
      'state', 'flags'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length > 0) {
      return {
        message: () => `Expected object to have all required Item fields. Missing: ${missingFields.join(', ')}`,
        pass: false
      };
    }
    
    return {
      message: () => `Expected object not to be valid Item`,
      pass: true
    };
  },
  
  toHaveValidEnumValue(received: any, enumObject: any) {
    const validValues = Object.values(enumObject);
    const isValid = validValues.includes(received);
    
    return {
      message: () => `Expected ${received} to be one of: ${validValues.join(', ')}`,
      pass: isValid
    };
  }
});

export {};