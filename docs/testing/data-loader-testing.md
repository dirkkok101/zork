# DataLoader Testing Guidelines

## Overview

This document provides specific testing guidelines for the DataLoader layer components, focusing on data integrity, type safety, and performance. DataLoaders are critical to the game's foundation, requiring comprehensive validation and error handling.

## DataLoader Testing Philosophy

### Core Responsibilities to Test

1. **Data Integrity**: Ensure loaded data matches source files exactly
2. **Type Safety**: Validate all type conversions and enum mappings
3. **Error Handling**: Test graceful degradation and informative errors
4. **Performance**: Verify caching and loading performance standards
5. **Edge Cases**: Handle special characters, empty data, and boundary conditions

### Testing Approach by Layer

#### Raw Data Validation (ItemData Interface)
- JSON structure validation
- Required field presence
- Data type correctness
- Special character handling

#### Type Conversion Testing (ItemData → Item)
- Enum value validation
- String to enum conversion accuracy
- Flag-based condition parsing
- State initialization

#### Caching and Performance
- Multi-level cache behavior
- Memory usage patterns
- Loading time requirements
- Cache invalidation scenarios

## ItemDataLoader Specific Testing Strategy

### Unit Test Coverage Requirements

#### Core Loading Functions (100% Coverage Required)

**loadAllItems()**
```typescript
describe('loadAllItems', () => {
  // Success scenarios
  it('should load all items from all categories with caching')
  it('should return cached result on subsequent calls')
  it('should aggregate items correctly across categories')
  
  // Error scenarios  
  it('should handle individual item loading failures gracefully')
  it('should throw descriptive error when index loading fails')
  
  // Performance scenarios
  it('should complete within 500ms performance requirement')
  it('should cache results for performance optimization')
});
```

**loadItem(itemId)**
```typescript
describe('loadItem', () => {
  // Success scenarios
  it('should load specific item by ID with correct type conversion')
  it('should return cached item on subsequent calls')
  it('should handle special character IDs ("!!!!!", "*bun*")')
  
  // Error scenarios
  it('should throw descriptive error for non-existent item ID')
  it('should handle malformed JSON gracefully')
  it('should validate required fields presence')
  
  // Edge cases
  it('should handle empty aliases and tags arrays')
  it('should parse complex interaction conditions correctly')
});
```

**getItemsByCategory(category)**
```typescript
describe('getItemsByCategory', () => {
  // Success scenarios
  it('should load all items from treasures category (119 items)')
  it('should load all items from tools category (86 items)')
  it('should handle empty category gracefully')
  
  // Error scenarios
  it('should throw descriptive error for invalid category')
  it('should continue loading despite individual item failures')
  
  // Caching scenarios
  it('should cache category results independently')
  it('should not invalidate other category caches')
});
```

#### Type Conversion Functions (100% Coverage Required)

**parseItemType(typeString)**
```typescript
describe('parseItemType', () => {
  // Valid enum conversion
  it('should convert "TOOL" string to ItemType.TOOL enum')
  it('should convert "WEAPON" string to ItemType.WEAPON enum')
  it('should convert "CONTAINER" string to ItemType.CONTAINER enum')
  it('should convert "TREASURE" string to ItemType.TREASURE enum')
  
  // Error scenarios
  it('should throw error for invalid type string')
  it('should provide descriptive error message with invalid value')
  
  // Case sensitivity
  it('should handle exact case matching requirement')
});
```

**parseCondition(condition)**
```typescript
describe('parseCondition', () => {
  // Negation parsing
  it('should parse "!state.open" to ["not", "state.open"]')
  it('should parse "!inventory.hasKey" to ["not", "inventory.hasKey"]')
  
  // Direct conditions
  it('should parse "state.open" to ["state.open"]')
  it('should parse "flags.doorUnlocked" to ["flags.doorUnlocked"]')
  
  // Edge cases
  it('should handle empty condition string')
  it('should handle malformed condition syntax')
});
```

**parseEffect(effect)**
```typescript
describe('parseEffect', () => {
  // Assignment parsing
  it('should parse "state.open = true" to ["set", "state.open", "true"]')
  it('should parse "state.open = false" to ["set", "state.open", "false"]')
  it('should parse "flags.solved = true" to ["set", "flags.solved", "true"]')
  
  // Direct effects
  it('should parse simple effect strings to single-element arrays')
  
  // Edge cases
  it('should handle complex assignment expressions')
  it('should handle malformed assignment syntax')
});
```

#### Validation Functions (100% Coverage Required)

**validateItemData(data)**

⚠️ **Important**: Check what validation the implementation ACTUALLY performs!
- The actual implementation may only check field presence, not value validity
- Don't test for validation that doesn't exist (e.g., positive weight checks)
- Verify exact error messages in the implementation

```typescript
describe('validateItemData', () => {
  // Required field validation
  it('should pass validation with complete valid ItemData')
  it('should throw error for missing required field "id"')
  it('should throw error for missing required field "name"')
  it('should throw error for missing required field "type"')
  it('should throw error for missing required field "examineText"')  // Often forgotten!
  // ... test all 15 required fields
  
  // Type validation
  it('should throw error for non-string id field')
  it('should throw error for non-array aliases field')
  it('should throw error for non-array tags field')
  it('should throw error for non-array interactions field')
  
  // Edge cases
  it('should allow empty arrays for optional array fields')
  it('should allow empty objects for optional object fields')
});
```

### Integration Test Coverage Requirements

#### Real Data Loading Tests

**Category-Based Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/treasures/
describe('Treasures Category Integration', () => {
  it('should load all 119 treasure items successfully')
  it('should validate all treasure items have correct structure') 
  it('should verify treasure-specific properties')
  it('should handle category vs type mismatches correctly')
});

// testing/data_loaders/item_data_loader/integration_tests/tools/
describe('Tools Category Integration', () => {
  it('should load all 86 tool items successfully')
  it('should handle lamp item with light source properties')
  it('should validate tool interaction patterns')
});

// Similar for containers/, weapons/, consumables/
```

**Full Dataset Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/full_dataset.test.ts
describe('Full Dataset Integration', () => {
  it('should load all 214 items across all categories')
  it('should verify total count matches index.json')
  it('should validate all enum values are correct')
  it('should complete full load within performance requirements')
  it('should use memory within acceptable limits')
});
```

**Cross-Category Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/cross_category.test.ts
describe('Cross-Category Integration', () => {
  it('should handle weapons in tools category correctly')
  it('should handle treasures with TOOL type correctly')
  it('should validate category vs type relationships')
  it('should support both category and type-based queries')
});
```

### Test Data Organization

#### Mock Data for Unit Tests

**Mock Factory Pattern**
```typescript
// testing/utils/mock_factories.ts
export function createMockItemData(overrides?: Partial<ItemData>): ItemData {
  return {
    id: 'test_item',
    name: 'Test Item',
    description: 'A test item for unit testing',
    examineText: 'You see a test item.',
    aliases: ['test', 'item'],
    type: 'TOOL',
    portable: true,
    visible: true,
    weight: 10,
    size: 'MEDIUM',
    initialState: {},
    tags: ['test'],
    properties: {},
    interactions: [],
    initialLocation: 'unknown',
    ...overrides
  };
}

export function createMockIndexData(overrides?: Partial<ItemIndexData>): ItemIndexData {
  return {
    categories: {
      'test_category': ['test_category/test_item.json']
    },
    total: 1,
    lastUpdated: '2024-06-25T00:00:00Z',
    ...overrides
  };
}
```

**Edge Case Test Data**
```typescript
// testing/data_loaders/item_data_loader/test_data/edge_cases/
export const SPECIAL_CHARACTER_ITEMS = {
  exclamation: createMockItemData({ id: '!!!!!' }),
  asterisk: createMockItemData({ id: '*bun*' }),
  unicode: createMockItemData({ id: 'tëst_itém' })
};

export const BOUNDARY_CONDITION_ITEMS = {
  empty_arrays: createMockItemData({ 
    aliases: [], 
    tags: [], 
    interactions: [] 
  }),
  maximum_weight: createMockItemData({ weight: Number.MAX_SAFE_INTEGER }),
  empty_strings: createMockItemData({ 
    name: '', 
    description: '', 
    examineText: '' 
  })
};
```

#### Integration Test Data Strategy

**Real File Access Pattern**
```typescript
// Integration tests use actual data files
const ACTUAL_DATA_PATH = 'data/items/';

describe('Real Data Integration', () => {
  let loader: ItemDataLoader;
  
  beforeEach(() => {
    loader = new ItemDataLoader(ACTUAL_DATA_PATH);
  });
  
  it('should load actual lamp item', async () => {
    const lamp = await loader.loadItem('lamp');
    expect(lamp.type).toBe(ItemType.TOOL);
    expect(lamp.size).toBe(Size.MEDIUM);
    expect(lamp.weight).toBe(15);
  });
});
```

### Performance Testing Patterns

#### Loading Performance Tests

**Performance Benchmarks**
```typescript
describe('Performance Requirements', () => {
  it('should load single item within 10ms', async () => {
    const start = performance.now();
    await loader.loadItem('lamp');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
  
  it('should load category within 100ms', async () => {
    const start = performance.now();
    await loader.getItemsByCategory('treasures');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
  
  it('should load all items within 500ms', async () => {
    const start = performance.now();
    await loader.loadAllItems();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

#### Memory Usage Tests

**Cache Memory Testing**
```typescript
describe('Memory Usage', () => {
  it('should not exceed memory limits with full dataset', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    await loader.loadAllItems();
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not use more than 50MB for full dataset
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
  
  it('should release memory when cache is cleared', async () => {
    await loader.loadAllItems();
    const withCacheMemory = process.memoryUsage().heapUsed;
    
    // Clear cache (if method available)
    // loader.clearCache();
    
    // Force garbage collection
    if (global.gc) global.gc();
    
    const afterClearMemory = process.memoryUsage().heapUsed;
    expect(afterClearMemory).toBeLessThan(withCacheMemory);
  });
});
```

### Error Handling Test Patterns

#### Critical Learning: Use Mixed Mocks for Complex Scenarios
When testing both successful file reads and errors in the same test, use `mockMixedFileReads`:

```typescript
// DON'T DO THIS - Second mock overwrites the first!
testHelper.mockMultipleFileReads({ 'index.json': mockIndex });
testHelper.mockFileReadError('error.json', new Error());

// DO THIS - Single mock handles both cases
testHelper.mockMixedFileReads(
  { 'index.json': mockIndex },
  { 'error.json': new Error('File not found') }
);
```

#### Filesystem Error Scenarios

**File System Mocking for Errors**
```typescript
import { readFile } from 'fs/promises';
jest.mock('fs/promises');
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('File System Error Handling', () => {
  it('should handle file not found gracefully', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));
    
    await expect(loader.loadItem('nonexistent'))
      .rejects.toThrow('Failed to load item from');
  });
  
  it('should handle permission errors gracefully', async () => {
    mockReadFile.mockRejectedValue(new Error('EACCES: permission denied'));
    
    await expect(loader.loadAllItems())
      .rejects.toThrow('Failed to load item index');
  });
  
  it('should handle JSON parse errors gracefully', async () => {
    mockReadFile.mockResolvedValue('invalid json content');
    
    await expect(loader.loadItem('test'))
      .rejects.toThrow('Failed to load item from');
  });
});
```

#### Data Validation Error Scenarios

**Invalid Data Testing**
```typescript
describe('Data Validation Errors', () => {
  it('should provide specific error for invalid item type', async () => {
    const invalidItem = createMockItemData({ type: 'INVALID_TYPE' });
    mockReadFile.mockResolvedValue(JSON.stringify(invalidItem));
    
    await expect(loader.loadItem('test'))
      .rejects.toThrow('Invalid item type: INVALID_TYPE');
  });
  
  it('should provide specific error for invalid size', async () => {
    const invalidItem = createMockItemData({ size: 'INVALID_SIZE' });
    mockReadFile.mockResolvedValue(JSON.stringify(invalidItem));
    
    await expect(loader.loadItem('test'))
      .rejects.toThrow('Invalid item size: INVALID_SIZE');
  });
  
  it('should handle missing required fields', async () => {
    const invalidItem = { name: 'Test' }; // Missing required fields
    mockReadFile.mockResolvedValue(JSON.stringify(invalidItem));
    
    await expect(loader.loadItem('test'))
      .rejects.toThrow('Item data missing required field');
  });
});
```

### Caching Test Patterns

#### Multi-Level Cache Testing

**Cache Behavior Validation**
```typescript
describe('Caching Behavior', () => {
  it('should cache individual items correctly', async () => {
    const spy = jest.spyOn(loader as any, 'loadItemFromFile');
    
    // First load - should hit file system
    await loader.loadItem('lamp');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Second load - should hit cache
    await loader.loadItem('lamp');
    expect(spy).toHaveBeenCalledTimes(1); // No additional calls
  });
  
  it('should cache categories independently', async () => {
    const spy = jest.spyOn(loader as any, 'loadItemFromFile');
    
    await loader.getItemsByCategory('treasures');
    const treasureCalls = spy.mock.calls.length;
    
    await loader.getItemsByCategory('tools');
    const toolCalls = spy.mock.calls.length - treasureCalls;
    
    // Second load of treasures should not reload files
    await loader.getItemsByCategory('treasures');
    expect(spy.mock.calls.length).toBe(treasureCalls + toolCalls);
  });
  
  it('should maintain cache consistency across different access patterns', async () => {
    // Load via category
    const categoryItems = await loader.getItemsByCategory('tools');
    const lampFromCategory = categoryItems.find(item => item.id === 'lamp');
    
    // Load individual item
    const lampIndividual = await loader.loadItem('lamp');
    
    // Should be the same object reference (cached)
    expect(lampFromCategory).toBe(lampIndividual);
  });
});
```

### Test Execution and CI Integration

#### Test Script Configuration

**Jest Configuration for DataLoaders**
```typescript
// jest.config.dataloader.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/testing/data_loaders'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/data_loaders/**/*.ts',
    '!src/data_loaders/**/*.d.ts'
  ],
  coverageThreshold: {
    'src/data_loaders/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  setupFilesAfterEnv: ['<rootDir>/testing/utils/test_setup.ts']
};
```

#### CI Pipeline Integration

**Automated Testing Workflow**
```yaml
# .github/workflows/dataloader-tests.yml
name: DataLoader Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:dataloader:unit
      - run: npm run coverage:dataloader

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:dataloader:integration
```

### Key Takeaways for Writing Better Tests

1. **Always Read the Implementation First**: Don't assume what the code does - verify it
2. **Use Complete Mock Data**: Include ALL required fields to avoid validation errors
3. **Implement Flexible Path Matching**: Handle various path formats in mock systems
4. **Ensure Object Identity When Required**: Use proper caching for reference equality
5. **Match Error Messages Exactly**: Check the actual error strings in implementation
6. **Understand JavaScript/TypeScript Behavior**: Arrays are objects, strict mode affects property operations
7. **Set Realistic Performance Expectations**: 2x improvement is more realistic than 10x

For detailed examples and patterns, see the [Unit Test Best Practices](./unit-test-best-practices.md) document.

This comprehensive DataLoader testing approach ensures data integrity, performance, and reliability while maintaining the strict quality standards required for authentic Zork recreation.