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
        self.output_dir = Path("data")
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
                elif 'TOOLBIT' in line:
                    obj_data['flags'].append('TOOL')
                elif 'FOODBIT' in line:
                    obj_data['flags'].append('FOOD')
                elif 'DRINKBIT' in line:
                    obj_data['flags'].append('DRINK')
                elif 'VEHBIT' in line:
                    obj_data['flags'].append('VEHICLE')
                
                # Parse flag combinations in single line like "<+ ,OVISON ,TAKEBIT ,WEAPONBIT>"
                flag_match = re.search(r'<\+[^>]*>', line)
                if flag_match:
                    flag_line = flag_match.group(0)
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
                    if 'TOOLBIT' in flag_line:
                        obj_data['flags'].append('TOOL')
                    if 'FOODBIT' in flag_line:
                        obj_data['flags'].append('FOOD')
                    if 'DRINKBIT' in flag_line:
                        obj_data['flags'].append('DRINK')
                    if 'VEHBIT' in flag_line:
                        obj_data['flags'].append('VEHICLE')
            
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
            "visible": True,
            "weight": obj['properties'].get('size', 5),
            "size": self.convert_size(obj['properties'].get('size', 5)),
            "initialState": {},
            "tags": [tag.lower() for tag in obj['flags']],
            "properties": obj['properties'],
            "interactions": self.generate_interactions(obj),
            "initialLocation": "unknown"  # Would need additional parsing to determine
        }
        
        return item_data

    def determine_item_type(self, obj: Dict[str, Any]) -> str:
        """Determine the primary item type - aligned with categorization logic"""
        flags = [flag.upper() for flag in obj['flags']]
        
        # Priority order matches categorize_item() method
        if 'FOOD' in flags or 'DRINK' in flags:
            return 'FOOD'
        elif 'WEAPON' in flags:
            return 'WEAPON'
        elif 'CONTAINER' in flags or 'OPENABLE' in flags:
            return 'CONTAINER'
        elif 'TOOL' in flags:
            return 'TOOL'
        elif 'LIGHT_SOURCE' in flags:
            return 'LIGHT_SOURCE'
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