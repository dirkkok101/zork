/**
 * TakeTestGenerator - Generates take command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { takeTestTemplate } from '../templates/take-test.template.js';

export class TakeTestGenerator extends BaseGenerator {
  constructor() {
    super(takeTestTemplate);
  }

  /**
   * Generate take command tests
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

    // Filter items by capability
    const takeableItems = detailedItems.filter(i => i.canTake);
    const nonTakeableItems = detailedItems.filter(i => !i.canTake && i.visible);
    const containers = detailedItems.filter(i => i.isContainer && i.initialContents && i.initialContents.length > 0);
    const treasures = detailedItems.filter(i => i.isTreasure && i.canTake);
    const heavyItems = takeableItems.filter(i => i.weight >= 10);
    const statefulItems = takeableItems.filter(i => i.hasState);

    // Prepare items with helper methods
    const preparedTakeableItems = takeableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase())
    }));

    const preparedContainers = containers.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    const preparedNonTakeable = nonTakeableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    const preparedStateful = statefulItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      takeableItems: preparedTakeableItems,
      nonTakeableItems: preparedNonTakeable,
      containers: preparedContainers,
      treasures,
      heavyItems,
      statefulItems: preparedStateful,
      multipleTakeableItems: takeableItems.length > 1,
      hasWeight: takeableItems.some(i => i.weight > 0),
      // Helper function for template
      first: (arr: any[]) => arr.length > 0 ? arr[0] : null
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
   * Get the output filename for take tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_take.test.ts';
  }

  /**
   * Get the output directory for take tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/take_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has takeable items
    const detailedItems = scene.detailedItems || [];
    return detailedItems.some(i => i.canTake);
  }
}
