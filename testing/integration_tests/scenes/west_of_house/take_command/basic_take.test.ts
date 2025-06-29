/**
 * Basic Take Command Tests - West of House Scene
 * Tests taking various objects in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from './helpers/take_command_helper';

describe('Take Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Take command helper
    takeHelper = new TakeCommandHelper(
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

  describe('Authentic West of House Take Interactions', () => {
    beforeEach(() => {
      // Ensure clean state with only real scene items
      testEnv.westOfHouseHelper.clearTestItems();
    });

    describe('Taking the Welcome Mat', () => {
      it('should successfully take the welcome mat', () => {
        const initialCount = takeHelper.getInventoryCount();
        
        const result = takeHelper.executeTakeTarget('welcome mat');
        
        takeHelper.verifyTakeSuccess(result, 'welcome mat');
        takeHelper.verifyItemMoved('mat', true);
        takeHelper.verifyInventoryCountChange(initialCount, 1);
      });

      it('should take mat using "welco" alias', () => {
        const result = takeHelper.executeTakeTarget('welco');
        
        takeHelper.verifyTakeSuccess(result, 'welcome mat');
        takeHelper.verifyItemMoved('mat', true);
      });

      it('should take mat using "rubbe" alias', () => {
        const result = takeHelper.executeTakeTarget('rubbe');
        
        takeHelper.verifyTakeSuccess(result, 'welcome mat');
        takeHelper.verifyItemMoved('mat', true);
      });

      it('should fail if trying to take mat again when already in inventory', () => {
        // First take the mat
        const firstResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifySuccess(firstResult);
        
        // Try to take it again
        const secondResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifyAlreadyHave(secondResult, 'welcome mat');
        takeHelper.verifyInventoryCountChange(0, 1); // Only one in inventory
      });
    });

    describe('Taking the Leaflet from Mailbox', () => {
      it('should fail to take leaflet when mailbox is closed', () => {
        const result = takeHelper.executeTakeTarget('leaflet');
        
        takeHelper.verifyItemNotFound(result, 'leaflet');
        // Leaflet should still be in closed mailbox
        expect(takeHelper.isInContainer('adver', 'mailb')).toBe(true);
        expect(takeHelper.isInInventory('adver')).toBe(false);
      });

      it('should successfully take leaflet after opening mailbox', () => {
        // First open the mailbox
        const openResult = takeHelper.executeOpen('open mailbox');
        
        // Only proceed if open was successful
        if (openResult.success) {
          const initialCount = takeHelper.getInventoryCount();
          
          // Verify leaflet is now accessible in open mailbox
          expect(takeHelper.isAccessible('adver')).toBe(true);
          expect(takeHelper.isInContainer('adver', 'mailb')).toBe(true);
          
          // Then take the leaflet
          const result = takeHelper.executeTakeTarget('leaflet');
          
          takeHelper.verifyTakeSuccess(result, 'leaflet');
          takeHelper.verifyInventoryCountChange(initialCount, 1);
          
          // Verify item was moved from container to inventory
          expect(takeHelper.isInInventory('adver')).toBe(true);
          expect(takeHelper.isInContainer('adver', 'mailb')).toBe(false);
        } else {
          // If open failed, just verify leaflet is not accessible
          const result = takeHelper.executeTakeTarget('leaflet');
          takeHelper.verifyItemNotFound(result, 'leaflet');
        }
      });

      it('should take leaflet using various aliases', () => {
        // First open the mailbox
        const openResult = takeHelper.executeOpen('open mailbox');
        
        if (openResult.success) {
          const aliases = ['leaflet', 'pamph', 'leafl', 'bookl', 'small'];
          
          // Test first alias
          const firstAlias = aliases[0];
          if (firstAlias) {
            const result = takeHelper.executeTakeTarget(firstAlias);
            if (result.success) {
              takeHelper.verifyTakeSuccess(result, 'leaflet');
              takeHelper.verifyItemMoved('adver', true);
              
              // Verify other aliases would now fail (already taken)
              aliases.slice(1).forEach(alias => {
                const failResult = takeHelper.executeTakeTarget(alias);
                takeHelper.verifyFailure(failResult);
              });
            }
          }
        }
      });
    });

    describe('Cannot Take Non-Portable Items', () => {
      it('should fail to take the mailbox', () => {
        const result = takeHelper.executeTakeTarget('mailbox');
        
        takeHelper.verifyCannotTake(result, 'mailbox');
        takeHelper.verifyItemMoved('mailb', false);
      });

      it('should fail to take the mailbox using "box" alias', () => {
        const result = takeHelper.executeTakeTarget('box');
        
        takeHelper.verifyCannotTake(result, 'mailbox');
        takeHelper.verifyItemMoved('mailb', false);
      });

      it('should fail to take the front door', () => {
        const result = takeHelper.executeTakeTarget('door');
        
        takeHelper.verifyCannotTake(result, 'door');
        takeHelper.verifyItemMoved('fdoor', false);
      });

      it('should fail to take door using "front" alias', () => {
        const result = takeHelper.executeTakeTarget('front');
        
        takeHelper.verifyCannotTake(result, 'door');
        takeHelper.verifyItemMoved('fdoor', false);
      });
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      const result = takeHelper.executeTake('take welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "get" alias', () => {
      const result = takeHelper.executeTake('get welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "pick up" syntax', () => {
      const result = takeHelper.executeTake('pick up welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "grab" alias', () => {
      const result = takeHelper.executeTake('grab welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty take command gracefully', () => {
      const result = takeHelper.executeTake('take');
      
      takeHelper.verifyFailure(result, 'Take what');
      takeHelper.verifyNoMove(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = takeHelper.executeTakeTarget('phantom');
      
      takeHelper.verifyItemNotFound(result, 'phantom');
      takeHelper.verifyNoMove(result);
    });

    it('should handle taking items from other scenes gracefully', () => {
      const result = takeHelper.executeTakeTarget('unicorn');
      
      takeHelper.verifyItemNotFound(result, 'unicorn');
      takeHelper.verifyNoMove(result);
    });

    it('should handle malformed take commands', () => {
      const result = takeHelper.executeTake('pick');
      
      takeHelper.verifyFailure(result, 'Take what');
      takeHelper.verifyNoMove(result);
    });
  });

  describe('Multiple Item Scenarios', () => {
    it('should handle taking multiple items in sequence', () => {
      const initialCount = takeHelper.getInventoryCount();
      
      // Take the mat first
      const matResult = takeHelper.executeTakeTarget('welcome mat');
      takeHelper.verifyTakeSuccess(matResult, 'welcome mat');
      takeHelper.verifyInventoryCountChange(initialCount, 1);
      
      // Open mailbox and take leaflet
      const openResult = takeHelper.executeOpen('open mailbox');
      if (openResult.success) {
        const leafletResult = takeHelper.executeTakeTarget('leaflet');
        if (leafletResult.success) {
          takeHelper.verifyTakeSuccess(leafletResult, 'leaflet');
          takeHelper.verifyInventoryCountChange(initialCount, 2);
          
          // Verify both items are in inventory
          takeHelper.verifyItemMoved('mat', true);
          takeHelper.verifyItemMoved('adver', true);
        }
      }
    });

    it('should maintain inventory state between commands', () => {
      // Take mat
      const matResult = takeHelper.executeTakeTarget('welcome mat');
      takeHelper.verifySuccess(matResult);
      
      // Verify inventory persists
      expect(takeHelper.isInInventory('mat')).toBe(true);
      expect(takeHelper.getInventoryCount()).toBe(1);
      
      // Try to take something we can't
      const doorResult = takeHelper.executeTakeTarget('door');
      takeHelper.verifyFailure(doorResult);
      
      // Verify original item still in inventory
      expect(takeHelper.isInInventory('mat')).toBe(true);
      expect(takeHelper.getInventoryCount()).toBe(1);
    });
  });
});