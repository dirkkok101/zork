/**
 * InventoryTestGenerator - Generates inventory command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { inventoryTestTemplate } from '../templates/inventory-test.template.js';

export class InventoryTestGenerator extends BaseGenerator {
  constructor() {
    super(inventoryTestTemplate);
  }

  /**
   * Generate inventory command tests
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

    // Filter for takeable items that could be in inventory
    const takeableItems = detailedItems.filter(i => i.canTake && i.visible);

    // Limit to first 3 items for testing (to keep tests manageable)
    const testItems = takeableItems.slice(0, 3);

    // Prepare items with capitalized names
    const preparedTakeableItems = testItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      takeableItems: preparedTakeableItems,
      firstTakeableItem: preparedTakeableItems.length > 0 ? preparedTakeableItems[0] : null,
      secondTakeableItem: preparedTakeableItems.length > 1 ? preparedTakeableItems[1] : null,
      hasMultipleTakeableItems: preparedTakeableItems.length > 1
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
   * Get the output filename for inventory tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_inventory.test.ts';
  }

  /**
   * Get the output directory for inventory tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/inventory_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Always generate inventory tests - they don't require scene-specific items
    // Inventory is a universal command that works in any scene
    return true;
  }
}
