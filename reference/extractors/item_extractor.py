#!/usr/bin/env python3
"""
Zork Item Extractor
Converts Zork object definitions from MDL files into TypeScript-compatible JSON
"""

import json
import re
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional

class ItemExtractor:
    def __init__(self, dung_file: str):
        self.dung_file = Path(dung_file)
        self.output_dir = Path(__file__).parent.parent.parent / "data"
        self.objects = self.parse_objects()
        
        # Item type categorization based on flags and properties
        self.type_mapping = {
            'treasures': ['OVISON', 'TREASUREBIT', 'valuable', 'gold', 'silver', 'jewel', 'diamond', 'emerald', 'ruby', 'sapphire'],
            'tools': ['TAKEBIT', 'tool', 'rope', 'shovel', 'wrench', 'key', 'stick'],
            'containers': ['CONTBIT', 'OPENBIT', 'bag', 'box', 'case', 'chest', 'basket'],
            'weapons': ['WEAPONBIT', 'sword', 'knife', 'dagger', 'stiletto', 'axe'],
            'consumables': ['FOODBIT', 'DRINKBIT', 'food', 'water', 'wine', 'sandwich']
        }

    def parse_objects(self) -> List[Dict[str, Any]]:
        """Parse object definitions from dung.mud file"""
        with open(self.dung_file, 'r') as f:
            content = f.read()
        
        # Find all object definitions
        object_pattern = r'<OBJECT\s+\[(.*?)\]\s+(.*?)(?=<OBJECT|\Z)'
        objects = []
        
        matches = re.finditer(object_pattern, content, re.DOTALL)
        for match in matches:
            names_str = match.group(1)
            definition = match.group(2)
            
            # Parse object names
            names = [name.strip().strip('"') for name in names_str.split('"') if name.strip() and name.strip() != '']
            
            if not names:
                continue
                
            # Parse object definition parts
            lines = definition.strip().split('\n')
            obj_data = {
                'names': names,
                'primary_name': names[0] if names else 'unknown',
                'adjectives': [],
                'description': '',
                'flags': [],
                'properties': {},
                'raw_definition': definition.strip()
            }
            
            # Parse definition lines
            current_line = 0
            if current_line < len(lines):
                # Adjectives line (usually in brackets)
                adj_line = lines[current_line].strip()
                if adj_line.startswith('[') and adj_line.endswith(']'):
                    adj_content = adj_line[1:-1]
                    if adj_content:
                        obj_data['adjectives'] = [adj.strip().strip('"') for adj in adj_content.split('"') if adj.strip()]
                    current_line += 1
            
            if current_line < len(lines):
                # Description line (in quotes)
                desc_line = lines[current_line].strip()
                if desc_line.startswith('"') and desc_line.endswith('"'):
                    obj_data['description'] = desc_line[1:-1]
                    current_line += 1
            
            # Look for ODESC1 and other properties
            for line in lines:
                line = line.strip()
                if 'ODESC1' in line:
                    # Extract ODESC1 description
                    match = re.search(r'ODESC1\s+"([^"]*)"', line)
                    if match:
                        obj_data['examine_text'] = match.group(1)
                elif 'ODESCO' in line:
                    # Extract ODESCO description  
                    match = re.search(r'ODESCO\s+"([^"]*)"', line)
                    if match:
                        obj_data['examine_text'] = match.group(1)
                elif 'OSIZE' in line:
                    # Extract size
                    match = re.search(r'OSIZE\s+(\d+)', line)
                    if match:
                        obj_data['properties']['size'] = int(match.group(1))
                elif 'OFVAL' in line:
                    # Extract treasure value
                    match = re.search(r'OFVAL\s+(\d+)', line)
                    if match:
                        obj_data['properties']['value'] = int(match.group(1))
                elif 'OTVAL' in line:
                    # Extract treasure points
                    match = re.search(r'OTVAL\s+(\d+)', line)
                    if match:
                        obj_data['properties']['treasurePoints'] = int(match.group(1))
                elif 'OCAPAC' in line:
                    # Extract container capacity
                    match = re.search(r'OCAPAC\s+(\d+)', line)
                    if match:
                        obj_data['properties']['capacity'] = int(match.group(1))
                elif 'OREAD' in line:
                    # Extract readable text
                    match = re.search(r'OREAD\s+"([^"]*)"', line)
                    if match:
                        obj_data['properties']['readText'] = match.group(1)
                elif 'OLINT' in line:
                    # Extract light timer info (simplified)
                    if 'CLOCK-INT' in line:
                        timer_match = re.search(r'CLOCK-INT.*?(\d+)', line)
                        if timer_match:
                            obj_data['properties']['lightTimer'] = int(timer_match.group(1))
                elif 'OMATCH' in line:
                    # Extract match count
                    match = re.search(r'OMATCH\s+(\d+)', line)
                    if match:
                        obj_data['properties']['matchCount'] = int(match.group(1))
                
                # Parse flag combinations in single line like "<+ ,OVISON ,TAKEBIT ,WEAPONBIT>"
                flag_match = re.search(r'<\+[^>]*>', line)
                if flag_match:
                    flag_line = flag_match.group(0)
                    # Core functionality flags
                    if 'OVISON' in flag_line:
                        obj_data['flags'].append('VISIBLE')
                    if 'TAKEBIT' in flag_line:
                        obj_data['flags'].append('PORTABLE')
                    if 'LIGHTBIT' in flag_line:
                        obj_data['flags'].append('LIGHT_SOURCE')
                    if 'CONTBIT' in flag_line:
                        obj_data['flags'].append('CONTAINER')
                    if 'OPENBIT' in flag_line:
                        obj_data['flags'].append('OPENABLE')
                    if 'WEAPONBIT' in flag_line:
                        obj_data['flags'].append('WEAPON')
                    if 'TREASUREBIT' in flag_line:
                        obj_data['flags'].append('TREASURE')
                    if 'SACREDBIT' in flag_line:
                        obj_data['flags'].append('TREASURE')
                    if 'TOOLBIT' in flag_line:
                        obj_data['flags'].append('TOOL')
                    if 'FOODBIT' in flag_line:
                        obj_data['flags'].append('FOOD')
                    if 'DRINKBIT' in flag_line:
                        obj_data['flags'].append('DRINK')
                    if 'VEHBIT' in flag_line:
                        obj_data['flags'].append('VEHICLE')
                    # Additional flags found in reference data
                    if 'READBIT' in flag_line:
                        obj_data['flags'].append('READABLE')
                    if 'BURNBIT' in flag_line:
                        obj_data['flags'].append('FLAMMABLE')
                    if 'DOORBIT' in flag_line:
                        obj_data['flags'].append('DOOR')
                    if 'TURNBIT' in flag_line:
                        obj_data['flags'].append('TURNABLE')
                    if 'ONBIT' in flag_line:
                        obj_data['flags'].append('SWITCHABLE')
                    if 'FLAMEBIT' in flag_line:
                        obj_data['flags'].append('FLAME_SOURCE')
                    if 'SEARCHBIT' in flag_line:
                        obj_data['flags'].append('SEARCHABLE')
                    if 'VICBIT' in flag_line:
                        obj_data['flags'].append('CHARACTER')
                    if 'NDESCBIT' in flag_line:
                        obj_data['flags'].append('NO_DESCRIPTION')
                    # Additional flags found in reference data
                    if 'TIEBIT' in flag_line:
                        obj_data['flags'].append('TIEABLE')
                    if 'DIGBIT' in flag_line:
                        obj_data['flags'].append('DIGGABLE')
                    if 'CLIMBBIT' in flag_line:
                        obj_data['flags'].append('CLIMBABLE')
                    if 'TRYTAKEBIT' in flag_line:
                        obj_data['flags'].append('DANGEROUS')
                    if 'BUNCHBIT' in flag_line:
                        obj_data['flags'].append('COLLECTIVE')
                
                # Parse individual flag lines (for flags not in combinations)
                elif 'OVISON' in line:
                    obj_data['flags'].append('VISIBLE')
                elif 'TAKEBIT' in line:
                    obj_data['flags'].append('PORTABLE')
                elif 'LIGHTBIT' in line:
                    obj_data['flags'].append('LIGHT_SOURCE')
                elif 'CONTBIT' in line:
                    obj_data['flags'].append('CONTAINER')
                elif 'OPENBIT' in line:
                    obj_data['flags'].append('OPENABLE')
                elif 'WEAPONBIT' in line:
                    obj_data['flags'].append('WEAPON')
                elif 'TREASUREBIT' in line:
                    obj_data['flags'].append('TREASURE')
                elif 'SACREDBIT' in line:
                    obj_data['flags'].append('TREASURE')
                elif 'TOOLBIT' in line:
                    obj_data['flags'].append('TOOL')
                elif 'FOODBIT' in line:
                    obj_data['flags'].append('FOOD')
                elif 'DRINKBIT' in line:
                    obj_data['flags'].append('DRINK')
                elif 'VEHBIT' in line:
                    obj_data['flags'].append('VEHICLE')
                elif 'READBIT' in line:
                    obj_data['flags'].append('READABLE')
                elif 'BURNBIT' in line:
                    obj_data['flags'].append('FLAMMABLE')
                elif 'DOORBIT' in line:
                    obj_data['flags'].append('DOOR')
                elif 'TURNBIT' in line:
                    obj_data['flags'].append('TURNABLE')
                elif 'ONBIT' in line:
                    obj_data['flags'].append('SWITCHABLE')
                elif 'FLAMEBIT' in line:
                    obj_data['flags'].append('FLAME_SOURCE')
                elif 'SEARCHBIT' in line:
                    obj_data['flags'].append('SEARCHABLE')
                elif 'VICBIT' in line:
                    obj_data['flags'].append('CHARACTER')
                elif 'NDESCBIT' in line:
                    obj_data['flags'].append('NO_DESCRIPTION')
                elif 'TIEBIT' in line:
                    obj_data['flags'].append('TIEABLE')
                elif 'DIGBIT' in line:
                    obj_data['flags'].append('DIGGABLE')
                elif 'CLIMBBIT' in line:
                    obj_data['flags'].append('CLIMBABLE')
                elif 'TRYTAKEBIT' in line:
                    obj_data['flags'].append('DANGEROUS')
                elif 'BUNCHBIT' in line:
                    obj_data['flags'].append('COLLECTIVE')
            
            objects.append(obj_data)
        
        return objects


    def convert_to_item_json(self, obj: Dict[str, Any]) -> Dict[str, Any]:
        """Convert parsed object to your item JSON format"""
        primary_name = obj['names'][0].lower().replace(' ', '_')
        
        # Build item JSON
        item_data = {
            "id": primary_name,
            "name": obj['description'] if obj['description'] else obj['names'][0],
            "description": f"You see {obj['description'].lower() if obj['description'] else obj['names'][0]}.",
            "examineText": obj.get('examine_text', f"It's {obj['description'].lower() if obj['description'] else obj['names'][0]}."),
            "aliases": obj['names'][1:] + obj['adjectives'],  # Additional names as aliases
            "type": self.determine_item_type(obj),
            "portable": 'PORTABLE' in obj['flags'],
            "visible": 'VISIBLE' in obj['flags'],
            "weight": obj['properties'].get('size', 5),
            "size": self.convert_size(obj['properties'].get('size', 5)),
            "initialState": {},
            "tags": list(set([tag.lower() for tag in obj['flags']])),  # Remove duplicates
            "properties": obj['properties'],
            "interactions": self.generate_interactions(obj),
            "initialLocation": "unknown"  # Would need additional parsing to determine
        }
        
        return item_data

    def determine_item_type(self, obj: Dict[str, Any]) -> str:
        """Determine the primary item type - aligned with categorization logic"""
        flags = [flag.upper() for flag in obj['flags']]
        properties = obj.get('properties', {})
        
        # Treasure detection: items with both value (OFVAL) and treasurePoints (OTVAL)
        if 'value' in properties and 'treasurePoints' in properties:
            return 'TREASURE'
        # Priority order matches categorize_item() method
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

    def convert_size(self, numeric_size: int) -> str:
        """Convert numeric size to size enum"""
        if numeric_size <= 5:
            return 'TINY'
        elif numeric_size <= 10:
            return 'SMALL'
        elif numeric_size <= 20:
            return 'MEDIUM'
        elif numeric_size <= 40:
            return 'LARGE'
        else:
            return 'HUGE'

    def generate_interactions(self, obj: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate basic interactions based on object flags"""
        interactions = []
        
        # Basic examine interaction
        interactions.append({
            "command": "examine",
            "message": obj.get('examine_text', f"It's {obj['description'].lower() if obj['description'] else obj['names'][0]}.")
        })
        
        # Take interaction if portable
        if 'PORTABLE' in obj['flags']:
            interactions.append({
                "command": "take",
                "message": f"You take the {obj['description'] if obj['description'] else obj['names'][0]}."
            })
        
        # Light interactions for light sources
        if 'LIGHT_SOURCE' in obj['flags']:
            interactions.extend([
                {
                    "command": "turn on",
                    "condition": "!state.lit",
                    "effect": "state.lit = true",
                    "message": f"The {obj['names'][0]} is now on."
                },
                {
                    "command": "turn off", 
                    "condition": "state.lit",
                    "effect": "state.lit = false",
                    "message": f"The {obj['names'][0]} is now off."
                }
            ])
        
        # Container interactions
        if 'CONTAINER' in obj['flags'] or 'OPENABLE' in obj['flags']:
            interactions.extend([
                {
                    "command": "open",
                    "condition": "!state.open",
                    "effect": "state.open = true",
                    "message": f"You open the {obj['names'][0]}."
                },
                {
                    "command": "close",
                    "condition": "state.open", 
                    "effect": "state.open = false",
                    "message": f"You close the {obj['names'][0]}."
                }
            ])
        
        # Read interaction for readable items
        if 'READABLE' in obj['flags']:
            interactions.append({
                "command": "read",
                "message": f"You read the {obj['names'][0]}."
            })
        
        # Turn interaction for turnable items
        if 'TURNABLE' in obj['flags']:
            interactions.append({
                "command": "turn",
                "message": f"You turn the {obj['names'][0]}."
            })
        
        # Search interaction for searchable items
        if 'SEARCHABLE' in obj['flags']:
            interactions.append({
                "command": "search",
                "message": f"You search the {obj['names'][0]}."
            })
        
        # Switch interactions for switchable items
        if 'SWITCHABLE' in obj['flags']:
            interactions.extend([
                {
                    "command": "turn on",
                    "condition": "!state.on",
                    "effect": "state.on = true",
                    "message": f"You turn on the {obj['names'][0]}."
                },
                {
                    "command": "turn off",
                    "condition": "state.on",
                    "effect": "state.on = false",
                    "message": f"You turn off the {obj['names'][0]}."
                }
            ])
        
        return interactions

    def extract_items(self):
        """Extract all items to flat structure in items/ folder"""
        print("Extracting items...")
        
        # Clean existing items directory to avoid old incorrect files
        items_dir = self.output_dir / "items"
        if items_dir.exists():
            print(f"Cleaning existing items directory: {items_dir}")
            shutil.rmtree(items_dir)
        
        items_dir.mkdir(parents=True, exist_ok=True)
        
        all_items = []
        item_files = {}
        
        for obj in self.objects:
            if not obj['names']:  # Skip objects without names
                continue
                
            item_data = self.convert_to_item_json(obj)
            
            # Use flat structure - all items directly in items/ folder
            filename = f"{item_data['id']}.json"
            item_files[filename] = item_data
            all_items.append(filename)
        
        # Write item files directly to items/ folder
        for filename, item_data in item_files.items():
            file_path = self.output_dir / "items" / filename
            
            with open(file_path, 'w') as f:
                json.dump(item_data, f, indent=2)
        
        # Write simplified index file
        index_data = {
            "items": sorted(all_items),
            "total": len(item_files),
            "lastUpdated": "2024-06-25T00:00:00Z"
        }
        
        with open(self.output_dir / "items" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(item_files)} item files in flat structure")
        return item_files

def main():
    extractor = ItemExtractor("../dung_mud_source.txt")
    
    # Extract items
    items = extractor.extract_items()
    
    print("Item extraction complete!")

if __name__ == "__main__":
    main()