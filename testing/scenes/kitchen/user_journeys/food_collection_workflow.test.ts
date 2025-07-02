/**
 * Kitchen Scene - Food Collection User Journey Tests
 * Tests complete workflows for collecting food items from the kitchen
 */

import '../integration_tests/look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../integration_tests/look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Food Collection User Journey', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Complete Food Collection Workflow', () => {
    it('player discovers and collects all food items', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // 1. Player enters kitchen and looks around
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      
      // 2. Player notices sack and examines it
      testEnv.kitchenHelper.verifySackState(false); // Initially closed
      
      // 3. Player opens sack to discover contents
      const openSackResult = testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.verifySackOpenSuccess(openSackResult);
      
      // 4. Player looks again to see revealed contents
      const lookResult2 = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult2, true, false);
      
      // 5. Player also notices bottle and opens it
      const openBottleResult = testEnv.openCommandHelper.executeOpenTarget('bottle');
      testEnv.openCommandHelper.verifyBottleOpenSuccess(openBottleResult);
      
      // 6. Player looks to see all available food
      const lookResult3 = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult3, true, true);
      
      // 7. Verify all food items are now accessible
      expect(lookResult3.message).toMatch(/lunch/i);
      expect(lookResult3.message).toContain('garlic');
      expect(lookResult3.message).toContain('water');
      
      // 8. Verify move count tracked correctly
      const expectedMoves = initialMoves + 2; // open sack + open bottle
      expect(testEnv.moveCommandHelper.getCurrentMoves()).toBe(expectedMoves);
    });

    it('alternative discovery path - bottle first then sack', () => {
      // 1. Player starts with basic look
      testEnv.lookCommandHelper.executeBasicLook();
      
      // 2. Player opens bottle first
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 3. Verify only water visible
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
      expect(lookResult.message).toContain('water');
      expect(lookResult.message).not.toMatch(/lunch/i);
      
      // 4. Player then opens sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // 5. Verify all food now visible
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
    });

    it('player manages containers after collecting food', () => {
      // 1. Open both containers and access food
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 2. Player looks in each container individually
      const sackContents = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyContainerContents(sackContents, 'sack', ['lunch', 'garlic']);
      
      const bottleContents = testEnv.lookCommandHelper.executeLookIn('bottle');
      testEnv.lookCommandHelper.verifyContainerContents(bottleContents, 'bottle', ['water']);
      
      // 3. Player closes containers for transport
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      // 4. Verify contents are hidden but containers remain
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      expect(lookResult.message).toContain('sack');
      expect(lookResult.message).toContain('bottle');
    });
  });

  describe('Error Recovery Workflows', () => {
    it('player recovers from looking in closed containers', () => {
      // 1. Player tries to look in closed sack
      const failedLookResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyClosedContainer(failedLookResult, 'sack');
      
      // 2. Player learns they need to open it first
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // 3. Player successfully looks in opened sack
      const successLookResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyContainerContents(successLookResult, 'sack', ['lunch', 'garlic']);
    });

    it('player handles opening already open containers', () => {
      // 1. Open sack
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // 2. Try to open again
      const alreadyOpenResult = testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.verifyAlreadyOpen(alreadyOpenResult, 'sack');
      
      // 3. Verify sack is still open and functional
      const lookResult = testEnv.lookCommandHelper.executeLookIn('sack');
      testEnv.lookCommandHelper.verifyContainerContents(lookResult, 'sack', ['lunch', 'garlic']);
    });

    it('player handles closing already closed containers', () => {
      // 1. Try to close already closed sack
      const alreadyClosedResult = testEnv.closeCommandHelper.executeCloseTarget('sack');
      testEnv.closeCommandHelper.verifyAlreadyClosed(alreadyClosedResult, 'sack');
      
      // 2. Verify sack remains closed
      testEnv.kitchenHelper.verifySackState(false);
    });
  });

  describe('Multi-Room Food Collection Journey', () => {
    it('player collects food then explores other rooms', () => {
      // 1. Collect food in kitchen
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 2. Move to living room
      testEnv.moveCommandHelper.executeMoveDirection('west');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('living_room');
      
      // 3. Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 4. Verify food containers still open
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(true);
      
      // 5. Verify food still visible
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
    });

    it('player accesses attic after collecting food', () => {
      // 1. Open containers to access food
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 2. Go up to attic
      testEnv.moveCommandHelper.executeMoveDirection('up');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
      
      // 3. Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('down');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 4. Food should still be accessible
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
    });
  });

  describe('Window Integration with Food Collection', () => {
    it('player opens window then collects food', () => {
      // 1. Open window for alternate exit
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.kitchenHelper.verifyWindowState(true);
      
      // 2. Collect food
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 3. Verify both window and food containers are open
      testEnv.kitchenHelper.verifyWindowState(true);
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(true);
      
      // 4. Test that east exit is available
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      // 5. Use window exit to go to behind house
      testEnv.moveCommandHelper.executeMoveDirection('east');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
    });

    it('complete kitchen exploration workflow', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // 1. Initial exploration
      testEnv.lookCommandHelper.executeBasicLook();
      
      // 2. Open all openable items
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.openCommandHelper.executeOpenTarget('sack');
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      // 3. Verify all systems working
      testEnv.kitchenHelper.verifyWindowState(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
      testEnv.lookCommandHelper.verifyExitInformation(lookResult, true);
      
      // 4. Test navigation to all connected rooms
      // Go east through window
      testEnv.moveCommandHelper.executeMoveDirection('east');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
      
      // Return and go west
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('west');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('living_room');
      
      // Return and go up
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.executeMoveDirection('up');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
      
      // Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('down');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 5. Verify all states persisted through navigation
      testEnv.kitchenHelper.verifyWindowState(true);
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(true);
      
      // 6. Verify proper move count
      const expectedMoves = initialMoves + 3 + 6; // 3 opens + 6 movements
      expect(testEnv.moveCommandHelper.getCurrentMoves()).toBe(expectedMoves);
    });
  });
});