#!/usr/bin/env node
/**
 * CLI for Scene Test Generator
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SceneTestGenerator } from './SceneTestGenerator.js';
import { GeneratorOptions } from './types/GeneratorTypes.js';

const program = new Command();

program
  .name('scene-test-generator')
  .description('Generate integration tests for Zork scenes')
  .version('1.0.0');

program
  .command('generate-scene <sceneId>')
  .description('Generate tests for a specific scene')
  .option('-o, --output <dir>', 'Output directory')
  .option('-d, --dry-run', 'Show what would be generated without writing files')
  .option('-v, --verbose', 'Verbose output')
  .option('--overwrite', 'Overwrite existing files')
  .action(async (sceneId: string, options: any) => {
    console.log(chalk.blue(`\n🎮 Generating tests for scene: ${sceneId}\n`));

    const generator = new SceneTestGenerator();

    const generatorOptions: GeneratorOptions = {
      outputDir: options.output,
      dryRun: options.dryRun,
      verbose: options.verbose,
      overwrite: options.overwrite
    };

    try {
      const result = await generator.generateScene(sceneId, generatorOptions);

      if (result.success) {
        console.log(chalk.green(`✓ Successfully generated ${result.files.length} files:\n`));

        result.files.forEach(file => {
          const icon = file.type === 'helper' ? '🔧' :
                      file.type === 'factory' ? '🏭' : '📝';
          console.log(`  ${icon} ${file.path}`);
        });

        if (result.warnings.length > 0) {
          console.log(chalk.yellow(`\n⚠️  Warnings:`));
          result.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        if (options.dryRun) {
          console.log(chalk.yellow('\n🔍 Dry run - no files were written'));
        }

      } else {
        console.log(chalk.red(`\n✗ Failed to generate tests for ${sceneId}\n`));
        result.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

    } catch (error: any) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('validate <sceneId>')
  .description('Validate generated tests for a scene')
  .action(async (sceneId: string) => {
    console.log(chalk.blue(`\n🔍 Validating tests for: ${sceneId}\n`));

    // Generate in dry-run mode
    const generator = new SceneTestGenerator();
    const result = await generator.generateScene(sceneId, { dryRun: true, verbose: true });

    if (result.success) {
      console.log(chalk.green(`\n✓ Validation successful!`));
      console.log(`  - ${result.files.length} files would be generated`);
    } else {
      console.log(chalk.red(`\n✗ Validation failed`));
      result.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      process.exit(1);
    }
  });

program.parse();
