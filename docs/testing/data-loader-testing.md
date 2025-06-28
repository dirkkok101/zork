# DataLoader Testing Guidelines

## Overview

This document provides specific testing guidelines for the DataLoader layer components, focusing on data integrity, type safety, and performance. DataLoaders are critical to the game's foundation, requiring comprehensive validation and error handling.

**Critical Discoveries from Comprehensive Test Review:**
- TREASURE type has 0 items in actual dataset (major discovery!)
- TOOL type dominates with 164 items (77% of dataset)
- Total dataset: 214 items across 5 categories
- Category organization ≠ Type organization (treasures category ≠ TREASURE type)
- Integration tests require `import '../setup'` for proper fs access
- .toBe() vs .toEqual() critical for cached vs stateless architectures
- Special character items: "!!!!!" and "*bun*" exist in real data

## DataLoader Testing Philosophy

### Core Responsibilities to Test

1. **Data Integrity**: Ensure loaded data matches source files exactly
2. **Type Safety**: Validate all type conversions and enum mappings
3. **Error Handling**: Test graceful degradation and informative errors
4. **Performance**: Verify loading performance standards (ItemDataLoader is stateless)
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

#### Performance (Stateless Architecture)
- Loading time requirements
- Memory usage patterns
- Consistent performance across calls
- No caching behavior to test (ItemDataLoader is stateless)

## ItemDataLoader Specific Testing Strategy

### Unit Test Coverage Requirements

#### Core Loading Functions (100% Coverage Required)

**loadAllItems()**
```typescript
describe('loadAllItems', () => {
  // Success scenarios
  it('should load all items from all categories correctly')
  it('should return consistent results on subsequent calls')
  it('should aggregate items correctly across categories')
  
  // Error scenarios  
  it('should handle individual item loading failures gracefully')
  it('should throw descriptive error when index loading fails')
  
  // Performance scenarios
  it('should complete within 500ms performance requirement')
  it('should maintain consistent performance across calls')
});
```

**loadItem(itemId)**
```typescript
describe('loadItem', () => {
  // Success scenarios
  it('should load specific item by ID with correct type conversion')
  it('should return equivalent item on subsequent calls')
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

**getItemsByType(type)**
```typescript
describe('getItemsByType', () => {
  // Success scenarios
  it('should load all items of TOOL type (164 items)')
  it('should load all items of CONTAINER type (36 items)')
  it('should load all items of LIGHT_SOURCE type (2 items)')
  it('should return empty array for TREASURE type (0 items)')
  
  // Error scenarios
  it('should handle invalid type enum gracefully')
  it('should continue loading despite individual item failures')
  
  // Performance scenarios
  it('should load all items then filter (stateless - no caching)')
  it('should maintain consistent performance across calls')
});
```

#### Type Conversion Functions (100% Coverage Required)

**Note**: Type conversion functions are tested implicitly through public methods that use them. Private methods like `parseItemType()` are not tested directly but are covered through integration testing.

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

**Type-Based Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/tool_items/
describe('TOOL Type Integration', () => {
  it('should load all 164 TOOL items successfully')
  it('should validate TOOL items have correct structure') 
  it('should handle diverse TOOL subtypes (weapons, treasures, consumables)')
  it('should verify functional behavior over categorization')
});

// testing/data_loaders/item_data_loader/integration_tests/container_items/
describe('CONTAINER Type Integration', () => {
  it('should load all 36 CONTAINER items successfully')
  it('should validate container-specific properties')
  it('should verify storage mechanics')
});

// Similar for LIGHT_SOURCE, WEAPON, FOOD types
```

**Full Dataset Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/full_dataset.test.ts
// CRITICAL: Must import setup for integration tests
import '../setup';

describe('Full Dataset Integration', () => {
  it('should load all 214 items across all categories') // Exact count from data
  it('should verify total count matches index.json')
  it('should validate all enum values are correct')
  it('should complete full load within performance requirements')
  it('should use memory within acceptable limits')
  
  // CRITICAL: Test actual data distribution
  it('should verify actual type distribution', async () => {
    const allItems = await loader.loadAllItems();
    const typeDistribution = allItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    expect(typeDistribution[ItemType.TOOL]).toBe(164); // Dominant type
    expect(typeDistribution[ItemType.TREASURE]).toBe(0); // No items of this type
    expect(typeDistribution[ItemType.CONTAINER]).toBeGreaterThan(0);
    expect(typeDistribution[ItemType.WEAPON]).toBeGreaterThan(0);
    expect(typeDistribution[ItemType.FOOD]).toBeGreaterThan(0);
    expect(typeDistribution[ItemType.LIGHT_SOURCE]).toBeGreaterThan(0);
  });
});
```

**Type Distribution Integration Tests**
```typescript
// testing/data_loaders/item_data_loader/integration_tests/type_distribution.test.ts
describe('Type Distribution Integration', () => {
  it('should verify 164 TOOL items across diverse functions')
  it('should handle weapons classified as TOOL type correctly')
  it('should validate flat file structure organization')
  it('should support type-based queries without categories')
  it('should verify no items use TREASURE type')
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
    items: ['test_item.json'],
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
  
  it('should load items by type within 100ms', async () => {
    const start = performance.now();
    await loader.getItemsByType(ItemType.TOOL);
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

**Memory Usage Testing (Stateless)**
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
  
  // Note: ItemDataLoader is stateless - no cache to clear or test
  // For educational comparison with cached loaders:
  /*
  it('should release memory when cache is cleared', async () => {
    await cachedLoader.loadAllItems();
    const withCacheMemory = process.memoryUsage().heapUsed;
    
    cachedLoader.clearCache(); // Method would exist in cached loader
    
    if (global.gc) global.gc();
    
    const afterClearMemory = process.memoryUsage().heapUsed;
    expect(afterClearMemory).toBeLessThan(withCacheMemory);
  });
  */
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

#### Critical Learning: Integration Test Setup Requirements
Integration tests MUST import setup to access real filesystem:

```typescript
// CRITICAL: Must be first import in integration test files
import '../setup';

// This setup unmocks fs/promises for real file access
// Without this, integration tests will fail with mocked fs
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

### ItemDataLoader Stateless Behavior Test Patterns

#### Stateless Architecture Verification

**ItemDataLoader Stateless Behavior Validation**
```typescript
describe('ItemDataLoader Stateless Behavior', () => {
  it('should perform fresh file I/O on each call', async () => {
    const spy = jest.spyOn(loader as any, 'loadItemFromFile');
    
    // First load - hits file system
    await loader.loadItem('lamp');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Second load - hits file system again (no caching in ItemDataLoader)
    await loader.loadItem('lamp');
    expect(spy).toHaveBeenCalledTimes(2);
  });
  
  it('should always reload index for validation', async () => {
    const spy = jest.spyOn(loader as any, 'loadIndex');
    
    await loader.loadItem('lamp');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Second call should reload index (ItemDataLoader is stateless)
    await loader.loadItem('sword');
    expect(spy).toHaveBeenCalledTimes(2);
  });
  
  // CRITICAL: Object identity testing for ItemDataLoader
  it('should return fresh objects (not references)', async () => {
    const lamp1 = await loader.loadItem('lamp');
    const lamp2 = await loader.loadItem('lamp');
    
    // ItemDataLoader is stateless: use .toEqual() for data equality
    expect(lamp1).toEqual(lamp2); // Same data, different objects
    expect(lamp1).not.toBe(lamp2); // Different object references
    
    // Educational comparison - for cached loaders (different architecture):
    // expect(lamp1).toBe(lamp2); // Same object reference in cached systems
  });
  
  it('should maintain consistent behavior across bulk operations', async () => {
    const spy = jest.spyOn(loader, 'loadAllItems');
    
    // Each call to getItemsByType loads all items fresh (no caching)
    await loader.getItemsByType(ItemType.TOOL);
    await loader.getItemsByType(ItemType.CONTAINER);
    
    expect(spy).toHaveBeenCalledTimes(2);
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
2. **Understand Actual Data Distribution**: TREASURE type has 0 items, TOOL has 164 items
3. **Use Complete Mock Data**: Include ALL required fields to avoid validation errors
4. **Implement Flexible Path Matching**: Handle various path formats in mock systems
5. **Architecture Determines Testing**: ItemDataLoader is stateless (.toEqual() for data equality, not .toBe())
6. **Integration Tests Need Setup**: Import '../setup' for real filesystem access
7. **Category ≠ Type**: Different organizational structures in data
8. **Match Error Messages Exactly**: Check the actual error strings in implementation
9. **Understand JavaScript/TypeScript Behavior**: Arrays are objects, strict mode affects property operations
10. **Set Realistic Performance Expectations**: ItemDataLoader is stateless (no caching performance benefits)
11. **Test With Real Data**: Use actual counts (214 total, 164 TOOL, 0 TREASURE)
12. **Handle Special Characters**: Items like "!!!!!" and "*bun*" exist in data

For detailed examples and patterns, see the [Unit Test Best Practices](./unit-test-best-practices.md) document.

This comprehensive DataLoader testing approach ensures data integrity, performance, and reliability while maintaining the strict quality standards required for authentic Zork recreation.

## MonsterDataLoader Specific Additions

### Critical Learnings from MonsterDataLoader Implementation

The MonsterDataLoader implementation revealed crucial insights about real data structure vs assumptions. See [Monster DataLoader Learnings](./monster-data-loader-learnings.md) for comprehensive details.

**Key Discovery**: 67% of monsters don't have `startingSceneId` - environmental and mobile creatures don't have fixed starting locations.

### MonsterDataLoader Testing Patterns

#### Real Data Structure Validation

```typescript
describe('Monster Data Structure Reality', () => {
  it('should handle optional startingSceneId correctly', async () => {
    // Environmental monsters don't have fixed locations
    const grue = await loader.loadMonster('grue');
    expect(grue.startingSceneId).toBeNull();
    expect(grue.currentSceneId).toBeNull();
  });
  
  it('should handle monsters with fixed locations', async () => {
    // Guardian monsters have fixed starting locations
    const thief = await loader.loadMonster('thief');
    expect(thief.startingSceneId).toBe('treasure_room');
    expect(thief.currentSceneId).toBe('treasure_room');
  });
  
  it('should use correct flag patterns from real data', async () => {
    // Real data uses OVISON, not INVISIBLE
    const grue = await loader.loadMonster('grue');
    expect(grue.flags.OVISON).toBe(true);
    expect(grue.flags.INVISIBLE).toBeUndefined();
  });
});
```

#### State Inference Testing

```typescript
describe('State Inference from Real Flags', () => {
  it('should prioritize VILLAIN over OVISON for state', async () => {
    const thief = await loader.loadMonster('thief');
    // Thief has both VILLAIN and OVISON flags
    expect(thief.flags.VILLAIN).toBe(true);
    expect(thief.flags.OVISON).toBe(true);
    // VILLAIN takes precedence
    expect(thief.state).toBe('hostile');
  });
  
  it('should infer lurking from OVISON when no VILLAIN', async () => {
    const grue = await loader.loadMonster('grue');
    expect(grue.flags.OVISON).toBe(true);
    expect(grue.flags.VILLAIN).toBeUndefined();
    expect(grue.state).toBe('lurking');
  });
});
```

#### Combat Strength Reality Testing

```typescript
describe('Real Combat Strength Values', () => {
  it('should load actual combat strengths from data', async () => {
    // Real values discovered through testing
    const thief = await loader.loadMonster('thief');
    expect(thief.combatStrength).toBe(5);
    
    const troll = await loader.loadMonster('troll');
    expect(troll.combatStrength).toBe(2);
    
    const cyclops = await loader.loadMonster('cyclops');
    expect(cyclops.combatStrength).toBe(10000); // Boss-level
  });
  
  it('should handle monsters without combat strength', async () => {
    const grue = await loader.loadMonster('grue');
    expect(grue.combatStrength).toBeUndefined();
  });
});
```

#### Validation Logic Testing

```typescript
describe('Real Data Validation Requirements', () => {
  it('should validate only truly required fields', async () => {
    // startingSceneId is optional in real data
    const minimalValidMonster = {
      id: 'test',
      name: 'Test',
      type: 'environmental',
      description: 'Test monster',
      examineText: 'You see a test monster.',
      inventory: [],
      synonyms: ['test'],
      flags: {},
      properties: {}
      // No startingSceneId - should be valid
    };
    
    // Should not throw validation error
    expect(() => loader.validateMonsterData(minimalValidMonster))
      .not.toThrow();
  });
});
```

### Integration Test Requirements for MonsterDataLoader

#### Critical Setup Pattern

```typescript
// CRITICAL: Must be first import in ALL monster integration tests
import '../setup';

describe('Monster Integration Tests', () => {
  let loader: MonsterDataLoader;
  const ACTUAL_DATA_PATH = 'data/monsters/';

  beforeEach(() => {
    loader = new MonsterDataLoader(ACTUAL_DATA_PATH);
  });
  
  it('should load all 9 real monsters', async () => {
    const monsters = await loader.loadAllMonsters();
    expect(monsters).toHaveLength(9); // Exact count from real data
  });
});
```

#### Real Data Distribution Testing

```typescript
describe('Monster Type Distribution Reality', () => {
  it('should match actual type distribution', async () => {
    const monsters = await loader.loadAllMonsters();
    const typeDistribution = monsters.reduce((acc, monster) => {
      acc[monster.type] = (acc[monster.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Real distribution from data analysis
    expect(typeDistribution).toEqual({
      'humanoid': 5,    // thief, troll, cyclops, gnome_of_zurich, guardian_of_zork
      'creature': 2,    // ghost, volcano_gnome
      'environmental': 2 // grue, vampire_bat
    });
  });
});
```

### Key Principles for Real Data Testing

1. **Always Test Against Real Data**: Integration tests must use actual JSON files
2. **Validate Assumptions Early**: Check real data structure before writing tests
3. **Handle Optional Fields Gracefully**: Don't assume all fields are present
4. **Match Exact Values**: Use actual combat strengths, not assumed ones
5. **Respect Flag Hierarchies**: Test actual state inference logic priority
6. **Document Discoveries**: Record real data patterns vs assumptions

This comprehensive approach ensures DataLoader testing covers both ideal scenarios and real-world data constraints, maintaining authenticity while ensuring robustness.