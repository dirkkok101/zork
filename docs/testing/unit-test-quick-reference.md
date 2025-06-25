# Unit Test Quick Reference

**CRITICAL Data Insights from Comprehensive Test Review:**
- TREASURE type: 0 items (don't test for > 0!)
- TOOL type: 164 items (dominant type)
- Total items: 214 across 5 categories
- Special characters: "!!!!!" and "*bun*" exist
- Category ≠ Type organizational structures

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

### Stateless Design Pattern
```typescript
// ✅ GOOD - Test data equality (stateless design)
const item1 = await loader.loadItem('lamp');
const item2 = await loader.loadItem('lamp');
expect(item1).toEqual(item2); // Same data content

// ❌ BAD - Assumes caching behavior
expect(item1).toBe(item2); // Different objects with stateless loader
```

## Performance Expectations

### Realistic Benchmarks
```typescript
// ✅ GOOD - Test consistent performance
const firstTime = await measureLoadTime();
const secondTime = await measureLoadTime();
expect(secondTime).toBeLessThan(50); // Reasonable threshold

// ❌ BAD - Assumes caching speedup
expect(secondTime).toBeLessThan(firstTime / 2); // No caching guarantee
```

## Data Distribution Testing (CRITICAL!)

### Actual Type Counts
```typescript
// ✅ GOOD - Use actual data distribution
const toolItems = await loader.getItemsByType(ItemType.TOOL);
expect(toolItems.length).toBe(164); // Actual count

const treasureItems = await loader.getItemsByType(ItemType.TREASURE);
expect(treasureItems.length).toBe(0); // TREASURE type has NO items!

const totalItems = await loader.loadAllItems();
expect(totalItems.length).toBe(214); // Exact total

// ❌ BAD - Assuming distribution
expect(treasureItems.length).toBeGreaterThan(0); // WRONG!
expect(toolItems.length).toBe(50); // WRONG!
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

### Implementation Analysis
- [ ] Read the actual implementation code
- [ ] Note exact error messages
- [ ] Identify all required fields
- [ ] Check what validation actually exists
- [ ] Verify stateless architecture (no caching)
- [ ] Consider TypeScript strict mode

### Data Reality Check (CRITICAL!)
- [ ] TREASURE type has 0 items - don't test for > 0
- [ ] TOOL type has 164 items - dominant type
- [ ] Total 214 items across 5 categories
- [ ] Category treasures ≠ TREASURE type items
- [ ] Special characters "!!!!!" and "*bun*" exist

### Test Design
- [ ] Plan mock strategy (single vs mixed)
- [ ] .toEqual() for data equality (stateless design)
- [ ] Include '../setup' for integration tests
- [ ] Set realistic performance expectations
- [ ] Handle flat vs category-based patterns