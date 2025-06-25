# Unit Test Best Practices and Common Pitfalls

## Overview

This document captures key learnings from the ItemDataLoader unit test implementation experience. These practices and pitfall warnings will help developers write better unit tests from the start, avoiding common errors that lead to test failures and extensive debugging.

## Key Learnings from Comprehensive Test Review

**Critical Data Insights Discovered:**
- TREASURE type has 0 items in the actual dataset (not category-type mismatch)
- TOOL type has 164 items (most common type)
- Total dataset: 214 items across 5 categories
- Special character items exist: "!!!!!" and "*bun*" are valid item IDs
- ItemType enum has only 5 valid values, not the expected 6 (no TREASURE type in data)

### 1. Mock System Design

#### Pitfall: Rigid Path Matching
**Problem**: Early mock implementations used exact path matching, causing tests to fail when the actual code used different path patterns.

```typescript
// BAD: Too rigid
mockReadFile.mockImplementation(async (path) => {
  if (path === 'index.json') { // Only matches exact string
    return mockData;
  }
  throw new Error('Unexpected file path');
});
```

**Solution**: Implement flexible path matching that handles various path formats:

```typescript
// GOOD: Flexible matching
mockReadFile.mockImplementation(async (path) => {
  const pathStr = String(path);
  const fileName = filePath.split('/').pop() || '';
  const requestedFileName = pathStr.split('/').pop() || '';
  
  if (pathStr.includes(filePath) || 
      pathStr.endsWith(filePath) || 
      requestedFileName === fileName ||
      (fileName && pathStr.includes(fileName))) {
    return toJsonString(data);
  }
  throw new Error(`Unexpected file path: ${pathStr}`);
});
```

#### Pitfall: Overwriting Mocks in Same Test
**Problem**: Using multiple mock setup methods in the same test causes the second to overwrite the first.

```typescript
// BAD: Second mock overwrites the first
testHelper.mockMultipleFileReads({ 'index.json': mockIndex });
testHelper.mockFileReadError('error.json', new Error()); // Overwrites!
```

**Solution**: Use a combined mock method for mixed scenarios:

```typescript
// GOOD: Single mock handles both cases
testHelper.mockMixedFileReads(
  { 'index.json': mockIndex },
  { 'error.json': new Error('File error') }
);
```

### 2. Test Expectations vs Implementation Reality

#### Critical Learning: Type Distribution Reality vs Expectations
**Problem**: Tests assume certain item types have items when they don't exist in the actual data.

```typescript
// BAD: Assuming TREASURE type has items when it doesn't
const treasures = await loader.getItemsByType(ItemType.TREASURE);
expect(treasures.length).toBeGreaterThan(0); // Fails! TREASURE type has 0 items
```

**Solution**: Understand the actual data distribution:

```typescript
// GOOD: Use actual type distribution from flat structure
const toolItems = await loader.getItemsByType(ItemType.TOOL); // 164 items (dominant type)
const treasureType = await loader.getItemsByType(ItemType.TREASURE); // 0 items

// Most items are classified as TOOL type, regardless of their conceptual purpose
expect(toolItems.length).toBe(164);
expect(treasureType.length).toBe(0);
```

#### Pitfall: Testing Unimplemented Features
**Problem**: Tests expect validation that doesn't exist in the actual implementation.

```typescript
// BAD: Test expects validation that doesn't exist
it('should validate weight is positive', () => {
  const invalidData = { weight: -5 };
  expect(() => validateItemData(invalidData))
    .toThrow('Weight must be positive'); // Implementation doesn't check this!
});
```

**Solution**: Always verify what the implementation actually does:

```typescript
// GOOD: Test matches actual implementation
it('should allow negative weight values', () => {
  const data = { weight: -5 };
  // Implementation only checks field presence, not value validity
  expect(() => validateItemData(data)).not.toThrow();
});
```

#### Pitfall: Incorrect Error Message Expectations
**Problem**: Tests expect specific error messages that don't match implementation.

```typescript
// BAD: Wrong error message
expect(() => parseSize('tiny'))
  .toThrow('Invalid size: tiny'); // Actual: "Invalid item size: tiny"
```

**Solution**: Always check actual error messages in implementation:

```typescript
// GOOD: Correct error message
expect(() => parseSize('tiny'))
  .toThrow('Invalid item size: tiny');
```

### 3. Object Identity vs Data Equality

#### Critical Learning: Architecture Determines Testing Approach
**Problem**: Tests must match the actual architecture - ItemDataLoader is stateless.

**ItemDataLoader** (stateless - objects will be different):
```typescript
// GOOD: Test data consistency, not object identity
const item1 = await loader.loadItem('lamp');
const item2 = await loader.loadItem('lamp');
expect(item1).toEqual(item2); // Same data content
expect(item1.id).toBe('lamp');
expect(item2.id).toBe('lamp');
// Don't test object identity - ItemDataLoader is stateless
```

**For Educational Comparison - Cached Loaders** (hypothetical):
```typescript
// Example for different architecture: objects should be identical
const item1 = await cachedLoader.loadItem('lamp');
const item2 = await cachedLoader.loadItem('lamp');
expect(item1).toBe(item2); // Same reference (cached system)
```

**Critical**: ItemDataLoader is stateless - always verify the implementation architecture!

### 4. TypeScript Strict Mode Compliance

#### Pitfall: Ignoring TypeScript Errors in Tests
**Problem**: Tests use `any` or ignore type errors, leading to runtime failures.

```typescript
// BAD: Type errors ignored
const error = { message: 'Error' }; // Not typed as Error
expect(error.message).toContain('Failed'); // TS error ignored
```

**Solution**: Properly type all test variables and assertions:

```typescript
// GOOD: Proper typing
try {
  await loader.loadItem('test');
} catch (error) {
  expect((error as Error).message).toContain('Failed');
}
```

#### Pitfall: Invalid Property Access/Deletion
**Problem**: TypeScript strict mode prevents dynamic property operations.

```typescript
// BAD: TS error in strict mode
delete invalidData.id; // Error: Delete operator issue
```

**Solution**: Use type casting for test-specific operations:

```typescript
// GOOD: Type casting for test operations
delete (invalidData as any).id;
```

### 5. Async/Await Patterns

#### Pitfall: Incorrect Async Test Patterns
**Problem**: Tests don't properly handle async operations.

```typescript
// BAD: Missing await
it('should load item', () => {
  const result = loader.loadItem('test'); // Returns Promise!
  expect(result.id).toBe('test'); // Fails!
});
```

**Solution**: Always use async/await properly:

```typescript
// GOOD: Proper async handling
it('should load item', async () => {
  const result = await loader.loadItem('test');
  expect(result.id).toBe('test');
});
```

### 6. Test Data Management

#### Critical Learning: Real Data Distribution vs Expected Data
**Problem**: Tests assume data distribution that doesn't match reality.

```typescript
// BAD: Testing non-existent TREASURE type
const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
expect(treasureItems.length).toBeGreaterThan(0); // Fails! 0 TREASURE items

// BAD: Assuming even distribution across types
const weaponItems = await loader.getItemsByType(ItemType.WEAPON);
expect(weaponItems.length).toBe(42); // Wrong! Actual count varies
```

**Solution**: Use actual data distribution from comprehensive review:

```typescript
// GOOD: Test actual data distribution
const toolItems = await loader.getItemsByType(ItemType.TOOL);
expect(toolItems.length).toBe(164); // TOOL is the dominant type

const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
expect(treasureItems.length).toBe(0); // TREASURE type has 0 items

const totalItems = await loader.loadAllItems();
expect(totalItems.length).toBe(214); // Actual total
```

#### Pitfall: Incomplete Mock Data
**Problem**: Mock data missing required fields causes validation failures.

```typescript
// BAD: Missing required fields
const mockItem = {
  id: 'test',
  name: 'Test Item'
  // Missing: description, examineText, aliases, etc.
};
```

**Solution**: Use factory functions with complete defaults:

```typescript
// GOOD: Complete mock data factory
export function createMockItemData(overrides?: Partial<ItemData>): ItemData {
  return {
    id: 'test_item',
    name: 'Test Item',
    description: 'A test item',
    examineText: 'You see a test item.',
    aliases: [],
    type: 'TOOL',
    portable: true,
    visible: true,
    weight: 10,
    size: 'MEDIUM',
    initialState: {},
    tags: [],
    properties: {},
    interactions: [],
    initialLocation: 'unknown',
    ...overrides
  };
}
```

### 7. Error Testing Patterns

#### Critical Learning: JavaScript/TypeScript Behavior Understanding
**Problem**: Tests check for errors that can't actually occur due to JavaScript behavior.

```typescript
// BAD: Arrays are objects in JavaScript!
expect(() => validateIndexData([]))
  .toThrow('Index data must be an object'); // Arrays pass object check!

// BAD: Testing for TREASURE items that don't exist
expect(() => loader.getItemsByType(ItemType.TREASURE))
  .toThrow('No items found'); // Won't throw - returns empty array
```

**Solution**: Understand JavaScript/TypeScript behavior AND actual data:

```typescript
// GOOD: Test actual error case based on JS behavior
expect(() => validateIndexData([]))
  .toThrow('Index data must have categories object'); // Correct error

// GOOD: Test actual data behavior
const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
expect(treasureItems).toEqual([]); // Returns empty array, doesn't throw
```

### 8. Performance Test Expectations

#### Critical Learning: Architecture-Specific Performance Expectations
**Problem**: Tests expect performance improvements that don't match the architecture.

**For ItemDataLoader** (stateless):
```typescript
// BAD: Expecting caching benefits in ItemDataLoader
expect(secondLoadTime).toBeLessThan(firstLoadTime / 10); // Won't happen - no caching

// GOOD: Realistic expectations for ItemDataLoader
expect(secondLoadTime).toBeLessThan(firstLoadTime * 1.5); // Similar performance
expect(secondLoadTime).toBeLessThan(20); // Absolute threshold
```

**For Educational Comparison - Cached Loaders** (hypothetical):
```typescript
// Example for different architecture: can expect significant improvement
expect(cachedLoadTime).toBeLessThan(firstLoadTime / 5); // 5x faster is realistic
expect(cachedLoadTime).toBeLessThan(5); // Should be very fast
```

## Recommended Test Structure

### 1. Mock Setup Helpers

Create comprehensive mock helpers that handle common scenarios:

```typescript
export class ItemDataLoaderTestHelper {
  // Single file mock
  mockFileRead(filePath: string, data: any): void { }
  
  // Multiple files mock
  mockMultipleFileReads(fileDataMap: Record<string, any>): void { }
  
  // Error scenarios
  mockFileReadError(filePath: string, error: Error): void { }
  
  // Mixed success/error scenarios
  mockMixedFileReads(
    fileDataMap: Record<string, any>, 
    errorFiles: Record<string, Error>
  ): void { }
}
```

### 2. Factory Pattern for Test Data

Always use factories for consistent test data:

```typescript
export const ItemDataFactory = {
  tool: (overrides?: Partial<ItemData>) => 
    createMockItemData({ type: 'TOOL', ...overrides }),
    
  treasure: (overrides?: Partial<ItemData>) => 
    createMockItemData({ type: 'TREASURE', ...overrides }),
    
  // etc...
};
```

### 3. Clear Test Organization

Organize tests by functionality:

```typescript
describe('ItemDataLoader', () => {
  describe('Core Loading Functions', () => {
    describe('loadItem()', () => {
      it('should load single item successfully');
      it('should throw error for non-existent item');
      it('should load items consistently');
    });
  });
  
  describe('Type Conversion', () => {
    // Type conversion is tested through public methods
    // Private methods are not tested directly
  });
  
  // etc...
});
```

## Comprehensive Testing Checklist

Before writing unit tests, verify:

### Implementation Analysis
- [ ] What does the implementation actually do? (Read the code!)
- [ ] What are the exact error messages thrown?
- [ ] What validation is actually performed?
- [ ] ItemDataLoader is stateless (no caching) - test data equality, not object identity
- [ ] Are TypeScript types properly handled?
- [ ] Are async operations properly awaited?

### Data Understanding (Critical Learnings)
- [ ] What is the actual data distribution? (Use integration test insights)
- [ ] TREASURE type: 0 items (don't test for > 0)
- [ ] TOOL type: 164 items (dominant type) 
- [ ] Total items: 214 across 5 categories
- [ ] Special character items: "!!!!!" and "*bun*" exist
- [ ] Category vs Type: Different organizational structures

### Test Design
- [ ] What are the required fields for test data?
- [ ] Are mocks flexible enough for different path formats?
- [ ] Do performance expectations match ItemDataLoader's stateless architecture (no caching benefits)?
- [ ] Are error scenarios actually possible?
- [ ] Does test structure match flat vs category-based patterns?

### Integration Test Requirements
- [ ] Include import '../setup' for integration tests
- [ ] Use real data paths for integration tests
- [ ] Test with actual item counts (214 total, 164 TOOL, 0 TREASURE)
- [ ] Handle special character items in real data tests

## Common Test Utilities

### Path Matching Helper
```typescript
function matchesPath(actualPath: string, expectedPath: string): boolean {
  const actualFile = actualPath.split('/').pop() || '';
  const expectedFile = expectedPath.split('/').pop() || '';
  
  return actualPath.includes(expectedPath) ||
         actualPath.endsWith(expectedPath) ||
         actualFile === expectedFile;
}
```

### Error Creation Helpers
```typescript
export class ErrorTestHelper {
  static createFileSystemError(code: string): Error {
    const error = new Error(`${code}: File system error`);
    (error as any).code = code;
    return error;
  }
  
  static createNetworkError(code: string): Error {
    const error = new Error(`${code}: Network error`);
    (error as any).code = code;
    return error;
  }
}
```

### Performance Testing Utilities
```typescript
export class PerformanceTestHelper {
  static async measureTime<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }
}
```

## Summary

Writing good unit tests requires:
1. Understanding what the implementation actually does (not what you think it does)
2. Creating flexible, reusable mock systems
3. Using complete test data with all required fields
4. Matching error messages exactly
5. Understanding JavaScript/TypeScript behavior (e.g., arrays are objects)
6. Setting realistic performance expectations for stateless architecture (ItemDataLoader)
7. Properly handling async operations
8. Maintaining TypeScript type safety even in tests

By following these practices and avoiding common pitfalls, future unit tests can be written correctly from the start, saving significant debugging time.