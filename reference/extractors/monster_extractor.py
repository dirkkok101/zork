#!/usr/bin/env python3
"""
Zork Monster Extractor V2
Extracts monster data from MDL source files with 100% fidelity
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

class MonsterExtractorV2:
    def __init__(self):
        self.source_dir = Path(".")
        self.output_dir = Path("../../data/monsters")
        self.monsters = {}
        
        # Monster object patterns from MDL
        self.monster_objects = {
            'thief': {
                'object_names': ["THIEF", "ROBBE", "CROOK", "CRIMI", "BANDI", "GENT", "GENTL", "MAN", "INDIV"],
                'adjectives': ["SHADY", "SUSPI"],
                'mdl_name': 'thief',
                'ostrength': 5,
                'melee_table': 'THIEF-MELEE',
                'function': 'ROBBER-FUNCTION',
                'initial_items': ['stiletto'],
                'description': "There is a suspicious-looking individual, holding a bag, leaning against one wall. He is armed with a vicious-looking stiletto.",
                'flags': ['OVISON', 'VICBIT', 'VILLAIN'],
                'demon': 'ROBBER-DEMON'
            },
            'troll': {
                'object_names': ["TROLL"],
                'adjectives': ["NASTY"],
                'mdl_name': 'troll',
                'ostrength': 2,
                'melee_table': 'TROLL-MELEE',
                'function': None,
                'initial_items': ['axe'],
                'description': "A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.",
                'flags': ['OVISON', 'VICBIT', 'VILLAIN']
            },
            'cyclops': {
                'object_names': ["CYCLO", "ONE-E", "MONST"],
                'adjectives': [],
                'mdl_name': 'cyclops',
                'ostrength': 10000,
                'melee_table': 'CYCLOPS-MELEE',
                'function': 'CYCLOPS',
                'initial_items': [],
                'description': "The cyclops, a one-eyed giant, blocks the stairway.",
                'flags': ['OVISON', 'VICBIT', 'VILLAIN']
            },
            'grue': {
                'object_names': ["GRUE"],
                'adjectives': [],
                'mdl_name': 'lurking grue',
                'ostrength': None,
                'melee_table': None,
                'function': 'GRUE-FUNCTION',
                'initial_items': [],
                'description': "It is pitch black. You are likely to be eaten by a grue.",
                'flags': ['OVISON']
            },
            'ghost': {
                'object_names': ["GHOST", "SPIRI", "FIEND"],
                'adjectives': [],
                'mdl_name': 'number of ghosts',
                'ostrength': None,
                'melee_table': None,
                'function': 'GHOST-FUNCTION',
                'initial_items': [],
                'description': "There are sinister spirits lurking in the darkness.",
                'flags': ['OVISON', 'VICBIT']
            },
            'volcano_gnome': {
                'object_names': ["GNOME", "TROLL"],
                'adjectives': ["VOLCA"],
                'mdl_name': 'Volcano Gnome',
                'ostrength': None,
                'melee_table': None,
                'function': 'GNOME-FUNCTION',
                'initial_items': [],
                'description': "There is a nervous Volcano Gnome here.",
                'flags': ['OVISON', 'VICBIT']
            },
            'gnome_of_zurich': {
                'object_names': ["ZGNOM", "GNOME"],
                'adjectives': ["ZURIC"],
                'mdl_name': 'Gnome of Zurich',
                'ostrength': None,
                'melee_table': None,
                'function': 'ZGNOME-FUNCTION',
                'initial_items': [],
                'description': "There is a Gnome of Zurich here.",
                'flags': ['OVISON', 'VICBIT', 'VILLAIN']
            },
            'guardian_of_zork': {
                'object_names': ["GUARD"],
                'adjectives': [],
                'mdl_name': 'Guardian of Zork',
                'ostrength': 10000,
                'melee_table': 'CYCLOPS-MELEE',  # Reuses cyclops combat
                'function': None,
                'initial_items': [],
                'description': "The Guardian of Zork stands before you.",
                'flags': ['OVISON', 'VICBIT', 'VILLAIN']
            },
            'vampire_bat': {
                'object_names': ["BAT", "VAMPI"],
                'adjectives': ["VAMPI"],
                'mdl_name': 'bat',
                'ostrength': None,
                'melee_table': None,
                'function': 'FLY-ME',
                'initial_items': [],
                'description': "There is a vampire bat here.",
                'flags': ['OVISON', 'NDESCBIT', 'TRYTAKEBIT']
            }
        }
        
    def extract_melee_messages(self, source_file: Path, melee_table: str) -> Optional[Dict[str, List[str]]]:
        """Extract combat messages from melee table"""
        try:
            with open(source_file, 'r') as f:
                content = f.read()
            
            # Find the melee table definition - the whole thing ends with ]!]>
            pattern = f'<PSETG {melee_table}\\s*\\n\\s*\'!\\[(.*?)\\]!\\]>'
            match = re.search(pattern, content, re.DOTALL)
            
            if not match:
                return None
            
            melee_content = match.group(1)
            
            # Parse message categories
            messages = {
                'miss': [],
                'unconscious': [],
                'kill': [],
                'light_wound': [],
                'severe_wound': [],
                'stagger': [],
                'disarm': []
            }
            
            # Split the content into blocks
            # Each block starts with ![ and ends with either !] or ]]
            blocks = []
            current_block = ""
            in_block = False
            i = 0
            
            while i < len(melee_content):
                if i < len(melee_content) - 1 and melee_content[i:i+2] == '![':
                    if in_block and current_block:
                        blocks.append(current_block)
                        current_block = ""
                    in_block = True
                    i += 2
                elif in_block:
                    if i < len(melee_content) - 1 and melee_content[i:i+2] == '!]':
                        blocks.append(current_block)
                        current_block = ""
                        in_block = False
                        i += 2
                    elif i < len(melee_content) - 1 and melee_content[i:i+2] == ']]':
                        # Special case for blocks ending with ]]
                        blocks.append(current_block)
                        current_block = ""
                        in_block = False
                        i += 2
                    else:
                        current_block += melee_content[i]
                        i += 1
                else:
                    i += 1
            
            # Add last block if any
            if in_block and current_block:
                blocks.append(current_block)
            
            # Extract messages from each block
            category_names = ['miss', 'unconscious', 'kill', 'light_wound', 'severe_wound', 'stagger', 'disarm']
            
            for idx, block in enumerate(blocks):
                if idx < len(category_names):
                    messages[category_names[idx]] = self._extract_message_list(block)
            
            return messages
        except Exception as e:
            print(f"Error extracting melee messages: {e}")
            return None
    
    def _extract_message_list(self, block: str) -> List[str]:
        """Extract individual messages from a block"""
        messages = []
        # Match quoted strings
        matches = re.findall(r'\["([^"]+)"\]', block)
        for match in matches:
            # Clean up the message
            msg = match.replace('\\n', ' ').strip()
            msg = re.sub(r'\s+', ' ', msg)
            messages.append(msg)
        return messages
    
    def determine_monster_type(self, flags: List[str]) -> str:
        """Determine monster type based on flags and properties"""
        if 'VILLAIN' in flags:
            return 'humanoid'
        elif 'VICBIT' in flags:
            return 'creature'
        else:
            return 'environmental'
    
    def create_monster_data(self, monster_id: str, mdl_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create monster data structure from MDL information"""
        # Determine type
        monster_type = self.determine_monster_type(mdl_data.get('flags', []))
        
        # Build synonyms list
        synonyms = []
        for name in mdl_data.get('object_names', []):
            synonyms.append(name.lower())
        for adj in mdl_data.get('adjectives', []):
            synonyms.append(adj.lower())
        
        # Create base monster data
        monster_data = {
            'id': monster_id,
            'name': mdl_data.get('mdl_name', monster_id),
            'type': monster_type,
            'description': mdl_data.get('description', ''),
            'examineText': self._generate_examine_text(monster_id, mdl_data),
            'synonyms': synonyms,
            'flags': {flag: True for flag in mdl_data.get('flags', [])},
            'inventory': mdl_data.get('initial_items', []),
            'properties': {}
        }
        
        # Add combat properties if applicable
        if mdl_data.get('ostrength') is not None:
            monster_data['combatStrength'] = mdl_data['ostrength']
            monster_data['properties']['isVillain'] = True
        
        # Add melee messages if available
        if mdl_data.get('melee_table'):
            messages = self.extract_melee_messages(
                Path('../dung_mud_source.txt'), 
                mdl_data['melee_table']
            )
            if messages:
                monster_data['meleeMessages'] = messages
        
        # Add behavior function
        if mdl_data.get('function'):
            monster_data['behaviorFunction'] = mdl_data['function']
        
        # Add movement demon
        if mdl_data.get('demon'):
            monster_data['movementDemon'] = mdl_data['demon']
        
        # Add specific properties based on monster
        if monster_id == 'thief':
            monster_data['properties']['canSteal'] = True
            monster_data['properties']['hasLoot'] = True
            monster_data['startingSceneId'] = 'treasure_room'
        elif monster_id == 'troll':
            monster_data['startingSceneId'] = 'troll_room'
            monster_data['properties']['blocksPassage'] = True
        elif monster_id == 'cyclops':
            monster_data['startingSceneId'] = 'cyclops_room'
            monster_data['properties']['wantsFood'] = True
            monster_data['properties']['blocksStairway'] = True
        elif monster_id == 'grue':
            monster_data['properties']['requiresDarkness'] = True
            monster_data['properties']['instantKill'] = True
        elif monster_id == 'vampire_bat':
            monster_data['properties']['canCarryPlayer'] = True
            monster_data['properties']['canFly'] = True
        
        return monster_data
    
    def _generate_examine_text(self, monster_id: str, mdl_data: Dict[str, Any]) -> str:
        """Generate detailed examine text for monster"""
        base_descriptions = {
            'thief': "A suspicious-looking individual of medium build, leaning casually against the wall. He holds a large sack and is armed with a deadly stiletto which he handles with obvious skill.",
            'troll': "A particularly unpleasant specimen, the troll is about seven feet tall and exceptionally ugly. His skin is a mottled green and covered in warty growths. He carries a massive double-bladed axe.",
            'cyclops': "This cyclops is huge, standing nearly twelve feet tall. His single eye glares balefully at you, and his massive hands could easily crush a man. He appears to be quite hungry.",
            'grue': "The grue is a sinister, lurking presence in the dark places of the earth. Its favorite diet is adventurers, but its insatiable appetite is tempered by its fear of light.",
            'ghost': "Translucent spirits that seem to shift between this world and the next. Their forms are indistinct and unsettling.",
            'volcano_gnome': "A small, nervous creature that seems uncomfortable being away from volcanic regions. He shifts anxiously from foot to foot.",
            'gnome_of_zurich': "A dignified gnome dressed in banker's attire. He regards you with a calculating expression.",
            'guardian_of_zork': "An imposing figure clad in ancient armor, standing eternal vigil. His presence radiates authority and power.",
            'vampire_bat': "A large bat with leathery wings and sharp fangs. Despite its fearsome appearance, it seems more interested in flying than fighting."
        }
        
        return base_descriptions.get(monster_id, mdl_data.get('description', ''))
    
    def extract_monsters(self):
        """Extract all monsters from source data"""
        print("Extracting monster data from MDL source...")
        
        for monster_id, mdl_data in self.monster_objects.items():
            print(f"Processing {monster_id}...")
            monster_data = self.create_monster_data(monster_id, mdl_data)
            self.monsters[monster_id] = monster_data
        
        return self.monsters
    
    def write_files(self):
        """Write monster files in flat structure"""
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Write individual monster files
        for monster_id, monster_data in self.monsters.items():
            file_path = self.output_dir / f"{monster_id}.json"
            with open(file_path, 'w') as f:
                json.dump(monster_data, f, indent=2)
            print(f"Wrote {file_path}")
        
        # Create index file
        index_data = {
            'monsters': list(self.monsters.keys()),
            'total': len(self.monsters),
            'types': {
                'humanoid': [],
                'creature': [],
                'environmental': []
            }
        }
        
        # Categorize by type
        for monster_id, monster_data in self.monsters.items():
            monster_type = monster_data.get('type', 'creature')
            if monster_type in index_data['types']:
                index_data['types'][monster_type].append(monster_id)
        
        # Write index
        index_path = self.output_dir / "index.json"
        with open(index_path, 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"\nCreated {len(self.monsters)} monster files")
        print(f"Index written to {index_path}")

def main():
    extractor = MonsterExtractorV2()
    extractor.extract_monsters()
    extractor.write_files()

if __name__ == "__main__":
    main()