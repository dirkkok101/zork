#!/usr/bin/env python3
"""
Zork Data Extractor
Converts Lantern's Zork data into TypeScript-compatible JSON files
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

class ZorkExtractor:
    def __init__(self, source_file: str):
        self.source_file = Path(source_file)
        self.output_dir = Path("game_reference")
        self.data = self.load_source_data()
        
        # Room categorization based on analysis of original Zork
        self.room_categories = {
            'above_ground': [
                'WHOUS', 'NHOUS', 'SHOUS', 'EHOUS', 'FORE1', 'FORE2', 'FORE3', 
                'PATH', 'CLEAR', 'BEACH', 'RESER', 'DAM'
            ],
            'underground': [
                'LROOM', 'KITCH', 'ATTIC', 'CELLA', 'TWELL', 'EGYPT', 'SANDY',
                'ROCKY', 'OROOM', 'CAROU', 'MTROL', 'TREAS', 'WINDM'
            ],
            'maze': [
                'MAZE1', 'MAZE2', 'MAZE3', 'MAZE4', 'MAZE5', 'MAZE6', 'MAZE7',
                'MAZE8', 'MAZE9', 'MAZ10', 'MAZ11', 'MAZ12', 'MAZ13', 'MAZ14',
                'MAZ15', 'MGRAT', 'DEAD1', 'DEAD2', 'DEAD3', 'DEAD4'
            ],
            'endgame': [
                'MTREE', 'FALLS', 'MTOP', 'DOME', 'TORCH', 'TEMP', 'ALTAR',
                'FORE4', 'VOLCA', 'HBARR', 'NCELL', 'NIRVA'
            ]
        }
    
    def load_source_data(self) -> Dict[str, Any]:
        """Load the source Zork JSON data"""
        with open(self.source_file, 'r') as f:
            return json.load(f)
    
    def convert_key_to_id(self, key: str) -> str:
        """Convert Zork room key to snake_case ID"""
        conversions = {
            'WHOUS': 'west_of_house',
            'NHOUS': 'north_of_house', 
            'SHOUS': 'south_of_house',
            'EHOUS': 'behind_house',
            'LROOM': 'living_room',
            'KITCH': 'kitchen',
            'ATTIC': 'attic',
            'CELLA': 'cellar',
            'TWELL': 'treasure_well',
            'FORE1': 'forest_1',
            'FORE2': 'forest_2',
            'FORE3': 'forest_3',
            'FORE4': 'forest_4',
            'PATH': 'forest_path',
            'CLEAR': 'clearing',
            'BEACH': 'beach',
            'RESER': 'reservoir',
            'DAM': 'dam',
            'EGYPT': 'egyptian_room',
            'SANDY': 'sandy_beach',
            'ROCKY': 'rocky_ledge',
            'OROOM': 'round_room',
            'CAROU': 'carousel_room',
            'MTROL': 'troll_room',
            'TREAS': 'treasure_room',
            'WINDM': 'windmill',
            'MGRAT': 'grating_room',
            'MTREE': 'up_tree',
            'FALLS': 'top_of_falls',
            'MTOP': 'mountain_top',
            'DOME': 'temple_dome',
            'TORCH': 'torch_room',
            'TEMP': 'temple',
            'ALTAR': 'altar',
            'VOLCA': 'volcano',
            'HBARR': 'barrow',
            'NCELL': 'cell',
            'NIRVA': 'treasury_of_zork',
            'CYCLO': 'cyclops_room',
            'BLROO': 'strange_passage'
        }
        
        # Handle maze rooms
        if key.startswith('MAZE') or key.startswith('MAZ'):
            num = key.replace('MAZE', '').replace('MAZ', '')
            return f'maze_{num}'
        
        # Handle dead ends
        if key.startswith('DEAD'):
            num = key.replace('DEAD', '')
            return f'dead_end_{num}'
        
        return conversions.get(key, key.lower().replace(' ', '_'))
    
    def get_room_category(self, key: str) -> str:
        """Determine which category a room belongs to"""
        for category, rooms in self.room_categories.items():
            if key in rooms:
                return category
        
        # Default categorization logic
        if 'MAZE' in key or 'DEAD' in key:
            return 'maze'
        elif key in ['MTREE', 'FALLS', 'MTOP', 'DOME', 'TORCH', 'TEMP', 'ALTAR', 'VOLCA', 'HBARR', 'NCELL', 'NIRVA']:
            return 'endgame'
        elif key in ['WHOUS', 'NHOUS', 'SHOUS', 'EHOUS', 'FORE1', 'FORE2', 'FORE3', 'PATH', 'CLEAR']:
            return 'above_ground'
        else:
            return 'underground'
    
    def convert_direction(self, direction: str) -> str:
        """Convert Zork direction to standard format"""
        direction_map = {
            'NORTH': 'north',
            'SOUTH': 'south', 
            'EAST': 'east',
            'WEST': 'west',
            'UP': 'up',
            'DOWN': 'down',
            'ENTER': 'in',
            'EXIT': 'out',
            'NORTHEAST': 'northeast',
            'NORTHWEST': 'northwest',
            'SOUTHEAST': 'southeast',
            'SOUTHWEST': 'southwest'
        }
        return direction_map.get(direction, direction.lower())
    
    def extract_scenes(self):
        """Extract and convert room data to scene format"""
        print("Extracting scenes...")
        
        # Build exits lookup
        exits_by_room = {}
        for exit_data in self.data['exits']:
            source = exit_data['source']
            if source not in exits_by_room:
                exits_by_room[source] = {}
            
            direction = self.convert_direction(exit_data['dir'])
            target = exit_data['target']
            
            # Skip "NoExit" targets
            if target == 'NoExit':
                continue
                
            exits_by_room[source][direction] = self.convert_key_to_id(target)
        
        # Convert rooms
        scene_files = {}
        categories = {'above_ground': [], 'underground': [], 'maze': [], 'endgame': []}
        
        for room in self.data['rooms']:
            key = room['key']
            scene_id = self.convert_key_to_id(key)
            category = self.get_room_category(key)
            
            # Build scene data
            scene_data = {
                "id": scene_id,
                "title": room['name'],
                "description": room['desc'] if room['desc'] else f"You are in the {room['name'].lower()}.",
                "exits": exits_by_room.get(key, {}),
                "items": [],
                "monsters": [],
                "state": {},
                "lighting": "lit" if category == 'above_ground' else "dark",
                "region": category.replace('_', ' ').title(),
                "tags": [category]
            }
            
            # Add maze-specific tags
            if 'maze' in scene_id:
                scene_data["tags"].append("maze")
                scene_data["atmosphere"] = [
                    "The passages here all look the same.",
                    "You hear the echo of your footsteps.",
                    "The walls are rough stone."
                ]
            
            # Add atmospheric descriptions for above ground
            if category == 'above_ground':
                scene_data["atmosphere"] = [
                    "A gentle breeze stirs the air.",
                    "Birds can be heard in the distance.",
                    "The sun filters through the trees."
                ]
            
            filename = f"{category}/{scene_id}.json"
            scene_files[filename] = scene_data
            categories[category].append(filename)
        
        # Write scene files
        for filename, scene_data in scene_files.items():
            file_path = self.output_dir / "scenes" / filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w') as f:
                json.dump(scene_data, f, indent=2)
        
        # Write index file
        index_data = {
            "categories": categories,
            "total": len(scene_files),
            "lastUpdated": "2024-06-25T00:00:00Z"
        }
        
        with open(self.output_dir / "scenes" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(scene_files)} scene files")
        return scene_files

def main():
    extractor = ZorkExtractor("game_reference/zork_source.json")
    
    # Extract scenes
    scenes = extractor.extract_scenes()
    
    print("Extraction complete!")
    print(f"Generated files in: {extractor.output_dir}")

if __name__ == "__main__":
    main()