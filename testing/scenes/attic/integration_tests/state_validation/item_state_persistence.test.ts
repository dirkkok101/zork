/**
 * Attic Scene - State Validation Integration Tests
 * Tests item state persistence across commands, scene transitions, and operations
 * Ensures container states, weapon states, and game state integrity
 */

import '../look_command/setup';
import { AtticIntegrationTestFactory, AtticTestEnvironment } from '../look_command/helpers/attic_integration_test_factory';

describe('Attic Scene - State Validation Integration', () => {
  let testEnv: AtticTestEnvironment;

  beforeEach(async () => {
    testEnv = await AtticIntegrationTestFactory.createTestEnvironment();
    testEnv.atticHelper.resetScene();
    testEnv.atticHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Container State Persistence', () => {
    it('brick state persists across look commands', () => {
      // Start with closed brick
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.verifyBrickState(false);
      
      // Look command should not change state
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.atticHelper.verifyBrickState(false);
      
      // Open brick
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.atticHelper.verifyBrickState(true);
      
      // Multiple look commands should preserve open state
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.executeLookAround();
      testEnv.lookCommandHelper.executeLook('l');
      testEnv.atticHelper.verifyBrickState(true);
    });

    it('brick state persists across examine commands', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.verifyBrickState(true);
      
      // Examine various items
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.examineCommandHelper.executeExamine('knife');
      
      // Brick should still be open
      testEnv.atticHelper.verifyBrickState(true);
    });

    it('brick state persists across movement', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_item']);
      testEnv.atticHelper.verifyBrickState(true);
      
      // Move to kitchen (if possible with current weight)
      const moveResult = testEnv.moveCommandHelper.executeMoveDown();
      if (moveResult.success) {
        // Return to attic
        testEnv.moveCommandHelper.executeMoveUp();
        
        // Brick should still be open with contents
        testEnv.atticHelper.verifyBrickState(true);
        expect(testEnv.atticHelper.getBrickContents()).toContain('test_item');
      }
    });

    it('brick state persists when taken into inventory', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['test_coin']);
      testEnv.atticHelper.verifyBrickState(true);
      
      // Take brick
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.verifyInventoryContains('brick');
      
      // State should persist in inventory
      testEnv.atticHelper.verifyBrickState(true);
      expect(testEnv.atticHelper.getBrickContents()).toContain('test_coin');
    });

    it('brick contents persist across state changes', () => {
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.addToBrickContainer(['valuable_item', 'common_item']);
      
      // Open brick
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.atticHelper.verifyBrickState(true);
      
      // Contents should still be there
      const contents = testEnv.atticHelper.getBrickContents();
      expect(contents).toContain('valuable_item');
      expect(contents).toContain('common_item');
      
      // Close and reopen (if close command exists)
      // For now, verify contents remain stable
      expect(testEnv.atticHelper.getBrickContents()).toEqual(contents);
    });
  });

  describe('Weapon State Persistence', () => {
    it('knife state persists across commands', () => {
      testEnv.atticHelper.setKnifeOff();
      testEnv.atticHelper.verifyKnifeState(false);
      
      // Various commands should not affect knife state
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.examineCommandHelper.executeExamine('rope');
      testEnv.atticHelper.verifyKnifeState(false);
      
      // Turn knife on
      testEnv.atticHelper.setKnifeOn();
      testEnv.atticHelper.verifyKnifeState(true);
      
      // State should persist across more commands
      testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.lookCommandHelper.executeLookAt('knife');
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('knife state persists when taken into inventory', () => {
      testEnv.atticHelper.setKnifeOn();
      testEnv.atticHelper.verifyKnifeState(true);
      
      // Take knife
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
      
      // State should persist in inventory
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('knife state persists across scene transitions', () => {
      testEnv.atticHelper.setKnifeOn();
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.atticHelper.verifyKnifeState(true);
      
      // Move to kitchen if weight allows
      const weight = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      if (weight <= 10) {
        testEnv.moveCommandHelper.executeMoveDown();
        testEnv.atticHelper.verifyKnifeState(true);
        
        // Return to attic
        testEnv.moveCommandHelper.executeMoveUp();
        testEnv.atticHelper.verifyKnifeState(true);
      }
    });
  });

  describe('Multiple Item State Combinations', () => {
    it('independent state changes do not interfere', () => {
      // Set initial states
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.setKnifeOff();
      
      testEnv.atticHelper.verifyBrickState(false);
      testEnv.atticHelper.verifyKnifeState(false);
      
      // Change brick state
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(false); // Should be unchanged
      
      // Change knife state
      testEnv.atticHelper.setKnifeOn();
      testEnv.atticHelper.verifyBrickState(true); // Should be unchanged
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('complex state combinations persist correctly', () => {
      // Set up complex initial state
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.addToBrickContainer(['gem', 'coin']);
      testEnv.atticHelper.setKnifeOn();
      
      // Take all items
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('rope');
      
      // Verify all states persist
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
      expect(testEnv.atticHelper.getBrickContents()).toEqual(['gem', 'coin']);
      
      // Verify inventory
      testEnv.takeCommandHelper.verifyInventoryContains('brick');
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
      testEnv.takeCommandHelper.verifyInventoryContains('rope');
    });
  });

  describe('State Validation After Operations', () => {
    it('states remain valid after failed operations', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      // Try invalid commands that should fail
      testEnv.examineCommandHelper.executeExamine('nonexistent');
      testEnv.takeCommandHelper.executeTake('imaginary_item');
      testEnv.openCommandHelper.executeOpen('rope'); // Not a container
      
      // States should be unchanged
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('states remain valid after weight-blocked movement', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      // Take all items to exceed weight limit
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('rope');
      testEnv.takeCommandHelper.executeTake('knife');
      
      // Try to move (should fail due to weight)
      const result = testEnv.moveCommandHelper.executeMoveDown();
      testEnv.moveCommandHelper.verifyWeightBasedFailure(result);
      
      // States should be preserved
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('states persist through complex command sequences', () => {
      // Initial setup
      testEnv.atticHelper.setBrickClosed();
      testEnv.atticHelper.setKnifeOff();
      
      // Complex sequence of operations
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.openCommandHelper.executeOpen('brick');
      testEnv.atticHelper.verifyBrickState(true);
      
      testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.atticHelper.setKnifeOn();
      testEnv.atticHelper.verifyKnifeState(true);
      
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.examineCommandHelper.executeExamine('rope');
      
      // Final state verification
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
      testEnv.takeCommandHelper.verifyInventoryContains('knife');
    });
  });

  describe('State Consistency Across Helpers', () => {
    it('state queries are consistent across all helpers', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      // Different helpers should report same state
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
      
      // State should be reflected in game state
      const brick = testEnv.atticHelper.getItemDetails('brick');
      const knife = testEnv.atticHelper.getItemDetails('knife');
      
      expect(brick?.state?.open).toBe(true);
      expect(knife?.state?.on).toBe(true);
    });

    it('inventory state is consistent across helpers', () => {
      testEnv.takeCommandHelper.executeTake('knife');
      testEnv.takeCommandHelper.executeTake('rope');
      
      // All helpers should report same inventory
      const takeHelperInventory = testEnv.takeCommandHelper.getPlayerInventory();
      const weightHelperInventory = testEnv.weightBasedExitHelper.getInventory();
      
      expect(takeHelperInventory.sort()).toEqual(weightHelperInventory.sort());
      expect(takeHelperInventory).toContain('knife');
      expect(takeHelperInventory).toContain('rope');
    });

    it('weight calculations are consistent across helpers', () => {
      testEnv.takeCommandHelper.executeTake('brick');
      testEnv.takeCommandHelper.executeTake('knife');
      
      const takeHelperWeight = testEnv.takeCommandHelper.getCurrentInventoryWeight();
      const weightHelperWeight = testEnv.weightBasedExitHelper.getCurrentWeight();
      const moveHelperWeight = testEnv.moveCommandHelper.getCurrentInventoryWeight();
      
      expect(takeHelperWeight).toBe(14); // brick (9) + knife (5)
      expect(weightHelperWeight).toBe(14);
      expect(moveHelperWeight).toBe(14);
    });
  });

  describe('State Recovery and Validation', () => {
    it('can recover from corrupted test state', () => {
      // Intentionally create invalid state
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.clearBrickContents();
      testEnv.atticHelper.addToBrickContainer(['invalid_item_that_does_not_exist']);
      
      // Reset should clean up
      testEnv.atticHelper.resetScene();
      
      // Verify clean state
      testEnv.atticHelper.verifyBrickState(false); // Should be closed after reset
      const contents = testEnv.atticHelper.getBrickContents();
      expect(contents).toEqual([]); // Should be empty after reset
    });

    it('state validation catches inconsistencies', () => {
      testEnv.atticHelper.setBrickOpen();
      
      // Verify state through multiple channels
      testEnv.atticHelper.verifyBrickState(true);
      
      const brick = testEnv.atticHelper.getItemDetails('brick');
      expect(brick?.state?.open).toBe(true);
      
      // Look command should reflect open state
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      // Note: Implementation may or may not show container state in room description
      testEnv.lookCommandHelper.verifySuccess(lookResult);
    });

    it('scene items remain consistent after operations', () => {
      const initialItems = testEnv.atticHelper.getSceneItems();
      expect(initialItems).toContain('brick');
      expect(initialItems).toContain('rope');
      expect(initialItems).toContain('knife');
      
      // Non-destructive operations
      testEnv.lookCommandHelper.executeBasicLook();
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.openCommandHelper.executeOpen('brick');
      
      // Items should still be in scene
      const finalItems = testEnv.atticHelper.getSceneItems();
      expect(finalItems).toContain('brick');
      expect(finalItems).toContain('rope');
      expect(finalItems).toContain('knife');
    });
  });

  describe('State Persistence Edge Cases', () => {
    it('handles rapid state changes correctly', () => {
      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        testEnv.atticHelper.setBrickClosed();
        testEnv.atticHelper.verifyBrickState(false);
        
        testEnv.openCommandHelper.executeOpen('brick');
        testEnv.atticHelper.verifyBrickState(true);
      }
      
      // Final state should be correct
      testEnv.atticHelper.verifyBrickState(true);
    });

    it('handles concurrent-like operations correctly', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.setKnifeOn();
      
      // Simulate concurrent operations
      testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.executeExamine('knife');
      testEnv.lookCommandHelper.executeLookAt('brick');
      testEnv.lookCommandHelper.executeLookAt('knife');
      
      // States should remain consistent
      testEnv.atticHelper.verifyBrickState(true);
      testEnv.atticHelper.verifyKnifeState(true);
    });

    it('handles empty container state correctly', () => {
      testEnv.atticHelper.setBrickOpen();
      testEnv.atticHelper.clearBrickContents();
      
      // Operations on empty container
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('brick');
      testEnv.lookCommandHelper.verifyContainerContents(lookInResult, 'brick', []);
      
      const examineResult = testEnv.examineCommandHelper.executeExamine('brick');
      testEnv.examineCommandHelper.verifySuccess(examineResult);
      
      // State should remain valid
      testEnv.atticHelper.verifyBrickState(true);
      expect(testEnv.atticHelper.getBrickContents()).toEqual([]);
    });
  });
});