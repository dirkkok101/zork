/**
 * WeightTestGenerator - Generates weight restriction tests
 * Tests for inventory weight limits and weight-based exit restrictions
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { weightRestrictionsTestTemplate } from '../templates/weight-restrictions.template.js';

export class WeightTestGenerator extends BaseGenerator {
  private readonly WEIGHT_LIMIT = 15; // Based on InventoryService.hasLightLoad()

  constructor() {
    super(weightRestrictionsTestTemplate);
  }

  /**
   * Generate weight restriction tests
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

    // Find weight-restricted exit
    const weightRestrictedExit = this.findWeightRestrictedExit(scene);

    if (!weightRestrictedExit) {
      throw new Error(`No weight-restricted exit found in scene ${scene.id}`);
    }

    // Get all takeable items with weights
    const takeableItems = detailedItems.filter(i => i.visible && i.canTake && i.weight !== undefined);

    // Categorize items by weight
    const lightItems = takeableItems.filter(i => (i.weight || 0) > 0 && (i.weight || 0) <= 5);
    const mediumItems = takeableItems.filter(i => (i.weight || 0) > 5 && (i.weight || 0) <= this.WEIGHT_LIMIT);
    const heavyItems = takeableItems.filter(i => (i.weight || 0) > this.WEIGHT_LIMIT);
    const zeroWeightItems = takeableItems.filter(i => (i.weight || 0) === 0);

    // Prepare test item combinations
    const testItems = [...lightItems.slice(0, 2), ...mediumItems.slice(0, 1)];
    const totalTestWeight = testItems.reduce((sum, item) => sum + (item.weight || 0), 0);

    // Items at limit (total weight = 15)
    const limitItems = this.findItemsAtLimit(takeableItems);

    // Items over limit (total weight > 15)
    const overLimitItems = this.findItemsOverLimit(takeableItems);

    // Combined items for multi-item test
    const combinedItems = lightItems.length >= 2 ? lightItems.slice(0, 2) : [];
    const combinedWeight = combinedItems.reduce((sum, item) => sum + (item.weight || 0), 0);

    // Find containers
    const containers = detailedItems.filter(i => i.isContainer && i.visible && i.canTake);

    // Find other (unrestricted) exits
    const allExits = [
      ...(scene.exits?.simple || []),
      ...(scene.exits?.conditional || [])
    ];
    const unrestrictedExits = allExits.filter(exit =>
      exit.direction !== weightRestrictedExit.direction
    );

    // Get first item name for examine tests
    const firstItem = detailedItems.find(i => i.visible);
    const firstItemName = firstItem?.name || 'item';

    return {
      ...scene,
      hasWeightRestrictedExit: true,
      restrictedDirection: weightRestrictedExit.direction,
      restrictedDestination: weightRestrictedExit.to,
      lightItems: lightItems.map(item => ({...item, capitalizedId: this.capitalize(item.id)})),
      mediumItems: mediumItems.map(item => ({...item, capitalizedId: this.capitalize(item.id)})),
      heavyItems: heavyItems.map(item => ({...item, capitalizedId: this.capitalize(item.id)})),
      hasHeavyItems: heavyItems.length > 0,
      hasMultipleItems: combinedItems.length > 1,
      combinedItems: combinedItems,
      combinedWeight: combinedWeight,
      testItems: testItems.map(item => ({...item, capitalizedId: this.capitalize(item.id)})),
      totalTestWeight: totalTestWeight,
      limitItems: limitItems,
      overLimitItems: overLimitItems,
      hasZeroWeightItems: zeroWeightItems.length > 0,
      zeroWeightItems: zeroWeightItems,
      containers: containers.map(item => ({...item, capitalizedId: this.capitalize(item.id)})),
      hasContainers: containers.length > 0,
      unrestrictedExits: unrestrictedExits,
      hasOtherExits: unrestrictedExits.length > 0,
      firstItemName: firstItemName
    };
  }

  /**
   * Find exit with weight restriction
   */
  private findWeightRestrictedExit(scene: AnalyzedScene): any | null {
    const conditionalExits = scene.exits?.conditional || [];

    // Look for exits with "light_load" condition
    for (const exit of conditionalExits) {
      if (exit.condition === 'light_load' ||
          (typeof exit.condition === 'string' && exit.condition.includes('light'))) {
        return {
          direction: exit.direction,
          to: exit.to,
          condition: exit.condition,
          failureMessage: exit.failureMessage
        };
      }
    }

    return null;
  }

  /**
   * Find item combination at weight limit (15)
   */
  private findItemsAtLimit(items: any[]): any[] {
    // Try to find combination that equals exactly 15 or just under
    const sorted = [...items].sort((a, b) => (a.weight || 0) - (b.weight || 0));

    // Simple algorithm: take items until we reach limit
    const selected: any[] = [];
    let totalWeight = 0;

    for (const item of sorted) {
      const itemWeight = item.weight || 0;
      if (totalWeight + itemWeight <= this.WEIGHT_LIMIT) {
        selected.push(item);
        totalWeight += itemWeight;
      }
    }

    return selected;
  }

  /**
   * Find item combination over weight limit (>15)
   */
  private findItemsOverLimit(items: any[]): any[] {
    // Find combination that exceeds limit
    const sorted = [...items].sort((a, b) => (b.weight || 0) - (a.weight || 0));

    // Take heavy items until we exceed limit
    const selected: any[] = [];
    let totalWeight = 0;

    for (const item of sorted) {
      selected.push(item);
      totalWeight += item.weight || 0;
      if (totalWeight > this.WEIGHT_LIMIT) {
        break;
      }
    }

    return selected;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get the output filename for weight restriction tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'weight_restrictions.test.ts';
  }

  /**
   * Get the output directory for weight restriction tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/weight_restrictions';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has weight-restricted exit
    const conditionalExits = scene.exits?.conditional || [];

    return conditionalExits.some(exit =>
      exit.condition === 'light_load' ||
      (typeof exit.condition === 'string' && exit.condition.includes('light'))
    );
  }
}
