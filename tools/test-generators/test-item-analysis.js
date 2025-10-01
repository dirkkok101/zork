/**
 * Test ItemAnalyzer and InteractionAnalyzer on kitchen scene
 */

import { SceneAnalyzer } from './src/utils/sceneAnalyzer.js';
import { ItemAnalyzer } from './src/utils/itemAnalyzer.js';
import { InteractionAnalyzer } from './src/utils/interactionAnalyzer.js';

async function testAnalysis() {
  console.log('\n=== Testing Item Analysis on Kitchen Scene ===\n');

  try {
    const sceneAnalyzer = new SceneAnalyzer();
    const scene = await sceneAnalyzer.analyzeScene('kitchen');

    console.log('📋 Basic Scene Info:');
    console.log(`  ID: ${scene.id}`);
    console.log(`  Title: ${scene.title}`);
    console.log(`  Complexity: ${scene.complexity}`);
    console.log(`  Has Items: ${scene.hasItems}`);

    if (scene.detailedItems) {
      console.log(`\n🔍 Detailed Items (${scene.detailedItems.length}):`);
      scene.detailedItems.forEach(item => {
        console.log(`\n  ${item.name} (${item.id}):`);
        console.log(`    Type: ${item.type}`);
        console.log(`    Portable: ${item.portable}`);
        console.log(`    Weight: ${item.weight}`);
        console.log(`    Capabilities:`);
        console.log(`      - Can Take: ${item.canTake}`);
        console.log(`      - Can Examine: ${item.canExamine}`);
        console.log(`      - Can Read: ${item.canRead}`);
        console.log(`      - Is Container: ${item.isContainer}`);
        if (item.isContainer) {
          console.log(`      - Can Open: ${item.canOpen}`);
          console.log(`      - Can Close: ${item.canClose}`);
          console.log(`      - Capacity: ${item.capacity}`);
        }
      });
    }

    if (scene.interactionAnalysis) {
      console.log(`\n⚡ Interaction Analysis:`);
      console.log(`  Total Estimated Tests: ${scene.interactionAnalysis.totalEstimatedTests}`);

      console.log(`\n  📝 Test Scenarios:`);
      scene.interactionAnalysis.testScenarios.forEach(scenario => {
        console.log(`\n    ${scenario.command.toUpperCase()} Command:`);
        console.log(`      Items: ${scenario.items.join(', ')}`);
        console.log(`      Estimated Tests: ${scenario.estimatedTests}`);
        console.log(`      Test Types: ${scenario.testTypes.length}`);
      });
    }

    if (scene.testRequirements) {
      console.log(`\n✅ Test Requirements:`);
      console.log(`  Needs Take Tests: ${scene.testRequirements.needsTakeTests}`);
      console.log(`  Needs Drop Tests: ${scene.testRequirements.needsDropTests}`);
      console.log(`  Needs Examine Tests: ${scene.testRequirements.needsExamineTests}`);
      console.log(`  Needs Read Tests: ${scene.testRequirements.needsReadTests}`);
      console.log(`  Needs Open/Close Tests: ${scene.testRequirements.needsOpenCloseTests}`);
      console.log(`  Needs Put Tests: ${scene.testRequirements.needsPutTests}`);
      console.log(`  Needs State Tests: ${scene.testRequirements.needsStateTests}`);
      console.log(`  Needs Scoring Tests: ${scene.testRequirements.needsScoringTests}`);
      console.log(`  Estimated Test Count: ${scene.testRequirements.estimatedTestCount}`);
    }

    if (scene.workflows && scene.workflows.length > 0) {
      console.log(`\n🔄 Workflow Scenarios (${scene.workflows.length}):`);
      scene.workflows.forEach(workflow => {
        console.log(`\n  ${workflow.name}:`);
        console.log(`    Steps: ${workflow.steps.join(' → ')}`);
        console.log(`    Items: ${workflow.items.join(', ')}`);
      });
    }

    console.log('\n✅ Analysis Complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAnalysis();
