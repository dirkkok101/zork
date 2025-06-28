# ItemDataLoader Documentation

## Overview

The `ItemDataLoader` class is a core component of the DataLoader layer in the 4-layer architecture. It provides type-safe, validated loading of game items from JSON data files with **stateless architecture** and comprehensive error handling, following the **minimal interface pattern**.

## Purpose and Scope

### Primary Responsibilities
- Load and validate 214 item JSON files in flat structure (no categories)
- Convert raw JSON data to type-safe TypeScript interfaces
- Provide **single-method interface** for the Services layer
- Parse flag-based conditions and effects for game logic
- Stateless file I/O operations without caching

### Architecture Position
```
UI Layer
  ↓
Commands Layer  
  ↓
Services Layer ← ItemDataLoader (DataLoader Layer)
  ↓
Data Files (JSON)
```

## Minimal Interface Pattern

### Interface Design Philosophy
The `IItemDataLoader` follows a **minimal interface pattern** with only essential methods:

```typescript
export interface IItemDataLoader {
    /**
     * Load all items from flat structure.
     * Performs fresh file I/O on each call (no caching).
     * @returns Promise resolving to array of all 214 items
     */
    loadAllItems(): Promise<Item[]>;
}
```

### Rationale for Minimal Interface
- **Single Responsibility**: One method, one clear purpose
- **Services Layer Filtering**: Query operations (by type, location) handled by Services
- **Stateless Architecture**: No caching means no need for cache management methods
- **Consistent Pattern**: All data loaders follow the same minimal interface
- **Testing Simplicity**: Only one public method to test thoroughly

## Data Structure and Organization

### Item Storage (214 total items)
Items are stored in a **flat file structure** with individual JSON files:
- All items in single `data/items/` directory
- No hierarchical category folders
- Indexed by `index.json` file containing array of filenames

### Item Type Distribution (by actual type property)
- **TOOL** (164 items): Interactive utility objects, weapons, treasures, consumables
- **CONTAINER** (36 items): Storage objects (bags, boxes, chests)
- **FOOD** (7 items): Consumable food items
- **WEAPON** (5 items): Combat items (weapons with weapon type)
- **LIGHT_SOURCE** (2 items): Items that provide illumination
- **TREASURE** (0 items): No items use this type in current data

### Type System Architecture

#### Raw Data Interface (`ItemData`)
Represents the exact JSON file structure:
```typescript
interface ItemData {
  id: string;
  name: string;
  type: string;           // Raw string from JSON
  size: string;           // Raw string from JSON  
  interactions: ItemInteractionData[];
  // ... other fields
}
```

#### Runtime Interface (`Item`)
Type-safe interface with converted enums:
```typescript
interface Item {
  id: string;
  name: string;
  type: ItemType;         // Converted enum
  size: Size;             // Converted enum
  interactions: ItemInteraction[];
  state: Record<string, any>;      // Runtime state
  flags: Record<string, boolean>;  // Game flags
  // ... other fields
}
```

## Flag-Based Condition System

### Condition Parsing
Converts string conditions to flag-based arrays:
```typescript
// Input: "!state.open"
// Output: ["not", "state.open"]

// Input: "state.open" 
// Output: ["state.open"]
```

### Effect Parsing
Converts string effects to flag-based arrays:
```typescript
// Input: "state.open = true"
// Output: ["set", "state.open", "true"]

// Input: "state.open = false"
// Output: ["set", "state.open", "false"]
```

### Integration with Game Logic
The Services layer can use these parsed conditions:
```typescript
// Service layer pseudocode
const canExecute = conditionService.evaluate(interaction.condition, gameState);
if (canExecute) {
  effectService.apply(interaction.effect, gameState);
}
```

## API Documentation

### Core Loading Method

#### `loadAllItems(): Promise<Item[]>`
The **only public method** in the minimal interface. Loads all 214 items from flat structure. Each call performs fresh file I/O operations.

```typescript
const loader = new ItemDataLoader();
const allItems = await loader.loadAllItems();
console.log(`Loaded ${allItems.length} items`); // 214

// Services layer handles filtering
const tools = allItems.filter(item => item.type === ItemType.TOOL);
const containers = allItems.filter(item => item.type === ItemType.CONTAINER);
const lightSources = allItems.filter(item => item.type === ItemType.LIGHT_SOURCE);
```

### Removed Methods (Services Layer Responsibility)
The following methods were **removed from the interface** to follow the minimal pattern:

- ❌ `loadItem(itemId: string)` → Use Services layer + `loadAllItems()`
- ❌ `getItemsByType(type: ItemType)` → Use Services layer + `loadAllItems()` + filter
- ❌ `getItemsByLocation(location: string)` → Use Services layer + `loadAllItems()` + filter
- ❌ `getTotalCount()` → Use `loadAllItems().length`

### Services Layer Integration Pattern
```typescript
// ItemService handles complex queries using loadAllItems()
class ItemService {
  constructor(private itemLoader: IItemDataLoader) {}
  
  async getItem(itemId: string): Promise<Item | null> {
    const allItems = await this.itemLoader.loadAllItems();
    return allItems.find(item => item.id === itemId) || null;
  }
  
  async getItemsByType(type: ItemType): Promise<Item[]> {
    const allItems = await this.itemLoader.loadAllItems();
    return allItems.filter(item => item.type === type);
  }
  
  async getItemsByLocation(location: string): Promise<Item[]> {
    const allItems = await this.itemLoader.loadAllItems();
    return allItems.filter(item => item.initialLocation === location);
  }
}
```

## Error Handling and Validation

### File-Level Validation
- JSON syntax validation
- Required field presence checking
- Type validation for all fields
- Enum value validation

### Graceful Degradation
```typescript
// Individual item failures don't crash bulk loading
const allItems = await loader.loadAllItems();
// Logs errors for failed items but continues with successful ones
```

### Comprehensive Error Messages
```typescript
try {
  await loader.loadAllItems();
} catch (error) {
  // "Failed to load item index: ENOENT: no such file"
  // "Failed to load item lamp.json: Invalid JSON syntax"
}
```

## Performance Considerations

### Stateless Architecture

#### No Caching Strategy
The ItemDataLoader follows a **stateless design** with no internal caching:
- Each method call performs fresh file I/O operations
- No memory overhead from cached data
- Consistent behavior across all calls
- Thread-safe by design

### File I/O Performance Characteristics

#### Single Method Design
- `loadAllItems()`: Reads index.json + 214 individual item files
- All filtering operations handled by Services layer after loading
- Consistent performance profile for all operations

### Performance Trade-offs

#### Benefits of Stateless Design
- No memory usage growth over time
- Predictable performance characteristics
- Always returns fresh data from disk
- Simple debugging and testing

#### Performance Implications
- Higher I/O overhead for repeated operations
- No performance benefit from repeated calls
- Services layer can implement caching if needed

## Testing Strategy

### Unit Testing Pattern
Following the minimal interface pattern, testing focuses on the single public method:

```typescript
describe('ItemDataLoader.loadAllItems()', () => {
  // Success scenarios
  it('should load all 214 items successfully');
  it('should return consistent results on subsequent calls');
  it('should handle stateless behavior correctly');
  
  // Error scenarios  
  it('should handle index loading failures gracefully');
  it('should handle individual item loading failures');
  
  // Performance scenarios
  it('should complete within performance requirements');
  it('should not cache results between calls');
});
```

### Integration Testing Pattern
```typescript
// Real data testing with actual files
describe('ItemDataLoader Integration', () => {
  it('should load all 214 real items');
  it('should validate type distribution matches documentation');
  it('should handle real item structures correctly');
  it('should performance test with actual file I/O');
});
```

### Private Method Testing
```typescript
// Test critical conversion logic through type assertions
describe('Private Method Testing', () => {
  it('should test convertItemDataToItem via type assertion');
  it('should test parseCondition logic');
  it('should test parseEffect logic');
  it('should test validateItemData logic');
});
```

## Integration Patterns

### With Services Layer
```typescript
// Services layer provides the query interface that was removed from DataLoader
class ItemService {
  constructor(private itemLoader: IItemDataLoader) {}
  
  async getAllItems(): Promise<Item[]> {
    return await this.itemLoader.loadAllItems();
  }
  
  async getItem(itemId: string): Promise<Item | null> {
    const items = await this.getAllItems();
    return items.find(item => item.id === itemId) || null;
  }
  
  // Services layer can implement caching here if needed
  private itemCache?: Item[];
  
  async getCachedItems(): Promise<Item[]> {
    if (!this.itemCache) {
      this.itemCache = await this.itemLoader.loadAllItems();
    }
    return this.itemCache;
  }
}
```

### With SceneDataLoader Pattern
```typescript
// All data loaders follow the same minimal interface pattern
const sceneLoader = new SceneDataLoader();
const itemLoader = new ItemDataLoader();
const monsterLoader = new MonsterDataLoader();

// Services layer coordinates between data loaders
const allScenes = await sceneLoader.loadAllScenes();
const allItems = await itemLoader.loadAllItems();
const allMonsters = await monsterLoader.loadAllMonsters();

// Scene population handled by Services
const sceneItems = allItems.filter(item => item.initialLocation === sceneId);
scene.items = sceneItems.map(item => item.id);
```

## Common Usage Examples

### Loading All Items
```typescript
async function getAllGameItems(): Promise<Item[]> {
  const loader = new ItemDataLoader();
  return await loader.loadAllItems();
}
```

### Item Queries (Services Layer)
```typescript
async function findTreasures(): Promise<Item[]> {
  const allItems = await itemLoader.loadAllItems();
  return allItems.filter(item => 
    item.tags.includes('treasure') || 
    item.type === ItemType.TREASURE
  );
}

async function getContainersInRoom(roomId: string): Promise<Item[]> {
  const allItems = await itemLoader.loadAllItems();
  return allItems.filter(item => 
    item.type === ItemType.CONTAINER && 
    item.initialLocation === roomId
  );
}
```

### Item Interaction Processing
```typescript
async function processInteraction(itemId: string, command: string): Promise<string> {
  const allItems = await itemLoader.loadAllItems();
  const item = allItems.find(item => item.id === itemId);
  
  if (!item) return "Item not found.";
  
  const interaction = item.interactions.find(i => i.command === command);
  
  if (interaction?.condition) {
    const canExecute = evaluateCondition(interaction.condition, gameState);
    if (!canExecute) return "You can't do that right now.";
  }
  
  if (interaction?.effect) {
    applyEffect(interaction.effect, gameState);
  }
  
  return interaction?.message || "Nothing happens.";
}
```

## Benefits of Minimal Interface Pattern

### Development Benefits
- **Clear Responsibility**: DataLoader loads, Services filter/query
- **Consistent Architecture**: All data loaders follow same pattern
- **Simple Testing**: Only one method to test thoroughly
- **Easy Mocking**: Single method easy to mock in Services tests

### Architectural Benefits
- **Separation of Concerns**: File I/O separate from business logic
- **Flexibility**: Services can implement caching, querying, transformation
- **Maintainability**: Changes to filtering logic don't affect DataLoader
- **Scalability**: Services layer can optimize queries independently

### Testing Benefits
- **Focused Tests**: DataLoader tests only loading, Services tests only logic
- **Clear Boundaries**: Integration vs unit test responsibilities obvious
- **Performance Isolation**: Can test DataLoader I/O separately from query logic
- **Mock Simplicity**: Easy to mock single method in dependent tests

## Future Considerations

### Extensibility Points
- Services layer can add complex querying without changing DataLoader
- Caching strategies implemented at Services level
- Additional data validation can be added to Services
- Performance optimizations handled by Services layer

### Performance Optimization Opportunities
- **Services Layer Caching**: Implement caching at service level for frequently accessed items
- **Lazy Loading**: Services can implement smart loading strategies
- **Query Optimization**: Services can optimize common query patterns
- **Metrics Collection**: Add performance monitoring at Services level

### Architecture Evolution
- DataLoader interface remains stable as Services evolve
- New data sources can be added without changing existing DataLoaders
- Services layer provides abstraction for complex data operations
- Testing strategy scales with additional Services functionality

This minimal interface pattern ensures the ItemDataLoader remains focused on its core responsibility of loading data while enabling flexible, testable, and maintainable query operations at the Services layer.