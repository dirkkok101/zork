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
  - `monsters/`: 4 creatures (humanoids, creatures, mechanisms)
  - `mechanics/`: Game systems (scoring, death, flags, treasure)
  - `interactions/`: Command system (verbs, prepositions, syntax)

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
- **Integration Testing**: End-to-end game scenarios

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