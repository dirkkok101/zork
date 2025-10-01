/**
 * LookTestGenerator - Generates look command tests
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { lookTestTemplate } from '../templates/look-test.template.js';

export class LookTestGenerator extends BaseGenerator {
  constructor() {
    super(lookTestTemplate);
  }

  /**
   * Generate look command tests
   */
  generate(scene: AnalyzedScene): string {
    const code = this.template(scene);
    return this.format(code);
  }

  /**
   * Get the output filename for look tests
   */
  getFilename(scene: AnalyzedScene): string {
    return 'basic_look.test.ts';
  }

  /**
   * Get the output directory for look tests
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/look_command';
  }
}
