# Minimal Interface DataLoader Testing Guide

## Overview

This document provides comprehensive testing guidance for DataLoaders following the **minimal interface pattern**. This pattern was adopted after extensive analysis and refactoring to create consistent, maintainable, and testable data loading components.

## Minimal Interface Pattern

### Architecture Overview

All DataLoaders now follow a consistent minimal interface pattern:

```typescript
// ItemDataLoader
export interface IItemDataLoader {
    loadAllItems(): Promise<Item[]>;
}

// SceneDataLoader  
export interface ISceneDataLoader {
    loadAllScenes(): Promise<Scene[]>;
}

// MonsterDataLoader
export interface IMonsterDataLoader {
    loadAllMonsters(): Promise<Monster[]>;
}
```

### Benefits of Minimal Interface

1. **Single Responsibility**: Each DataLoader has one clear purpose - loading data
2. **Consistent Architecture**: All DataLoaders follow identical patterns
3. **Services Layer Separation**: Query/filter operations moved to Services layer
4. **Testing Simplicity**: Only one public method per DataLoader to test
5. **Stateless Design**: No caching or state management in DataLoaders

## Testing Strategy Overview

### Three-Layer Testing Approach

#### 1. Unit Tests (Mocked Data)
- **Purpose**: Test the single public method with controlled data
- **Location**: `testing/data_loaders/*/unit_tests/core_functions/`
- **Focus**: Loading logic, error handling, type conversion
- **Data**: Mock data via jest.mock('fs/promises')

#### 2. Integration Tests (Real Data)
- **Purpose**: Test with actual game data files
- **Location**: `testing/data_loaders/*/integration_tests/`
- **Focus**: Real file I/O, data integrity, performance
- **Data**: Actual JSON files from `data/` directory

#### 3. Private Method Tests (Internal Logic)
- **Purpose**: Test critical internal conversion and validation logic
- **Location**: `testing/data_loaders/*/unit_tests/private_methods/`
- **Focus**: Data transformation, state inference, validation
- **Access**: Type assertions to access private methods

## Unit Testing Pattern

### Core Function Testing

Each DataLoader has exactly **one public method** to test:

```typescript
describe('ItemDataLoader.loadAllItems()', () => {
  let loader: ItemDataLoader;
  let testHelper: ItemDataLoaderTestHelper;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    testHelper = new ItemDataLoaderTestHelper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success scenarios', () => {
    it('should load all items from index successfully');
    it('should return fresh array on subsequent calls (stateless)');
    it('should handle empty dataset gracefully');
    it('should continue loading despite individual item failures');
  });

  describe('Error scenarios', () => {
    it('should throw error when index loading fails');
    it('should handle malformed index JSON');
    it('should log errors for individual item failures');
  });

  describe('Performance', () => {
    it('should load within performance requirements');
    it('should handle large datasets efficiently');
    it('should not cache results between calls');
  });

  describe('Data integrity', () => {
    it('should preserve order from index');
    it('should apply all type conversions correctly');
  });
});
```

### Key Testing Patterns

#### Stateless Behavior Validation
```typescript
it('should return fresh objects (not references)', async () => {
  const items1 = await loader.loadAllItems();
  const items2 = await loader.loadAllItems();
  
  // Same data, different objects (stateless)
  expect(items1).toEqual(items2);     // Data equality
  expect(items1).not.toBe(items2);    // Different references
  expect(items1[0]).not.toBe(items2[0]); // Different item references
});
```

#### Error Handling Testing
```typescript
it('should continue loading despite individual failures', async () => {
  const validItem1 = ItemDataFactory.createMockItem({ id: 'valid1' });
  const validItem2 = ItemDataFactory.createMockItem({ id: 'valid2' });
  
  testHelper.mockMixedFileReads(
    {
      'index.json': createMockIndex(['valid1', 'invalid', 'valid2']),
      'valid1.json': validItem1,
      'valid2.json': validItem2
    },
    {
      'invalid.json': new Error('Malformed JSON')
    }
  );

  const result = await loader.loadAllItems();
  
  expect(result).toHaveLength(2); // Only successful items
  expect(result.map(r => r.id)).toEqual(['valid1', 'valid2']);
});
```

## Integration Testing Pattern

### Setup Requirements

**CRITICAL**: All integration tests must import setup to access real filesystem:

```typescript
// MUST be first import in integration test files
import '../setup';

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
```

### Real Data Testing Structure

```typescript
describe('ItemDataLoader - Data Integrity Integration', () => {
  let loader: ItemDataLoader;
  
  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new ItemDataLoader('data/items/');
  });

  describe('Real data loading', () => {
    it('should load all 214 items from actual data files', async () => {
      const allItems = await loader.loadAllItems();
      
      expect(allItems.length).toBe(214); // Exact count from real data
      
      // Validate each item has required properties
      allItems.forEach(item => {
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.name).toBe('string');
        expect(Object.values(ItemType)).toContain(item.type);
        expect(Array.isArray(item.interactions)).toBe(true);
      });
    });

    it('should validate actual type distribution', async () => {
      const allItems = await loader.loadAllItems();
      
      // Group items by type
      const itemsByType: Partial<Record<ItemType, any[]>> = {};
      Object.values(ItemType).forEach(type => {
        itemsByType[type] = [];
      });
      
      allItems.forEach(item => {
        if (itemsByType[item.type]) {
          itemsByType[item.type]!.push(item);
        }
      });
      
      // Validate distributions based on real data
      expect((itemsByType[ItemType.TOOL] || []).length).toBe(164);
      expect((itemsByType[ItemType.CONTAINER] || []).length).toBe(36);
      expect((itemsByType[ItemType.FOOD] || []).length).toBe(7);
      expect((itemsByType[ItemType.WEAPON] || []).length).toBe(5);
      expect((itemsByType[ItemType.LIGHT_SOURCE] || []).length).toBe(2);
      expect((itemsByType[ItemType.TREASURE] || []).length).toBe(0);
    });
  });

  describe('Performance with real data', () => {
    it('should load all items within reasonable time', async () => {
      const startTime = Date.now();
      const allItems = await loader.loadAllItems();
      const duration = Date.now() - startTime;
      
      expect(allItems.length).toBe(214);
      expect(duration).toBeLessThan(500); // Should load within 500ms
    });
  });
});
```

### Performance Integration Testing

```typescript
describe('Performance Integration Tests', () => {
  // Helper function to measure execution time
  const measureTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  };

  it('should demonstrate consistent loading performance', async () => {
    const results: { count: number; duration: number }[] = [];
    
    for (let i = 0; i < 3; i++) {
      const { result, duration } = await measureTime(() => loader.loadAllItems());
      results.push({ count: result.length, duration });
    }
    
    // All loads should be consistent
    results.forEach(result => {
      expect(result.count).toBe(214);
      expect(result.duration).toBeLessThan(500);
    });
  });

  it('should handle concurrent loading efficiently', async () => {
    const concurrentLoads = 3;
    const loadPromises = Array.from({ length: concurrentLoads }, () => {
      return measureTime(() => loader.loadAllItems());
    });

    const results = await Promise.all(loadPromises);

    results.forEach(result => {
      expect(result.result.length).toBe(214);
      expect(result.duration).toBeLessThan(1000); // Allow more time for concurrent
    });
  });
});
```

## Private Method Testing Pattern

### Accessing Private Methods

Use type assertions to test critical internal logic:

```typescript
describe('ItemDataLoader Private Methods', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('convertItemDataToItem()', () => {
    it('should convert minimal item data correctly', () => {
      const itemData: ItemData = {
        id: 'test_item',
        name: 'Test Item',
        type: 'TOOL',
        size: 'MEDIUM',
        description: 'A test item',
        examineText: 'You see a test item',
        interactions: [],
        // ... other required fields
      };

      // Access private method using type assertion
      const result = (loader as any).convertItemDataToItem(itemData);

      expect(result.id).toBe('test_item');
      expect(result.name).toBe('Test Item');
      expect(result.type).toBe(ItemType.TOOL);
      expect(result.size).toBe(Size.MEDIUM);
    });
  });

  describe('parseCondition()', () => {
    it('should parse negation conditions correctly', () => {
      const result = (loader as any).parseCondition('!state.open');
      expect(result).toEqual(['not', 'state.open']);
    });

    it('should parse direct conditions correctly', () => {
      const result = (loader as any).parseCondition('state.open');
      expect(result).toEqual(['state.open']);
    });
  });
});
```

### Monster-Specific Private Method Testing

```typescript
describe('MonsterDataLoader Private Methods', () => {
  describe('determineInitialState()', () => {
    it('should prioritize VILLAIN flag over others', () => {
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: true, OVISON: true }
      };

      const result = (loader as any).determineInitialState(monsterData);
      expect(result).toBe(MonsterState.HOSTILE);
    });

    it('should default based on type when no flags', () => {
      const testCases = [
        { type: 'humanoid', expected: MonsterState.IDLE },
        { type: 'creature', expected: MonsterState.WANDERING },
        { type: 'environmental', expected: MonsterState.LURKING }
      ];

      testCases.forEach(({ type, expected }) => {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          type: type as any,
          flags: {}
        };

        const result = (loader as any).determineInitialState(monsterData);
        expect(result).toBe(expected);
      });
    });
  });

  describe('convertMovementPattern()', () => {
    it('should infer patterns from demon names', () => {
      const testCases = [
        { demon: 'ROBBER-DEMON', expected: 'follow' },
        { demon: 'FLEE-DEMON', expected: 'flee' },
        { demon: 'PATROL-DEMON', expected: 'patrol' },
        { demon: 'RANDOM-DEMON', expected: 'random' },
        { demon: 'UNKNOWN-DEMON', expected: 'stationary' }
      ];

      testCases.forEach(({ demon, expected }) => {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: demon
        };

        const result = (loader as any).convertMovementPattern(monsterData);
        expect(result).toBe(expected);
      });
    });
  });
});
```

## Common Testing Patterns

### Mock Data Factory Pattern

```typescript
// testing/utils/mock_factories.ts
export class ItemDataFactory {
  static createMockItem(overrides?: Partial<ItemData>): ItemData {
    return {
      id: 'test_item',
      name: 'Test Item',
      description: 'A test item',
      examineText: 'You see a test item',
      type: 'TOOL',
      size: 'MEDIUM',
      portable: true,
      visible: true,
      weight: 10,
      interactions: [],
      tags: [],
      aliases: [],
      initialState: {},
      properties: {},
      initialLocation: 'unknown',
      ...overrides
    };
  }

  static createMockIndex(items: string[] = ['test_item']): ItemIndex {
    return {
      items: items.map(id => `${id}.json`),
      total: items.length,
      lastUpdated: new Date().toISOString()
    };
  }
}
```

### Test Helper Pattern

```typescript
// testing/utils/test_helpers.ts
export class ItemDataLoaderTestHelper {
  private mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

  mockFileRead(filename: string, content: any): void {
    this.mockReadFile.mockImplementation(async (path: string) => {
      if (path.includes(filename)) {
        return JSON.stringify(content);
      }
      throw new Error(`Unexpected file read: ${path}`);
    });
  }

  mockMultipleFileReads(fileMap: Record<string, any>): void {
    this.mockReadFile.mockImplementation(async (path: string) => {
      for (const [filename, content] of Object.entries(fileMap)) {
        if (path.includes(filename)) {
          return JSON.stringify(content);
        }
      }
      throw new Error(`Unexpected file read: ${path}`);
    });
  }

  mockMixedFileReads(
    successFiles: Record<string, any>,
    errorFiles: Record<string, Error>
  ): void {
    this.mockReadFile.mockImplementation(async (path: string) => {
      for (const [filename, content] of Object.entries(successFiles)) {
        if (path.includes(filename)) {
          return JSON.stringify(content);
        }
      }
      for (const [filename, error] of Object.entries(errorFiles)) {
        if (path.includes(filename)) {
          throw error;
        }
      }
      throw new Error(`Unexpected file read: ${path}`);
    });
  }
}
```

## Test Organization

### Directory Structure

```
testing/data_loaders/item_data_loader/
├── unit_tests/
│   ├── core_functions/
│   │   └── loadAllItems.test.ts          # Main public method
│   └── private_methods/
│       ├── convertItemDataToItem.test.ts  # Data conversion
│       ├── parseCondition.test.ts         # Condition parsing
│       ├── parseEffect.test.ts            # Effect parsing
│       └── validateItemData.test.ts       # Validation logic
├── integration_tests/
│   ├── data_integrity/
│   │   └── all_items_loading.test.ts      # Real data loading
│   ├── performance/
│   │   └── real_data_performance.test.ts  # Performance testing
│   └── setup.ts                           # Real filesystem setup
└── test_data/
    ├── mock_index.json                     # Mock data files
    └── mock_items/
        └── test_item.json
```

### Test File Naming Convention

- **Unit Tests**: `{methodName}.test.ts` (e.g., `loadAllItems.test.ts`)
- **Private Method Tests**: `{privatMethodName}.test.ts` (e.g., `convertItemDataToItem.test.ts`)
- **Integration Tests**: `{functionality}.test.ts` (e.g., `all_items_loading.test.ts`)

## Critical Testing Principles

### 1. Test Only What Exists
```typescript
// ❌ DON'T test methods that don't exist in the interface
describe('loadItem()', () => { // This method doesn't exist anymore
  it('should load single item');
});

// ✅ DO test the actual interface
describe('loadAllItems()', () => {
  it('should load all items and let Services filter');
});
```

### 2. Integration Tests Need Setup
```typescript
// ❌ Missing setup - will fail with mocked fs
import { ItemDataLoader } from '...';

// ✅ Proper setup for real file access
import '../setup';  // MUST be first import
import { ItemDataLoader } from '...';
```

### 3. Stateless Architecture Testing
```typescript
// ✅ Test stateless behavior correctly
expect(result1).toEqual(result2);     // Same data
expect(result1).not.toBe(result2);    // Different objects
```

### 4. Real Data Validation
```typescript
// ✅ Use actual data counts and distributions
expect(items.length).toBe(214);       // Real count
expect(toolItems.length).toBe(164);   // Real distribution
expect(treasureItems.length).toBe(0); // Real data reality
```

## Performance Testing Standards

### Benchmarks by DataLoader

#### ItemDataLoader (214 items)
- Single load: < 500ms
- Concurrent loads: < 1000ms
- Memory usage: < 50MB

#### SceneDataLoader (195 scenes)
- Single load: < 400ms
- Concurrent loads: < 800ms
- Memory usage: < 40MB

#### MonsterDataLoader (9 monsters)
- Single load: < 100ms
- Concurrent loads: < 200ms
- Memory usage: < 5MB

### Performance Test Pattern
```typescript
it('should meet performance requirements', async () => {
  const startTime = Date.now();
  const result = await loader.loadAllItems();
  const duration = Date.now() - startTime;
  
  expect(result.length).toBe(214);
  expect(duration).toBeLessThan(500);
  
  console.log(`Loaded ${result.length} items in ${duration}ms`);
});
```

## Benefits of This Testing Approach

### 1. **Consistent Architecture**
- All DataLoaders tested identically
- Predictable test structure across components
- Easy to onboard new developers

### 2. **Clear Separation of Concerns**
- DataLoader tests focus only on loading
- Services tests focus only on business logic
- Integration tests validate real data

### 3. **Comprehensive Coverage**
- Public interface thoroughly tested
- Critical private methods validated
- Real data integrity verified
- Performance benchmarks established

### 4. **Maintainable Tests**
- Single method to test per DataLoader
- Mock helpers reduce boilerplate
- Real data tests catch regressions

This minimal interface testing approach ensures robust, maintainable, and comprehensive test coverage while maintaining clear architectural boundaries and enabling confident refactoring.