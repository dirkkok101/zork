# Zork Scene Test Generator

Automated code generator for Zork scene integration tests. Generates 80%+ of test boilerplate from scene JSON data.

## Current Status

**Coverage**: 15 out of 196 scenes have tests (7.7%)
- **Generated**: 10 simple scenes (north_of_house, south_of_house, beach, forest_1-4, clearing, reservoir, dam, forest_4)
- **Hand-written**: 5 complex scenes (west_of_house, kitchen, living_room, attic, behind_house)

**Test Files**: 69 test files total, 59 helper/factory files

See [Scene Integration Testing Guide](../../docs/testing/scene-integration-testing-guide.md) for complete testing documentation.

## Quick Start

### Generate tests for a scene
```bash
npm run generate:scene <scene_id>
```

### Preview without writing files
```bash
npm run generate:scene <scene_id> -- --dry-run --verbose
```

### Validate scene can be generated
```bash
npm run generate:validate <scene_id>
```

## Examples

```bash
# Generate tests for north_of_house
npm run generate:scene north_of_house

# Generate with verbose output
npm run generate:scene kitchen -- --verbose

# Dry run to see what would be generated
npm run generate:scene troll_room -- --dry-run

# Custom output directory
npm run generate:scene cellar -- --output ./custom/path
```

## What Gets Generated

For each scene, the generator creates:

1. **Scene Helper** (`{scene}_helper.ts`)
   - Scene reset and state management
   - Verification utilities
   - Item and exit helpers

2. **Integration Test Factory** (`integration_test_factory.ts`)
   - Test environment setup
   - Service initialization
   - Mock services

3. **Look Command Tests** (`basic_look.test.ts`)
   - First visit behavior
   - Subsequent visits
   - Exit display
   - Atmospheric elements
   - Command variations

4. **Movement Tests** (`basic_movement.test.ts`)
   - Simple exits
   - Conditional exits
   - Blocked exits
   - Movement mechanics

5. **Setup File** (`setup.ts`)
   - Jest configuration
   - Test timeouts

## Generator Intelligence

The generator analyzes scene JSON and automatically:

- ✅ Detects scene complexity (simple/moderate/complex)
- ✅ Identifies items and their types (container/treasure/tool)
- ✅ Analyzes exit types (simple/conditional/blocked)
- ✅ Determines if scene awards first-visit points
- ✅ Handles atmospheric elements
- ✅ Adapts templates based on scene characteristics

## Scene Complexity Detection

- **Simple:** Navigation-only scenes (corridors, paths)
- **Moderate:** Scenes with items or conditional exits
- **Complex:** Scenes with monsters, puzzles, or multiple mechanics

## Project Structure

```
tools/test-generators/
├── src/
│   ├── cli.ts                    # Command-line interface
│   ├── SceneTestGenerator.ts     # Main orchestrator
│   ├── generators/               # Code generators
│   ├── templates/                # Handlebars templates
│   ├── utils/                    # Utilities
│   └── types/                    # TypeScript types
├── package.json
├── tsconfig.json
├── STATUS.md                     # Current progress
└── README.md                     # This file
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview generation without writing files |
| `--verbose` | Show detailed generation process |
| `--output <dir>` | Custom output directory |
| `--overwrite` | Overwrite existing files |

## Development

### Run from tools directory
```bash
cd tools/test-generators
npm run generate:scene <scene_id>
```

### Run from project root
```bash
npm run generate:scene <scene_id>
```

Both work - the generator auto-detects its location.

## Template Customization

Templates are in `src/templates/`:
- `helper.template.ts` - Scene helper class
- `look-test.template.ts` - Look command tests
- `move-test.template.ts` - Movement tests
- `factory.template.ts` - Test factory

Uses Handlebars for templating with custom helpers:
- `{{#if condition}}` - Conditional rendering
- `{{#each array}}` - Iterate collections
- `{{pluralize}}` - Smart pluralization
- `{{capitalize}}` - String capitalization

## Testing the Generator

```bash
# Test with simple scene (no items, no monsters)
npm run generate:scene north_of_house -- --dry-run

# Test with items
npm run generate:scene kitchen -- --dry-run

# Test with monsters
npm run generate:scene troll_room -- --dry-run

# Test with conditional exits
npm run generate:scene cellar -- --dry-run
```

## Troubleshooting

### Scene not found
- Ensure scene JSON exists in `data/scenes/{scene_id}.json`
- Check scene ID matches filename (without .json extension)

### Import errors in generated code
- Generated tests may reference helpers that need to be copied from existing tests
- See STATUS.md for known issues

### TypeScript errors
- Run `npm run typecheck` to validate generated code
- Check that all imports resolve correctly

## Roadmap

- [x] Phase 1: Framework setup
- [x] Phase 2: Core generators (helper, look, move, factory)
- [ ] Phase 3: Validation & refinement
- [ ] Phase 4: Add item interaction tests
- [ ] Phase 5: Add user journey generators
- [ ] Phase 6: Mass generation for all 196 scenes

## Contributing

When adding new generators:
1. Extend `BaseGenerator` class
2. Create template in `src/templates/`
3. Add generator to `SceneTestGenerator.ts`
4. Update this README

## Support

See `STATUS.md` for current progress and known issues.
