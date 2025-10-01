/**
 * ConditionalAccessTestGenerator - Generates conditional access tests
 * Tests for flag-based exits and conditional movement restrictions
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { conditionalAccessTestTemplate } from '../templates/conditional-access.template.js';

export class ConditionalAccessTestGenerator extends BaseGenerator {
  constructor() {
    super(conditionalAccessTestTemplate);
  }

  /**
   * Generate conditional access tests
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

    // 1. Extract conditional exits
    const conditionalExits = (scene.exits?.conditional || []).map((exit: any) => {
      const flagName = this.extractFlagName(exit);
      const errorPattern = this.extractErrorPattern(exit, flagName, detailedItems);
      const returnDirection = this.getReverseDirection(exit.direction);
      const hasOpenCommand = this.hasOpenCommand(flagName, detailedItems);

      return {
        direction: exit.direction,
        to: exit.to,
        flagName: flagName,
        errorPattern: errorPattern,
        returnDirection: returnDirection,
        hasOpenCommand: hasOpenCommand,
        condition: exit.condition
      };
    });

    // 2. Extract unconditional exits (simple exits always available)
    const unconditionalExits = (scene.exits?.simple || []).map((exit: any) => ({
      direction: exit.direction,
      to: exit.to
    }));

    // 3. Get first item name for examine commands in tests
    const firstItem = detailedItems.find(i => i.visible);
    const firstItemName = firstItem?.name || 'item';

    // 4. Get first takeable item for inventory operation tests
    const firstTakeableItem = detailedItems.find(i => i.visible && i.canTake);
    const hasTakeableItem = !!firstTakeableItem;

    return {
      ...scene,
      conditionalExits: conditionalExits,
      unconditionalExits: unconditionalExits,
      hasMultipleConditionalExits: conditionalExits.length > 1,
      hasUnconditionalExits: unconditionalExits.length > 0,
      firstItemName: firstItemName,
      firstTakeableItem: firstTakeableItem ? firstTakeableItem.name : 'item',
      hasTakeableItem: hasTakeableItem
    };
  }

  /**
   * Extract flag name from exit condition
   */
  private extractFlagName(exit: any): string {
    if (!exit.condition) return 'unknown_flag';

    const condition = exit.condition.toString();

    // Common patterns:
    // 1. "flag:door_windo_open" -> "door_windo_open"
    // 2. "door_windo_open" -> "door_windo_open"
    // 3. Function/expression -> try to extract meaningful name

    if (condition.includes('flag:')) {
      // Extract flag name after "flag:"
      const parts = condition.split('flag:');
      if (parts.length > 1) {
        return parts[1].trim().replace(/[^a-zA-Z0-9_]/g, '');
      }
    }

    // If it's a simple flag name, use it directly
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(condition)) {
      return condition;
    }

    // Try to extract flag name from getFlag calls
    if (condition.includes('getFlag')) {
      const match = condition.match(/getFlag\(['"]([^'"]+)['"]\)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Default: use direction-based flag name
    return `${exit.direction}_accessible`;
  }

  /**
   * Extract error pattern from exit condition or metadata
   */
  private extractErrorPattern(exit: any, flagName: string, items: any[]): string {
    // If exit has explicit error message (check both blockedMessage and failureMessage)
    const errorMessage = exit.blockedMessage || exit.failureMessage;
    if (errorMessage) {
      return this.escapeRegexPattern(errorMessage);
    }

    // Try to find related item and generate error pattern
    const relatedItem = this.findRelatedItem(flagName, items);
    if (relatedItem) {
      // Common patterns: "The {item} is closed", "{item} blocks the way", etc.
      return `(?:closed|blocked|locked|cannot)`;
    }

    // Generic error pattern (more flexible to handle game's flavor text)
    return `.+`;  // Match any non-empty message
  }

  /**
   * Escape special regex characters from error message
   */
  private escapeRegexPattern(message: string): string {
    return message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Find item related to a flag
   */
  private findRelatedItem(flagName: string, items: any[]): string | null {
    if (!flagName) return null;

    const flagLower = flagName.toLowerCase();

    for (const item of items) {
      const itemIdLower = item.id.toLowerCase();
      const itemNameLower = (item.name || '').toLowerCase();

      // Check if flag contains item id/name or vice versa
      if (
        flagLower.includes(itemIdLower) ||
        itemIdLower.includes(flagLower) ||
        flagLower.includes(itemNameLower) ||
        itemNameLower.includes(flagLower)
      ) {
        return item.id;
      }
    }

    return null;
  }

  /**
   * Check if there's an open command for the flag
   */
  private hasOpenCommand(flagName: string, items: any[]): boolean {
    // If flag name suggests openable item (contains "open", "door", "window", "gate")
    const openableKeywords = ['open', 'door', 'window', 'gate', 'hatch', 'trapdoor'];
    const flagLower = flagName.toLowerCase();

    if (openableKeywords.some(keyword => flagLower.includes(keyword))) {
      return true;
    }

    // Check if there's a related item that can be opened
    const relatedItem = items.find(item => {
      const itemIdLower = item.id.toLowerCase();
      return flagLower.includes(itemIdLower) && item.canOpen;
    });

    return !!relatedItem;
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
      'in': 'out',
      'out': 'in',
      'northeast': 'southwest',
      'northwest': 'southeast',
      'southeast': 'northwest',
      'southwest': 'northeast'
    };

    return reverseMap[direction.toLowerCase()] || null;
  }

  /**
   * Get the output filename for conditional access tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'conditional_access.test.ts';
  }

  /**
   * Get the output directory for conditional access tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/conditional_access';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has conditional exits
    const conditionalExits = scene.exits?.conditional || [];
    return conditionalExits.length > 0;
  }
}
