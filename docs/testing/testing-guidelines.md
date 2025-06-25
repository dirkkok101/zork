# Testing Guidelines

## Overview

This document establishes the testing philosophy, standards, and practices for the Zork 1 Text Adventure Game project. Testing is a critical component of our development approach, ensuring code quality, reliability, and maintainability while supporting our 100% authentic recreation goals.

**CRITICAL**: Before writing unit tests, review these essential documents:
- [Unit Test Best Practices](./unit-test-best-practices.md) - **CRITICAL learnings from comprehensive test review**
- [Unit Test Quick Reference](./unit-test-quick-reference.md) - Common patterns and gotchas
- [DataLoader Testing Guidelines](./data-loader-testing.md) - Specific patterns for data layer testing

**Key Discoveries from Comprehensive Test Review:**
- TREASURE type has 0 items in actual dataset (major assumption wrong!)
- TOOL type dominates with 164 items (77% of all items)
- Category vs Type are different organizational structures
- Integration tests require `import '../setup'` to work
- .toBe() vs .toEqual() critical for cached vs stateless architectures

## Testing Philosophy

### Core Principles

1. **Reference Material is Gospel**: When tests conflict with implementation, we verify against original Zork behavior
2. **Type Safety First**: All tests must maintain TypeScript strict mode compliance
3. **100% Coverage**: DataLoaders, Services, and Commands layers require complete test coverage
4. **Fail Fast**: Tests should catch issues early and provide clear failure messages
5. **Maintainable Tests**: Test code follows the same quality standards as production code

### Quality Standards

- **Code Coverage**: 100% line, branch, and function coverage for core layers
- **Performance**: Tests must complete within reasonable time bounds
- **Reliability**: Tests should be deterministic and stable
- **Documentation**: Complex test scenarios require clear documentation

## Testing Framework and Tools

### Primary Testing Stack

#### Jest Test Runner
- **Framework**: Jest 29.x for test execution and assertions
- **TypeScript Support**: ts-jest for TypeScript compilation
- **Type Definitions**: @types/jest for TypeScript definitions
- **Mock Framework**: jest-mock-extended for advanced mocking capabilities

#### Configuration Requirements
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/data_loaders/**/*.ts',
    'src/services/**/*.ts', 
    'src/commands/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

## Test Categories and Scope

### Unit Tests
**Definition**: Test individual functions/methods in isolation with mocked dependencies.

**Characteristics**:
- Fast execution (< 100ms per test)
- No file system access
- No network calls
- Deterministic results
- Complete dependency mocking

**When to Use**:
- Testing business logic
- Validation functions
- Error handling scenarios
- Edge cases and boundary conditions

### Integration Tests
**Definition**: Test component interactions with real dependencies and data.

**Characteristics**:
- Real file system access
- Actual data files
- Component integration
- Slower execution acceptable
- Minimal mocking

**When to Use**:
- Data loading validation
- End-to-end workflows
- Cross-component interactions
- Performance verification

### Test Isolation Principles

#### Unit Test Isolation
- Each test runs independently
- No shared state between tests
- Mock all external dependencies
- Use fake/stub data

#### Integration Test Isolation
- Tests can share real data files
- Clean state before each test
- Real dependencies allowed
- Use actual project data

## Test Organization Structure

### Directory Structure
```
testing/
├── {layer}/                    # Per architectural layer
│   └── {component}/           # Per component/class
│       ├── unit_tests/        # Unit tests by function
│       ├── integration_tests/ # Integration tests by scenario
│       └── test_data/         # Test-specific data
└── utils/                     # Shared testing utilities
    ├── test_helpers.ts        # Common test utilities
    ├── mock_factories.ts      # Mock object factories
    └── data_generators.ts     # Test data generators
```

### File Naming Conventions

#### Unit Tests
- **Pattern**: `{functionName}.test.ts`
- **Examples**: 
  - `loadAllItems.test.ts`
  - `parseCondition.test.ts`
  - `validateItemData.test.ts`

#### Integration Tests
- **Pattern**: `{scenario}.test.ts` or `{dataCategory}.test.ts`
- **Examples**:
  - `full_dataset.test.ts`
  - `cross_category.test.ts`
  - `treasures_loading.test.ts`

#### Test Data
- **Pattern**: `mock_{entityType}.json` or `test_{scenario}.json`
- **Examples**:
  - `mock_item.json`
  - `test_invalid_data.json`
  - `mock_index.json`

## Mock Data and Test Data Management

### Unit Test Mocking Strategy

#### Filesystem Mocking
```typescript
import { readFile } from 'fs/promises';
jest.mock('fs/promises');
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
```

#### Mock Data Principles
- **Complete Required Fields**: Always include ALL required fields to avoid validation errors
- **Flexible Path Matching**: Mock systems must handle various path formats (relative, absolute, filename-only)
- **Mixed Scenarios**: Support both successful reads and errors in the same test
- **Edge Cases**: Create mocks for boundary conditions
- **Invalid Data**: Test error handling with malformed data
- **Performance Data**: Large datasets for performance testing

### Integration Test Data Strategy

#### Real Data Usage
- Use actual JSON files from `data/` directory
- Validate against complete dataset
- Test with all 214 items for comprehensive coverage
- Verify actual enum values and data structures

#### Data Integrity
- Tests should not modify source data files
- Use read-only access to project data
- Create copies for tests that require data manipulation

## Error Handling and Edge Cases

### Error Testing Requirements

#### Unit Tests Must Cover
- Invalid input parameters
- Malformed data structures
- Missing required fields
- Type conversion failures
- Validation errors

#### Integration Tests Must Cover
- File not found scenarios
- Permission errors
- Corrupted data files
- Network timeout scenarios (future)
- Large dataset handling

### Edge Case Categories

#### Data Edge Cases
- Empty arrays and objects
- Special characters in IDs ("!!!!!", "*bun*")
- Maximum/minimum values
- Unicode characters
- Null/undefined handling

#### System Edge Cases
- Memory constraints
- File system limits
- Concurrent access patterns
- Cache overflow scenarios

## Performance and Memory Testing

### Performance Requirements

#### DataLoader Performance Standards
- **Single Item Load**: < 10ms
- **Category Load**: < 100ms  
- **Full Dataset Load**: < 500ms
- **File Load**: < 10ms per item

#### Memory Usage Standards
- **Memory Usage**: Monitor memory usage of stateless operations
- **Memory Leaks**: Verify no memory leaks in long-running tests
- **Resource Cleanup**: Test proper resource disposal

### Performance Testing Approach
```typescript
describe('Performance Tests', () => {
  it('loads all items within time limit', async () => {
    const start = performance.now();
    await loader.loadAllItems();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

## Coverage Requirements and Quality Gates

### Coverage Thresholds by Layer

#### DataLoaders Layer
- **Line Coverage**: 100%
- **Branch Coverage**: 100%
- **Function Coverage**: 100%
- **Statement Coverage**: 100%

#### Services Layer (Future)
- **Line Coverage**: 100%
- **Branch Coverage**: 100%
- **Function Coverage**: 100%
- **Statement Coverage**: 100%

#### Commands Layer (Future)
- **Line Coverage**: 100%
- **Branch Coverage**: 100%
- **Function Coverage**: 100%
- **Statement Coverage**: 100%

#### Types Layer
- **Coverage**: Exempt (type-only definitions)

### Quality Gates

#### Pre-Commit Requirements
- All tests must pass
- Coverage thresholds must be met
- No TypeScript compilation errors
- Linting must pass

#### CI/CD Integration
- Automated test execution on pull requests
- Coverage reporting and enforcement
- Performance regression detection
- Test result documentation

## Best Practices and Common Patterns

### Test Writing Guidelines

#### Match Implementation Reality
Always verify what the code actually does before writing tests:
- Read the implementation code first
- Check exact error messages thrown
- Verify what validation is actually performed
- Don't test for features that don't exist

#### Descriptive Test Names
```typescript
// Good
it('should throw error when item ID does not exist in any category')
it('should parse negated condition "!state.open" to ["not", "state.open"]')

// Bad  
it('should fail')
it('should work')
```

#### Test Structure (AAA Pattern)
```typescript
it('should convert ItemData to Item with correct type enum', async () => {
  // Arrange
  const mockItemData: ItemData = createMockItemData({ type: 'TOOL' });
  
  // Act
  const result = await loader.loadItem(mockItemData.id);
  
  // Assert
  expect(result.type).toBe(ItemType.TOOL);
});
```

#### Error Testing Pattern
```typescript
it('should throw descriptive error for invalid item type', async () => {
  // Arrange
  const invalidData = createMockItemData({ type: 'INVALID_TYPE' });
  mockReadFile.mockResolvedValue(JSON.stringify(invalidData));
  
  // Act & Assert
  await expect(loader.loadItem('test')).rejects.toThrow(
    'Invalid item type: INVALID_TYPE'
  );
});
```

### Common Testing Utilities

#### Mock Factory Pattern
```typescript
export function createMockItemData(overrides?: Partial<ItemData>): ItemData {
  return {
    id: 'test_item',
    name: 'Test Item',
    type: 'TOOL',
    size: 'MEDIUM',
    // ... default values
    ...overrides
  };
}
```

#### Test Helper Functions
```typescript
export async function loadTestItem(loader: IItemDataLoader, itemId: string) {
  try {
    return await loader.loadItem(itemId);
  } catch (error) {
    throw new Error(`Failed to load test item ${itemId}: ${error}`);
  }
}
```

## Continuous Integration and Automation

### Automated Testing Pipeline

#### Pull Request Checks
1. **Unit Tests**: Execute all unit tests
2. **Integration Tests**: Execute all integration tests  
3. **Coverage Verification**: Enforce coverage thresholds
4. **Performance Tests**: Run performance benchmarks
5. **Type Checking**: Verify TypeScript compilation

#### Nightly Tests
- **Full Dataset Validation**: Test against complete data
- **Memory Usage Analysis**: Monitor memory patterns
- **Performance Regression**: Track performance trends

### Test Reporting

#### Coverage Reports
- **Format**: HTML and JSON coverage reports
- **Storage**: Archive coverage reports for trend analysis
- **Visualization**: Coverage trend graphs and metrics

#### Performance Reports
- **Metrics**: Execution time, memory usage, cache efficiency
- **Baselines**: Compare against previous benchmarks
- **Alerts**: Notify on performance regressions

## Troubleshooting and Debugging

### Common Test Issues

#### Mock Conflicts
- **Problem**: Multiple mock setups overwriting each other
- **Solution**: Use combined mock methods (e.g., mockMixedFileReads)

#### Object Identity vs Data Equality
- **Problem**: Tests expect same object reference but get different instances
- **Solution**: Use .toEqual() for data equality testing with stateless design

#### TypeScript Strict Mode in Tests
- **Problem**: Type errors when manipulating test data
- **Solution**: Use type casting for test-specific operations: `delete (data as any).field`

#### Flaky Tests
- **Timing Issues**: Use proper async/await patterns
- **State Pollution**: Ensure test isolation
- **External Dependencies**: Mock unstable dependencies

#### Coverage Gaps
- **Missing Branches**: Test all conditional logic paths
- **Error Handling**: Test all error scenarios
- **Edge Cases**: Include boundary condition tests

### Debugging Strategies

#### Test Debugging
```typescript
// Use focused tests for debugging
it.only('debug specific scenario', () => {
  // Isolated test for debugging
});

// Add detailed logging
console.log('Debug data:', JSON.stringify(testData, null, 2));
```

#### Coverage Analysis
- Use coverage reports to identify untested code
- Focus on branch coverage for complex logic
- Review function coverage for completeness

This comprehensive testing approach ensures our Zork recreation maintains the highest quality standards while preserving the authentic game experience.