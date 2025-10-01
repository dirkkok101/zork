# Command Implementation Guide

## Overview

This guide walks through the process of adding new commands to the Zork game. Commands follow a consistent architecture pattern with service injection, TypeScript strict mode, and comprehensive testing.

## Prerequisites

Before implementing a command:
1. Understand the command's behavior in original Zork
2. Identify required services (GameState, Scene, Inventory, etc.)
3. Plan test scenarios
4. Review existing similar commands

## Command Implementation Steps

### Step 1: Create Command File

Create a new file in `src/commands/`:

```bash
touch src/commands/YourCommand.ts
```

**Naming Convention**: `PascalCaseCommand.ts` (e.g., `AttackCommand.ts`, `UnlockCommand.ts`)

### Step 2: Implement Command Class

```typescript
import { BaseCommand } from './BaseCommand';
import { CommandResult } from '../types/CommandTypes';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService,
  IScoringService
} from '../services/interfaces';
import log from 'loglevel';

/**
 * Your Command
 *
 * Description of what the command does:
 * - "command <target>" - Primary usage
 * - "alias <target>" - Alternative usage
 *
 * Explain command behavior, edge cases, and authentic Zork behavior.
 */
export class YourCommand extends BaseCommand {
  constructor(
    gameState: IGameStateService,
    scene: ISceneService,
    inventory: IInventoryService,
    items: IItemService,
    combat: ICombatService,
    persistence: IPersistenceService,
    output: IOutputService,
    scoring: IScoringService,
    logger?: log.Logger
  ) {
    super(
      'command',                          // Primary name
      ['alias1', 'alias2'],               // Aliases
      'command <target>',                 // Usage string
      'Description of what this command does.',  // Help text
      gameState,
      scene,
      inventory,
      items,
      combat,
      persistence,
      output,
      scoring,
      logger
    );
  }

  /**
   * Execute the command
   * @param input Raw user input (e.g., "command target")
   * @returns Command execution result
   */
  execute(input: string): CommandResult {
    this.logExecutionStart(input);

    try {
      // 1. Parse arguments
      const args = this.getArgs(input);

      if (args.length === 0) {
        return this.failure('What do you want to command?');
      }

      // 2. Extract target and preposition if needed
      const { preposition, target } = this.parseArgsWithPreposition(args);

      if (!target) {
        return this.failure('What do you want to command?');
      }

      // 3. Find target object
      const targetObject = this.findObject(target);

      if (!targetObject) {
        return this.failure(`You don't see any ${target} here.`);
      }

      // 4. Validate command can be executed
      if (!this.canExecuteOn(targetObject)) {
        return this.failure(`You can't do that to the ${targetObject.name}.`);
      }

      // 5. Execute command logic using services
      const result = this.performCommand(targetObject);

      this.logExecutionSuccess(result);
      return result;

    } catch (error) {
      this.logExecutionError(error as Error, input);
      return this.failure('Something went wrong.');
    }
  }

  /**
   * Check if command can be executed on target
   */
  private canExecuteOn(target: any): boolean {
    // Implement validation logic
    return true;
  }

  /**
   * Perform the actual command logic
   */
  private performCommand(target: any): CommandResult {
    // Implement command behavior using services
    // e.g., this.gameState.setFlag('flag_name', true);
    // e.g., this.items.updateItemState(target.id, { open: true });

    return this.success('You successfully command the target.', true, 0);
  }
}
```

### Step 3: Export Command

Add to `src/commands/index.ts`:

```typescript
export { YourCommand } from './YourCommand';
```

### Step 4: Register Command

Add to `src/initializers/CommandInitializer.ts`:

```typescript
import {
  // ... existing imports
  YourCommand
} from '../commands';

private static createCommands(services: Services, loggingService: LoggingService) {
  const commands = [
    // ... existing commands
    new YourCommand(
      services.gameState,
      services.scene,
      services.inventory,
      services.items,
      services.combat,
      services.persistence,
      services.output,
      services.scoring,
      loggingService.getLogger('YourCommand')
    )
  ];

  return commands;
}
```

### Step 5: Add Integration Tests

Create test directory structure:

```bash
mkdir -p testing/scenes/test_scene/integration_tests/your_command
mkdir -p testing/scenes/test_scene/integration_tests/your_command/helpers
```

Create test file:

```typescript
// testing/scenes/test_scene/integration_tests/your_command/basic_your_command.test.ts

import '../setup';
import { IntegrationTestFactory, IntegrationTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Basic Your Command - Test Scene', () => {
  let testEnv: IntegrationTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Command Execution', () => {
    it('should execute command successfully on valid target', async () => {
      const result = testEnv.commandProcessor.processCommand('command target');

      expect(result.success).toBe(true);
      expect(result.message).toContain('success');
    });

    it('should fail on invalid target', async () => {
      const result = testEnv.commandProcessor.processCommand('command nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('don\'t see');
    });
  });
});
```

## BaseCommand Utilities

### Available Helper Methods

#### Argument Parsing

```typescript
// Get all arguments after command
const args = this.getArgs(input);  // "take lamp" → ["lamp"]

// Parse with preposition
const { preposition, target } = this.parseArgsWithPreposition(args);
// "put coin in box" → { preposition: "in", target: "box" }
```

#### Object Finding

```typescript
// Find object in inventory or scene
const obj = this.findObject('lamp');

// Find object in specific location
const obj = this.findObjectInScene('mailbox');
const obj = this.findObjectInInventory('sword');
const obj = this.findObjectInContainer('coin', 'box');
```

#### Result Builders

```typescript
// Success (counts as move, optional score change)
return this.success('Success message!', true, 10);

// Success (doesn't count as move)
return this.success('Success message!', false);

// Failure (doesn't count as move)
return this.failure('Error message');

// Failure (counts as move)
return this.failure('Error message', true);
```

#### Logging

```typescript
// Log execution start (automatic in example)
this.logExecutionStart(input);

// Log success
this.logExecutionSuccess(result);

// Log error
this.logExecutionError(error, input);

// Custom logging
this.logger.info('Custom log message');
this.logger.debug('Debug details');
this.logger.error('Error occurred:', error);
```

### Available Services

All commands have access to 8 services through `this.[serviceName]`:

#### 1. GameState Service
```typescript
// Get/set current scene
const sceneId = this.gameState.getCurrentScene();
this.gameState.setCurrentScene('new_scene');

// Flags
const flag = this.gameState.getFlag('flag_name');
this.gameState.setFlag('flag_name', true);

// Score and moves
const score = this.gameState.getScore();
this.gameState.addScore(10);
const moves = this.gameState.getMoves();
```

#### 2. Scene Service
```typescript
// Get current scene
const scene = this.scene.getCurrentScene();

// Get scene by ID
const scene = this.scene.getScene('scene_id');

// Get exits
const exits = this.scene.getAvailableExits();

// Get scene items
const items = this.scene.getSceneItems();
```

#### 3. Inventory Service
```typescript
// Get player inventory
const items = this.inventory.getInventory();

// Add/remove items
this.inventory.addItem('lamp');
this.inventory.removeItem('lamp');

// Check capacity
const canAdd = this.inventory.canAddItem('lamp');

// Get weight
const weight = this.inventory.getTotalWeight();
```

#### 4. Item Service
```typescript
// Get item by ID
const item = this.items.getItem('lamp');

// Get item state
const isOpen = this.items.isOpen('box');
const isLocked = this.items.isLocked('door');

// Update item state
this.items.updateItemState('box', { open: true });

// Check item location
const location = this.items.getItemLocation('lamp');
```

#### 5. Combat Service
```typescript
// Check if monster is present
const hasMonster = this.combat.hasMonster('troll');

// Get monster health
const health = this.combat.getMonsterHealth('troll');

// Attack monster
const result = this.combat.attack('troll', 'sword');
```

#### 6. Scoring Service
```typescript
// Award points
this.scoring.awardPoints('treasure_found_lamp', 10);

// Check if scored
const hasScored = this.scoring.hasScored('treasure_found_lamp');

// Get scoring event
const event = this.scoring.getScoringEvent('treasure_found_lamp');
```

#### 7. Persistence Service
```typescript
// Save game
const success = this.persistence.saveGame();

// Restore game
const state = this.persistence.restoreGame();
```

#### 8. Output Service
```typescript
// Format output
const formatted = this.output.formatMessage('message');

// Create item list
const list = this.output.formatItemList(items);
```

## Command Pattern Examples

### Simple Command (No Arguments)

```typescript
// Example: inventory, score
execute(input: string): CommandResult {
  const items = this.inventory.getInventory();

  if (items.length === 0) {
    return this.success('You are empty-handed.', false);
  }

  const itemNames = items.map(id => this.items.getItem(id)?.name);
  return this.success(`You are carrying:\n  ${itemNames.join('\n  ')}`, false);
}
```

### Single Target Command

```typescript
// Example: take, examine, open
execute(input: string): CommandResult {
  const args = this.getArgs(input);

  if (args.length === 0) {
    return this.failure('What do you want to take?');
  }

  const target = args.join(' ');
  const item = this.findObject(target);

  if (!item) {
    return this.failure(`You don't see any ${target} here.`);
  }

  // Perform action
  this.inventory.addItem(item.id);
  return this.success(`Taken: ${item.name}`);
}
```

### Two-Target Command with Preposition

```typescript
// Example: put, unlock with key
execute(input: string): CommandResult {
  const args = this.getArgs(input);

  if (args.length < 3) {
    return this.failure('Put what where?');
  }

  // Parse "put coin in box"
  const inIndex = args.findIndex(arg => arg === 'in');

  if (inIndex === -1) {
    return this.failure('Where do you want to put it?');
  }

  const itemName = args.slice(0, inIndex).join(' ');
  const containerName = args.slice(inIndex + 1).join(' ');

  const item = this.findObjectInInventory(itemName);
  const container = this.findObject(containerName);

  if (!item) {
    return this.failure(`You aren't carrying a ${itemName}.`);
  }

  if (!container) {
    return this.failure(`You don't see any ${containerName} here.`);
  }

  // Perform action
  this.inventory.removeItem(item.id);
  this.items.addToContainer(container.id, item.id);

  return this.success(`You put the ${item.name} in the ${container.name}.`);
}
```

### Direction-Based Command

```typescript
// Example: move, go
execute(input: string): CommandResult {
  const args = this.getArgs(input);

  if (args.length === 0) {
    return this.failure('Which direction?');
  }

  const direction = args[0].toLowerCase();
  const exits = this.scene.getAvailableExits();

  if (!exits[direction]) {
    return this.failure('You can\'t go that way.');
  }

  const destination = exits[direction].to;

  if (!destination) {
    return this.failure('You can\'t go that way.');
  }

  return {
    success: true,
    message: `Moving ${direction}...`,
    countsAsMove: true,
    moveToScene: destination
  };
}
```

## Best Practices

### 1. Consistent Error Messages

Use authentic Zork phrasing:
- ✅ "You don't see any lamp here."
- ❌ "Lamp not found."
- ✅ "You aren't carrying that."
- ❌ "Item not in inventory."

### 2. Proper State Management

Always use services, never modify objects directly:
```typescript
// ✅ Correct
this.items.updateItemState('box', { open: true });
this.inventory.addItem('lamp');

// ❌ Wrong
item.open = true;
player.inventory.push('lamp');
```

### 3. Comprehensive Validation

Check all preconditions before executing:
```typescript
// Check object exists
// Check object is accessible
// Check command is valid for object
// Check any flags/conditions
// Then execute
```

### 4. Clear Success/Failure Paths

```typescript
// Always return CommandResult
// Never throw exceptions for expected failures
// Use this.failure() for user errors
// Use try/catch for unexpected errors
```

### 5. Scoring Integration

Award points at appropriate times:
```typescript
// First discovery of treasure
this.scoring.awardPoints('treasure_found_lamp', 5);

// Depositing treasure
this.scoring.awardPoints('treasure_deposited_lamp', 10);

// Solving puzzle
this.scoring.awardPoints('puzzle_solved', 15);
```

### 6. Move Counting

Set `countsAsMove` appropriately:
```typescript
// Counts as move: take, drop, open, move, attack
return this.success(message, true);

// Doesn't count: look, inventory, examine, score
return this.success(message, false);
```

## Testing Strategy

### Integration Tests

1. **Basic Functionality**
   - Command with valid target
   - Command with invalid target
   - Command with missing arguments

2. **State Changes**
   - Verify state updates
   - Check flag changes
   - Validate score increases

3. **Edge Cases**
   - Command with no arguments
   - Multiple valid targets
   - Conditional execution

4. **User Journeys**
   - Multi-command sequences
   - State persistence across commands
   - Scoring workflows

### Test Example

```typescript
describe('Attack Command', () => {
  describe('Basic Attack', () => {
    it('should attack monster with weapon', async () => {
      // Setup
      testEnv.services.gameState.setCurrentScene('scene_with_troll');
      testEnv.services.inventory.addItem('sword');

      // Execute
      const result = testEnv.commandProcessor.processCommand('attack troll with sword');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('attack');
      expect(result.countsAsMove).toBe(true);
    });
  });
});
```

## Common Pitfalls

### 1. Forgetting to Register Command

❌ **Error**: Command implemented but not working
✅ **Solution**: Add to `CommandInitializer.createCommands()`

### 2. Incorrect Alias Matching

❌ **Error**: Alias doesn't trigger command
✅ **Solution**: Ensure alias in constructor matches BaseCommand pattern

### 3. Direct State Modification

❌ **Error**: State changes don't persist
✅ **Solution**: Always use service methods

### 4. Missing Service Import

❌ **Error**: Service method not found
✅ **Solution**: Import interface from `services/interfaces`

### 5. Incorrect Return Type

❌ **Error**: TypeScript compilation error
✅ **Solution**: Always return `CommandResult`

## Command Checklist

Before submitting a new command:

- [ ] Command file created in `src/commands/`
- [ ] Extends BaseCommand correctly
- [ ] All 8 services injected in constructor
- [ ] Primary name and aliases defined
- [ ] Usage and help text provided
- [ ] JSDoc comments complete
- [ ] execute() method implemented
- [ ] Uses service methods (no direct state modification)
- [ ] Returns proper CommandResult
- [ ] Error handling with try/catch
- [ ] Logging calls added
- [ ] Exported in `src/commands/index.ts`
- [ ] Registered in `CommandInitializer`
- [ ] Integration tests created
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Authentic Zork behavior verified

## Related Documentation

- [Command Reference](./command-reference.md) - Complete list of all commands
- [Scene Integration Testing Guide](../testing/scene-integration-testing-guide.md) - Testing commands in scenes
- [Service Architecture](../services/README.md) - Understanding services
- [BaseCommand API](../../src/commands/BaseCommand.ts) - Full BaseCommand implementation

## Summary

Adding a new command involves:
1. Create command class extending BaseCommand
2. Implement execute() method with proper parsing
3. Use services for all state changes
4. Return CommandResult with appropriate flags
5. Register in CommandInitializer
6. Write integration tests
7. Update documentation

Following this pattern ensures consistency, testability, and authentic Zork behavior across all commands.
