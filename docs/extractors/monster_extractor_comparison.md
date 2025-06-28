# Monster Extractor Comparison

## Old Extractor vs New Extractor

### Structure Changes

| Aspect | Old Extractor | New Extractor |
|--------|---------------|---------------|
| **Directory Structure** | Categorized (`humanoids/`, `creatures/`, `mechanisms/`) | Flat structure (all files at root level) |
| **Number of Monsters** | 4 (thief, troll, cyclops, grue) | 9 (added ghost, volcano_gnome, gnome_of_zurich, guardian_of_zork, vampire_bat) |
| **Data Source** | Hardcoded/invented values | Extracted from MDL source reference |
| **File Organization** | Nested by type | Flat with type in data |

### Data Accuracy

| Property | Old Extractor | New Extractor |
|----------|---------------|---------------|
| **Health Values** | Arbitrary (20, 30, 40, 50) | Not included (will be derived from game logic) |
| **Combat Strength** | Not included | Real OSTRENGTH values (5, 2, 10000) |
| **Synonyms** | Basic list | Complete MDL object names and adjectives |
| **Flags** | Not included | All MDL flags (OVISON, VICBIT, VILLAIN) |
| **Movement Pattern** | Complex object with data | Simple demon name reference |
| **Behaviors** | Hardcoded behavior arrays | Function name reference |

### Example: Thief Comparison

**Old Extractor:**
```json
{
  "id": "thief",
  "name": "nasty knife-wielding thief",
  "health": 20,
  "maxHealth": 20,
  "state": "WANDERING",
  "aggressionLevel": 3,
  "intelligence": 8,
  "specialAbilities": ["steal", "vanish"],
  "behaviors": [
    {
      "type": "move",
      "chance": 0.5,
      "effect": "moveToAdjacentScene"
    }
    // ... more hardcoded behaviors
  ]
}
```

**New Extractor:**
```json
{
  "id": "thief",
  "name": "thief",
  "synonyms": ["thief", "robbe", "crook", "crimi", "bandi", "gent", "gentl", "man", "indiv", "shady", "suspi"],
  "flags": {
    "OVISON": true,
    "VICBIT": true,
    "VILLAIN": true
  },
  "combatStrength": 5,
  "behaviorFunction": "ROBBER-FUNCTION",
  "movementDemon": "ROBBER-DEMON",
  "properties": {
    "isVillain": true,
    "canSteal": true,
    "hasLoot": true
  }
}
```

### Key Improvements

1. **Source Fidelity**: All data comes from MDL source files
2. **Complete Monster Set**: All 9 monsters from Zork
3. **Accurate Properties**: Real combat values, flags, and functions
4. **Simplified Structure**: Flat files are easier to load
5. **Proper References**: Function and demon names for game logic
6. **Flexible Type System**: Based on actual MDL flags

### MonsterData.ts Updates

**Old Fields Removed:**
- `aggressionLevel: number`
- `intelligence: number`
- `specialAbilities: string[]`
- `weaknesses: string[]`
- `behaviors: MonsterBehavior[]`
- `dialogue: MonsterDialogue[]`
- `onDefeat: MonsterDefeat`

**New Fields Added:**
- `synonyms: string[]`
- `flags: Record<string, boolean>`
- `combatStrength?: number`
- `meleeMessages?: MeleeMessages`
- `behaviorFunction?: string`
- `movementDemon?: string`

### Benefits

1. **Authenticity**: Data matches original Zork exactly
2. **Maintainability**: Single source of truth from MDL
3. **Flexibility**: Services can interpret functions/demons
4. **Completeness**: All monsters included
5. **Simplicity**: Flat structure, no artificial categorization

The new extractor provides a solid foundation for implementing authentic Zork monster behaviors based on the original game data.