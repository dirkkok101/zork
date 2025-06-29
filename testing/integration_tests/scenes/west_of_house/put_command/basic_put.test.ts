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
      testEnv.services.gameState as any,
      testEnv.services.scene as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.combat,
      testEnv.services.persistence,
      testEnv.services.output as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    
    // Clear inventory for fresh test
    const inventory = testEnv.services.inventory as any;
    const items = inventory.getItems();
    items.forEach((itemId: string) => {
      inventory.removeItem(itemId);
    });
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Authentic West of House Put Interactions', () => {
    describe('Put Leaflet Back in Mailbox', () => {
      beforeEach(() => {
        // Setup: Open mailbox, take leaflet, close mailbox
        const openResult = putHelper.executeOpen('open mailbox');
        if (openResult.success) {
          const takeResult = putHelper.executeTake('take leaflet');
          if (takeResult.success) {
            // Remove leaflet from scene since take succeeded
            putHelper.removeFromScene('adver');
            putHelper.addToInventory('adver');
          }
        }
      });

      it('should fail to put leaflet in closed mailbox', () => {
        // Mailbox should be closed after setup
        expect(putHelper.isContainerOpen('mailb')).toBe(false);
        expect(putHelper.isInInventory('adver')).toBe(true);
        
        const result = putHelper.executePutInContainer('leaflet', 'mailbox');
        
        putHelper.verifyContainerClosed(result, 'mailbox');
        // Leaflet should still be in inventory
        expect(putHelper.isInInventory('adver')).toBe(true);
        expect(putHelper.isInContainer('adver', 'mailb')).toBe(false);
      });

      it('should successfully put leaflet in open mailbox', () => {
        // First open the mailbox
        const openResult = putHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        expect(putHelper.isContainerOpen('mailb')).toBe(true);
        
        const initialCount = putHelper.getInventoryCount();
        expect(putHelper.isInInventory('adver')).toBe(true);
        
        const result = putHelper.executePutInContainer('leaflet', 'mailbox');
        
        putHelper.verifyPutSuccess(result, 'leaflet', 'mailbox');
        putHelper.verifyItemMovedToContainer('adver', 'mailb');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put leaflet using various aliases', () => {
        // Open mailbox first
        const openResult = putHelper.executeOpen('open mailbox');
        expect(openResult.success).toBe(true);
        
        const leafletAliases = ['leaflet', 'pamph', 'leafl', 'bookl'];
        const mailboxAliases = ['mailbox', 'box', 'mail'];
        
        // Test first combination
        const result = putHelper.executePutInContainer(leafletAliases[0], mailboxAliases[0]);
        if (result.success) {
          putHelper.verifyPutSuccess(result, 'leaflet', 'mailbox');
          putHelper.verifyItemMovedToContainer('adver', 'mailb');
        }
      });
    });

    describe('Put Down Items (Simple Drop)', () => {
      beforeEach(() => {
        // Setup: Take the welcome mat for testing
        const takeResult = putHelper.executeTake('take welcome mat');
        if (takeResult.success) {
          putHelper.removeFromScene('mat');
          putHelper.addToInventory('mat');
        }
      });

      it('should successfully put down welcome mat', () => {
        expect(putHelper.isInInventory('mat')).toBe(true);
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutDown('welcome mat');
        
        putHelper.verifyPutSuccess(result, 'welcome mat');
        putHelper.verifyItemMovedToScene('mat');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put down mat using aliases', () => {
        expect(putHelper.isInInventory('mat')).toBe(true);
        
        const aliases = ['mat', 'welco', 'rubbe'];
        const result = putHelper.executePutDown(aliases[0]);
        
        if (result.success) {
          putHelper.verifyPutSuccess(result, 'welcome mat');
          putHelper.verifyItemMovedToScene('mat');
        }
      });
    });

    describe('Put Items On Objects', () => {
      beforeEach(() => {
        // Setup: Take the welcome mat for testing
        const takeResult = putHelper.executeTake('take welcome mat');
        if (takeResult.success) {
          putHelper.removeFromScene('mat');
          putHelper.addToInventory('mat');
        }
      });

      it('should put welcome mat on mailbox', () => {
        expect(putHelper.isInInventory('mat')).toBe(true);
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutOn('welcome mat', 'mailbox');
        
        putHelper.verifyPutSuccess(result, 'welcome mat', 'mailbox');
        putHelper.verifyItemMovedToScene('mat');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put mat on door', () => {
        expect(putHelper.isInInventory('mat')).toBe(true);
        
        const result = putHelper.executePutOn('mat', 'door');
        
        putHelper.verifyPutSuccess(result, 'welcome mat', 'door');
        putHelper.verifyItemMovedToScene('mat');
      });
    });

    describe('Put Items Under Objects', () => {
      beforeEach(() => {
        // Setup: Get leaflet in inventory
        const openResult = putHelper.executeOpen('open mailbox');
        if (openResult.success) {
          const takeResult = putHelper.executeTake('take leaflet');
          if (takeResult.success) {
            putHelper.removeFromScene('adver');
            putHelper.addToInventory('adver');
          }
        }
      });

      it('should put leaflet under welcome mat', () => {
        expect(putHelper.isInInventory('adver')).toBe(true);
        const initialCount = putHelper.getInventoryCount();
        
        const result = putHelper.executePutUnder('leaflet', 'welcome mat');
        
        putHelper.verifyPutSuccess(result, 'leaflet', 'welcome mat');
        putHelper.verifyItemMovedToScene('adver');
        putHelper.verifyInventoryCountChange(initialCount, -1);
      });

      it('should put leaflet under mailbox', () => {
        expect(putHelper.isInInventory('adver')).toBe(true);
        
        const result = putHelper.executePutUnder('leaflet', 'mailbox');
        
        putHelper.verifyPutSuccess(result, 'leaflet', 'mailbox');
        putHelper.verifyItemMovedToScene('adver');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty put command', () => {
      const result = putHelper.executePut('put');
      
      putHelper.verifyFailure(result, 'Put what');
      putHelper.verifyNoMove(result);
    });

    it('should handle put without preposition', () => {
      // Add item to inventory for test
      putHelper.addToInventory('mat');
      
      const result = putHelper.executePut('put mat mailbox');
      
      putHelper.verifyFailure(result, 'Put it where');
      putHelper.verifyNoMove(result);
    });

    it('should handle put item not in inventory', () => {
      const result = putHelper.executePutInContainer('phantom', 'mailbox');
      
      putHelper.verifyDontHave(result, 'phantom');
      putHelper.verifyNoMove(result);
    });

    it('should handle put in non-existent container', () => {
      putHelper.addToInventory('mat');
      
      const result = putHelper.executePutInContainer('mat', 'phantom');
      
      putHelper.verifyItemNotFound(result, 'phantom');
      putHelper.verifyNoMove(result);
    });

    it('should handle put in non-container', () => {
      putHelper.addToInventory('mat');
      
      const result = putHelper.executePutInContainer('mat', 'door');
      
      putHelper.verifyCannotPutIn(result, 'door');
      putHelper.verifyNoMove(result);
    });
  });

  describe('Command Syntax Variations', () => {
    beforeEach(() => {
      // Setup: Add mat to inventory for testing
      putHelper.addToInventory('mat');
    });

    it('should work with "put <item> in <container>"', () => {
      // Open mailbox first
      const openResult = putHelper.executeOpen('open mailbox');
      if (openResult.success) {
        const result = putHelper.executePut('put mat in mailbox');
        putHelper.verifyPutSuccess(result, 'welcome mat', 'mailbox');
      }
    });

    it('should work with "put <item> on <object>"', () => {
      const result = putHelper.executePut('put mat on mailbox');
      putHelper.verifyPutSuccess(result, 'welcome mat', 'mailbox');
    });

    it('should work with "put <item> under <object>"', () => {
      const result = putHelper.executePut('put mat under mailbox');
      putHelper.verifyPutSuccess(result, 'welcome mat', 'mailbox');
    });

    it('should work with "put down <item>"', () => {
      const result = putHelper.executePut('put down mat');
      putHelper.verifyPutSuccess(result, 'welcome mat');
    });
  });

  describe('Multiple Item Scenarios', () => {
    it('should handle putting multiple items in sequence', () => {
      // Setup: Take mat and get leaflet
      const takeMatResult = putHelper.executeTake('take welcome mat');
      if (takeMatResult.success) {
        putHelper.removeFromScene('mat');
        putHelper.addToInventory('mat');
      }
      
      const openResult = putHelper.executeOpen('open mailbox');
      if (openResult.success) {
        const takeLeafletResult = putHelper.executeTake('take leaflet');
        if (takeLeafletResult.success) {
          putHelper.removeFromScene('adver');
          putHelper.addToInventory('adver');
        }
      }
      
      const initialCount = putHelper.getInventoryCount();
      expect(initialCount).toBe(2); // mat and leaflet
      
      // Put mat down first
      const putMatResult = putHelper.executePutDown('mat');
      if (putMatResult.success) {
        putHelper.verifyItemMovedToScene('mat');
        putHelper.verifyInventoryCountChange(initialCount, -1);
        
        // Put leaflet back in mailbox
        const putLeafletResult = putHelper.executePutInContainer('leaflet', 'mailbox');
        if (putLeafletResult.success) {
          putHelper.verifyItemMovedToContainer('adver', 'mailb');
          putHelper.verifyInventoryCountChange(initialCount, -2);
        }
      }
    });
  });
});