#!/usr/bin/env python3
"""
Scene Exit Analysis Report
Comprehensive analysis of scene exit issues and recommended fixes
"""

import json
from pathlib import Path
from typing import Dict, List, Set, Any

class SceneExitAnalyzer:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.scenes_dir = self.data_dir / "scenes"
        self.source_file = Path(__file__).parent.parent / "zork_source.json"
        self.extractor_file = Path(__file__).parent / "scene_extractor.py"
        
    def analyze_all_issues(self) -> Dict[str, Any]:
        """Comprehensive analysis of all scene exit issues"""
        print("🔍 Analyzing scene exit issues...")
        
        # Load data
        scenes = self.load_scenes()
        source_data = self.load_source_data()
        
        # Analyze different types of issues
        corrupted_exits = self.find_corrupted_exits(scenes, source_data)
        missing_conversions = self.find_missing_conversions(source_data)
        outdated_conversions = self.find_outdated_conversions(source_data)
        
        return {
            'corrupted_exits': corrupted_exits,
            'missing_conversions': missing_conversions,
            'outdated_conversions': outdated_conversions,
            'total_scenes': len(scenes),
            'total_source_rooms': len(source_data.get('rooms', [])),
            'total_source_exits': len(source_data.get('exits', []))
        }
    
    def load_scenes(self) -> Dict[str, Any]:
        """Load all scene files"""
        scenes = {}
        for scene_file in self.scenes_dir.glob("*.json"):
            if scene_file.name == "index.json":
                continue
            try:
                with open(scene_file, 'r') as f:
                    scene_data = json.load(f)
                    scenes[scene_data['id']] = scene_data
            except Exception as e:
                print(f"Error loading {scene_file.name}: {e}")
        return scenes
    
    def load_source_data(self) -> Dict[str, Any]:
        """Load source JSON data"""
        try:
            with open(self.source_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading source data: {e}")
            return {}
    
    def find_corrupted_exits(self, scenes: Dict[str, Any], source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find exits with corrupted data in source"""
        corrupted = []
        
        # Check source exits for corruption
        for exit_data in source_data.get('exits', []):
            source_key = exit_data.get('source', '')
            target_key = exit_data.get('target', '')
            direction = exit_data.get('dir', '')
            
            # Check for special characters indicating corruption
            if any(char in direction for char in ['!', '#', '@', '%', '&', '*']):
                corrupted.append({
                    'source_key': source_key,
                    'target_key': target_key,
                    'direction': direction,
                    'issue': 'Corrupted direction in source data',
                    'source_exit': exit_data
                })
            elif any(char in target_key for char in ['!', '#', '@', '%', '&', '*']):
                corrupted.append({
                    'source_key': source_key,
                    'target_key': target_key,
                    'direction': direction,
                    'issue': 'Corrupted target in source data',
                    'source_exit': exit_data
                })
        
        return corrupted
    
    def find_missing_conversions(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find source room keys that need conversions but don't have them"""
        missing = []
        
        # Get all room keys from source
        source_keys = set(room['key'] for room in source_data.get('rooms', []))
        
        # Get current conversions from extractor
        conversions = self.get_current_conversions()
        
        # Find keys that need conversions (not simple snake_case)
        for key in source_keys:
            if key not in conversions:
                # Check if this key would create a simple conversion
                simple_conversion = key.lower().replace(' ', '_').replace('-', '_')
                scene_file = self.scenes_dir / f"{simple_conversion}.json"
                
                if not scene_file.exists():
                    missing.append({
                        'source_key': key,
                        'expected_conversion': simple_conversion,
                        'issue': 'No conversion mapping and scene file does not exist'
                    })
        
        return missing
    
    def find_outdated_conversions(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find conversions in extractor that don't match source data"""
        outdated = []
        
        # Get all room keys from source
        source_keys = set(room['key'] for room in source_data.get('rooms', []))
        
        # Get current conversions from extractor
        conversions = self.get_current_conversions()
        
        # Find conversions for keys that don't exist in source
        for key, conversion in conversions.items():
            # Skip direction mappings and other non-room keys
            if key in ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 
                      'ENTER', 'EXIT', 'NORTHEAST', 'NORTHWEST', 
                      'SOUTHEAST', 'SOUTHWEST', 'type', 'locked']:
                continue
                
            if key not in source_keys:
                outdated.append({
                    'conversion_key': key,
                    'converted_id': conversion,
                    'issue': 'Conversion exists but source key not found'
                })
        
        return outdated
    
    def get_current_conversions(self) -> Dict[str, str]:
        """Extract current conversions from scene extractor"""
        conversions = {}
        
        try:
            with open(self.extractor_file, 'r') as f:
                content = f.read()
                
            import re
            # Extract room_id_conversions dictionary
            conversion_pattern = r"'([^']+)':\s*'([^']+)'"
            conversions = dict(re.findall(conversion_pattern, content))
            
        except Exception as e:
            print(f"Error reading conversions: {e}")
            
        return conversions
    
    def generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate specific recommendations for fixing issues"""
        recommendations = []
        
        # Corrupted exits
        if analysis['corrupted_exits']:
            recommendations.append("🔧 CORRUPTED EXITS:")
            recommendations.append("  1. Review the source data for corrupted exit entries")
            recommendations.append("  2. Remove or fix exits with special characters (#, !, etc.)")
            recommendations.append("  3. Re-run the scene extractor after fixing source data")
            recommendations.append("")
        
        # Missing conversions
        if analysis['missing_conversions']:
            recommendations.append("🔧 MISSING CONVERSIONS:")
            recommendations.append("  1. Add conversion mappings for the following keys:")
            for missing in analysis['missing_conversions'][:5]:  # Show first 5
                recommendations.append(f"     '{missing['source_key']}': '{missing['expected_conversion']}'")
            if len(analysis['missing_conversions']) > 5:
                recommendations.append(f"     ... and {len(analysis['missing_conversions']) - 5} more")
            recommendations.append("  2. Update scene_extractor.py room_id_conversions dictionary")
            recommendations.append("")
        
        # Outdated conversions
        if analysis['outdated_conversions']:
            recommendations.append("🔧 OUTDATED CONVERSIONS:")
            recommendations.append("  1. Remove the following outdated conversion mappings:")
            for outdated in analysis['outdated_conversions'][:5]:  # Show first 5
                recommendations.append(f"     '{outdated['conversion_key']}': '{outdated['converted_id']}'")
            if len(analysis['outdated_conversions']) > 5:
                recommendations.append(f"     ... and {len(analysis['outdated_conversions']) - 5} more")
            recommendations.append("  2. Update scene_extractor.py room_id_conversions dictionary")
            recommendations.append("")
        
        return recommendations
    
    def print_analysis_report(self, analysis: Dict[str, Any]):
        """Print comprehensive analysis report"""
        print("\n" + "="*70)
        print("SCENE EXIT ANALYSIS REPORT")
        print("="*70)
        
        print(f"\n📊 OVERVIEW:")
        print(f"  Total scenes generated: {analysis['total_scenes']}")
        print(f"  Total source rooms: {analysis['total_source_rooms']}")
        print(f"  Total source exits: {analysis['total_source_exits']}")
        
        # Corrupted exits
        corrupted = analysis['corrupted_exits']
        print(f"\n🔴 CORRUPTED EXITS: {len(corrupted)}")
        if corrupted:
            print("  These exits have corrupted data in the source and need manual fixing:")
            for i, exit in enumerate(corrupted[:3]):  # Show first 3
                print(f"    {i+1}. {exit['source_key']} --[{exit['direction']}]--> {exit['target_key']}")
                print(f"       Issue: {exit['issue']}")
            if len(corrupted) > 3:
                print(f"       ... and {len(corrupted) - 3} more corrupted exits")
        
        # Missing conversions
        missing = analysis['missing_conversions']
        print(f"\n🟡 MISSING CONVERSIONS: {len(missing)}")
        if missing:
            print("  These source keys need conversion mappings:")
            for i, miss in enumerate(missing[:5]):  # Show first 5
                print(f"    {i+1}. '{miss['source_key']}' -> '{miss['expected_conversion']}'")
            if len(missing) > 5:
                print(f"       ... and {len(missing) - 5} more missing conversions")
        
        # Outdated conversions
        outdated = analysis['outdated_conversions']
        print(f"\n🟠 OUTDATED CONVERSIONS: {len(outdated)}")
        if outdated:
            print("  These conversions should be removed (source keys don't exist):")
            for i, out in enumerate(outdated[:5]):  # Show first 5
                print(f"    {i+1}. '{out['conversion_key']}' -> '{out['converted_id']}'")
            if len(outdated) > 5:
                print(f"       ... and {len(outdated) - 5} more outdated conversions")
        
        # Recommendations
        recommendations = self.generate_recommendations(analysis)
        if recommendations:
            print(f"\n💡 RECOMMENDATIONS:")
            for rec in recommendations:
                print(f"  {rec}")
        
        # Summary
        total_issues = len(corrupted) + len(missing) + len(outdated)
        print(f"\n📋 SUMMARY:")
        print(f"  Total issues found: {total_issues}")
        if total_issues == 0:
            print("  🎉 All scene exits are properly configured!")
        else:
            print(f"  ⚠️  {total_issues} issues need attention for proper scene navigation")

def main():
    analyzer = SceneExitAnalyzer()
    analysis = analyzer.analyze_all_issues()
    analyzer.print_analysis_report(analysis)

if __name__ == "__main__":
    main()