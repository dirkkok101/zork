/**
 * StateValidationTestGenerator - Generates state validation tests
 * Tests for state persistence, consistency, and integrity across commands and scene transitions
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { stateValidationTestTemplate } from '../templates/state-validation.template.js';

export class StateValidationTestGenerator extends BaseGenerator {
  constructor() {
    super(stateValidationTestTemplate);
  }

  /**
   * Generate state validation tests
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

    // 1. Find containers (items with open/close state)
    const containers = detailedItems.filter(i => i.isContainer && i.canOpen && i.visible);

    // 2. Find items with state properties (weapons, lights, etc.)
    // Items that have state but aren't containers
    const itemsWithState = detailedItems.filter(i =>
      !i.isContainer &&
      i.visible &&
      (i.type === 'weapon' || i.type === 'light' || i.hasState)
    );

    // 3. Find conditional exits (exits that depend on flags)
    const conditionalExits = (scene.exits?.conditional || []).map((exit: any) => {
      // Extract flag name from condition if available
      const flagName = this.extractFlagName(exit);
      const relatedItem = this.findRelatedItem(flagName, detailedItems);

      return {
        direction: exit.direction,
        destination: exit.destination,
        flagName: flagName,
        relatedItem: relatedItem,
        condition: exit.condition
      };
    });

    // 4. Find first available exit for movement tests
    const allExits = [
      ...(scene.exits?.simple || []),
      ...(scene.exits?.conditional || [])
    ];
    const firstExit = allExits.length > 0 ? {
      direction: allExits[0].direction,
      destination: allExits[0].destination,
      reverseDirection: this.getReverseDirection(allExits[0].direction)
    } : null;

    // Prepare containers with additional metadata
    const preparedContainers = containers.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      canTake: item.canTake || false
    }));

    // Prepare items with state
    const preparedItemsWithState = itemsWithState.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      containers: preparedContainers,
      itemsWithState: preparedItemsWithState,
      conditionalExits: conditionalExits,
      hasContainers: containers.length > 0,
      hasItemsWithState: itemsWithState.length > 0,
      hasConditionalExits: conditionalExits.length > 0,
      hasMultipleContainers: containers.length > 1,
      sceneExits: allExits.length > 0,
      firstExit: firstExit
    };
  }

  /**
   * Extract flag name from exit condition
   */
  private extractFlagName(exit: any): string {
    if (!exit.condition) return '';

    // Try to extract flag name from condition string
    // Common patterns: "flag:door_windo_open", "door_windo_open", etc.
    const condition = exit.condition.toString();

    // If condition contains "flag:", extract what comes after
    if (condition.includes('flag:')) {
      return condition.split('flag:')[1].trim();
    }

    // Otherwise, use the whole condition as flag name
    return condition;
  }

  /**
   * Find item related to a flag (e.g., window item for door_windo_open flag)
   */
  private findRelatedItem(flagName: string, items: any[]): string | null {
    if (!flagName) return null;

    // Try to match flag name to item name
    // e.g., "door_windo_open" might relate to "windo" item
    const flagLower = flagName.toLowerCase();

    for (const item of items) {
      const itemIdLower = item.id.toLowerCase();

      // Check if flag contains item id or vice versa
      if (flagLower.includes(itemIdLower) || itemIdLower.includes(flagLower)) {
        return item.id;
      }
    }

    return null;
  }

  /**
   * Get reverse direction for movement back
   */
  private getReverseDirection(direction: string): string | null {
    const reverseMap: { [key: string]: string } = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east',
      'up': 'down',
      'down': 'up',
      'northeast': 'southwest',
      'northwest': 'southeast',
      'southeast': 'northwest',
      'southwest': 'northeast'
    };

    return reverseMap[direction.toLowerCase()] || null;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get the output filename for state validation tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'state_validation.test.ts';
  }

  /**
   * Get the output directory for state validation tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/state_validation';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    const detailedItems = scene.detailedItems || [];

    // Generate if scene has:
    // 1. Containers with open/close state
    const hasContainers = detailedItems.some(i => i.isContainer && i.canOpen && i.visible);

    // 2. Items with state properties (weapons, lights, etc.)
    const hasItemsWithState = detailedItems.some(i =>
      !i.isContainer &&
      i.visible &&
      (i.type === 'weapon' || i.type === 'light' || i.hasState)
    );

    // 3. Conditional exits (flag-based)
    const hasConditionalExits = (scene.exits?.conditional || []).length > 0;

    // Generate if any of these conditions are met
    return hasContainers || hasItemsWithState || hasConditionalExits;
  }
}
