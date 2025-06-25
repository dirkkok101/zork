#!/usr/bin/env python3
"""
Zork Monster Extractor
Creates monster definitions based on known Zork creatures
"""

import json
from pathlib import Path

class MonsterExtractor:
    def __init__(self):
        self.output_dir = Path("game_reference")
        
    def create_monsters(self):
        """Create monster definitions for known Zork creatures"""
        print("Creating monster definitions...")
        
        monsters = {
            # Humanoids
            'thief': {
                "id": "thief",
                "name": "nasty knife-wielding thief",
                "type": "humanoid",
                "description": "A suspicious-looking individual, holding a large sack, leaning against one wall. He is armed with a deadly stiletto.",
                "examineText": "This is a suspicious-looking individual of medium build, leaning casually against the wall while watching you with calculating eyes. He holds a large sack that appears to contain various stolen items, and his posture suggests he's ready to move quickly if needed. Most notably, he is armed with a deadly stiletto that glints in the light, which he handles with obvious familiarity. His clothing is dark and practical, designed for stealth and quick movement.",
                "startingSceneId": "living_room",
                "currentSceneId": "living_room",
                "health": 20,
                "maxHealth": 20,
                "state": "WANDERING",
                "inventory": ["stiletto", "stolen_goods"],
                "movementPattern": {
                    "type": "random",
                    "data": {
                        "excludedScenes": ["treasury_of_zork"],
                        "validScenes": ["living_room", "kitchen", "cellar", "attic"]
                    }
                },
                "aggressionLevel": 3,
                "intelligence": 8,
                "specialAbilities": ["steal", "vanish"],
                "weaknesses": ["light"],
                "behaviors": [
                    {
                        "type": "move",
                        "chance": 0.5,
                        "effect": "moveToAdjacentScene"
                    },
                    {
                        "type": "steal",
                        "chance": 0.2,
                        "condition": "playerHasValuableItems && !playerIsWatching",
                        "effect": "stealRandomItem"
                    },
                    {
                        "type": "attack",
                        "chance": 0.1,
                        "condition": "playerAttackedFirst || playerHasThiefTreasure",
                        "effect": "attackPlayer"
                    },
                    {
                        "type": "flee",
                        "chance": 0.8,
                        "condition": "health < 10",
                        "effect": "moveToRandomScene"
                    }
                ],
                "dialogue": [
                    {
                        "trigger": "hello",
                        "response": "The thief glances at you suspiciously but says nothing."
                    },
                    {
                        "trigger": "give",
                        "response": "'Perhaps I might be interested in a trade,' the thief says with a sly grin.",
                        "condition": "playerHasValuableItems"
                    }
                ],
                "onDefeat": {
                    "message": "The thief drops his stiletto and bag, staggering backward. With a final defiant look, he disappears in a cloud of black smoke, leaving behind the items he had stolen.",
                    "dropItems": ["stiletto", "stolen_treasures"],
                    "grantScore": 10
                }
            },
            
            'troll': {
                "id": "troll",
                "name": "nasty troll",
                "type": "creature",
                "description": "A nasty-looking troll, brandishing a bloody axe, blocks all passages out of here.",
                "examineText": "A particularly unpleasant specimen, the troll is about seven feet tall and exceptionally ugly. His skin is a mottled green and covered in warty growths. The troll carries a massive double-bladed axe that appears to have seen frequent use.",
                "startingSceneId": "troll_room",
                "currentSceneId": "troll_room",
                "health": 30,
                "maxHealth": 30,
                "state": "GUARDING",
                "inventory": ["bloody_axe"],
                "movementPattern": {
                    "type": "stationary",
                    "data": {
                        "guardedScenes": ["troll_room"]
                    }
                },
                "aggressionLevel": 8,
                "intelligence": 3,
                "specialAbilities": ["block_passage", "berserker_rage"],
                "weaknesses": ["elvish_sword"],
                "behaviors": [
                    {
                        "type": "guard",
                        "chance": 0.9,
                        "effect": "blockAllExits"
                    },
                    {
                        "type": "attack",
                        "chance": 0.7,
                        "condition": "playerInRoom && !playerHasElvishSword",
                        "effect": "attackWithAxe"
                    },
                    {
                        "type": "flee",
                        "chance": 0.9,
                        "condition": "playerHasElvishSword",
                        "effect": "runAway"
                    }
                ],
                "dialogue": [
                    {
                        "trigger": "hello",
                        "response": "The troll grins maliciously, showing a mouth full of yellowed fangs."
                    }
                ],
                "onDefeat": {
                    "message": "The troll, with a final roar of defiance, falls to the ground and dies.",
                    "dropItems": ["bloody_axe"],
                    "grantScore": 25
                }
            },
            
            'cyclops': {
                "id": "cyclops",
                "name": "one-eyed cyclops",
                "type": "creature", 
                "description": "A cyclops, who looks prepared to eat horse and rider, blocks the stairway.",
                "examineText": "This cyclops is huge, standing nearly twelve feet tall. His single eye glares balefully at you, and his massive hands could easily crush a man. He appears to be quite hungry.",
                "startingSceneId": "cyclops_room",
                "currentSceneId": "cyclops_room",
                "health": 40,
                "maxHealth": 40,
                "state": "GUARDING",
                "inventory": [],
                "movementPattern": {
                    "type": "stationary",
                    "data": {
                        "guardedScenes": ["cyclops_room"]
                    }
                },
                "aggressionLevel": 6,
                "intelligence": 2,
                "specialAbilities": ["eat_player", "massive_strength"],
                "weaknesses": ["hot_food"],
                "behaviors": [
                    {
                        "type": "guard",
                        "chance": 0.8,
                        "effect": "blockStairway"
                    },
                    {
                        "type": "eat",
                        "chance": 0.6,
                        "condition": "playerInRoom && !playerGaveFood",
                        "effect": "eatPlayer"
                    },
                    {
                        "type": "move_aside",
                        "chance": 1.0,
                        "condition": "playerGaveHotFood",
                        "effect": "moveAside"
                    }
                ],
                "dialogue": [
                    {
                        "trigger": "give food",
                        "response": "'Mmm. Just like mom used to make 'em.'",
                        "condition": "hasHotFood"
                    }
                ],
                "onDefeat": {
                    "message": "The cyclops, satisfied by your offering, steps aside to let you pass.",
                    "dropItems": [],
                    "grantScore": 15
                }
            }
        }
        
        # Creatures
        creatures = {
            'grue': {
                "id": "grue",
                "name": "grue",
                "type": "creature",
                "description": "It is pitch black. You are likely to be eaten by a grue.",
                "examineText": "The grue is a sinister, lurking presence in the dark places of the earth. Its favorite diet is adventurers, but its insatiable appetite is tempered by its fear of light. No grue has ever been seen by the light of day, and few have survived its fearsome jaws to tell the tale.",
                "startingSceneId": "dark_room",
                "currentSceneId": "dark_room", 
                "health": 50,
                "maxHealth": 50,
                "state": "LURKING",
                "inventory": [],
                "movementPattern": {
                    "type": "follow",
                    "data": {
                        "onlyInDarkness": True
                    }
                },
                "aggressionLevel": 10,
                "intelligence": 5,
                "specialAbilities": ["darkness_dwelling", "instant_kill"],
                "weaknesses": ["light"],
                "behaviors": [
                    {
                        "type": "lurk",
                        "chance": 0.8,
                        "condition": "roomIsDark && playerInRoom",
                        "effect": "stalkPlayer"
                    },
                    {
                        "type": "attack",
                        "chance": 0.9,
                        "condition": "roomIsDark && playerInRoom && playerMoving",
                        "effect": "eatPlayer"
                    },
                    {
                        "type": "flee",
                        "chance": 1.0,
                        "condition": "roomIsLit",
                        "effect": "vanishIntoShadows"
                    }
                ],
                "dialogue": [
                    {
                        "trigger": "any",
                        "response": "*growling sounds from the darkness*"
                    }
                ],
                "onDefeat": {
                    "message": "The grue shrieks and dissolves into the shadows, defeated by the light.",
                    "dropItems": [],
                    "grantScore": 50
                }
            }
        }
        
        # Combine all monsters
        all_monsters = {**monsters, **creatures}
        
        # Categorize and write files
        categories = {'humanoids': [], 'creatures': [], 'mechanisms': []}
        
        for monster_id, monster_data in all_monsters.items():
            category = 'humanoids' if monster_data['type'] == 'humanoid' else 'creatures'
            filename = f"{category}/{monster_id}.json"
            
            file_path = self.output_dir / "monsters" / filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w') as f:
                json.dump(monster_data, f, indent=2)
            
            categories[category].append(filename)
        
        # Write index file
        index_data = {
            "categories": categories,
            "total": len(all_monsters),
            "lastUpdated": "2024-06-25T00:00:00Z"
        }
        
        with open(self.output_dir / "monsters" / "index.json", 'w') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"Created {len(all_monsters)} monster files")
        return all_monsters

def main():
    extractor = MonsterExtractor()
    monsters = extractor.create_monsters()
    print("Monster extraction complete!")

if __name__ == "__main__":
    main()