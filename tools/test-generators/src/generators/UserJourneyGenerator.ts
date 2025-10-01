/**
 * UserJourneyGenerator - Generates scene-specific player journey tests
 * Tests based on different player personas and playstyles
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { userJourneyTestTemplate } from '../templates/user-journey.template.js';

export class UserJourneyGenerator extends BaseGenerator {
  constructor() {
    super(userJourneyTestTemplate);
  }

  /**
   * Generate user journey tests
   */
  generate(scene: AnalyzedScene): string {
    const templateData = this.prepareTemplateData(scene);
    const code = this.template(templateData);
    return this.format(code);
  }

  /**
   * Prepare data for template
   */
  private prepareTemplateData(scene: AnalyzedScene): any {
    const detailedItems = scene.detailedItems || [];

    // Categorize items
    const visibleItems = detailedItems
      .filter(i => i.visible)
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    const containers = detailedItems
      .filter(i => i.isContainer && i.visible)
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    const treasures = detailedItems
      .filter(i => i.isTreasure && i.visible)
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    const tools = detailedItems
      .filter(i => i.visible && i.canTake && !i.isTreasure && this.isUsefulTool(i))
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    const takeableItems = detailedItems
      .filter(i => i.visible && i.canTake)
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    const lightItems = detailedItems
      .filter(i => i.visible && i.canTake && (i.weight || 0) <= 5)
      .map(item => ({ ...item, capitalizedId: this.capitalize(item.id) }));

    // Weight restriction data
    const weightRestrictedExit = this.findWeightRestrictedExit(scene);
    const hasWeightRestriction = weightRestrictedExit !== null;

    const overLimitItems = this.findItemsOverLimit(detailedItems, 15);
    const heaviestItem = this.findHeaviestItem(detailedItems);
    const heaviestTreasure = this.findHeaviestItem(treasures);
    const lightestTreasure = this.findLightestItem(treasures);

    // Exit data
    const simpleExits = (scene.exits?.simple || []).map(exit => ({
      ...exit,
      returnDirection: this.getReturnDirection(exit.direction)
    }));

    const firstExit = simpleExits[0] || (scene.exits?.conditional || [])[0];

    // Primary objective (most valuable or useful item)
    const primaryObjective = this.determinePrimaryObjective(treasures, tools, takeableItems);

    // Journey flags
    const hasTreasures = treasures.length > 0;
    const hasTools = tools.length > 0;
    const hasContainers = containers.length > 0;
    const hasVisibleItems = visibleItems.length > 0;
    const hasTakeableItems = takeableItems.length > 0;
    const hasExits = (scene.exits?.simple?.length || 0) + (scene.exits?.conditional?.length || 0) > 0;
    const hasMultipleExits = simpleExits.length > 1;

    const firstVisibleItem = visibleItems[0];
    const firstTakeableItem = takeableItems[0];

    return {
      ...scene,
      visibleItems,
      containers,
      treasures,
      tools,
      takeableItems,
      lightItems,
      hasWeightRestriction,
      restrictedDirection: weightRestrictedExit?.direction,
      restrictedDestination: weightRestrictedExit?.to,
      overLimitItems,
      heaviestItem,
      heaviestTreasure,
      lightestTreasure,
      simpleExits,
      firstExit,
      primaryObjective,
      hasTreasures,
      hasTools,
      hasContainers,
      hasVisibleItems,
      hasTakeableItems,
      hasExits,
      hasMultipleExits,
      firstVisibleItem,
      firstTakeableItem
    };
  }

  /**
   * Check if item is a useful tool
   */
  private isUsefulTool(item: any): boolean {
    // Check item type or properties that indicate usefulness
    const toolTypes = ['WEAPON', 'TOOL', 'KEY', 'LIGHT'];
    const toolKeywords = ['knife', 'sword', 'key', 'lantern', 'lamp', 'rope', 'torch'];

    if (toolTypes.includes(item.type)) {
      return true;
    }

    const name = (item.name || item.id || '').toLowerCase();
    return toolKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Find weight-restricted exit
   */
  private findWeightRestrictedExit(scene: AnalyzedScene): any | null {
    const conditionalExits = scene.exits?.conditional || [];

    for (const exit of conditionalExits) {
      if (exit.condition === 'light_load' ||
          (typeof exit.condition === 'string' && exit.condition.includes('light'))) {
        return {
          direction: exit.direction,
          to: exit.to,
          condition: exit.condition
        };
      }
    }

    return null;
  }

  /**
   * Find items that together exceed weight limit
   */
  private findItemsOverLimit(items: any[], limit: number): any[] {
    const takeableItems = items.filter(i => i.visible && i.canTake && i.weight !== undefined);
    const sorted = [...takeableItems].sort((a, b) => (b.weight || 0) - (a.weight || 0));

    const selected: any[] = [];
    let totalWeight = 0;

    for (const item of sorted) {
      selected.push({ ...item, capitalizedId: this.capitalize(item.id) });
      totalWeight += item.weight || 0;
      if (totalWeight > limit) {
        break;
      }
    }

    return selected;
  }

  /**
   * Find heaviest item
   */
  private findHeaviestItem(items: any[]): any | null {
    if (items.length === 0) return null;

    const takeableItems = items.filter(i => i.canTake !== false);
    if (takeableItems.length === 0) return null;

    const heaviest = takeableItems.reduce((max, item) =>
      (item.weight || 0) > (max.weight || 0) ? item : max
    );

    return { ...heaviest, capitalizedId: this.capitalize(heaviest.id) };
  }

  /**
   * Find lightest item
   */
  private findLightestItem(items: any[]): any | null {
    if (items.length === 0) return null;

    const takeableItems = items.filter(i => i.canTake !== false);
    if (takeableItems.length === 0) return null;

    const lightest = takeableItems.reduce((min, item) =>
      (item.weight || 0) < (min.weight || 0) ? item : min
    );

    return { ...lightest, capitalizedId: this.capitalize(lightest.id) };
  }

  /**
   * Determine primary objective for the scene
   */
  private determinePrimaryObjective(treasures: any[], tools: any[], items: any[]): any | null {
    // Priority: treasures > tools > any takeable item
    if (treasures.length > 0) {
      return treasures[0];
    }
    if (tools.length > 0) {
      return tools[0];
    }
    if (items.length > 0) {
      return items[0];
    }
    return null;
  }

  /**
   * Get return direction for a given direction
   */
  private getReturnDirection(direction?: string): string | null {
    if (!direction) return null;

    const opposites: Record<string, string> = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east',
      'up': 'down',
      'down': 'up',
      'northeast': 'southwest',
      'northwest': 'southeast',
      'southeast': 'northwest',
      'southwest': 'northeast',
      'in': 'out',
      'out': 'in'
    };

    return opposites[direction.toLowerCase()] || null;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get output filename
   */
  getFilename(scene: AnalyzedScene): string {
    return 'user_journeys.test.ts';
  }

  /**
   * Get output directory
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/user_journeys';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    const detailedItems = scene.detailedItems || [];

    // Generate if scene has any interesting features for player journeys
    const hasItems = detailedItems.some(i => i.visible);
    const hasExits = (scene.exits?.simple?.length || 0) + (scene.exits?.conditional?.length || 0) > 0;

    return hasItems || hasExits;
  }
}
