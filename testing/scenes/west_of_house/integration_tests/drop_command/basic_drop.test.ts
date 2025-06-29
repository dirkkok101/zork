/**
 * Basic Drop Command Tests - West of House Scene
 * Tests dropping various objects in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '@testing/scenes/west_of_house/integration_tests/look_command/helpers/integration_test_factory';
import { DropCommandHelper } from './helpers/drop_command_helper';

describe('Drop Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let dropHelper: DropCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Drop command helper
    dropHelper = new DropCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    
    // Clear inventory for fresh test state
    const inventory = testEnv.services.inventory as any;
    const items = inventory.getItems();
    items.forEach((itemId: string) => {
      inventory.removeItem(itemId);
    });
    
    // Ensure we're in west_of_house for all tests
    testEnv.services.gameState.setCurrentScene('west_of_house');
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Authentic West of House Drop Interactions', () => {
    describe('Simple Drop Operations', () => {
      beforeEach(() => {
        // Setup: Take the welcome mat using real command flow
        const takeResult = dropHelper.executeTake('take welcome mat');
        expect(takeResult.success).toBe(true);
        expect(dropHelper.isInInventory('mat')).toBe(true);
      });

      it('should successfully drop welcome mat', () => {
        expect(dropHelper.isInInventory('mat')).toBe(true);
        const initialCount = dropHelper.getInventoryCount();
        
        const result = dropHelper.executeDropItem('welcome mat');
        
        dropHelper.verifyDropSuccess(result, 'welcome mat');
        dropHelper.verifyItemMovedToScene('mat');
        dropHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should drop mat using "drop down" syntax', () => {
        expect(dropHelper.isInInventory('mat')).toBe(true);
        const initialCount = dropHelper.getInventoryCount();
        
        const result = dropHelper.executeDropDown('welcome mat');
        
        dropHelper.verifyDropSuccess(result, 'welcome mat');
        dropHelper.verifyItemMovedToScene('mat');
        dropHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should drop mat using various aliases', () => {
        expect(dropHelper.isInInventory('mat')).toBe(true);
        
        // Test each authentic Zork alias individually
        const aliases = ['mat', 'welco', 'rubbe'];
        
        // Test first alias
        const result1 = dropHelper.executeDropItem(aliases[0]!);
        expect(result1.success).toBe(true);
        expect(result1.message).toBe('You drop the welcome mat.');
        dropHelper.verifyItemMovedToScene('mat');
        
        // Reset for next test
        const retakeResult1 = dropHelper.executeTake('take welcome mat');
        expect(retakeResult1.success).toBe(true);
        
        // Test second alias (welco)
        const result2 = dropHelper.executeDropItem(aliases[1]!);
        expect(result2.success).toBe(true);
        expect(result2.message).toBe('You drop the welcome mat.');
        dropHelper.verifyItemMovedToScene('mat');
        
        // Reset for next test
        const retakeResult2 = dropHelper.executeTake('take welcome mat');
        expect(retakeResult2.success).toBe(true);
        
        // Test third alias (rubbe)
        const result3 = dropHelper.executeDropItem(aliases[2]!);
        expect(result3.success).toBe(true);
        expect(result3.message).toBe('You drop the welcome mat.');
        dropHelper.verifyItemMovedToScene('mat');
      });

      it('should use full item name in response regardless of input alias', () => {
        expect(dropHelper.isInInventory('mat')).toBe(true);
        
        // Test with full name
        const fullNameResult = dropHelper.executeDropItem('welcome mat');
        expect(fullNameResult.success).toBe(true);
        expect(fullNameResult.message).toBe('You drop the welcome mat.');
        dropHelper.verifyItemMovedToScene('mat');
        
        // Reset for alias test
        const retakeResult = dropHelper.executeTake('take welcome mat');
        expect(retakeResult.success).toBe(true);
        
        // Test with short alias - should still use full name in response
        const aliasResult = dropHelper.executeDropItem('mat');
        expect(aliasResult.success).toBe(true);
        expect(aliasResult.message).toBe('You drop the welcome mat.');
        dropHelper.verifyItemMovedToScene('mat');
      });
    });

    describe('Drop with Prepositions (Redirects to PUT)', () => {
      beforeEach(() => {
        // Setup: Take mat using real command flow
        const takeResult = dropHelper.executeTake('take welcome mat');
        expect(takeResult.success).toBe(true);
        expect(dropHelper.isInInventory('mat')).toBe(true);
      });

      it('should redirect to PUT command for container operations', () => {
        const result = dropHelper.executeDropInContainer('mat', 'mailbox');
        
        dropHelper.verifyFailure(result, 'For putting items in containers or on objects, use the PUT command instead.');
        // Item should still be in inventory since command was rejected
        expect(dropHelper.isInInventory('mat')).toBe(true);
      });

      it('should redirect to PUT command for any preposition', () => {
        const result = dropHelper.executeDrop('drop mat in mailbox');
        
        dropHelper.verifyFailure(result, 'For putting items in containers or on objects, use the PUT command instead.');
        expect(dropHelper.isInInventory('mat')).toBe(true);
      });

      it('should redirect even for non-containers', () => {
        const result = dropHelper.executeDrop('drop mat on door');
        
        dropHelper.verifyFailure(result, 'For putting items in containers or on objects, use the PUT command instead.');
        expect(dropHelper.isInInventory('mat')).toBe(true);
      });
    });

    describe('Drop Multiple Items', () => {
      beforeEach(() => {
        // Setup: Take mat and get leaflet using real command flows
        const takeMatResult = dropHelper.executeTake('take welcome mat');
        expect(takeMatResult.success).toBe(true);
        expect(dropHelper.isInInventory('mat')).toBe(true);
        
        const openResult = dropHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        
        const takeLeafletResult = dropHelper.executeTake('take leaflet');
        expect(takeLeafletResult.success).toBe(true);
        expect(dropHelper.isInInventory('adver')).toBe(true);
      });

      it('should drop multiple items in sequence', () => {
        const initialCount = dropHelper.getInventoryCount();
        expect(initialCount).toBe(2); // mat and leaflet
        
        // Drop mat first
        const dropMatResult = dropHelper.executeDropItem('welcome mat');
        expect(dropMatResult.success).toBe(true);
        dropHelper.verifyDropSuccess(dropMatResult, 'welcome mat');
        dropHelper.verifyItemMovedToScene('mat');
        dropHelper.verifyInventoryCountChange(initialCount, -1);
        
        // Drop leaflet second
        const dropLeafletResult = dropHelper.executeDropItem('leaflet');
        expect(dropLeafletResult.success).toBe(true);
        dropHelper.verifyDropSuccess(dropLeafletResult, 'leaflet');
        dropHelper.verifyItemMovedToScene('adver');
        dropHelper.verifyInventoryCountChange(initialCount, -2);
      });

      it('should redirect container operations to PUT command', () => {
        expect(dropHelper.getInventoryCount()).toBe(2);
        
        // Simple drop for mat works
        const dropMatResult = dropHelper.executeDropItem('welcome mat');
        dropHelper.verifyDropSuccess(dropMatResult, 'welcome mat');
        dropHelper.verifyItemMovedToScene('mat');
        
        // Try to drop leaflet in container - should redirect to PUT
        const dropLeafletResult = dropHelper.executeDropInContainer('leaflet', 'mailbox');
        dropHelper.verifyFailure(dropLeafletResult, 'For putting items in containers or on objects, use the PUT command instead.');
        // Leaflet should still be in inventory
        expect(dropHelper.isInInventory('adver')).toBe(true);
      });
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "drop" command', () => {
      // Take mat first using real command flow
      const takeResult = dropHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      expect(dropHelper.isInInventory('mat')).toBe(true);
      
      const result = dropHelper.executeDrop('drop welcome mat');
      
      dropHelper.verifyDropSuccess(result, 'welcome mat');
      dropHelper.verifyItemMovedToScene('mat');
    });

    it('should work with "leave" alias', () => {
      // Take mat first using real command flow
      const takeResult = dropHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = dropHelper.executeDrop('leave welcome mat');
      
      dropHelper.verifyDropSuccess(result, 'welcome mat');
      dropHelper.verifyItemMovedToScene('mat');
    });

    it('should work with "drop <item> down"', () => {
      // Take mat first using real command flow
      const takeResult = dropHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = dropHelper.executeDrop('drop welcome mat down');
      
      dropHelper.verifyDropSuccess(result, 'welcome mat');
      dropHelper.verifyItemMovedToScene('mat');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty drop command', () => {
      const result = dropHelper.executeDrop('drop');
      
      dropHelper.verifyFailure(result, 'Drop what');
      dropHelper.verifyNoMove(result);
    });

    it('should handle drop item not in inventory', () => {
      const result = dropHelper.executeDropItem('phantom');
      
      dropHelper.verifyDontHave(result, 'phantom');
      dropHelper.verifyNoMove(result);
    });

    it('should handle drop item already in scene', () => {
      // Try to drop something we don't have
      const result = dropHelper.executeDropItem('welcome mat');
      
      dropHelper.verifyDontHave(result, 'welcome mat');
      dropHelper.verifyNoMove(result);
    });

    it('should redirect preposition drops to PUT command', () => {
      // Take mat first using real command flow
      const takeResult = dropHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = dropHelper.executeDrop('drop welcome mat in phantom');
      
      dropHelper.verifyFailure(result, 'For putting items in containers or on objects, use the PUT command instead.');
      dropHelper.verifyNoMove(result);
      expect(dropHelper.isInInventory('mat')).toBe(true);
    });

    it('should handle malformed drop commands', () => {
      const result = dropHelper.executeDrop('drop in mailbox');
      
      dropHelper.verifyFailure(result, 'For putting items in containers or on objects, use the PUT command instead.');
      dropHelper.verifyNoMove(result);
    });
  });

  describe('Interaction with Scene State', () => {
    it('should maintain scene state after drops', () => {
      // Take mat and drop it using real command flows
      const takeResult = dropHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      expect(dropHelper.isInInventory('mat')).toBe(true);
      
      const dropResult = dropHelper.executeDropItem('welcome mat');
      expect(dropResult.success).toBe(true);
      dropHelper.verifyItemMovedToScene('mat');
      
      // Verify we can take it again
      const retakeResult = dropHelper.executeTake('take welcome mat');
      expect(retakeResult.success).toBe(true);
    });

    it('should handle drops when scene already has items', () => {
      // Mat should be in scene initially
      expect(dropHelper.isInScene('mat')).toBe(true);
      
      // Take leaflet to inventory using real command flows
      const openResult = dropHelper.executeOpen('open mailbox');
      expect(openResult.success).toBe(true);
      
      const takeResult = dropHelper.executeTake('take leaflet');
      expect(takeResult.success).toBe(true);
      expect(dropHelper.isInInventory('adver')).toBe(true);
      
      // Drop leaflet in scene alongside mat
      const dropResult = dropHelper.executeDropItem('leaflet');
      expect(dropResult.success).toBe(true);
      dropHelper.verifyItemMovedToScene('adver');
      
      // Both items should be in scene
      expect(dropHelper.isInScene('mat')).toBe(true);
      expect(dropHelper.isInScene('adver')).toBe(true);
    });
  });
});
