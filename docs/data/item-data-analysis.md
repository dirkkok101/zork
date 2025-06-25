# Item Data Analysis

This document provides a comprehensive analysis of the actual Zork item data structure and quality to help developers understand what to expect when working with the real game data.

## File Structure

The item data consists of:
- **214 individual JSON files** (one per item)
- **1 index.json file** containing the master list
- **Total of 215 files** in `/data/items/`

Each item has its own JSON file named with a truncated ID (e.g., `lamp.json`, `sword.json`, `!!!!!.json`).

## Item Type Distribution

Based on analysis of all 214 items:

| Type | Count | Percentage |
|------|--------|------------|
| TOOL | 164 | 76.6% |
| CONTAINER | 36 | 16.8% |
| FOOD | 7 | 3.3% |
| WEAPON | 5 | 2.3% |
| LIGHT_SOURCE | 2 | 0.9% |
| TREASURE | 0 | 0.0% |

**Key Insight**: The majority of items (76.6%) are classified as `TOOL`, which serves as a catch-all category. Traditional "treasure" items like crowns and jewels are actually categorized as `TOOL` rather than `TREASURE`.

## Portability Statistics by Type

| Type | Portable | Non-Portable | Portable % |
|------|----------|--------------|------------|
| FOOD | 7 | 0 | 100.0% |
| LIGHT_SOURCE | 2 | 0 | 100.0% |
| WEAPON | 3 | 2 | 60.0% |
| CONTAINER | 19 | 17 | 52.8% |
| TOOL | 71 | 93 | 43.3% |

**Testing Implications**: Don't assume all items of a type are portable. Nearly half (43.3%) of tools are non-portable, including many interactive game elements like doors, walls, and machinery.

## Data Quality Issues

### Duplicate Aliases (9 items affected)
Items with duplicate aliases in their arrays:
- `pot` - "GOLD" appears twice
- `brace`, `bar`, `chali`, `dboat`, `torch`, `bat`, `iboat`, `coin` - various duplicates

### Duplicate Tags (100+ items affected)
Most items have duplicate tags, commonly:
- `"portable"` appearing twice in the same array
- Type-specific tags duplicated (e.g., `"weapon"`, `"container"`)

**Example from lamp.json:**
```json
"tags": [
  "portable",
  "portable",
  "light_source"
]
```

### Empty Arrays (100+ items affected)
Many items have empty `tags` or `aliases` arrays instead of omitting the property entirely.

**Testing Pitfall**: When filtering by tags or aliases, account for:
1. Empty arrays
2. Duplicate entries
3. Inconsistent presence of arrays

## Special Character Items

Two items have special characters in their IDs:
- `!!!!!` - ID and name are literally "!!!!!"
- `*bun*` - ID is "*bun*", name is "*BUN*"

Both are:
- Type: `TOOL`
- Non-portable
- Have empty aliases and tags arrays
- Minimal interaction (examine only)

**Testing Consideration**: These items test edge cases in ID parsing, file naming, and display logic.

## Item ID Patterns and Naming Conventions

### Truncated IDs
Item IDs are truncated to approximately 5 characters:
- `lamp` (full word)
- `sword` (full word)
- `garli` (truncated from "garlic")
- `chali` (truncated from "chalice")
- `diamo` (truncated from "diamond")

### Numbered Items
Some items use numbers in their IDs:
- `one`, `two`, `three`, `four`, `five`, `six`, `seven`, `eight` (number items)
- `hook1`, `hook2` (paired items)
- `refl1`, `refl2` (reflection items)

### Special Prefixes
- Door items often start with location letters: `cdoor`, `fdoor`, `ldoor`, `mdoor`
- Color-coded items: `blamp` (black lamp), `whbk` (white book), `grbk` (green book)

## Interaction Command Patterns

Based on analysis of all item interactions:

| Command | Frequency | Usage |
|---------|-----------|--------|
| examine | 214 | Every item (100%) |
| take | 102 | Portable items (47.7%) |
| open | 36 | Containers and openable items |
| close | 36 | Same items that can open |
| turn on | 3 | Light sources and machinery |
| turn off | 3 | Same items that can turn on |

**Key Patterns**:
- Every item has an "examine" interaction
- "take" interactions correlate strongly with portability (102 items have "take", 102 items are portable)
- Open/close commands are perfectly paired
- Turn on/off commands are perfectly paired

## Common Data Structure

All items follow this structure:
```json
{
  "id": "string",           // Truncated identifier
  "name": "string",         // Display name
  "description": "string",  // Brief description
  "examineText": "string",  // Detailed examination text
  "aliases": ["string"],    // Alternative names (may have duplicates)
  "type": "enum",          // TOOL|CONTAINER|FOOD|WEAPON|LIGHT_SOURCE
  "portable": boolean,      // Can be picked up
  "visible": boolean,       // Can be seen (always true in current data)
  "weight": number,         // Typically 5-35
  "size": "enum",          // TINY|SMALL|MEDIUM|LARGE
  "initialState": {},       // State variables (usually empty)
  "tags": ["string"],      // Category tags (may have duplicates/empty)
  "properties": {},        // Additional properties (often just size)
  "interactions": [],      // Command interactions
  "initialLocation": "string" // Always "unknown" in current data
}
```

## Testing Pitfalls

### 1. Type Assumptions
- Don't assume `TREASURE` type exists (count is 0)
- Don't assume all `TOOL` items are simple tools (includes complex items like crowns)

### 2. Array Handling
- Check for empty arrays before iteration
- Deduplicate aliases and tags if uniqueness is required
- Handle missing arrays gracefully

### 3. Portability Logic
- Don't assume all items of certain types are portable
- Cross-reference with actual `portable` property

### 4. ID Formatting
- Handle special characters in IDs (`!`, `*`)
- Account for truncated names vs. full display names
- File names exactly match IDs with `.json` extension

### 5. Interaction Assumptions
- Not all portable items have "take" interactions (though correlation is very high)
- Open/close and turn on/off are always paired in current data

## Recommendations for Developers

### Data Loading
```typescript
// Handle missing or empty arrays
const aliases = item.aliases?.filter(Boolean) || [];
const tags = [...new Set(item.tags?.filter(Boolean) || [])]; // Deduplicate

// Validate required fields
if (!item.id || !item.name || !item.type) {
  throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
}
```

### Testing Strategy
1. **Test with special character items** (`!!!!!`, `*bun*`) to ensure robust ID handling
2. **Test portability edge cases** - don't assume type determines portability
3. **Test empty/duplicate array handling** - very common in the dataset
4. **Test interaction availability** - correlate with item properties
5. **Use actual item counts** - 214 total items, not 200 or 250

### Performance Considerations
- Each item is in a separate file - stateless loading on each request
- 214 individual HTTP requests if loading dynamically
- Index file provides complete item list for bulk operations
- Stateless design means no memory caching between requests

This analysis reflects the actual state of the Zork item data as extracted from reference sources, providing realistic expectations for developers working with this authentic recreation.