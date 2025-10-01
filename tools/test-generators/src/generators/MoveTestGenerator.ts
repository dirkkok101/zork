/**
 * MoveTestGenerator - Generates movement command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { moveTestTemplate } from '../templates/move-test.template.js';

export class MoveTestGenerator extends BaseGenerator {
  constructor() {
    super(moveTestTemplate);
  }

  /**
   * Generate movement command tests
   */
  generate(scene: AnalyzedScene): string {
    const code = this.template(scene);
    return this.format(code);
  }

  /**
   * Get the output filename for move tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_movement.test.ts';
  }

  /**
   * Get the output directory for move tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/move_command';
  }
}
