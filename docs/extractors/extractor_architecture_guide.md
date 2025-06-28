# Zork Extractor Architecture Guide

## Overview

The Zork Extractor Pipeline converts original game data from MDL source files and design specifications into TypeScript-compatible JSON files. This architecture ensures 100% authentic recreation of the original Zork experience while maintaining modern development standards.

## Architecture Principles

### 1. Source Fidelity
- **Preserve Original Data**: Extract authentic values from MDL source files
- **No Invention**: Avoid creating data not present in original sources
- **Complete Coverage**: Extract all game elements systematically

### 2. Type Safety 
- **TypeScript Compatibility**: All JSON validates against strict TypeScript interfaces
- **No `any` Types**: Explicit typing for all data structures
- **Enum Compliance**: String values match TypeScript enum definitions

### 3. Performance Optimization
- **Flat File Structure**: Minimize directory traversal overhead
- **Lazy Loading**: Individual files for independent loading
- **Minimal Metadata**: Essential data only, no redundant information

### 4. Maintainability
- **Single Source of Truth**: Clear origin for each piece of data
- **Modular Design**: Independent extractors for different data types
- **Validation**: Built-in checks for data integrity

## Extractor Pipeline

### Data Flow Architecture

```
Original Sources → Extractors → JSON Data → TypeScript Loaders → Game Services
```

#### Stage 1: Original Sources
- **dung_mud_source.txt**: Object definitions, rooms, monsters
- **b_mud_source.txt**: Additional game logic and mechanics
- **Design Specifications**: Scoring, death mechanics, game balance

#### Stage 2: Extractors (Python)
- **Monster Extractor**: Parses creature definitions from MDL
- **Item Extractor**: Converts object definitions to item data
- **Mechanics Extractor**: Creates game systems from specifications

#### Stage 3: JSON Data
- **Flat Structure**: All entities at root level of category folders
- **Individual Files**: One JSON file per game entity
- **Index Files**: Metadata and entity lists for efficient loading

#### Stage 4: TypeScript Loaders
- **Data Loaders**: Convert JSON to runtime objects (ItemDataLoader, etc.)
- **Type Conversion**: Transform data types to runtime interfaces
- **Validation**: Ensure data integrity and completeness

#### Stage 5: Game Services
- **Service Layer**: Business logic operating on loaded data
- **Commands Layer**: User interactions coordinating services
- **UI Layer**: Presentation of game state and interactions

## Common Patterns

### Naming Conventions

#### File Names
- **Snake Case**: All file names use `snake_case_naming`
- **Descriptive IDs**: `brass_lamp.json`, `troll_room.json`, `defeat_thief.json`
- **No Spaces**: Filesystem-safe names for all platforms

#### Property Names  
- **Camel Case**: JSON properties use `camelCase`
- **Descriptive**: `examineText`, `combatStrength`, `initialLocation`
- **Consistent**: Same property names across all extractors

### ID Generation

All extractors follow consistent ID generation:

```python
def generate_id(self, name: str) -> str:
    """Convert display name to filesystem-safe ID"""
    return name.lower().replace(' ', '_').replace('-', '_')
```

**Examples:**
- "Brass Lantern" → `brass_lantern`
- "One-Eyed Giant" → `one_eyed_giant` 
- "Trophy Case" → `trophy_case`

### Flag Standardization

#### MDL to Standard Flag Mapping
All extractors use consistent flag mapping:

| MDL Flag | Standard Flag | Purpose |
|----------|---------------|---------|
| `OVISON` | `VISIBLE` | Object can be seen |
| `TAKEBIT` | `PORTABLE` | Object can be picked up |
| `LIGHTBIT` | `LIGHT_SOURCE` | Object provides light |
| `CONTBIT` | `CONTAINER` | Object holds other items |
| `WEAPONBIT` | `WEAPON` | Object used in combat |
| `TREASUREBIT` | `TREASURE` | Object is valuable |
| `VICBIT` | `CHARACTER` | Object is a creature |
| `VILLAIN` | `VILLAIN` | Creature is hostile |

### Error Handling Patterns

All extractors implement consistent error handling:

```python
def extract_with_validation(self, source_data):
    """Extract data with comprehensive error handling"""
    try:
        # Parse source data
        parsed_data = self.parse_source(source_data)
        
        # Validate completeness
        self.validate_required_fields(parsed_data)
        
        # Transform to JSON format
        json_data = self.transform_to_json(parsed_data)
        
        # Final validation
        self.validate_output(json_data)
        
        return json_data
        
    except ValidationError as e:
        print(f"Validation failed: {e}")
        return None
    except ParseError as e:
        print(f"Parse error: {e}")
        return None
```

## File Structure Standards

### Directory Organization

```
data/
├── scenes/           # 196 scene files + index
├── items/            # 214 item files + index  
├── monsters/         # 9 monster files + index
├── mechanics/        # 4 mechanics files + index
└── interactions/     # Command system files + index
```

### Index File Format

All categories include standardized index files:

```json
{
  "entities": ["entity1.json", "entity2.json", "..."],
  "total": 214,
  "types": {
    "type1": ["entity1.json", "..."],
    "type2": ["entity2.json", "..."]
  },
  "lastUpdated": "2024-06-25T00:00:00Z"
}
```

### Entity File Format

All entity files follow consistent structure:

```json
{
  "id": "unique_identifier",
  "name": "Display Name", 
  "type": "ENTITY_TYPE",
  "description": "Basic description",
  "examineText": "Detailed examination text",
  "properties": {},
  "flags": {},
  "interactions": [],
  "metadata": {}
}
```

## Extractor Implementations

### Monster Extractor (`monster_extractor.py`)

**Purpose**: Extract creature data from MDL source files

**Key Features:**
- MDL object definition parsing
- Complex melee message extraction from PSETG tables
- Combat strength and behavior function mapping
- Type classification based on flags

**Output**: 9 monster files with complete combat and behavioral data

### Item Extractor (`item_extractor.py`)

**Purpose**: Convert object definitions to interactive items

**Key Features:**
- Comprehensive property extraction (size, value, capacity, etc.)
- Intelligent type classification with priority system
- Automatic interaction generation based on capabilities
- Support for complex objects (containers, light sources, weapons)

**Output**: 214 item files with full interaction systems

### Mechanics Extractor (`mechanics_extractor.py`)

**Purpose**: Create foundational game systems

**Key Features:**
- Hardcoded mechanics based on original game design
- Balanced scoring system with authentic treasure values
- Complete death and resurrection mechanics
- Global flag system with puzzle dependencies

**Output**: 4 mechanics files defining core game systems

## Best Practices for New Extractors

### 1. Design Phase

**Analyze Source Material:**
```python
# Study the source format thoroughly
def analyze_source_format(self, source_file):
    """Document all patterns and structures in source"""
    patterns = self.identify_patterns(source_file)
    edge_cases = self.find_edge_cases(source_file)
    return self.create_extraction_strategy(patterns, edge_cases)
```

**Define Output Schema:**
```python
# Create clear TypeScript interfaces first
interface NewEntityData {
  id: string;
  name: string;
  type: EntityType;
  properties: Record<string, any>;
}
```

### 2. Implementation Phase

**Modular Parsing:**
```python
class NewExtractor:
    def parse_entities(self):
        """Main parsing logic"""
        pass
    
    def validate_entity(self, entity):
        """Validation for single entity"""
        pass
    
    def transform_entity(self, raw_entity):
        """Transform to JSON format"""
        pass
```

**Comprehensive Testing:**
```python
def test_extraction(self):
    """Test all edge cases and normal cases"""
    # Test normal entities
    # Test edge cases
    # Test error conditions
    # Validate output format
```

### 3. Quality Assurance

**Data Validation:**
- Required fields present
- Type consistency  
- Reference integrity
- No data invention

**Performance Testing:**
- File size optimization
- Loading time measurement
- Memory usage analysis

**Integration Testing:**
- TypeScript loader compatibility
- Service layer integration
- End-to-end game functionality

## Troubleshooting Guide

### Common Issues

#### Parse Failures
**Symptom**: Extractor fails to parse source data
**Solutions**:
1. Check regex patterns for MDL format changes
2. Verify source file encoding (UTF-8)
3. Handle edge cases in object definitions
4. Add debug logging to identify parsing point failures

#### Missing Data
**Symptom**: Some entities not extracted
**Solutions**:
1. Verify source file completeness
2. Check object name patterns
3. Review filtering logic for excludes
4. Validate parsing regex captures all variants

#### Type Errors
**Symptom**: Generated JSON fails TypeScript validation
**Solutions**:
1. Ensure property types match interface definitions
2. Handle null/undefined values properly
3. Validate enum values against TypeScript enums
4. Check array vs single value consistency

#### Performance Issues
**Symptom**: Slow extraction or large file sizes
**Solutions**:
1. Optimize regex patterns for performance
2. Remove redundant data from output
3. Consider compression for large text fields
4. Profile extraction steps to identify bottlenecks

### Debugging Techniques

#### Verbose Logging
```python
def extract_with_logging(self, source_data):
    """Extract with detailed debug information"""
    logger.info(f"Starting extraction of {len(source_data)} entities")
    
    for i, entity in enumerate(source_data):
        logger.debug(f"Processing entity {i}: {entity.get('name', 'unknown')}")
        
        try:
            result = self.process_entity(entity)
            logger.debug(f"Successfully processed: {result['id']}")
        except Exception as e:
            logger.error(f"Failed to process entity {i}: {e}")
            logger.debug(f"Entity data: {entity}")
```

#### Validation Reporting
```python
def validate_extraction_results(self, results):
    """Generate comprehensive validation report"""
    report = {
        'total_entities': len(results),
        'successful': 0,
        'failed': 0,
        'warnings': [],
        'errors': []
    }
    
    for entity in results:
        if self.validate_entity(entity):
            report['successful'] += 1
        else:
            report['failed'] += 1
            report['errors'].append(f"Invalid entity: {entity.get('id', 'unknown')}")
    
    return report
```

## Future Considerations

### Extensibility
- Plugin architecture for new entity types
- Configurable extraction rules
- Support for multiple source formats

### Automation
- Continuous integration testing
- Automatic validation on source updates
- Performance regression testing

### Documentation
- Auto-generated API documentation
- Interactive data exploration tools
- Visual data relationship diagrams

The extractor architecture provides a robust foundation for maintaining authentic Zork data while supporting modern development practices and future enhancements.