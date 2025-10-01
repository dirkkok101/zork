/**
 * Base class for all code generators
 */

import Handlebars from 'handlebars';
import { AnalyzedScene } from '../types/GeneratorTypes.js';
import { formatCode } from '../utils/fileUtils.js';

export abstract class BaseGenerator {
  protected template: HandlebarsTemplateDelegate;

  constructor(templateString: string) {
    this.template = Handlebars.compile(templateString);
    this.registerHelpers();
  }

  /**
   * Generate code from analyzed scene data
   */
  abstract generate(scene: AnalyzedScene): string;

  /**
   * Register custom Handlebars helpers
   */
  protected registerHelpers(): void {
    // Helper: pluralize
    Handlebars.registerHelper('pluralize', function(count: number, singular: string, plural?: string) {
      return count === 1 ? singular : (plural || singular + 's');
    });

    // Helper: uppercase first letter
    Handlebars.registerHelper('capitalize', function(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper: conditional comparison
    Handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b;
    });

    // Helper: greater than
    Handlebars.registerHelper('gt', function(a: number, b: number) {
      return a > b;
    });

    // Helper: join array with comma
    Handlebars.registerHelper('join', function(arr: string[], separator: string = ', ') {
      return arr.join(separator);
    });

    // Helper: get first element of array
    Handlebars.registerHelper('first', function(arr: any[]) {
      return arr && arr.length > 0 ? arr[0] : null;
    });
  }

  /**
   * Format generated code
   */
  protected format(code: string): string {
    return formatCode(code);
  }
}
