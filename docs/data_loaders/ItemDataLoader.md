# ItemDataLoader Documentation

## Overview

The `ItemDataLoader` class is a core component of the DataLoader layer in the 4-layer architecture. It provides type-safe, validated loading of game items from JSON data files with stateless architecture and comprehensive error handling.

## Purpose and Scope

### Primary Responsibilities
- Load and validate 214 item JSON files in flat structure (no categories)
- Convert raw JSON data to type-safe TypeScript interfaces
- Provide efficient access patterns for the Services layer
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

## Validated Enum Values

### ItemType Enum
Based on actual data distribution:
```typescript
enum ItemType {
  TOOL = 'TOOL',                    // 164 instances
  CONTAINER = 'CONTAINER',          // 36 instances
  FOOD = 'FOOD',                    // 7 instances
  WEAPON = 'WEAPON',                // 5 instances
  LIGHT_SOURCE = 'LIGHT_SOURCE',    // 2 instances
  TREASURE = 'TREASURE'             // 0 instances (defined but unused)
}
```

### Size Enum
```typescript
enum Size {
  TINY = 'TINY',     
  SMALL = 'SMALL',   
  MEDIUM = 'MEDIUM', 
  LARGE = 'LARGE',   
  HUGE = 'HUGE'      
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

### Core Loading Methods

#### `loadAllItems(): Promise<Item[]>`
Loads all 214 items from flat structure. Each call performs fresh file I/O operations.
```typescript
const loader = new ItemDataLoader();
const allItems = await loader.loadAllItems();
console.log(`Loaded ${allItems.length} items`); // 214
```

#### `loadItem(itemId: string): Promise<Item>`
Loads a specific item by ID with validation.
```typescript
const lamp = await loader.loadItem('lamp');
console.log(lamp.type); // ItemType.LIGHT_SOURCE
console.log(lamp.size); // Size.MEDIUM
```

### Query Methods

#### `getItemsByType(type: ItemType): Promise<Item[]>`
Filters items by type enum. Loads all items fresh from disk and filters client-side.
```typescript
const tools = await loader.getItemsByType(ItemType.TOOL); // 164 items
const containers = await loader.getItemsByType(ItemType.CONTAINER); // 36 items
const lightSources = await loader.getItemsByType(ItemType.LIGHT_SOURCE); // 2 items
```

#### `getItemsByLocation(location: string): Promise<Item[]>`
Finds items at a specific location (for scene population). Loads all items fresh from disk and filters client-side.
```typescript
const livingRoomItems = await loader.getItemsByLocation('living_room');
const inventoryItems = await loader.getItemsByLocation('inventory');
```

### Metadata Methods

#### `getTotalCount(): Promise<number>`
Returns total item count from index.json.
```typescript
const total = await loader.getTotalCount(); // 214
```

## Item Type Analysis

### Type Distribution Patterns
The data reveals interesting patterns in the original Zork type system:

#### Most Items Are Tools
164 out of 214 items (76.6%) are classified as `type: "TOOL"`, including:
- Weapons: `sword.json`, `knife.json`, `rknif.json` → `type: "TOOL"`
- Treasures: `diamo.json` (diamond), `ruby.json`, `pearl.json` → `type: "TOOL"`
- Food items: Most consumables → `type: "TOOL"`
- Interactive objects: doors, buttons, switches → `type: "TOOL"`

#### Specialized Types Are Rare
- Only 5 items use `type: "WEAPON"` (axe, still, sword, knife, rknif)
- Only 2 items use `type: "LIGHT_SOURCE"` (lamp, candl)
- Only 7 items use `type: "FOOD"`
- No items use `type: "TREASURE"` despite the enum existing

### Design Rationale
This suggests the original game prioritized **functional behavior** over **intuitive categorization**. Most game objects function as "tools" that can be interacted with, regardless of their real-world classification. The DataLoader preserves this authentic structure while providing type-based query methods.

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
  await loader.loadItem('nonexistent');
} catch (error) {
  // "Item with ID 'nonexistent' not found"
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

#### Individual Item Loading
- `loadItem()`: Single file read operation per call
- Index read required for validation on each call
- Direct file access for single item requests

#### Bulk Operations
- `loadAllItems()`: Reads index.json + 214 individual item files
- `getItemsByType()`: Calls `loadAllItems()` then filters client-side
- `getItemsByLocation()`: Calls `loadAllItems()` then filters client-side
- Higher latency for bulk operations due to multiple file reads

### Performance Trade-offs

#### Benefits of Stateless Design
- No memory usage growth over time
- Predictable performance characteristics
- Always returns fresh data from disk
- Simple debugging and testing

#### Performance Implications
- Higher I/O overhead for repeated operations
- No performance benefit from repeated calls
- Bulk filtering operations load entire dataset

## Integration Patterns

### With SceneDataLoader (Future)
```typescript
// Scene population workflow - stateless loading
const sceneItems = await itemLoader.getItemsByLocation(sceneId);
scene.items = sceneItems.map(item => item.id);
```

### With Services Layer
```typescript
// Service layer usage - this is where caching could be implemented if needed
class ItemService {
  constructor(private itemLoader: IItemDataLoader) {}
  
  async canTakeItem(itemId: string): Promise<boolean> {
    const item = await this.itemLoader.loadItem(itemId);
    return item.portable && item.visible;
  }
}
```

### With Mechanics System
```typescript
// Note: No items currently use TREASURE type
const tools = await itemLoader.getItemsByType(ItemType.TOOL); // 164 items
const valuableTools = tools.filter(item => item.tags.includes('valuable'));
```

## Unit Testing Strategy

### Test Categories Required (100% Coverage)

#### 1. Data Loading Tests
- All 214 items load successfully
- Index loads correctly
- Category organization validated

#### 2. Validation Tests
- Enum validation for all type/size values
- Required field validation
- Error handling for malformed data

#### 3. Conversion Tests
- ItemData → Item conversion accuracy
- Condition/effect parsing correctness
- Type safety preservation

#### 4. Stateless Operation Tests
- Consistent behavior across repeated calls
- Memory efficiency (no cached state)
- Fresh data loading verification

#### 5. Edge Case Tests
- Special character IDs ("!!!!!", "*bun*")
- Empty arrays/objects handling
- Cross-category type mismatches

### Mock Strategy
```typescript
// Mock filesystem for isolated testing
jest.mock('fs/promises');
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
```

## Common Patterns and Usage Examples

### Loading Items for Scene Population
```typescript
async function populateScene(sceneId: string): Promise<void> {
  const sceneItems = await itemLoader.getItemsByLocation(sceneId);
  scene.items = sceneItems.filter(item => item.visible).map(item => item.id);
}
```

### Item Interaction Processing
```typescript
async function processInteraction(itemId: string, command: string): Promise<string> {
  const item = await itemLoader.loadItem(itemId);
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

### Type-Based Operations
```typescript
// Note: Loads all 214 items fresh from disk to filter by type
async function listValueableItems(): Promise<string[]> {
  const tools = await itemLoader.getItemsByType(ItemType.TOOL);
  return tools.filter(item => item.tags.includes('valuable')).map(t => t.name);
}
```

## Future Considerations

### Extensibility Points
- Additional item types can be added to enum
- Flag system extensible for complex game logic
- Flat file structure simplifies data management

### Performance Optimization Opportunities
- **Service Layer Caching**: Implement caching at service level for frequently accessed items
- **Bulk Operations**: Consider optimized bulk loading methods for better performance
- **Lazy Loading**: For very large datasets, consider streaming or pagination
- **Metrics Collection**: Add performance monitoring for file I/O operations

### Stateless Design Benefits
- **Scalability**: Each instance is independent and thread-safe
- **Simplicity**: No state management complexity
- **Testing**: Predictable behavior simplifies unit testing
- **Memory**: No memory leaks from cached data

### Data Migration Support
- ItemDataLoader provides clean abstraction for data format changes
- Type conversion layer allows for data structure evolution
- Validation ensures data integrity during updates
- Flat structure simplifies data management tools

This documentation reflects the current stateless implementation and provides guidance for future developers working with the ItemDataLoader while maintaining the authentic Zork recreation standards.