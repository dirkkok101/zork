/**
 * InteractionAnalyzer - Maps items to testable interactions
 *
 * Determines which commands can be applied to which items,
 * and generates test scenarios based on item capabilities.
 */

import { AnalyzedItem } from './itemAnalyzer.js';

export interface TestScenario {
  command: string;
  items: string[];
  testTypes: string[];
  estimatedTests: number;
}

export interface CommandMapping {
  command: string;
  applicableItems: AnalyzedItem[];
  requiresPreCondition?: boolean;
  preCondition?: string;
  testScenarios: string[];
}

export class InteractionAnalyzer {
  /**
   * Determine all testable interactions for a set of items
   */
  analyzeInteractions(items: AnalyzedItem[]): {
    commandMappings: CommandMapping[];
    testScenarios: TestScenario[];
    totalEstimatedTests: number;
  } {
    const commandMappings: CommandMapping[] = [];

    // Analyze each command type
    commandMappings.push(this.analyzeTakeCommand(items));
    commandMappings.push(this.analyzeDropCommand(items));
    commandMappings.push(this.analyzeExamineCommand(items));
    commandMappings.push(this.analyzeReadCommand(items));
    commandMappings.push(this.analyzeOpenCommand(items));
    commandMappings.push(this.analyzeCloseCommand(items));
    commandMappings.push(this.analyzePutCommand(items));
    commandMappings.push(this.analyzeInventoryCommand(items));

    // Generate test scenarios
    const testScenarios = this.generateTestScenarios(commandMappings);

    // Calculate total estimated tests
    const totalEstimatedTests = testScenarios.reduce((sum, scenario) => sum + scenario.estimatedTests, 0);

    return {
      commandMappings: commandMappings.filter(m => m.applicableItems.length > 0),
      testScenarios,
      totalEstimatedTests
    };
  }

  /**
   * Analyze take command applicability
   */
  private analyzeTakeCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canTake);

    return {
      command: 'take',
      applicableItems,
      testScenarios: [
        'basic_take_individual_items',
        'take_with_aliases',
        'take_already_taken',
        'take_command_variations',
        'take_and_state_tracking'
      ]
    };
  }

  /**
   * Analyze drop command applicability
   */
  private analyzeDropCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canDrop);

    return {
      command: 'drop',
      applicableItems,
      testScenarios: [
        'basic_drop_items',
        'drop_not_in_inventory',
        'drop_command_variations',
        'drop_and_state_tracking'
      ]
    };
  }

  /**
   * Analyze examine command applicability
   */
  private analyzeExamineCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canExamine);

    return {
      command: 'examine',
      applicableItems,
      testScenarios: [
        'basic_examine_items',
        'examine_with_aliases',
        'examine_container_contents',
        'examine_command_variations'
      ]
    };
  }

  /**
   * Analyze read command applicability
   */
  private analyzeReadCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canRead);

    return {
      command: 'read',
      applicableItems,
      testScenarios: [
        'basic_read_items',
        'read_text_content',
        'read_non_readable_items',
        'read_command_variations'
      ]
    };
  }

  /**
   * Analyze open command applicability
   */
  private analyzeOpenCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canOpen);

    return {
      command: 'open',
      applicableItems,
      testScenarios: [
        'basic_open_containers',
        'open_already_open',
        'open_non_containers',
        'open_and_reveal_contents',
        'open_command_variations'
      ]
    };
  }

  /**
   * Analyze close command applicability
   */
  private analyzeCloseCommand(items: AnalyzedItem[]): CommandMapping {
    const applicableItems = items.filter(i => i.canClose);

    return {
      command: 'close',
      applicableItems,
      testScenarios: [
        'basic_close_containers',
        'close_already_closed',
        'close_non_containers',
        'close_command_variations'
      ]
    };
  }

  /**
   * Analyze put command applicability
   */
  private analyzePutCommand(items: AnalyzedItem[]): CommandMapping {
    const containers = items.filter(i => i.canPutInto);
    const portableItems = items.filter(i => i.portable);

    // Put requires both containers and portable items
    const applicableItems = containers.length > 0 && portableItems.length > 0 ? containers : [];

    return {
      command: 'put',
      applicableItems,
      requiresPreCondition: true,
      preCondition: 'Container must be open',
      testScenarios: [
        'basic_put_in_container',
        'put_in_closed_container',
        'put_container_capacity',
        'put_command_variations'
      ]
    };
  }

  /**
   * Analyze inventory command applicability
   */
  private analyzeInventoryCommand(items: AnalyzedItem[]): CommandMapping {
    // Inventory is always applicable if there are any portable items
    const applicableItems = items.filter(i => i.portable);

    return {
      command: 'inventory',
      applicableItems,
      testScenarios: [
        'basic_inventory_empty',
        'inventory_with_items',
        'inventory_command_variations'
      ]
    };
  }

  /**
   * Generate test scenarios from command mappings
   */
  private generateTestScenarios(commandMappings: CommandMapping[]): TestScenario[] {
    const scenarios: TestScenario[] = [];

    for (const mapping of commandMappings) {
      if (mapping.applicableItems.length === 0) {
        continue;
      }

      const itemIds = mapping.applicableItems.map(i => i.id);

      scenarios.push({
        command: mapping.command,
        items: itemIds,
        testTypes: mapping.testScenarios,
        estimatedTests: this.estimateTestCount(mapping)
      });
    }

    return scenarios;
  }

  /**
   * Estimate number of tests for a command mapping
   */
  private estimateTestCount(mapping: CommandMapping): number {
    const itemCount = mapping.applicableItems.length;
    const scenarioCount = mapping.testScenarios.length;

    // Base calculation: scenarios × items + general tests
    let estimatedTests = scenarioCount * Math.min(itemCount, 3); // Test up to 3 items per scenario
    estimatedTests += 5; // General command tests (errors, syntax, etc.)

    // Adjust for specific commands
    switch (mapping.command) {
      case 'take':
        estimatedTests += itemCount * 2; // Individual take + alias tests
        break;
      case 'drop':
        estimatedTests += itemCount; // Individual drop tests
        break;
      case 'examine':
        estimatedTests += itemCount * 2; // Examine + alias tests
        break;
      case 'read':
        estimatedTests += itemCount * 3; // Read + content validation
        break;
      case 'open':
      case 'close':
        estimatedTests += itemCount * 3; // Open/close + state tests
        break;
      case 'put':
        estimatedTests += itemCount * 4; // Put variations
        break;
      case 'inventory':
        estimatedTests += 8; // Fixed set of inventory tests
        break;
    }

    return estimatedTests;
  }

  /**
   * Determine if a scene needs state validation tests
   */
  needsStateValidation(items: AnalyzedItem[]): boolean {
    return items.some(i => i.hasState);
  }

  /**
   * Determine if a scene needs scoring tests
   */
  needsScoringTests(items: AnalyzedItem[]): boolean {
    return items.some(i => i.isTreasure);
  }

  /**
   * Determine if a scene needs weight restriction tests
   */
  needsWeightTests(items: AnalyzedItem[], hasWeightRestrictions: boolean): boolean {
    // Weight tests needed if scene has weight-based exits and heavy items
    if (!hasWeightRestrictions) {
      return false;
    }

    const hasHeavyItems = items.some(i => i.portable && i.weight >= 10);
    return hasHeavyItems;
  }

  /**
   * Generate workflow test scenarios
   */
  generateWorkflowScenarios(items: AnalyzedItem[]): {
    name: string;
    steps: string[];
    items: string[];
  }[] {
    const workflows: {
      name: string;
      steps: string[];
      items: string[];
    }[] = [];

    // Container interaction workflow
    const containers = items.filter(i => i.isContainer && i.initialContents && i.initialContents.length > 0);
    for (const container of containers) {
      workflows.push({
        name: `${container.name}_complete_interaction`,
        steps: [
          'examine_closed',
          'open',
          'examine_open',
          'take_contents',
          'close',
          'examine_closed_again'
        ],
        items: [container.id, ...(container.initialContents || [])]
      });
    }

    // Treasure collection workflow
    const treasures = items.filter(i => i.isTreasure && i.portable);
    if (treasures.length > 0) {
      workflows.push({
        name: 'treasure_collection_workflow',
        steps: [
          'examine_treasure',
          'take_treasure',
          'verify_score',
          'inventory_check'
        ],
        items: treasures.map(t => t.id)
      });
    }

    // Tool usage workflow
    const tools = items.filter(i => i.isTool && i.portable);
    if (tools.length > 0) {
      workflows.push({
        name: 'tool_collection_workflow',
        steps: [
          'examine_tool',
          'take_tool',
          'verify_inventory'
        ],
        items: tools.map(t => t.id)
      });
    }

    return workflows;
  }

  /**
   * Get command priority for generation order
   */
  getCommandPriority(): { command: string; priority: number }[] {
    return [
      { command: 'take', priority: 10 },      // Highest - most fundamental
      { command: 'examine', priority: 9 },
      { command: 'open', priority: 8 },
      { command: 'close', priority: 8 },
      { command: 'drop', priority: 7 },
      { command: 'inventory', priority: 6 },
      { command: 'read', priority: 5 },
      { command: 'put', priority: 4 },
      { command: 'state', priority: 3 },      // State validation
      { command: 'scoring', priority: 2 },    // Scoring tests
      { command: 'workflow', priority: 1 }    // Lowest - complex integrations
    ];
  }
}
