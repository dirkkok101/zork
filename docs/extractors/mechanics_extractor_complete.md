# Mechanics Extractor Documentation

## Overview

The Mechanics Extractor (`reference/extractors/mechanics_extractor.py`) creates foundational game systems for Zork including scoring, treasures, death mechanics, and global flags. Unlike other extractors that parse MDL source files, this extractor generates hardcoded game mechanics based on the original Zork design specifications.

## Purpose and Design Philosophy

### Why Hardcoded Mechanics?

Game mechanics like scoring systems, treasure values, and death penalties are **design decisions** rather than extractable data. The original Zork's mechanics were carefully balanced by the developers and represent gameplay choices rather than data structures.

**Benefits of Hardcoded Approach:**
1. **Game Balance**: Mechanics can be tuned for optimal gameplay
2. **Clarity**: All game rules are explicitly documented
3. **Maintainability**: Easy to modify scoring or balance without parsing complex source
4. **Completeness**: Ensures no critical mechanics are missed or misinterpreted

## Architecture

### Core Systems Generated

1. **Scoring System**: Treasure values, bonus points, completion scoring
2. **Treasure System**: Treasure locations, descriptions, completion requirements  
3. **Death System**: Death penalties, respawn mechanics, resurrection messages
4. **Global Flags**: Game state flags and puzzle dependencies

### Output Structure

```
data/mechanics/
├── scoring_system.json
├── treasure_system.json  
├── death_system.json
├── global_flags.json
└── index.json
```

## Technical Implementation

### Scoring System

The scoring system implements authentic Zork treasure values and bonus mechanics:

```python
scoring_system = {
    "treasureValues": {
        "brass_lamp": 5,
        "jeweled_egg": 5,
        "platinum_bar": 10,
        "emerald": 10,
        "ruby": 10,
        "diamond": 10,
        "sapphire": 10,
        "trophy_case": 15,
        "gold_coins": 15,
        "ancient_scroll": 5,
        "crystal_trident": 15,
        "ornate_chalice": 10
    },
    "depositLocation": "trophy_case",
    "depositMultiplier": 2,
    "completionBonus": 50,
    "maxScore": 350
}
```

#### Scoring Events
Special events that award bonus points:

| Event | Points | Description |
|-------|--------|-------------|
| `first_treasure` | 5 | Finding your first treasure |
| `defeat_troll` | 25 | Defeating the troll |
| `defeat_thief` | 10 | Defeating the thief |
| `open_trophy_case` | 15 | Opening the trophy case |
| `solve_maze` | 20 | Navigating the maze |
| `reach_endgame` | 50 | Reaching the final area |

#### Score Calculation
- **Base Score**: Treasure value when found
- **Deposit Bonus**: `treasureValue × depositMultiplier` when placed in trophy case
- **Event Bonuses**: One-time awards for major achievements
- **Completion Bonus**: 50 points for finding all treasures
- **Maximum Score**: 350 points total

### Treasure System

Manages the 12 treasures required for game completion:

```python
treasure_system = {
    "totalTreasures": 12,
    "requiredForCompletion": 12,
    "treasureLocations": {
        "brass_lamp": "trophy_case",
        "jeweled_egg": "birds_nest", 
        "platinum_bar": "loud_room",
        "emerald": "bubble_room",
        "ruby": "temple",
        "diamond": "mirror_room",
        "sapphire": "gas_room",
        "gold_coins": "rainbow_room",
        "ancient_scroll": "library",
        "crystal_trident": "atlantis",
        "ornate_chalice": "treasure_room"
    }
}
```

#### Treasure Mechanics
- **All Required**: Player must find all 12 treasures to complete the game
- **Initial Locations**: Each treasure starts at a specific scene
- **Deposit Requirement**: Treasures must be placed in trophy case for full points
- **Authentic Descriptions**: Original Zork treasure descriptions preserved

### Death System

Implements Zork's resurrection mechanics:

```python
death_system = {
    "maxDeaths": 3,
    "respawnLocation": "forest_1",
    "itemsLostOnDeath": "some",
    "deathPenalty": 10,
    "deathMessages": [
        "It is now pitch black in here. You are likely to be eaten by a grue.",
        "The troll's axe removes your head from your shoulders.",
        "The cyclops finds you quite tasty.",
        "You have died from your injuries."
    ],
    "resurrectionMessages": [
        "You find yourself in a forest clearing, somehow alive again.",
        "A strange force has restored you to life.",
        "You awaken, confused but breathing."
    ]
}
```

#### Death Mechanics
- **Three Lives**: Player can die up to 3 times before game over
- **Score Penalty**: Lose 10 points per death  
- **Item Loss**: Some inventory items are lost on death
- **Respawn Location**: Always return to Forest Path clearing
- **Atmospheric Messages**: Authentic death and resurrection text

### Global Flags System

Manages game state and puzzle dependencies:

```python
global_flags = {
    "gameFlags": [
        {
            "id": "trophy_case_open",
            "name": "Trophy Case Open",
            "description": "Whether the trophy case has been opened",
            "initialValue": False,
            "scope": "global"
        },
        {
            "id": "lamp_on", 
            "name": "Lamp On",
            "description": "Whether the brass lamp is currently lit",
            "initialValue": False,
            "scope": "global"
        },
        # ... more flags
    ],
    "puzzleDependencies": {
        "open_trophy_case": ["defeat_thief"],
        "cross_troll_room": ["defeat_troll", "have_elvish_sword"],
        "enter_cyclops_room": ["cyclops_fed"],
        "reach_endgame": ["all_treasures_found"],
        "navigate_maze": ["lamp_on"]
    }
}
```

#### Flag Categories

**Progress Flags:**
- `trophy_case_open`: Trophy case accessibility
- `troll_defeated`: Troll room passage
- `thief_defeated`: Thief encounter resolution
- `maze_solved`: Maze navigation completion

**State Flags:**
- `lamp_on`: Light source status
- `dam_state`: Dam position (closed/open)
- `cyclops_fed`: Cyclops feeding status

**Puzzle Dependencies:**
Each major puzzle defines prerequisite flags that must be satisfied before the puzzle can be completed.

## Data Validation and Quality

### Consistency Checks
1. **Treasure Count**: Ensures exactly 12 treasures are defined
2. **Score Balance**: Verifies maximum achievable score equals 350
3. **Flag References**: Validates all flag dependencies reference valid flags
4. **Location References**: Confirms all treasure locations are valid scene IDs

### Completeness Verification
- All major game events have scoring entries
- All treasures have both values and locations  
- All critical flags are defined with proper initial states
- All puzzle dependencies are mapped

## Integration with Game Architecture

### Service Layer Integration
Mechanics data is consumed by various services:

- **ScoringService**: Uses scoring_system.json for points calculation
- **TreasureService**: Uses treasure_system.json for completion tracking  
- **DeathService**: Uses death_system.json for resurrection logic
- **FlagService**: Uses global_flags.json for state management

### Type Safety
All mechanics files are designed for TypeScript compatibility:

```typescript
interface ScoringSystem {
  treasureValues: Record<string, number>;
  depositLocation: string;
  depositMultiplier: number;
  completionBonus: number;
  maxScore: number;
  scoringEvents: ScoringEvent[];
}

interface TreasureSystem {
  totalTreasures: number;
  requiredForCompletion: number;
  treasureLocations: Record<string, string>;
  treasureDescriptions: Record<string, string>;
}

interface DeathSystem {
  maxDeaths: number;
  respawnLocation: string;
  itemsLostOnDeath: 'none' | 'some' | 'all';
  deathPenalty: number;
  deathMessages: string[];
  resurrectionMessages: string[];
}
```

## Maintenance and Updates

### Balancing Changes
Common modifications and their impact:

**Treasure Values:**
```python
# Increase ruby value for better game balance
"ruby": 15  # was 10
```

**Scoring Events:**
```python
# Add new bonus for discovering secret area
{
    "id": "find_secret_room",
    "description": "Discovering the hidden chamber", 
    "points": 15,
    "oneTime": True
}
```

**Death Penalties:**
```python
# Reduce death penalty for easier difficulty
"deathPenalty": 5  # was 10
```

### Adding New Mechanics
1. **New Flags**: Add to `gameFlags` array with proper metadata
2. **New Dependencies**: Update `puzzleDependencies` for new puzzles
3. **New Treasures**: Update both treasure list and scoring values
4. **New Events**: Add to `scoringEvents` with appropriate point values

### Validation Steps
Before deploying mechanics changes:

1. **Score Balance**: Verify maxScore reflects all possible points
2. **Flag Coverage**: Ensure all game states have corresponding flags
3. **Dependency Logic**: Test that puzzle dependencies are satisfiable
4. **Message Quality**: Review all user-facing text for consistency

## Design Principles

### Authentic Recreation
All mechanics values are based on analysis of original Zork gameplay:
- Treasure values match original scoring
- Death mechanics preserve original difficulty
- Flag dependencies reflect authentic puzzle structure

### Gameplay Balance
Mechanics are tuned for optimal player experience:
- Progressive difficulty curve through scoring events
- Fair death penalties that encourage exploration
- Clear completion requirements

### Extensibility
System designed for easy modification:
- JSON format allows runtime configuration
- Modular structure supports adding new mechanics
- Clear separation of data and logic

The mechanics extractor provides the essential game systems that make Zork challenging, fair, and authentic to the original experience.