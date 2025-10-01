# Zork Service Reference

## Overview

This document provides a complete reference for all service implementations in the Zork game. Services handle business logic, state management, and game mechanics following SOLID principles with dependency injection.

## Service Architecture

### Implementation Status

**Implemented Services**: 10 services (2,891 lines total)
**Interfaces Defined**: 11 interfaces (704 lines total)
**Architecture Pattern**: Direct instantiation via ServiceInitializer (no service registry)

### Service Dependency Graph

```
LoggingService (no dependencies)
    ↓
GameStateService (logging only)
    ↓
┌─────────────────────────────────────────┐
│ SceneService                            │
│ InventoryService                        │
│ ItemService                             │
│ ScoringService                          │
│ PersistenceService                      │
│ OutputService                           │
└─────────────────────────────────────────┘
    ↓
CommandService (no dependencies on game services)
    ↓
CommandProcessor (CommandService + GameStateService)
```

---

## Core Services

### 1. GameStateService

**Implementation**: `src/services/GameStateService.ts` (176 lines)
**Interface**: `src/services/interfaces/IGameStateService.ts` (92 lines)

**Purpose**: Central authority for all game state including player location, flags, score, and data access.

**Key Responsibilities**:
- Player location tracking (current scene)
- Global flag management (puzzle states, story progression)
- Score and move counting
- Game lifecycle (game over, victory, death)
- Data access to loaded items, scenes, monsters
- State modifications to game entities

**Key Methods**:

```typescript
// Location management
getCurrentScene(): string
setCurrentScene(sceneId: string): void

// Flag system
getFlag(name: string): boolean
setFlag(name: string, value: boolean): void

// Scoring and progression
getScore(): number
addScore(points: number): void
incrementMoves(): void

// Game lifecycle
isGameOver(): boolean
endGame(reason: string): void

// Data access
getItem(id: string): Item | undefined
getScene(id: string): Scene | undefined
getMonster(id: string): Monster | undefined

// State modifications
updateItemState(id: string, updates: Partial<Item>): void
updateSceneState(id: string, updates: Partial<Scene>): void
updateMonsterState(id: string, updates: Partial<Monster>): void

// Scene tracking
hasVisitedScene(sceneId: string): boolean
markSceneVisited(sceneId: string): void

// Persistence support
getGameState(): GameState
setGameState(gameState: GameState): void
```

**Usage Example**:
```typescript
// Track player movement
gameStateService.setCurrentScene('west_of_house');
gameStateService.incrementMoves();

// Set puzzle flags
gameStateService.setFlag('window_open', true);

// Award points
gameStateService.addScore(10);
```

**Dependencies**: LoggingService
**Used By**: All other services

---

### 2. SceneService

**Implementation**: `src/services/SceneService.ts` (506 lines)
**Interface**: `src/services/interfaces/ISceneService.ts` (77 lines)

**Purpose**: Manages scene navigation, exits, descriptions, and scene-based operations.

**Key Responsibilities**:
- Scene descriptions with conditional logic and lighting
- Exit availability based on conditions, locks, flags
- Visible item filtering based on scene conditions
- Door operations (open/close doors affecting exits)
- Scene entry/exit logic and actions
- Scene item management (runtime state)
- First visit scoring integration

**Key Methods**:

```typescript
// Scene descriptions and information
getSceneDescription(sceneId: string): string
getCurrentScene(): Scene
getScene(sceneId: string): Scene

// Exit management
getAvailableExits(sceneId: string): Exit[]
getAllExits(sceneId: string): Exit[]
canMoveTo(fromScene: string, direction: string): boolean
moveTo(direction: string): string

// Item visibility and management
getVisibleItems(sceneId: string): SceneItem[]
getSceneItems(sceneId: string): string[]
addItemToScene(sceneId: string, itemId: string): void
removeItemFromScene(sceneId: string, itemId: string): void

// Scene lifecycle
canEnterScene(sceneId: string): boolean
enterScene(sceneId: string): void
exitScene(sceneId: string): void

// Door operations
canOpenDoor(sceneId: string, doorItemId: string): boolean
canCloseDoor(sceneId: string, doorItemId: string): boolean
openDoor(sceneId: string, doorItemId: string): DoorResult
closeDoor(sceneId: string, doorItemId: string): DoorResult
```

**Special Features**:
- Supports conditional exits based on flags/items
- Handles lighting conditions (daylight, lit, dark, pitch_black)
- Integrates with ScoringService for first-visit points
- Requires InventoryService injection for item-based conditions

**Usage Example**:
```typescript
// Get current scene description
const description = sceneService.getSceneDescription('west_of_house');

// Check available exits
const exits = sceneService.getAvailableExits('west_of_house');

// Open door to unlock exit
const result = sceneService.openDoor('kitchen', 'window');
if (result.success) {
  // Window now open, east exit available
}
```

**Dependencies**: GameStateService, (InventoryService injected), (ScoringService injected)
**Used By**: Commands (look, move, examine)

---

### 3. InventoryService

**Implementation**: `src/services/InventoryService.ts` (195 lines)
**Interface**: `src/services/interfaces/IInventoryService.ts` (45 lines)

**Purpose**: Manages player inventory, weight/capacity constraints, and item location tracking.

**Key Responsibilities**:
- Player inventory management (add/remove items)
- Weight and capacity validation
- Inventory queries (contains, count, empty)
- Item location tracking (inventory vs scene vs container)

**Key Methods**:

```typescript
// Inventory management
getInventory(): string[]
addItem(itemId: string): void
removeItem(itemId: string): void
hasItem(itemId: string): boolean
isEmpty(): boolean
getItemCount(): number

// Weight and capacity
getTotalWeight(): number
canAddItem(itemId: string): boolean
getCapacity(): number
getRemainingCapacity(): number

// Location queries
isInInventory(itemId: string): boolean
getItemLocation(itemId: string): 'inventory' | 'scene' | 'container' | 'unknown'
```

**Constraints**:
- Default capacity: 100 weight units
- Validates item weight before adding
- Prevents adding items that exceed capacity

**Usage Example**:
```typescript
// Take an item
if (inventoryService.canAddItem('lamp')) {
  inventoryService.addItem('lamp');
  sceneService.removeItemFromScene(currentScene, 'lamp');
}

// Check inventory
const items = inventoryService.getInventory();
const weight = inventoryService.getTotalWeight();
```

**Dependencies**: GameStateService
**Used By**: Commands (take, drop, inventory, put)

---

### 4. ItemService

**Implementation**: `src/services/ItemService.ts` (806 lines)
**Interface**: `src/services/interfaces/IItemService.ts` (107 lines)

**Purpose**: Comprehensive item interaction management including containers, light sources, and locks.

**Key Responsibilities**:
- Basic item operations (take, examine, read, use)
- **Container operations** (open, close, contents, add/remove)
- **Light source operations** (light on/off, fuel management)
- **Lockable operations** (lock, unlock with keys)
- Item state management and validation
- Item matching and searching

**Key Methods**:

```typescript
// Basic operations
getItem(itemId: string): Item
canTake(itemId: string): boolean
takeItem(itemId: string): ItemResult
putItem(itemId: string, targetId?: string, preposition?: string): ItemResult
examineItem(itemId: string): string
readItem(itemId: string): string
useItem(itemId: string, targetId?: string): ItemResult

// Container operations (no separate IContainerService!)
isContainer(itemId: string): boolean
canOpen(itemId: string): boolean
openItem(itemId: string, keyId?: string): ItemResult
closeItem(itemId: string): ItemResult
getContainerContents(itemId: string): string[]
addToContainer(containerId: string, itemId: string): ItemResult
removeFromContainer(containerId: string, itemId: string): ItemResult
isContainerOpen(containerId: string): boolean

// Light source operations (no separate ILightSourceService!)
isLightSource(itemId: string): boolean
isLit(itemId: string): boolean
lightOn(itemId: string): ItemResult
lightOff(itemId: string): ItemResult

// Lockable operations
isLockable(itemId: string): boolean
isLocked(itemId: string): boolean
lockItem(itemId: string, keyId: string): ItemResult
unlockItem(itemId: string, keyId: string): ItemResult

// Search and matching
findItemInOpenContainers(itemName: string, containerIds: string[]): string | null
itemMatches(item: any, name: string): boolean
```

**Important Note**: This single service handles what documentation incorrectly describes as separate Container, LightSource, and Lockable services.

**Usage Example**:
```typescript
// Open a container
const result = itemService.openItem('box');
if (result.success) {
  const contents = itemService.getContainerContents('box');
}

// Light a lamp
const lightResult = itemService.lightOn('lamp');

// Lock a door
const lockResult = itemService.lockItem('door', 'brass_key');
```

**Dependencies**: GameStateService
**Used By**: Commands (take, open, close, examine, read, put)

---

### 5. ScoringService

**Implementation**: `src/services/ScoringService.ts` (317 lines)
**Interface**: `src/services/interfaces/IScoringService.ts` (123 lines)

**Purpose**: Manages all scoring mechanics including treasure points, event bonuses, and progress tracking.

**Key Responsibilities**:
- Treasure scoring (base points + deposit bonuses)
- Scene first-visit scoring
- One-time event scoring (combat, puzzles, achievements)
- Score validation and maximum score tracking
- Progress tracking for treasures and achievements
- Rank calculation based on score

**Key Methods**:

```typescript
// Treasure scoring
calculateTreasureScore(treasureId: string): number
calculateDepositScore(treasureId: string): number
awardDepositScore(treasureId: string): boolean

// Scene scoring
calculateSceneScore(sceneId: string): number
awardSceneScore(sceneId: string): boolean

// Event scoring
awardEventScore(eventId: string): boolean
getEventPoints(eventId: string): number

// Progress tracking
getTreasuresFound(): string[]
getTreasuresDeposited(): string[]
getCompletedEvents(): string[]
hasScored(eventId: string): boolean

// Score queries
getTotalPossibleScore(): number
getCurrentRank(): string
getRankForScore(score: number): string
getMaxScore(): number

// Validation
isValidTreasure(itemId: string): boolean
hasTreasureBeenFound(treasureId: string): boolean
hasTreasureBeenDeposited(treasureId: string): boolean
```

**Scoring System**:
- **Max Score**: 350 points (authentic Zork)
- **Treasure Base Points**: Awarded when first discovered
- **Deposit Bonuses**: Awarded when placed in trophy case
- **Scene Points**: First visit to special locations
- **Event Points**: Puzzle solutions, combat victories

**Rank System**:
```typescript
0-49: Beginner
50-99: Amateur Adventurer
100-199: Novice Adventurer
200-249: Junior Adventurer
250-299: Adventurer
300-329: Master Adventurer
330-349: Wizard
350: Master
```

**Usage Example**:
```typescript
// Award treasure deposit bonus
if (scoringService.awardDepositScore('lamp')) {
  // Points awarded, flag set automatically
}

// Check if treasure already deposited
if (!scoringService.hasTreasureBeenDeposited('lamp')) {
  // Can award points
}

// Get player rank
const rank = scoringService.getCurrentRank();
```

**Dependencies**: GameStateService
**Used By**: Commands (put, look, take), SceneService

---

### 6. PersistenceService

**Implementation**: `src/services/PersistenceService.ts` (271 lines)
**Interface**: `src/services/interfaces/IPersistenceService.ts` (24 lines)

**Purpose**: Handles saving and restoring complete game state to/from browser localStorage.

**Key Responsibilities**:
- Save complete game state to localStorage
- Restore game state from localStorage
- Validate saved data integrity
- Handle storage quota and errors
- Support single save slot (authentic Zork behavior)

**Key Methods**:

```typescript
// Save/Restore operations
saveGame(): boolean
restoreGame(): GameState | null

// Storage management
hasSavedGame(): boolean
clearSavedGame(): void
getSaveMetadata(): SaveMetadata

// Validation
validateSavedData(data: any): boolean
```

**Storage Format**:
```typescript
{
  version: string;           // Save format version
  timestamp: number;         // Save time (ms since epoch)
  gameState: {
    currentScene: string;
    inventory: string[];
    flags: Record<string, boolean>;
    score: number;
    moves: number;
    visitedScenes: string[];
    itemStates: Record<string, any>;
    sceneStates: Record<string, any>;
    // ... complete state
  }
}
```

**Features**:
- Validates data before restore
- Handles corrupted saves gracefully
- Single save slot (overwrites previous)
- LocalStorage key: `zork_save_v1`

**Usage Example**:
```typescript
// Save current game
if (persistenceService.saveGame()) {
  console.log('Game saved successfully');
}

// Check for saved game
if (persistenceService.hasSavedGame()) {
  const state = persistenceService.restoreGame();
  if (state) {
    gameStateService.setGameState(state);
  }
}
```

**Dependencies**: GameStateService
**Used By**: Commands (save, restore)

---

### 7. OutputService

**Implementation**: `src/services/OutputService.ts` (131 lines)
**Interface**: `src/services/interfaces/IOutputService.ts` (34 lines)

**Purpose**: Formats output messages and provides consistent display utilities.

**Key Responsibilities**:
- Message formatting and styling
- Item list formatting
- Exit list formatting
- Command result formatting

**Key Methods**:

```typescript
// Message formatting
formatMessage(message: string): string
formatError(error: string): string
formatSuccess(message: string): string

// List formatting
formatItemList(items: string[]): string
formatExitList(exits: string[]): string

// Command output
formatCommandResult(result: CommandResult): string
```

**Usage Example**:
```typescript
// Format item list
const items = ['lamp', 'sword', 'coin'];
const formatted = outputService.formatItemList(items);
// "You are carrying:\n  lamp\n  sword\n  coin"

// Format exits
const exits = ['north', 'south', 'west'];
const formattedExits = outputService.formatExitList(exits);
// "Exits: north, south, west"
```

**Dependencies**: LoggingService
**Used By**: Commands (for consistent output formatting)

---

### 8. CommandService

**Implementation**: `src/services/CommandService.ts` (309 lines)
**Interface**: `src/services/interfaces/ICommandService.ts` (79 lines)

**Purpose**: Manages command registration, matching, and retrieval.

**Key Responsibilities**:
- Command registration
- Command matching by name and aliases
- Command suggestions and autocomplete
- Command metadata management

**Key Methods**:

```typescript
// Command registration
registerCommand(command: ICommand): void
registerCommands(commands: ICommand[]): void
unregisterCommand(name: string): void

// Command matching
findCommand(input: string): ICommand | undefined
matchesCommand(input: string, command: ICommand): boolean

// Command queries
getAllCommands(): ICommand[]
getCommandByName(name: string): ICommand | undefined
getCommandCount(): number

// Suggestions
getCommandSuggestions(input: string): string[]
```

**Features**:
- Matches primary names and aliases
- Case-insensitive matching
- Autocomplete support
- Command help text management

**Usage Example**:
```typescript
// Register commands
commandService.registerCommands([
  lookCommand,
  moveCommand,
  examineCommand
]);

// Find command by input
const command = commandService.findCommand('x mailbox');
// Returns examineCommand (matches alias 'x')
```

**Dependencies**: None
**Used By**: CommandProcessor

---

### 9. CommandProcessor

**Implementation**: `src/services/CommandProcessor.ts` (65 lines)
**Interface**: `src/services/interfaces/ICommandProcessor.ts` (37 lines)

**Purpose**: Executes commands by matching input to registered commands and handling execution pipeline.

**Key Responsibilities**:
- Parse user input
- Match to registered commands
- Execute commands
- Handle command results (move counting, score changes, scene changes)

**Key Methods**:

```typescript
// Command execution
processCommand(input: string): CommandResult

// Result handling (internal)
handleCommandResult(result: CommandResult): void
```

**Execution Flow**:
```
User Input
    ↓
CommandProcessor.processCommand(input)
    ↓
CommandService.findCommand(input)
    ↓
Command.execute(input)
    ↓
Handle result (moves, score, scene change)
    ↓
Return CommandResult
```

**Usage Example**:
```typescript
// Process user input
const result = commandProcessor.processCommand('take lamp');

// Result includes:
// - success: boolean
// - message: string
// - countsAsMove: boolean
// - scoreChange?: number
// - moveToScene?: string
```

**Dependencies**: CommandService, GameStateService
**Used By**: UI/CLI layer

---

### 10. LoggingService

**Implementation**: `src/services/LoggingService.ts` (115 lines)
**Interface**: None (utility service)

**Purpose**: Provides logging infrastructure with multiple log levels.

**Key Responsibilities**:
- Create named loggers
- Set log levels globally and per-logger
- Support debug, info, warn, error levels
- Configure output format

**Key Methods**:

```typescript
// Logger creation
getLogger(name: string): Logger

// Level management
setDefaultLevel(level: LogLevel): void
setLogLevel(loggerName: string, level: LogLevel): void

// Configuration
configure(options: LoggingOptions): void
```

**Log Levels**:
- **TRACE**: Detailed debugging
- **DEBUG**: Development debugging
- **INFO**: General information
- **WARN**: Warnings
- **ERROR**: Errors

**Usage Example**:
```typescript
const logger = loggingService.getLogger('GameController');
logger.info('Game started');
logger.debug('Loading scene:', sceneId);
logger.error('Failed to load item:', error);
```

**Dependencies**: None
**Used By**: All services

---

## Not Implemented

### CombatService

**Interface**: `src/services/interfaces/ICombatService.ts` (50 lines)
**Implementation**: ❌ None (`combat: null as any` in ServiceInitializer)

**Planned Responsibilities**:
- Monster combat mechanics
- Damage calculation
- Monster AI and behaviors
- Combat results and experience

**Current Status**: Interface defined but not implemented. Combat commands (attack, fight, kill) not yet implemented.

---

## Service Initialization

### ServiceInitializer

**Location**: `src/initializers/ServiceInitializer.ts` (168 lines)

**Purpose**: Creates and configures all game services with proper dependency injection.

**Initialization Order**:

```typescript
// 1. Create logging service (no dependencies)
const loggingService = new LoggingService();

// 2. Create GameStateService (logging only)
const gameStateService = new GameStateService('west_of_house', logger);
gameStateService.loadGameData(items, scenes, monsters);

// 3. Create services dependent on GameStateService
const sceneService = new SceneService(gameStateService, logger);
const inventoryService = new InventoryService(gameStateService, logger);
const itemService = new ItemService(gameStateService, logger);
const outputService = new OutputService(logger);
const scoringService = new ScoringService(gameStateService, logger);
const persistenceService = new PersistenceService(gameStateService, logger);

// 4. Inject cross-dependencies
sceneService.setInventoryService(inventoryService);
sceneService.setScoringService(scoringService);

// 5. Return Services object
return {
  gameState,
  scene,
  inventory,
  items,
  combat: null,  // Not implemented
  persistence,
  output,
  scoring
};
```

**Services Interface**:
```typescript
export interface Services {
  gameState: IGameStateService;
  scene: ISceneService;
  inventory: IInventoryService;
  items: IItemService;
  combat: ICombatService;        // null in current implementation
  persistence: IPersistenceService;
  output: IOutputService;
  scoring: IScoringService;
}
```

**Important Notes**:
- **No Service Registry Pattern**: Services are directly instantiated, not retrieved from a registry
- **Compile-Time Dependency Injection**: Dependencies passed in constructors
- **Mock Combat Service**: `combat` is null but typed to satisfy interface requirements

---

## Testing Services

### Unit Testing Approach

Services are designed for testability with dependency injection:

```typescript
describe('ItemService', () => {
  let itemService: ItemService;
  let mockGameState: jest.Mocked<IGameStateService>;

  beforeEach(() => {
    // Create mock dependencies
    mockGameState = createMockGameStateService();

    // Inject mocks
    itemService = new ItemService(mockGameState, mockLogger);
  });

  it('should open a container', () => {
    mockGameState.getItem.mockReturnValue(closedBox);

    const result = itemService.openItem('box');

    expect(result.success).toBe(true);
    expect(mockGameState.updateItemState).toHaveBeenCalledWith('box', { open: true });
  });
});
```

### Integration Testing

Services tested together with real data in integration tests:

```typescript
describe('Scene Integration Tests', () => {
  let services: Services;

  beforeEach(async () => {
    const gameData = await GameInitializer.initialize(loggingService);
    services = ServiceInitializer.initialize(gameData, loggingService);
  });

  it('should move between scenes', () => {
    services.gameState.setCurrentScene('west_of_house');

    const exits = services.scene.getAvailableExits('west_of_house');

    expect(exits).toContain({ direction: 'north', to: 'north_of_house' });
  });
});
```

---

## Service Statistics

### Implementation Summary

| Metric | Count |
|--------|-------|
| **Total Services** | 10 implemented + 1 interface-only |
| **Total Implementation Lines** | 2,891 lines |
| **Total Interface Lines** | 704 lines |
| **Largest Service** | ItemService (806 lines) |
| **Most Methods** | ItemService (25+ public methods) |
| **Average Service Size** | 289 lines |

### Service Sizes

```
ItemService:          806 lines ████████████████████
SceneService:         506 lines ████████████
ScoringService:       317 lines ████████
CommandService:       309 lines ████████
PersistenceService:   271 lines ███████
InventoryService:     195 lines █████
GameStateService:     176 lines ████
OutputService:        131 lines ███
LoggingService:       115 lines ███
CommandProcessor:      65 lines ██
```

---

## SOLID Principles Compliance

### Single Responsibility Principle (SRP) ✅

Each service has one clear responsibility:
- GameStateService: State management
- SceneService: Scene operations
- ItemService: Item interactions (containers + lights + locks combined)
- ScoringService: Score calculation
- etc.

**Note**: ItemService intentionally combines container, light source, and lock operations because they all operate on item state - this is still SRP.

### Open-Closed Principle (OCP) ✅

Services can be extended without modification:
- New commands can use existing service methods
- Service methods can be overridden in tests
- Interfaces allow for alternative implementations

### Liskov Substitution Principle (LSP) ✅

Any IService implementation can replace another:
- Mock services in tests
- Real services in production
- Same contract guaranteed by TypeScript

### Interface Segregation Principle (ISP) ✅

Focused interfaces - no fat interfaces:
- Each service interface only includes methods needed for that service
- Commands depend only on services they actually use
- No forced dependencies on unused methods

### Dependency Inversion Principle (DIP) ✅

High-level modules depend on abstractions:
- Commands depend on `IGameStateService`, not `GameStateService`
- Services injected via constructors
- Easy to mock and test

---

## Future Service Development

### Planned Services

1. **CombatService** - Currently null, needs implementation for:
   - Monster combat mechanics
   - Damage calculation
   - Combat AI
   - Weapon integration

2. **MonsterService** - May be needed for:
   - Monster movement and AI
   - Monster state management
   - Monster interactions beyond combat

3. **PuzzleService** - For complex puzzle mechanics:
   - Multi-step puzzle tracking
   - Puzzle state validation
   - Hint system

### Service Enhancement Opportunities

- **ItemService**: Could be split into ItemService + ContainerService + LightService if it grows too large
- **SceneService**: Atmospheric messages and random events
- **ScoringService**: Achievement system, leaderboards
- **PersistenceService**: Multiple save slots, cloud saves

---

## Related Documentation

- [Command Reference](../commands/command-reference.md) - Commands that use these services
- [Command Implementation Guide](../commands/command-implementation-guide.md) - How commands interact with services
- [Scene Integration Testing Guide](../testing/scene-integration-testing-guide.md) - Testing with real services
- [Architecture Overview](../README.md) - Overall system architecture

## Summary

The Zork service layer provides a clean, testable architecture with 10 fully-implemented services handling all game mechanics. Services follow SOLID principles with clear responsibilities and dependency injection. The ItemService consolidates container, light source, and lock operations into a single cohesive service, while specialized services handle scoring, persistence, and scene management.

**Total Implementation**: 2,891 lines of battle-tested service code + 704 lines of TypeScript interfaces = robust, maintainable game architecture.
