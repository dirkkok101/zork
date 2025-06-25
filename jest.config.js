module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Root directories for tests
  roots: ['<rootDir>/testing'],
  
  // Test file patterns
  testMatch: [
    '**/testing/**/*.test.ts',
    '**/testing/**/*.spec.ts'
  ],
  
  // TypeScript file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration with updated ts-jest config
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // Module name mapping for clean imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/testing/utils/test_setup.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/data_loaders/**/*.ts',
    'src/services/**/*.ts',
    'src/commands/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts'
  ],
  
  // Coverage thresholds (100% for core layers)
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/data_loaders/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // Coverage reporting
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage output directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after tests
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout (10 seconds)
  testTimeout: 10000,
  
  // Max workers for performance
  maxWorkers: '50%',
  
  // Error handling
  errorOnDeprecated: true
};