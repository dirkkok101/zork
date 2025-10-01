# Zork Service Layer Documentation

This directory contains comprehensive documentation for the service layer in the Zork game implementation.

## Overview

The Zork game uses a service-oriented architecture with **10 implemented services** (2,891 lines total) that handle all game logic and state management. Services follow SOLID principles with dependency injection and interface-based design.

## Service Architecture

```
Presentation Layer (UI)
       ↓
Command Layer (Commands orchestrate services)
       ↓
Services Layer (Business logic)
       ↓
Data Access Layer (Game state and data)
```

## Implemented Services

### Core State Services
- **GameStateService** (176 lines) - Central state management, score, flags, moves, data access
- **SceneService** (506 lines) - Scene navigation, exits, doors, lighting
- **InventoryService** (195 lines) - Player inventory, capacity, weight management

### Domain Services
- **ItemService** (806 lines) - Item interactions, **consolidates containers + light sources + locks**
- **ScoringService** (317 lines) - Treasure scoring, events, ranking system
- **CombatService** - Interface exists but **NOT implemented** (null service)

### Infrastructure Services
- **PersistenceService** (271 lines) - Save/restore to localStorage
- **OutputService** (131 lines) - Message formatting, text wrapping
- **CommandService** (309 lines) - Command registration and lookup
- **CommandProcessor** (65 lines) - Command execution orchestration
- **LoggingService** (115 lines) - Logging infrastructure with log levels

## Documentation

### [Service Reference](./service-reference.md)
Complete API reference for all 10 services including:
- Method signatures and parameters
- Return types and error handling
- Usage examples
- Service dependencies
- Implementation details

### [Service Implementation Guide](./service-implementation-guide.md)
Step-by-step guide for adding new services:
- When to create new services vs extending existing ones
- Service categories and patterns
- Dependency injection patterns
- Testing strategy
- Best practices and common pitfalls
- Complete implementation checklist

## Key Architectural Patterns

### Dependency Injection
Services use constructor injection for required dependencies and setter injection for circular dependencies:

```typescript
// Constructor injection
constructor(
  gameState: IGameStateService,
  logger: log.Logger
) {
  this.gameState = gameState;
  this.logger = logger;
}

// Setter injection (circular dependencies)
setInventoryService(inventory: IInventoryService): void {
  this.inventory = inventory;
}
```

### Service Initialization
Services are initialized in dependency order via `ServiceInitializer` (no registry pattern):

```typescript
// 1. Core state (no dependencies)
const gameStateService = new GameStateService('west_of_house', logger);

// 2. Domain services (depend on gameState)
const sceneService = new SceneService(gameStateService, logger);
const inventoryService = new InventoryService(gameStateService, logger);

// 3. Cross-service dependencies
sceneService.setInventoryService(inventoryService);
```

### Interface Segregation
Each service has a focused interface in `src/services/interfaces/`:
- Lean interfaces with only essential methods
- No "fat" interfaces with unrelated methods
- Clear separation of concerns

## Service Design Principles

### Single Responsibility
Each service has one clear responsibility:
- ✅ **ItemService**: All item interactions (containers, lights, locks)
- ❌ **NOT**: Separate ContainerService, LightSourceService, WeaponService

### Consolidation Pattern
ItemService demonstrates consolidation - it handles:
- Basic item operations (examine, take, drop)
- Container operations (open, close, put items in)
- Light source operations (turn on/off, fuel)
- Lock operations (lock/unlock)

This consolidation works because all operations share common item state management patterns.

### State Management
Services don't hold state - they operate on GameState:
```typescript
// ✅ Good - uses GameStateService
addItem(itemId: string): boolean {
  this.gameState.addToInventory(itemId);
  return true;
}

// ❌ Bad - holds state
private inventory: string[] = [];
addItem(itemId: string): boolean {
  this.inventory.push(itemId);
  return true;
}
```

## Testing

Services are designed for comprehensive testing:

### Unit Tests
- Test service methods in isolation
- Mock dependencies using interfaces
- Located in `src/services/__tests__/`

### Integration Tests
- Test service interactions with real implementations
- Use test factories for setup
- Located in `testing/scenes/*/integration_tests/`

## SOLID Principles

All services follow SOLID principles:
- **S**ingle Responsibility - Each service has one clear purpose
- **O**pen-Closed - Open for extension, closed for modification
- **L**iskov Substitution - Implementations are substitutable for interfaces
- **I**nterface Segregation - Lean, focused interfaces
- **D**ependency Inversion - Depend on abstractions, not implementations

## Related Documentation

- [Command Reference](../commands/command-reference.md) - How commands use services
- [Command Implementation Guide](../commands/command-implementation-guide.md) - Adding new commands
- [Testing Guidelines](../testing/testing-guidelines.md) - Testing strategy
- [Architecture Overview](../README.md) - System architecture

## Archive

Obsolete service documentation (describing non-existent services) has been moved to the `archive/` directory for historical reference. **Do not use archived documentation** - it describes an architecture that was never implemented.

## Summary

The service layer provides:
- Clean separation of concerns
- Dependency injection for testability
- Interface-based design for flexibility
- Consolidated domain services (ItemService)
- Infrastructure services for cross-cutting concerns
- SOLID principles throughout

For complete API details, see [Service Reference](./service-reference.md).

For implementation guidance, see [Service Implementation Guide](./service-implementation-guide.md).
