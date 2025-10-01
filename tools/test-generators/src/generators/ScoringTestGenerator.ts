/**
 * ScoringTestGenerator - Generates scoring tests
 * Tests for treasure collection, deposit, and first-visit scoring
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { scoringTestTemplate } from '../templates/scoring.template.js';

export class ScoringTestGenerator extends BaseGenerator {
  constructor() {
    super(scoringTestTemplate);
  }

  /**
   * Generate scoring tests
   */
  generate(scene: AnalyzedScene): string {
    // Prepare template data
    const templateData = this.prepareTemplateData(scene);

    // Generate code from template
    const code = this.template(templateData);
    return this.format(code);
  }

  /**
   * Prepare data for template
   */
  private prepareTemplateData(scene: AnalyzedScene): any {
    const detailedItems = scene.detailedItems || [];

    // 1. Identify treasures in scene
    const treasures = detailedItems.filter(i => i.isTreasure && i.visible);

    // 2. Identify non-treasure items (limit to first 2 for testing)
    const nonTreasures = detailedItems
      .filter(i => !i.isTreasure && i.canTake && i.visible)
      .slice(0, 2);

    // 3. Check if scene has first visit scoring
    // Most scenes award 1 point for first visit in Zork
    const hasFirstVisitScoring = true; // Zork awards points for visiting new rooms

    // 4. Check if this scene is living_room (has trophy case)
    const hasTrophyCase = scene.id === 'living_room';

    // Prepare treasures with capitalized names
    const preparedTreasures = treasures.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    // Prepare non-treasures
    const preparedNonTreasures = nonTreasures.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      treasures: preparedTreasures,
      nonTreasures: preparedNonTreasures,
      hasTreasures: treasures.length > 0,
      hasFirstVisitScoring: hasFirstVisitScoring,
      hasTrophyCase: hasTrophyCase
    };
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get the output filename for scoring tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'scene_scoring.test.ts';
  }

  /**
   * Get the output directory for scoring tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/scoring';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    const detailedItems = scene.detailedItems || [];

    // Generate if:
    // 1. Scene has treasures
    const hasTreasures = detailedItems.some(i => i.isTreasure && i.visible);

    // 2. OR scene is living_room (trophy case scoring)
    const isTrophyCaseScene = scene.id === 'living_room';

    // 3. OR scene has first-visit scoring (all scenes in Zork)
    const hasFirstVisitScoring = true;

    return hasTreasures || isTrophyCaseScene || hasFirstVisitScoring;
  }
}
