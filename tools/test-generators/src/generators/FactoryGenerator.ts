/**
 * FactoryGenerator - Generates integration test factory
 */

import { BaseGenerator } from './BaseGenerator.js';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { factoryTemplate } from '../templates/factory.template.js';

export class FactoryGenerator extends BaseGenerator {
  constructor() {
    super(factoryTemplate);
  }

  /**
   * Generate integration test factory
   */
  generate(scene: AnalyzedScene): string {
    const code = this.template(scene);
    return this.format(code);
  }

  /**
   * Get the output filename for the factory
   */
  getFilename(scene: AnalyzedScene): string {
    return 'integration_test_factory.ts';
  }

  /**
   * Get the output directory for the factory
   */
  getDir(scene: AnalyzedScene): string {
    return 'integration_tests/look_command/helpers';
  }
}
