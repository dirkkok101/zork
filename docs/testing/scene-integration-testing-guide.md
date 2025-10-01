# Scene Integration Testing Guide

## Overview

This guide documents the scene integration testing architecture, patterns, and workflows used in the Zork project. Scene integration tests validate end-to-end game scenarios using real services, commands, and data to ensure authentic Zork gameplay behavior.

### Current Coverage Status

**Scene Test Coverage**: 15 out of 196 scenes (7.7%)

| Scene Category | Count | Status |
|----------------|-------|--------|
| **Complex Scenes** (8-13 tests each) | 5 | ✅ Complete |
| **Simple Scenes** (2 tests each) | 10 | ✅ Complete |
| **Untested Scenes** | 181 | 🚧 Pending |

**Tested Scenes:**
- **Complex**: west_of_house (13 tests), kitchen (10), living_room (8), attic (8), behind_house (8)
- **Simple**: north_of_house, south_of_house, beach, forest_1, forest_2, forest_3, forest_4, clearing, reservoir, dam (2 tests each)

**Test File Count**: 69 test files, 59 helper/factory files

## Scene Integration Testing Philosophy

### Core Principles

1. **Real Integration**: Use actual services, data loaders, and command processors
2. **Scene-Specific**: Tests tailored to each scene's unique mechanics and items
3. **Authentic Behavior**: Validate against original Zork gameplay
4. **Layered Complexity**: Start with basic tests (look, move), add command-specific tests as needed
5. **Reusable Helpers**: Share common utilities while allowing scene customization

### Integration vs Unit Testing

**Scene Integration Tests:**
- Use real `GameInitializer`, `ServiceInitializer`, `CommandInitializer`
- Load actual JSON data from `data/scenes/`, `data/items/`
- Execute full command processing pipeline
- Validate state changes across services
- Test cross-service interactions

**Appropriate For:**
- Command execution in scene context
- Item interactions (take, open, examine)
- Movement and exit validation
- Scoring system integration
- State persistence across commands
- User journey workflows

## Scene Test Structure

### Directory Organization

Each scene follows this structure:

```
testing/scenes/{scene_id}/
├── integration_tests/
│   ├── look_command/
│   │   ├── basic_look.test.ts
│   │   ├── setup.ts
│   │   └── helpers/
│   │       ├── {scene}_helper.ts
│   │       ├── look_command_helper.ts
│   │       └── integration_test_factory.ts
│   ├── move_command/
│   │   ├── basic_movement.test.ts
│   │   └── helpers/
│   │       └── move_command_helper.ts
│   ├── {command}_command/           # Additional commands as needed
│   │   ├── basic_{command}.test.ts
│   │   └── helpers/
│   │       └── {command}_command_helper.ts
│   ├── state_validation/
│   │   └── {validation_aspect}.test.ts
│   └── scoring/
│       └── scene_scoring.test.ts
└── user_journeys/
    └── {workflow_name}_workflow.test.ts
```

### File Purposes

| File Type | Purpose | Example |
|-----------|---------|---------|
| **basic_{command}.test.ts** | Tests for specific command in scene | `basic_look.test.ts` |
| **{scene}_helper.ts** | Scene-specific state management | `west_of_house_helper.ts` |
| **{command}_command_helper.ts** | Command execution utilities | `look_command_helper.ts` |
| **integration_test_factory.ts** | Test environment setup | Creates services, helpers |
| **setup.ts** | Jest configuration for scene tests | Timeouts, imports |
| **state_validation/** | Complex state management tests | Flag persistence, item states |
| **user_journeys/** | Multi-command workflows | Complete player scenarios |

## Test Categories

### 1. Basic Command Tests

**Purpose**: Validate fundamental command behavior in scene context

**Examples:**
- **Look Command**: First visit descriptions, subsequent visits, exit display
- **Move Command**: Valid/invalid exits, conditional exits, movement success/failure
- **Take Command**: Item pickup, weight restrictions, success messages
- **Open Command**: Container opening, state changes, locked containers

**Pattern:**
```typescript
describe('Basic Look Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;

  beforeEach(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Visit Look', () => {
    it('should show first visit description and award points', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, 1);
    });
  });
});
```

### 2. State Validation Tests

**Purpose**: Verify complex state management and persistence

**Examples:**
- Flag-based exit conditions
- Container state consistency
- Item state persistence across commands
- Weight-based restrictions

**When to Create:**
- Scene has conditional logic
- Multiple state flags interact
- State persists across multiple commands
- Edge cases in state transitions

**Pattern:**
```typescript
describe('Container Output Consistency', () => {
  it('should maintain consistent item visibility in container', async () => {
    // Place item in container
    putHelper.putItemInContainer('item', 'container');

    // Verify state persists across look commands
    const lookResult = lookHelper.executeBasicLook();
    expect(lookResult.message).toContain('container (containing item)');
  });
});
```

### 3. Scoring Tests

**Purpose**: Validate authentic Zork scoring mechanics

**Examples:**
- First visit scene points
- Treasure discovery points
- Treasure deposit bonuses
- Event-based scoring

**Pattern:**
```typescript
describe('Scene Scoring', () => {
  it('should award 1 point for first visit to west_of_house', async () => {
    const initialScore = testEnv.lookCommandHelper.getCurrentScore();

    testEnv.lookCommandHelper.executeBasicLook();

    testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, 1);
    expect(testEnv.services.gameState.getFlag('visited_west_of_house')).toBe(true);
  });
});
```

### 4. User Journey Tests

**Purpose**: Validate complete player workflows across commands/scenes

**Examples:**
- Kitchen entry workflow (examine window → open window → enter kitchen)
- Mailbox interaction (open → read letter → close)
- Treasure collection (take → move to living room → put in trophy case)

**When to Create:**
- Multi-step puzzle solutions
- Common player workflows
- Cross-scene interactions
- Complex command sequences

**Pattern:**
```typescript
describe('Kitchen Entry Workflow - User Journey', () => {
  it('should complete new player discovery sequence', async () => {
    // 1. Player arrives at behind house
    expect(moveHelper.getCurrentScene()).toBe('behind_house');

    // 2. Look around
    const lookResult = testEnv.lookCommandHelper.executeBasicLook();
    testEnv.lookCommandHelper.verifyWindowVisible(lookResult);

    // 3. Examine window
    const examineResult = examineHelper.executeExamine('window');
    expect(examineResult.message).toContain('slightly ajar');

    // 4. Open window
    const openResult = openHelper.executeOpen('window');
    expect(openResult.success).toBe(true);

    // 5. Enter kitchen
    const enterResult = moveHelper.executeMove('west');
    expect(enterResult.success).toBe(true);
    expect(moveHelper.getCurrentScene()).toBe('kitchen');
  });
});
```

## Helper Architecture

### Helper Types

#### 1. Scene Helpers

**Purpose**: Scene-specific state management and verification

**Location**: `testing/scenes/{scene}/integration_tests/look_command/helpers/{scene}_helper.ts`

**Responsibilities:**
- Reset scene to clean state
- Manage scene-specific flags
- Place/remove test items
- Verify scene characteristics (lighting, exits, atmosphere)
- Scene-specific assertions

**Example:**
```typescript
export class WestOfHouseHelper {
  constructor(
    private gameState: IGameStateService,
    private sceneService: ISceneService
  ) {}

  resetScene(): void {
    this.gameState.setCurrentScene('west_of_house');
    this.gameState.setFlag('visited_west_of_house', false);
    this.clearTestItems();
  }

  isFirstVisit(): boolean {
    return !this.gameState.getFlag('visited_west_of_house');
  }

  markAsVisited(): void {
    this.gameState.setFlag('visited_west_of_house', true);
  }

  verifyExpectedExits(): void {
    const scene = this.sceneService.getCurrentScene();
    expect(scene.exits).toHaveProperty('north');
    expect(scene.exits).toHaveProperty('south');
  }
}
```

#### 2. Command Helpers

**Purpose**: Execute commands and validate results

**Location**:
- **Global**: `testing/helpers/{Command}Helper.ts` (shared across scenes)
- **Scene-specific**: `testing/scenes/{scene}/integration_tests/{command}_command/helpers/{command}_command_helper.ts`

**Responsibilities:**
- Execute command variants
- Verify success/failure
- Validate result structure
- Check state changes
- Score verification

**Global Helper Example** (`testing/helpers/LookCommandHelper.ts`):
```typescript
export class LookCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private gameState: IGameStateService
  ) {}

  executeBasicLook(): CommandResult {
    return this.commandProcessor.processCommand('look');
  }

  executeLookAround(): CommandResult {
    return this.commandProcessor.processCommand('look around');
  }

  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  }

  verifyNoMove(result: CommandResult): void {
    expect(result.moveToScene).toBeUndefined();
  }
}
```

**Scene-Specific Helper Example**:
```typescript
export class WestOfHouseLookCommandHelper extends LookCommandHelper {
  verifyMailboxVisible(result: CommandResult): void {
    expect(result.message).toContain('mailbox');
  }

  verifyBoarded Window(result: CommandResult): void {
    expect(result.message).toContain('boarded');
  }
}
```

#### 3. Integration Test Factories

**Purpose**: Create complete test environment with all dependencies

**Location**: `testing/scenes/{scene}/integration_tests/look_command/helpers/integration_test_factory.ts`

**Responsibilities:**
- Initialize game data (GameInitializer)
- Create services (ServiceInitializer)
- Set up command processor
- Create scene and command helpers
- Provide cleanup methods
- Reset scoring state

**Pattern:**
```typescript
export interface WestOfHouseTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  westOfHouseHelper: WestOfHouseHelper;
  lookCommandHelper: LookCommandHelper;
  cleanup: () => void;
  resetScoring: () => void;
}

export class IntegrationTestFactory {
  static async createTestEnvironment(): Promise<WestOfHouseTestEnvironment> {
    // Initialize real game systems
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);

    const gameData = await GameInitializer.initialize(loggingService);
    const services = ServiceInitializer.initialize(gameData, loggingService);
    const commandService = CommandInitializer.initialize(services, loggingService);
    const commandProcessor = new CommandProcessor(commandService, services.gameState, loggingService);

    // Set starting scene
    services.gameState.setCurrentScene('west_of_house');

    // Create helpers
    const westOfHouseHelper = new WestOfHouseHelper(services.gameState, services.scene);
    const lookCommandHelper = new LookCommandHelper(commandProcessor, services.gameState);

    return {
      services,
      commandProcessor,
      westOfHouseHelper,
      lookCommandHelper,
      cleanup: () => westOfHouseHelper.resetScene(),
      resetScoring: () => { /* reset scoring flags */ }
    };
  }
}
```

## Commands Tested

### Currently Implemented

**Total Commands**: 12 (see [Command Reference](../commands/command-reference.md) for complete details)

| Command | Scenes | Description |
|---------|--------|-------------|
| **look** | 15 | Basic scene description, exits, items |
| **move** | 15 | Navigation between scenes |
| **examine** | 5 | Detailed item inspection |
| **take** | 4 | Pick up items |
| **open** | 4 | Open containers/doors |
| **close** | 3 | Close containers/doors |
| **put** | 2 | Place items in containers |
| **drop** | 2 | Drop items in scene |
| **read** | 1 | Read readable items |
| **inventory** | 1 | List carried items |
| **save** | 0 | Save game state (system command, not scene-specific) |
| **restore** | 0 | Restore game state (system command, not scene-specific) |
| **scoring** | 3 | Score validation |

**Note**: `save` and `restore` are system-level commands that aren't typically tested in scene integration tests since they operate on global game state rather than scene-specific behavior.

### Command Test Patterns

#### Look Command
```typescript
describe('Basic Look', () => {
  it('should show scene description on look', async () => {
    const result = testEnv.lookCommandHelper.executeBasicLook();

    testEnv.lookCommandHelper.verifySuccess(result);
    expect(result.message).toContain('Scene Name');
    testEnv.lookCommandHelper.verifyNoMove(result);
  });
});
```

#### Move Command
```typescript
describe('Basic Movement', () => {
  it('should move to valid exit', async () => {
    const result = moveHelper.executeMove('north');

    moveHelper.verifyMoveSuccess(result, 'target_scene');
    expect(moveHelper.getCurrentScene()).toBe('target_scene');
  });

  it('should fail to move to invalid exit', async () => {
    const result = moveHelper.executeMove('invalid');

    moveHelper.verifyMoveFailure(result);
    expect(moveHelper.getCurrentScene()).toBe('original_scene');
  });
});
```

## Writing Tests for New Scenes

### Step 1: Determine Scene Complexity

**Simple Scene** (2 tests):
- No items or minimal non-interactive items
- Simple exits (no conditionals)
- No special mechanics
- Examples: forest paths, corridors

**Moderate Scene** (4-8 tests):
- Contains interactive items
- Has conditional exits or flags
- Basic item interactions
- Examples: behind_house, attic

**Complex Scene** (8-13 tests):
- Multiple interactive items
- Complex state management
- Scoring events
- Special mechanics (weight restrictions, puzzles)
- Examples: west_of_house, kitchen, living_room

### Step 2: Use Test Generator (Recommended)

For simple scenes, use the automated test generator:

```bash
# Generate tests for a scene
npm run generate:scene <scene_id>

# Preview what would be generated
npm run generate:scene <scene_id> -- --dry-run --verbose

# Validate scene can be generated
npm run generate:validate <scene_id>
```

**Generator Creates:**
- Scene helper class
- Integration test factory
- Look command tests
- Move command tests
- Setup file

See [Test Generator Guide](../../tools/test-generators/README.md) for details.

### Step 3: Manual Test Creation for Complex Scenes

For complex scenes, start with generated tests and add:

1. **Command-Specific Tests**
   ```bash
   mkdir testing/scenes/{scene}/integration_tests/take_command
   touch testing/scenes/{scene}/integration_tests/take_command/basic_take.test.ts
   mkdir testing/scenes/{scene}/integration_tests/take_command/helpers
   ```

2. **State Validation Tests** (if scene has complex state)
   ```bash
   mkdir testing/scenes/{scene}/integration_tests/state_validation
   touch testing/scenes/{scene}/integration_tests/state_validation/flag_persistence.test.ts
   ```

3. **Scoring Tests** (if scene awards points)
   ```bash
   mkdir testing/scenes/{scene}/integration_tests/scoring
   touch testing/scenes/{scene}/integration_tests/scoring/scene_scoring.test.ts
   ```

4. **User Journey Tests** (for key workflows)
   ```bash
   mkdir testing/scenes/{scene}/user_journeys
   touch testing/scenes/{scene}/user_journeys/{workflow_name}_workflow.test.ts
   ```

### Step 4: Implement Helpers

Create scene-specific helper:

```typescript
// testing/scenes/{scene}/integration_tests/look_command/helpers/{scene}_helper.ts
export class SceneHelper {
  constructor(
    private gameState: IGameStateService,
    private sceneService: ISceneService
  ) {}

  resetScene(): void {
    this.gameState.setCurrentScene('{scene}');
    // Clear scene-specific flags
    // Remove test items
  }

  // Scene-specific methods
  verifyExpectedExits(): void { /* ... */ }
  verifyLighting(): void { /* ... */ }
  verifyAtmosphere(): void { /* ... */ }
}
```

Create integration test factory:

```typescript
// testing/scenes/{scene}/integration_tests/look_command/helpers/integration_test_factory.ts
export interface SceneTestEnvironment {
  services: Services;
  commandProcessor: CommandProcessor;
  sceneHelper: SceneHelper;
  lookCommandHelper: LookCommandHelper;
  moveCommandHelper: MoveCommandHelper;
  cleanup: () => void;
}

export class SceneIntegrationTestFactory {
  static async createTestEnvironment(): Promise<SceneTestEnvironment> {
    // Initialize real services
    // Create helpers
    // Return environment
  }
}
```

### Step 5: Write Tests

Follow established patterns from existing scenes:

```typescript
import './setup';
import { SceneTestEnvironment, SceneIntegrationTestFactory } from './helpers/integration_test_factory';

describe('Basic Look Command - Scene Name', () => {
  let testEnv: SceneTestEnvironment;

  beforeEach(async () => {
    testEnv = await SceneIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look', () => {
    it('should show scene description on look', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('Scene Name');
    });
  });
});
```

## Best Practices

### From Code Reviews

Based on comprehensive code reviews of kitchen and attic tests:

1. **Consistent Naming**
   - Use `{Scene}TestEnvironment` for environment interface
   - Use `{Scene}IntegrationTestFactory` for factory class
   - Use `{scene}_helper.ts` for scene helper filename

2. **Helper Organization**
   - Put scene helper in `look_command/helpers/`
   - Put factory in `look_command/helpers/`
   - Put command-specific helpers in their respective command directories

3. **Test Organization**
   - Group related tests in `describe()` blocks
   - Use descriptive test names: "should [expected behavior] when [condition]"
   - Order tests from simple to complex

4. **State Management**
   - Always reset scene state in `beforeEach()`
   - Clean up test items in `afterEach()`
   - Use helper methods for state setup

5. **Assertions**
   - Use helper verification methods when available
   - Keep assertions focused and specific
   - Test one behavior per test case

6. **Documentation**
   - Add file-level JSDoc comments
   - Explain complex setups or edge cases
   - Reference original Zork behavior when relevant

## Coverage Goals and Roadmap

### Short-Term Goals (Next 3 Months)

- **Target**: 50 scenes with tests (25% coverage)
- **Priority**: High-traffic player areas
  - All above-ground house scenes
  - Main underground areas
  - Key puzzle locations

### Medium-Term Goals (6 Months)

- **Target**: 100 scenes with tests (51% coverage)
- **Priority**: Complete major game areas
  - All house scenes
  - Underground main path
  - Major side areas

### Long-Term Goals (1 Year)

- **Target**: 196 scenes with tests (100% coverage)
- **Priority**: Complete coverage
  - All maze scenes
  - All endgame scenes
  - Edge case locations

### Generator Optimization

- Extend generator to create more test types
- Add command-specific test generation
- Generate state validation tests
- Generate scoring tests
- Create user journey templates

## Running Scene Tests

### Run All Scene Tests
```bash
npm test -- testing/scenes
```

### Run Tests for Specific Scene
```bash
npm test -- testing/scenes/west_of_house
npm test -- testing/scenes/kitchen
```

### Run Tests for Specific Command
```bash
npm test -- testing/scenes/west_of_house/integration_tests/look_command
npm test -- testing/scenes/*/integration_tests/move_command
```

### Run User Journey Tests
```bash
npm test -- testing/scenes/user_journeys
npm test -- testing/scenes/*/user_journeys
```

### Watch Mode for Development
```bash
npm test -- --watch testing/scenes/west_of_house
```

## Troubleshooting

### Common Issues

#### Tests Failing After Scene Data Changes

**Problem**: Scene JSON updated, tests expect old values

**Solution:**
1. Review scene data changes
2. Update test assertions to match new data
3. Verify changes match original Zork behavior

#### Helper Import Errors

**Problem**: Cannot find module '{Scene}Helper'

**Solution:**
1. Check file naming matches import
2. Verify helper file exists in correct directory
3. Check TypeScript paths configuration

#### Service Initialization Failures

**Problem**: Tests fail during factory setup

**Solution:**
1. Verify all data files exist
2. Check scene ID matches data file
3. Ensure services initialized in correct order

#### State Pollution Between Tests

**Problem**: Tests pass individually but fail when run together

**Solution:**
1. Ensure `cleanup()` called in `afterEach()`
2. Reset all relevant flags and state
3. Clear test items from scene and inventory

## Related Documentation

- [Testing Guidelines](./testing-guidelines.md) - Overall testing philosophy
- [Unit Test Best Practices](./unit-test-best-practices.md) - Unit testing patterns
- [Data Loader Testing](./data-loader-testing.md) - Data layer testing
- [Test Generator Guide](../../tools/test-generators/README.md) - Automated test generation

## Summary

Scene integration tests are a critical component of ensuring authentic Zork gameplay. By following these patterns and best practices, we can systematically test all 196 scenes while maintaining consistency and code quality.

**Key Takeaways:**
- Start with test generator for simple scenes
- Use established patterns from complex scenes
- Create scene-specific helpers for unique mechanics
- Test incrementally: look → move → commands → workflows
- Document scene-specific behaviors
- Maintain consistent naming and structure
- Reset state properly between tests
