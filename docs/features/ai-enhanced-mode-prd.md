# AI-Enhanced Game Mode - Product Requirements Document

**Version**: 1.0
**Status**: Draft
**Last Updated**: 2025-10-01
**Owner**: Development Team

---

## Executive Summary

### Overview

This PRD defines the AI-Enhanced Game Mode feature for the Zork 1 Text Adventure Game. This feature allows players to experience the classic Zork adventure with AI-generated narrative enhancements that adapt the game's descriptions, items, and monsters to their chosen style (Tolkien Fantasy, Cyberpunk Scifi, or Modern Mystery) while maintaining the original game mechanics and puzzle structure.

### Goals

1. **Personalization**: Create unique, personalized gameplay experiences through player name integration and style-based narrative adaptation
2. **Preservation**: Maintain 100% authentic Zork gameplay mechanics while enhancing narrative presentation
3. **Flexibility**: Offer AI enhancement as an optional mode alongside Classic Mode
4. **Performance**: Deliver smooth gameplay with lazy content generation and intelligent caching
5. **Extensibility**: Build a configurable AI integration foundation for future enhancements

### Non-Goals

- Changing core Zork gameplay mechanics or puzzle solutions
- Dynamic puzzle generation or procedural game content
- Real-time AI dialogue with NPCs
- Multiplayer or social features
- AI-generated images or audio

### Success Metrics

**Qualitative:**
- Players report increased immersion and engagement
- AI-generated content maintains tone consistency with chosen style
- Classic Zork charm and humor preserved across all styles

**Quantitative:**
- Scene expansion completes in < 5 seconds on average
- 95%+ success rate for AI API calls
- Zero game-breaking bugs in enhanced mode
- Save/restore works 100% reliably with enhanced content

**Adoption:**
- Track % of new games using Enhanced vs Classic mode
- Monitor completion rates for enhanced games vs classic

---

## User Experience

### Game Mode Selection

**New Game Flow:**

```
╔═══════════════════════════════════════════════════════════╗
║     ZORK: The Great Underground Empire                   ║
║                                                           ║
║     A Classic Text Adventure                              ║
╚═══════════════════════════════════════════════════════════╝

Choose your adventure:

1. Classic Mode
   Experience the original 1980s Zork exactly as it was written.

2. Enhanced Mode
   AI-powered narrative adaptation with personalized storytelling.

Enter choice (1 or 2): █
```

**If player chooses Enhanced Mode:**

```
╔═══════════════════════════════════════════════════════════╗
║                  Enhanced Mode Setup                      ║
╚═══════════════════════════════════════════════════════════╝

Enter your name: █
```

*(Player enters: Aragorn)*

```
Choose your narrative style:

1. Fantasy
   Tolkien-esque high fantasy with epic prose and ancient magic.

2. Scifi
   Cyberpunk noir with technology, megacorps, and urban decay.

3. Modern
   Contemporary mystery/thriller with realistic 21st-century setting.

Enter choice (1, 2, or 3): █
```

*(Player chooses: 1)*

```
Initializing your fantasy adventure...
Preparing the world for Aragorn...

[Brief pause while initial scene loads]

Press ENTER to begin...
```

### Enhanced Gameplay Experience

**First Scene Visit (with AI expansion):**

```
> look

[Generating enhanced description...]

The Western Fields
══════════════════════════════════════════════════════════

You stand upon verdant grasslands beneath the boughs of ancient
oaks. To the east rises a cottage of whitewashed timber, its
oaken door sealed with weathered planks. A bronze-banded mailbox
rests beside the path, and through a nearby window you glimpse
shadows stirring within.

Obvious exits: north (A forest path), south (The Southern Gardens),
west (Into the wilderness)

Items: mailbox, window

>
```

**Subsequent Visits (cached):**

```
> look

The Western Fields
══════════════════════════════════════════════════════════

You stand upon verdant grasslands beneath the boughs of ancient oaks...
[Same enhanced description, instant display]

>
```

**Item Interaction:**

```
> examine mailbox

[Generating enhanced description...]

A sturdy mailbox wrought of bronze-banded oak, bearing the
crest of the house. Its small door hangs slightly ajar.

> open mailbox

Opening the mailbox reveals a leaflet.

> examine leaflet

[Generating enhanced description...]

An ancient parchment scroll sealed with wax, bearing elegant
script in a forgotten tongue.

> read leaflet

WELCOME TO ZORK!

[Original game text for readable content preserved]
```

### Loading States

**During AI Generation:**

```
> north

[Enhancing scene...]

[2-3 second pause]

The Northern Gardens
═══════════════════════════════════════════════════════════

Ancient stone pathways wind through overgrown gardens...
```

**On AI Failure (fallback to original):**

```
> north

[AI enhancement unavailable - showing original description]

North of House
You are facing the north side of a white house. There is no
door here, and all the windows are boarded up. To the north
a narrow path winds through the trees.

>
```

### Classic Mode Experience

**Classic mode remains completely unchanged:**

```
West of House
You are standing in an open field west of a white house, with
a boarded front door.
There is a small mailbox here.

>
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                                │
│  (Handles mode selection, name/style input, display)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              CommandProcessor                                │
│  (Routes commands, checks for enhanced mode)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
┌─────────▼──────────┐  ┌──────▼────────────────────────────┐
│   GameStateService │  │   AIEnhancementService (NEW)      │
│                    │  │                                    │
│  - playerName      │  │  - expandScene()                  │
│  - gameStyle       │  │  - expandItem()                   │
│  - current scene   │  │  - expandMonster()                │
│  - inventory       │  │  - isExpanded()                   │
│  - flags           │  │                                    │
└─────────┬──────────┘  └──────┬────────────────────────────┘
          │                     │
          │                     ├──→ OpenRouterClient (NEW)
          │                     │    - callGrokAPI()
          │                     │    - handleErrors()
          │                     │
          │                     ├──→ PromptBuilder (NEW)
          │                     │    - buildScenePrompt()
          │                     │    - buildItemPrompt()
          │                     │
          │                     └──→ Config
          ├──────────┬──────────┤       - AI_PROMPTS
          │          │          │       - API settings
┌─────────▼────┐ ┌──▼────┐ ┌───▼──────┐
│ SceneService │ │ Item  │ │ Monster  │
│              │ │Service│ │ Service  │
│ - scenes[]   │ │       │ │          │
│   .expanded  │ │.items│ │.monsters│
│   .name      │ │       │ │          │
│   .desc      │ │       │ │          │
└──────────────┘ └───────┘ └──────────┘
```

### New Service: AIEnhancementService

**Location**: `src/services/AIEnhancementService.ts`

**Interface**:
```typescript
export interface IAIEnhancementService {
  /**
   * Expand a scene with AI-generated content
   * @param sceneId - Scene identifier (e.g., "west_of_house")
   * @param playerName - Player's chosen name
   * @param style - Game style (fantasy, scifi, modern)
   * @returns Promise with expanded scene data
   */
  expandScene(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedScene>;

  /**
   * Expand an item with AI-generated content
   * @param itemId - Item identifier
   * @param sceneContext - Context of current scene for relevance
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Promise with expanded item data
   */
  expandItem(
    itemId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedItem>;

  /**
   * Expand a monster with AI-generated content
   * @param monsterId - Monster identifier
   * @param sceneContext - Context of current scene
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Promise with expanded monster data
   */
  expandMonster(
    monsterId: string,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): Promise<ExpandedMonster>;

  /**
   * Check if an entity has been expanded
   * @param entityId - Entity identifier
   * @param entityType - Type of entity
   * @returns True if already expanded
   */
  isExpanded(
    entityId: string,
    entityType: 'scene' | 'item' | 'monster'
  ): boolean;

  /**
   * Expand all entities in current scene
   * @param sceneId - Scene to expand
   * @param playerName - Player name
   * @param style - Game style
   * @returns Promise with all expanded entities
   */
  expandSceneContext(
    sceneId: string,
    playerName: string,
    style: GameStyle
  ): Promise<SceneContext>;
}

export type GameStyle = 'fantasy' | 'scifi' | 'modern' | 'classic';

export interface ExpandedScene {
  displayName: string;
  description: string;
  exitDescriptions: Record<string, string>; // direction -> description
}

export interface ExpandedItem {
  displayName: string;
  description: string;
  examineText: string;
  readText?: string; // Only for readable items
}

export interface ExpandedMonster {
  displayName: string;
  description: string;
}

export interface SceneContext {
  scene: ExpandedScene;
  items: Record<string, ExpandedItem>;
  monsters: Record<string, ExpandedMonster>;
}
```

**Dependencies**:
- `IGameStateService` - Get current scene, items, monsters
- `ISceneService` - Access scene data for expansion
- `IItemService` - Access item data for expansion
- New `IMonsterService` - Access monster data (needs creation)
- New `OpenRouterClient` - API communication
- New `PromptBuilder` - Construct AI prompts

**Key Methods**:

1. **`expandSceneContext()`** - Main orchestration method called when entering a scene:
   ```typescript
   async expandSceneContext(sceneId, playerName, style) {
     // 1. Check if scene already expanded
     if (this.isExpanded(sceneId, 'scene')) {
       return; // Use cached version
     }

     // 2. Get scene data
     const scene = this.sceneService.getScene(sceneId);
     const items = this.sceneService.getSceneItems(sceneId);
     const monsters = this.sceneService.getSceneMonsters(sceneId);

     // 3. Expand scene (includes exits)
     const expandedScene = await this.expandScene(sceneId, playerName, style);

     // 4. Expand items in scene
     for (const itemId of items) {
       if (!this.isExpanded(itemId, 'item')) {
         await this.expandItem(itemId, scene.description, playerName, style);
       }
     }

     // 5. Expand monsters in scene
     for (const monsterId of monsters) {
       if (!this.isExpanded(monsterId, 'monster')) {
         await this.expandMonster(monsterId, scene.description, playerName, style);
       }
     }

     // 6. Update in-memory objects with expanded content
     this.applyExpansions(sceneId, expandedScene, expandedItems, expandedMonsters);
   }
   ```

2. **`applyExpansions()`** - Overwrites in-memory objects:
   ```typescript
   private applyExpansions(sceneId, expandedScene, items, monsters) {
     // Overwrite scene object
     const scene = this.sceneService.getScene(sceneId);
     scene.name = expandedScene.displayName;
     scene.description = expandedScene.description;
     scene.expanded = true;

     // Update exits with descriptions
     for (const [direction, description] of Object.entries(expandedScene.exitDescriptions)) {
       const exit = scene.exits[direction];
       if (exit) {
         exit.description = description;
       }
     }

     // Overwrite item objects
     for (const [itemId, expandedItem] of Object.entries(items)) {
       const item = this.itemService.getItem(itemId);
       item.name = expandedItem.displayName;
       item.description = expandedItem.description;
       item.examineText = expandedItem.examineText;
       if (expandedItem.readText) {
         item.readText = expandedItem.readText;
       }
       item.expanded = true;
     }

     // Overwrite monster objects
     for (const [monsterId, expandedMonster] of Object.entries(monsters)) {
       const monster = this.monsterService.getMonster(monsterId);
       monster.name = expandedMonster.displayName;
       monster.description = expandedMonster.description;
       monster.expanded = true;
     }
   }
   ```

### New Client: OpenRouterClient

**Location**: `src/clients/OpenRouterClient.ts`

**Purpose**: Handle all communication with OpenRouter API

```typescript
export interface IOpenRouterClient {
  /**
   * Call OpenRouter API with Grok model
   * @param messages - Chat messages for the API
   * @returns Promise with API response
   */
  callAPI(messages: ChatMessage[]): Promise<string>;

  /**
   * Check if API is configured correctly
   * @returns True if API key exists
   */
  isConfigured(): boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenRouterClient implements IOpenRouterClient {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  private model = 'x-ai/grok-2-1212'; // Grok model identifier

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found in environment variables');
    }
  }

  async callAPI(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/yourusername/zork', // Required by OpenRouter
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('OpenRouter API call failed:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
}
```

### New Utility: PromptBuilder

**Location**: `src/utils/PromptBuilder.ts`

**Purpose**: Construct AI prompts from configurable templates

```typescript
export class PromptBuilder {
  /**
   * Build scene expansion prompt
   */
  static buildScenePrompt(
    scene: Scene,
    playerName: string,
    style: GameStyle,
    items: Item[],
    monsters: Monster[]
  ): ChatMessage[] {
    const config = AI_PROMPTS.scene[style];

    return [
      {
        role: 'system',
        content: config.system.replace('{style}', this.getStyleName(style))
      },
      {
        role: 'user',
        content: config.user
          .replace('{sceneId}', scene.id)
          .replace('{playerName}', playerName)
          .replace('{originalName}', scene.name)
          .replace('{originalDescription}', scene.description)
          .replace('{exits}', this.formatExits(scene.exits))
          .replace('{items}', this.formatItems(items))
          .replace('{monsters}', this.formatMonsters(monsters))
      }
    ];
  }

  /**
   * Build item expansion prompt
   */
  static buildItemPrompt(
    item: Item,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): ChatMessage[] {
    const config = AI_PROMPTS.item[style];

    return [
      {
        role: 'system',
        content: config.system.replace('{style}', this.getStyleName(style))
      },
      {
        role: 'user',
        content: config.user
          .replace('{itemId}', item.id)
          .replace('{originalName}', item.name)
          .replace('{originalDescription}', item.description)
          .replace('{itemType}', item.type)
          .replace('{sceneContext}', sceneContext)
          .replace('{playerName}', playerName)
      }
    ];
  }

  // Helper methods
  private static getStyleName(style: GameStyle): string {
    const names = {
      fantasy: 'Tolkien-esque high fantasy',
      scifi: 'Cyberpunk noir',
      modern: 'Contemporary mystery/thriller'
    };
    return names[style] || style;
  }

  private static formatExits(exits: Record<string, Exit>): string {
    return Object.keys(exits).join(', ');
  }

  private static formatItems(items: Item[]): string {
    return items.map(i => i.name).join(', ');
  }

  private static formatMonsters(monsters: Monster[]): string {
    return monsters.map(m => m.name).join(', ');
  }
}
```

---

## AI Integration

### OpenRouter Configuration

**Environment Variables**:

```bash
# .env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx

# Optional configuration
OPENROUTER_MODEL=x-ai/grok-2-1212  # Default Grok model
OPENROUTER_TIMEOUT=10000           # Request timeout in ms
OPENROUTER_MAX_RETRIES=2           # Retry failed requests
```

**API Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Model**: `x-ai/grok-2-1212` (Grok 2)

**Request Format**:
```json
{
  "model": "x-ai/grok-2-1212",
  "messages": [
    {
      "role": "system",
      "content": "You are enhancing a classic text adventure in Tolkien Fantasy style..."
    },
    {
      "role": "user",
      "content": "Enhance this scene: [scene data]"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Expected Response Format** (JSON string in content):
```json
{
  "displayName": "The Western Fields",
  "description": "You stand upon verdant grasslands...",
  "exitDescriptions": {
    "north": "A winding path leads through ancient woods",
    "south": "Stone steps descend to terraced gardens"
  }
}
```

### AI Prompt Templates

**Location**: `src/config/ai-prompts.ts`

**Structure**:
```typescript
export interface PromptTemplate {
  system: string;  // System message defining AI role/constraints
  user: string;    // User message with placeholders for data
}

export interface AIPrompts {
  scene: Record<GameStyle, PromptTemplate>;
  item: Record<GameStyle, PromptTemplate>;
  monster: Record<GameStyle, PromptTemplate>;
}

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
- Preserve readable text EXACTLY if it exists
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Fantasy name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Original readable text OR null if not readable"
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
- Preserve readable text EXACTLY if it exists
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Scifi name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Original readable text OR null if not readable"
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
- Preserve readable text EXACTLY if it exists
- Keep descriptions concise (2-4 sentences for description, 3-5 for examine)

Respond ONLY with valid JSON:
{
  "displayName": "Modern name (2-4 words)",
  "description": "Brief description when mentioned",
  "examineText": "Detailed description when examined",
  "readText": "Original readable text OR null if not readable"
}`,
      user: `Item: {itemId}
Original Name: {originalName}
Original Description: {originalDescription}
Type: {itemType}
Scene Context: {sceneContext}

Enhance this item in Modern Mystery/Thriller style.`
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
    }
  }
};
```

### Error Handling & Fallback Strategy

**Error Categories:**

1. **API Configuration Errors** (Missing API key):
   ```typescript
   if (!apiKey) {
     console.warn('AI features disabled: OPENROUTER_API_KEY not configured');
     // Fall back to classic mode automatically
     return originalContent;
   }
   ```

2. **Network Errors** (Connection failed, timeout):
   ```typescript
   try {
     const response = await openRouterClient.callAPI(messages);
   } catch (error) {
     console.error('AI API call failed:', error);
     // Use original Zork text
     return {
       displayName: scene.name,  // Original name
       description: scene.description,  // Original description
       exitDescriptions: {}  // No enhanced exits
     };
   }
   ```

3. **API Errors** (Rate limit, quota exceeded, 500 errors):
   ```typescript
   if (response.status === 429) {
     console.warn('Rate limit hit, using original content');
     return originalContent;
   }

   if (response.status >= 500) {
     console.error('OpenRouter server error');
     return originalContent;
   }
   ```

4. **Content Errors** (Invalid JSON, missing fields):
   ```typescript
   try {
     const enhanced = JSON.parse(aiResponse);

     // Validate required fields
     if (!enhanced.displayName || !enhanced.description) {
       throw new Error('Invalid AI response: missing required fields');
     }

     return enhanced;

   } catch (error) {
     console.error('Failed to parse AI response:', error);
     return originalContent;
   }
   ```

**User Feedback on Errors**:

```
> north

[AI enhancement unavailable - showing original description]

North of House
You are facing the north side of a white house...

>
```

**Retry Strategy**:
- **No automatic retries** for performance reasons
- Failed expansions use original content
- Entity remains marked as `expanded: false`
- **Optional**: Could retry on next visit to scene (future enhancement)

---

## Data Model Changes

### Scene Object Modifications

**Before (Original)**:
```typescript
interface Scene {
  id: string;                    // "west_of_house"
  name: string;                  // "West of House"
  description: string;           // "You are standing in an open field..."
  exits: Record<string, Exit>;   // { north: {...}, south: {...} }
  items: string[];               // ["mailbox", "window"]
  lighting: LightingLevel;
  // ... other properties
}

interface Exit {
  direction: string;   // "north"
  to: string;         // "north_of_house"
  condition?: string; // Optional condition
}
```

**After (Enhanced)**:
```typescript
interface Scene {
  id: string;                    // "west_of_house" (UNCHANGED - internal ID)
  name: string;                  // "The Western Fields" (OVERWRITTEN by AI)
  description: string;           // "You stand upon verdant..." (OVERWRITTEN by AI)
  exits: Record<string, Exit>;
  items: string[];
  lighting: LightingLevel;
  expanded?: boolean;            // NEW - tracks if AI-enhanced
  // ... other properties
}

interface Exit {
  direction: string;
  to: string;
  condition?: string;
  description?: string;          // NEW - AI-generated exit flavor text
}
```

### Item Object Modifications

**Before**:
```typescript
interface Item {
  id: string;           // "brass_lantern"
  name: string;         // "brass lantern"
  description: string;  // "A brass lantern..."
  examineText: string;  // "The lantern is..."
  readText?: string;    // Optional readable text
  type: ItemType;
  // ... other properties
}
```

**After**:
```typescript
interface Item {
  id: string;           // "brass_lantern" (UNCHANGED - internal ID)
  name: string;         // "Lamp of Fëanor" (OVERWRITTEN by AI)
  description: string;  // "An ancient bronze lamp..." (OVERWRITTEN)
  examineText: string;  // "Crafted in elder days..." (OVERWRITTEN)
  readText?: string;    // Preserved EXACTLY as original
  type: ItemType;       // UNCHANGED
  expanded?: boolean;   // NEW - tracks if AI-enhanced
  // ... other properties
}
```

**Important**: `readText` is NEVER modified by AI - original Zork text preserved.

### Monster Object Modifications

**Before**:
```typescript
interface Monster {
  id: string;           // "troll"
  name: string;         // "troll"
  description: string;  // "A nasty-looking troll..."
  combatStrength: number;
  // ... other properties
}
```

**After**:
```typescript
interface Monster {
  id: string;           // "troll" (UNCHANGED)
  name: string;         // "Cave Troll of Moria" (OVERWRITTEN)
  description: string;  // "A massive creature..." (OVERWRITTEN)
  combatStrength: number; // UNCHANGED - mechanics preserved
  expanded?: boolean;   // NEW - tracks if AI-enhanced
  // ... other properties
}
```

### GameState Modifications

**Before**:
```typescript
interface GameState {
  currentScene: string;           // "west_of_house"
  inventory: string[];            // ["brass_lantern"]
  flags: Record<string, boolean>; // Game flags
  score: number;
  moves: number;
  visitedScenes: string[];
  // ... other state
}
```

**After**:
```typescript
interface GameState {
  currentScene: string;
  inventory: string[];
  flags: Record<string, boolean>;
  score: number;
  moves: number;
  visitedScenes: string[];

  // NEW: AI Enhancement state
  playerName?: string;            // "Aragorn" or undefined for classic
  gameStyle?: GameStyle;          // "fantasy" | "scifi" | "modern" | "classic"

  // Note: No separate expansion tracking needed -
  // entities track their own `expanded` flag
}

type GameStyle = 'fantasy' | 'scifi' | 'modern' | 'classic';
```

### Save File Format

**Enhanced Mode Save**:
```json
{
  "version": "2.0",
  "mode": "enhanced",
  "playerName": "Aragorn",
  "gameStyle": "fantasy",
  "timestamp": 1696118400000,
  "gameState": {
    "currentScene": "west_of_house",
    "inventory": ["brass_lantern"],
    "score": 10,
    "moves": 5,
    "flags": {
      "mailbox_opened": true,
      "window_broken": false
    },
    "visitedScenes": ["west_of_house", "behind_house"]
  },
  "expandedScenes": [
    {
      "id": "west_of_house",
      "name": "The Western Fields",
      "description": "You stand upon verdant grasslands...",
      "exits": {
        "north": {
          "to": "north_of_house",
          "description": "A winding path through ancient woods"
        }
      }
    }
  ],
  "expandedItems": [
    {
      "id": "brass_lantern",
      "name": "Lamp of Fëanor",
      "description": "An ancient bronze lamp...",
      "examineText": "Crafted in elder days..."
    }
  ],
  "expandedMonsters": []
}
```

**Classic Mode Save** (unchanged):
```json
{
  "version": "1.0",
  "mode": "classic",
  "timestamp": 1696118400000,
  "gameState": {
    "currentScene": "west_of_house",
    "inventory": ["brass_lantern"],
    "score": 10,
    "moves": 5,
    "flags": {...},
    "visitedScenes": [...]
  }
}
```

**Restoration Logic**:
```typescript
restoreGame(saveData: SaveData): void {
  // 1. Restore base game state
  this.gameState.setGameState(saveData.gameState);

  // 2. If enhanced mode, restore AI content
  if (saveData.mode === 'enhanced') {
    this.gameState.playerName = saveData.playerName;
    this.gameState.gameStyle = saveData.gameStyle;

    // Apply expanded content to in-memory objects
    for (const expandedScene of saveData.expandedScenes) {
      const scene = this.sceneService.getScene(expandedScene.id);
      scene.name = expandedScene.name;
      scene.description = expandedScene.description;
      scene.expanded = true;
      // ... apply exits, etc.
    }

    for (const expandedItem of saveData.expandedItems) {
      const item = this.itemService.getItem(expandedItem.id);
      item.name = expandedItem.name;
      item.description = expandedItem.description;
      item.examineText = expandedItem.examineText;
      item.expanded = true;
    }

    // Same for monsters...
  }
}
```

---

## Content Expansion Specifications

### Scene Expansion

**Input to AI**:
```typescript
{
  sceneId: "west_of_house",
  originalName: "West of House",
  originalDescription: "You are standing in an open field west of a white house, with a boarded front door.",
  exits: ["north", "south", "west"],
  items: ["mailbox", "window"],
  monsters: [],
  playerName: "Aragorn",
  style: "fantasy"
}
```

**Expected Output** (Fantasy style):
```json
{
  "displayName": "The Western Fields",
  "description": "You stand upon verdant grasslands beneath the boughs of ancient oaks, their leaves whispering secrets of ages long past. To the east rises a cottage of whitewashed timber, its surface weathered by countless seasons. Oaken planks bar the great door, bound with iron fittings gone to rust. A bronze-banded mailbox rests beside a worn stone path, and through a nearby window you glimpse shadows stirring in the dim interior.",
  "exitDescriptions": {
    "north": "A winding path leads through the forest's edge",
    "south": "Stone steps descend toward ancient gardens",
    "west": "The grasslands stretch into untamed wilderness"
  }
}
```

**Expected Output** (Scifi style):
```json
{
  "displayName": "Sector W-1 Perimeter",
  "description": "Your AR display marks this location as Sector W-1, a neglected lot overgrown with drought-resistant grass. To your east stands a prefab habitat structure, its white polymer panels stained by acid rain and corporate neglect. Someone's welded reinforced plating across the main access port—corporate security or squatters, hard to say. A dented delivery terminal leans at an odd angle, its status LED blinking amber. Through a cracked window you detect thermal signatures moving inside.",
  "exitDescriptions": {
    "north": "A cracked sidewalk leads toward the residential blocks",
    "south": "Access stairs descend to the lower terrace",
    "west": "The lot extends into the city's edge-zone"
  }
}
```

**Expected Output** (Modern style):
```json
{
  "displayName": "West Side Lot",
  "description": "You stand in an overgrown lot west of an abandoned white house, weeds pushing through cracks in what was once a gravel driveway. The house looks like it's been empty for months—maybe years. Someone's nailed plywood sheets across the front door, weathered gray by rain. An old rural mailbox leans beside the path, its red flag hanging at a broken angle. Through a grimy window, you swear you see movement inside, though it's probably just shadows.",
  "exitDescriptions": {
    "north": "A dirt path winds through overgrown trees",
    "south": "Flagstone steps lead down to what might have been a garden",
    "west": "The lot extends into empty fields"
  }
}
```

**Validation Rules**:
- `displayName` must be 2-5 words
- `description` must be 100-300 words (2-4 paragraphs)
- Must mention ALL items from original scene
- Must NOT add items, exits, or monsters
- `exitDescriptions` must have entries for ALL exits
- Exit descriptions should be brief (5-15 words each)

### Item Expansion

**Input to AI**:
```typescript
{
  itemId: "brass_lantern",
  originalName: "brass lantern",
  originalDescription: "A brass lantern is here.",
  originalExamineText: "The brass lantern is a bit tarnished but seems to work.",
  itemType: "LIGHT_SOURCE",
  sceneContext: "You stand upon verdant grasslands...",
  playerName: "Aragorn",
  style: "fantasy"
}
```

**Expected Output** (Fantasy):
```json
{
  "displayName": "Lamp of Fëanor",
  "description": "An ancient bronze lamp wrought in elder days.",
  "examineText": "The lamp bears intricate Elvish runes along its base, and though tarnished with age, the craftsmanship suggests it was made by skilled hands. The flame chamber is clean, and the wick appears serviceable. It will provide light in dark places.",
  "readText": null
}
```

**Expected Output** (Scifi):
```json
{
  "displayName": "LED Work Lamp",
  "description": "An industrial LED lamp with a worn Weyland-Corp logo.",
  "examineText": "The lamp is a standard-issue Weyland-Corp industrial model, probably twenty years old. The LED array is scratched but functional, and the battery indicator shows a decent charge. The housing is dented and the corporate logo half-scraped off, but it'll still light your way.",
  "readText": null
}
```

**Expected Output** (Modern):
```json
{
  "displayName": "Old Camping Lantern",
  "description": "A tarnished brass camping lantern.",
  "examineText": "The lantern looks like something from your grandfather's camping gear—brass, heavy, old-fashioned. It's tarnished and dented, but the glass is intact and the wick looks usable. You'd need fuel, but it would probably work.",
  "readText": null
}
```

**Consistency Model**:
- First expansion of an item is cached
- Same expanded version used across ALL scenes
- Example: If "brass lantern" becomes "Lamp of Fëanor" in fantasy mode, it's ALWAYS "Lamp of Fëanor"
- No context-specific variations per scene (trade-off: consistency > contextual richness)

### Monster Expansion

**Input to AI**:
```typescript
{
  monsterId: "troll",
  originalName: "troll",
  originalDescription: "A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.",
  sceneContext: "Dark and shadowy tunnel...",
  playerName: "Aragorn",
  style: "fantasy"
}
```

**Expected Output** (Fantasy):
```json
{
  "displayName": "Cave Troll of Moria",
  "description": "A massive troll looms before you, its grey-green hide scarred by countless battles. In one massive fist it clutches a gore-stained war-axe, and its eyes gleam with malicious cunning. The creature blocks all escape, filling the passage with its hulking form."
}
```

**Expected Output** (Scifi):
```json
{
  "displayName": "Security Enforcer Unit",
  "description": "A hulking enforcement cyborg blocks your path, its chrome-plated chassis pitted and scarred. One mechanical arm terminates in a wicked-looking plasma cutter, still dripping with coolant—or something darker. Its optical sensors track your every movement, and its bulk completely seals the corridor."
}
```

**Expected Output** (Modern):
```json
{
  "displayName": "Armed Guard",
  "description": "A massive security guard blocks the hallway, gripping a bloody fire axe in both hands. His eyes are cold, calculating, and he's positioned himself to cut off all escape routes. This isn't someone you want to cross."
}
```

### Player Name Personalization

**Usage Pattern** (Style C - Natural Integration):

**In Scene Descriptions** (sparingly - 1-2 times max):
```
Fantasy: "You, Aragorn, stand upon verdant grasslands..."
Scifi: "Your ID reads 'Cipher' on the AR overlay as you survey Sector W-1..."
Modern: "You pause in the lot, [Name], trying to shake the uneasy feeling..."
```

**In NPC/Monster Dialogue** (when relevant):
```
> examine troll

The Cave Troll of Moria roars, "Another thief seeking passage, Aragorn?
None shall pass while I guard this hall!"
```

**In System Messages** (rarely):
```
> save

Game saved for Aragorn - Fantasy Adventure
```

**Rules**:
- Use name 1-2 times per scene description maximum
- Natural, not forced ("You, [Name]," vs awkward insertions)
- More common in NPC dialogue and special events
- Never in item/monster descriptions (they don't know player name)

---

## Implementation Phases

### Phase 1: MVP (Core AI Enhancement)

**Scope**: Basic AI integration with scene expansion

**Deliverables**:
1. ✅ **New Game UI**
   - Mode selection (Classic vs Enhanced)
   - Name input
   - Style selection (Fantasy, Scifi, Modern)

2. ✅ **OpenRouter Integration**
   - `OpenRouterClient` service
   - Environment variable configuration
   - Error handling and fallback

3. ✅ **AIEnhancementService**
   - `expandScene()` method
   - `expandItem()` method
   - `expandMonster()` method
   - `expandSceneContext()` orchestration
   - In-memory object overwriting

4. ✅ **AI Prompt System**
   - Configurable prompts in `src/config/ai-prompts.ts`
   - `PromptBuilder` utility
   - Templates for all 3 styles × 3 entity types

5. ✅ **Data Model Updates**
   - Add `expanded` flag to Scene, Item, Monster
   - Add `description` to Exit
   - Add `playerName` and `gameStyle` to GameState

6. ✅ **Scene Entry Logic**
   - Hook into scene navigation
   - Call `expandSceneContext()` on first visit
   - Display loading state during generation
   - Handle errors gracefully

7. ✅ **Save/Restore**
   - Serialize expanded content
   - Restore expanded content on load
   - Version save files (v2.0 for enhanced)

8. ✅ **Classic Mode Preservation**
   - Classic mode bypasses all AI logic
   - No changes to classic gameplay

**Acceptance Criteria**:
- [ ] User can select Enhanced Mode and input name/style
- [ ] Scenes expand with AI on first visit
- [ ] Items in scene expand with AI
- [ ] Monsters in scene expand with AI
- [ ] Expanded content cached (instant on revisit)
- [ ] AI failures fall back to original text gracefully
- [ ] Save/restore works with enhanced content
- [ ] Classic mode unchanged
- [ ] No performance degradation in Classic mode

**Estimated Timeline**: 3-4 weeks

**Dependencies**:
- OpenRouter API access
- Grok model availability
- Environment variable configuration

### Phase 2: Polish & Enhancement (Future)

**Potential Features**:
1. **Exit Display Enhancement**
   - Show exit descriptions in scene output
   - Format: "Exits: north (A winding path), south (Stone steps)"

2. **Regeneration Options**
   - Allow player to request content regeneration
   - Command: `regenerate scene` or `regen`

3. **Content Quality**
   - Add content validation (profanity filter, coherence check)
   - Retry failed generations automatically

4. **Performance Optimization**
   - Pre-generate starting area scenes
   - Parallel API calls for items/monsters
   - Caching across game sessions

5. **Additional Styles**
   - Horror (Lovecraftian)
   - Comedy (Terry Pratchett)
   - Historical (Victorian, Medieval)
   - User-defined custom styles

6. **Advanced Personalization**
   - Dynamic NPC reactions based on player history
   - Personalized combat messages
   - Player-specific lore generation

7. **Analytics**
   - Track AI generation success/failure rates
   - Monitor response times
   - Content quality feedback mechanism

**Not Planned**:
- AI-generated puzzles (breaks authenticity)
- Dynamic game mechanics
- Procedural content beyond descriptions
- Image/audio generation

---

## Testing Strategy

### Unit Tests

**AIEnhancementService Tests**:
```typescript
describe('AIEnhancementService', () => {
  describe('expandScene', () => {
    it('should call OpenRouter API with correct prompt', async () => {
      const mockClient = createMockOpenRouterClient();
      const service = new AIEnhancementService(mockClient, ...);

      await service.expandScene('west_of_house', 'Aragorn', 'fantasy');

      expect(mockClient.callAPI).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' })
        ])
      );
    });

    it('should parse JSON response correctly', async () => {
      const mockResponse = JSON.stringify({
        displayName: "The Western Fields",
        description: "You stand upon...",
        exitDescriptions: { north: "A path..." }
      });

      const result = await service.expandScene('west_of_house', 'Aragorn', 'fantasy');

      expect(result.displayName).toBe("The Western Fields");
      expect(result.description).toContain("stand upon");
    });

    it('should fallback to original on API failure', async () => {
      const mockClient = createFailingClient();
      const service = new AIEnhancementService(mockClient, ...);

      const result = await service.expandScene('west_of_house', 'Aragorn', 'fantasy');

      expect(result.displayName).toBe("West of House"); // Original
      expect(result.description).toContain("open field"); // Original
    });
  });

  describe('isExpanded', () => {
    it('should return true for expanded entities', () => {
      const scene = { id: 'test', expanded: true };
      expect(service.isExpanded('test', 'scene')).toBe(true);
    });

    it('should return false for non-expanded entities', () => {
      const scene = { id: 'test', expanded: false };
      expect(service.isExpanded('test', 'scene')).toBe(false);
    });
  });
});
```

**OpenRouterClient Tests**:
```typescript
describe('OpenRouterClient', () => {
  it('should make correct API call', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'test response' } }]
      })
    });

    const client = new OpenRouterClient();
    const result = await client.callAPI([
      { role: 'system', content: 'test' }
    ]);

    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });

  it('should handle rate limiting', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    const client = new OpenRouterClient();

    await expect(client.callAPI([{ role: 'user', content: 'test' }]))
      .rejects.toThrow('OpenRouter API error');
  });
});
```

**PromptBuilder Tests**:
```typescript
describe('PromptBuilder', () => {
  it('should build scene prompt with all placeholders replaced', () => {
    const scene = createMockScene('west_of_house');
    const messages = PromptBuilder.buildScenePrompt(
      scene, 'Aragorn', 'fantasy', [], []
    );

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Tolkien');
    expect(messages[1].content).toContain('Aragorn');
    expect(messages[1].content).toContain('west_of_house');
  });

  it('should format exits correctly', () => {
    const scene = createMockScene('test', {
      exits: { north: {...}, south: {...}, west: {...} }
    });

    const messages = PromptBuilder.buildScenePrompt(scene, 'Test', 'fantasy', [], []);

    expect(messages[1].content).toContain('north, south, west');
  });
});
```

### Integration Tests

**Scene Expansion Integration**:
```typescript
describe('Scene Expansion Integration', () => {
  let testEnv: IntegrationTestEnvironment;

  beforeEach(async () => {
    // Use mock AI client for integration tests
    const mockClient = createMockOpenRouterClient();
    testEnv = await IntegrationTestFactory.createEnhancedTestEnvironment(mockClient);
  });

  it('should expand scene on first visit', async () => {
    testEnv.services.gameState.playerName = 'Aragorn';
    testEnv.services.gameState.gameStyle = 'fantasy';

    // Move to scene
    const result = testEnv.commandProcessor.processCommand('look');

    // Verify expansion occurred
    const scene = testEnv.services.scene.getCurrentScene();
    expect(scene.expanded).toBe(true);
    expect(scene.name).not.toBe('West of House'); // Should be enhanced
    expect(result.message).toContain('verdant'); // Fantasy style
  });

  it('should use cached expansion on revisit', async () => {
    // First visit
    testEnv.commandProcessor.processCommand('look');
    const firstCallCount = mockClient.callAPI.mock.calls.length;

    // Move away and back
    testEnv.commandProcessor.processCommand('north');
    testEnv.commandProcessor.processCommand('south');

    // Verify no new API calls
    expect(mockClient.callAPI.mock.calls.length).toBe(firstCallCount);
  });
});
```

**Save/Restore Integration**:
```typescript
describe('Enhanced Mode Save/Restore', () => {
  it('should save and restore expanded content', async () => {
    // Setup enhanced game
    testEnv.services.gameState.playerName = 'Aragorn';
    testEnv.services.gameState.gameStyle = 'fantasy';

    // Expand a scene
    testEnv.commandProcessor.processCommand('look');
    const expandedName = testEnv.services.scene.getCurrentScene().name;

    // Save game
    testEnv.commandProcessor.processCommand('save');

    // Reset and restore
    testEnv = await IntegrationTestFactory.createEnhancedTestEnvironment();
    testEnv.commandProcessor.processCommand('restore');

    // Verify expanded content restored
    const restoredScene = testEnv.services.scene.getCurrentScene();
    expect(restoredScene.name).toBe(expandedName);
    expect(restoredScene.expanded).toBe(true);
  });
});
```

### Mock AI Strategy

**For Unit and Integration Tests**:

```typescript
// testing/mocks/MockOpenRouterClient.ts
export class MockOpenRouterClient implements IOpenRouterClient {
  private responses: Map<string, string> = new Map();

  constructor() {
    // Pre-load mock responses for common scenes
    this.responses.set('west_of_house', JSON.stringify({
      displayName: "The Western Fields",
      description: "Mock enhanced description for testing...",
      exitDescriptions: {
        north: "A mock path north",
        south: "A mock path south"
      }
    }));

    this.responses.set('brass_lantern', JSON.stringify({
      displayName: "Lamp of Testing",
      description: "A mock lamp description",
      examineText: "Mock examine text"
    }));
  }

  async callAPI(messages: ChatMessage[]): Promise<string> {
    // Extract entity ID from prompt (simple parsing)
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    for (const [id, response] of this.responses.entries()) {
      if (userMessage.includes(id)) {
        return response;
      }
    }

    // Default mock response
    return JSON.stringify({
      displayName: "Mock Entity",
      description: "Mock description"
    });
  }

  isConfigured(): boolean {
    return true;
  }
}
```

**Benefits**:
- No API costs during testing
- Deterministic test results
- Fast test execution
- Full control over responses

**For Manual Testing** (Optional):
- Use actual Grok API with test API key
- Record real responses for mock data
- Validate prompt quality

---

## Edge Cases & Error Handling

### API Failure Scenarios

| Scenario | Handling | User Experience |
|----------|----------|-----------------|
| **Missing API Key** | Skip AI enhancement, use classic mode | Silently fall back to classic |
| **Network Timeout** | Retry once, then fallback | Show "[AI unavailable]" prefix |
| **Rate Limit (429)** | Use original text, log warning | Show "[AI unavailable]" prefix |
| **Server Error (500)** | Use original text, log error | Show "[AI unavailable]" prefix |
| **Invalid JSON Response** | Parse error, use original text | Show original text seamlessly |
| **Missing Required Fields** | Validation error, use original | Show original text seamlessly |
| **Empty Response** | Use original text | Show original text seamlessly |

### Content Quality Issues

| Issue | Detection | Mitigation |
|-------|-----------|------------|
| **Offensive Content** | (Future) Content filter | Regenerate or use original |
| **Inconsistent Exits** | Validate exit names match | Log error, use original |
| **Added Items** | Compare item lists | Log warning, use original |
| **Broken Puzzles** | Manual QA testing | Update prompts, regenerate |
| **Name Too Long** | Check length > 50 chars | Truncate or use original |
| **Description Too Short** | Check length < 50 chars | Use original |

### Save File Compatibility

| Scenario | Handling |
|----------|----------|
| **Load Classic save in Enhanced mode** | Allow - start expanding on-demand |
| **Load Enhanced save in Classic mode** | Show warning, offer conversion to classic |
| **Load Fantasy save, switch to Scifi** | Not allowed - style locked to save file |
| **Load v1.0 save in v2.0** | Upgrade to v2.0 format, default to classic mode |
| **Corrupted enhanced content** | Fall back to original text for corrupted entities |

### Multi-Session Consistency

**Problem**: Same item may be expanded differently in different game sessions

**Solution**:
- Item expansions cached per save file
- First expansion is permanent for that save
- Different saves can have different expansions

**Example**:
```
Save File A (Fantasy):
  brass_lantern → "Lamp of Fëanor"

Save File B (Scifi):
  brass_lantern → "LED Work Lamp"

Both are correct - different games, different expansions
```

---

## Technical Specifications

### API Configuration

**Environment Variables**:
```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# Optional (with defaults)
OPENROUTER_MODEL=x-ai/grok-2-1212
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT=10000
OPENROUTER_MAX_TOKENS=1000
OPENROUTER_TEMPERATURE=0.7
```

**OpenRouter Request Spec**:
```typescript
interface OpenRouterRequest {
  model: string;                    // "x-ai/grok-2-1212"
  messages: ChatMessage[];
  temperature?: number;             // 0.7 default
  max_tokens?: number;              // 1000 default
  top_p?: number;                   // Optional
  frequency_penalty?: number;       // Optional
  presence_penalty?: number;        // Optional
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**OpenRouter Response Spec**:
```typescript
interface OpenRouterResponse {
  id: string;
  model: string;
  choices: [
    {
      message: {
        role: 'assistant';
        content: string;              // JSON string to parse
      };
      finish_reason: string;
    }
  ];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Service Interfaces

**IAIEnhancementService** (complete interface in Technical Architecture section)

**IOpenRouterClient**:
```typescript
export interface IOpenRouterClient {
  callAPI(messages: ChatMessage[]): Promise<string>;
  isConfigured(): boolean;
}
```

**IPromptBuilder** (utility, not a service):
```typescript
export class PromptBuilder {
  static buildScenePrompt(
    scene: Scene,
    playerName: string,
    style: GameStyle,
    items: Item[],
    monsters: Monster[]
  ): ChatMessage[];

  static buildItemPrompt(
    item: Item,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): ChatMessage[];

  static buildMonsterPrompt(
    monster: Monster,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): ChatMessage[];
}
```

### Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| **Scene Expansion** | < 3 seconds | 5 seconds |
| **Item Expansion** | < 2 seconds | 4 seconds |
| **Monster Expansion** | < 2 seconds | 4 seconds |
| **Cache Lookup** | < 1ms | 10ms |
| **Classic Mode Impact** | 0ms (no change) | 0ms |
| **Save File Size** | < 500KB | 1MB |
| **API Calls per Scene** | 1 + N items + M monsters | - |

**Optimization Strategies**:
1. **Lazy Loading**: Only expand on first visit
2. **Caching**: Never re-expand same entity
3. **Parallel Calls**: (Future) Expand items/monsters in parallel
4. **Pre-generation**: (Future) Pre-expand starting area

### File Structure

```
src/
├── config/
│   └── ai-prompts.ts              # NEW - Configurable AI prompts
├── clients/
│   └── OpenRouterClient.ts        # NEW - API communication
├── services/
│   ├── AIEnhancementService.ts    # NEW - Main AI service
│   └── interfaces/
│       └── IAIEnhancementService.ts  # NEW - Interface
├── utils/
│   └── PromptBuilder.ts           # NEW - Prompt construction
├── types/
│   └── GameState.ts               # MODIFIED - Add playerName, gameStyle
│   └── SceneTypes.ts              # MODIFIED - Add expanded flag, exit.description
│   └── ItemTypes.ts               # MODIFIED - Add expanded flag
│   └── MonsterTypes.ts            # MODIFIED - Add expanded flag
└── ui/
    └── NewGamePrompt.ts           # NEW - Mode/name/style selection

testing/
├── mocks/
│   └── MockOpenRouterClient.ts    # NEW - Mock AI for tests
└── services/
    └── AIEnhancementService.test.ts  # NEW - Service tests

docs/
└── features/
    └── ai-enhanced-mode-prd.md    # THIS DOCUMENT
```

---

## Open Questions & Future Considerations

### Unresolved Questions

1. **Content Regeneration**:
   - Should we allow players to regenerate content they don't like?
   - Command: `regen scene` or similar?
   - Limit: How many times per entity?

2. **Cross-Save Compatibility**:
   - Should enhanced saves work across different AI models?
   - What if Grok becomes unavailable - fallback model?

3. **Analytics & Telemetry**:
   - Should we track AI generation success rates?
   - Monitor which styles are most popular?
   - Collect quality feedback?

4. **Content Curation**:
   - Should we manually review/approve high-quality AI generations?
   - Build a library of "golden" expansions?
   - Share curated content across users?

5. **Multiplayer/Sharing**:
   - Could players share their enhanced worlds?
   - Export/import AI-enhanced save files?

### Future Enhancement Ideas

**Short-Term (3-6 months)**:
- Pre-generate starting area (west_of_house, kitchen, living_room)
- Parallel API calls for better performance
- Regeneration command
- Content quality rating system

**Medium-Term (6-12 months)**:
- Additional styles (Horror, Comedy, Historical)
- User-defined custom style prompts
- Dynamic NPC dialogue generation
- Personalized combat messages

**Long-Term (12+ months)**:
- Multi-game memory (AI remembers across saves)
- Procedural puzzle variations
- Voice/audio integration
- Image generation for scenes

---

## Approval & Sign-Off

**Stakeholders**:
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] QA Lead
- [ ] UX Designer

**Required Reviews**:
- [ ] Technical Architecture Review
- [ ] Security Review (API key handling)
- [ ] Cost Analysis (OpenRouter usage estimates)
- [ ] Legal Review (AI content rights, ToS compliance)

**Approval Date**: _______________

**Target Release**: _______________

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-01 | Development Team | Initial PRD draft |

---

## Appendix

### Example AI Responses

See inline examples throughout "Content Expansion Specifications" section.

### Cost Estimates

**OpenRouter Pricing** (Grok-2):
- Input: ~$2.00 per 1M tokens
- Output: ~$10.00 per 1M tokens

**Estimated Costs per Scene**:
- Input tokens: ~500 (scene data + prompt)
- Output tokens: ~300 (enhanced content)
- Cost per scene: ~$0.004

**Per Game Session**:
- Average scenes visited: 50
- Total cost: ~$0.20 per player session

**Recommendations**:
- Use user-provided API keys (user pays)
- Or limit free tier to X scenes per day

### Reference Links

- OpenRouter Docs: https://openrouter.ai/docs
- Grok Model: https://openrouter.ai/models/x-ai/grok-2-1212
- Original Zork Source: `reference/dung_mud_source.txt`
- Project Architecture: `docs/README.md`

---

**End of PRD**
