# Monster Extraction Improvement Plan

## Current Issues

### 1. Missing Monsters
Current extractor only has 4 monsters (thief, troll, cyclops, grue), but reference data shows:
- Ghost/Spirits/Fiends
- Volcano Gnome
- Gnome of Zurich
- Guardian of Zork
- Vampire Bat

### 2. Missing Properties from Source
- OSTRENGTH values (combat strength)
- Exact object names and synonyms
- Flags (VILLAIN, VICBIT, OVISON, etc.)
- Combat message tables (OFMSGS)
- Associated functions

### 3. Incomplete Data Structure
- No flat file structure (uses categories subdirectories)
- Missing properties from MonsterData type
- Combat stats not properly extracted
- Movement demons not captured

### 4. Data Accuracy Issues
- Health/maxHealth values are arbitrary (not from source)
- aggressionLevel/intelligence are made up
- Movement patterns don't match source demons
- Missing actual defeat scores

## Proposed Changes

### 1. Flatten Directory Structure
Instead of:
```
monsters/
  humanoids/
    thief.json
  creatures/
    troll.json
```

Use flat structure:
```
monsters/
  thief.json
  troll.json
  cyclops.json
  grue.json
  ghost.json
  volcano_gnome.json
  gnome_of_zurich.json
  guardian_of_zork.json
  vampire_bat.json
```

### 2. Extract Real Properties
From MDL source:
- `OSTRENGTH` → `combatStrength`
- `OFMSGS` → `meleeMessages`
- Object names → `name` and `synonyms`
- Flags → `flags` object
- Functions → `behaviorFunction`

### 3. Add Missing Monsters
Complete list with proper data:
1. Thief (OSTRENGTH: 5)
2. Troll (OSTRENGTH: 2)
3. Cyclops (OSTRENGTH: 10000)
4. Grue (environmental hazard)
5. Ghost/Spirits
6. Volcano Gnome
7. Gnome of Zurich
8. Guardian of Zork (OSTRENGTH: 10000)
9. Vampire Bat

### 4. Proper Movement Patterns
Map demon functions to movement patterns:
- `ROBBER-DEMON` → Thief movement logic
- Stationary monsters → guardedScenes
- Special behaviors → behaviorFunction

### 5. Combat Messages
Extract full melee tables:
- Miss messages
- Unconscious messages
- Kill messages
- Light wound messages
- Severe wound messages
- Stagger messages
- Disarm messages

### 6. Update MonsterData Type
Add missing fields:
- `meleeMessages`: Combat message table
- `combatStrength`: OSTRENGTH value
- `synonyms`: All object name variants
- `flags`: Object flags
- `behaviorFunction`: Associated function name
- `demon`: Movement demon name

## Implementation Steps

1. Update monster_extractor.py to parse MDL source
2. Extract real values from reference files
3. Flatten output directory structure
4. Add all 9 monsters with accurate data
5. Update MonsterData.ts interface
6. Create MonsterDataLoader following ItemDataLoader pattern
7. Update MonsterTypes.ts to align with extracted data