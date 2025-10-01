/**
 * PutTestGenerator - Generates put command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { putTestTemplate } from '../templates/put-test.template.js';

export class PutTestGenerator extends BaseGenerator {
  constructor() {
    super(putTestTemplate);
  }

  /**
   * Generate put command tests
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

    // Filter for containers that can hold items (must be openable containers)
    const containers = detailedItems.filter(i => i.isContainer && i.canOpen && i.visible);

    // Filter for takeable items that can be put in containers
    const takeableItems = detailedItems.filter(i => i.canTake && i.visible);

    // Prepare containers with aliases
    const preparedContainers = containers.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase())
    }));

    // Prepare takeable items with aliases
    const preparedTakeableItems = takeableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase())
    }));

    return {
      ...scene,
      containers: preparedContainers,
      takeableItems: preparedTakeableItems,
      multipleContainers: containers.length > 1,
      firstContainer: preparedContainers.length > 0 ? preparedContainers[0] : null,
      firstTakeableItem: preparedTakeableItems.length > 0 ? preparedTakeableItems[0] : null
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
   * Get the output filename for put tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_put.test.ts';
  }

  /**
   * Get the output directory for put tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/put_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has both containers and takeable items
    const detailedItems = scene.detailedItems || [];
    const hasContainers = detailedItems.some(i => i.isContainer && i.canOpen && i.visible);
    const hasTakeableItems = detailedItems.some(i => i.canTake && i.visible);
    return hasContainers && hasTakeableItems;
  }
}
