/**
 * DropTestGenerator - Generates drop command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { dropTestTemplate } from '../templates/drop-test.template.js';

export class DropTestGenerator extends BaseGenerator {
  constructor() {
    super(dropTestTemplate);
  }

  /**
   * Generate drop command tests
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

    // Filter items by capability - only takeable items can be dropped
    const takeableItems = detailedItems.filter(i => i.canTake);
    const containers = detailedItems.filter(i => i.isContainer && i.canTake);

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

    return {
      ...scene,
      takeableItems: preparedTakeableItems,
      containers: preparedContainers,
      multipleTakeableItems: takeableItems.length > 1,
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
   * Get the output filename for drop tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_drop.test.ts';
  }

  /**
   * Get the output directory for drop tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/drop_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has takeable items (which can be dropped)
    const detailedItems = scene.detailedItems || [];
    return detailedItems.some(i => i.canTake);
  }
}
