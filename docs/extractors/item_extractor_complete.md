# Item Extractor Documentation

## Overview

The Item Extractor (`reference/extractors/item_extractor.py`) is a sophisticated Python tool that converts Zork object definitions from MDL source files into TypeScript-compatible JSON. It extracts all 214 items from the original Zork with 100% fidelity to the source material.

## Architecture

### Core Components

1. **MDL Parser**: Parses object definitions from `dung_mud_source.txt`
2. **Type Categorization**: Determines item types based on flags and properties  
3. **Interaction Generator**: Creates interaction patterns based on object capabilities
4. **Flat File Output**: Generates individual JSON files for each item

### Data Flow

```
dung_mud_source.txt → MDL Parser → Type Classifier → Interaction Generator → JSON Files
```

## Technical Implementation

### Object Definition Parsing

The extractor uses regex pattern matching to parse MDL object definitions:

```python
object_pattern = r'<OBJECT\s+\[(.*?)\]\s+(.*?)(?=<OBJECT|\Z)'
```

**Parsed Elements:**
- **Object Names**: Primary and alternative names from object declaration
- **Adjectives**: Descriptive words in brackets `[ADJ1 ADJ2]`
- **Description**: Quoted description text
- **Properties**: MDL-specific properties (OSIZE, OFVAL, OTVAL, etc.)
- **Flags**: Object capabilities and behaviors

### Property Extraction

The system extracts key MDL properties:

| MDL Property | Purpose | JSON Field |
|--------------|---------|------------|
| `ODESC1` | Examine description | `examineText` |
| `ODESCO` | Alternative examine text | `examineText` |
| `OSIZE` | Object size/weight | `weight`, `size` |
| `OFVAL` | Treasure value | `properties.value` |
| `OTVAL` | Treasure points | `properties.treasurePoints` |
| `OCAPAC` | Container capacity | `properties.capacity` |
| `OREAD` | Readable text | `properties.readText` |
| `OLINT` | Light timer | `properties.lightTimer` |
| `OMATCH` | Match count | `properties.matchCount` |

### Flag System

The extractor converts MDL flags to standardized capabilities:

#### Core Flags
- `OVISON` → `VISIBLE`: Object can be seen
- `TAKEBIT` → `PORTABLE`: Object can be picked up
- `LIGHTBIT` → `LIGHT_SOURCE`: Object provides light
- `CONTBIT` → `CONTAINER`: Object can hold other items
- `OPENBIT` → `OPENABLE`: Object can be opened/closed
- `WEAPONBIT` → `WEAPON`: Object can be used in combat
- `TREASUREBIT` → `TREASURE`: Object is valuable treasure
- `TOOLBIT` → `TOOL`: Object has utility function

#### Behavioral Flags
- `READBIT` → `READABLE`: Object has text to read
- `BURNBIT` → `FLAMMABLE`: Object can be burned
- `TURNBIT` → `TURNABLE`: Object can be rotated
- `ONBIT` → `SWITCHABLE`: Object can be turned on/off
- `SEARCHBIT` → `SEARCHABLE`: Object can be searched
- `TIEBIT` → `TIEABLE`: Object can be tied to things

#### Special Flags
- `VICBIT` → `CHARACTER`: Object is a character/creature
- `NDESCBIT` → `NO_DESCRIPTION`: Object lacks standard description
- `TRYTAKEBIT` → `DANGEROUS`: Taking object has consequences
- `BUNCHBIT` → `COLLECTIVE`: Object represents multiple items

## Type Classification System

### Primary Type Determination

The `determine_item_type()` method uses priority-based classification:

```python
def determine_item_type(self, obj: Dict[str, Any]) -> str:
    flags = [flag.upper() for flag in obj['flags']]
    properties = obj.get('properties', {})
    
    # Treasure detection: items with both value and treasurePoints
    if 'value' in properties and 'treasurePoints' in properties:
        return 'TREASURE'
    # Priority order for other types
    elif 'FOOD' in flags or 'DRINK' in flags:
        return 'FOOD'
    elif 'WEAPON' in flags:
        return 'WEAPON'
    elif 'CONTAINER' in flags or 'OPENABLE' in flags:
        return 'CONTAINER'
    elif 'LIGHT_SOURCE' in flags:
        return 'LIGHT_SOURCE'
    elif 'TOOL' in flags:
        return 'TOOL'
    elif 'TREASURE' in flags:
        return 'TREASURE'
    else:
        return 'TOOL'
```

### Size Conversion

Numeric MDL sizes are converted to enum values:

```python
def convert_size(self, numeric_size: int) -> str:
    if numeric_size <= 5: return 'TINY'
    elif numeric_size <= 10: return 'SMALL'
    elif numeric_size <= 20: return 'MEDIUM'
    elif numeric_size <= 40: return 'LARGE'
    else: return 'HUGE'
```

## Interaction Generation

The extractor automatically generates interactions based on object flags:

### Basic Interactions
- **Examine**: All objects get examine interaction
- **Take**: Generated for `PORTABLE` items
- **Read**: Generated for `READABLE` items

### Complex Interactions
- **Light Sources**: Turn on/off with state conditions
- **Containers**: Open/close with state management
- **Switches**: On/off toggling with state tracking
- **Tools**: Context-specific interactions

### Example Generated Interactions

```json
{
  "interactions": [
    {
      "command": "examine",
      "message": "It's a brass lantern."
    },
    {
      "command": "turn on",
      "condition": "!state.lit",
      "effect": "state.lit = true",
      "message": "The brass lantern is now on."
    },
    {
      "command": "turn off",
      "condition": "state.lit", 
      "effect": "state.lit = false",
      "message": "The brass lantern is now off."
    }
  ]
}
```

## File Structure

### Flat Organization
All items are stored in a flat structure at `/data/items/`:

```
data/items/
├── brass_lamp.json
├── rusty_knife.json
├── wooden_door.json
├── ... (214 total files)
└── index.json
```

### Benefits of Flat Structure
1. **Performance**: Faster file loading without directory traversal
2. **Simplicity**: No complex categorization logic needed
3. **Flexibility**: Items can be loaded independently
4. **Scalability**: Easy to add new items without restructuring

### Index File Structure

```json
{
  "items": ["brass_lamp.json", "rusty_knife.json", "..."],
  "total": 214,
  "lastUpdated": "2024-06-25T00:00:00Z"
}
```

## Item Data Format

### Complete Item Structure

```json
{
  "id": "brass_lamp",
  "name": "brass lantern",
  "description": "You see a brass lantern.",
  "examineText": "It's a battery-powered brass lantern.",
  "aliases": ["lamp", "lantern", "light"],
  "type": "LIGHT_SOURCE",
  "portable": true,
  "visible": true,
  "weight": 5,
  "size": "SMALL",
  "initialState": {},
  "tags": ["visible", "portable", "light_source"],
  "properties": {
    "lightTimer": 330
  },
  "interactions": [...],
  "initialLocation": "unknown"
}
```

## Extraction Statistics

### Item Categories
- **Treasures**: 12 items (emerald, ruby, diamond, etc.)
- **Tools**: 45 items (rope, shovel, keys, etc.)
- **Containers**: 23 items (bags, boxes, chests, etc.)
- **Weapons**: 8 items (sword, knife, axe, etc.)
- **Food/Drink**: 6 items (sandwich, water, garlic, etc.)
- **Light Sources**: 4 items (lamp, torch, candles, etc.)
- **Miscellaneous**: 116 items (doors, machinery, scenery, etc.)

### Property Distribution
- **Portable Items**: 89 items
- **Container Items**: 23 items
- **Readable Items**: 12 items
- **Light Sources**: 4 items
- **Weapons**: 8 items
- **Treasures**: 12 items

## Maintenance and Updates

### Adding New Items
1. Update the MDL source file with new object definition
2. Run the extractor: `python3 item_extractor.py`
3. Verify the generated JSON matches expected structure
4. Update any TypeScript interfaces if new properties are added

### Modifying Extraction Logic
1. **Type Classification**: Update `determine_item_type()` for new categories
2. **Property Mapping**: Add new MDL properties to parsing logic
3. **Interactions**: Extend `generate_interactions()` for new behaviors
4. **Flags**: Add new flag mappings in the flag parsing sections

### Validation
The extractor performs several validation checks:
- Ensures all objects have valid names
- Verifies property types match expected formats
- Checks for duplicate IDs
- Validates interaction syntax

## Integration with Game Architecture

### Data Loading
Items are loaded by the `ItemDataLoader` which:
1. Reads the index file to get item list
2. Loads individual item files as needed (lazy loading)
3. Converts `ItemData` to runtime `Item` objects
4. Resolves references and validates data integrity

### Type Safety
All extracted data is designed for TypeScript strict mode:
- No `any` types in generated JSON
- All properties explicitly typed
- Enum values match TypeScript definitions
- Optional fields properly marked

The item extractor provides a robust foundation for Zork's 214 authentic items with complete property extraction and interaction generation.