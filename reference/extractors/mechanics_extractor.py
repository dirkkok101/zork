#!/usr/bin/env python3
"""
Zork Mechanics Extractor
Creates game mechanics definitions for scoring, treasures, and game systems
"""

import json
from pathlib import Path

class MechanicsExtractor:
    def __init__(self):
        self.output_dir = Path("game_reference")
        
    def create_mechanics(self):
        """Create game mechanics definitions"""
        print("Creating game mechanics definitions...")
        
        # Scoring system based on original Zork
        scoring_system = {
            "treasureValues": {
                "brass_lamp": 5,
                "jeweled_egg": 5,
                "platinum_bar": 10,
                "emerald": 10,
                "ruby": 10,
                "diamond": 10,
                "sapphire": 10,
                "trophy_case": 15,
                "gold_coins": 15,
                "ancient_scroll": 5,
                "crystal_trident": 15,
                "ornate_chalice": 10
            },
            "depositLocation": "trophy_case",
            "depositMultiplier": 2,
            "completionBonus": 50,
            "maxScore": 350,
            "scoringEvents": [
                {
                    "id": "first_treasure",
                    "description": "Finding your first treasure",
                    "points": 5,
                    "oneTime": True
                },
                {
                    "id": "defeat_troll",
                    "description": "Defeating the troll",
                    "points": 25,
                    "oneTime": True
                },
                {
                    "id": "defeat_thief",
                    "description": "Defeating the thief",
                    "points": 10,
                    "oneTime": True
                },
                {
                    "id": "open_trophy_case",
                    "description": "Opening the trophy case",
                    "points": 15,
                    "oneTime": True
                },
                {
                    "id": "solve_maze",
                    "description": "Navigating the maze",
                    "points": 20,
                    "oneTime": True
                },
                {
                    "id": "reach_endgame",
                    "description": "Reaching the final area",
                    "points": 50,
                    "oneTime": True
                }
            ]
        }
        
        # Treasure system
        treasure_system = {
            "totalTreasures": 12,
            "requiredForCompletion": 12,
            "treasureLocations": {
                "brass_lamp": "trophy_case",
                "jeweled_egg": "birds_nest", 
                "platinum_bar": "loud_room",
                "emerald": "bubble_room",
                "ruby": "temple",
                "diamond": "mirror_room",
                "sapphire": "gas_room",
                "gold_coins": "rainbow_room",
                "ancient_scroll": "library",
                "crystal_trident": "atlantis",
                "ornate_chalice": "treasure_room"
            },
            "treasureDescriptions": {
                "brass_lamp": "A battery-powered brass lantern",
                "jeweled_egg": "A large jewel-encrusted egg",
                "platinum_bar": "A heavy platinum bar",
                "emerald": "A beautiful large emerald",
                "ruby": "A magnificent ruby",
                "diamond": "A huge diamond",
                "sapphire": "A brilliant sapphire",
                "gold_coins": "A bag of gold coins",
                "ancient_scroll": "An ancient parchment scroll",
                "crystal_trident": "A crystal trident",
                "ornate_chalice": "An ornate jeweled chalice"
            }
        }
        
        # Death system
        death_system = {
            "maxDeaths": 3,
            "respawnLocation": "forest_1",
            "itemsLostOnDeath": "some",
            "deathPenalty": 10,
            "deathMessages": [
                "It is now pitch black in here. You are likely to be eaten by a grue.",
                "The troll's axe removes your head from your shoulders.",
                "The cyclops finds you quite tasty.",
                "You have died from your injuries."
            ],
            "resurrectionMessages": [
                "You find yourself in a forest clearing, somehow alive again.",
                "A strange force has restored you to life.",
                "You awaken, confused but breathing."
            ]
        }
        
        # Global flags system
        global_flags = {
            "gameFlags": [
                {
                    "id": "trophy_case_open",
                    "name": "Trophy Case Open",
                    "description": "Whether the trophy case has been opened",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "lamp_on",
                    "name": "Lamp On",
                    "description": "Whether the brass lamp is currently lit",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "troll_defeated",
                    "name": "Troll Defeated",
                    "description": "Whether the troll has been defeated",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "thief_defeated",
                    "name": "Thief Defeated", 
                    "description": "Whether the thief has been defeated",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "maze_solved",
                    "name": "Maze Solved",
                    "description": "Whether the player has successfully navigated the maze",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "cyclops_fed",
                    "name": "Cyclops Fed",
                    "description": "Whether the cyclops has been given food",
                    "initialValue": False,
                    "scope": "global"
                },
                {
                    "id": "dam_state",
                    "name": "Dam State",
                    "description": "State of the dam (closed/open)",
                    "initialValue": "closed",
                    "scope": "global"
                }
            ],
            "puzzleDependencies": {
                "open_trophy_case": ["defeat_thief"],
                "cross_troll_room": ["defeat_troll", "have_elvish_sword"],
                "enter_cyclops_room": ["cyclops_fed"],
                "reach_endgame": ["all_treasures_found"],
                "navigate_maze": ["lamp_on"]
            }
        }
        
        # Write all mechanics files
        mechanics_files = {
            "scoring_system.json": scoring_system,
            "treasure_system.json": treasure_system, 
            "death_system.json": death_system,
            "global_flags.json": global_flags
        }
        
        for filename, data in mechanics_files.items():
            file_path = self.output_dir / "mechanics" / filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
        
        # Write index file
        index_data = {
            "files": list(mechanics_files.keys()),
            "total": len(mechanics_files),
            "lastUpdated": "2024-06-25T00:00:00Z"
        }
        
        with open(self.output_dir / "mechanics" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(mechanics_files)} mechanics files")
        return mechanics_files

def main():
    extractor = MechanicsExtractor()
    mechanics = extractor.create_mechanics()
    print("Mechanics extraction complete!")

if __name__ == "__main__":
    main()