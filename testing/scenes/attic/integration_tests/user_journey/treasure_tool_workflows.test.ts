/**
 * Attic Scene - User Journey Integration Tests
 * Tests realistic player workflows and scenarios for treasure hunting and tool collection
 * Simulates actual gameplay patterns and decision-making processes
 */

import '../look_command/setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from '../look_command/helpers/attic_integration_test_factory';

describe('Attic Scene - User Journey Integration', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('First Time Visitor Journey', () => {
    it('new player explores attic systematically', () => {
      // Player enters attic for first time
      expect(testEnv.atticHelper.isFirstVisit()).toBe(true);
      
      // Look around to get bearings
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySceneDescription(lookResult);
      testEnv.lookCommandHelper.verifyAtticItems(lookResult, false, false);
      
      // No longer first visit
      expect(testEnv.atticHelper.isFirstVisit()).toBe(false);
      
      // Examine each item systematically
      const brickResult = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifySuccess(brickResult);
      testEnv.examineCommandHelper.verifyBrickDescription(brickResult);
      
      const ropeResult = testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.verifySuccess(ropeResult);
      testEnv.examineCommandHelper.verifyRopeDescription(ropeResult);
      
      const knifeResult = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifySuccess(knifeResult);
      testEnv.examineCommandHelper.verifyKnifeDescription(knifeResult);
      
      // Player realizes brick is a container and tries to open it
      const openResult = testEnv.openCommandHelper.executeOpen('brick');
      testEnv.openCommandHelper.verifySuccess(openResult);
      
      // Look inside to see if anything valuable
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifySuccess(lookInResult);
    });

    it('cautious player tests movement before taking items', () => {
      // Player tests if they can leave easily
      const initialMoveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(initialMoveResult);
      
      // Return to attic
      testEnv.moveCommandHelper.executeMoveUp();
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
      
      // Now confident they can leave, start collecting items
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
      
      // Test movement with light load
      const lightMoveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(lightMoveResult);
    });
  });

  describe('Treasure Hunter Journey', () => {
    it('player prioritizes valuable treasure (rope)', () => {
      // Examine rope to confirm it's valuable
      const examineResult = testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      testEnv.examineCommandHelper.verifyTreasureHints(examineResult);
      
      // Take rope as priority treasure
      const takeResult = testEnv.takeCommandHelper.executeTake('rope');
      testEnv.takeCommandHelper.verifySuccess(takeResult);
      testEnv.takeCommandHelper.verifyInventoryContains('rope');
      
      // Check weight - rope is 10 units
      const weight = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      expect(weight).toBe(10);
      
      // Test if can still exit
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      } else {
        testEnv.moveCommandHelper.verifyWeightBasedFailure(moveResult);
      }
    });

    it('greedy player tries to take everything and gets stuck', () => {
      // Player tries to take all valuable items
      testEnv.takeCommandHelper.executeTake('rope');   // 10 weight
      testEnv.takeCommandHelper.executeTake('brick');  // 9 weight  
      testEnv.takeCommandHelper.executeTake('knife');  // 5 weight
      
      // Total: 24 weight - should be over limit
      const totalWeight = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBe(24);
      expect(testEnv.weightBasedExitHelper.canExitDown()).toBe(false);
      
      // Try to leave - should be blocked
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(moveResult);
      testEnv.weightBasedExitHelper.verifyWeightErrorMessage(moveResult);
      
      // Player is stuck and must drop something
      const dropResult = testEnv.weightBasedExitHelper.dropItem('rope');
      testEnv.weightBasedExitHelper.verifyItemDropped(dropResult, 'rope');
      
      // Now should be able to exit with brick + knife (14 weight)
      const exitResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(exitResult);
    });

    it('strategic player optimizes for maximum value within weight limit', () => {
      // Player analyzes item weights
      const knifeWeight = testEnv.weightBasedExitHelper.getItemWeight('knife');
      const brickWeight = testEnv.weightBasedExitHelper.getItemWeight('brick');
      const ropeWeight = testEnv.weightBasedExitHelper.getItemWeight('rope');
      
      expect(knifeWeight).toBe(5);
      expect(brickWeight).toBe(9);
      expect(ropeWeight).toBe(10);
      
      // Player knows weight limit is 10, so takes rope (most valuable single item)
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Verify can exit with just rope
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
        
        // Return for second trip if needed
        testEnv.moveCommandHelper.executeMoveUp();
        
        // Take lighter items on second trip
        testEnv.takeCommandHelper.executeTake('knife');
        
        const secondMoveResult = testEnv.moveCommandHelper.executeMoveDown();
        testEnv.moveCommandHelper.verifyKitchenAccess(secondMoveResult);
      }
    });
  });

  describe('Tool Collector Journey', () => {
    it('practical player prioritizes useful tools over treasure', () => {
      // Player examines knife as potential tool
      const knifeResult = testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.examineCommandHelper.verifySuccess(knifeResult);
      testEnv.examineCommandHelper.verifyWeaponDetails(knifeResult);
      
      // Take knife first (lightest, potentially useful)
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
      
      // Examine brick as potential container
      const brickResult = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifySuccess(brickResult);
      testEnv.examineCommandHelper.verifyContainerDetails(brickResult);
      
      // Open and examine brick for utility
      testEnv.openCommandHelper.executeOpen('brick');
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifySuccess(lookInResult);
      
      // Take brick as container tool
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.verifyInventoryContains('brick');
      
      // Verify can exit with tools (knife + brick = 14 weight)
      const weight = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      expect(weight).toBe(14);
      
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
    });

    it('completionist player collects everything through multiple trips', () => {
      // Trip 1: Take lightest valuable item
      testEnv.takeCommandHelper.executeTake('knife');
      
      let moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      
      // Return for trip 2
      testEnv.moveCommandHelper.executeMoveUp();
      
      // Trip 2: Take medium weight item
      testEnv.takeCommandHelper.executeTake('brick');
      
      moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      
      // Return for trip 3
      testEnv.moveCommandHelper.executeMoveUp();
      
      // Trip 3: Take heaviest item
      testEnv.takeCommandHelper.executeTake('rope');
      
      moveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      }
      
      // Verify collected everything
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
      testEnv.takeCommandHelper.verifyInventoryContains('brick');
      testEnv.takeCommandHelper.verifyInventoryContains('rope');
    });
  });

  describe('Container Exploration Journey', () => {
    it('curious player thoroughly explores container mechanics', () => {
      // Player discovers brick is a container
      const examineResult = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      
      // Try to look inside while closed
      const closedLookResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifyClosedContainer(closedLookResult, 'brick');
      
      // Open the container
      const openResult = testEnv.openCommandHelper.executeOpen('brick');
      testEnv.openCommandHelper.verifySuccess(openResult);
      
      // Look inside now that it's open
      const openLookResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifySuccess(openLookResult);
      
      // Take container while open
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.verifyInventoryContains('brick');
      
      // Verify container state persists in inventory
      testEnv.atticHelper.verifyBrickState(true);
    });

    it('player explores container storage possibilities', () => {
      // Open brick container
      testEnv.openCommandHelper.executeOpen('brick');
      
      // Take other items and try to put them in container
      testEnv.takeCommandHelper.executeTake('knife');
      
      // Note: Put command testing would go here if implemented
      // For now, verify the container is available for storage
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifySuccess(lookInResult);
    });
  });

  describe('Problem-Solving Journey', () => {
    it('player discovers weight limit through trial and error', () => {
      // Player starts by taking heaviest item
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Test movement - should work with single heavy item
      let moveResult = testEnv.moveCommandHelper.executeMoveDown();
      const ropeMoveSuccess = moveResult.success;
      
      if (ropeMoveSuccess) {
        // Return and try adding more
        testEnv.moveCommandHelper.executeMoveUp();
        testEnv.takeCommandHelper.executeTake('knife');
        
        moveResult = testEnv.moveCommandHelper.executeMoveDown();
        const ropeKnifeMoveSuccess = moveResult.success;
        
        if (!ropeKnifeMoveSuccess) {
          // Player discovered the limit is between rope alone and rope+knife
          testEnv.moveCommandHelper.verifyWeightBasedFailure(moveResult);
          
          // Drop knife and try with just rope
          testEnv.weightBasedExitHelper.dropItem('knife');
          
          moveResult = testEnv.moveCommandHelper.executeMoveDown();
          testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
        }
      } else {
        // Single rope is too heavy - player must try smaller items
        testEnv.weightBasedExitHelper.dropItem('rope');
        testEnv.takeCommandHelper.executeTake('knife');
        
        moveResult = testEnv.moveCommandHelper.executeMoveDown();
        testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      }
    });

    it('player adapts strategy based on weight feedback', () => {
      // Initial attempt with all items fails
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      testEnv.takeCommandHelper.executeTake('knife');
      
      const overloadedResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(overloadedResult);
      
      // Player reads the error message and understands the problem
      testEnv.weightBasedExitHelper.verifyWeightErrorMessage(overloadedResult);
      
      // Player drops heaviest item
      testEnv.weightBasedExitHelper.dropItem('rope');
      
      // Try again with remaining items
      const reducedResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(reducedResult);
    });
  });

  describe('Efficiency-Focused Journey', () => {
    it('speed runner optimizes for minimum moves', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Quick assessment: look once
      testEnv.lookCommandHelper.executeBasicLook();
      
      // Take most valuable item that allows exit
      if (testEnv.weightBasedExitHelper.getItemWeight('rope') <= 10) {
        testEnv.takeCommandHelper.executeTake('rope');
      } else {
        testEnv.takeCommandHelper.executeTake('knife');
        testEnv.takeCommandHelper.executeTake('brick');
      }
      
      // Exit immediately
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      
      // Verify minimal move count increase
      const finalMoves = testEnv.moveCommandHelper.getCurrentMoves();
      const movesUsed = finalMoves - initialMoves;
      expect(movesUsed).toBeLessThanOrEqual(5); // look, take(s), move
    });

    it('efficient player uses minimal examine commands', () => {
      // Only examine items that matter for decision making
      testEnv.examineCommandHelper.executeExamine('rope'); // Check if valuable
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Skip examining other items, just exit
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
      }
    });
  });

  describe('Comprehensive Exploration Journey', () => {
    it('thorough player examines everything before deciding', () => {
      // Systematic examination of all items
      const brickResult = testEnv.examineCommandHelper.executeExamine('brick');
      const ropeResult = testEnv.examineCommandHelper.executeExamine('rope');
      const knifeResult = testEnv.examineCommandHelper.executeExamine('knife');
      
      testEnv.examineCommandHelper.verifySuccess(brickResult);
      testEnv.examineCommandHelper.verifySuccess(ropeResult);
      testEnv.examineCommandHelper.verifySuccess(knifeResult);
      
      // Test container functionality
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.lookCommandHelper.executeLookIn('brick');
      
      // Make informed decision based on all information
      const optimalItems = testEnv.weightBasedExitHelper.getOptimalItemCombination();
      
      // Take optimal combination
      optimalItems.forEach(itemId => {
        testEnv.takeCommandHelper.executeTake(itemId);
      });
      
      // Verify can exit with optimal load
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
    });

    it('completionist player tests all command combinations', () => {
      // Test all look variations
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.executeLookAround();
      testEnv.lookCommandHelper.executeLook('l');
      
      // Test all examine variations
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamineShort('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      // Test container operations
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.lookCommandHelper.executeLookIn('brick');
      
      // Test all take variations
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTakeWith('get', 'rope');
      
      // Test movement with different loads
      const lightMoveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(lightMoveResult);
      
      testEnv.moveCommandHelper.executeMoveUp();
      testEnv.takeCommandHelper.executeTake('brick');
      
      const heavyMoveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (testEnv.weightBasedExitHelper.canExitDown()) {
        testEnv.moveCommandHelper.verifyKitchenAccess(heavyMoveResult);
      } else {
        testEnv.moveCommandHelper.verifyWeightBasedFailure(heavyMoveResult);
      }
    });
  });

  describe('Error Recovery Journey', () => {
    it('player recovers from mistakes gracefully', () => {
      // Player makes mistake - takes too much
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      testEnv.takeCommandHelper.executeTake('knife');
      
      // Realizes mistake when movement fails
      const failedResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(failedResult);
      
      // Player adapts by dropping items strategically
      testEnv.weightBasedExitHelper.dropItem('rope'); // Drop heaviest
      
      // Verify recovery works
      const recoveryResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(recoveryResult);
    });

    it('player handles invalid commands gracefully', () => {
      // Player tries invalid commands
      const invalidExamine = testEnv.examineCommandHelper.executeExamine('nonexistent');
      testEnv.examineCommandHelper.verifyFailure(invalidExamine);
      
      const invalidTake = testEnv.takeCommandHelper.executeTake('imaginary');
      testEnv.takeCommandHelper.verifyFailure(invalidTake);
      
      const invalidOpen = testEnv.openCommandHelper.executeOpen('rope');
      testEnv.openCommandHelper.verifyFailure(invalidOpen);
      
      // Player continues with valid commands
      testEnv.takeCommandHelper.executeTake('knife');
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyKitchenAccess(moveResult);
    });
  });
});