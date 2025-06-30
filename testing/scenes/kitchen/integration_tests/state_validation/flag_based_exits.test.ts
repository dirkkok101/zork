/**
 * Kitchen Scene - State Validation Tests for Flag-Based Exits
 * Tests consistency of window flag state across different commands
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Flag-Based Exit State Validation', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Window Flag State Consistency', () => {
    it('door_windo_open flag consistency across all commands', () => {
      // Initially closed
      testEnv.kitchenHelper.setWindowState(false);
      
      // Verify flag state across different access methods
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
      
      // Open window
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Verify flag set everywhere
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      // Close window
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      // Verify flag unset everywhere
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
    });

    it('window state persists across scene transitions', () => {
      // Open window
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.kitchenHelper.verifyWindowState(true);
      
      // Move to living room and back
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Window should still be open
      testEnv.kitchenHelper.verifyWindowState(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
    });

    it('movement availability matches flag state', () => {
      const testCases = [
        { windowOpen: false, shouldAllowEast: false },
        { windowOpen: true, shouldAllowEast: true }
      ];

      testCases.forEach(({ windowOpen, shouldAllowEast }) => {
        testEnv.kitchenHelper.setWindowState(windowOpen);
        
        const moveResult = testEnv.moveCommandHelper.executeMoveDirection('east');
        const flagState = testEnv.services.gameState.getFlag('door_windo_open');
        
        expect(flagState).toBe(windowOpen);
        
        if (shouldAllowEast) {
          testEnv.moveCommandHelper.verifyMovementSuccess(moveResult, 'behind_house');
          // Return to kitchen
          testEnv.moveCommandHelper.executeMoveDirection('west');
        } else {
          testEnv.moveCommandHelper.verifyWindowClosed(moveResult);
        }
      });
    });
  });

  describe('Cross-Command State Validation', () => {
    it('look command reflects current window state', () => {
      // Test closed window
      testEnv.kitchenHelper.setWindowState(false);
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(lookResult, false);
      
      // Test open window
      testEnv.kitchenHelper.setWindowState(true);
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(lookResult, true);
    });

    it('examine command reflects current window state', () => {
      // Test closed window
      testEnv.kitchenHelper.setWindowState(false);
      const window = testEnv.services.gameState.getItem('windo');
      expect(window?.state?.isOpen).toBe(false);
      
      // Test open window
      testEnv.kitchenHelper.setWindowState(true);
      expect(window?.state?.isOpen).toBe(true);
    });

    it('open/close commands update all state consistently', () => {
      // Start closed
      testEnv.kitchenHelper.setWindowState(false);
      
      // Open via command
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Verify all state updated
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(true);
      expect(testEnv.services.gameState.getItem('windo')?.state?.isOpen).toBe(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      // Close via command
      testEnv.closeCommandHelper.executeCloseTarget('window');
      
      // Verify all state updated
      expect(testEnv.services.gameState.getFlag('door_windo_open')).toBe(false);
      expect(testEnv.services.gameState.getItem('windo')?.state?.isOpen).toBe(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
    });
  });

  describe('State Integrity Under Load', () => {
    it('rapid open/close cycles maintain consistency', () => {
      for (let i = 0; i < 10; i++) {
        // Open
        testEnv.openCommandHelper.executeOpenTarget('window');
        testEnv.kitchenHelper.verifyWindowState(true);
        expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
        
        // Close
        testEnv.closeCommandHelper.executeCloseTarget('window');
        testEnv.kitchenHelper.verifyWindowState(false);
        expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
      }
    });

    it('state consistency during mixed command sequences', () => {
      const commands = [
        () => testEnv.openCommandHelper.executeOpenTarget('window'),
        () => testEnv.lookCommandHelper.executeBasicLook(),
        () => testEnv.moveCommandHelper.executeMoveDirection('west'),
        () => testEnv.moveCommandHelper.executeMoveDirection('east'),
        () => testEnv.closeCommandHelper.executeCloseTarget('window'),
        () => testEnv.lookCommandHelper.executeBasicLook()
      ];
      
      // Execute sequence
      commands.forEach(cmd => cmd());
      
      // Final state should be consistent
      testEnv.kitchenHelper.verifyWindowState(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
    });
  });
});