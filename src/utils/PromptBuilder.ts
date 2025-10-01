/**
 * Prompt Builder Utility
 * Constructs AI prompts from templates and game data
 */

import { Scene, Exit } from '../types/SceneTypes';
import { Item } from '../types/ItemTypes';
import { Monster } from '../types/Monster';
import { ChatMessage } from '../types/AITypes';
import { GameStyle } from '../types/GameState';
import { AI_PROMPTS } from '../config/ai-prompts';

/**
 * Utility class for building AI prompts
 * All methods are static - no instantiation needed
 */
export class PromptBuilder {
  /**
   * Build scene expansion prompt
   * @param scene - Scene to expand
   * @param playerName - Player's chosen name
   * @param style - Game style (fantasy, scifi, modern)
   * @param items - Items present in the scene
   * @param monsters - Monsters present in the scene
   * @returns Array of chat messages for API
   */
  static buildScenePrompt(
    scene: Scene,
    playerName: string,
    style: GameStyle,
    items: Item[],
    monsters: Monster[]
  ): ChatMessage[] {
    const promptTemplate = AI_PROMPTS.scene[style];

    if (!promptTemplate || !promptTemplate.system || !promptTemplate.user) {
      throw new Error(`Invalid prompt template for style: ${style}`);
    }

    return [
      {
        role: 'system',
        content: promptTemplate.system.replace('{style}', this.getStyleName(style))
      },
      {
        role: 'user',
        content: promptTemplate.user
          .replace('{sceneId}', scene.id)
          .replace('{playerName}', playerName)
          .replace('{originalName}', scene.title)
          .replace('{originalDescription}', scene.description)
          .replace('{exits}', this.formatExits(scene.exits))
          .replace('{items}', this.formatItems(items))
          .replace('{monsters}', this.formatMonsters(monsters))
      }
    ];
  }

  /**
   * Build item expansion prompt
   * @param item - Item to expand
   * @param sceneContext - Context of current scene for relevance
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Array of chat messages for API
   */
  static buildItemPrompt(
    item: Item,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): ChatMessage[] {
    const promptTemplate = AI_PROMPTS.item[style];

    if (!promptTemplate || !promptTemplate.system || !promptTemplate.user) {
      throw new Error(`Invalid prompt template for style: ${style}`);
    }

    // Include readable text if item has it
    const readableText = item.readText || item.examineText || '';
    const readableInfo = readableText ? `\nReadable Text: ${readableText}` : '';

    return [
      {
        role: 'system',
        content: promptTemplate.system.replace('{style}', this.getStyleName(style))
      },
      {
        role: 'user',
        content: promptTemplate.user
          .replace('{itemId}', item.id)
          .replace('{originalName}', item.name)
          .replace('{originalDescription}', item.description)
          .replace('{itemType}', item.type)
          .replace('{sceneContext}', sceneContext)
          .replace('{playerName}', playerName) + readableInfo
      }
    ];
  }

  /**
   * Build monster expansion prompt
   * @param monster - Monster to expand
   * @param sceneContext - Context of current scene
   * @param playerName - Player's chosen name
   * @param style - Game style
   * @returns Array of chat messages for API
   */
  static buildMonsterPrompt(
    monster: Monster,
    sceneContext: string,
    playerName: string,
    style: GameStyle
  ): ChatMessage[] {
    const promptTemplate = AI_PROMPTS.monster[style];

    if (!promptTemplate || !promptTemplate.system || !promptTemplate.user) {
      throw new Error(`Invalid prompt template for style: ${style}`);
    }

    return [
      {
        role: 'system',
        content: promptTemplate.system.replace('{style}', this.getStyleName(style))
      },
      {
        role: 'user',
        content: promptTemplate.user
          .replace('{monsterId}', monster.id)
          .replace('{originalName}', monster.name)
          .replace('{originalDescription}', monster.description)
          .replace('{sceneContext}', sceneContext)
          .replace('{playerName}', playerName)
      }
    ];
  }

  /**
   * Get human-readable style name
   */
  private static getStyleName(style: GameStyle): string {
    const styleNames: Record<GameStyle, string> = {
      fantasy: 'Tolkien-esque high fantasy',
      scifi: 'Cyberpunk noir',
      modern: 'Contemporary mystery/thriller',
      classic: 'Classic'
    };
    return styleNames[style] || style;
  }

  /**
   * Format exits for prompt
   */
  private static formatExits(exits: Exit[]): string {
    if (!exits || exits.length === 0) {
      return 'none';
    }
    return exits.map(exit => exit.direction).join(', ');
  }

  /**
   * Format items for prompt
   */
  private static formatItems(items: Item[]): string {
    if (!items || items.length === 0) {
      return 'none';
    }
    return items.map(item => item.name).join(', ');
  }

  /**
   * Format monsters for prompt
   */
  private static formatMonsters(monsters: Monster[]): string {
    if (!monsters || monsters.length === 0) {
      return 'none';
    }
    return monsters.map(monster => monster.name).join(', ');
  }
}
