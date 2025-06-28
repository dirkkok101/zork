#!/usr/bin/env python3
"""
Scene Exit Verifier
Verifies that all exit destinations in scene files point to valid scene IDs
"""

import json
from pathlib import Path
from typing import Dict, List, Set, Any

class SceneVerifier:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.scenes_dir = self.data_dir / "scenes"
        self.valid_scene_ids = set()
        self.broken_exits = []
        self.inconsistent_conversions = []
        
    def load_all_scenes(self) -> Dict[str, Any]:
        """Load all scene files and extract their IDs"""
        scenes = {}
        
        for scene_file in self.scenes_dir.glob("*.json"):
            if scene_file.name == "index.json":
                continue
                
            try:
                with open(scene_file, 'r') as f:
                    scene_data = json.load(f)
                    scene_id = scene_data.get('id')
                    if scene_id:
                        self.valid_scene_ids.add(scene_id)
                        scenes[scene_id] = scene_data
                    else:
                        print(f"Warning: Scene file {scene_file.name} has no 'id' field")
            except Exception as e:
                print(f"Error loading {scene_file.name}: {e}")
                
        return scenes
    
    def extract_exit_destination(self, exit_data: Any) -> str:
        """Extract destination ID from exit data, handling different formats"""
        if isinstance(exit_data, str):
            return exit_data
        elif isinstance(exit_data, dict):
            return exit_data.get('to')
        return None
    
    def verify_exits(self, scenes: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Verify all exits point to valid scene IDs"""
        broken_exits = []
        
        for scene_id, scene_data in scenes.items():
            exits = scene_data.get('exits', {})
            
            for direction, exit_data in exits.items():
                # Check for corrupted direction names (non-standard characters)
                if any(char in direction for char in ['!', '#', '@', '%', '&', '*']):
                    broken_exits.append({
                        'scene_id': scene_id,
                        'scene_file': f"{scene_id}.json",
                        'direction': direction,
                        'destination': exit_data,
                        'exit_data': exit_data,
                        'issue': 'Corrupted direction name with special characters'
                    })
                    continue
                
                destination = self.extract_exit_destination(exit_data)
                
                # Skip blocked exits (to: null) and conditional exits that might be valid
                if destination is None:
                    continue
                
                # Check for corrupted destination names
                if any(char in str(destination) for char in ['!', '#', '@', '%', '&', '*']) and destination != '!':
                    broken_exits.append({
                        'scene_id': scene_id,
                        'scene_file': f"{scene_id}.json",
                        'direction': direction,
                        'destination': destination,
                        'exit_data': exit_data,
                        'issue': 'Corrupted destination name with special characters'
                    })
                    continue
                    
                if destination not in self.valid_scene_ids:
                    broken_exits.append({
                        'scene_id': scene_id,
                        'scene_file': f"{scene_id}.json",
                        'direction': direction,
                        'destination': destination,
                        'exit_data': exit_data,
                        'issue': 'Destination scene does not exist'
                    })
        
        return broken_exits
    
    def check_conversion_consistency(self) -> List[Dict[str, Any]]:
        """Check for inconsistent ID conversions by comparing with actual source data"""
        extractor_file = Path(__file__).parent / "scene_extractor.py"
        source_file = Path(__file__).parent.parent / "zork_source.json"
        inconsistencies = []
        
        if not extractor_file.exists() or not source_file.exists():
            return inconsistencies
            
        try:
            # Load source data to get actual room keys
            with open(source_file, 'r') as f:
                source_data = json.load(f)
            actual_keys = set(room['key'] for room in source_data['rooms'])
            
            # Extract room_id_conversions from extractor
            with open(extractor_file, 'r') as f:
                extractor_content = f.read()
                
            import re
            conversion_pattern = r"'([^']+)':\s*'([^']+)'"
            conversions = dict(re.findall(conversion_pattern, extractor_content))
            
            # Check only conversions for keys that actually exist in source
            for original_key, converted_id in conversions.items():
                # Skip direction mappings and other non-room conversions
                if original_key in ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 
                                   'ENTER', 'EXIT', 'NORTHEAST', 'NORTHWEST', 
                                   'SOUTHEAST', 'SOUTHWEST', 'type', 'locked']:
                    continue
                    
                if original_key in actual_keys:
                    scene_file = self.scenes_dir / f"{converted_id}.json"
                    if not scene_file.exists():
                        inconsistencies.append({
                            'original_key': original_key,
                            'converted_id': converted_id,
                            'expected_file': f"{converted_id}.json",
                            'issue': 'Converted ID file does not exist'
                        })
                    elif converted_id not in self.valid_scene_ids:
                        inconsistencies.append({
                            'original_key': original_key,
                            'converted_id': converted_id,
                            'expected_file': f"{converted_id}.json",
                            'issue': 'Scene file exists but ID mismatch'
                        })
                else:
                    # Key in conversion table doesn't exist in source - outdated mapping
                    inconsistencies.append({
                        'original_key': original_key,
                        'converted_id': converted_id,
                        'expected_file': f"{converted_id}.json",
                        'issue': 'Conversion key does not exist in source data - outdated mapping'
                    })
                    
        except Exception as e:
            print(f"Error checking conversion consistency: {e}")
            
        return inconsistencies
    
    def check_source_exit_mapping(self) -> List[Dict[str, Any]]:
        """Check that source exits are properly mapped to destination scene IDs"""
        source_file = Path(__file__).parent.parent / "zork_source.json"
        mapping_issues = []
        
        if not source_file.exists():
            return mapping_issues
            
        try:
            with open(source_file, 'r') as f:
                source_data = json.load(f)
                
            # Build room key to scene ID mapping
            extractor_file = Path(__file__).parent / "scene_extractor.py"
            with open(extractor_file, 'r') as f:
                extractor_content = f.read()
                
            import re
            conversion_pattern = r"'([^']+)':\s*'([^']+)'"
            key_to_id = dict(re.findall(conversion_pattern, extractor_content))
            
            # Add fallback conversions for keys not in explicit mapping
            def convert_key_to_id(key: str) -> str:
                if key.startswith('MAZE') or key.startswith('MAZ'):
                    num = key.replace('MAZE', '').replace('MAZ', '')
                    return f'maze_{num}'
                elif key.startswith('DEAD'):
                    num = key.replace('DEAD', '')
                    return f'dead_end_{num}'
                return key_to_id.get(key, key.lower().replace(' ', '_').replace('-', '_'))
            
            # Check each exit in source data
            for exit_data in source_data.get('exits', []):
                source_key = exit_data['source']
                target_key = exit_data['target']
                direction = exit_data['dir']
                
                if target_key == 'NoExit':
                    continue
                    
                source_id = convert_key_to_id(source_key)
                target_id = convert_key_to_id(target_key)
                
                # Check if both source and target exist
                if source_id not in self.valid_scene_ids:
                    mapping_issues.append({
                        'source_key': source_key,
                        'source_id': source_id,
                        'target_key': target_key,
                        'target_id': target_id,
                        'direction': direction,
                        'issue': f'Source scene {source_id} does not exist'
                    })
                elif target_id not in self.valid_scene_ids:
                    mapping_issues.append({
                        'source_key': source_key,
                        'source_id': source_id,
                        'target_key': target_key,
                        'target_id': target_id,
                        'direction': direction,
                        'issue': f'Target scene {target_id} does not exist'
                    })
                    
        except Exception as e:
            print(f"Error checking source exit mapping: {e}")
            
        return mapping_issues
    
    def run_verification(self) -> Dict[str, Any]:
        """Run complete verification and return results"""
        print("Loading scene files...")
        scenes = self.load_all_scenes()
        print(f"Loaded {len(scenes)} scenes")
        print(f"Valid scene IDs: {len(self.valid_scene_ids)}")
        
        print("\nVerifying exit destinations...")
        broken_exits = self.verify_exits(scenes)
        
        print("\nChecking conversion consistency...")
        inconsistent_conversions = self.check_conversion_consistency()
        
        print("\nChecking source exit mapping...")
        mapping_issues = self.check_source_exit_mapping()
        
        results = {
            'total_scenes': len(scenes),
            'total_scene_ids': len(self.valid_scene_ids),
            'broken_exits': broken_exits,
            'inconsistent_conversions': inconsistent_conversions,
            'mapping_issues': mapping_issues
        }
        
        return results
    
    def print_results(self, results: Dict[str, Any]):
        """Print verification results in a readable format"""
        print("\n" + "="*60)
        print("SCENE EXIT VERIFICATION RESULTS")
        print("="*60)
        
        print(f"\nTotal scenes processed: {results['total_scenes']}")
        print(f"Total valid scene IDs: {results['total_scene_ids']}")
        
        # Broken exits
        broken_exits = results['broken_exits']
        print(f"\n🔴 BROKEN EXITS: {len(broken_exits)}")
        if broken_exits:
            print("-" * 40)
            for exit in broken_exits:
                print(f"Scene: {exit['scene_id']} ({exit['scene_file']})")
                print(f"  Direction: {exit['direction']}")
                print(f"  Destination: {exit['destination']}")
                print(f"  Issue: {exit.get('issue', 'Destination scene does not exist')}")
                print(f"  Exit data: {exit['exit_data']}")
                print()
        else:
            print("✅ All exit destinations point to valid scenes!")
            
        # Inconsistent conversions
        inconsistencies = results['inconsistent_conversions']
        print(f"\n🟡 CONVERSION INCONSISTENCIES: {len(inconsistencies)}")
        if inconsistencies:
            print("-" * 40)
            for inconsistency in inconsistencies:
                print(f"Original key: {inconsistency['original_key']}")
                print(f"  Converted ID: {inconsistency['converted_id']}")
                print(f"  Expected file: {inconsistency['expected_file']}")
                print(f"  Issue: {inconsistency['issue']}")
                print()
        else:
            print("✅ All ID conversions are consistent!")
            
        # Mapping issues
        mapping_issues = results['mapping_issues']
        print(f"\n🟠 SOURCE MAPPING ISSUES: {len(mapping_issues)}")
        if mapping_issues:
            print("-" * 40)
            for issue in mapping_issues:
                print(f"Source: {issue['source_key']} -> {issue['source_id']}")
                print(f"  Target: {issue['target_key']} -> {issue['target_id']}")
                print(f"  Direction: {issue['direction']}")
                print(f"  Issue: {issue['issue']}")
                print()
        else:
            print("✅ All source exits are properly mapped!")
            
        # Summary
        total_issues = len(broken_exits) + len(inconsistencies) + len(mapping_issues)
        print(f"\n📊 SUMMARY: {total_issues} issues found")
        if total_issues == 0:
            print("🎉 All scene exits are valid and consistent!")
        else:
            print(f"⚠️  Found {total_issues} issues that need attention")

def main():
    verifier = SceneVerifier()
    results = verifier.run_verification()
    verifier.print_results(results)

if __name__ == "__main__":
    main()