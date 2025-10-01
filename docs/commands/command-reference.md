# Zork Command Reference

## Overview

This document provides a complete reference for all implemented commands in the Zork game. Commands follow authentic Zork behavior while leveraging modern TypeScript architecture with service injection and comprehensive testing.

## Implementation Status

**Implemented**: 12 commands
**Total Aliases**: 36+
**Total Code**: 2,709 lines (excluding BaseCommand: 522 lines)
**Test Coverage**: Integration tests in 15 scenes

## Command Categories

### Navigation Commands
- [move](#move-command) - Navigate between scenes

### Observation Commands
- [look](#look-command) - View surroundings and objects
- [examine](#examine-command) - Detailed object inspection
- [read](#read-command) - Read text on objects

### Inventory Management Commands
- [inventory](#inventory-command) - List carried items
- [take](#take-command) - Pick up items
- [drop](#drop-command) - Drop items to scene
- [put](#put-command) - Place items in containers

### Manipulation Commands
- [open](#open-command) - Open containers and doors
- [close](#close-command) - Close containers and doors

### System Commands
- [save](#save-command) - Save game state
- [restore](#restore-command) - Restore saved game

---

## Command Details

### Move Command

**Primary Name**: `move`

**Aliases**: `go`, `walk`, `travel`, `head`, `north`, `n`, `south`, `s`, `east`, `e`, `west`, `w`, `up`, `u`, `down`, `d`, `enter`, `exit`, `in`, `out`, `northeast`, `ne`, `northwest`, `nw`, `southeast`, `se`, `southwest`, `sw`

**Usage**:
```
move <direction>
go <direction>
<direction>          (direct input: "north", "n", etc.)
```

**Examples**:
```
north
n
go north
move west
enter
exit
```

**Description**:
Core navigation command for moving between scenes. Handles:
- Cardinal directions (north, south, east, west)
- Vertical movement (up, down)
- Entry/exit commands
- Intercardinal directions (northeast, northwest, southeast, southwest)
- Validates exits before moving
- Checks conditional exits (flags, items, etc.)
- Handles locked doors
- Counts as a move for gameplay mechanics

**Implementation**: `src/commands/MoveCommand.ts` (254 lines)

**Services Used**:
- GameState - Track current location, flags, move counter
- Scene - Get available exits, validate destinations
- Inventory - Check for keys/items needed for conditional exits

**Returns**:
- `success: true` with `moveToScene: "scene_id"` on successful move
- `success: false` with appropriate error message on failure

**Testing**: Tested in 15 scenes with conditional exits, locked doors, and movement sequences

---

### Look Command

**Primary Name**: `look`

**Aliases**: `l`

**Usage**:
```
look                     (view current scene)
l                        (short form)
look around              (same as look)
look at <object>         (brief object description)
look at <exit>           (exit description)
look in <container>      (view container contents)
```

**Examples**:
```
look
l
look around
look at mailbox
look at window
look in box
```

**Description**:
Environment and spatial awareness command. Handles:
- Current scene description
- First visit vs. subsequent visit descriptions
- Exit display
- Brief object descriptions
- Container contents viewing
- Scene atmospheric elements
- Awards first-visit points (if applicable)

**Implementation**: `src/commands/LookCommand.ts` (262 lines)

**Services Used**:
- GameState - Track visited scenes, flags
- Scene - Get scene description, exits, items
- Inventory - Check carried items
- Items - Get item descriptions
- Scoring - Award first-visit points

**Returns**:
- Scene description with exits and visible items
- Brief object description for "look at"
- Container contents for "look in"

**Testing**: Primary test command in all 15 tested scenes

---

### Examine Command

**Primary Name**: `examine`

**Aliases**: `x`, `inspect`, `study`

**Usage**:
```
examine <object>
x <object>               (common short form)
inspect <object>
study <object>
```

**Examples**:
```
examine mailbox
x leaflet
inspect sword
study painting
```

**Description**:
Detailed object inspection command. Provides more detail than "look at":
- Full physical descriptions
- Container states (open/closed, locked/unlocked)
- Contents of open containers
- Hidden properties and details
- Light source information
- Weapon/tool characteristics
- Does NOT show readable text (use READ command)

**Implementation**: `src/commands/ExamineCommand.ts` (292 lines)

**Services Used**:
- GameState - Access current scene and flags
- Scene - Get scene items
- Inventory - Check carried items
- Items - Get detailed examineText, state information

**Returns**:
- Detailed description with state information
- Container contents if applicable
- Special properties (weight, size, etc.)

**Testing**: Tested in 5 scenes with various object types

---

### Take Command

**Primary Name**: `take`

**Aliases**: `get`, `pick`, `grab`

**Usage**:
```
take <object>
get <object>
pick <object>
grab <object>
take <object> from <container>
```

**Examples**:
```
take lamp
get sword
pick up leaflet
take coin from box
```

**Description**:
Pick up items from scene or containers:
- Validates item is portable
- Checks visibility
- Handles weight/capacity limits
- Removes from scene/container
- Adds to player inventory
- Awards treasure discovery points
- Triggers item-specific effects

**Implementation**: `src/commands/TakeCommand.ts` (282 lines)

**Services Used**:
- GameState - Track inventory, flags
- Scene - Remove item from scene
- Inventory - Add to player inventory, check capacity
- Items - Check portability, get item data
- Scoring - Award treasure discovery points

**Returns**:
- Success message with item name
- Score increase for treasures
- Error for non-portable or hidden items

**Testing**: Tested in 4 scenes with portable items and containers

---

### Drop Command

**Primary Name**: `drop`

**Aliases**: `leave`

**Usage**:
```
drop <object>
drop <object> down
leave <object>
```

**Examples**:
```
drop lamp
drop sword down
leave book
```

**Description**:
Simple item dropping to current scene:
- Removes from player inventory
- Places in current scene
- Maintains item state
- Does NOT handle sophisticated placement (use PUT for that)

**Implementation**: `src/commands/DropCommand.ts` (111 lines)

**Services Used**:
- GameState - Track inventory, current scene
- Scene - Add item to scene
- Inventory - Remove from player inventory
- Items - Get item data

**Returns**:
- Success message confirming drop
- Error if item not in inventory

**Testing**: Tested in 2 scenes with inventory management

---

### Put Command

**Primary Name**: `put`

**Aliases**: `place`, `position`, `set`

**Usage**:
```
put <object> in <container>
put <object> on <object>
put <object> under <object>
place <object> in <container>
```

**Examples**:
```
put coin in case
put sword in trophy case
place book on table
```

**Description**:
Sophisticated item placement operations:
- Place items in containers
- Place items on surfaces
- Place items under objects
- Validates container is open
- Checks capacity constraints
- Awards deposit bonuses for treasures in trophy case
- Triggers container-specific effects

**Implementation**: `src/commands/PutCommand.ts` (189 lines)

**Services Used**:
- GameState - Track inventory, flags
- Scene - Access containers in scene
- Inventory - Remove from player inventory, add to container
- Items - Get container data, check capacity
- Scoring - Award treasure deposit bonuses

**Returns**:
- Success message with placement details
- Score increase for treasure deposits
- Error for closed containers or capacity issues

**Testing**: Tested in 2 scenes with containers and trophy case

---

### Inventory Command

**Primary Name**: `inventory`

**Aliases**: `i`, `inv`

**Usage**:
```
inventory
i                        (short form)
inv                      (alternative short form)
```

**Examples**:
```
inventory
i
inv
```

**Description**:
Display player's current inventory:
- Lists all carried items
- Shows item names
- Indicates if inventory is empty
- Does NOT count as a move
- Utility command for player awareness

**Implementation**: `src/commands/InventoryCommand.ts` (73 lines)

**Services Used**:
- GameState - Access inventory
- Inventory - Get carried items list
- Items - Get item names

**Returns**:
- Formatted list of carried items
- "You are empty-handed." if no items

**Testing**: Tested in 1 scene with inventory operations

---

### Open Command

**Primary Name**: `open`

**Aliases**: *(none)*

**Usage**:
```
open <object>
open <container> with <key>
```

**Examples**:
```
open mailbox
open door
open chest with key
open trophy case
```

**Description**:
Open containers, doors, and other openable objects:
- Validates object can be opened
- Checks if already open
- Handles locked objects (requires key)
- Reveals container contents
- Changes object state
- Awards points for special containers (trophy case)
- Can target items in inventory or scene

**Implementation**: `src/commands/OpenCommand.ts` (207 lines)

**Services Used**:
- GameState - Track flags, access inventory
- Scene - Access scene items
- Inventory - Check for keys, access carried items
- Items - Get item state, update state
- Scoring - Award points for opening special containers

**Returns**:
- Success message with opened object name
- Container contents if applicable
- Score increase for special containers
- Error for locked or non-openable objects

**Testing**: Tested in 4 scenes with containers and doors

---

### Close Command

**Primary Name**: `close`

**Aliases**: `shut`

**Usage**:
```
close <object>
shut <object>
```

**Examples**:
```
close mailbox
close door
shut window
close box
```

**Description**:
Close containers, doors, and other closeable objects:
- Validates object can be closed
- Checks if already closed
- Changes object state
- Hides container contents
- Can target items in inventory or scene

**Implementation**: `src/commands/CloseCommand.ts` (96 lines)

**Services Used**:
- GameState - Access inventory, flags
- Scene - Access scene items
- Inventory - Access carried items
- Items - Get item state, update state

**Returns**:
- Success message confirming closure
- Error for already closed or non-closeable objects

**Testing**: Tested in 3 scenes with containers and doors

---

### Read Command

**Primary Name**: `read`

**Aliases**: *(none)*

**Usage**:
```
read <object>
```

**Examples**:
```
read leaflet
read book
read sign
read letter
```

**Description**:
Read textual content on objects:
- Shows readable text on items
- Different from EXAMINE (which shows physical description)
- Only works on items with readable content
- Examples: leaflets, books, signs, letters, engravings
- Authentic Zork separation of READ vs EXAMINE

**Implementation**: `src/commands/ReadCommand.ts` (146 lines)

**Services Used**:
- GameState - Access current scene, inventory
- Scene - Get scene items
- Inventory - Get carried items
- Items - Get readable text content

**Returns**:
- Readable text content
- Error if object has no readable content
- "There is no text to read." for non-readable items

**Testing**: Tested in 1 scene with readable items (leaflet)

---

### Save Command

**Primary Name**: `save`

**Aliases**: *(none)*

**Usage**:
```
save
```

**Examples**:
```
save
```

**Description**:
Save current game state to localStorage:
- Saves complete game state
- Single save slot (overwrites previous save)
- Counts as a move (authentic Zork behavior)
- Provides clear success/failure feedback
- Saves scene, inventory, flags, score, moves

**Implementation**: `src/commands/SaveCommand.ts` (126 lines)

**Services Used**:
- GameState - Get complete state for serialization
- Persistence - Save state to localStorage
- All services - State serialization

**Returns**:
- "Game saved successfully." on success
- Error message on failure (storage quota, permissions, etc.)

**Testing**: Not typically tested in scene integration tests (system-level command)

---

### Restore Command

**Primary Name**: `restore`

**Aliases**: *(none)*

**Usage**:
```
restore
```

**Examples**:
```
restore
```

**Description**:
Restore previously saved game state from localStorage:
- Restores complete game state
- Does NOT count as a move (authentic Zork behavior)
- Provides clear success/failure feedback
- Fails gracefully if no save exists
- Restores scene, inventory, flags, score, moves

**Implementation**: `src/commands/RestoreCommand.ts` (127 lines)

**Services Used**:
- GameState - Set complete restored state
- Persistence - Load state from localStorage
- All services - State deserialization

**Returns**:
- "Game restored successfully." on success
- "No saved game found." if no save exists
- Error message on corrupted save data

**Testing**: Not typically tested in scene integration tests (system-level command)

---

## Command Architecture

### BaseCommand Class

All commands extend `BaseCommand` which provides:

**Location**: `src/commands/BaseCommand.ts` (522 lines)

**Shared Functionality**:
- Service injection (8 services)
- Command parsing utilities
- Object finding (in scene, inventory, containers)
- Common response builders (success, failure)
- Logging infrastructure
- State validation helpers

**Services Available to All Commands**:
1. `IGameStateService` - Game state and flags
2. `ISceneService` - Scene management
3. `IInventoryService` - Inventory operations
4. `IItemService` - Item data and operations
5. `ICombatService` - Combat mechanics
6. `IPersistenceService` - Save/load operations
7. `IOutputService` - Output formatting
8. `IScoringService` - Score tracking

### Command Registration

Commands are registered in `src/initializers/CommandInitializer.ts`:

```typescript
const commands = [
  new LookCommand(services...),
  new ExamineCommand(services...),
  new MoveCommand(services...),
  new TakeCommand(services...),
  new DropCommand(services...),
  new InventoryCommand(services...),
  new OpenCommand(services...),
  new CloseCommand(services...),
  new PutCommand(services...),
  new ReadCommand(services...),
  new SaveCommand(services...),
  new RestoreCommand(services...)
];

commandService.registerCommands(commands);
```

## Command Parsing

Commands are parsed by `CommandProcessor` which:
1. Tokenizes user input
2. Matches against registered commands and aliases
3. Routes to appropriate command handler
4. Returns `CommandResult` to UI

**Example Flow**:
```
User Input: "x mailbox"
  ↓
CommandProcessor: Match "x" to ExamineCommand
  ↓
ExamineCommand.execute("mailbox")
  ↓
Find mailbox in scene/inventory
  ↓
Return examineText + state
  ↓
Display to user
```

## Testing Commands

### Scene Integration Tests

Commands tested in scene context:
- **look**: 15 scenes (primary test command)
- **move**: 15 scenes (navigation validation)
- **examine**: 5 scenes (detailed inspection)
- **take**: 4 scenes (item pickup)
- **open/close**: 4/3 scenes (container operations)
- **put**: 2 scenes (trophy case deposits)
- **drop**: 2 scenes (item management)
- **read**: 1 scene (leaflet reading)
- **inventory**: 1 scene (inventory display)

### Unit Test Coverage

Currently: **0 unit tests** (all testing via integration tests)

**Recommendation**: Add unit tests for:
- Command parsing edge cases
- Object finding logic
- Error handling paths
- State validation

## Commands NOT Yet Implemented

Based on original Zork, these commands are mentioned but not implemented:

### Combat Commands
- `attack` / `kill` / `fight` - Combat with monsters
- `swing` - Swing weapon

### Object Manipulation
- `turn` - Turn objects (e.g., bolt)
- `push` / `pull` - Physical manipulation
- `tie` / `untie` - Rope operations
- `dig` - Excavation
- `climb` - Vertical movement
- `swim` - Water navigation
- `board` / `launch` - Vehicle operations

### Item Management
- `unlock` / `lock` - Lock/unlock doors and containers
- `light` - Light sources (lamp, matches)
- `extinguish` - Extinguish lights
- `inflate` / `deflate` - Inflate objects (boat)
- `raise` / `lower` - Positional changes

### Consumption
- `eat` / `drink` - Consume food/water

### Communication
- `say` / `yell` - Speak to characters
- `pray` - Prayer (special Zork command)
- `exorcise` - Exorcise spirits

### Meta Commands
- `wait` / `z` - Pass time
- `again` / `g` - Repeat last command
- `quit` - Exit game
- `restart` - Restart game
- `score` - Show score and rank
- `version` - Show game version
- `brief` / `verbose` / `superbrief` - Description modes
- `diagnose` - Health status

### Special Commands
- `wave` - Wave objects (sceptre)
- `rub` - Rub objects (mirror)
- `ring` - Ring bell
- `knock` - Knock on door
- `kiss` - Kiss character
- `throw` - Throw objects

**Total Estimated**: ~35-40 additional commands to match original Zork

## Command Priorities for Future Implementation

### High Priority (Core Gameplay)
1. `attack` / `kill` - Combat system
2. `unlock` / `lock` - Security mechanics
3. `light` / `extinguish` - Lighting system
4. `score` - Player feedback
5. `quit` / `restart` - Game control

### Medium Priority (Enhanced Gameplay)
6. `wait` - Time mechanics
7. `again` - Quality of life
8. `turn` / `push` / `pull` - Puzzle mechanics
9. `eat` / `drink` - Survival mechanics
10. `climb` / `swim` - Alternative navigation

### Lower Priority (Special Cases)
11. Remaining special commands (wave, rub, ring, etc.)
12. Communication commands (say, yell)
13. Meta commands (version, diagnose)

## Related Documentation

- [Command Implementation Guide](./command-implementation-guide.md) - How to add new commands
- [Scene Integration Testing Guide](../testing/scene-integration-testing-guide.md) - Testing commands in scenes
- [Service Architecture](../services/README.md) - Services available to commands

## Summary

The current command implementation provides a solid foundation with 12 core commands covering:
- ✅ Navigation (move with 20+ aliases)
- ✅ Observation (look, examine, read)
- ✅ Inventory management (take, drop, put, inventory)
- ✅ Container operations (open, close)
- ✅ Game state (save, restore)

**Total Implementation**: 2,709 lines + 522 lines BaseCommand = 3,231 lines
**Test Coverage**: 69 scene integration test files
**Remaining Work**: ~35-40 commands for 100% Zork parity
