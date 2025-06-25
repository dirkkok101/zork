#!/usr/bin/env python3
"""
Zork Interactions Extractor
Creates verb and interaction system definitions
"""

import json
from pathlib import Path

class InteractionsExtractor:
    def __init__(self):
        self.output_dir = Path("game_reference")
        
    def create_interactions(self):
        """Create interaction system definitions"""
        print("Creating interaction system definitions...")
        
        # Core verbs from original Zork
        verbs = {
            "movement": [
                {
                    "id": "go",
                    "primary": "go",
                    "synonyms": ["walk", "move", "travel", "head"],
                    "syntax": ["go <direction>", "go to <location>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["to", "through"]
                },
                {
                    "id": "north",
                    "primary": "north",
                    "synonyms": ["n", "nor"],
                    "syntax": ["north"],
                    "requiresObject": False
                },
                {
                    "id": "south", 
                    "primary": "south",
                    "synonyms": ["s", "sou"],
                    "syntax": ["south"],
                    "requiresObject": False
                },
                {
                    "id": "east",
                    "primary": "east",
                    "synonyms": ["e", "eas"],
                    "syntax": ["east"],
                    "requiresObject": False
                },
                {
                    "id": "west",
                    "primary": "west", 
                    "synonyms": ["w", "wes"],
                    "syntax": ["west"],
                    "requiresObject": False
                },
                {
                    "id": "up",
                    "primary": "up",
                    "synonyms": ["u", "upward", "climb"],
                    "syntax": ["up"],
                    "requiresObject": False
                },
                {
                    "id": "down",
                    "primary": "down",
                    "synonyms": ["d", "downward", "descend"],
                    "syntax": ["down"],
                    "requiresObject": False
                },
                {
                    "id": "enter",
                    "primary": "enter",
                    "synonyms": ["in", "inside"],
                    "syntax": ["enter", "enter <object>"],
                    "requiresObject": False
                },
                {
                    "id": "exit",
                    "primary": "exit",
                    "synonyms": ["out", "outside", "leave"],
                    "syntax": ["exit", "exit <object>"],
                    "requiresObject": False
                }
            ],
            "manipulation": [
                {
                    "id": "take",
                    "primary": "take",
                    "synonyms": ["get", "pick", "grab", "carry"],
                    "syntax": ["take <object>", "pick up <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["up"]
                },
                {
                    "id": "drop",
                    "primary": "drop",
                    "synonyms": ["put", "place", "leave"],
                    "syntax": ["drop <object>", "put down <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["down"]
                },
                {
                    "id": "open",
                    "primary": "open",
                    "synonyms": ["unlock"],
                    "syntax": ["open <object>", "open <object> with <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["with"]
                },
                {
                    "id": "close",
                    "primary": "close",
                    "synonyms": ["shut", "lock"],
                    "syntax": ["close <object>"],
                    "requiresObject": True
                },
                {
                    "id": "turn",
                    "primary": "turn",
                    "synonyms": ["rotate", "twist"],
                    "syntax": ["turn <object>", "turn on <object>", "turn off <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["on", "off"]
                }
            ],
            "examination": [
                {
                    "id": "look",
                    "primary": "look",
                    "synonyms": ["l", "observe", "see"],
                    "syntax": ["look", "look at <object>", "look around"],
                    "requiresObject": False,
                    "requiresPreposition": False,
                    "validPrepositions": ["at", "around", "under", "behind", "in"]
                },
                {
                    "id": "examine",
                    "primary": "examine",
                    "synonyms": ["x", "inspect", "study"],
                    "syntax": ["examine <object>"],
                    "requiresObject": True
                },
                {
                    "id": "search",
                    "primary": "search",
                    "synonyms": ["hunt", "seek"],
                    "syntax": ["search <object>"],
                    "requiresObject": True
                },
                {
                    "id": "read",
                    "primary": "read",
                    "synonyms": [],
                    "syntax": ["read <object>"],
                    "requiresObject": True
                }
            ],
            "interaction": [
                {
                    "id": "attack",
                    "primary": "attack",
                    "synonyms": ["kill", "fight", "hit", "strike"],
                    "syntax": ["attack <object>", "attack <object> with <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["with"]
                },
                {
                    "id": "give",
                    "primary": "give",
                    "synonyms": ["offer", "hand"],
                    "syntax": ["give <object> to <object>"],
                    "requiresObject": True,
                    "requiresPreposition": True,
                    "validPrepositions": ["to"]
                },
                {
                    "id": "throw",
                    "primary": "throw",
                    "synonyms": ["toss", "hurl"],
                    "syntax": ["throw <object>", "throw <object> at <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["at", "to"]
                },
                {
                    "id": "use",
                    "primary": "use",
                    "synonyms": ["operate", "activate"],
                    "syntax": ["use <object>", "use <object> on <object>"],
                    "requiresObject": True,
                    "requiresPreposition": False,
                    "validPrepositions": ["on", "with"]
                }
            ],
            "communication": [
                {
                    "id": "say",
                    "primary": "say",
                    "synonyms": ["speak", "tell"],
                    "syntax": ["say <text>", "say <text> to <object>"],
                    "requiresObject": False,
                    "requiresPreposition": False,
                    "validPrepositions": ["to"]
                },
                {
                    "id": "yell",
                    "primary": "yell", 
                    "synonyms": ["shout", "scream"],
                    "syntax": ["yell", "yell <text>"],
                    "requiresObject": False
                }
            ],
            "utility": [
                {
                    "id": "inventory",
                    "primary": "inventory",
                    "synonyms": ["i", "inv"],
                    "syntax": ["inventory"],
                    "requiresObject": False
                },
                {
                    "id": "score",
                    "primary": "score",
                    "synonyms": [],
                    "syntax": ["score"],
                    "requiresObject": False
                },
                {
                    "id": "save",
                    "primary": "save",
                    "synonyms": [],
                    "syntax": ["save"],
                    "requiresObject": False
                },
                {
                    "id": "restore",
                    "primary": "restore",
                    "synonyms": ["load"],
                    "syntax": ["restore"],
                    "requiresObject": False
                },
                {
                    "id": "quit",
                    "primary": "quit",
                    "synonyms": ["q", "exit"],
                    "syntax": ["quit"],
                    "requiresObject": False
                }
            ]
        }
        
        # Prepositions
        prepositions = {
            "spatial": ["in", "on", "under", "behind", "above", "below", "beside", "near"],
            "directional": ["to", "from", "through", "into", "onto", "toward"],
            "instrumental": ["with", "using", "by"],
            "temporal": ["before", "after", "during"]
        }
        
        # Syntax patterns for parsing
        syntax_patterns = {
            "patterns": [
                {
                    "pattern": "<verb>",
                    "description": "Simple verb with no object",
                    "example": "look"
                },
                {
                    "pattern": "<verb> <object>",
                    "description": "Verb with direct object",
                    "example": "take lamp"
                },
                {
                    "pattern": "<verb> <preposition> <object>",
                    "description": "Verb with prepositional object",
                    "example": "look at lamp"
                },
                {
                    "pattern": "<verb> <object> <preposition> <object>",
                    "description": "Verb with direct and indirect object",
                    "example": "give lamp to thief"
                },
                {
                    "pattern": "<direction>",
                    "description": "Movement command",
                    "example": "north"
                }
            ],
            "articleFilters": ["a", "an", "the", "some", "any"],
            "stopWords": ["and", "but", "or", "then"]
        }
        
        # Write all interaction files
        interaction_files = {
            "verbs.json": verbs,
            "prepositions.json": prepositions,
            "syntax_patterns.json": syntax_patterns
        }
        
        for filename, data in interaction_files.items():
            file_path = self.output_dir / "interactions" / filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
        
        # Write index file
        index_data = {
            "files": list(interaction_files.keys()),
            "total": len(interaction_files),
            "lastUpdated": "2024-06-25T00:00:00Z"
        }
        
        with open(self.output_dir / "interactions" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(interaction_files)} interaction files")
        return interaction_files

def main():
    extractor = InteractionsExtractor()
    interactions = extractor.create_interactions()
    print("Interactions extraction complete!")

if __name__ == "__main__":
    main()