# Zork: Great Underground Empire

A 100% authentic recreation of the original Zork 1 text adventure game using modern TypeScript architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Web Game (opens in browser)
npm run serve

# Console Game (Node.js)
npm run dev

# Build for production
npm run build
npm run build:web

# Run tests
npm test

# Type checking and linting
npm run typecheck
npm run lint
```

## Architecture

### Current Status ✅

- **Data Loading**: 214 items, 196 scenes, 9 monsters (cyclops, ghost, gnome_of_zurich, grue, guardian_of_zork, thief, troll, vampire_bat, volcano_gnome) loaded from JSON
- **Service Layer**: 10 services implemented (2,891 lines total)
  - **Core State**: `GameStateService`, `SceneService`, `InventoryService`
  - **Domain Logic**: `ItemService` (containers + lights + locks), `ScoringService`
  - **Infrastructure**: `PersistenceService`, `OutputService`, `CommandService`, `CommandProcessor`, `LoggingService`
  - **Total**: Clean architecture with dependency injection, SOLID principles
  - See [Service Reference](./docs/services/service-reference.md) for complete details
- **Command System**: Modular command architecture with service injection
- **Commands Implemented**: 12 commands with comprehensive testing (36+ aliases)
  - **Core**: `look` (l), `move` (n/s/e/w/u/d + 14 more), `examine` (x), `take` (get), `open`, `close` (shut)
  - **Inventory**: `inventory` (i), `drop`, `put` (place)
  - **Interaction**: `read`
  - **System**: `save`, `restore`
  - **Total**: 2,709 lines of command implementation + 522 lines BaseCommand
  - See [Command Reference](./docs/commands/command-reference.md) for complete details
- **Scene Integration Tests**: 15 scenes with comprehensive test coverage (7.7% of 196 total)
  - 69 test files covering commands, state validation, scoring, and user journeys
  - Automated test generator for rapid scene test creation

### Next Steps 🚧

- **Scene Test Coverage**: Expand from 15 to 50+ scenes (25% target)
- **Additional Commands**: Implement remaining commands (attack, unlock, light, etc.)
- **Combat System**: Implement CombatService (currently interface-only)
- **UI Enhancements**: Improve game interface and command suggestions
- **Test Generation**: Automate complex test scenarios beyond basic look/move

## Project Structure

```
src/
├── index.html               # Web UI entry point
├── styles.scss              # Game styling (retro terminal theme)
├── index.ts                 # Console entry point
├── commands/                # Command implementations
│   ├── BaseCommand.ts       # Base class with utilities
│   ├── LookCommand.ts       # Look command
│   └── ExamineCommand.ts    # Examine command
├── services/                # Service layer
│   ├── interfaces/          # Service interfaces
│   └── CommandService.ts    # Command registry
├── ui/                      # UI components
│   ├── GameInterface.ts     # Main game interface
│   └── GameLoader.ts        # Game data loading
├── web/                     # Web-specific code
│   └── main.ts              # Web entry point
├── data_loaders/            # Data loading from JSON
├── types/                   # TypeScript interfaces
└── examples/                # Usage examples
```

## Development

This project follows a clean architecture with:

- **Pure data structures** (no methods on data objects)
- **Service-oriented design** (business logic in services)
- **Command pattern** (commands orchestrate services)
- **Dependency injection** (services injected into commands)
- **SOLID principles** (single responsibility, interface segregation)

See `src/examples/` for usage patterns and architectural guidance.