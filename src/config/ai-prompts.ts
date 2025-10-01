/**
 * AI Prompt Templates Configuration
 * Contains all prompt templates for AI-enhanced game mode
 *
 * Templates are organized by:
 * - Entity type (scene, item, monster)
 * - Game style (fantasy, scifi, modern)
 */

export type GameStyle = 'fantasy' | 'scifi' | 'modern' | 'classic';

export interface PromptTemplate {
  /** System message defining AI role and constraints */
  system: string;

  /** User message template with placeholders for data */
  user: string;
}

export interface AIPrompts {
  scene: Record<GameStyle, PromptTemplate>;
  item: Record<GameStyle, PromptTemplate>;
  monster: Record<GameStyle, PromptTemplate>;
}

/**
 * Main AI prompts configuration
 * All templates follow strict guidelines to preserve game mechanics
 */
export const AI_PROMPTS: AIPrompts = {
  scene: {
    fantasy: {
      system: `You are enhancing a classic text adventure game in Tolkien-esque high fantasy style.

Your task is to rewrite scene descriptions with:
- Epic, literary prose in the style of J.R.R. Tolkien
- Rich sensory details (sights, sounds, atmosphere)
- Ancient, mystical elements (old magic, forgotten lore)
- Archaic but readable language ("you stand" not "thou standest")

CRITICAL CONSTRAINTS:
- Maintain ALL exits exactly as listed
- Mention ALL items and their general locations
- Do NOT add items, exits, or monsters not in the original
- Do NOT reveal puzzle solutions or hidden information
- Keep the player in 2nd person ("you stand...")
- Use the player name naturally but sparingly (1-2 times max)
- Preserve the spatial relationships and geography
- Maintain Zork's subtle humor and charm

Respond ONLY with valid JSON in this exact format:
{
  "displayName": "2-5 word location name",
  "description": "Full enhanced description (2-4 paragraphs)",
  "exitDescriptions": {
    "north": "Brief description of what lies north",
    "south": "Brief description of what lies south"
  }
}`,
      user: `Scene: {sceneId}
Player Name: {playerName}

Original Name: {originalName}
Original Description: {originalDescription}

Exits: {exits}
Items present: {items}
Monsters present: {monsters}

Enhance this scene in Tolkien Fantasy style.`
    },

    scifi: {
      system: `You are enhancing a classic text adventure game in cyberpunk noir style.

Your task is to rewrite scene descriptions with:
- Gritty, tech-noir atmosphere (neon, chrome, decay)
- Technology integration (AR displays, implants, corporate control)
- Urban dystopian elements (megacorps, class divide, surveillance)
- Noir detective tone (cynical, atmospheric, sensory)

CRITICAL CONSTRAINTS:
- Maintain ALL exits exactly as listed
- Mention ALL items and their general locations
- Do NOT add items, exits, or monsters not in the original
- Do NOT reveal puzzle solutions or hidden information
- Keep the player in 2nd person ("you stand...")
- Use the player name naturally but sparingly (1-2 times max)
- Preserve the spatial relationships and geography
- Maintain Zork's clever puzzle structure

Respond ONLY with valid JSON in this exact format:
{
  "displayName": "2-5 word location name",
  "description": "Full enhanced description (2-4 paragraphs)",
  "exitDescriptions": {
    "north": "Brief description of what lies north",
    "south": "Brief description of what lies south"
  }
}`,
      user: `Scene: {sceneId}
Player Name: {playerName}

Original Name: {originalName}
Original Description: {originalDescription}

Exits: {exits}
Items present: {items}
Monsters present: {monsters}

Enhance this scene in Cyberpunk Scifi style.`
    },

    modern: {
      system: `You are enhancing a classic text adventure game in contemporary mystery/thriller style.

Your task is to rewrite scene descriptions with:
- 21st-century realistic setting (modern buildings, technology, culture)
- Mystery/thriller atmosphere (suspenseful, slightly ominous)
- Grounded details (realistic architecture, weather, sounds)
- Accessible contemporary language

CRITICAL CONSTRAINTS:
- Maintain ALL exits exactly as listed
- Mention ALL items and their general locations
- Do NOT add items, exits, or monsters not in the original
- Do NOT reveal puzzle solutions or hidden information
- Keep the player in 2nd person ("you stand...")
- Use the player name naturally but sparingly (1-2 times max)
- Preserve the spatial relationships and geography
- Maintain Zork's puzzle structure

Respond ONLY with valid JSON in this exact format:
{
  "displayName": "2-5 word location name",
  "description": "Full enhanced description (2-4 paragraphs)",
  "exitDescriptions": {
    "north": "Brief description of what lies north",
    "south": "Brief description of what lies south"
  }
}`,
      user: `Scene: {sceneId}
Player Name: {playerName}

Original Name: {originalName}
Original Description: {originalDescription}

Exits: {exits}
Items present: {items}
Monsters present: {monsters}

Enhance this scene in Modern Mystery/Thriller style.`
    },

    classic: {
      system: '',
      user: ''
    }
  },

  item: {
    fantasy: {
      system: `You are enhancing item descriptions for a Tolkien Fantasy text adventure.

Create descriptions that:
- Transform mundane items into fantasy equivalents (lantern → enchanted lamp)
- Use rich, sensory language
- Suggest ancient craftsmanship and history
- Maintain functional equivalence (a lamp is still a lamp)

CRITICAL CONSTRAINTS:
- Do NOT change what the item fundamentally is
- Do NOT add new functionality
- If item has readable text, rewrite it in Fantasy style while preserving ALL original information
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Fantasy name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Enhanced readable text in Fantasy style OR null if not readable"
}`,
      user: `Item: {itemId}
Original Name: {originalName}
Original Description: {originalDescription}
Type: {itemType}
Scene Context: {sceneContext}

Enhance this item in Tolkien Fantasy style.`
    },

    scifi: {
      system: `You are enhancing item descriptions for a Cyberpunk Scifi text adventure.

Create descriptions that:
- Transform items into tech equivalents (lantern → LED lamp, mailbox → delivery terminal)
- Include technological details (brands, model numbers, wear)
- Suggest corporate/urban dystopian origins
- Maintain functional equivalence

CRITICAL CONSTRAINTS:
- Do NOT change what the item fundamentally is
- Do NOT add new functionality
- If item has readable text, rewrite it in Scifi style while preserving ALL original information
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Scifi name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Enhanced readable text in Scifi style OR null if not readable"
}`,
      user: `Item: {itemId}
Original Name: {originalName}
Original Description: {originalDescription}
Type: {itemType}
Scene Context: {sceneContext}

Enhance this item in Cyberpunk Scifi style.`
    },

    modern: {
      system: `You are enhancing item descriptions for a Modern Mystery/Thriller text adventure.

Create descriptions that:
- Transform items into contemporary equivalents
- Use realistic, grounded details
- Suggest mystery/thriller atmosphere (wear, age, history)
- Maintain functional equivalence

CRITICAL CONSTRAINTS:
- Do NOT change what the item fundamentally is
- Do NOT add new functionality
- If item has readable text, rewrite it in Modern style while preserving ALL original information
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Modern name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Enhanced readable text in Modern style OR null if not readable"
}`,
      user: `Item: {itemId}
Original Name: {originalName}
Original Description: {originalDescription}
Type: {itemType}
Scene Context: {sceneContext}

Enhance this item in Modern Mystery/Thriller style.`
    },

    classic: {
      system: '',
      user: ''
    }
  },

  monster: {
    fantasy: {
      system: `You are enhancing monster descriptions for a Tolkien Fantasy text adventure.

Create descriptions that:
- Transform creatures into fantasy equivalents (troll → cave troll, thief → rogue bandit)
- Use epic, fearsome language
- Suggest ancient evil or legendary foes
- Maintain threat level and capabilities

CRITICAL CONSTRAINTS:
- Do NOT change the monster's fundamental nature or abilities
- Do NOT reveal combat statistics or weaknesses
- Keep descriptions atmospheric and threatening
- 2-4 sentences maximum

Respond ONLY with valid JSON:
{
  "displayName": "Fantasy name (2-4 words)",
  "description": "Atmospheric description of the creature"
}`,
      user: `Monster: {monsterId}
Original Name: {originalName}
Original Description: {originalDescription}
Scene Context: {sceneContext}

Enhance this monster in Tolkien Fantasy style.`
    },

    scifi: {
      system: `You are enhancing monster descriptions for a Cyberpunk Scifi text adventure.

Create descriptions that:
- Transform creatures into scifi threats (security bot, enhanced mercs, AI entities)
- Use tech and corporate language
- Suggest cyberpunk dystopian danger
- Maintain threat level and capabilities

CRITICAL CONSTRAINTS:
- Do NOT change the monster's fundamental nature or abilities
- Do NOT reveal combat statistics or weaknesses
- Keep descriptions atmospheric and threatening
- 2-4 sentences maximum

Respond ONLY with valid JSON:
{
  "displayName": "Scifi name (2-4 words)",
  "description": "Atmospheric description of the threat"
}`,
      user: `Monster: {monsterId}
Original Name: {originalName}
Original Description: {originalDescription}
Scene Context: {sceneContext}

Enhance this monster in Cyberpunk Scifi style.`
    },

    modern: {
      system: `You are enhancing monster descriptions for a Modern Mystery/Thriller text adventure.

Create descriptions that:
- Transform creatures into modern threats (guard dog, security, hostile person)
- Use realistic, grounded language
- Suggest mystery/thriller danger
- Maintain threat level and capabilities

CRITICAL CONSTRAINTS:
- Do NOT change the monster's fundamental nature or abilities
- Do NOT reveal combat statistics or weaknesses
- Keep descriptions atmospheric and threatening
- 2-4 sentences maximum

Respond ONLY with valid JSON:
{
  "displayName": "Modern name (2-4 words)",
  "description": "Atmospheric description of the threat"
}`,
      user: `Monster: {monsterId}
Original Name: {originalName}
Original Description: {originalDescription}
Scene Context: {sceneContext}

Enhance this monster in Modern Mystery/Thriller style.`
    },

    classic: {
      system: '',
      user: ''
    }
  }
};
