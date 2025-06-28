#!/usr/bin/env python3
"""
Zork Scene Extractor
Extracts scene data from MDL and JSON sources into TypeScript-compatible JSON files
Following the established extractor architecture with flat file structure
"""

import json
import re
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional

class SceneExtractor:
    def __init__(self, json_source: str, mdl_source: str = None):
        self.json_source = Path(json_source)
        self.mdl_source = Path(mdl_source) if mdl_source else Path("../dung_mud_source.txt")
        self.output_dir = Path(__file__).parent.parent.parent / "data"
        self.data = self.load_source_data()
        self.mdl_content = self.load_mdl_source() if self.mdl_source.exists() else None
        self.conditional_exits = self.parse_conditional_exits() if self.mdl_content else {}
        self.door_objects = self.parse_door_objects() if self.mdl_content else {}
        
        # Room ID conversions for consistency with existing codebase
        self.room_id_conversions = {
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
        
        # Region categorization based on original Zork structure
        self.region_mapping = {
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
        
        # Direction mappings for exits
        self.direction_mapping = {
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

    def load_source_data(self) -> Dict[str, Any]:
        """Load the source JSON data"""
        with open(self.json_source, 'r') as f:
            return json.load(f)
    
    def load_mdl_source(self) -> str:
        """Load MDL source content for parsing conditional exits"""
        try:
            with open(self.mdl_source, 'r') as f:
                return f.read()
        except Exception as e:
            print(f"Warning: Could not load MDL source: {e}")
            return ""
    
    def convert_key_to_id(self, key: str) -> str:
        """Convert Zork room key to snake_case ID following established patterns"""
        # Handle maze rooms
        if key.startswith('MAZE') or key.startswith('MAZ'):
            num = key.replace('MAZE', '').replace('MAZ', '')
            return f'maze_{num}'
        
        # Handle dead ends
        if key.startswith('DEAD'):
            num = key.replace('DEAD', '')
            return f'dead_end_{num}'
        
        # Use conversion table or fallback to snake_case
        return self.room_id_conversions.get(key, key.lower().replace(' ', '_').replace('-', '_'))
    
    def determine_region(self, key: str) -> str:
        """Determine which region a room belongs to"""
        for region, rooms in self.region_mapping.items():
            if key in rooms:
                return region
        
        # Default categorization logic for rooms not explicitly mapped
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
        return self.direction_mapping.get(direction, direction.lower())
    
    def parse_conditional_exits(self) -> Dict[str, Dict[str, Any]]:
        """Parse CEXIT definitions from MDL source"""
        conditional_exits = {}
        
        # Find CEXIT patterns: <CEXIT "FLAG" "DESTINATION" "MESSAGE" [CONDITION] [FUNCTION]>
        cexit_pattern = r'<CEXIT\s+"([^"]+)"\s+"([^"]+)"\s+"([^"]+)"[^>]*>'
        
        matches = re.finditer(cexit_pattern, self.mdl_content)
        for match in matches:
            flag = match.group(1)
            destination = match.group(2)
            message = match.group(3)
            
            conditional_exits[flag] = {
                'destination': destination,
                'failureMessage': message,
                'condition': flag
            }
        
        # Parse NEXIT patterns: "DIRECTION" #NEXIT "MESSAGE"
        nexit_pattern = r'"([^"]+)"\s+#NEXIT\s+"([^"]+)"'
        
        matches = re.finditer(nexit_pattern, self.mdl_content)
        for match in matches:
            direction = match.group(1)
            message = match.group(2)
            
            # Store as blocked exits
            exit_key = f"NEXIT_{direction}"
            conditional_exits[exit_key] = {
                'destination': None,
                'failureMessage': message,
                'blocked': True,
                'direction': direction
            }
        
        return conditional_exits
    
    def parse_door_objects(self) -> Dict[str, Dict[str, Any]]:
        """Parse door objects with DOORBIT from MDL source"""
        door_objects = {}
        
        # Find door objects: <OBJECT ["NAME1" "NAME2"] ... "description" <+ ... ,DOORBIT ...> [FUNCTION]>
        object_pattern = r'<OBJECT\s+\[(.*?)\]\s+(.*?)(?=<OBJECT|\Z)'
        
        matches = re.finditer(object_pattern, self.mdl_content, re.DOTALL)
        for match in matches:
            names_str = match.group(1)
            definition = match.group(2)
            
            # Check if this object has DOORBIT
            if 'DOORBIT' in definition:
                # Parse names
                names = [name.strip().strip('"') for name in names_str.split('"') if name.strip()]
                if not names:
                    continue
                
                primary_name = names[0].lower()
                
                # Extract description
                desc_match = re.search(r'"([^"]*)"', definition)
                description = desc_match.group(1) if desc_match else f"{primary_name} door"
                
                door_objects[primary_name] = {
                    'names': names,
                    'description': description,
                    'type': 'door',
                    'openable': True,
                    'locked': 'LOCKED' in definition.upper()
                }
        
        # Parse DOOR macro patterns: <DOOR "OBJECT" "ROOM1" "ROOM2" ["MESSAGE"]>
        door_macro_pattern = r'<DOOR\s+"([^"]+)"\s+"([^"]+)"\s+"([^"]+)"(?:\s+"([^"]+)")?>'
        
        matches = re.finditer(door_macro_pattern, self.mdl_content)
        for match in matches:
            door_name = match.group(1).lower()
            room1 = match.group(2)
            room2 = match.group(3)
            message = match.group(4) if match.group(4) else None
            
            if door_name not in door_objects:
                door_objects[door_name] = {
                    'names': [door_name],
                    'description': f"{door_name}",
                    'type': 'door',
                    'openable': True
                }
            
            door_objects[door_name]['connects'] = [room1, room2]
            if message:
                door_objects[door_name]['failureMessage'] = message
        
        return door_objects
    
    def determine_lighting(self, region: str, room_key: str) -> str:
        """Determine lighting condition based on region and specific room properties"""
        # Above ground rooms are naturally lit
        if region == 'above_ground':
            return 'daylight'
        
        # Specific rooms that are naturally lit
        lit_rooms = ['LROOM', 'KITCH', 'ATTIC']  # House rooms with windows
        if room_key in lit_rooms:
            return 'lit'
        
        # Maze and most underground areas are dark
        if region in ['maze', 'underground', 'endgame']:
            return 'dark'
        
        return 'dark'  # Default to dark for safety
    
    def extract_initial_items(self, room_key: str) -> List[str]:
        """Extract initial items for a room based on game knowledge"""
        # Known initial item placements from original Zork - using correct item IDs
        initial_items = {
            'LROOM': ['tcase', 'lamp'],        # trophy case, brass lamp
            'KITCH': ['sbag', 'bottl'],        # brown sack, glass bottle
            'ATTIC': ['rope'],                 # rope
            'MTROL': ['axe'],                  # bloody axe (after troll defeat)
            'TREAS': ['bagco'],                # bag of coins
            # Add more as needed based on actual game data
        }
        
        return initial_items.get(room_key, [])
    
    def extract_initial_monsters(self, room_key: str) -> List[str]:
        """Extract initial monster placements"""
        # Known monster starting locations
        monster_locations = {
            'MTROL': ['troll'],
            'TREAS': ['thief'],
            'CYCLO': ['cyclops'],
            'NIRVA': ['guardian_of_zork'],
            # Grue appears in dark rooms
        }
        
        return monster_locations.get(room_key, [])
    
    def generate_atmosphere_messages(self, region: str, room_key: str) -> List[str]:
        """Generate authentic atmospheric messages based on region and room"""
        atmosphere_by_region = {
            'above_ground': [
                "A gentle breeze stirs the leaves overhead.",
                "You hear birds chirping in the distance.", 
                "Sunlight filters through the trees.",
                "The air is fresh and clean here."
            ],
            'underground': [
                "The air is cool and damp.",
                "Water drips somewhere in the darkness.",
                "Your footsteps echo off the stone walls.",
                "The walls are rough-hewn stone."
            ],
            'maze': [
                "The passages here all look alike.",
                "You hear the sound of your own breathing.",
                "The walls are lined with ancient stonework.",
                "A faint draft stirs the stale air."
            ],
            'endgame': [
                "An aura of ancient power fills this place.",
                "The air shimmers with mystical energy.",
                "You sense you are nearing your goal.",
                "This place feels sacred and untouchable."
            ]
        }
        
        return atmosphere_by_region.get(region, [])
    
    def build_exits(self) -> Dict[str, Dict[str, Any]]:
        """Build exits lookup from source data with conditional exit support"""
        exits_by_room = {}
        
        for exit_data in self.data['exits']:
            source = exit_data['source']
            if source not in exits_by_room:
                exits_by_room[source] = {}
            
            direction = self.convert_direction(exit_data['dir'])
            target = exit_data['target']
            
            # Handle NoExit - these are blocked passages
            if target == 'NoExit':
                exits_by_room[source][direction] = {
                    'to': None,
                    'blocked': True,
                    'failureMessage': self.get_blocked_exit_message(source, direction)
                }
                continue
            
            # Check if this exit has conditional requirements
            exit_obj = self.check_conditional_exit(source, direction, target)
            if exit_obj:
                exits_by_room[source][direction] = exit_obj
            else:
                # Simple exit
                exits_by_room[source][direction] = self.convert_key_to_id(target)
        
        return exits_by_room
    
    def check_conditional_exit(self, source: str, direction: str, target: str) -> Optional[Dict[str, Any]]:
        """Check if an exit has conditional requirements"""
        # Check if there's a door connecting these rooms
        for door_name, door_data in self.door_objects.items():
            if 'connects' in door_data:
                rooms = door_data['connects']
                if source in rooms and target in rooms:
                    return {
                        'to': self.convert_key_to_id(target),
                        'description': f"You see {door_data['description']} {direction}.",
                        'condition': f"door_{door_name}_open",
                        'locked': door_data.get('locked', False),
                        'keyId': door_data.get('keyId'),
                        'failureMessage': door_data.get('failureMessage', f"The {door_name} is closed.")
                    }
        
        # Check for flag-based conditional exits
        for flag, exit_data in self.conditional_exits.items():
            if exit_data['destination'] == target:
                return {
                    'to': self.convert_key_to_id(target),
                    'condition': flag.lower().replace('-', '_'),
                    'failureMessage': exit_data['failureMessage']
                }
        
        return None
    
    def get_blocked_exit_message(self, source: str, direction: str) -> str:
        """Get appropriate blocked exit message"""
        # Check for specific NEXIT messages
        nexit_key = f"NEXIT_{direction.upper()}"
        if nexit_key in self.conditional_exits:
            return self.conditional_exits[nexit_key]['failureMessage']
        
        # Default messages based on room and direction
        blocked_messages = {
            'WHOUS': {
                'east': "The front door is boarded and you can't remove the boards."
            },
            'NHOUS': {
                'south': "The windows are all barred.",
                'north': "You can't go that way."
            },
            'SHOUS': {
                'north': "The windows are all barred.",
                'south': "You can't go that way."
            }
        }
        
        if source in blocked_messages and direction in blocked_messages[source]:
            return blocked_messages[source][direction]
        
        return f"You can't go {direction} from here."
    
    def create_scene_data(self, room: Dict[str, Any], exits_by_room: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Create SceneData-compliant JSON structure"""
        key = room['key']
        scene_id = self.convert_key_to_id(key)
        region = self.determine_region(key)
        
        # Build scene data following SceneData.ts interface
        scene_data = {
            "id": scene_id,
            "title": room['name'],
            "description": room['desc'] if room['desc'] else f"You are in the {room['name'].lower()}.",
            "exits": exits_by_room.get(key, {}),
            "items": self.extract_initial_items(key),
            "monsters": self.extract_initial_monsters(key),
            "state": {},
            "lighting": self.determine_lighting(region, key),
            "region": region,
            "atmosphere": self.generate_atmosphere_messages(region, key),
            "tags": [region]
        }
        
        # Add region-specific tags
        if 'maze' in scene_id:
            scene_data["tags"].append("maze")
            scene_data["tags"].append("confusing")
        
        if region == 'endgame':
            scene_data["tags"].append("sacred")
            scene_data["tags"].append("final_area")
            
        if key in ['TREAS', 'MTROL', 'CYCLO']:
            scene_data["tags"].append("dangerous")
            
        # Add first visit descriptions for key rooms
        if scene_id in ['west_of_house', 'living_room', 'treasury_of_zork']:
            scene_data["firstVisitDescription"] = self.get_first_visit_description(scene_id)
        
        return scene_data
    
    def get_first_visit_description(self, scene_id: str) -> str:
        """Get special first visit descriptions for important rooms"""
        first_visit_descriptions = {
            'west_of_house': "You are standing in an open field west of a white house, with a boarded front door.",
            'living_room': "You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.",
            'treasury_of_zork': "You are in the Treasury of Zork, a vast chamber filled with treasures beyond imagination. The Guardian of Zork stands vigilant, protecting the ultimate treasure."
        }
        
        return first_visit_descriptions.get(scene_id)
    
    def extract_scenes(self):
        """Extract all scenes to flat structure in scenes/ folder"""
        print("Extracting scenes...")
        
        # Clean existing scenes directory to avoid old incorrect files
        scenes_dir = self.output_dir / "scenes"
        if scenes_dir.exists():
            print(f"Cleaning existing scenes directory: {scenes_dir}")
            shutil.rmtree(scenes_dir)
        
        scenes_dir.mkdir(parents=True, exist_ok=True)
        
        # Build exits lookup
        exits_by_room = self.build_exits()
        
        # Process all rooms
        all_scenes = []
        scene_files = {}
        regions = {'above_ground': [], 'underground': [], 'maze': [], 'endgame': []}
        
        for room in self.data['rooms']:
            scene_data = self.create_scene_data(room, exits_by_room)
            
            # Use flat structure - all scenes directly in scenes/ folder
            filename = f"{scene_data['id']}.json"
            scene_files[filename] = scene_data
            all_scenes.append(filename)
            
            # Categorize by region for index
            region = scene_data['region']
            if region in regions:
                regions[region].append(filename)
        
        # Write scene files directly to scenes/ folder
        for filename, scene_data in scene_files.items():
            file_path = self.output_dir / "scenes" / filename
            
            with open(file_path, 'w') as f:
                json.dump(scene_data, f, indent=2)
        
        # Write index file following established pattern
        index_data = {
            "scenes": sorted(all_scenes),
            "total": len(scene_files),
            "regions": regions,
            "lastUpdated": "2024-06-27T00:00:00Z"
        }
        
        with open(self.output_dir / "scenes" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(scene_files)} scene files in flat structure")
        return scene_files

def main():
    extractor = SceneExtractor("../zork_source.json")
    
    # Extract scenes
    scenes = extractor.extract_scenes()
    
    print("Scene extraction complete!")

if __name__ == "__main__":
    main()