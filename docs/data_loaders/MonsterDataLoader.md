# MonsterDataLoader Documentation

## Overview

The `MonsterDataLoader` class is a core component of the DataLoader layer in the 4-layer architecture. It provides type-safe, validated loading of monster data from JSON files with stateless architecture, MDL (Monster Description Language) property handling, and comprehensive error handling.

## Purpose and Scope

### Primary Responsibilities
- Load and validate 9 monster JSON files in flat structure
- Convert raw JSON data to type-safe TypeScript interfaces with MDL property mapping
- Handle optional fields gracefully (67% of monsters lack fixed starting locations)
- Provide efficient access patterns for the Services layer
- Infer monster states from flags with proper precedence rules
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

## Data Structure and Organization

### Monster Storage (9 total monsters)
Monsters are stored in a **flat file structure** with individual JSON files:
- All monsters in single `data/monsters/` directory
- No hierarchical category folders
- Indexed by `index.json` file containing registry information

### Monster Type Distribution (by actual type property)
- **HUMANOID** (5 monsters): Human-like creatures with intelligence and tools
- **CREATURE** (2 monsters): Non-human animate beings
- **ENVIRONMENTAL** (2 monsters): Context-dependent entities tied to game conditions

### Type System Architecture

#### Raw Data Interface (`MonsterData`)
Represents the exact JSON file structure with optional fields:
```typescript
interface MonsterData {
  id: string;
  name: string;
  type: MonsterType;
  description: string;
  examineText: string;
  startingSceneId?: string;     // Optional - 67% of monsters don't have this
  currentSceneId?: string;
  inventory: string[];
  synonyms: string[];
  flags: Record<string, boolean>;
  properties: Record<string, any>;
  
  // MDL Properties (optional)
  combatStrength?: number;
  meleeMessages?: MeleeMessages;
  behaviorFunction?: string;
  movementDemon?: string;
  specialAbilities?: string[];
}
```

#### Runtime Interface (`Monster`)
Type-safe interface with converted properties and computed fields:
```typescript
interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  description: string;
  examineText: string;
  
  // Location handling
  currentSceneId: string | null;      // Null for mobile/environmental monsters
  startingSceneId?: string | null;    // Optional for mobile creatures
  
  // Combat properties
  health: number;
  maxHealth: number;
  combatStrength?: number;
  meleeMessages?: MeleeMessages;
  
  // Behavior and movement
  state: MonsterState;                // Inferred from flags/type
  movementPattern: MovementPattern;   // Converted from movementDemon
  allowedScenes: string[];
  behaviorFunction?: string;
  movementDemon?: string;
  behaviors?: string[];               // Extracted from functions
  
  // Game state
  inventory: string[];
  variables: Record<string, any>;     // Monster-specific variables
  synonyms: string[];
  flags: Record<string, boolean>;
  properties: Record<string, any>;
  
  // Scoring
  defeatScore?: number;
}
```

## Validated Enum Values

### MonsterType Enum
Based on actual data distribution:
```typescript
enum MonsterType {
  HUMANOID = 'humanoid',        // 5 instances
  CREATURE = 'creature',        // 2 instances  
  ENVIRONMENTAL = 'environmental' // 2 instances
}
```

### MonsterState Enum
Inferred from flags and properties:
```typescript
enum MonsterState {
  IDLE = 'idle',
  ALERT = 'alert', 
  HOSTILE = 'hostile',          // From VILLAIN flag
  FLEEING = 'fleeing',
  FRIENDLY = 'friendly',
  DEAD = 'dead',
  GUARDING = 'guarding',        // From GUARD behavior
  WANDERING = 'wandering',      // Default for creatures
  LURKING = 'lurking',          // From OVISON flag
  SLEEPING = 'sleeping'
}
```

### MovementPattern Enum
Converted from movementDemon properties:
```typescript
enum MovementPattern {
  STATIONARY = 'stationary',    // Default
  RANDOM = 'random',
  PATROL = 'patrol', 
  FOLLOW = 'follow',            // From ROBBER-DEMON
  FLEE = 'flee'
}
```

## MDL Property Conversion System

### State Inference Logic
Converts flags to runtime states with proper precedence:
```typescript
// Priority order (higher precedence first):
// 1. Explicit state property
// 2. VILLAIN flag → HOSTILE
// 3. INVISIBLE or OVISON flag → LURKING  
// 4. GUARD behavior → GUARDING
// 5. Type-based defaults
```

### Movement Pattern Conversion
Maps MDL movement demons to runtime patterns:
```typescript
// Movement demon mappings:
movementDemon: "ROBBER-DEMON" → movementPattern: "follow"
movementDemon: "FLEE-DEMON"   → movementPattern: "flee"  
movementDemon: "PATROL-DEMON" → movementPattern: "patrol"
movementDemon: "RANDOM-DEMON" → movementPattern: "random"
// No demon or unknown      → movementPattern: "stationary"
```

### Behavior Extraction
Extracts behaviors from function names and properties:
```typescript
// Function name mappings:
behaviorFunction: "ROBBER-FUNCTION" → behaviors: ["steal"]
behaviorFunction: "GUARD-FUNCTION"  → behaviors: ["guard"]
behaviorFunction: "VANISH-FUNCTION" → behaviors: ["vanish"]

// Plus special abilities and properties.behaviors
```

### Variable Initialization
Initializes monster-specific game variables:
```typescript
// Monster-specific variables:
thief: { hasStolen: false, stolenItems: [], engagedInCombat: false }
troll: { hasBeenPaid: false, isGuarding: true }
cyclops: { isAsleep: true, hasBeenAwakened: false }
```

## API Documentation

### Core Loading Methods

#### `loadMonster(monsterId: string): Promise<Monster>`
Loads a specific monster by ID with full validation and type conversion.
```typescript
const loader = new MonsterDataLoader();
const thief = await loader.loadMonster('thief');
console.log(thief.combatStrength);        // 5
console.log(thief.behaviorFunction);      // "ROBBER-FUNCTION"
console.log(thief.movementPattern);       // "follow"
console.log(thief.state);                 // "hostile"
```

#### `loadAllMonsters(): Promise<Monster[]>`
Loads all 9 monsters from flat structure. Each call performs fresh file I/O operations.
```typescript
const allMonsters = await loader.loadAllMonsters();
console.log(`Loaded ${allMonsters.length} monsters`); // 9
```

### Query Methods

#### `getMonstersByType(type: MonsterType): Promise<Monster[]>`
Filters monsters by type enum. Loads all monsters fresh from disk and filters client-side.
```typescript
const humanoids = await loader.getMonstersByType(MonsterType.HUMANOID); // 5 monsters
const creatures = await loader.getMonstersByType(MonsterType.CREATURE); // 2 monsters
const environmental = await loader.getMonstersByType(MonsterType.ENVIRONMENTAL); // 2 monsters
```

#### `getMonstersInScene(sceneId: string): Promise<Monster[]>`
Finds monsters at a specific scene. Loads all monsters fresh from disk and filters client-side.
```typescript
const treasureRoomMonsters = await loader.getMonstersInScene('treasure_room'); // [thief]
const trollRoomMonsters = await loader.getMonstersInScene('troll_room'); // [troll]
```

### Metadata Methods

#### `getTotalCount(): Promise<number>`
Returns total monster count from index.json.
```typescript
const total = await loader.getTotalCount(); // 9
```

#### `monsterExists(monsterId: string): Promise<boolean>`
Checks if a monster exists in the registry.
```typescript
const exists = await loader.monsterExists('thief'); // true
const missing = await loader.monsterExists('dragon'); // false
```

## Monster Data Analysis

### Real Data Structure Patterns

#### Fixed vs Mobile Monsters

**Monsters WITH startingSceneId (33%):**
- `thief` → `"treasure_room"` (guards treasure)
- `troll` → `"troll_room"` (guards bridge)
- `cyclops` → `"cyclops_room"` (guards specific area)

**Monsters WITHOUT startingSceneId (67%):**
- `grue`, `vampire_bat` → Environmental (appear based on darkness/conditions)
- `ghost`, `volcano_gnome` → Mobile creatures (move dynamically)
- `gnome_of_zurich`, `guardian_of_zork` → Context-dependent (special circumstances)

#### Combat Strength Distribution

**Defined Combat Strengths (44%):**
- `cyclops`: 10000 (boss-level threat)
- `guardian_of_zork`: 10000 (boss-level threat)  
- `thief`: 5 (moderate threat)
- `troll`: 2 (low threat)

**Undefined Combat Strengths (56%):**
- `grue`, `ghost`, `vampire_bat`, `volcano_gnome`, `gnome_of_zurich` (no combat stats)

#### Flag Patterns in Real Data

**VILLAIN Flag (aggressive monsters):**
- `thief`: `OVISON: true, VICBIT: true, VILLAIN: true` → State: `hostile`
- `troll`: `OVISON: true, VICBIT: true, VILLAIN: true` → State: `hostile`

**OVISON Flag (lurking monsters):**
- `grue`: `OVISON: true` → State: `lurking`
- `ghost`: `OVISON: true, VICBIT: true` → State: `lurking`

**Behavior Function Patterns:**
- `thief`: `"ROBBER-FUNCTION"` → behaviors: `["steal"]`
- `grue`: `"GRUE-FUNCTION"` → environmental behavior
- `ghost`: `"GHOST-FUNCTION"` → incorporeal behavior
- `vampire_bat`: `"FLY-ME"` → flight behavior
- `troll`, `guardian_of_zork`: No behavior function

### Design Rationale

The monster system reflects authentic Zork design where:
- **Environmental monsters** (grue, vampire_bat) are tied to game conditions, not locations
- **Mobile creatures** can appear in multiple contexts
- **Guardian monsters** protect specific locations and treasures
- **Combat strength** varies dramatically (2 to 10000) for gameplay balance
- **Behavior functions** drive unique monster interactions

## Error Handling and Validation

### Field Validation Strategy

#### Required Fields (always present)
- `id`, `name`, `type`, `description`, `examineText`
- `inventory`, `synonyms`, `flags`, `properties`

#### Optional Fields (gracefully handled)
- `startingSceneId` (missing from 67% of monsters)
- `combatStrength` (missing from 56% of monsters)
- `meleeMessages` (only for combat-capable monsters)
- `behaviorFunction` (missing from 2 monsters)
- `movementDemon` (only thief has this)

### Graceful Degradation
```typescript
// Individual monster failures don't crash bulk loading
const allMonsters = await loader.loadAllMonsters();
// Logs errors for failed monsters but continues with successful ones
```

### Comprehensive Error Messages
```typescript
try {
  await loader.loadMonster('dragon');
} catch (error) {
  // "Monster with ID 'dragon' not found"
}

try {
  await loader.monsterExists(null);
} catch (error) {
  // "Monster ID cannot be null or undefined"
}
```

### Validation Logic
```typescript
// Handles missing optional fields
currentSceneId: data.currentSceneId !== undefined 
  ? data.currentSceneId 
  : (data.startingSceneId || null),

startingSceneId: data.startingSceneId || null,

// Provides sensible defaults
health: data.health ?? data.maxHealth ?? 100,
maxHealth: data.maxHealth ?? 100,
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

#### Individual Monster Loading
- `loadMonster()`: Single file read operation per call (~10ms)
- Index read required for validation on each call
- Direct file access for single monster requests

#### Bulk Operations
- `loadAllMonsters()`: Reads index.json + 9 individual monster files (~50-100ms)
- `getMonstersByType()`: Calls `loadAllMonsters()` then filters client-side
- `getMonstersInScene()`: Calls `loadAllMonsters()` then filters client-side
- Lower latency than ItemDataLoader due to smaller dataset (9 vs 214 files)

### Performance Benchmarks
- **Single Monster Load**: <10ms requirement
- **All Monsters Load**: <100ms for full dataset (9 monsters)
- **Type/Scene Filtering**: <150ms including full load + filter
- **Memory Usage**: ~2MB for full dataset

## Integration Patterns

### With SceneDataLoader (Future)
```typescript
// Scene population workflow - stateless loading
const sceneMonsters = await monsterLoader.getMonstersInScene(sceneId);
scene.monsters = sceneMonsters.map(monster => monster.id);
```

### With Services Layer
```typescript
// Service layer usage - where game logic is implemented
class MonsterCombatService {
  constructor(private monsterLoader: IMonsterDataLoader) {}
  
  async performAttack(monsterId: string, targetId: string): Promise<CombatResult> {
    const monster = await this.monsterLoader.loadMonster(monsterId);
    const attackStrength = monster.combatStrength || 1;
    
    // Use actual melee messages from monster data
    const messages = monster.meleeMessages;
    const message = this.selectMessage(messages, 'attack');
    
    return { damage: attackStrength, message };
  }
}
```

### With AI System
```typescript
// Monster AI decision making
class MonsterAIService {
  constructor(private monsterLoader: IMonsterDataLoader) {}
  
  async updateMonsterAI(monsterId: string): Promise<MonsterAction> {
    const monster = await this.monsterLoader.loadMonster(monsterId);
    
    // Execute behavior function if present
    if (monster.behaviorFunction === 'ROBBER-FUNCTION') {
      return this.executeThiefBehavior(monster);
    }
    
    // Default behavior based on state
    switch (monster.state) {
      case MonsterState.HOSTILE: return MonsterAction.ATTACK;
      case MonsterState.LURKING: return MonsterAction.HIDE;
      case MonsterState.WANDERING: return MonsterAction.MOVE_RANDOM;
      default: return MonsterAction.IDLE;
    }
  }
}
```

## Unit Testing Strategy

### Test Categories Required (100% Coverage)

#### 1. Data Loading Tests
- All 9 monsters load successfully
- Index loads correctly
- Optional field handling validated

#### 2. Validation Tests
- Enum validation for all type values
- Required field validation
- Optional field graceful handling
- Error handling for malformed data

#### 3. MDL Conversion Tests
- MonsterData → Monster conversion accuracy
- State inference from flags (VILLAIN > OVISON precedence)
- Movement pattern conversion from demons
- Behavior extraction from function names
- Variable initialization for specific monsters

#### 4. Stateless Operation Tests
- Consistent behavior across repeated calls
- Memory efficiency (no cached state)
- Fresh data loading verification

#### 5. Real Data Edge Cases
- Monsters without startingSceneId (grue, ghost, etc.)
- Monsters without combatStrength (environmental monsters)
- Flag precedence testing (thief with both VILLAIN and OVISON)
- Empty properties handling

### Mock Strategy
```typescript
// Mock filesystem for isolated testing
jest.mock('fs/promises');
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

// Integration tests unmock for real file access
import '../setup'; // Critical for integration tests
```

## Common Patterns and Usage Examples

### Loading Monsters for Scene Population
```typescript
async function populateScene(sceneId: string): Promise<void> {
  const sceneMonsters = await monsterLoader.getMonstersInScene(sceneId);
  scene.monsters = sceneMonsters.map(monster => monster.id);
}
```

### Monster Combat Processing
```typescript
async function processMonsterAttack(monsterId: string): Promise<string> {
  const monster = await monsterLoader.loadMonster(monsterId);
  
  if (!monster.combatStrength) {
    return "The monster is not hostile.";
  }
  
  // Use actual melee messages from data
  const messages = monster.meleeMessages?.miss || ["The monster misses."];
  return messages[Math.floor(Math.random() * messages.length)];
}
```

### Monster Behavior Execution
```typescript
async function executeMonsterBehavior(monsterId: string): Promise<void> {
  const monster = await monsterLoader.loadMonster(monsterId);
  
  // Check for specific behavior functions
  if (monster.behaviorFunction === 'ROBBER-FUNCTION') {
    await executeThiefStealing(monster);
  }
  
  // Execute behaviors array
  if (monster.behaviors?.includes('steal')) {
    await attemptStealing(monster);
  }
}
```

### Type-Based Monster Operations
```typescript
async function listHostileMonsters(): Promise<Monster[]> {
  const allMonsters = await monsterLoader.loadAllMonsters();
  return allMonsters.filter(monster => monster.state === MonsterState.HOSTILE);
}

async function getGuardianMonsters(): Promise<Monster[]> {
  const humanoids = await monsterLoader.getMonstersByType(MonsterType.HUMANOID);
  return humanoids.filter(monster => monster.startingSceneId); // Has fixed location
}
```

## Integration Test Requirements

### Critical Setup Pattern
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
    expect(monsters).toHaveLength(9);
  });
  
  it('should match actual type distribution', async () => {
    const monsters = await loader.loadAllMonsters();
    const typeDistribution = monsters.reduce((acc, monster) => {
      acc[monster.type] = (acc[monster.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    expect(typeDistribution).toEqual({
      'humanoid': 5,
      'creature': 2,
      'environmental': 2
    });
  });
});
```

## Future Considerations

### Extensibility Points
- Additional monster types can be added to enum
- New behavior functions supported through string matching
- Variable system extensible for complex monster mechanics
- Flag system supports additional state inference rules

### Performance Optimization Opportunities
- **Service Layer Caching**: Implement caching at service level for frequently accessed monsters
- **Bulk Combat Operations**: Optimized loading for large battle scenarios
- **Lazy Loading**: For larger monster datasets, consider streaming approaches
- **Behavior Caching**: Cache parsed behavior patterns for repeated execution

### Stateless Design Benefits
- **Scalability**: Each instance is independent and thread-safe
- **Simplicity**: No state management complexity
- **Testing**: Predictable behavior simplifies unit testing
- **Memory**: No memory leaks from cached monster data
- **Authenticity**: Always reflects current data files

### Data Migration Support
- MonsterDataLoader provides clean abstraction for data format changes
- MDL conversion layer allows for property structure evolution
- Validation ensures data integrity during updates
- Flat structure simplifies monster data management tools

### Real Data Insights for Future Development
- **67% of monsters are mobile** - design systems to handle dynamic positioning
- **Combat strengths vary 5000x** (2 to 10000) - ensure combat systems scale appropriately
- **Flag precedence matters** - document and test state inference rules carefully
- **Behavior functions are sparse** - provide graceful defaults for monsters without them

This documentation reflects the current stateless implementation working with authentic Zork monster data and provides guidance for future developers building monster-related services while maintaining the authentic Zork recreation standards.