/**
 * ExamineTestGenerator - Generates examine command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { examineTestTemplate } from '../templates/examine-test.template.js';

export class ExamineTestGenerator extends BaseGenerator {
  constructor() {
    super(examineTestTemplate);
  }

  /**
   * Generate examine command tests
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

    // Filter items by capability - all visible items can be examined
    const visibleItems = detailedItems.filter(i => i.visible);
    const containers = detailedItems.filter(i => i.isContainer && i.visible);
    const readableItems = detailedItems.filter(i => i.isReadable && i.visible);
    const takeableItems = detailedItems.filter(i => i.canTake && i.visible);

    // Prepare items with helper methods
    const preparedVisibleItems = visibleItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase()),
      // Truncate long examine text for template
      examineText: item.examineText ? this.truncateText(item.examineText, 100) : undefined,
      readText: item.readText ? this.truncateText(item.readText, 100) : undefined
    }));

    const preparedContainers = containers.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      initialContents: item.initialContents || []
    }));

    const preparedReadableItems = readableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      readText: item.readText ? this.truncateText(item.readText, 100) : undefined
    }));

    const preparedTakeableItems = takeableItems.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id)
    }));

    return {
      ...scene,
      visibleItems: preparedVisibleItems,
      containers: preparedContainers,
      readableItems: preparedReadableItems,
      takeableItems: preparedTakeableItems,
      multipleVisibleItems: visibleItems.length > 1,
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
   * Truncate text to specified length and escape special characters for template string literals
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return text;

    // Truncate first
    let result = text.length <= maxLength ? text : text.substring(0, maxLength) + '...';

    // Escape special characters for JavaScript string literals
    result = result
      .replace(/\\/g, '\\\\')  // Backslash must be first
      .replace(/'/g, "\\'")    // Escape single quotes
      .replace(/\n/g, '\\n')   // Escape newlines
      .replace(/\r/g, '\\r')   // Escape carriage returns
      .replace(/\t/g, '\\t');  // Escape tabs

    return result;
  }

  /**
   * Get the output filename for examine tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_examine.test.ts';
  }

  /**
   * Get the output directory for examine tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/examine_command';
  }

  /**
   * Check if this generator should run for the scene
   */
  shouldGenerate(scene: AnalyzedScene): boolean {
    // Only generate if scene has visible items (which can be examined)
    const detailedItems = scene.detailedItems || [];
    return detailedItems.some(i => i.visible);
  }
}
