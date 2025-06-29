/**
 * Basic Put Command Tests - West of House Scene
 * Tests putting various objects in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from './helpers/put_command_helper';

describe('Put Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let putHelper: PutCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Put command helper
    putHelper = new PutCommandHelper(
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

  describe('Authentic West of House Put Interactions', () => {
    describe('Put Leaflet Back in Mailbox', () => {
      beforeEach(() => {
        // Setup: Open mailbox and take leaflet using real command flows
        const openResult = putHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        
        const takeResult = putHelper.executeTake('take leaflet');
        expect(takeResult.success).toBe(true);
        expect(putHelper.isInInventory('adver')).toBe(true);
      });

      it('should fail to put leaflet in closed mailbox', () => {
        // Close mailbox for this test
        const closeResult = putHelper.executeClose('close mailbox');
        expect(closeResult.success).toBe(true);
        expect(putHelper.isContainerOpen('mailb')).toBe(false);
        
        const result = putHelper.executePutInContainer('leaflet', 'mailbox');
        
        putHelper.verifyContainerClosed(result, 'mailbox');
        // Leaflet should still be in inventory
        expect(putHelper.isInInventory('adver')).toBe(true);
        expect(putHelper.isInContainer('adver', 'mailb')).toBe(false);
      });

      it('should successfully put leaflet in open mailbox', () => {
        // Mailbox should be open from beforeEach
        expect(putHelper.isContainerOpen('mailb')).toBe(true);
        
        const initialCount = putHelper.getInventoryCount();
        expect(putHelper.isInInventory('adver')).toBe(true);
        
        const result = putHelper.executePutInContainer('leaflet', 'mailbox');
        
        putHelper.verifyPutSuccess(result, 'leaflet', 'mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put leaflet using various aliases', () => {
        expect(putHelper.isContainerOpen('mailb')).toBe(true);
        
        // Test each authentic Zork alias individually
        const leafletAliases = ['leaflet', 'pamph', 'leafl', 'bookl'];
        const mailboxAliases = ['mailbox', 'box', 'small'];
        
        // Test first combination and verify response uses full names
        const result = putHelper.executePutInContainer(leafletAliases[0]!, mailboxAliases[0]!);
        expect(result.success).toBe(true);
        expect(result.message).toContain('leaflet');
        expect(result.message).toContain('mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
        
        // Reset for next test
        const takeResult = putHelper.executeTake('take leaflet');
        expect(takeResult.success).toBe(true);
        
        // Test with different aliases
        const result2 = putHelper.executePutInContainer(leafletAliases[1]!, mailboxAliases[1]!);
        expect(result2.success).toBe(true);
        expect(result2.message).toContain('leaflet');
        expect(result2.message).toContain('mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
      });

      it('should use full item names in response regardless of input alias', () => {
        expect(putHelper.isContainerOpen('mailb')).toBe(true);
        
        // Test with full names
        const fullNameResult = putHelper.executePutInContainer('leaflet', 'mailbox');
        expect(fullNameResult.success).toBe(true);
        expect(fullNameResult.message).toContain('leaflet');
        expect(fullNameResult.message).toContain('mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
        
        // Reset for alias test
        const retakeResult = putHelper.executeTake('take leaflet');
        expect(retakeResult.success).toBe(true);
        
        // Test with short aliases - should still use full names in response
        const aliasResult = putHelper.executePutInContainer('pamph', 'box');
        expect(aliasResult.success).toBe(true);
        expect(aliasResult.message).toContain('leaflet');
        expect(aliasResult.message).toContain('mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
      });
    });

    describe('Put Down Items (Simple Drop Equivalent)', () => {
      beforeEach(() => {
        // Setup: Take the welcome mat using real command flow
        const takeResult = putHelper.executeTake('take welcome mat');
        expect(takeResult.success).toBe(true);
        expect(putHelper.isInInventory('mat')).toBe(true);
      });

      it('should successfully put down welcome mat', () => {
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutDown('welcome mat');
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put down mat using various aliases', () => {
        // Test each authentic Zork alias individually
        const aliases = ['mat', 'welco', 'rubbe'];
        
        // Test first alias
        const result1 = putHelper.executePutDown(aliases[0]!);
        expect(result1.success).toBe(true);
        expect(result1.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
        
        // Reset for next test
        const retakeResult1 = putHelper.executeTake('take welcome mat');
        expect(retakeResult1.success).toBe(true);
        
        // Test second alias (welco)
        const result2 = putHelper.executePutDown(aliases[1]!);
        expect(result2.success).toBe(true);
        expect(result2.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
        
        // Reset for next test
        const retakeResult2 = putHelper.executeTake('take welcome mat');
        expect(retakeResult2.success).toBe(true);
        
        // Test third alias (rubbe)
        const result3 = putHelper.executePutDown(aliases[2]!);
        expect(result3.success).toBe(true);
        expect(result3.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
      });

      it('should use full item name in response regardless of input alias', () => {
        // Test with full name
        const fullNameResult = putHelper.executePutDown('welcome mat');
        expect(fullNameResult.success).toBe(true);
        expect(fullNameResult.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
        
        // Reset for alias test
        const retakeResult = putHelper.executeTake('take welcome mat');
        expect(retakeResult.success).toBe(true);
        
        // Test with short alias - should still use full name in response
        const aliasResult = putHelper.executePutDown('mat');
        expect(aliasResult.success).toBe(true);
        expect(aliasResult.message).toBe('You put down the welcome mat.');
        putHelper.verifyItemMovedToScene('mat');
      });
    });

    describe('Put Items On Objects', () => {
      beforeEach(() => {
        // Setup: Take the welcome mat using real command flow
        const takeResult = putHelper.executeTake('take welcome mat');
        expect(takeResult.success).toBe(true);
        expect(putHelper.isInInventory('mat')).toBe(true);
      });

      it('should put welcome mat on mailbox', () => {
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutOn('welcome mat', 'mailbox');
        
        putHelper.verifyPutSuccess(result, 'welcome mat', 'mailbox');
        putHelper.verifyItemMovedToScene('mat');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put mat on door using aliases', () => {
        const result = putHelper.executePutOn('mat', 'door');
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('welcome mat');
        expect(result.message).toContain('door');
        putHelper.verifyItemMovedToScene('mat');
      });
    });

    describe('Put Items Under Objects', () => {
      beforeEach(() => {
        // Setup: Get leaflet in inventory using real command flows
        const openResult = putHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        
        const takeResult = putHelper.executeTake('take leaflet');
        expect(takeResult.success).toBe(true);
        expect(putHelper.isInInventory('adver')).toBe(true);
      });

      it('should put leaflet under welcome mat', () => {
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutUnder('leaflet', 'welcome mat');
        
        putHelper.verifyPutSuccess(result, 'leaflet', 'welcome mat');
        putHelper.verifyItemMovedToScene('adver');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put leaflet under mailbox using aliases', () => {
        const result = putHelper.executePutUnder('pamph', 'box');
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('leaflet');
        expect(result.message).toContain('mailbox');
        putHelper.verifyItemMovedToScene('adver');
      });
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "put" command', () => {
      // Take leaflet first using real command flow
      const openResult = putHelper.executeOpen('open mailbox');
      expect(openResult.success).toBe(true);
      const takeResult = putHelper.executeTake('take leaflet');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('put leaflet in mailbox');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('leaflet');
      expect(result.message).toContain('mailbox');
      putHelper.verifyItemMovedToContainer('adver', 'mailb');
    });

    it('should work with "place" alias', () => {
      // Take mat first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('place welcome mat on mailbox');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('welcome mat');
      expect(result.message).toContain('mailbox');
      putHelper.verifyItemMovedToScene('mat');
    });

    it('should work with "position" alias', () => {
      // Take mat first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('position welcome mat under mailbox');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('welcome mat');
      expect(result.message).toContain('mailbox');
      putHelper.verifyItemMovedToScene('mat');
    });

    it('should work with "set" alias', () => {
      // Take mat first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('set welcome mat on door');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('welcome mat');
      putHelper.verifyItemMovedToScene('mat');
    });

    it('should work with "put down <item>" syntax', () => {
      // Take mat first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('put down welcome mat');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('You put down the welcome mat.');
      putHelper.verifyItemMovedToScene('mat');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty put command', () => {
      const result = putHelper.executePut('put');
      
      putHelper.verifyFailure(result, 'Put what');
      putHelper.verifyNoMove(result);
    });

    it('should handle put without preposition', () => {
      // Take item first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePut('put welcome mat mailbox');
      
      putHelper.verifyFailure(result, 'Put it where');
      putHelper.verifyNoMove(result);
      expect(putHelper.isInInventory('mat')).toBe(true);
    });

    it('should handle put item not in inventory', () => {
      const result = putHelper.executePutInContainer('phantom', 'mailbox');
      
      putHelper.verifyDontHave(result, 'phantom');
      putHelper.verifyNoMove(result);
    });

    it('should handle put in non-existent container', () => {
      // Take item first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePutInContainer('welcome mat', 'phantom');
      
      putHelper.verifyItemNotFound(result, 'phantom');
      putHelper.verifyNoMove(result);
      expect(putHelper.isInInventory('mat')).toBe(true);
    });

    it('should handle put in non-container', () => {
      // Take item first using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      const result = putHelper.executePutInContainer('welcome mat', 'door');
      
      putHelper.verifyCannotPutIn(result, 'door');
      putHelper.verifyNoMove(result);
      expect(putHelper.isInInventory('mat')).toBe(true);
    });

    it('should handle item too big for container (authentic size validation)', () => {
      // Take mat (size 12) using real command flow
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      
      // Open mailbox (capacity 10)
      const openResult = putHelper.executeOpen('open mailbox');
      expect(openResult.success).toBe(true);
      
      // Try to put mat in mailbox - should fail due to size
      const result = putHelper.executePutInContainer('welcome mat', 'mailbox');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("won't fit");
      putHelper.verifyNoMove(result);
      expect(putHelper.isInInventory('mat')).toBe(true);
      expect(putHelper.isInContainer('mat', 'mailb')).toBe(false);
    });

    it('should allow item that fits in container (authentic size validation)', () => {
      // Open mailbox and take leaflet (size 2) using real command flow
      const openResult = putHelper.executeOpen('open mailbox');
      expect(openResult.success).toBe(true);
      
      const takeResult = putHelper.executeTake('take leaflet');
      expect(takeResult.success).toBe(true);
      
      // Put leaflet back in mailbox (capacity 10) - should succeed
      const result = putHelper.executePutInContainer('leaflet', 'mailbox');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('leaflet');
      expect(result.message).toContain('mailbox');
      putHelper.verifyItemMovedToContainer('adver', 'mailb');
      expect(putHelper.isInInventory('adver')).toBe(false);
    });
  });

  describe('Multiple Item Scenarios', () => {
    it('should handle putting multiple items in sequence', () => {
      // Setup: Take mat and get leaflet using real command flows
      const takeMatResult = putHelper.executeTake('take welcome mat');
      expect(takeMatResult.success).toBe(true);
      expect(putHelper.isInInventory('mat')).toBe(true);
      
      const openResult = putHelper.executeOpen('open mailbox');
      expect(openResult.success).toBe(true);
      
      const takeLeafletResult = putHelper.executeTake('take leaflet');
      expect(takeLeafletResult.success).toBe(true);
      expect(putHelper.isInInventory('adver')).toBe(true);
      
      const initialCount = putHelper.getInventoryCount();
      expect(initialCount).toBe(2); // mat and leaflet
      
      // Put mat down first
      const putMatResult = putHelper.executePutDown('welcome mat');
      expect(putMatResult.success).toBe(true);
      putHelper.verifyItemMovedToScene('mat');
      putHelper.verifyInventoryCountChange(initialCount, -1);
      
      // Put leaflet back in mailbox
      const putLeafletResult = putHelper.executePutInContainer('leaflet', 'mailbox');
      expect(putLeafletResult.success).toBe(true);
      putHelper.verifyItemMovedToContainer('adver', 'mailb');
      putHelper.verifyInventoryCountChange(initialCount, -2);
    });

    it('should maintain scene state after puts', () => {
      // Take mat and put it down using real command flows
      const takeResult = putHelper.executeTake('take welcome mat');
      expect(takeResult.success).toBe(true);
      expect(putHelper.isInInventory('mat')).toBe(true);
      
      const putResult = putHelper.executePutDown('welcome mat');
      expect(putResult.success).toBe(true);
      putHelper.verifyItemMovedToScene('mat');
      
      // Verify we can take it again
      const retakeResult = putHelper.executeTake('take welcome mat');
      expect(retakeResult.success).toBe(true);
    });
  });
});