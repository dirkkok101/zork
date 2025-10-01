/**
 * HelperGenerator - Generates scene helper classes
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { helperTemplate } from '../templates/helper.template.js';

export class HelperGenerator extends BaseGenerator {
  constructor() {
    super(helperTemplate);
  }

  /**
   * Generate scene helper class
   */
  generate(scene: AnalyzedScene): string {
    const code = this.template(scene);
    return this.format(code);
  }

  /**
   * Get the output filename for the helper
   */
  getFilename(scene: AnalyzedScene): string {
    return `${scene.id}_helper.ts`;
  }

  /**
   * Get the output directory for the helper
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/look_command/helpers';
  }
}
