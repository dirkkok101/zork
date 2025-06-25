# Flat Structure Testing Patterns Guide

This guide provides comprehensive testing patterns for working with Zork's flat data structure approach, where all items are loaded via `loadAllItems()` and filtered by type rather than organized in category-based structures.

## Overview

The flat structure approach treats all game items as a single collection that can be filtered by type, rather than pre-organizing them into category-specific collections. This impacts how we write tests, mock data, and verify functionality.

## Core Testing Patterns

### 1. Loading and Filtering Pattern

Instead of loading category-specific collections, tests should use the flat loading approach:

```typescript
// ❌ DON'T: Assume category-based loading
const treasures = await loadTreasures();
const weapons = await loadWeapons();

// ✅ DO: Load all items and filter by type
const allItems = await loadAllItems();
const treasures = allItems.filter(item => item.type === ItemType.TREASURE);
const weapons = allItems.filter(item => item.type === ItemType.WEAPON);
```

### 2. Type-Based Testing Using ItemType Enum

Tests should leverage the ItemType enum for type safety and clarity:

```typescript
import { ItemType } from '../../src/types/ItemTypes';

describe('Item Type Filtering', () => {
  it('should filter items by type correctly', async () => {
    const items = await loadAllItems();
    
    // Test each item type
    const typeGroups = {
      treasures: items.filter(item => item.type === ItemType.TREASURE),
      tools: items.filter(item => item.type === ItemType.TOOL),
      weapons: items.filter(item => item.type === ItemType.WEAPON),
      containers: items.filter(item => item.type === ItemType.CONTAINER),
      consumables: items.filter(item => item.type === ItemType.CONSUMABLE)
    };
    
    // Verify each group
    expect(typeGroups.treasures.every(item => item.type === ItemType.TREASURE)).toBe(true);
    expect(typeGroups.tools.every(item => item.type === ItemType.TOOL)).toBe(true);
  });
});
```

### 3. Mock Factory Patterns for Flat Structure

Create mock factories that generate items with proper type assignments:

```typescript
// Mock factory for creating test items
export const createMockItem = (overrides: Partial<Item> = {}): Item => {
  const baseItem: Item = {
    id: 'mock_item',
    name: 'Mock Item',
    description: 'A mock item for testing',
    type: ItemType.TOOL,
    aliases: [],
    properties: {},
    interactions: [],
    conditionals: {},
    location: null,
    state: {}
  };
  
  return { ...baseItem, ...overrides };
};

// Type-specific mock factories
export const createMockTreasure = (overrides: Partial<Item> = {}): Item => {
  return createMockItem({
    type: ItemType.TREASURE,
    properties: {
      value: 10,
      is_treasure: true
    },
    ...overrides
  });
};

export const createMockWeapon = (overrides: Partial<Item> = {}): Item => {
  return createMockItem({
    type: ItemType.WEAPON,
    properties: {
      damage: 5,
      is_weapon: true
    },
    ...overrides
  });
};
```

### 4. Integration Test Setup Requirements

Integration tests need to handle the flat structure properly:

```typescript
describe('Item Service Integration', () => {
  let itemService: ItemService;
  let mockLoadAllItems: jest.Mock;
  
  beforeEach(() => {
    // Mock the flat loader
    mockLoadAllItems = jest.fn().mockResolvedValue([
      createMockTreasure({ id: 'diamond' }),
      createMockWeapon({ id: 'sword' }),
      createMockTool({ id: 'lamp' })
    ]);
    
    // Inject the mock
    itemService = new ItemService(mockLoadAllItems);
  });
  
  it('should handle type-based queries', async () => {
    const treasures = await itemService.getItemsByType(ItemType.TREASURE);
    expect(treasures).toHaveLength(1);
    expect(treasures[0].id).toBe('diamond');
  });
});
```

## Object Comparison Best Practices

### When to Use .toBe vs .toEqual

Understanding the difference is crucial for flat structure testing:

```typescript
// .toBe - Tests reference equality (same object in memory)
it('should return the same object reference', () => {
  const items = await loadAllItems();
  const item1 = items.find(i => i.id === 'lamp');
  const item2 = items.find(i => i.id === 'lamp');
  
  expect(item1).toBe(item2); // Same reference from same array
});

// .toEqual - Tests value equality (same content)
it('should have equal content', () => {
  const item1 = createMockItem({ id: 'lamp' });
  const item2 = createMockItem({ id: 'lamp' });
  
  expect(item1).toEqual(item2); // Different objects, same content
  expect(item1).not.toBe(item2); // Different references
});

// Common pattern for testing filtered results
it('should filter without mutating original', () => {
  const items = await loadAllItems();
  const treasures = items.filter(i => i.type === ItemType.TREASURE);
  
  // Verify filtering doesn't mutate
  expect(items.length).toBeGreaterThan(treasures.length);
  
  // Verify filtered items are same references
  const firstTreasure = treasures[0];
  const sameInOriginal = items.find(i => i.id === firstTreasure.id);
  expect(firstTreasure).toBe(sameInOriginal);
});
```

## Performance Testing with Stateless Design

Since the flat structure uses a stateless design without caching, tests should not assume caching behavior:

```typescript
describe('Performance with stateless design', () => {
  it('should handle multiple loads efficiently', async () => {
    // Don't assume caching (stateless design)
    const startTime = Date.now();
    
    // Multiple loads
    await loadAllItems();
    await loadAllItems();
    await loadAllItems();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Test reasonable performance with stateless design
    expect(duration).toBeLessThan(1000); // Reasonable limit
  });
  
  it('should filter large datasets efficiently', async () => {
    const items = await loadAllItems();
    
    const startTime = performance.now();
    const treasures = items.filter(i => i.type === ItemType.TREASURE);
    const endTime = performance.now();
    
    // Filtering should be fast regardless of data size
    expect(endTime - startTime).toBeLessThan(10);
  });
});
```

## Data Quality Reality Handling

Tests must handle real-world data quality issues:

### Handling Duplicates

```typescript
describe('Duplicate handling', () => {
  it('should handle duplicate IDs gracefully', async () => {
    // Mock data with duplicates
    mockLoadAllItems.mockResolvedValue([
      createMockItem({ id: 'lamp' }),
      createMockItem({ id: 'lamp' }), // Duplicate
      createMockItem({ id: 'sword' })
    ]);
    
    const items = await loadAllItems();
    
    // Document the behavior (don't assume deduplication)
    expect(items.length).toBe(3); // All items returned
    
    // Test how your service handles this
    const lampItems = items.filter(i => i.id === 'lamp');
    expect(lampItems.length).toBe(2);
  });
});
```

### Handling Empty Arrays

```typescript
describe('Empty data handling', () => {
  it('should handle empty item arrays', async () => {
    mockLoadAllItems.mockResolvedValue([]);
    
    const items = await loadAllItems();
    const treasures = items.filter(i => i.type === ItemType.TREASURE);
    
    expect(items).toEqual([]);
    expect(treasures).toEqual([]);
    expect(() => items[0].id).toThrow(); // No assumption of data
  });
  
  it('should handle items with empty properties', async () => {
    mockLoadAllItems.mockResolvedValue([
      createMockItem({ 
        aliases: [],
        interactions: [],
        properties: {}
      })
    ]);
    
    const items = await loadAllItems();
    expect(items[0].aliases).toEqual([]);
    expect(items[0].interactions).toEqual([]);
  });
});
```

## Real vs Mocked Data Testing Approaches

### Testing with Real Data

```typescript
describe('Real data integration tests', () => {
  // Use real data for smoke tests
  it('should load actual game items', async () => {
    const items = await loadAllItems(); // Real loader
    
    // Verify data structure, not specific counts
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    
    // Verify all items have required fields
    items.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('type');
      expect(Object.values(ItemType)).toContain(item.type);
    });
  });
  
  // Test known items exist
  it('should contain known game items', async () => {
    const items = await loadAllItems();
    const itemIds = items.map(i => i.id);
    
    // Test for known important items
    expect(itemIds).toContain('lamp');
    expect(itemIds).toContain('sword');
    expect(itemIds).toContain('trophy_case');
  });
});
```

### Testing with Mocked Data

```typescript
describe('Mocked data unit tests', () => {
  beforeEach(() => {
    // Controlled test data
    const mockItems = [
      createMockTreasure({ id: 'diamond', properties: { value: 100 } }),
      createMockWeapon({ id: 'sword', properties: { damage: 10 } }),
      createMockTool({ id: 'lamp', state: { is_lit: false } })
    ];
    
    mockLoadAllItems.mockResolvedValue(mockItems);
  });
  
  it('should calculate total treasure value', async () => {
    const service = new ItemService(mockLoadAllItems);
    const totalValue = await service.calculateTreasureValue();
    
    expect(totalValue).toBe(100); // Predictable with mocks
  });
});
```

## Testing Service Layer with Flat Structure

```typescript
class ItemService {
  constructor(private loader: () => Promise<Item[]>) {}
  
  async getItemsByType(type: ItemType): Promise<Item[]> {
    const allItems = await this.loader();
    return allItems.filter(item => item.type === type);
  }
  
  async findItemById(id: string): Promise<Item | undefined> {
    const allItems = await this.loader();
    return allItems.find(item => item.id === id);
  }
}

describe('ItemService with flat structure', () => {
  it('should filter by type efficiently', async () => {
    const service = new ItemService(loadAllItems);
    
    const treasures = await service.getItemsByType(ItemType.TREASURE);
    expect(treasures.every(i => i.type === ItemType.TREASURE)).toBe(true);
  });
});
```

## Common Testing Pitfalls to Avoid

### 1. Don't Assume Category Organization

```typescript
// ❌ BAD: Assumes category structure exists
expect(data.treasures).toBeDefined();
expect(data.weapons.length).toBe(5);

// ✅ GOOD: Work with flat structure
const treasures = items.filter(i => i.type === ItemType.TREASURE);
expect(treasures.length).toBeGreaterThan(0);
```

### 2. Don't Assume Deduplication

```typescript
// ❌ BAD: Assumes system deduplicates
const items = await loadAllItems();
const uniqueIds = new Set(items.map(i => i.id));
expect(uniqueIds.size).toBe(items.length);

// ✅ GOOD: Handle duplicates explicitly
const items = await loadAllItems();
const itemMap = new Map<string, Item>();
items.forEach(item => {
  if (!itemMap.has(item.id)) {
    itemMap.set(item.id, item);
  }
});
```

### 3. Don't Assume Caching Behavior

```typescript
// ❌ BAD: Assumes caching (stateless design doesn't cache)
const items1 = await loadAllItems();
const items2 = await loadAllItems();
expect(items1).toBe(items2); // Will fail with stateless design

// ✅ GOOD: Test data equality, not object identity
const items1 = await loadAllItems();
const items2 = await loadAllItems();
expect(items1).toEqual(items2); // Tests content equality
```

## Summary

Testing with a flat structure requires:
1. Loading all items and filtering by type
2. Using proper object comparison methods
3. Handling data quality issues gracefully
4. Not assuming caching (stateless design) or deduplication
5. Creating appropriate mock factories
6. Testing both with real and mocked data appropriately

This approach provides flexibility while maintaining testability and type safety throughout the codebase.