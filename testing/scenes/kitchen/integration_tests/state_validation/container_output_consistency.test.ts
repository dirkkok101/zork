/**
 * Kitchen Scene - Container Output Consistency Tests
 * Tests that container states are displayed consistently across different commands
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Container Output Consistency', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Sack State Consistency', () => {
    it('sack state consistency across look and examine commands', () => {
      // Test closed sack
      testEnv.kitchenHelper.setSackState(false);
      
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookResult.message).not.toContain('sandwich');
      expect(lookResult.message).not.toContain('garlic');
      
      // Test open sack
      testEnv.kitchenHelper.setSackState(true);
      
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
    });

    it('sack contents visibility matches state across commands', () => {
      // Closed sack - contents hidden everywhere
      testEnv.kitchenHelper.setSackState(false);
      
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('sack');
      
      expect(lookResult.message).not.toContain('sandwich');
      testEnv.lookCommandHelper.verifyClosedContainer(lookInResult, 'sack');
      
      // Open sack - contents visible everywhere
      testEnv.kitchenHelper.setSackState(true);
      
      const lookResult2 = testEnv.lookCommandHelper.executeBasicLook();
      const lookInResult2 = testEnv.lookCommandHelper.executeLookIn('sack');
      
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult2, true, false);
      testEnv.lookCommandHelper.verifyContainerContents(lookInResult2, 'sack', ['sandwich', 'garlic']);
    });
  });

  describe('Bottle State Consistency', () => {
    it('bottle state consistency across look and examine commands', () => {
      // Test closed bottle
      testEnv.kitchenHelper.setBottleState(false);
      
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      expect(lookResult.message).not.toContain('water');
      
      // Test open bottle
      testEnv.kitchenHelper.setBottleState(true);
      
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
    });

    it('bottle contents visibility matches state across commands', () => {
      // Closed bottle - water hidden everywhere
      testEnv.kitchenHelper.setBottleState(false);
      
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      const lookInResult = testEnv.lookCommandHelper.executeLookIn('bottle');
      
      expect(lookResult.message).not.toContain('water');
      testEnv.lookCommandHelper.verifyClosedContainer(lookInResult, 'bottle');
      
      // Open bottle - water visible everywhere
      testEnv.kitchenHelper.setBottleState(true);
      
      const lookResult2 = testEnv.lookCommandHelper.executeBasicLook();
      const lookInResult2 = testEnv.lookCommandHelper.executeLookIn('bottle');
      
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult2, false, true);
      testEnv.lookCommandHelper.verifyContainerContents(lookInResult2, 'bottle', ['water']);
    });
  });

  describe('Multi-Container Consistency', () => {
    it('independent container states display correctly', () => {
      const testCases = [
        { sackOpen: false, bottleOpen: false, expectSackContents: false, expectBottleContents: false },
        { sackOpen: true, bottleOpen: false, expectSackContents: true, expectBottleContents: false },
        { sackOpen: false, bottleOpen: true, expectSackContents: false, expectBottleContents: true },
        { sackOpen: true, bottleOpen: true, expectSackContents: true, expectBottleContents: true }
      ];

      testCases.forEach(({ sackOpen, bottleOpen, expectSackContents, expectBottleContents }) => {
        testEnv.kitchenHelper.setSackState(sackOpen);
        testEnv.kitchenHelper.setBottleState(bottleOpen);
        
        const lookResult = testEnv.lookCommandHelper.executeBasicLook();
        
        testEnv.lookCommandHelper.verifyKitchenItems(lookResult, expectSackContents, expectBottleContents);
        
        // Verify individual container access
        if (sackOpen) {
          const sackResult = testEnv.lookCommandHelper.executeLookIn('sack');
          testEnv.lookCommandHelper.verifyContainerContents(sackResult, 'sack', ['sandwich', 'garlic']);
        }
        
        if (bottleOpen) {
          const bottleResult = testEnv.lookCommandHelper.executeLookIn('bottle');
          testEnv.lookCommandHelper.verifyContainerContents(bottleResult, 'bottle', ['water']);
        }
      });
    });

    it('container state changes reflect immediately in all commands', () => {
      // Start with both closed
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      
      // Open sack via command
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
      
      // Open bottle via command
      testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, true);
      
      // Close sack via command
      testEnv.closeCommandHelper.executeCloseTarget('sack');
      
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, true);
    });
  });

  describe('Error Message Consistency', () => {
    it('closed container error messages are consistent', () => {
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      const sackResult = testEnv.lookCommandHelper.executeLookIn('sack');
      const bottleResult = testEnv.lookCommandHelper.executeLookIn('bottle');
      
      testEnv.lookCommandHelper.verifyClosedContainer(sackResult, 'sack');
      testEnv.lookCommandHelper.verifyClosedContainer(bottleResult, 'bottle');
      
      // Error message format should be consistent
      expect(sackResult.message).toMatch(/closed/i);
      expect(bottleResult.message).toMatch(/closed/i);
    });

    it('already open/closed messages are consistent', () => {
      // Test already open
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(true);
      
      const sackOpenResult = testEnv.openCommandHelper.executeOpenTarget('sack');
      const bottleOpenResult = testEnv.openCommandHelper.executeOpenTarget('bottle');
      
      testEnv.openCommandHelper.verifyAlreadyOpen(sackOpenResult, 'sack');
      testEnv.openCommandHelper.verifyAlreadyOpen(bottleOpenResult, 'bottle');
      
      // Test already closed
      testEnv.kitchenHelper.setSackState(false);
      testEnv.kitchenHelper.setBottleState(false);
      
      const sackCloseResult = testEnv.closeCommandHelper.executeCloseTarget('sack');
      const bottleCloseResult = testEnv.closeCommandHelper.executeCloseTarget('bottle');
      
      testEnv.closeCommandHelper.verifyAlreadyClosed(sackCloseResult, 'sack');
      testEnv.closeCommandHelper.verifyAlreadyClosed(bottleCloseResult, 'bottle');
    });
  });

  describe('State Persistence Validation', () => {
    it('container states persist across scene transitions', () => {
      // Set specific states
      testEnv.kitchenHelper.setSackState(true);
      testEnv.kitchenHelper.setBottleState(false);
      
      // Verify initial state
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
      
      // Move away and back
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Verify state persisted
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
      
      // Verify individual container states
      testEnv.kitchenHelper.verifySackState(true);
      testEnv.kitchenHelper.verifyBottleState(false);
    });

    it('complex state changes maintain consistency', () => {
      // Perform complex sequence
      testEnv.openCommandHelper.executeOpenTarget('sack');          // Sack: open
      testEnv.openCommandHelper.executeOpenTarget('bottle');        // Bottle: open
      testEnv.closeCommandHelper.executeCloseTarget('sack');        // Sack: closed
      testEnv.lookCommandHelper.executeBasicLook();                 // Look
      testEnv.moveCommandHelper.executeMoveDirection('west');       // Move away
      testEnv.moveCommandHelper.executeMoveDirection('east');       // Move back
      testEnv.closeCommandHelper.executeCloseTarget('bottle');      // Bottle: closed
      
      // Final state should be both closed
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, false, false);
      
      testEnv.kitchenHelper.verifySackState(false);
      testEnv.kitchenHelper.verifyBottleState(false);
    });
  });
});