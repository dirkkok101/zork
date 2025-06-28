# MonsterDataLoader Documentation

## Overview

The `MonsterDataLoader` class is a core component of the DataLoader layer in the 4-layer architecture. It provides type-safe, validated loading of game monsters from JSON data files with **stateless architecture** and comprehensive error handling, following the **minimal interface pattern**.

## Purpose and Scope

### Primary Responsibilities
- Load and validate 9 monster JSON files in flat structure (no categories)
- Convert raw JSON data to type-safe TypeScript interfaces
- Provide **single-method interface** for the Services layer
- Parse MDL flags, behavior functions, and movement demons
- Stateless file I/O operations without caching

### Architecture Position
```
UI Layer
  ↓
Commands Layer  
  ↓
Services Layer ← MonsterDataLoader (DataLoader Layer)
  ↓
Data Files (JSON)
```

## Minimal Interface Pattern

### Interface Design Philosophy
The `IMonsterDataLoader` follows a **minimal interface pattern** with only essential methods:

```typescript
export interface IMonsterDataLoader {
    /**
     * Load all monsters from flat structure.
     * Performs fresh file I/O on each call (no caching).
     * @returns Promise resolving to array of all 9 monsters
     */
    loadAllMonsters(): Promise<Monster[]>;
}
```

### Rationale for Minimal Interface
- **Single Responsibility**: One method, one clear purpose
- **Services Layer Filtering**: Query operations (by type, location) handled by Services
- **Stateless Architecture**: No caching means no need for cache management methods
- **Consistent Pattern**: All data loaders follow the same minimal interface
- **Testing Simplicity**: Only one public method to test thoroughly

## Data Structure and Organization

### Monster Storage (9 total monsters)
Monsters are stored in a **flat file structure** with individual JSON files:
- All monsters in single `data/monsters/` directory
- No hierarchical category folders
- Indexed by `index.json` file containing array of monster IDs

### Monster Type Distribution (by actual type property)
- **HUMANOID** (5 monsters): thief, troll, cyclops, gnome_of_zurich, guardian_of_zork
- **CREATURE** (2 monsters): ghost, volcano_gnome
- **ENVIRONMENTAL** (2 monsters): grue, vampire_bat

### Type System Architecture

#### Raw Data Interface (`MonsterData`)
Represents the exact JSON file structure:
```typescript
interface MonsterData {
  id: string;
  name: string;
  type: MonsterType;           // Raw string from JSON
  description: string;
  examineText: string;
  inventory: string[];
  synonyms: string[];
  flags: Record<string, boolean>;
  properties: Record<string, any>;
  // Optional MDL properties
  combatStrength?: number;
  meleeMessages?: MeleeMessages;
  behaviorFunction?: string;
  movementDemon?: string;
  // ... other fields
}
```

#### Runtime Interface (`Monster`)
Type-safe interface with converted types and computed properties:
```typescript
interface Monster {
  id: string;
  name: string;
  type: MonsterType;           // Converted enum
  state: MonsterState;         // Computed from flags/type
  movementPattern: MovementPattern; // Computed from demon
  currentSceneId: string | null;
  startingSceneId?: string | null;
  health: number;              // Computed from data
  maxHealth: number;           // Computed from data
  inventory: string[];
  variables: Record<string, any>; // Monster-specific state
  // ... MDL properties preserved
}
```

## Monster Data Conversion Logic

### State Determination
Monsters have their initial state determined by a priority system:
```typescript
// Priority order:
1. Explicit state in data
2. VILLAIN flag → HOSTILE state
3. INVISIBLE/OVISON flags → LURKING state  
4. GUARD behavior function → GUARDING state
5. Type-based defaults:
   - humanoid → IDLE
   - creature → WANDERING  
   - environmental → LURKING
```

### Movement Pattern Inference
Movement patterns are inferred from movement demon names:
```typescript
// Demon name patterns (case-sensitive):
- ROBBER/FOLLOW → 'follow'
- FLEE → 'flee'
- PATROL → 'patrol'
- RANDOM → 'random'
- Default → 'stationary'
```

### Monster-Specific Variables
Special monsters get initialized with game-specific variables:
```typescript
// Thief variables
{ hasStolen: false, stolenItems: [], engagedInCombat: false }

// Troll variables  
{ hasBeenPaid: false, isGuarding: true }

// Cyclops variables
{ isAsleep: true, hasBeenAwakened: false }
```

## API Documentation

### Core Loading Method

#### `loadAllMonsters(): Promise<Monster[]>`
The **only public method** in the minimal interface. Loads all 9 monsters from flat structure. Each call performs fresh file I/O operations.

```typescript
const loader = new MonsterDataLoader();
const allMonsters = await loader.loadAllMonsters();
console.log(`Loaded ${allMonsters.length} monsters`); // 9

// Services layer handles filtering
const humanoids = allMonsters.filter(monster => monster.type === MonsterType.HUMANOID);
const creatures = allMonsters.filter(monster => monster.type === MonsterType.CREATURE);
const environmental = allMonsters.filter(monster => monster.type === MonsterType.ENVIRONMENTAL);
```

### Removed Methods (Services Layer Responsibility)
The following methods were **removed from the interface** to follow the minimal pattern:

- ❌ `loadMonster(monsterId: string)` → Use Services layer + `loadAllMonsters()`
- ❌ `getMonstersByType(type: MonsterType)` → Use Services layer + `loadAllMonsters()` + filter
- ❌ `getMonstersInScene(sceneId: string)` → Use Services layer + `loadAllMonsters()` + filter
- ❌ `getTotalCount()` → Use `loadAllMonsters().length`
- ❌ `monsterExists(monsterId: string)` → Use Services layer + `loadAllMonsters()` + find

### Services Layer Integration Pattern
```typescript
// MonsterService handles complex queries using loadAllMonsters()
class MonsterService {
  constructor(private monsterLoader: IMonsterDataLoader) {}
  
  async getMonster(monsterId: string): Promise<Monster | null> {
    const allMonsters = await this.monsterLoader.loadAllMonsters();
    return allMonsters.find(monster => monster.id === monsterId) || null;
  }
  
  async getMonstersByType(type: MonsterType): Promise<Monster[]> {
    const allMonsters = await this.monsterLoader.loadAllMonsters();
    return allMonsters.filter(monster => monster.type === type);
  }
  
  async getMonstersInScene(sceneId: string): Promise<Monster[]> {
    const allMonsters = await this.monsterLoader.loadAllMonsters();
    return allMonsters.filter(monster => monster.currentSceneId === sceneId);
  }
  
  async getHostileMonsters(): Promise<Monster[]> {
    const allMonsters = await this.monsterLoader.loadAllMonsters();
    return allMonsters.filter(monster => monster.state === MonsterState.HOSTILE);
  }
}
```

## Error Handling and Validation

### File-Level Validation
- JSON syntax validation
- Required field presence checking
- Type validation for all fields
- Monster type validation

### Graceful Degradation
```typescript
// Individual monster failures don't crash bulk loading
const allMonsters = await loader.loadAllMonsters();
// Logs errors for failed monsters but continues with successful ones
```

### Comprehensive Error Messages
```typescript
try {
  await loader.loadAllMonsters();
} catch (error) {
  // "Failed to load monster index: ENOENT: no such file"
  // "Failed to load monster thief.json: Invalid JSON syntax"
  // "Monster data missing required field: id"
  // "Invalid monster type: invalid_type"
}
```

## Performance Considerations

### Stateless Architecture

#### No Caching Strategy
The MonsterDataLoader follows a **stateless design** with no internal caching:
- Each method call performs fresh file I/O operations
- No memory overhead from cached data
- Consistent behavior across all calls
- Thread-safe by design

### File I/O Performance Characteristics

#### Single Method Design
- `loadAllMonsters()`: Reads index.json + 9 individual monster files
- All filtering operations handled by Services layer after loading
- Consistent performance profile for all operations
- Fast loading due to small dataset (9 monsters vs 214 items)

### Performance Benchmarks
Based on integration testing with real data:
- Single `loadAllMonsters()` call: < 100ms
- Concurrent loading (3 simultaneous calls): < 200ms
- Memory usage: < 5MB for all 9 monsters
- Filtering operations: < 10ms after loading

## Testing Strategy

### Unit Testing Pattern
Following the minimal interface pattern, testing focuses on the single public method:

```typescript
describe('MonsterDataLoader.loadAllMonsters()', () => {
  // Success scenarios
  it('should load all 9 monsters successfully');
  it('should return consistent results on subsequent calls');
  it('should handle stateless behavior correctly');
  
  // Error scenarios  
  it('should handle index loading failures gracefully');
  it('should handle individual monster loading failures');
  it('should log errors but continue with successful monsters');
  
  // Performance scenarios
  it('should complete within 100ms performance requirement');
  it('should not cache results between calls');
  
  // Data integrity scenarios
  it('should preserve monster order from index');
  it('should apply all type conversions correctly');
});
```

### Integration Testing Pattern
```typescript
// Real data testing with actual files
describe('MonsterDataLoader Integration', () => {
  beforeEach(() => {
    // CRITICAL: Must import '../setup' for real file access
    loader = new MonsterDataLoader('data/monsters/');
  });

  it('should load all 9 real monsters');
  it('should validate type distribution (5 humanoid, 2 creature, 2 environmental)');
  it('should handle real monster data structures correctly');
  it('should validate known monster IDs are present');
  it('should performance test with actual file I/O');
  it('should validate combat strength distributions');
  it('should validate MDL properties are present');
});
```

### Private Method Testing
```typescript
// Test critical conversion logic through type assertions
describe('Private Method Testing', () => {
  it('should test convertMonsterDataToMonster conversion logic');
  it('should test determineInitialState priority system');
  it('should test convertMovementPattern demon parsing');
  it('should test initializeVariables monster-specific logic');
  it('should test parseMonsterState validation and normalization');
});
```

## Integration Patterns

### With Services Layer
```typescript
// Services layer provides the query interface that was removed from DataLoader
class MonsterService {
  constructor(private monsterLoader: IMonsterDataLoader) {}
  
  async getAllMonsters(): Promise<Monster[]> {
    return await this.monsterLoader.loadAllMonsters();
  }
  
  async getMonster(monsterId: string): Promise<Monster | null> {
    const monsters = await this.getAllMonsters();
    return monsters.find(monster => monster.id === monsterId) || null;
  }
  
  // Services layer can implement caching here if needed
  private monsterCache?: Monster[];
  
  async getCachedMonsters(): Promise<Monster[]> {
    if (!this.monsterCache) {
      this.monsterCache = await this.monsterLoader.loadAllMonsters();
    }
    return this.monsterCache;
  }
  
  // Complex queries handled by Services
  async getActiveThreats(): Promise<Monster[]> {
    const monsters = await this.getAllMonsters();
    return monsters.filter(monster => 
      monster.state === MonsterState.HOSTILE && 
      monster.health > 0
    );
  }
}
```

### With Other DataLoaders
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
const sceneMonsters = allMonsters.filter(monster => monster.currentSceneId === sceneId);
scene.monsters = sceneMonsters.map(monster => monster.id);
```

## Common Usage Examples

### Loading All Monsters
```typescript
async function getAllGameMonsters(): Promise<Monster[]> {
  const loader = new MonsterDataLoader();
  return await loader.loadAllMonsters();
}
```

### Monster Queries (Services Layer)
```typescript
async function findHostileMonsters(): Promise<Monster[]> {
  const allMonsters = await monsterLoader.loadAllMonsters();
  return allMonsters.filter(monster => 
    monster.state === MonsterState.HOSTILE ||
    monster.flags.VILLAIN
  );
}

async function getMonstersInRoom(roomId: string): Promise<Monster[]> {
  const allMonsters = await monsterLoader.loadAllMonsters();
  return allMonsters.filter(monster => 
    monster.currentSceneId === roomId
  );
}

async function getMonstersByMovementPattern(pattern: MovementPattern): Promise<Monster[]> {
  const allMonsters = await monsterLoader.loadAllMonsters();
  return allMonsters.filter(monster => monster.movementPattern === pattern);
}
```

### Monster Interaction Processing
```typescript
async function processMonsterInteraction(monsterId: string, action: string): Promise<string> {
  const allMonsters = await monsterLoader.loadAllMonsters();
  const monster = allMonsters.find(monster => monster.id === monsterId);
  
  if (!monster) return "Monster not found.";
  
  // Use monster state and flags for interaction logic
  if (monster.state === MonsterState.HOSTILE) {
    return "The monster attacks you!";
  }
  
  if (monster.state === MonsterState.SLEEPING) {
    return "The monster is sleeping peacefully.";
  }
  
  return `You ${action} the ${monster.name}.`;
}
```

## Real Data Insights

### Type Distribution Reality
Based on actual data analysis:
- **HUMANOID**: 5 monsters (thief, troll, cyclops, gnome_of_zurich, guardian_of_zork)
- **CREATURE**: 2 monsters (ghost, volcano_gnome)  
- **ENVIRONMENTAL**: 2 monsters (grue, vampire_bat)

### Combat Strength Reality
- thief: 5
- troll: 2  
- cyclops: 10,000 (boss-level)
- guardian_of_zork: 10,000 (boss-level)
- Many monsters have no combat strength (environmental types)

### Location Reality
- 67% of monsters don't have `startingSceneId`
- Environmental monsters are location-independent
- Mobile creatures don't have fixed starting locations

### Flag Patterns
- Real data uses `OVISON` not `INVISIBLE` 
- `VILLAIN` flag takes precedence in state determination
- Flag combinations determine complex behaviors

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
- AI behavior systems can be implemented at Services level
- Combat mechanics handled by Services using monster data
- Movement systems implemented at Services level

### Performance Optimization Opportunities
- **Services Layer Caching**: Implement caching at service level for frequently accessed monsters
- **Smart Loading**: Services can implement location-based loading strategies
- **AI Optimization**: Services can optimize monster behavior calculations
- **Combat Optimization**: Services can cache combat-related calculations

### Architecture Evolution
- DataLoader interface remains stable as Services evolve
- New monster behaviors can be added without changing DataLoader
- Services layer provides abstraction for complex AI operations
- Testing strategy scales with additional Services functionality

This minimal interface pattern ensures the MonsterDataLoader remains focused on its core responsibility of loading data while enabling flexible, testable, and maintainable monster management operations at the Services layer.