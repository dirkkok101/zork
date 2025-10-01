# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **100% authentic recreation** of the original Zork 1 text adventure game using modern web technologies. The project combines authentic game data extracted from reference materials with a modern TypeScript architecture for browsers.

## Development Commands

### Data Extraction (Python 3)
```bash
# Extract game data from reference sources
cd reference/extractors
python3 zork_extractor.py
python3 item_extractor.py  
python3 monster_extractor.py
python3 mechanics_extractor.py
python3 interactions_extractor.py
```

### Development Environment
- No build system configured yet - TypeScript files are in `src/`
- Uses TypeScript in **strict mode** with type safety requirements
- SCSS for styling (green screen retro aesthetic)
- HTML for UI components

## Architecture Overview

### 4-Layer Architecture
1. **Data Access Layer** (`src/data_access/`): Loads JSON data files into memory using type-safe interfaces
2. **Services Layer** (`src/services/`): Core game logic operating on game data 
3. **Commands Layer** (`src/commands/`): Orchestrates between services to implement game commands
4. **UI Layer** (`src/ui/`): Renders game state and handles user input

### Core Types (`src/types/`)
- **GameState.ts**: Complete game state interface with scenes, inventory, score, flags
- **SceneTypes.ts**: Scene definitions with exits, lighting, items, conditional logic
- **ItemTypes.ts**: Item system with interactions and state management
- **MonsterTypes.ts**: Creature behaviors and AI systems
- **CommandTypes.ts**: Command parsing and execution interfaces

### Data Architecture (`data/`)
- **427 JSON files** organized by category (scenes, items, monsters, mechanics, interactions)
- **Individual file per game element** for lazy loading and performance
- **TypeScript strict compatibility** - all JSON validates against interfaces
- **Hierarchical organization**:
  - `scenes/`: 196 locations (above_ground, underground, maze, endgame)
  - `items/`: 214 objects (treasures, tools, containers, weapons, consumables)
  - `monsters/`: 9 creatures (cyclops, ghost, gnome_of_zurich, grue, guardian_of_zork, thief, troll, vampire_bat, volcano_gnome)
  - `mechanics/`: Game systems (scoring, death, flags, treasure)
  - `interactions/`: Command system (verbs, prepositions, syntax)

### Command Architecture (`src/commands/`)
- **12 commands implemented** (2,709 lines + 522 lines BaseCommand)
- **36+ aliases** for authentic Zork experience
- **Service injection** for all commands (8 services per command)
- **Implemented commands**: look, examine, move, take, drop, open, close, put, read, inventory, save, restore
- **BaseCommand** provides shared utilities (parsing, object finding, result building)
- All commands registered in `CommandInitializer` with dependency injection
- See `docs/commands/command-reference.md` for complete details
- See `docs/commands/command-implementation-guide.md` for adding new commands

### Service Architecture (`src/services/`)
- **10 services implemented** (2,891 lines total)
- **Core State Services**:
  - `GameStateService` (176 lines) - Central state management, score, flags, moves, data access
  - `SceneService` (506 lines) - Scene navigation, exits, doors, lighting
  - `InventoryService` (195 lines) - Player inventory, capacity, weight management
- **Domain Services**:
  - `ItemService` (806 lines) - Item interactions, **consolidates containers + light sources + locks**
  - `ScoringService` (317 lines) - Treasure scoring, events, ranking system
  - `CombatService` - Interface exists but **NOT implemented** (null service)
- **Infrastructure Services**:
  - `PersistenceService` (271 lines) - Save/restore to localStorage
  - `OutputService` (131 lines) - Message formatting, text wrapping
  - `CommandService` (309 lines) - Command registration and lookup
  - `CommandProcessor` (65 lines) - Command execution orchestration
  - `LoggingService` (115 lines) - Logging infrastructure with log levels
- **Service Initialization**: Direct instantiation via `ServiceInitializer` (no registry pattern)
- **Dependency Injection**: Constructor injection + setter injection for circular dependencies
- See `docs/services/service-reference.md` for complete API reference
- See `docs/services/service-implementation-guide.md` for adding new services

### Testing Architecture (`testing/`)
- **Scene Integration Tests**: 15 scenes with comprehensive coverage (7.7% of 196 total)
- **Test Files**: 69 test files covering all command interactions
- **Helper Files**: 59 helper and factory files for test setup
- **Test Categories**:
  - Basic command tests (look, move, examine)
  - State validation tests (flags, inventory, scene state)
  - Scoring integration tests (treasure scoring, events)
  - User journey tests (multi-command scenarios)
- **Test Generator**: Automated tool at `tools/test-generators/` for rapid test creation
- **Complex Scenes**: west_of_house (13 tests), kitchen (10), living_room (8), attic (8)
- **Simple Scenes**: 10 scenes with basic look/move tests (2 tests each)
- **Helper Architecture**:
  - Scene helpers (item management, flag management, state verification)
  - Command helpers (execute commands, verify results)
  - Integration test factories (complete test environment setup)
- See `docs/testing/scene-integration-testing-guide.md` for comprehensive testing guide
- See `docs/testing/testing-guidelines.md` for overall testing philosophy
- See `docs/testing/unit-test-best-practices.md` for unit testing patterns

## Development Principles

### Code Quality Requirements
- **TypeScript Strict Mode**: No `any` types, explicit typing required
- **SOLID Principles**: Single responsibility, dependency injection
- **100% Test Coverage**: Unit and integration tests for commands, services, data access
- **Comprehensive Documentation**: All code must be documented
- **Type Safety**: Always work with known types, never assume structures

### Testing Strategy
- **Reference Material is Gospel**: When tests conflict with code, check original Zork behavior
- **Layer-Specific Testing**: Commands, services, and data access must be fully testable
- **Integration Testing**: Scene-based end-to-end scenarios with real services and data
- **Test Coverage Goal**: 100% coverage for commands, services, and data access
- **Scene Test Coverage**: Currently 15/196 scenes (7.7%), targeting 25%+ coverage
- **Test Generator**: Automated generation of basic tests for rapid scene coverage expansion
- **Helper Pattern**: Reusable helpers for common test operations (setup, assertions, state management)

### Logging Standards
- Use LogLevel package for debug, info, critical, error messages
- Different log levels for development vs production debugging

## Key Architectural Patterns

### Scene System
- **Conditional Logic**: Exits, items, and actions use flag-based conditions
- **State Management**: Each scene tracks visited status, items, variables
- **Lighting System**: Daylight, lit, dark, pitch_black conditions
- **Dynamic Content**: Descriptions change based on game state

### Item Interactions
- **State-Based Behavior**: Items have internal state affecting interactions
- **Contextual Actions**: Available actions depend on item state and player inventory
- **Type-Specific Logic**: Different behavior for treasures, tools, containers, weapons

### Command Processing
- **Context-Aware Suggestions**: Parser suggests commands based on current scene/items
- **Non-Spoiler Help**: Quality-of-life features without revealing solutions
- **Verb System**: Comprehensive synonym handling with syntax patterns

## Reference Materials Integration

### Original Data Sources
- **Lantern Project**: https://github.com/bburns/Lantern (primary reference)
- **MDL Source Files**: `reference/dung_mud_source.txt`, `reference/b_mud_source.txt`
- **Zork JSON**: `reference/zork_source.json` (room and exit data)

### Data Extraction Pipeline
- Python extractors convert original formats to TypeScript-compatible JSON
- Maintains 100% fidelity to original game mechanics and content
- Automatic categorization and ID conversion (UPPERCASE → snake_case)

### Data Verification
- Automated verification scripts validate extracted data against source material
- `scene_verifier.py` checks exit integrity and ID conversions
- `monster_verifier.py` validates monster data completeness
- See `docs/data/data-verification-guide.md` for complete verification procedures

## UI/UX Guidelines

### Visual Design
- **Green screen retro aesthetic** for authentic feel
- **Modern browsers compatibility** with HTML/CSS/TypeScript
- **Text-based interface** with quality-of-life improvements
- **Command suggestions** without spoiling gameplay

### User Experience
- Preserve authentic Zork 1 difficulty and discovery
- Add modern conveniences (autocomplete, history) without changing core gameplay
- Maintain original text and responses for authenticity