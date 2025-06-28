#!/usr/bin/env python3
"""
Monster Data Verification Script
Validates that monster extraction produced correct results
"""

import json
from pathlib import Path
from typing import Dict, List, Any

class MonsterVerifier:
    def __init__(self):
        self.data_dir = Path("../../data/monsters")
        self.errors = []
        self.warnings = []
        
    def verify_all(self):
        """Run all verification checks"""
        print("Monster Data Verification")
        print("=" * 50)
        
        # Check directory structure
        self.verify_directory_structure()
        
        # Check index file
        self.verify_index()
        
        # Check individual monsters
        self.verify_monsters()
        
        # Report results
        self.report_results()
        
    def verify_directory_structure(self):
        """Verify flat directory structure"""
        print("\n1. Checking directory structure...")
        
        if not self.data_dir.exists():
            self.errors.append(f"Data directory {self.data_dir} does not exist")
            return
            
        # Check for flat structure (no subdirectories)
        subdirs = [d for d in self.data_dir.iterdir() if d.is_dir()]
        if subdirs:
            self.warnings.append(f"Found subdirectories (should be flat): {subdirs}")
        
        # Count JSON files
        json_files = list(self.data_dir.glob("*.json"))
        expected_files = 10  # 9 monsters + 1 index
        if len(json_files) != expected_files:
            self.errors.append(f"Expected {expected_files} JSON files, found {len(json_files)}")
        else:
            print(f"  ✓ Found {len(json_files)} JSON files (correct)")
            
    def verify_index(self):
        """Verify index.json structure and content"""
        print("\n2. Checking index.json...")
        
        index_path = self.data_dir / "index.json"
        if not index_path.exists():
            self.errors.append("index.json not found")
            return
            
        try:
            with open(index_path, 'r') as f:
                index_data = json.load(f)
                
            # Check required fields
            required_fields = ['monsters', 'total', 'types']
            for field in required_fields:
                if field not in index_data:
                    self.errors.append(f"index.json missing required field: {field}")
                    
            # Check monster count
            if index_data.get('total') != 9:
                self.errors.append(f"Expected 9 monsters, index shows {index_data.get('total')}")
            else:
                print("  ✓ Total count: 9 monsters")
                
            # Check monster list
            expected_monsters = [
                'thief', 'troll', 'cyclops', 'grue', 'ghost',
                'volcano_gnome', 'gnome_of_zurich', 'guardian_of_zork', 'vampire_bat'
            ]
            actual_monsters = index_data.get('monsters', [])
            missing = set(expected_monsters) - set(actual_monsters)
            extra = set(actual_monsters) - set(expected_monsters)
            
            if missing:
                self.errors.append(f"Missing monsters: {missing}")
            if extra:
                self.warnings.append(f"Unexpected monsters: {extra}")
                
            # Check type categorization
            types = index_data.get('types', {})
            expected_types = {
                'humanoid': 5,  # thief, troll, cyclops, gnome_of_zurich, guardian_of_zork
                'creature': 2,  # ghost, volcano_gnome
                'environmental': 2  # grue, vampire_bat
            }
            
            for monster_type, expected_count in expected_types.items():
                actual_count = len(types.get(monster_type, []))
                if actual_count != expected_count:
                    self.errors.append(f"Type {monster_type}: expected {expected_count}, got {actual_count}")
                else:
                    print(f"  ✓ {monster_type}: {actual_count} monsters")
                    
        except Exception as e:
            self.errors.append(f"Error reading index.json: {e}")
            
    def verify_monsters(self):
        """Verify individual monster files"""
        print("\n3. Checking individual monster files...")
        
        expected_monsters = {
            'thief': {'combatStrength': 5, 'has_melee': True, 'type': 'humanoid'},
            'troll': {'combatStrength': 2, 'has_melee': True, 'type': 'humanoid'},
            'cyclops': {'combatStrength': 10000, 'has_melee': True, 'type': 'humanoid'},
            'grue': {'combatStrength': None, 'has_melee': False, 'type': 'environmental'},
            'ghost': {'combatStrength': None, 'has_melee': False, 'type': 'creature'},
            'volcano_gnome': {'combatStrength': None, 'has_melee': False, 'type': 'creature'},
            'gnome_of_zurich': {'combatStrength': None, 'has_melee': False, 'type': 'humanoid'},
            'guardian_of_zork': {'combatStrength': 10000, 'has_melee': True, 'type': 'humanoid'},
            'vampire_bat': {'combatStrength': None, 'has_melee': False, 'type': 'environmental'}
        }
        
        for monster_id, expected in expected_monsters.items():
            print(f"\n  Checking {monster_id}...")
            monster_path = self.data_dir / f"{monster_id}.json"
            
            if not monster_path.exists():
                self.errors.append(f"Monster file {monster_id}.json not found")
                continue
                
            try:
                with open(monster_path, 'r') as f:
                    monster_data = json.load(f)
                    
                # Check required fields
                required_fields = ['id', 'name', 'type', 'description', 'examineText', 
                                 'synonyms', 'flags', 'inventory', 'properties']
                for field in required_fields:
                    if field not in monster_data:
                        self.errors.append(f"{monster_id}: missing required field '{field}'")
                        
                # Check ID matches filename
                if monster_data.get('id') != monster_id:
                    self.errors.append(f"{monster_id}: ID mismatch")
                    
                # Check type
                if monster_data.get('type') != expected['type']:
                    self.errors.append(f"{monster_id}: expected type '{expected['type']}', got '{monster_data.get('type')}'")
                    
                # Check combat strength
                combat_strength = monster_data.get('combatStrength')
                if combat_strength != expected['combatStrength']:
                    if expected['combatStrength'] is not None:
                        self.errors.append(f"{monster_id}: expected combatStrength {expected['combatStrength']}, got {combat_strength}")
                        
                # Check melee messages
                has_melee = 'meleeMessages' in monster_data
                if has_melee != expected['has_melee']:
                    self.errors.append(f"{monster_id}: melee messages {'expected' if expected['has_melee'] else 'not expected'}")
                elif has_melee:
                    melee = monster_data['meleeMessages']
                    # Check that combat monsters have actual messages
                    if not any(melee.get(cat, []) for cat in ['miss', 'kill', 'light_wound']):
                        self.warnings.append(f"{monster_id}: has meleeMessages but they appear empty")
                        
                # Monster-specific checks
                if monster_id == 'thief':
                    if not monster_data.get('movementDemon'):
                        self.errors.append("thief: missing movementDemon")
                    if not monster_data.get('behaviorFunction'):
                        self.errors.append("thief: missing behaviorFunction")
                        
                print(f"    ✓ {monster_id} verified")
                        
            except Exception as e:
                self.errors.append(f"Error reading {monster_id}.json: {e}")
                
    def report_results(self):
        """Report verification results"""
        print("\n" + "=" * 50)
        print("VERIFICATION RESULTS")
        print("=" * 50)
        
        if not self.errors and not self.warnings:
            print("\n✅ All checks passed! Monster data is correctly extracted.")
        else:
            if self.errors:
                print(f"\n❌ Found {len(self.errors)} errors:")
                for error in self.errors:
                    print(f"  - {error}")
                    
            if self.warnings:
                print(f"\n⚠️  Found {len(self.warnings)} warnings:")
                for warning in self.warnings:
                    print(f"  - {warning}")
                    
        print("\nSummary:")
        print(f"  - Errors: {len(self.errors)}")
        print(f"  - Warnings: {len(self.warnings)}")
        print(f"  - Status: {'FAILED' if self.errors else 'PASSED'}")

def main():
    verifier = MonsterVerifier()
    verifier.verify_all()

if __name__ == "__main__":
    main()