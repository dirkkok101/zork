# ItemDataLoader Integration Tests

This directory contains comprehensive integration tests for the `ItemDataLoader` class that validate its ability to load and process the actual Zork game data files.

## Overview

These integration tests differ from unit tests in that they:
- **Use real data files** from `data/items/` (no mocking)
- **Test actual file system operations** 
- **Validate the complete 214-item dataset**
- **Test performance with real data volumes**
- **Verify data integrity across all items**

## Test Structure

### Type-Based Tests (`types/`)

Tests each item type with real data from flat file structure:

- **`tool_items.test.ts`** - 164 TOOL items (weapons, treasures, consumables, interactive objects)
- **`container_items.test.ts`** - 36 CONTAINER items  
- **`food_items.test.ts`** - 7 FOOD items
- **`weapon_items.test.ts`** - 5 WEAPON items
- **`light_source_items.test.ts`** - 2 LIGHT_SOURCE items

Each type test validates:
- Loading all items of the specific type
- Proper enum values (ItemType, Size)
- Type-specific properties
- Interaction structures
- Performance benchmarks
- Stateless behavior (no caching)

### Cross-Functional Tests (`cross_functional/`)

Tests that span multiple types:

- **`full_dataset.test.ts`** - Loading all 214 items from flat structure
- **`type_distribution.test.ts`** - Validates actual type distribution in data  
- **`special_items.test.ts`** - Items with special characters (`!!!!!`, `*bun*`)
- **`performance.test.ts`** - Stateless performance benchmarks (no caching benefits)

### Data Integrity Tests (`data_integrity/`)

Validates data quality across the full dataset:

- **`enum_validation.test.ts`** - All enum values are valid
- **`required_fields.test.ts`** - All 15 required fields present
- **`interactions.test.ts`** - Complex interaction parsing

### Error Handling Tests (`error_handling/`)

Tests resilience and error scenarios:

- **`missing_files.test.ts`** - Missing item files
- **`corrupted_data.test.ts`** - Data validation and integrity

## Key Test Features

### Real Data Validation
- Tests actual JSON files from `data/items/`
- Validates all 214 items load correctly
- Ensures enum values match TypeScript interfaces
- Verifies required field presence and types

### Performance Benchmarks
- Single item load: < 10ms (fresh file I/O each time)
- Type filtering: ~200-500ms (loads all items + client-side filter)
- Full dataset: < 500ms (214 individual file reads)
- No caching benefits (stateless design)

### Special Cases Coverage
- Items with special characters in IDs
- Type distribution patterns (most items are TOOL type)
- Edge cases (zero weight, empty arrays)
- Error recovery scenarios

### Data Quality Assurance
- All 214 items have valid structures
- Interaction parsing works correctly
- Enum values are consistently applied
- No data corruption or missing fields

## Running the Tests

```bash
# Run all integration tests
npm test testing/data_loaders/item_data_loader/integration_tests/

# Run specific test suites
npm test testing/data_loaders/item_data_loader/integration_tests/types/
npm test testing/data_loaders/item_data_loader/integration_tests/cross_functional/
npm test testing/data_loaders/item_data_loader/integration_tests/data_integrity/
npm test testing/data_loaders/item_data_loader/integration_tests/error_handling/

# Run specific test files
npm test testing/data_loaders/item_data_loader/integration_tests/types/tool_items.test.ts
npm test testing/data_loaders/item_data_loader/integration_tests/cross_functional/full_dataset.test.ts
```

## Test Data Requirements

These tests require:
- **Real data files** in `data/items/` (flat structure)
- **Complete dataset** of 214 items
- **Valid index.json** with items array (no category mappings)
- **Proper file structure** matching the expected flat paths

## Expected Test Results

When run against the complete Zork dataset, these tests should:
- ✅ Load all 214 items successfully
- ✅ Validate all enum values are correct
- ✅ Confirm all required fields are present
- ✅ Verify interaction parsing works
- ✅ Meet performance benchmarks
- ✅ Handle error cases gracefully

## Integration with Unit Tests

These integration tests complement the unit tests by:
- **Unit tests** validate logic with controlled, mocked data
- **Integration tests** validate the complete system with real data
- Together they provide comprehensive coverage

## Debugging Failed Tests

If integration tests fail:

1. **Check data files** - Ensure `data/items/` contains all expected files in flat structure
2. **Verify file structure** - Confirm index.json items array matches actual files  
3. **Review enum values** - Check if new enum values were added
4. **Check file paths** - Ensure flat file paths resolve correctly
5. **Validate JSON** - Ensure all JSON files are valid and parseable

## Test Type Coverage

| Type | Items | Key Validations |
|----------|-------|----------------|
| TOOL | 164 | Diverse functional behavior (weapons, treasures, consumables) |
| CONTAINER | 36 | Container mechanics, storage logic |
| FOOD | 7 | Consumption mechanics |
| WEAPON | 5 | Combat interactions (subset using WEAPON type) |
| LIGHT_SOURCE | 2 | Illumination properties |
| TREASURE | 0 | Enum exists but unused |
| **Total** | **214** | **Complete flat dataset coverage** |

## Performance Expectations

| Operation | Target | Actual Range |
|-----------|--------|--------------|
| Single item load | < 10ms | 1-5ms (fresh I/O) |
| Type filtering | < 500ms | 200-500ms (loads all + filter) |
| Full dataset | < 500ms | 200-500ms (214 file reads) |
| Repeated calls | Same as first | No caching optimization |
| Memory usage | Constant | No growth (stateless) |

These integration tests provide confidence that the ItemDataLoader correctly processes the complete Zork game dataset with its stateless architecture and maintains the data integrity required for authentic gameplay.