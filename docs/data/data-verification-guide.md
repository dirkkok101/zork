# Data Verification Guide

## Overview

This guide explains how we ensure the extracted game data maintains 100% fidelity to the original Zork source material. Data verification is critical to our authentic recreation goals and involves both automated scripts and manual validation procedures.

## Verification Philosophy

### Core Principles

1. **Source Material is Gospel**: The original MDL source files (`dung_mud_source.txt`, `b_mud_source.txt`) and reference data (`zork_source.json`) are the authoritative truth
2. **No Data Invention**: We never create game content that doesn't exist in source material
3. **Complete Coverage**: Every game element must be extracted and validated
4. **Type Safety**: All extracted data must validate against TypeScript interfaces
5. **Referential Integrity**: All IDs, references, and relationships must be consistent

### What "100% Fidelity" Means

**In Practice:**
- **Exact Text**: All descriptions, messages, and dialogue match source material verbatim
- **Authentic Values**: Numeric values (scores, weights, combat strength) match original specifications
- **Preserved Logic**: Game mechanics and conditional logic replicate original behavior
- **Complete Coverage**: All 214 items, 196 scenes, and 9 monsters extracted from source

**Acceptable Transformations:**
- **ID Format**: `UPPERCASE` → `snake_case` for filesystem compatibility
- **Structure**: MDL format → JSON format with equivalent semantics
- **Type Conversion**: MDL types → TypeScript enum values
- **Organization**: Single source file → individual JSON files per entity

**Not Acceptable:**
- Adding content not in source material
- Omitting source content without documentation
- Changing game values or mechanics
- Inventing text or descriptions

## Source Material Structure

### Reference Files Location

```
reference/
├── dung_mud_source.txt      # Main MDL source (179 KB)
├── b_mud_source.txt          # Additional MDL logic (26 KB)
└── zork_source.json          # Structured room/exit data (92 KB)
```

### Source File Contents

#### dung_mud_source.txt
**Primary MDL source file containing:**
- Object definitions with properties and flags
- Monster/creature definitions with combat data
- Room descriptions and initial states
- Game mechanics and function definitions

**Format**: MDL (Muddle) programming language syntax
**Size**: ~179 KB, thousands of lines
**Encoding**: UTF-8 text

#### b_mud_source.txt
**Additional game logic including:**
- Advanced puzzle mechanics
- Conditional interactions
- Special event handling
- Endgame sequences

**Format**: MDL (Muddle) programming language syntax
**Size**: ~26 KB
**Encoding**: UTF-8 text

#### zork_source.json
**Structured data from Lantern Project:**
- Room definitions with keys and names
- Exit relationships between rooms
- Direction mappings
- Conditional exit logic

**Format**: JSON
**Size**: ~92 KB
**Source**: https://github.com/bburns/Lantern

### MDL Flag Reference

Understanding MDL flags is critical for verification:

| MDL Flag | Standard Flag | Meaning | Verification Check |
|----------|---------------|---------|-------------------|
| `OVISON` | `VISIBLE` | Object can be seen | All items should have this |
| `TAKEBIT` | `PORTABLE` | Can be picked up | Match with `portable: true` |
| `LIGHTBIT` | `LIGHT_SOURCE` | Provides light | Type should be LIGHT_SOURCE |
| `CONTBIT` | `CONTAINER` | Holds items | Type should be CONTAINER |
| `OPENBIT` | `OPENABLE` | Can be opened/closed | Check open/close interactions |
| `WEAPONBIT` | `WEAPON` | Combat weapon | Type should be WEAPON |
| `TREASUREBIT` | `TREASURE` | Valuable treasure | Has treasurePoints property |
| `READBIT` | `READABLE` | Has readable text | Check properties.readText |
| `VICBIT` | `CHARACTER` | Is a creature | Should be in monsters/ |

## Automated Verification

### Available Verification Scripts

```
reference/extractors/
├── scene_verifier.py         # Scene/exit validation
├── monster_verifier.py       # Monster data validation
└── scene_exit_analysis.py    # Exit relationship analysis
```

### Running Verification Scripts

#### Scene Verification

**Purpose**: Validates scene data, exit integrity, and ID conversions

```bash
# Run from project root
cd reference/extractors
python3 scene_verifier.py
```

**Checks Performed:**
1. **Exit Destination Validation**: All exit destinations point to valid scenes
2. **ID Conversion Consistency**: Source keys properly mapped to scene IDs
3. **Source Exit Mapping**: All source exits correctly extracted
4. **Corrupted Data Detection**: Special characters in IDs or directions
5. **Referential Integrity**: All scene references resolve correctly

**Expected Output:**
```
Loading scene files...
Loaded 196 scenes
Valid scene IDs: 196

Verifying exit destinations...
Checking conversion consistency...
Checking source exit mapping...

============================================================
SCENE EXIT VERIFICATION RESULTS
============================================================

Total scenes processed: 196
Total valid scene IDs: 196

🔴 BROKEN EXITS: 0
✅ All exit destinations point to valid scenes!

🟡 CONVERSION INCONSISTENCIES: 0
✅ All ID conversions are consistent!

🟠 SOURCE MAPPING ISSUES: 0
✅ All source exits are properly mapped!

📊 SUMMARY: 0 issues found
🎉 All scene exits are valid and consistent!
```

**What to Do if Errors Found:**
- **Broken exits**: Check `scene_extractor.py` ID conversion logic
- **Conversion inconsistencies**: Update room_id_conversions dictionary
- **Mapping issues**: Verify zork_source.json has correct exit data

#### Monster Verification

**Purpose**: Validates monster extraction completeness and correctness

```bash
# Run from reference/extractors directory
cd reference/extractors
python3 monster_verifier.py
```

**Checks Performed:**
1. **Directory Structure**: Flat structure with correct file count (10 files)
2. **Index File**: Correct total count (9 monsters) and type categorization
3. **Monster List**: All expected monsters present (thief, troll, cyclops, etc.)
4. **Type Categorization**: Humanoid (5), Creature (2), Environmental (2)
5. **Individual Monsters**: Required fields, combat strength, melee messages
6. **Special Properties**: Movement demons, behavior functions

**Expected Output:**
```
Monster Data Verification
==================================================

1. Checking directory structure...
  ✓ Found 10 JSON files (correct)

2. Checking index.json...
  ✓ Total count: 9 monsters
  ✓ humanoid: 5 monsters
  ✓ creature: 2 monsters
  ✓ environmental: 2 monsters

3. Checking individual monster files...

  Checking thief...
    ✓ thief verified
  Checking troll...
    ✓ troll verified
  [... continues for all 9 monsters ...]

==================================================
VERIFICATION RESULTS
==================================================

✅ All checks passed! Monster data is correctly extracted.

Summary:
  - Errors: 0
  - Warnings: 0
  - Status: PASSED
```

**What to Do if Errors Found:**
- **Missing monsters**: Re-run `monster_extractor.py`
- **Combat strength mismatch**: Check MDL source for correct values
- **Missing melee messages**: Verify PSETG table extraction in extractor
- **Type errors**: Review type classification logic

### Scene Exit Analysis

**Purpose**: Statistical analysis of scene connectivity

```bash
cd reference/extractors
python3 scene_exit_analysis.py
```

**Provides:**
- Exit count per scene
- Most/least connected scenes
- Conditional exit patterns
- Direction usage statistics
- Connectivity graphs

## Manual Verification Procedures

### Item Data Verification

**Frequency**: After running `item_extractor.py` or modifying extraction logic

**Process:**

1. **Count Verification**
   ```bash
   cd data/items
   ls -1 *.json | grep -v index.json | wc -l
   # Expected: 214
   ```

2. **Random Sample Validation**
   - Select 10 random items
   - Open corresponding MDL definitions in `dung_mud_source.txt`
   - Compare descriptions, properties, and flags
   - Verify interactions match capabilities

3. **Special Case Validation**
   ```bash
   # Check special character items exist
   ls -1 data/items/ | grep -E '!!!!!|*bun*'
   # Expected: !!!!!.json, *bun*.json
   ```

4. **Type Distribution Check**
   - Run item data loader tests
   - Verify counts match documented distributions
   - Currently: TOOL (164), CONTAINER (36), FOOD (7), WEAPON (5), LIGHT_SOURCE (2)

5. **Treasure Verification**
   ```bash
   # Check that treasure items have required properties
   grep -l "treasurePoints" data/items/*.json
   # Verify each has value and treasurePoints
   ```

**Validation Checklist:**
- [ ] Total item count: 214
- [ ] Index file lists all items
- [ ] All items have required fields (id, name, type, description, examineText)
- [ ] Special character items (!!!!! and *bun*) present
- [ ] Type distribution matches expected values
- [ ] All portable items have `portable: true`
- [ ] All treasures have treasurePoints property
- [ ] Interaction commands match item capabilities

### Scene Data Verification

**Frequency**: After running `scene_extractor.py` or updating scenes

**Process:**

1. **Count Verification**
   ```bash
   cd data/scenes
   ls -1 *.json | grep -v index.json | wc -l
   # Expected: 196
   ```

2. **Source Comparison**
   - Check `reference/zork_source.json` room count
   - Verify all room keys converted to scene IDs
   - Compare scene names and descriptions

3. **Exit Integrity**
   ```bash
   # Run automated verification
   cd reference/extractors
   python3 scene_verifier.py
   # Expected: 0 issues
   ```

4. **Lighting System**
   - Verify lighting values: daylight, lit, dark, pitch_black
   - Check that outdoor scenes have "daylight"
   - Underground scenes should have "dark" or "pitch_black"

5. **First Visit Points**
   ```bash
   # Count scenes with first visit scoring
   grep -l "firstVisitPoints" data/scenes/*.json | wc -l
   # Verify against scoring_system.json expectations
   ```

**Validation Checklist:**
- [ ] Total scene count: 196
- [ ] All exits point to valid scenes (0 broken exits)
- [ ] Lighting values are valid enums
- [ ] Scene descriptions match source material
- [ ] Initial items placed in correct scenes
- [ ] Conditional exits have proper condition syntax

### Monster Data Verification

**Frequency**: After running `monster_extractor.py`

**Process:**

1. **Automated Verification**
   ```bash
   cd reference/extractors
   python3 monster_verifier.py
   # Expected: PASSED status
   ```

2. **Combat Monster Validation**
   For thief, troll, cyclops, guardian_of_zork:
   - Verify combatStrength values from MDL
   - Check meleeMessages extracted from PSETG tables
   - Validate weapon/treasure inventory

3. **Non-Combat Monster Validation**
   For grue, ghost, volcano_gnome, gnome_of_zurich, vampire_bat:
   - Verify no incorrect combatStrength
   - Check special behaviors documented
   - Validate interaction patterns

4. **Thief Special Validation**
   - Has movementDemon: true
   - Has behaviorFunction defined
   - Has treasure stealing logic
   - Melee messages complete

**Validation Checklist:**
- [ ] Total monster count: 9
- [ ] All required fields present
- [ ] Combat strengths match MDL source
- [ ] Melee messages extracted for combat monsters
- [ ] Non-combat monsters have no melee messages
- [ ] Thief has special properties
- [ ] Type categorization correct

### Mechanics Data Verification

**Frequency**: After running `mechanics_extractor.py` or game balancing

**Process:**

1. **Scoring System**
   ```json
   // data/mechanics/scoring_system.json
   {
     "maxScore": 350,  // Verify matches original Zork
     "treasures": {
       // Verify each treasure value
     },
     "events": {
       // Verify event point values
     }
   }
   ```

2. **Death Mechanics**
   - Check resurrection logic matches original
   - Verify item loss on death
   - Validate respawn location

3. **Flag System**
   - Verify all puzzle flags documented
   - Check flag dependencies correct
   - Validate initial flag states

**Validation Checklist:**
- [ ] Max score is 350 (authentic Zork value)
- [ ] Treasure values sum correctly
- [ ] Event bonuses match source
- [ ] Death mechanics preserve original behavior
- [ ] All flags documented with purpose

## Data Quality Metrics

### Acceptance Criteria

**Must Pass (Blocking):**
- 100% of expected entities extracted
- 0 broken references (exits, item IDs, monster IDs)
- 0 TypeScript validation errors
- 0 missing required fields
- All verification scripts pass

**Should Pass (Warning):**
- 0 duplicate aliases/tags
- 0 empty arrays that should be omitted
- 0 inconsistent type categorizations
- All interactions match item capabilities

**Nice to Have (Optional):**
- Descriptive text matches source formatting
- Consistent ID naming conventions
- Optimal file sizes

### Quality Thresholds

| Category | Metric | Threshold | Status |
|----------|--------|-----------|--------|
| **Items** | Total count | 214 | ✅ |
| **Items** | Required fields | 100% | ✅ |
| **Items** | Type validation | 100% | ✅ |
| **Items** | Duplicate tags | < 50% | ⚠️ 100+ items |
| **Scenes** | Total count | 196 | ✅ |
| **Scenes** | Broken exits | 0 | ✅ |
| **Scenes** | Valid lighting | 100% | ✅ |
| **Monsters** | Total count | 9 | ✅ |
| **Monsters** | Combat data | 100% | ✅ |
| **Monsters** | Required fields | 100% | ✅ |

### Known Data Quality Issues

**Items (Non-Critical):**
- **Duplicate Tags**: 100+ items have duplicate entries in tags arrays
  - Impact: Minimal, handled by Set deduplication in code
  - Fix: Run data cleanup script (when implemented)

- **Duplicate Aliases**: 9 items have duplicate aliases
  - Affected: pot, brace, bar, chali, dboat, torch, bat, iboat, coin
  - Impact: Minimal, aliases still functional
  - Fix: Manual cleanup or extractor improvement

- **Empty Arrays**: Many items have empty tags/aliases arrays
  - Impact: None, handled gracefully
  - Recommendation: Omit empty arrays in future extractions

**Monsters (Non-Critical):**
- None currently identified

**Scenes (Non-Critical):**
- None currently identified

## Continuous Verification

### When to Run Verification

**Always Run:**
- After any extractor script execution
- Before committing data file changes
- After updating source files
- When debugging game behavior issues

**Recommended Schedule:**
- Daily during active data extraction work
- Weekly during development sprints
- Before each release/deployment
- After any source file updates

### CI/CD Integration (Future)

**Planned Automation:**
```yaml
# .github/workflows/data-verification.yml
name: Data Verification
on: [push, pull_request]
jobs:
  verify-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Verify Scenes
        run: python3 reference/extractors/scene_verifier.py
      - name: Verify Monsters
        run: python3 reference/extractors/monster_verifier.py
      - name: Run Data Loader Tests
        run: npm test -- data_loaders
```

**Success Criteria:**
- All verification scripts exit with code 0
- All data loader tests pass
- No TypeScript compilation errors

## Troubleshooting Verification Issues

### Common Issues and Solutions

#### Issue: Missing Entities

**Symptoms:**
- Item count < 214
- Scene count < 196
- Monster count < 9

**Diagnosis:**
```bash
# Check what's missing
cd reference/extractors
python3 scene_verifier.py | grep "missing"
python3 monster_verifier.py | grep "Missing"
```

**Solutions:**
1. Re-run appropriate extractor script
2. Check source files for entities
3. Verify extractor parsing logic
4. Check for file system issues (permissions, disk space)

#### Issue: Broken References

**Symptoms:**
- Scene exits pointing to non-existent scenes
- Items referencing invalid scene IDs
- Monster inventory with invalid item IDs

**Diagnosis:**
```bash
cd reference/extractors
python3 scene_verifier.py | grep "BROKEN"
```

**Solutions:**
1. Check ID conversion logic in extractors
2. Verify source data has correct references
3. Update room_id_conversions dictionary
4. Re-run extractor with fixes

#### Issue: TypeScript Validation Errors

**Symptoms:**
- Data loader tests fail
- Compilation errors in test files
- Enum validation failures

**Diagnosis:**
```bash
npm run typecheck
npm test -- data_loaders
```

**Solutions:**
1. Check enum values match TypeScript definitions
2. Verify required fields present in all entities
3. Fix type mismatches (string vs number)
4. Update TypeScript interfaces if needed

#### Issue: Duplicate Data

**Symptoms:**
- Multiple entities with same ID
- Duplicate entries in index files
- Overwritten entity files

**Diagnosis:**
```bash
# Check for duplicate IDs
cd data/items
jq -r '.id' *.json | sort | uniq -d
```

**Solutions:**
1. Review extractor ID generation logic
2. Check for source data duplicates
3. Verify file naming conventions
4. Re-run extractor with unique ID logic

#### Issue: Incorrect Values

**Symptoms:**
- Combat strength doesn't match gameplay
- Treasure points don't sum to 350
- Descriptions don't match original game

**Diagnosis:**
1. Compare extracted data to MDL source manually
2. Cross-reference with original Zork gameplay
3. Check parsing logic for value extraction

**Solutions:**
1. Fix extractor property parsing
2. Update hardcoded values in mechanics_extractor.py
3. Verify source file hasn't been corrupted
4. Re-run extractor after fixes

### Verification Debug Mode

**Enable Detailed Logging:**
```python
# In verifier scripts, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Verbose Output:**
```bash
# Run verifiers with verbose flag (if supported)
python3 scene_verifier.py --verbose
python3 monster_verifier.py --debug
```

## Best Practices

### For Extractor Development

1. **Test Early, Test Often**
   - Run verification after every extractor change
   - Don't commit unverified data
   - Keep verification scripts up to date

2. **Document Assumptions**
   - Comment any hardcoded values
   - Explain ID conversion logic
   - Note any source data ambiguities

3. **Preserve Source Truth**
   - Never modify source files
   - Keep backups of reference data
   - Document data provenance

4. **Incremental Verification**
   - Verify small batches during development
   - Don't wait until all data extracted
   - Fix issues immediately

### For Data Consumers

1. **Trust But Verify**
   - Use verified data for development
   - Run verification before debugging
   - Report data issues promptly

2. **Handle Data Quality Issues**
   - Deduplicate tags/aliases in code
   - Handle empty arrays gracefully
   - Don't rely on unverified assumptions

3. **Report Issues**
   - File issues for data quality problems
   - Include verification output
   - Suggest fixes when possible

## Manual Source Comparison

### How to Manually Verify an Item

1. **Locate in Source**
   ```bash
   # Search for item in MDL source
   grep -n "OBJECT.*LAMP" reference/dung_mud_source.txt
   ```

2. **Extract MDL Definition**
   - Find `<OBJECT [name] ...` block
   - Copy all properties and flags
   - Note any special functions (e.g., OACTION, OFUNC)

3. **Compare to JSON**
   ```bash
   cat data/items/lamp.json
   ```

4. **Verify Mapping**
   - Check name matches
   - Verify description text identical
   - Confirm all flags converted correctly
   - Validate property values (OSIZE → weight, etc.)
   - Check interactions match capabilities

### How to Manually Verify a Scene

1. **Locate in Source**
   ```bash
   grep -n "WEST-HOUSE" reference/zork_source.json
   ```

2. **Compare Attributes**
   - Room name and description
   - Exit directions and destinations
   - Initial items in room
   - Lighting conditions

3. **Verify Exits**
   ```bash
   # Check scene file
   jq '.exits' data/scenes/west_of_house.json
   # Compare to source exits
   ```

## Summary

Data verification is an ongoing process that ensures our Zork recreation remains authentic to the original source material. By combining automated verification scripts with manual validation procedures, we maintain the highest standards of data quality and fidelity.

**Key Takeaways:**
- Source material is authoritative truth
- Automated verification catches most issues
- Manual validation required for authenticity
- Continuous verification prevents data drift
- Document all data quality issues
- Fix issues immediately when found

**Next Steps:**
1. Run all verification scripts
2. Review and address any issues
3. Document any deviations from source
4. Set up CI/CD verification (future)
5. Establish regular verification schedule
