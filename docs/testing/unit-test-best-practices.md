# Unit Test Best Practices and Common Pitfalls

## Overview

This document captures key learnings from the ItemDataLoader unit test implementation experience. These practices and pitfall warnings will help developers write better unit tests from the start, avoiding common errors that lead to test failures and extensive debugging.

## Key Learnings from Test Implementation

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

#### Pitfall: Testing Data Equality When Object Identity Matters
**Problem**: Tests fail because they expect object identity but get equal-but-different objects.

```typescript
// BAD: Different objects with same data
const item1 = await loader.loadItem('lamp');
const item2 = await loader.loadItem('lamp');
expect(item1).toBe(item2); // Fails if not cached properly!
```

**Solution**: Implement proper caching for object identity:

```typescript
// GOOD: Ensure same object reference via caching
private async loadOrGetCachedItem(filePath: string): Promise<Item> {
  const itemId = this.extractItemId(filePath);
  
  if (this.itemCache.has(itemId)) {
    return this.itemCache.get(itemId)!; // Return cached instance
  }
  
  const item = await this.loadItemFromFile(filePath);
  this.itemCache.set(itemId, item);
  return item;
}
```

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

#### Pitfall: Testing Wrong Error Scenarios
**Problem**: Tests check for errors that can't actually occur.

```typescript
// BAD: Arrays are objects in JavaScript!
expect(() => validateIndexData([]))
  .toThrow('Index data must be an object'); // Arrays pass object check!
```

**Solution**: Understand JavaScript/TypeScript behavior:

```typescript
// GOOD: Test actual error case
expect(() => validateIndexData([]))
  .toThrow('Index data must have categories object'); // Correct error
```

### 8. Performance Test Expectations

#### Pitfall: Unrealistic Performance Expectations
**Problem**: Tests expect performance that's too aggressive.

```typescript
// BAD: Too aggressive
expect(cachedLoadTime).toBeLessThan(firstLoadTime / 10); // 10x faster
```

**Solution**: Set realistic performance expectations:

```typescript
// GOOD: Realistic expectation
expect(cachedLoadTime).toBeLessThan(firstLoadTime / 2); // 2x faster
expect(cachedLoadTime).toBeLessThan(10); // Absolute threshold
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
      it('should cache items for performance');
    });
  });
  
  describe('Type Conversion', () => {
    describe('parseItemType()', () => {
      it('should convert valid type strings');
      it('should throw error for invalid types');
    });
  });
  
  // etc...
});
```

## Testing Checklist

Before writing unit tests, verify:

- [ ] What does the implementation actually do? (Read the code!)
- [ ] What are the exact error messages thrown?
- [ ] What validation is actually performed?
- [ ] Are there caching requirements for object identity?
- [ ] What are the required fields for test data?
- [ ] Are TypeScript types properly handled?
- [ ] Are async operations properly awaited?
- [ ] Are mocks flexible enough for different path formats?
- [ ] Do performance expectations match reality?
- [ ] Are error scenarios actually possible?

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
6. Setting realistic performance expectations
7. Properly handling async operations
8. Maintaining TypeScript type safety even in tests

By following these practices and avoiding common pitfalls, future unit tests can be written correctly from the start, saving significant debugging time.