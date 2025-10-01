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
    // Extract a unique substring from firstVisitDescription for verification
    const firstVisitDescriptionSubstring = this.extractDescriptionSubstring(
      scene.firstVisitDescription || scene.description
    );

    const templateData = {
      ...scene,
      firstVisitDescriptionSubstring
    };

    const code = this.template(templateData);
    return this.format(code);
  }

  /**
   * Extract a distinctive substring from description for testing
   */
  private extractDescriptionSubstring(description: string): string {
    // Get first sentence or first 50 characters, whichever is shorter
    const firstSentence = description.split(/[.!?]/)[0];
    const substring = firstSentence.length > 50
      ? firstSentence.substring(0, 50)
      : firstSentence;

    return substring.trim();
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
