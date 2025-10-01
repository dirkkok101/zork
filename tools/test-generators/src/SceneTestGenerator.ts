/**
 * SceneTestGenerator - Main orchestrator for scene test generation
 */

import * as path from 'path';
import { SceneAnalyzer } from './utils/sceneAnalyzer.js';
import { HelperGenerator } from './generators/HelperGenerator.js';
import { LookTestGenerator } from './generators/LookTestGenerator.js';
import { MoveTestGenerator } from './generators/MoveTestGenerator.js';
import { FactoryGenerator } from './generators/FactoryGenerator.js';
import { TakeTestGenerator } from './generators/TakeTestGenerator.js';
import { DropTestGenerator } from './generators/DropTestGenerator.js';
import { ExamineTestGenerator } from './generators/ExamineTestGenerator.js';
import { OpenTestGenerator } from './generators/OpenTestGenerator.js';
import { CloseTestGenerator } from './generators/CloseTestGenerator.js';
import { ReadTestGenerator } from './generators/ReadTestGenerator.js';
import { PutTestGenerator } from './generators/PutTestGenerator.js';
import { InventoryTestGenerator } from './generators/InventoryTestGenerator.js';
import { StateValidationTestGenerator } from './generators/StateValidationTestGenerator.js';
import { ScoringTestGenerator } from './generators/ScoringTestGenerator.js';
import { ConditionalAccessTestGenerator } from './generators/ConditionalAccessTestGenerator.js';
import { WeightTestGenerator } from './generators/WeightTestGenerator.js';
import { writeFile, ensureDir, getSceneTestDir } from './utils/fileUtils.js';
import { GeneratorOptions, GenerationResult, GeneratedFile } from './types/GeneratorTypes.js';

export class SceneTestGenerator {
  private analyzer: SceneAnalyzer;
  private helperGenerator: HelperGenerator;
  private lookTestGenerator: LookTestGenerator;
  private moveTestGenerator: MoveTestGenerator;
  private factoryGenerator: FactoryGenerator;
  private takeTestGenerator: TakeTestGenerator;
  private dropTestGenerator: DropTestGenerator;
  private examineTestGenerator: ExamineTestGenerator;
  private openTestGenerator: OpenTestGenerator;
  private closeTestGenerator: CloseTestGenerator;
  private readTestGenerator: ReadTestGenerator;
  private putTestGenerator: PutTestGenerator;
  private inventoryTestGenerator: InventoryTestGenerator;
  private stateValidationTestGenerator: StateValidationTestGenerator;
  private scoringTestGenerator: ScoringTestGenerator;
  private conditionalAccessTestGenerator: ConditionalAccessTestGenerator;
  private weightTestGenerator: WeightTestGenerator;

  constructor(dataPath?: string) {
    this.analyzer = new SceneAnalyzer(dataPath);
    this.helperGenerator = new HelperGenerator();
    this.lookTestGenerator = new LookTestGenerator();
    this.moveTestGenerator = new MoveTestGenerator();
    this.factoryGenerator = new FactoryGenerator();
    this.takeTestGenerator = new TakeTestGenerator();
    this.dropTestGenerator = new DropTestGenerator();
    this.examineTestGenerator = new ExamineTestGenerator();
    this.openTestGenerator = new OpenTestGenerator();
    this.closeTestGenerator = new CloseTestGenerator();
    this.readTestGenerator = new ReadTestGenerator();
    this.putTestGenerator = new PutTestGenerator();
    this.inventoryTestGenerator = new InventoryTestGenerator();
    this.stateValidationTestGenerator = new StateValidationTestGenerator();
    this.scoringTestGenerator = new ScoringTestGenerator();
    this.conditionalAccessTestGenerator = new ConditionalAccessTestGenerator();
    this.weightTestGenerator = new WeightTestGenerator();
  }

  /**
   * Generate all tests for a scene
   */
  async generateScene(sceneId: string, options: GeneratorOptions = {}): Promise<GenerationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      // Analyze the scene
      if (options.verbose) {
        console.log(`Analyzing scene: ${sceneId}`);
      }

      const scene = await this.analyzer.analyzeScene(sceneId);

      if (options.verbose) {
        console.log(`Scene complexity: ${scene.complexity}`);
        console.log(`Has items: ${scene.hasItems}`);
        console.log(`Has monsters: ${scene.hasMonsters}`);
        console.log(`Has conditional exits: ${scene.hasConditionalExits}`);
      }

      // Get output directory
      const baseDir = options.outputDir || getSceneTestDir(sceneId);

      // Generate files
      const generatedFiles = await this.generateFiles(scene, baseDir, options);
      files.push(...generatedFiles);

      // Write files if not dry run
      if (!options.dryRun) {
        for (const file of generatedFiles) {
          if (options.verbose) {
            console.log(`Writing: ${file.path}`);
          }
          writeFile(file.path, file.content);
        }
      }

      return {
        sceneId,
        files,
        success: true,
        errors,
        warnings
      };

    } catch (error: any) {
      errors.push(error.message);
      return {
        sceneId,
        files,
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Generate all test files for a scene
   */
  private async generateFiles(scene: any, baseDir: string, options: GeneratorOptions): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // 1. Generate scene helper
    const helperPath = path.join(baseDir, this.helperGenerator.getDir(scene), this.helperGenerator.getFilename(scene));
    const helperContent = this.helperGenerator.generate(scene);
    files.push({
      path: helperPath,
      content: helperContent,
      type: 'helper'
    });

    // 2. Generate integration test factory
    const factoryPath = path.join(baseDir, this.factoryGenerator.getDir(scene), this.factoryGenerator.getFilename(scene));
    const factoryContent = this.factoryGenerator.generate(scene);
    files.push({
      path: factoryPath,
      content: factoryContent,
      type: 'factory'
    });

    // 3. Generate look command tests
    const lookTestPath = path.join(baseDir, this.lookTestGenerator.getDir(scene), this.lookTestGenerator.getFilename(scene));
    const lookTestContent = this.lookTestGenerator.generate(scene);
    files.push({
      path: lookTestPath,
      content: lookTestContent,
      type: 'test'
    });

    // 4. Generate move command tests (if scene has exits)
    if (scene.exits.simple.length > 0 || scene.exits.conditional.length > 0 || scene.exits.blocked.length > 0) {
      const moveTestPath = path.join(baseDir, this.moveTestGenerator.getDir(scene), this.moveTestGenerator.getFilename(scene));
      const moveTestContent = this.moveTestGenerator.generate(scene);
      files.push({
        path: moveTestPath,
        content: moveTestContent,
        type: 'test'
      });
    }

    // 5. Generate take command tests (if scene has takeable items)
    if (this.takeTestGenerator.shouldGenerate(scene)) {
      const takeTestPath = path.join(baseDir, this.takeTestGenerator.getDir(scene), this.takeTestGenerator.getFilename(scene));
      const takeTestContent = this.takeTestGenerator.generate(scene);
      files.push({
        path: takeTestPath,
        content: takeTestContent,
        type: 'test'
      });
    }

    // 6. Generate drop command tests (if scene has takeable items)
    if (this.dropTestGenerator.shouldGenerate(scene)) {
      const dropTestPath = path.join(baseDir, this.dropTestGenerator.getDir(scene), this.dropTestGenerator.getFilename(scene));
      const dropTestContent = this.dropTestGenerator.generate(scene);
      files.push({
        path: dropTestPath,
        content: dropTestContent,
        type: 'test'
      });
    }

    // 7. Generate examine command tests (if scene has visible items)
    if (this.examineTestGenerator.shouldGenerate(scene)) {
      const examineTestPath = path.join(baseDir, this.examineTestGenerator.getDir(scene), this.examineTestGenerator.getFilename(scene));
      const examineTestContent = this.examineTestGenerator.generate(scene);
      files.push({
        path: examineTestPath,
        content: examineTestContent,
        type: 'test'
      });
    }

    // 8. Generate open command tests (if scene has openable containers)
    if (this.openTestGenerator.shouldGenerate(scene)) {
      const openTestPath = path.join(baseDir, this.openTestGenerator.getDir(scene), this.openTestGenerator.getFilename(scene));
      const openTestContent = this.openTestGenerator.generate(scene);
      files.push({
        path: openTestPath,
        content: openTestContent,
        type: 'test'
      });
    }

    // 9. Generate close command tests (if scene has closeable containers)
    if (this.closeTestGenerator.shouldGenerate(scene)) {
      const closeTestPath = path.join(baseDir, this.closeTestGenerator.getDir(scene), this.closeTestGenerator.getFilename(scene));
      const closeTestContent = this.closeTestGenerator.generate(scene);
      files.push({
        path: closeTestPath,
        content: closeTestContent,
        type: 'test'
      });
    }

    // 10. Generate read command tests (if scene has readable items)
    if (this.readTestGenerator.shouldGenerate(scene)) {
      const readTestPath = path.join(baseDir, this.readTestGenerator.getDir(scene), this.readTestGenerator.getFilename(scene));
      const readTestContent = this.readTestGenerator.generate(scene);
      files.push({
        path: readTestPath,
        content: readTestContent,
        type: 'test'
      });
    }

    // 11. Generate put command tests (if scene has containers and takeable items)
    if (this.putTestGenerator.shouldGenerate(scene)) {
      const putTestPath = path.join(baseDir, this.putTestGenerator.getDir(scene), this.putTestGenerator.getFilename(scene));
      const putTestContent = this.putTestGenerator.generate(scene);
      files.push({
        path: putTestPath,
        content: putTestContent,
        type: 'test'
      });
    }

    // 12. Generate inventory command tests (universal command, always generated)
    if (this.inventoryTestGenerator.shouldGenerate(scene)) {
      const inventoryTestPath = path.join(baseDir, this.inventoryTestGenerator.getDir(scene), this.inventoryTestGenerator.getFilename(scene));
      const inventoryTestContent = this.inventoryTestGenerator.generate(scene);
      files.push({
        path: inventoryTestPath,
        content: inventoryTestContent,
        type: 'test'
      });
    }

    // 13. Generate state validation tests (if scene has stateful items or conditional exits)
    if (this.stateValidationTestGenerator.shouldGenerate(scene)) {
      const stateValidationTestPath = path.join(baseDir, this.stateValidationTestGenerator.getDir(scene), this.stateValidationTestGenerator.getFilename(scene));
      const stateValidationTestContent = this.stateValidationTestGenerator.generate(scene);
      files.push({
        path: stateValidationTestPath,
        content: stateValidationTestContent,
        type: 'test'
      });
    }

    // 14. Generate scoring tests (if scene has treasures or is trophy case scene)
    if (this.scoringTestGenerator.shouldGenerate(scene)) {
      const scoringTestPath = path.join(baseDir, this.scoringTestGenerator.getDir(scene), this.scoringTestGenerator.getFilename(scene));
      const scoringTestContent = this.scoringTestGenerator.generate(scene);
      files.push({
        path: scoringTestPath,
        content: scoringTestContent,
        type: 'test'
      });
    }

    // 15. Generate conditional access tests (if scene has conditional exits)
    if (this.conditionalAccessTestGenerator.shouldGenerate(scene)) {
      const conditionalAccessTestPath = path.join(baseDir, this.conditionalAccessTestGenerator.getDir(scene), this.conditionalAccessTestGenerator.getFilename(scene));
      const conditionalAccessTestContent = this.conditionalAccessTestGenerator.generate(scene);
      files.push({
        path: conditionalAccessTestPath,
        content: conditionalAccessTestContent,
        type: 'test'
      });
    }

    // 16. Generate weight restriction tests (if scene has weight-restricted exits)
    if (this.weightTestGenerator.shouldGenerate(scene)) {
      const weightTestPath = path.join(baseDir, this.weightTestGenerator.getDir(scene), this.weightTestGenerator.getFilename(scene));
      const weightTestContent = this.weightTestGenerator.generate(scene);
      files.push({
        path: weightTestPath,
        content: weightTestContent,
        type: 'test'
      });
    }

    // 17. Generate setup file if it doesn't exist
    const setupPath = path.join(baseDir, 'integration_tests', 'setup.ts');
    const setupContent = this.generateSetupFile();
    files.push({
      path: setupPath,
      content: setupContent,
      type: 'test'
    });

    return files;
  }

  /**
   * Generate setup file for tests
   */
  private generateSetupFile(): string {
    return `/**
 * Test Setup for Integration Tests
 * Provides real data loading and service initialization for integration testing
 */

import { jest } from '@jest/globals';

/**
 * Setup for integration tests - unmock fs and enable real file system access
 * This allows us to load real game data for integration testing
 */
export function setupIntegrationTest(): void {
  // Unmock fs for integration tests - we want to load real data
  jest.unmock('fs/promises');
  jest.unmock('fs');

  // Set environment to indicate we're running integration tests
  process.env.NODE_ENV = 'integration_test';

  // Increase timeout for integration tests that load real data
  jest.setTimeout(15000);
}

/**
 * Cleanup after integration tests
 */
export function teardownIntegrationTest(): void {
  // Reset environment
  delete process.env.NODE_ENV;

  // Reset timeout to default
  jest.setTimeout(5000);
}

// Global setup for all tests in this directory
beforeAll(() => {
  setupIntegrationTest();
});

afterAll(() => {
  teardownIntegrationTest();
});
`;
  }

  /**
   * Get the output directory for generated files
   */
  private getDir(generator: any, scene: any): string {
    if (typeof generator.getDir === 'function') {
      return generator.getDir(scene);
    }
    return 'integration_tests/helpers';
  }
}
