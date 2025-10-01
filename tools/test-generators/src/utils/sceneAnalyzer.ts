/**
 * SceneAnalyzer - Analyzes scene JSON to determine test requirements
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnalyzedScene, AnalyzedItem } from '../types/GeneratorTypes.js';
import { toClassName, toHelperName, toTestEnvType, toFactoryName } from './namingUtils.js';
import { ItemAnalyzer } from './itemAnalyzer.js';
import { InteractionAnalyzer } from './interactionAnalyzer.js';

export class SceneAnalyzer {
  private dataPath: string;
  private itemAnalyzer: ItemAnalyzer;
  private interactionAnalyzer: InteractionAnalyzer;

  constructor(dataPath?: string) {
    // Default to project root data directory
    if (dataPath) {
      this.dataPath = dataPath;
    } else {
      // Check if we're in project root or tools subdirectory
      const cwd = process.cwd();
      if (cwd.endsWith('test-generators')) {
        // Running from tools/test-generators
        this.dataPath = path.resolve(cwd, '../../data');
      } else {
        // Running from project root
        this.dataPath = path.join(cwd, 'data');
      }
    }

    // Initialize analyzers
    this.itemAnalyzer = new ItemAnalyzer(this.dataPath);
    this.interactionAnalyzer = new InteractionAnalyzer();
  }

  /**
   * Analyze a scene JSON file and return test requirements
   */
  async analyzeScene(sceneId: string): Promise<AnalyzedScene> {
    const sceneData = await this.loadSceneData(sceneId);

    // Extract item IDs from scene
    const itemIds = (sceneData.items || []).map((item: any) => item.itemId);

    // Use ItemAnalyzer for detailed item analysis
    const detailedItems = await this.itemAnalyzer.analyzeSceneItems(itemIds);

    // Use InteractionAnalyzer to determine test requirements
    const interactionAnalysis = this.interactionAnalyzer.analyzeInteractions(detailedItems);

    // Legacy simple item analysis for backwards compatibility
    const items = await this.analyzeItems(sceneData.items || []);
    const exits = this.analyzeExits(sceneData.exits || {});

    const hasItems = items.length > 0;
    const hasMonsters = (sceneData.monsters || []).length > 0;
    const hasConditionalExits = exits.conditional.length > 0;
    const hasBlockedExits = exits.blocked.length > 0;
    const hasFirstVisitPoints = sceneData.firstVisitPoints !== null && sceneData.firstVisitPoints !== undefined;
    const hasAtmosphere = (sceneData.atmosphere || []).length > 0;

    // Determine complexity
    const complexity = this.determineComplexity({
      hasItems,
      hasMonsters,
      hasConditionalExits,
      hasBlockedExits,
      itemCount: items.length,
      exitCount: exits.simple.length + exits.conditional.length
    });

    return {
      // Basic info
      id: sceneId,
      title: sceneData.title,
      description: sceneData.description,
      className: toClassName(sceneId),
      helperName: toHelperName(sceneId),
      testEnvType: toTestEnvType(sceneId),
      factoryName: toFactoryName(sceneId),

      // Scene properties
      lighting: sceneData.lighting || 'daylight',
      region: sceneData.region || 'above_ground',
      firstVisitPoints: sceneData.firstVisitPoints || null,
      atmosphere: sceneData.atmosphere || [],
      tags: sceneData.tags || [],

      // Test requirements
      hasItems,
      hasMonsters,
      hasConditionalExits,
      hasBlockedExits,
      hasFirstVisitPoints,
      hasAtmosphere,

      // Analyzed data
      exits,
      items,
      monsters: sceneData.monsters || [],
      complexity,

      // Enhanced analysis (new)
      detailedItems,
      interactionAnalysis,
      testRequirements: this.itemAnalyzer.determineTestRequirements(detailedItems),
      workflows: this.interactionAnalyzer.generateWorkflowScenarios(detailedItems)
    };
  }

  /**
   * Load scene JSON data
   */
  private async loadSceneData(sceneId: string): Promise<any> {
    const scenePath = path.join(this.dataPath, 'scenes', `${sceneId}.json`);

    if (!fs.existsSync(scenePath)) {
      throw new Error(`Scene file not found: ${scenePath}`);
    }

    const content = fs.readFileSync(scenePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Analyze items in the scene
   */
  private async analyzeItems(sceneItems: any[]): Promise<AnalyzedItem[]> {
    const analyzed: AnalyzedItem[] = [];

    for (const sceneItem of sceneItems) {
      const itemId = sceneItem.itemId;
      const itemData = await this.loadItemData(itemId);

      if (itemData) {
        analyzed.push({
          id: itemId,
          type: this.determineItemType(itemData),
          isTakeable: itemData.isTakeable !== false, // Default to true
          isContainer: itemData.type === 'container' || itemData.isContainer === true,
          isReadable: itemData.isReadable === true || itemData.type === 'readable'
        });
      }
    }

    return analyzed;
  }

  /**
   * Load item JSON data
   */
  private async loadItemData(itemId: string): Promise<any | null> {
    const itemPath = path.join(this.dataPath, 'items', `${itemId}.json`);

    if (!fs.existsSync(itemPath)) {
      console.warn(`Item file not found: ${itemPath}`);
      return null;
    }

    const content = fs.readFileSync(itemPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Determine item type from item data
   */
  private determineItemType(itemData: any): AnalyzedItem['type'] {
    if (itemData.type) {
      return itemData.type;
    }

    // Infer type from properties
    if (itemData.isContainer || itemData.state?.isOpen !== undefined) {
      return 'container';
    }
    if (itemData.isTreasure || itemData.baseValue > 0) {
      return 'treasure';
    }
    if (itemData.isReadable || itemData.text) {
      return 'readable';
    }
    if (itemData.isWeapon || itemData.damage) {
      return 'weapon';
    }

    return 'generic';
  }

  /**
   * Analyze exits in the scene
   */
  private analyzeExits(exitsData: any): AnalyzedScene['exits'] {
    const simple: Array<{direction: string; to: string}> = [];
    const conditional: Array<{direction: string; to: string; condition: string; failureMessage: string}> = [];
    const blocked: Array<{direction: string; failureMessage: string}> = [];

    for (const [direction, exitData] of Object.entries(exitsData)) {
      if (typeof exitData === 'string') {
        // Simple exit: { north: "forest_1" }
        simple.push({ direction, to: exitData });
      } else if (typeof exitData === 'object' && exitData !== null) {
        const exit: any = exitData;

        if (exit.blocked === true || exit.to === null) {
          // Blocked exit
          blocked.push({
            direction,
            failureMessage: exit.failureMessage || `You can't go ${direction} from here.`
          });
        } else if (exit.condition) {
          // Conditional exit
          conditional.push({
            direction,
            to: exit.to,
            condition: exit.condition,
            failureMessage: exit.failureMessage || `The ${direction} exit is blocked.`
          });
        } else if (exit.to) {
          // Simple exit in object form
          simple.push({ direction, to: exit.to });
        }
      }
    }

    return { simple, conditional, blocked };
  }

  /**
   * Determine scene complexity for test generation
   */
  private determineComplexity(factors: {
    hasItems: boolean;
    hasMonsters: boolean;
    hasConditionalExits: boolean;
    hasBlockedExits: boolean;
    itemCount: number;
    exitCount: number;
  }): AnalyzedScene['complexity'] {
    let score = 0;

    if (factors.hasItems) score += factors.itemCount;
    if (factors.hasMonsters) score += 3;
    if (factors.hasConditionalExits) score += 2;
    if (factors.hasBlockedExits) score += 1;
    score += factors.exitCount * 0.5;

    if (score >= 8) return 'complex';
    if (score >= 4) return 'moderate';
    return 'simple';
  }
}
