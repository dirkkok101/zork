# Zork 1 Text Adventure Game Documentation

This is a 100% authentic recreation of the original Zork 1 text adventure game.
We are using original game material as references and recreating the game using modern software development principles and technologies.
The main reference material for this project is https://github.com/bburns/Lantern
The aim is to reuse the original game scenes, monsters, items, scoring elements in a modern game architecture

# Technologies used

HTML
Typescript
SCSS

# UX

We are going for a green screen retro look and feel that can run in modern browsers
We want to use text under interface elements but with modern quality of life elements
We want the command parser to have command suggestions based on the current game context
But we don't want to spoil the game for the user

# Architecture

DataLoader layer to load data from the data files into memory using our type safe types
Services layer that operates on game data
Command layer that orchestrates between services to achieve game logic
Presentation layer to render the game state to the user and receive input from the user and marshal to commands

# Data Extraction and Verification

## Source Material
We extract game data from original Zork source files:
- **dung_mud_source.txt** - Main MDL source (179 KB) with object, monster, and room definitions
- **b_mud_source.txt** - Additional MDL logic (26 KB) for puzzles and mechanics
- **zork_source.json** - Structured room/exit data (92 KB) from Lantern Project

## Extraction Pipeline
Python extractors convert MDL source to TypeScript-compatible JSON:
1. **item_extractor.py** - Extracts 214 items with properties and interactions
2. **monster_extractor.py** - Extracts 9 monsters (cyclops, ghost, gnome_of_zurich, grue, guardian_of_zork, thief, troll, vampire_bat, volcano_gnome) with combat data
3. **scene_extractor.py** - Extracts 196 scenes with exits and lighting
4. **mechanics_extractor.py** - Creates game systems (scoring, death, flags)
5. **interactions_extractor.py** - Generates command system

## Data Verification
Automated verification scripts ensure 100% fidelity to source material:
- **scene_verifier.py** - Validates exits and ID conversions
- **monster_verifier.py** - Validates monster data completeness
- **Data loader tests** - TypeScript validation of all JSON files

See [Data Verification Guide](./data/data-verification-guide.md) for complete verification procedures.

## Documentation Structure

- [Services Documentation](./services/) - Complete service architecture and interfaces
  - [Service Reference](./services/service-reference.md) - Complete reference for all 10 implemented services (2,891 lines)
  - [Service Implementation Guide](./services/service-implementation-guide.md) - Step-by-step guide for adding new services
- [Data Documentation](./data/) - Item data analysis and structure
  - [Data Verification Guide](./data/data-verification-guide.md) - How we ensure data fidelity to source material
- [Extractors Documentation](./extractors/) - Data extraction from MDL source files
- [Testing Documentation](./testing/) - Testing guidelines and best practices
  - [Scene Integration Testing Guide](./testing/scene-integration-testing-guide.md) - Comprehensive guide to scene testing (15/196 scenes covered)
  - [Testing Guidelines](./testing/testing-guidelines.md) - Overall testing philosophy and patterns
  - [Unit Test Best Practices](./testing/unit-test-best-practices.md) - Unit testing patterns learned from comprehensive test reviews
- [Commands Documentation](./commands/) - Command layer implementation
  - [Command Reference](./commands/command-reference.md) - Complete reference for all 12 implemented commands (3,231 lines)
  - [Command Implementation Guide](./commands/command-implementation-guide.md) - Step-by-step guide for adding new commands
- [UI Documentation](./ui/) - User interface and presentation layer
- [Test Generators](../tools/test-generators/) - Automated test generation for scenes

# Development approach

We are making use of typescript in strict mode
We always want to work with known types and be type safe
All code should be documented
We are using SOLID coding principles
All code must be unit testable and integration testable
We are aiming for 100% code coverage in commands, services and data access
The reference material is our gospel
If we have a conflict between a unit test and the code we are testing we go back to the reference material to confirm the behaviour
We use logging with different log levels from the LogLevel package so that we can support debug, info, critical and error log messages
