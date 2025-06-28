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

- **Data Loading**: 214 items, 196 scenes, 9 monsters loaded from JSON
- **Command System**: Modular command architecture with service injection
- **Service Interfaces**: Lean service design following SOLID principles
- **Commands Implemented**: `look`, `examine` with full parsing and suggestion support

### Next Steps 🚧

- Implement service layer (GameStateService, SceneService, etc.)
- Create game loop with user input handling
- Add remaining 23 commands
- Implement UI layer

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