/**
 * WorkflowGenerator - Generates multi-step workflow tests
 * Tests for common interaction sequences and user journeys
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { workflowTestTemplate } from '../templates/workflow.template.js';

export class WorkflowGenerator extends BaseGenerator {
  constructor() {
    super(workflowTestTemplate);
  }

  /**
   * Generate workflow tests
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

    // Identify workflow types
    const hasContainerWorkflows = this.hasContainerWorkflows(detailedItems);
    const hasItemCollectionWorkflow = this.hasItemCollectionWorkflow(detailedItems);
    const hasWeightManagementWorkflow = this.hasWeightManagementWorkflow(scene);
    const hasTreasureWorkflow = this.hasTreasureWorkflow(detailedItems);
    const hasExplorationWorkflow = this.hasExplorationWorkflow(scene);
    const hasConditionalAccessWorkflow = this.hasConditionalAccessWorkflow(scene);

    // Prepare container workflow data
    const containers = detailedItems
      .filter(i => i.isContainer && i.visible)
      .map(container => {
        const contents = container.contents || [];
        const firstContent = contents[0];
        const firstContentItem = detailedItems.find(i => i.id === firstContent);

        return {
          ...container,
          capitalizedId: this.capitalize(container.id),
          hasContents: contents.length > 0,
          firstContent: firstContentItem?.name || firstContent,
          firstContentId: firstContent
        };
      });

    // Prepare item collection data
    const takeableItems = detailedItems
      .filter(i => i.visible && i.canTake)
      .map(item => ({
        ...item,
        capitalizedId: this.capitalize(item.id)
      }));

    const firstTakeableItem = takeableItems[0];

    // Prepare weight management data
    const lightItems = detailedItems.filter(i => i.visible && i.canTake && (i.weight || 0) <= 5);
    const mediumItems = detailedItems.filter(i => i.visible && i.canTake && (i.weight || 0) > 5 && (i.weight || 0) <= 15);
    const overLimitItems = this.findItemsOverLimit(detailedItems, 15);

    const weightRestrictedExit = this.findWeightRestrictedExit(scene);
    const returnDirection = this.getReturnDirection(weightRestrictedExit?.direction);

    // Prepare treasure data
    const treasures = detailedItems
      .filter(i => i.isTreasure && i.visible)
      .map(item => ({
        ...item,
        capitalizedId: this.capitalize(item.id)
      }));

    // Prepare exploration data
    const visibleItems = detailedItems
      .filter(i => i.visible)
      .map(item => ({
        ...item,
        capitalizedId: this.capitalize(item.id)
      }));

    const firstVisibleItem = visibleItems[0];

    // Prepare exit data with return directions
    const availableExits = [
      ...(scene.exits?.simple || []),
      ...(scene.exits?.conditional || [])
    ].map(exit => ({
      ...exit,
      capitalizedDirection: this.capitalize(exit.direction),
      returnDirection: this.getReturnDirection(exit.direction)
    }));

    // Prepare conditional access data
    const conditionalExits = scene.exits?.conditional || [];
    const conditionalExit = conditionalExits[0] ? {
      direction: conditionalExits[0].direction,
      requiredFlag: this.extractRequiredFlag(conditionalExits[0]),
      to: conditionalExits[0].to
    } : null;

    return {
      ...scene,
      hasContainerWorkflows,
      hasItemCollectionWorkflow,
      hasWeightManagementWorkflow,
      hasTreasureWorkflow,
      hasExplorationWorkflow,
      hasConditionalAccessWorkflow,
      containers,
      takeableItems,
      firstTakeableItem,
      lightItems,
      mediumItems,
      overLimitItems,
      restrictedDirection: weightRestrictedExit?.direction,
      restrictedDestination: weightRestrictedExit?.to,
      returnDirection,
      treasures,
      visibleItems,
      firstVisibleItem,
      availableExits,
      conditionalExit
    };
  }

  /**
   * Check if scene has container workflows
   */
  private hasContainerWorkflows(items: any[]): boolean {
    return items.some(i => i.isContainer && i.visible);
  }

  /**
   * Check if scene has item collection workflow
   */
  private hasItemCollectionWorkflow(items: any[]): boolean {
    return items.some(i => i.visible && i.canTake);
  }

  /**
   * Check if scene has weight management workflow
   */
  private hasWeightManagementWorkflow(scene: AnalyzedScene): boolean {
    const hasWeightRestrictedExit = this.findWeightRestrictedExit(scene) !== null;
    const hasTakeableItems = (scene.detailedItems || []).some(i => i.visible && i.canTake);
    return hasWeightRestrictedExit && hasTakeableItems;
  }

  /**
   * Check if scene has treasure workflow
   */
  private hasTreasureWorkflow(items: any[]): boolean {
    return items.some(i => i.isTreasure && i.visible);
  }

  /**
   * Check if scene has exploration workflow
   */
  private hasExplorationWorkflow(scene: AnalyzedScene): boolean {
    const hasVisibleItems = (scene.detailedItems || []).some(i => i.visible);
    const hasExits = (scene.exits?.simple?.length || 0) + (scene.exits?.conditional?.length || 0) > 0;
    return hasVisibleItems || hasExits;
  }

  /**
   * Check if scene has conditional access workflow
   * Note: Conditional access is covered by ConditionalAccessTestGenerator,
   * so we don't duplicate it in workflows
   */
  private hasConditionalAccessWorkflow(scene: AnalyzedScene): boolean {
    return false; // Covered by ConditionalAccessTestGenerator
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
   * Find items that together exceed weight limit
   */
  private findItemsOverLimit(items: any[], limit: number): any[] {
    const takeableItems = items.filter(i => i.visible && i.canTake && i.weight !== undefined);
    const sorted = [...takeableItems].sort((a, b) => (b.weight || 0) - (a.weight || 0));

    const selected: any[] = [];
    let totalWeight = 0;

    for (const item of sorted) {
      selected.push(item);
      totalWeight += item.weight || 0;
      if (totalWeight > limit) {
        break;
      }
    }

    return selected;
  }

  /**
   * Extract required flag from conditional exit
   */
  private extractRequiredFlag(exit: any): string {
    if (typeof exit.condition === 'string') {
      return exit.condition;
    }
    // Try to extract flag name from condition
    return exit.condition?.flag || exit.condition || 'unknown_flag';
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
    return 'workflows.test.ts';
  }

  /**
   * Get output directory
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/workflows';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    const detailedItems = scene.detailedItems || [];

    // Generate if scene has any workflow-worthy features
    return this.hasContainerWorkflows(detailedItems) ||
           this.hasItemCollectionWorkflow(detailedItems) ||
           this.hasWeightManagementWorkflow(scene) ||
           this.hasTreasureWorkflow(detailedItems) ||
           this.hasExplorationWorkflow(scene) ||
           this.hasConditionalAccessWorkflow(scene);
  }
}
