/**
 * ReadTestGenerator - Generates read command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { readTestTemplate } from '../templates/read-test.template.js';

export class ReadTestGenerator extends BaseGenerator {
  constructor() {
    super(readTestTemplate);
  }

  /**
   * Generate read command tests
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

    // Filter items by capability - only readable items
    const readableItems = detailedItems.filter(i => i.isReadable && i.visible);
    const nonReadableItems = detailedItems.filter(i => !i.isReadable && i.visible);

    // Prepare items with helper methods
    const preparedReadableItems = readableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase())
    }));

    const preparedNonReadableItems = nonReadableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      readableItems: preparedReadableItems,
      nonReadableItems: preparedNonReadableItems,
      multipleReadableItems: readableItems.length > 1,
      firstReadableItem: preparedReadableItems.length > 0 ? preparedReadableItems[0] : null,
      firstNonReadableItem: preparedNonReadableItems.length > 0 ? preparedNonReadableItems[0] : null
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
   * Get the output filename for read tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_read.test.ts';
  }

  /**
   * Get the output directory for read tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/read_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has readable items
    const detailedItems = scene.detailedItems || [];
    return detailedItems.some(i => i.isReadable && i.visible);
  }
}
