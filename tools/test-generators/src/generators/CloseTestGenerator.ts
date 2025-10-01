/**
 * Close Test Generator
 * Generates comprehensive tests for the Close command
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types.js';
import { closeTestTemplate } from '../templates/close-test.template.js';

export class CloseTestGenerator extends BaseGenerator {
  constructor() {
    super(closeTestTemplate);
  }

  generate(scene: AnalyzedScene): string {
    const templateData = this.prepareTemplateData(scene);
    const code = this.template(templateData);
    return this.format(code);
  }

  private prepareTemplateData(scene: AnalyzedScene): any {
    const detailedItems = scene.detailedItems || [];

    // Filter for closeable containers (containers that can be opened/closed)
    const closeableContainers = detailedItems.filter(i => i.isContainer && i.canOpen);

    // Get non-closeable items for error testing
    const nonCloseableItems = detailedItems.filter(i => !i.canOpen && i.visible);

    // Prepare closeable containers with capitalized IDs and aliases
    const preparedCloseableContainers = closeableContainers.map(item => ({
      ...item,
      capitalizedId: this.capitalize(item.id),
      aliases: item.aliases.map((a: string) => a.toLowerCase()),
      initialContents: item.initialContents || []
    }));

    return {
      ...scene,
      closeableContainers: preparedCloseableContainers,
      nonCloseableItems,
      multipleCloseableContainers: closeableContainers.length > 1,
      firstCloseableContainer: preparedCloseableContainers.length > 0 ? preparedCloseableContainers[0] : null,
      firstNonCloseableItem: nonCloseableItems.length > 0 ? nonCloseableItems[0] : null
    };
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  shouldGenerate(scene: AnalyzedScene): boolean {
    const detailedItems = scene.detailedItems || [];
    // Generate if scene has any closeable containers
    return detailedItems.some(i => i.isContainer && i.canOpen);
  }

  getFilename(scene: AnalyzedScene): string {
    return 'basic_close.test.ts';
  }

  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/close_command';
  }
}
