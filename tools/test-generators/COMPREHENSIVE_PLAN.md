# Comprehensive Test Generator Plan
**Created:** 2025-10-01
**Updated:** 2025-10-01
**Status:** Phase 3 - COMPLETE (100% - All 4 generators complete)

---

## Current Status (Latest Update)

### ✅ Phase 1: COMPLETED
- Consolidated 10+ command helpers to shared library
- Created ItemAnalyzer and InteractionAnalyzer
- Enhanced SceneAnalyzer with full item capability detection

### ✅ Phase 2: COMPLETED (100% - All 8 generators complete)

**Completed Generators:**
1. ✅ **TakeTestGenerator** - 26 tests/scene, 100% pass rate
2. ✅ **DropTestGenerator** - 15 tests/scene, 100% pass rate
3. ✅ **ExamineTestGenerator** - 25 tests/scene, 100% pass rate
4. ✅ **OpenTestGenerator** - 23 tests/scene, 100% pass rate
5. ✅ **CloseTestGenerator** - 24 tests/scene, 100% pass rate
6. ✅ **ReadTestGenerator** - 14 tests/scene (when readable items present), 100% pass rate
7. ✅ **PutTestGenerator** - 23 tests/scene (when containers present), 100% pass rate
8. ✅ **InventoryTestGenerator** - 16 tests/scene (universal command), 100% pass rate

**Kitchen Scene Stats:** 178 passing tests across 9 command types
**West of House Scene:** +14 read tests (with readable items)

**Phase 2 Complete!** All 8 command generators implemented and passing tests

### ✅ Phase 3: COMPLETE (100% - All 4 generators complete)

**Completed Advanced Generators:**
1. ✅ **StateValidationTestGenerator** - 17 tests/scene (when stateful items present), 100% pass rate
   - Container state persistence tests
   - Item state persistence tests
   - Flag-based state consistency tests
   - State consistency across commands
   - State persistence across scene transitions

2. ✅ **ScoringTestGenerator** - 7 tests/scene (universal), 100% pass rate
   - First visit scoring verification
   - Treasure collection scoring
   - Trophy case deposit scoring
   - Non-treasure items verification
   - Score state integrity checks
   - Maximum score tracking

3. ✅ **ConditionalAccessTestGenerator** - 30 tests/scene (when conditional exits present), 100% pass rate
   - Flag-based exit mechanics
   - Conditional vs unconditional exits
   - Cross-scene flag persistence
   - Integration with other commands
   - Edge case and error handling

4. ✅ **WeightTestGenerator** - 20 tests/scene (when weight-restricted exits present), 100% pass rate
   - Weight threshold testing (light/medium/heavy items)
   - Weight calculation accuracy
   - Exit blocking mechanics
   - Weight management strategies
   - Container weight mechanics
   - Edge cases and boundary conditions
   - Integration with game state
   - Weight limit information

**Kitchen Scene Stats:** 232 passing tests (178 command + 17 state validation + 7 scoring + 30 conditional access)
**Attic Scene Stats:** 20 passing weight restriction tests

**Phase 3 Complete!** All 4 advanced generators implemented and passing tests

---

## Executive Summary

**Initial State:** Generator created basic tests (look, move) for 15% of functionality
**Current State:** Phase 3 IN PROGRESS - 10 generators complete (8 command + 2 advanced), 202 kitchen tests passing
**Goal:** Generate comprehensive tests covering 90%+ of game functionality
**Impact:** Eliminate 330+ hours of manual test writing
**Timeline:** 4 phases over 2-3 weeks

---

## Analysis: Current Test Coverage

### Existing Test Types (from hand-written tests)

| Test Type | Count | Scenes | Complexity |
|-----------|-------|--------|------------|
| **basic_look** | 15 | All | ✅ Generated |
| **basic_movement** | 14 | All | ✅ Generated |
| **basic_open** | 4 | kitchen, attic, behind_house, living_room | ❌ Missing |
| **basic_close** | 3 | kitchen, behind_house, west_of_house | ❌ Missing |
| **basic_examine** | 4 | kitchen, attic, behind_house, west_of_house | ❌ Missing |
| **basic_take** | 2 | attic, living_room, west_of_house | ❌ Missing |
| **basic_drop** | 1 | west_of_house | ❌ Missing |
| **basic_put** | 1 | west_of_house, living_room | ❌ Missing |
| **basic_read** | 1 | west_of_house | ❌ Missing |
| **basic_inventory** | 1 | west_of_house | ❌ Missing |
| **container_output_consistency** | 2 | west_of_house, kitchen | ❌ Missing |
| **flag_based_exits** | 3 | kitchen | ❌ Missing |
| **scene_scoring** | 2 | west_of_house, living_room | ❌ Missing |
| **treasure_scoring** | 1 | living_room | ❌ Missing |
| **item_state_persistence** | 1 | attic | ❌ Missing |
| **weight_based_exit** | 1 | attic | ❌ Missing |
| **treasure_tool_workflows** | 1 | attic | ❌ Missing |
| **conditional_access** | 2 | kitchen, behind_house | ❌ Missing |
| **trophy_case_*** | 2 | living_room | ❌ Missing |

### Commands Requiring Test Generators

1. **Movement** ✅ Done
2. **Observation**
   - Look ✅ Done
   - Examine ❌ Missing
   - Read ❌ Missing
3. **Item Manipulation**
   - Take ❌ Missing
   - Drop ❌ Missing
   - Put ❌ Missing
4. **Container Interaction**
   - Open ❌ Missing
   - Close ❌ Missing
5. **Inventory**
   - Inventory ❌ Missing
6. **Scoring** ❌ Missing
7. **State Validation** ❌ Missing
8. **User Journeys/Workflows** ❌ Missing

---

## Current Architecture Analysis

### What Works Well

1. **SceneAnalyzer**: Successfully parses scene JSON and identifies:
   - Items in scene
   - Exits (simple, conditional, blocked)
   - Monsters
   - Lighting, atmosphere
   - Complexity level

2. **Template System**: Handlebars templates generate clean, compilable TypeScript

3. **Generator Orchestration**: SceneTestGenerator coordinates multiple generators

4. **Shared Helpers**: LookCommandHelper and MoveCommandHelper work across all scenes

### What Needs Improvement

1. **Limited Scope**: Only generates 2 test types (look, move)
2. **No Item Analysis**: Doesn't analyze item properties (containers, takeable, etc.)
3. **No Interaction Generation**: Can't generate take/open/examine tests
4. **No Workflow Generation**: Can't generate multi-command sequences
5. **Helper Duplication**: Command helpers duplicated across scenes

---

## Comprehensive Plan

### Phase 1: Foundation Enhancement (3-5 days) ✅ COMPLETED

#### 1.1 Consolidate Command Helpers (Day 1) ✅
**Goal**: Create shared command helper library

**Tasks**:
- [x] Copy all command helpers from west_of_house to testing/helpers/
  - CloseCommandHelper ✅
  - OpenCommandHelper ✅
  - TakeCommandHelper ✅
  - DropCommandHelper ✅
  - PutCommandHelper ✅
  - ExamineCommandHelper ✅
  - ReadCommandHelper ✅
  - InventoryCommandHelper ✅
- [x] Update imports in existing tests to use shared helpers ✅
- [x] Run all tests to verify no breakage ✅
- [x] Delete duplicate helpers from individual scenes ✅

**Output**: testing/helpers/ with 10+ shared command helpers ✅

**Success Criteria**: All existing tests pass with shared helpers ✅

#### 1.2 Enhance Scene Analysis (Days 2-3) ✅
**Goal**: Analyze items and their properties

**Tasks**:
- [x] Create **ItemAnalyzer** class ✅
  - Analyze item JSON files ✅
  - Identify item types (container, takeable, readable, etc.) ✅
  - Extract item properties (weight, capacity, states) ✅
  - Determine available interactions per item ✅
- [x] Enhance **SceneAnalyzer** to use ItemAnalyzer ✅
  - Group items by type (containers, treasures, tools, etc.) ✅
  - Identify which commands are applicable ✅
  - Determine test requirements per item ✅
- [x] Create **InteractionAnalyzer** class ✅
  - Map item types to available commands ✅
  - Identify command preconditions ✅
  - Determine expected outcomes ✅

**Output**:
- tools/test-generators/src/utils/itemAnalyzer.ts ✅
- Enhanced sceneAnalyzer.ts ✅
- tools/test-generators/src/utils/interactionAnalyzer.ts ✅

**Success Criteria**: Can identify all testable interactions for a scene ✅

### Phase 2: Command Test Generators (5-7 days) ✅ COMPLETED (100%)

#### 2.1 High-Priority Command Generators (Days 4-6)
**Goal**: Generate tests for most common commands

**Priority 1: Item Manipulation (Days 4-5)** ✅ COMPLETED
- [x] **TakeTestGenerator** ✅
  - Basic take (single item) ✅
  - Take with aliases ✅
  - Take from containers ✅
  - Weight restrictions ✅
  - Already taken handling ✅
  - Command variations (get, pick up) ✅
  - State tracking (moves, score) ✅
  - **26 tests generated for kitchen**
- [x] **DropTestGenerator** ✅
  - Basic drop ✅
  - Drop in specific locations ✅
  - Drop into containers ✅
  - Weight effects ✅
  - Command variations ✅
  - **15 tests generated for kitchen**
- [x] **ExamineTestGenerator** ✅
  - Basic examine ✅
  - Container contents ✅
  - Item states ✅
  - Aliases ✅
  - Non-existent items ✅
  - **25 tests generated for kitchen**

**Priority 2: Container Commands (Day 6)** 🔄 IN PROGRESS
- [x] **OpenTestGenerator** ✅
  - Open containers ✅
  - Already open ✅
  - Cannot open non-containers ✅
  - Reveal contents ✅
  - Command variations ✅
  - **23 tests generated for kitchen**
- [x] **CloseTestGenerator** ✅ DONE
  - Close containers ✅
  - Already closed ✅
  - Cannot close non-containers ✅
  - Command variations ✅
  - State persistence ✅
  - Multiple containers ✅
  - **24 tests generated for kitchen**

**Priority 3: Other Commands (Day 7)** ✅ COMPLETE
- [x] **ReadTestGenerator** ✅ DONE
  - Read readable items ✅
  - Cannot read non-readable ✅
  - Text content display ✅
  - Inventory reading ✅
  - Alias support ✅
  - **14 tests generated for west_of_house**
- [x] **PutTestGenerator** ✅ DONE
  - Put item in container ✅
  - Container must be open ✅
  - Put item not in inventory ✅
  - Alias support ✅
  - State consistency ✅
  - **23 tests generated for kitchen**
- [x] **InventoryTestGenerator** ✅ DONE
  - List inventory ✅
  - Empty inventory ✅
  - Command aliases (inventory/i/inv) ✅
  - State consistency ✅
  - Inventory count verification ✅
  - **16 tests generated for kitchen**

**Output**: 8 new test generators in tools/test-generators/src/generators/ ✅ (8/8 complete)

**Success Criteria**: Each generator creates compilable, passing tests ✅ (8/8 passing, 178 kitchen tests + 14 west_of_house read tests = 192 total)

#### 2.2 Templates for Command Generators (Days 4-7)
**Goal**: Create Handlebars templates for each command

**Templates to Create**:
- [x] take-test.template.ts ✅
- [x] drop-test.template.ts ✅
- [x] examine-test.template.ts ✅
- [x] open-test.template.ts ✅
- [x] close-test.template.ts ✅
- [x] read-test.template.ts ✅
- [x] put-test.template.ts ✅
- [x] inventory-test.template.ts ✅

**Template Structure** (example for take):
```typescript
// take-test.template.ts
/**
 * Take Command Tests - {{title}} Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();
    takeHelper = new TakeCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if takeableItems}}
  describe('Take Individual Items', () => {
    {{#each takeableItems}}
    it('should take {{this.name}} and add to inventory', () => {
      testEnv.{{helperName}}.clearPlayerInventory();

      const result = takeHelper.executeTake('{{this.id}}');

      takeHelper.verifySuccess(result);
      takeHelper.verifyItemTaken(result, '{{this.id}}');
      takeHelper.verifyInventoryContains('{{this.id}}');
      takeHelper.verifyItemRemovedFromScene('{{this.id}}');
    });
    {{/each}}
  });
  {{/if}}

  {{#if containers}}
  describe('Take from Containers', () => {
    {{#each containers}}
    it('should take item from {{this.name}} when open', () => {
      // Test implementation
    });
    {{/each}}
  });
  {{/if}}

  // ... more test groups
});
```

**Success Criteria**: Templates generate comprehensive, well-organized tests

### Phase 3: Advanced Generators (4-6 days) ✅ COMPLETE (100%)

#### 3.1 State Validation Generator (Days 8-9) ✅ COMPLETE
**Goal**: Generate state persistence and consistency tests

- [x] **StateValidationTestGenerator** ✅ DONE
  - Container state persistence (open/close) ✅
  - Item state persistence (on/off, etc.) ✅
  - Flag persistence ✅
  - State consistency across commands ✅
  - State persistence across scene transitions ✅
  - **17 tests generated for kitchen**

**Template**: state-validation.template.ts ✅

**Tests Generated**:
- Container state persistence (open/close state maintained)
- Item state persistence (weapon states, etc.)
- Flag-based state consistency
- State consistency across multiple query methods
- State validation after failed operations
- Game state integrity checks

#### 3.2 Scoring Test Generator (Day 10) ✅ COMPLETE
**Goal**: Generate scoring validation tests

- [x] **ScoringTestGenerator** ✅ DONE
  - First visit scoring ✅
  - Treasure collection scoring ✅
  - Trophy case deposit bonuses ✅
  - Non-treasure verification ✅
  - Score state integrity ✅
  - **7 tests generated for kitchen**

**Template**: scoring.template.ts ✅

**Tests Generated**:
- First visit scene scoring (flexible for scenes with/without points)
- Treasure discovery and collection points
- Trophy case deposit bonus scoring
- Already-found treasure (no duplicate points)
- Non-treasure items (no scoring)
- Score consistency and integrity validation
- Maximum score tracking

#### 3.3 Conditional Access Generator (Day 11) ✅ COMPLETE
**Goal**: Generate tests for flag-based mechanics

- [x] **ConditionalAccessTestGenerator** ✅ DONE
  - Flag-based exits ✅
  - Conditional exit blocking/allowing ✅
  - Flag state persistence ✅
  - Cross-scene flag consistency ✅
  - **30 tests generated for kitchen**

**Template**: conditional-access.template.ts ✅

**Tests Generated**:
- Flag mechanics (setting/unsetting via commands)
- Blocked vs allowed exit testing
- Multiple conditional exits handling
- Unconditional exits always available
- Exit availability based on flag states
- Cross-scene flag consistency validation
- Integration with other commands (examine, inventory)
- Error handling and edge cases
- Manual flag manipulation
- Undefined flag state handling

#### 3.4 Weight/Capacity Generator (Day 12) ✅ COMPLETE
**Goal**: Generate weight and capacity restriction tests

- [x] **WeightTestGenerator** ✅ DONE
  - Weight threshold testing (light/medium/heavy items) ✅
  - Weight calculation accuracy ✅
  - Exit blocking mechanics ✅
  - Weight management strategies ✅
  - Container weight mechanics ✅
  - Edge cases and boundary conditions ✅
  - Integration with game state ✅
  - Weight limit information ✅
  - **20 tests generated for attic**

**Template**: weight-restrictions.template.ts ✅

**Tests Generated**:
- Weight threshold tests (empty inventory, light items, medium items)
- Weight calculation accuracy (individual items, total weight, consistency)
- Exit blocking when over weight limit
- Weight management strategies (dropping items to enable exits)
- Container weight including contents
- Edge cases (exactly at threshold, just over threshold)
- Integration with game state (weight persistence, failed exit attempts)
- Weight limit information (light vs heavy load detection)

### Phase 4: Workflow Generators (3-4 days)

#### 4.1 Simple Workflow Generator (Day 13)
**Goal**: Generate common interaction sequences

- [ ] **WorkflowGenerator**
  - Open container → examine → take item
  - Take item → examine → use item
  - Take treasure → move to destination → score

**Template**: workflow.template.ts

**Workflows to Generate**:
- Container interaction complete cycle
- Treasure collection workflow
- Tool usage workflow
- Navigation hub patterns

#### 4.2 Scene-Specific Journey Generator (Day 14)
**Goal**: Generate authentic gameplay sequences

- [ ] **UserJourneyGenerator**
  - Scene entry → exploration → exit
  - Puzzle solution sequences
  - Combat sequences (if applicable)

**Template**: user-journey.template.ts

**Journeys to Generate**:
- Mailbox complete interaction (west_of_house)
- Attic treasure hunting (attic)
- Kitchen navigation (kitchen)
- Trophy case workflow (living_room)

---

## Implementation Strategy

### Phase 1: Foundation (Days 1-3)

```bash
# Day 1: Consolidate helpers
npm run test:helpers:consolidate

# Day 2-3: Enhance analysis
npm run test:generators:analyze
```

**Milestones**:
- ✅ All command helpers in testing/helpers/
- ✅ ItemAnalyzer functional
- ✅ Enhanced SceneAnalyzer
- ✅ All existing tests still pass

### Phase 2: Command Generators (Days 4-10)

```bash
# Generate test for each command type
npm run generate:scene kitchen --commands take,drop,examine,open,close

# Validate generated tests
npm test -- testing/scenes/kitchen
```

**Milestones per Command**:
1. Generator class created
2. Template created
3. Integration with SceneTestGenerator
4. Tests generated for 3+ scenes
5. All generated tests pass

**Validation Scenes**:
- kitchen (moderate complexity, multiple items)
- attic (weight restrictions, containers)
- west_of_house (mailbox, various commands)

### Phase 3: Advanced Generators (Days 11-13)

```bash
# Generate advanced tests
npm run generate:scene attic --advanced state,weight,scoring

# Generate for all scenes with specific features
npm run generate:batch --filter "hasContainers" --commands open,close,state
```

**Milestones**:
- ✅ State validation tests working
- ✅ Scoring tests accurate
- ✅ Conditional access tests comprehensive
- ✅ Weight tests cover edge cases

### Phase 4: Workflows (Days 14-16)

```bash
# Generate workflow tests
npm run generate:workflows west_of_house
npm run generate:workflows attic
npm run generate:workflows kitchen

# Run all generated tests
npm test -- testing/scenes/
```

**Milestones**:
- ✅ Workflow generator functional
- ✅ Common workflows identified
- ✅ Scene-specific journeys generated
- ✅ 95%+ test pass rate

---

## Generator Architecture

### Enhanced File Structure

```
tools/test-generators/
├── src/
│   ├── cli.ts                          # Enhanced CLI
│   ├── SceneTestGenerator.ts           # Main orchestrator (enhanced)
│   ├── types/
│   │   └── GeneratorTypes.ts           # Enhanced types
│   ├── utils/
│   │   ├── sceneAnalyzer.ts            # ✅ Exists (to enhance)
│   │   ├── itemAnalyzer.ts             # ❌ NEW
│   │   ├── interactionAnalyzer.ts      # ❌ NEW
│   │   ├── workflowAnalyzer.ts         # ❌ NEW
│   │   ├── fileUtils.ts                # ✅ Exists
│   │   └── namingUtils.ts              # ✅ Exists
│   ├── generators/
│   │   ├── BaseGenerator.ts            # ✅ Exists
│   │   ├── HelperGenerator.ts          # ✅ Exists
│   │   ├── LookTestGenerator.ts        # ✅ Exists
│   │   ├── MoveTestGenerator.ts        # ✅ Exists
│   │   ├── FactoryGenerator.ts         # ✅ Exists
│   │   ├── TakeTestGenerator.ts        # ❌ NEW
│   │   ├── DropTestGenerator.ts        # ❌ NEW
│   │   ├── ExamineTestGenerator.ts     # ❌ NEW
│   │   ├── OpenTestGenerator.ts        # ❌ NEW
│   │   ├── CloseTestGenerator.ts       # ❌ NEW
│   │   ├── ReadTestGenerator.ts        # ❌ NEW
│   │   ├── PutTestGenerator.ts         # ❌ NEW
│   │   ├── InventoryTestGenerator.ts   # ❌ NEW
│   │   ├── StateValidationGenerator.ts # ❌ NEW
│   │   ├── ScoringGenerator.ts         # ❌ NEW
│   │   ├── ConditionalAccessGenerator.ts # ❌ NEW
│   │   ├── WeightTestGenerator.ts      # ❌ NEW
│   │   ├── WorkflowGenerator.ts        # ❌ NEW
│   │   └── UserJourneyGenerator.ts     # ❌ NEW
│   └── templates/
│       ├── helper.template.ts          # ✅ Exists
│       ├── look-test.template.ts       # ✅ Exists
│       ├── move-test.template.ts       # ✅ Exists
│       ├── factory.template.ts         # ✅ Exists
│       ├── take-test.template.ts       # ❌ NEW
│       ├── drop-test.template.ts       # ❌ NEW
│       ├── examine-test.template.ts    # ❌ NEW
│       ├── open-test.template.ts       # ❌ NEW
│       ├── close-test.template.ts      # ❌ NEW
│       ├── read-test.template.ts       # ❌ NEW
│       ├── put-test.template.ts        # ❌ NEW
│       ├── inventory-test.template.ts  # ❌ NEW
│       ├── state-validation.template.ts # ❌ NEW
│       ├── scoring.template.ts         # ❌ NEW
│       ├── conditional-access.template.ts # ❌ NEW
│       ├── weight-restrictions.template.ts # ❌ NEW
│       ├── workflow.template.ts        # ❌ NEW
│       └── user-journey.template.ts    # ❌ NEW
└── tests/
    └── generators/                     # Unit tests for generators
```

### Enhanced CLI

```bash
# Generate all test types for a scene
npm run generate:scene kitchen --all

# Generate specific command tests
npm run generate:scene kitchen --commands take,drop,open

# Generate advanced tests
npm run generate:scene attic --advanced state,weight,scoring

# Generate workflows
npm run generate:workflows west_of_house

# Batch generation
npm run generate:batch --scenes above_ground --all

# Dry run
npm run generate:scene kitchen --all --dry-run
```

---

## Success Metrics

### Coverage Goals

| Category | Target Coverage | Current | Gap |
|----------|----------------|---------|-----|
| **Basic Commands** | 100% | 14% (2/14) | 86% |
| **Item Commands** | 90% | 0% | 90% |
| **State Validation** | 85% | 0% | 85% |
| **Scoring** | 80% | 0% | 80% |
| **Workflows** | 70% | 0% | 70% |
| **Overall** | 90% | 13% | 77% |

### Quality Metrics

- **Test Pass Rate**: >95% on first generation
- **Code Quality**: Matches hand-written tests
- **Compilation**: 100% compilable on first generation
- **Maintainability**: Clear, documented, follows patterns
- **Time Savings**: 330+ hours saved across 196 scenes

### Per-Scene Test Count Goals

| Scene Complexity | Current Tests | Target Tests | Gap |
|-----------------|---------------|--------------|-----|
| **Simple** (no items) | 23 | 25 | 2 |
| **Moderate** (items, no monsters) | 23 | 120-180 | 97-157 |
| **Complex** (items + monsters) | 23 | 200-300 | 177-277 |

---

## Risk Mitigation

### Technical Risks

1. **Item Analysis Complexity**
   - Risk: Item JSON structure varies
   - Mitigation: Robust parsing with fallbacks

2. **Template Maintenance**
   - Risk: 20+ templates to maintain
   - Mitigation: Base template system, code generation for templates

3. **Test Interdependencies**
   - Risk: Tests may depend on each other
   - Mitigation: Isolated test environments, proper cleanup

4. **Performance**
   - Risk: Generating 30,000+ lines per scene
   - Mitigation: Incremental generation, caching, parallel processing

### Process Risks

1. **Scope Creep**
   - Risk: Trying to cover every edge case
   - Mitigation: Phased approach, 80/20 rule

2. **Quality Degradation**
   - Risk: Generated tests lower quality than hand-written
   - Mitigation: Regular reviews, validation suite, peer review

---

## Next Steps

### Immediate (This Session)

1. ✅ Complete this plan document
2. ⏳ Get approval from user
3. ⏳ Prioritize Phase 1 tasks
4. ⏳ Start Day 1: Consolidate command helpers

### This Week

- Complete Phase 1 (Foundation Enhancement)
- Begin Phase 2 (Command Test Generators)
- Validate with kitchen, attic, west_of_house scenes

### Next Week

- Complete Phase 2
- Begin Phase 3 (Advanced Generators)
- Generate tests for all above ground scenes

### Week 3

- Complete Phase 3 and 4
- Mass generate for all 196 scenes
- Documentation and handoff

---

## Appendix A: Test Type Details

### Basic Command Tests

**Structure**:
- Command execution with valid targets
- Command with invalid targets
- Command variations (aliases)
- Error handling
- State tracking (moves, score)

**Example**: TakeCommandTests
- Take individual items
- Take with aliases
- Take from containers
- Already taken handling
- Weight restrictions
- Command variations

### State Validation Tests

**Structure**:
- Initial state verification
- State change verification
- State persistence across commands
- State consistency checks

**Example**: ContainerStateTests
- Open container → verify open
- Close container → verify closed
- Examine after state change
- Multiple open/close cycles

### Workflow Tests

**Structure**:
- Multi-step sequences
- State transitions
- Expected outcomes
- Error recovery

**Example**: MailboxWorkflow
1. Examine closed mailbox
2. Open mailbox
3. Examine open mailbox
4. Look in mailbox
5. Take leaflet
6. Close mailbox

---

## Appendix B: Item Type Analysis

### Item Categories

1. **Takeable Items**
   - Simple objects (knife, brick)
   - Heavy items (rope)
   - Treasures (coin, jewels)

2. **Containers**
   - Openable/closeable (mailbox, box)
   - Capacity limits
   - Contains items

3. **Readable Items**
   - Leaflets, books, signs
   - Text content

4. **Tools**
   - Usable items (knife, rope)
   - Special actions

5. **Fixed Items**
   - Non-takeable (door, house)
   - Examinable only

### Interaction Matrix

| Item Type | Take | Drop | Open | Close | Examine | Read | Put |
|-----------|------|------|------|-------|---------|------|-----|
| Simple | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Container | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Readable | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Tool | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Fixed | ✗ | ✗ | ? | ? | ✓ | ? | ✗ |

---

## Appendix C: Priority Matrix

### High Priority (Phase 2)

Commands used in 50%+ of scenes:
- Take (critical for gameplay)
- Examine (exploration)
- Open/Close (containers)
- Drop (inventory management)

### Medium Priority (Phase 3)

Features in 20-50% of scenes:
- State validation
- Scoring
- Weight restrictions
- Conditional access

### Low Priority (Phase 4)

Complex features:
- Workflows
- User journeys
- Edge cases

---

## Questions for Review

1. **Scope**: Is 90% coverage target appropriate?
2. **Timeline**: Is 2-3 weeks realistic?
3. **Priorities**: Agree with phasing?
4. **Approach**: Incremental vs. big-bang?
5. **Quality**: What's acceptable pass rate on first generation?

---

**Document Status**: Draft for Review
**Next Update**: After Phase 1 completion
**Owner**: Claude Code
**Reviewers**: User
