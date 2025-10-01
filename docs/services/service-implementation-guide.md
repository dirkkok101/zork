# Service Implementation Guide

## Overview

This guide walks through the process of adding or modifying services in the Zork game. Services follow a consistent architecture pattern with interface-based design, dependency injection, and comprehensive testing.

## Service Architecture Principles

### When to Create a New Service

Create a new service when:
- **Single Responsibility**: The functionality represents a distinct domain concept
- **Reusability**: Multiple commands need the same business logic
- **Testability**: Logic needs to be tested independently of commands
- **Complexity**: The logic is too complex for a single command

### When to Extend an Existing Service

Extend an existing service when:
- **Related Functionality**: New behavior belongs to existing domain (e.g., adding new item state to ItemService)
- **Shared State**: Functionality operates on the same underlying data
- **Cohesion**: New methods complement existing service responsibilities

**Example**: ItemService consolidates containers, light sources, and locks because they all operate on item state and share common validation patterns.

## Service Categories

### 1. Core State Services
- **GameStateService**: Central state management (score, flags, moves, scene)
- **SceneService**: Scene navigation and room logic
- **InventoryService**: Player inventory management

### 2. Domain Services
- **ItemService**: Item interactions (containers, lights, locks, state)
- **ScoringService**: Treasure scoring and ranking
- **CombatService**: Monster combat and AI (interface only - not implemented)

### 3. Infrastructure Services
- **PersistenceService**: Save/restore game state
- **OutputService**: Message formatting and display
- **CommandService**: Command registration and lookup
- **CommandProcessor**: Command execution orchestration
- **LoggingService**: Logging infrastructure

## Service Implementation Steps

### Step 1: Define Service Interface

Create interface in `src/services/interfaces/`:

```typescript
// src/services/interfaces/IYourService.ts

/**
 * Your Service Interface
 *
 * Description of service responsibility and domain.
 * Explain what this service manages and why it exists as a separate service.
 */
export interface IYourService {
  /**
   * Primary method description
   * @param param - Parameter description
   * @returns Return value description
   */
  yourMethod(param: string): YourReturnType;

  /**
   * Another method description
   * @param id - Item ID or similar
   * @returns Return value description
   */
  anotherMethod(id: string): boolean;
}
```

**Interface Design Principles**:
- **Lean interfaces**: Only essential methods
- **Clear method names**: Describe what, not how
- **Typed parameters**: Use specific types, not `any`
- **JSDoc comments**: Complete documentation for all methods
- **Return types**: Always specify explicit return types

### Step 2: Implement Service Class

Create implementation in `src/services/`:

```typescript
// src/services/YourService.ts

import log from 'loglevel';
import { IYourService } from './interfaces/IYourService';
import { IGameStateService } from './interfaces/IGameStateService';

/**
 * Your Service Implementation
 *
 * Detailed description of what this service does.
 * Explain the domain logic, state management, and key responsibilities.
 *
 * Dependencies:
 * - GameStateService: For state access
 * - Other dependencies as needed
 */
export class YourService implements IYourService {
  private gameState: IGameStateService;
  private logger: log.Logger;

  /**
   * Constructor
   * @param gameState - Game state service for state access
   * @param logger - Logger instance
   */
  constructor(
    gameState: IGameStateService,
    logger: log.Logger = log.getLogger('YourService')
  ) {
    this.gameState = gameState;
    this.logger = logger;

    this.logger.debug('YourService initialized');
  }

  /**
   * Implementation of interface method
   * @param param - Parameter description
   * @returns Return value description
   */
  yourMethod(param: string): YourReturnType {
    this.logger.debug(`yourMethod called with: ${param}`);

    try {
      // 1. Validate input
      if (!param) {
        this.logger.warn('yourMethod called with empty param');
        return this.getDefaultValue();
      }

      // 2. Access state if needed
      const currentState = this.gameState.getState();

      // 3. Implement business logic
      const result = this.performLogic(param, currentState);

      // 4. Update state if needed
      if (result.shouldUpdateState) {
        this.gameState.setFlag('some_flag', true);
      }

      this.logger.debug(`yourMethod completed successfully`);
      return result;

    } catch (error) {
      this.logger.error('Error in yourMethod:', error);
      throw error;
    }
  }

  /**
   * Private helper method
   */
  private performLogic(param: string, state: GameState): YourReturnType {
    // Implementation details
    return {} as YourReturnType;
  }

  /**
   * Private helper for default values
   */
  private getDefaultValue(): YourReturnType {
    return {} as YourReturnType;
  }
}
```

### Step 3: Export Service

Add to `src/services/interfaces/index.ts`:

```typescript
export type { IYourService } from './IYourService';
```

Add to `src/services/index.ts`:

```typescript
export { YourService } from './YourService';
```

### Step 4: Register Service in ServiceInitializer

Update `src/initializers/ServiceInitializer.ts`:

```typescript
import { YourService } from '../services/YourService';

export class ServiceInitializer {
  static initialize(loggingService: LoggingService): Services {
    const logger = loggingService.getLogger('ServiceInitializer');
    logger.info('Initializing services...');

    // Create core services first (order matters for dependencies)
    const gameStateService = new GameStateService('west_of_house', logger);

    // Create your service with dependencies
    const yourService = new YourService(
      gameStateService,
      loggingService.getLogger('YourService')
    );

    // Cross-dependency injection if needed
    // yourService.setSomeOtherService(someOtherService);

    return {
      gameState: gameStateService,
      scene: sceneService,
      inventory: inventoryService,
      items: itemService,
      combat: null as any,  // Not implemented
      persistence: persistenceService,
      output: outputService,
      scoring: scoringService,
      your: yourService  // Add your service here
    };
  }
}
```

**Important**: Update the `Services` type in `src/types/ServiceTypes.ts`:

```typescript
export interface Services {
  gameState: IGameStateService;
  scene: ISceneService;
  inventory: IInventoryService;
  items: IItemService;
  combat: ICombatService;
  persistence: IPersistenceService;
  output: IOutputService;
  scoring: IScoringService;
  your: IYourService;  // Add your service
}
```

### Step 5: Add Unit Tests

Create test file `src/services/__tests__/YourService.test.ts`:

```typescript
import { YourService } from '../YourService';
import { GameStateService } from '../GameStateService';
import log from 'loglevel';

describe('YourService', () => {
  let yourService: YourService;
  let gameStateService: GameStateService;
  let logger: log.Logger;

  beforeEach(() => {
    logger = log.getLogger('TestYourService');
    logger.setLevel('silent');

    gameStateService = new GameStateService('west_of_house', logger);
    yourService = new YourService(gameStateService, logger);
  });

  describe('yourMethod', () => {
    it('should perform operation successfully', () => {
      const result = yourService.yourMethod('test');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle empty input', () => {
      const result = yourService.yourMethod('');

      expect(result).toBeDefined();
      // Verify default behavior
    });

    it('should update game state when needed', () => {
      yourService.yourMethod('test');

      const flag = gameStateService.getFlag('some_flag');
      expect(flag).toBe(true);
    });
  });

  describe('anotherMethod', () => {
    it('should return true for valid input', () => {
      const result = yourService.anotherMethod('valid_id');

      expect(result).toBe(true);
    });

    it('should return false for invalid input', () => {
      const result = yourService.anotherMethod('invalid_id');

      expect(result).toBe(false);
    });
  });
});
```

## Service Design Patterns

### Pattern 1: State Access Service (Read-Only)

Services that only read state (no modifications):

```typescript
export class OutputService implements IOutputService {
  // No gameState dependency needed if purely formatting
  // Just transforms data without side effects

  formatMessage(text: string): string {
    return this.wrapText(text);
  }
}
```

**Characteristics**:
- No state dependencies or minimal dependencies
- Pure functions where possible
- No side effects
- Simple to test

### Pattern 2: State Management Service

Services that manage their own domain state:

```typescript
export class InventoryService implements IInventoryService {
  private gameState: IGameStateService;

  addItem(itemId: string): boolean {
    const inventory = this.gameState.getInventory();

    // Validation
    if (!this.canAddItem(itemId)) {
      return false;
    }

    // State update
    this.gameState.addToInventory(itemId);
    return true;
  }
}
```

**Characteristics**:
- Depends on GameStateService
- Encapsulates domain rules
- Validates before state changes
- Returns success/failure

### Pattern 3: Cross-Service Orchestration

Services that coordinate between multiple services:

```typescript
export class SceneService implements ISceneService {
  private gameState: IGameStateService;
  private inventory?: IInventoryService;
  private scoring?: IScoringService;

  // Setter injection for circular dependencies
  setInventoryService(inventory: IInventoryService): void {
    this.inventory = inventory;
  }

  setScoringService(scoring: IScoringService): void {
    this.scoring = scoring;
  }

  enterScene(sceneId: string): SceneResult {
    // Update state
    this.gameState.setCurrentScene(sceneId);

    // Check for scoring
    if (this.scoring && !this.gameState.getFlag(`visited_${sceneId}`)) {
      this.scoring.checkSceneScoring(sceneId);
    }

    // Mark visited
    this.gameState.setFlag(`visited_${sceneId}`, true);

    return this.getCurrentScene();
  }
}
```

**Characteristics**:
- Multiple service dependencies
- Setter injection for circular deps
- Orchestrates complex workflows
- Defensive checks for optional services

### Pattern 4: Data Access Service

Services that load and provide data:

```typescript
export class GameStateService implements IGameStateService {
  private state: GameState;
  private sceneLoader: SceneLoader;
  private itemLoader: ItemLoader;

  constructor(startingScene: string, logger: log.Logger) {
    // Load data from JSON
    this.sceneLoader = new SceneLoader();
    this.itemLoader = new ItemLoader();

    // Initialize state
    this.state = this.createInitialState(startingScene);
  }

  getScene(sceneId: string): Scene | null {
    return this.sceneLoader.getScene(sceneId);
  }

  getItem(itemId: string): Item | null {
    return this.itemLoader.getItem(itemId);
  }
}
```

**Characteristics**:
- Owns data loaders
- Provides data access methods
- Caches data in memory
- Single source of truth

## Dependency Management

### Constructor Injection (Preferred)

```typescript
constructor(
  gameState: IGameStateService,
  scene: ISceneService,
  logger: log.Logger
) {
  this.gameState = gameState;
  this.scene = scene;
  this.logger = logger;
}
```

**When to use**:
- Required dependencies
- No circular dependencies
- Service fully functional after construction

### Setter Injection (Circular Dependencies)

```typescript
private inventory?: IInventoryService;

setInventoryService(inventory: IInventoryService): void {
  this.inventory = inventory;
}

someMethod(): void {
  // Defensive check
  if (!this.inventory) {
    this.logger.warn('Inventory service not set');
    return;
  }

  this.inventory.addItem('lamp');
}
```

**When to use**:
- Circular dependencies (SceneService ↔ InventoryService)
- Optional dependencies
- Late binding needed

### Initialization Order

Services must be created in dependency order:

```typescript
// 1. Core data access (no dependencies)
const gameStateService = new GameStateService(...);

// 2. Domain services (depend on gameState)
const sceneService = new SceneService(gameStateService, ...);
const inventoryService = new InventoryService(gameStateService, ...);
const itemService = new ItemService(gameStateService, ...);

// 3. Cross-service dependencies (circular)
sceneService.setInventoryService(inventoryService);
sceneService.setScoringService(scoringService);
```

## Testing Strategy

### Unit Tests

Test service methods in isolation:

```typescript
describe('ItemService', () => {
  describe('isContainer', () => {
    it('should return true for container items', () => {
      const result = itemService.isContainer('trophy_case');
      expect(result).toBe(true);
    });

    it('should return false for non-container items', () => {
      const result = itemService.isContainer('lamp');
      expect(result).toBe(false);
    });

    it('should handle unknown items', () => {
      const result = itemService.isContainer('nonexistent');
      expect(result).toBe(false);
    });
  });
});
```

### Integration Tests

Test service interactions:

```typescript
describe('SceneService + InventoryService Integration', () => {
  it('should handle scene transitions with item movement', () => {
    // Setup
    inventoryService.addItem('lamp');

    // Change scene
    sceneService.moveToScene('dark_room');

    // Verify inventory persists
    const inventory = inventoryService.getInventory();
    expect(inventory).toContain('lamp');
  });
});
```

### State Tests

Test state management:

```typescript
describe('GameStateService state management', () => {
  it('should persist flags across operations', () => {
    gameStateService.setFlag('mailbox_open', true);

    const flag = gameStateService.getFlag('mailbox_open');
    expect(flag).toBe(true);
  });

  it('should track score changes', () => {
    const initialScore = gameStateService.getScore();
    gameStateService.addScore(10);

    const newScore = gameStateService.getScore();
    expect(newScore).toBe(initialScore + 10);
  });
});
```

## Best Practices

### 1. Interface Segregation

Keep interfaces focused on single responsibilities:

```typescript
// ✅ Good - focused interface
export interface IInventoryService {
  getInventory(): string[];
  addItem(itemId: string): boolean;
  removeItem(itemId: string): boolean;
  canAddItem(itemId: string): boolean;
}

// ❌ Bad - mixed responsibilities
export interface IMegaService {
  getInventory(): string[];
  addItem(itemId: string): boolean;
  getCurrentScene(): Scene;  // Scene responsibility
  formatMessage(text: string): string;  // Output responsibility
}
```

### 2. Immutable State Access

Return copies or read-only data:

```typescript
// ✅ Good - returns copy
getInventory(): string[] {
  return [...this.gameState.getInventory()];
}

// ❌ Bad - returns reference (can be mutated)
getInventory(): string[] {
  return this.gameState.getInventory();
}
```

### 3. Defensive Programming

Validate inputs and check dependencies:

```typescript
addItem(itemId: string): boolean {
  // Validate input
  if (!itemId || itemId.trim() === '') {
    this.logger.warn('addItem called with empty itemId');
    return false;
  }

  // Validate item exists
  const item = this.gameState.getItem(itemId);
  if (!item) {
    this.logger.warn(`Item not found: ${itemId}`);
    return false;
  }

  // Check capacity
  if (!this.canAddItem(itemId)) {
    this.logger.debug(`Cannot add item (capacity): ${itemId}`);
    return false;
  }

  // Perform operation
  this.gameState.addToInventory(itemId);
  return true;
}
```

### 4. Comprehensive Logging

Log at appropriate levels:

```typescript
// DEBUG - Detailed execution flow
this.logger.debug(`Processing item: ${itemId}`);

// INFO - Important state changes
this.logger.info(`Item added to inventory: ${itemId}`);

// WARN - Recoverable errors
this.logger.warn(`Item not found: ${itemId}`);

// ERROR - Unexpected errors
this.logger.error('Failed to load game data:', error);
```

### 5. Error Handling

Handle errors gracefully:

```typescript
// ✅ Good - returns success/failure
addItem(itemId: string): boolean {
  try {
    // ... operation
    return true;
  } catch (error) {
    this.logger.error('Error adding item:', error);
    return false;
  }
}

// ✅ Good - returns null for not found
getItem(itemId: string): Item | null {
  const item = this.items.get(itemId);
  return item || null;
}

// ❌ Bad - throws for expected cases
addItem(itemId: string): boolean {
  if (!this.canAddItem(itemId)) {
    throw new Error('Cannot add item');  // Don't throw for business rules
  }
}
```

### 6. Type Safety

Use strict types, avoid `any`:

```typescript
// ✅ Good - explicit types
interface SceneResult {
  scene: Scene;
  exits: Record<string, Exit>;
  items: string[];
}

getCurrentScene(): SceneResult {
  const scene = this.gameState.getScene(this.gameState.getCurrentScene());
  // ... build result
  return result;
}

// ❌ Bad - uses any
getCurrentScene(): any {
  return this.gameState.getScene(this.gameState.getCurrentScene());
}
```

## Common Pitfalls

### 1. Circular Dependencies Without Setter Injection

❌ **Problem**:
```typescript
// SceneService depends on InventoryService
constructor(inventory: IInventoryService) {
  this.inventory = inventory;
}

// InventoryService depends on SceneService
constructor(scene: ISceneService) {
  this.scene = scene;
}
// Cannot create either!
```

✅ **Solution**:
```typescript
// Use setter injection for one direction
class SceneService {
  private inventory?: IInventoryService;

  setInventoryService(inventory: IInventoryService): void {
    this.inventory = inventory;
  }
}
```

### 2. Direct State Modification

❌ **Problem**:
```typescript
addItem(itemId: string): boolean {
  this.gameState.state.inventory.push(itemId);  // Direct mutation
}
```

✅ **Solution**:
```typescript
addItem(itemId: string): boolean {
  this.gameState.addToInventory(itemId);  // Use service method
}
```

### 3. Missing Null Checks

❌ **Problem**:
```typescript
getItemName(itemId: string): string {
  const item = this.gameState.getItem(itemId);
  return item.name;  // Crashes if item is null
}
```

✅ **Solution**:
```typescript
getItemName(itemId: string): string | null {
  const item = this.gameState.getItem(itemId);
  return item ? item.name : null;
}
```

### 4. Inconsistent Error Handling

❌ **Problem**:
```typescript
// Some methods throw, others return null
method1(): Item {
  throw new Error('Not found');
}

method2(): Item | null {
  return null;
}
```

✅ **Solution**:
```typescript
// Consistent pattern: return null for not found, boolean for success
getItem(id: string): Item | null {
  return this.items.get(id) || null;
}

addItem(id: string): boolean {
  try {
    // ... operation
    return true;
  } catch {
    return false;
  }
}
```

### 5. Fat Services

❌ **Problem**:
```typescript
// ItemService doing too much
export class ItemService {
  // Item operations
  getItem() { }

  // Inventory operations (should be InventoryService)
  addToInventory() { }

  // Scene operations (should be SceneService)
  getSceneItems() { }

  // Combat operations (should be CombatService)
  attackWithItem() { }
}
```

✅ **Solution**:
```typescript
// Split responsibilities across services
export class ItemService {
  // Only item-specific operations
  getItem() { }
  updateItemState() { }
  isContainer() { }
}

export class InventoryService {
  // Only inventory operations
  addItem() { }
  removeItem() { }
}
```

## Service Implementation Checklist

Before submitting a new service:

- [ ] Interface defined in `src/services/interfaces/`
- [ ] Interface has JSDoc comments for all methods
- [ ] Interface uses strict types (no `any`)
- [ ] Service class implements interface
- [ ] Service has single, clear responsibility
- [ ] Dependencies injected via constructor or setters
- [ ] All methods have JSDoc comments
- [ ] Comprehensive logging at appropriate levels
- [ ] Error handling with try/catch
- [ ] Input validation on all public methods
- [ ] Returns copies/immutable data where needed
- [ ] Exported in `src/services/interfaces/index.ts`
- [ ] Exported in `src/services/index.ts`
- [ ] Added to `Services` type in `ServiceTypes.ts`
- [ ] Registered in `ServiceInitializer`
- [ ] Unit tests created (`__tests__/`)
- [ ] Integration tests if needed
- [ ] All tests pass
- [ ] TypeScript strict mode compliance
- [ ] No linting errors
- [ ] Documentation updated

## Example: Complete Service Implementation

Here's a complete example showing all patterns:

```typescript
// src/services/interfaces/IExampleService.ts
export interface IExampleService {
  /**
   * Process an item action
   * @param itemId - Item identifier
   * @param action - Action to perform
   * @returns True if successful
   */
  processItemAction(itemId: string, action: string): boolean;

  /**
   * Check if action is valid
   * @param itemId - Item identifier
   * @param action - Action to check
   * @returns True if action is valid
   */
  isValidAction(itemId: string, action: string): boolean;
}

// src/services/ExampleService.ts
import log from 'loglevel';
import { IExampleService } from './interfaces/IExampleService';
import { IGameStateService } from './interfaces/IGameStateService';
import { IItemService } from './interfaces/IItemService';

export class ExampleService implements IExampleService {
  private gameState: IGameStateService;
  private items: IItemService;
  private logger: log.Logger;

  constructor(
    gameState: IGameStateService,
    items: IItemService,
    logger: log.Logger = log.getLogger('ExampleService')
  ) {
    this.gameState = gameState;
    this.items = items;
    this.logger = logger;

    this.logger.debug('ExampleService initialized');
  }

  processItemAction(itemId: string, action: string): boolean {
    this.logger.debug(`processItemAction: ${itemId}, ${action}`);

    // Validate input
    if (!itemId || !action) {
      this.logger.warn('Invalid input to processItemAction');
      return false;
    }

    // Check if valid
    if (!this.isValidAction(itemId, action)) {
      this.logger.debug(`Invalid action: ${action} for ${itemId}`);
      return false;
    }

    try {
      // Perform action
      const result = this.performAction(itemId, action);

      if (result) {
        this.logger.info(`Action completed: ${action} on ${itemId}`);
      }

      return result;

    } catch (error) {
      this.logger.error('Error processing action:', error);
      return false;
    }
  }

  isValidAction(itemId: string, action: string): boolean {
    const item = this.items.getItem(itemId);

    if (!item) {
      return false;
    }

    // Check item state
    const validActions = this.getValidActions(item);
    return validActions.includes(action);
  }

  private performAction(itemId: string, action: string): boolean {
    // Implementation
    this.gameState.setFlag(`${itemId}_${action}`, true);
    return true;
  }

  private getValidActions(item: Item): string[] {
    // Implementation
    return ['open', 'close', 'examine'];
  }
}
```

## Related Documentation

- [Service Reference](./service-reference.md) - Complete API reference for all services
- [Command Implementation Guide](../commands/command-implementation-guide.md) - How commands use services
- [Testing Guidelines](../testing/testing-guidelines.md) - Testing strategy
- [Architecture Overview](../README.md) - System architecture

## Summary

Implementing a new service involves:
1. Define lean interface in `interfaces/`
2. Implement service with proper dependency injection
3. Add to `ServiceInitializer` in correct order
4. Write comprehensive unit tests
5. Update `Services` type
6. Document in service reference

Following these patterns ensures consistency, testability, and maintainability across all services.
