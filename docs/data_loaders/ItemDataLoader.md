# ItemDataLoader Documentation

## Overview

The `ItemDataLoader` class is a core component of the DataLoader layer in the 4-layer architecture. It provides type-safe, validated loading of game items from JSON data files with comprehensive caching and error handling.

## Purpose and Scope

### Primary Responsibilities
- Load and validate 214 item JSON files across 5 categories
- Convert raw JSON data to type-safe TypeScript interfaces
- Provide efficient access patterns for the Services layer
- Parse flag-based conditions and effects for game logic
- Cache loaded data for optimal performance

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

### Item Categories (214 total items)
- **treasures** (119 items): Valuable collectible objects
- **tools** (86 items): Interactive utility objects  
- **containers** (6 items): Storage objects (bags, boxes, chests)
- **weapons** (5 items): Combat items (swords, axes, knives)
- **consumables** (4 items): Food and consumable items

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
Based on comprehensive data analysis:
```typescript
enum ItemType {
  TOOL = 'TOOL',          // 115 instances
  TREASURE = 'TREASURE',  // 88 instances  
  CONTAINER = 'CONTAINER', // 9 instances
  WEAPON = 'WEAPON'       // 2 instances
}
```

### Size Enum
```typescript
enum Size {
  TINY = 'TINY',     // 154 instances
  SMALL = 'SMALL',   // 29 instances
  MEDIUM = 'MEDIUM', // 16 instances
  LARGE = 'LARGE',   // 8 instances
  HUGE = 'HUGE'      // 7 instances
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
Loads all 214 items from all categories with caching.
```typescript
const loader = new ItemDataLoader();
const allItems = await loader.loadAllItems();
console.log(`Loaded ${allItems.length} items`); // 214
```

#### `loadItem(itemId: string): Promise<Item>`
Loads a specific item by ID with validation.
```typescript
const lamp = await loader.loadItem('lamp');
console.log(lamp.type); // ItemType.TOOL
console.log(lamp.size); // Size.MEDIUM
```

#### `getItemsByCategory(category: string): Promise<Item[]>`
Loads items from a specific category.
```typescript
const treasures = await loader.getItemsByCategory('treasures');
console.log(`Found ${treasures.length} treasures`); // 119

const weapons = await loader.getItemsByCategory('weapons');
console.log(`Found ${weapons.length} weapons`); // 5
```

### Query Methods

#### `getItemsByType(type: ItemType): Promise<Item[]>`
Filters items by type enum.
```typescript
const tools = await loader.getItemsByType(ItemType.TOOL);
const containers = await loader.getItemsByType(ItemType.CONTAINER);
```

#### `getItemsByLocation(location: string): Promise<Item[]>`
Finds items at a specific location (for scene population).
```typescript
const livingRoomItems = await loader.getItemsByLocation('living_room');
const inventoryItems = await loader.getItemsByLocation('inventory');
```

### Metadata Methods

#### `getCategories(): Promise<string[]>`
Returns available categories.
```typescript
const categories = await loader.getCategories();
// ["treasures", "tools", "containers", "weapons", "consumables"]
```

#### `getTotalCount(): Promise<number>`
Returns total item count.
```typescript
const total = await loader.getTotalCount(); // 214
```

## Category Management

### Cross-Category Type Relationships
The data reveals interesting category vs type mismatches:

#### Weapons in Tools Category
Some items in `/weapons/` folder are classified as `type: "TOOL"`:
- `sword.json`, `knife.json`, `rknif.json` → `type: "TOOL"`
- Only `axe.json`, `still.json` → `type: "WEAPON"`

#### Treasures as Tools
Many valuable items are classified as `type: "TOOL"`:
- `diamo.json` (huge diamond) → `type: "TOOL"`
- `ruby.json`, `pearl.json` → `type: "TOOL"`

#### All Consumables as Tools
Items in `/consumables/` folder → `type: "TOOL"`

### Design Rationale
This suggests the original game prioritized **functional behavior** over **intuitive categorization**. The DataLoader preserves this authentic structure while providing both category-based and type-based access patterns.

## Error Handling and Validation

### File-Level Validation
- JSON syntax validation
- Required field presence checking
- Type validation for all fields
- Enum value validation

### Graceful Degradation
```typescript
// Individual item failures don't crash category loading
const categoryItems = await loader.getItemsByCategory('treasures');
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

### Multi-Level Caching Strategy

#### 1. Item Cache
Individual items cached by ID:
```typescript
private itemCache: Map<string, Item> = new Map();
```

#### 2. Category Cache  
Complete categories cached:
```typescript
private categoryCache: Map<string, Item[]> = new Map();
```

#### 3. Index Cache
Metadata cached to avoid repeated file reads:
```typescript
private indexCache: ItemIndexData | null = null;
```

#### 4. All Items Cache
Complete dataset cached for full queries:
```typescript
private allItemsCache: Item[] | null = null;
```

### Lazy Loading
- Files loaded only when requested
- Categories loaded independently
- Index loaded once and cached

### Memory Management
- JSON parsing occurs once per file
- Type conversion occurs once per item
- Caches can be cleared if memory constraints arise

## Integration Patterns

### With SceneDataLoader (Future)
```typescript
// Scene population workflow
const sceneItems = await itemLoader.getItemsByLocation(sceneId);
scene.items = sceneItems.map(item => item.id);
```

### With Services Layer
```typescript
// Service layer usage
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
// Scoring integration
const treasures = await itemLoader.getItemsByType(ItemType.TREASURE);
const treasureIds = treasures.map(t => t.id);
// Cross-reference with scoring_system.json
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

#### 4. Caching Tests
- Cache hit/miss behavior
- Memory efficiency
- Cache invalidation if needed

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

### Category-Based Operations
```typescript
async function listTreasures(): Promise<string[]> {
  const treasures = await itemLoader.getItemsByCategory('treasures');
  return treasures.map(t => t.name);
}
```

## Future Considerations

### Extensibility Points
- Additional item types can be added to enum
- New categories supported via index.json
- Flag system extensible for complex game logic

### Performance Optimization  
- Consider lazy loading for very large datasets
- Implement cache eviction strategies if needed
- Add metrics for cache hit rates

### Data Migration
- ItemDataLoader provides clean abstraction for data format changes
- Type conversion layer allows for data structure evolution
- Validation ensures data integrity during updates

This documentation ensures future developers can effectively use and extend the ItemDataLoader while maintaining the high standards established in the implementation.