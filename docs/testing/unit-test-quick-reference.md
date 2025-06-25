# Unit Test Quick Reference

## Essential Mock Patterns

### Flexible Path Matching Mock
```typescript
// ✅ GOOD - Handles various path formats
mockReadFile.mockImplementation(async (path) => {
  const pathStr = String(path);
  const fileName = expectedPath.split('/').pop() || '';
  const requestedFileName = pathStr.split('/').pop() || '';
  
  if (pathStr.includes(expectedPath) || 
      pathStr.endsWith(expectedPath) || 
      requestedFileName === fileName) {
    return JSON.stringify(mockData);
  }
  throw new Error(`Unexpected file path: ${pathStr}`);
});
```

### Mixed Success/Error Mock
```typescript
// ✅ GOOD - Single mock for mixed scenarios
testHelper.mockMixedFileReads(
  {
    'index.json': mockIndex,
    'good/item.json': mockItem
  },
  {
    'bad/error.json': new Error('File not found')
  }
);

// ❌ BAD - Second mock overwrites first
testHelper.mockMultipleFileReads({...});
testHelper.mockFileReadError(...); // Overwrites!
```

## Complete Mock Data Factory

```typescript
// ✅ GOOD - All required fields included
export const ItemDataFactory = {
  tool: (overrides?: Partial<ItemData>) => ({
    id: 'test_tool',
    name: 'Test Tool',
    description: 'A test tool',
    examineText: 'You examine the tool.',  // Don't forget!
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
  })
};
```

## TypeScript Strict Mode Patterns

### Property Deletion in Tests
```typescript
// ✅ GOOD
delete (testData as any).id;

// ❌ BAD - TS error in strict mode
delete testData.id;
```

### Error Type Assertions
```typescript
// ✅ GOOD
try {
  await loader.loadItem('test');
} catch (error) {
  expect((error as Error).message).toContain('Failed');
}

// ❌ BAD - TS error
expect(error.message).toContain('Failed');
```

## Common Error Messages

### ItemDataLoader Errors
- **Invalid type**: `"Invalid item type: ${type}"`
- **Invalid size**: `"Invalid item size: ${size}"` (not just "Invalid size")
- **Item not found**: `"Item with ID '${itemId}' not found"`
- **Category not found**: `"Category '${category}' not found"`
- **Missing field**: `"Item data missing required field: ${field}"`
- **Load failure**: `"Failed to load item from ${filePath}: ${error}"`

## Object Identity Testing

### Cache Testing Pattern
```typescript
// ✅ GOOD - Test object identity
const item1 = await loader.loadItem('lamp');
const item2 = await loader.loadItem('lamp');
expect(item1).toBe(item2); // Same reference

// ❌ BAD - Only tests data equality
expect(item1).toEqual(item2); // Different objects OK
```

## Performance Expectations

### Realistic Benchmarks
```typescript
// ✅ GOOD - Realistic expectations
expect(cachedTime).toBeLessThan(firstTime / 2); // 2x faster
expect(loadTime).toBeLessThan(10); // Absolute threshold

// ❌ BAD - Too aggressive
expect(cachedTime).toBeLessThan(firstTime / 10); // 10x faster
```

## Validation Testing

### Match Implementation Reality
```typescript
// ✅ GOOD - Test what actually exists
it('should allow negative weight', () => {
  // Implementation only checks presence, not validity
  const data = { weight: -5, ...otherFields };
  expect(() => validateItemData(data)).not.toThrow();
});

// ❌ BAD - Test non-existent validation
it('should throw for negative weight', () => {
  expect(() => validateItemData({ weight: -5 }))
    .toThrow('Weight must be positive'); // Doesn't exist!
});
```

## JavaScript/TypeScript Gotchas

### Arrays are Objects
```typescript
// Arrays pass object type checks!
expect(typeof []).toBe('object'); // true

// Test the actual error:
expect(() => validateIndexData([]))
  .toThrow('Index data must have categories object');
// NOT: 'Index data must be an object'
```

### Assignment Parsing
```typescript
// Check actual implementation format
parseEffect('state.open=true')
// Returns: ['set', 'state.open', 'true']
// NOT: ['assign', 'state.open', 'true']
```

## Test Structure Template

```typescript
describe('ComponentName', () => {
  let component: ComponentType;
  let testHelper: TestHelper;

  beforeEach(() => {
    component = new ComponentType();
    testHelper = new TestHelper();
  });

  describe('methodName()', () => {
    it('should handle success case', async () => {
      // Arrange
      const mockData = Factory.create();
      testHelper.mockSuccess(mockData);

      // Act
      const result = await component.method();

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle error case', async () => {
      // Arrange
      testHelper.mockError(new Error('Test error'));

      // Act & Assert
      await expect(component.method())
        .rejects.toThrow('Expected error message');
    });
  });
});
```

## Pre-Test Checklist

- [ ] Read the actual implementation code
- [ ] Note exact error messages
- [ ] Identify all required fields
- [ ] Check what validation actually exists
- [ ] Verify caching requirements
- [ ] Consider TypeScript strict mode
- [ ] Plan mock strategy (single vs mixed)
- [ ] Set realistic performance expectations