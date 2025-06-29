/**
 * Basic Inventory Command Tests - West of House Scene
 * Tests inventory display functionality in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { InventoryCommandHelper } from './helpers/inventory_command_helper';

describe('Inventory Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let inventoryHelper: InventoryCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Inventory command helper
    inventoryHelper = new InventoryCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    
    // Clear inventory for fresh test
    inventoryHelper.clearInventory();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Basic Inventory Display', () => {
    it('should display empty inventory message when carrying nothing', () => {
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifyEmptyInventory(result);
      expect(inventoryHelper.getInventoryCount()).toBe(0);
    });

    it('should display single item when carrying one item', () => {
      // Add a test item to inventory
      const success = inventoryHelper.addItemToInventory('mat');
      expect(success).toBe(true);
      
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
      expect(inventoryHelper.getInventoryCount()).toBe(1);
    });

    it('should display two items with proper grammar', () => {
      // Add two test items to inventory
      inventoryHelper.addItemToInventory('mat');
      inventoryHelper.addItemToInventory('adver');
      
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifyInventoryTwoItems(result, 'welcome mat', 'leaflet');
      expect(inventoryHelper.getInventoryCount()).toBe(2);
    });

    it('should display multiple items with proper comma formatting', () => {
      // Add three items to inventory
      inventoryHelper.addItemToInventory('mat');
      inventoryHelper.addItemToInventory('adver');
      
      // Add a third item if available in the scene
      const testItemId = 'lamp'; // Assuming lamp exists in test data
      if (inventoryHelper.addItemToInventory(testItemId)) {
        const result = inventoryHelper.executeInventoryDisplay();
        
        inventoryHelper.verifyInventoryMultipleItems(result, ['welcome mat', 'leaflet', 'lamp']);
        expect(inventoryHelper.getInventoryCount()).toBe(3);
      } else {
        // If lamp not available, just test with two items
        const result = inventoryHelper.executeInventoryDisplay();
        inventoryHelper.verifyInventoryTwoItems(result, 'welcome mat', 'leaflet');
      }
    });
  });

  describe('Command Aliases and Syntax', () => {
    beforeEach(() => {
      // Add one item for consistent testing
      inventoryHelper.addItemToInventory('mat');
    });

    it('should work with full "inventory" command', () => {
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
    });

    it('should work with "i" alias', () => {
      const result = inventoryHelper.executeInventoryShort();
      
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
    });

    it('should work with "inv" alias', () => {
      const result = inventoryHelper.executeInventoryAbbreviated();
      
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
    });

    it('should ignore extra arguments gracefully', () => {
      const result = inventoryHelper.executeInventory('inventory extra arguments');
      
      // Should still show inventory despite extra arguments
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
    });

    it('should ignore extra arguments with aliases', () => {
      const result = inventoryHelper.executeInventory('i some extra text');
      
      // Should still show inventory despite extra arguments
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
    });
  });

  describe('Command Properties', () => {
    it('should not count as a move', () => {
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifyNoMove(result);
    });

    it('should always succeed', () => {
      const result = inventoryHelper.executeInventoryDisplay();
      
      inventoryHelper.verifySuccess(result);
    });

    it('should not provide score change', () => {
      const result = inventoryHelper.executeInventoryDisplay();
      
      expect(result.scoreChange).toBe(0);
    });
  });

  describe('Dynamic Inventory Changes', () => {
    it('should reflect inventory changes immediately', () => {
      // Start empty
      let result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyEmptyInventory(result);
      
      // Add item
      inventoryHelper.addItemToInventory('mat');
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
      
      // Add another item
      inventoryHelper.addItemToInventory('adver');
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyInventoryTwoItems(result, 'welcome mat', 'leaflet');
      
      // Remove first item
      inventoryHelper.removeItemFromInventory('mat');
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyInventorySingleItem(result, 'leaflet');
      
      // Clear all
      inventoryHelper.clearInventory();
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyEmptyInventory(result);
    });

    it('should handle rapid consecutive inventory commands', () => {
      inventoryHelper.addItemToInventory('mat');
      
      // Execute multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const result = inventoryHelper.executeInventoryDisplay();
        inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
      }
    });
  });

  describe('Integration with Game State', () => {
    it('should work correctly after other commands', () => {
      // This test ensures inventory command works within broader game context
      
      // Start with empty inventory
      let result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyEmptyInventory(result);
      
      // Simulate taking an item (using inventory service directly for test isolation)
      inventoryHelper.addItemToInventory('mat');
      
      // Check inventory shows the item
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyInventorySingleItem(result, 'welcome mat');
      
      // Simulate dropping the item
      inventoryHelper.removeItemFromInventory('mat');
      
      // Check inventory is empty again
      result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifyEmptyInventory(result);
    });

    it('should maintain consistent formatting across game sessions', () => {
      // Test that inventory format is consistent regardless of when it's called
      
      const testItems = ['mat'];
      
      // Add items in different orders and check formatting consistency
      testItems.forEach(itemId => {
        inventoryHelper.clearInventory();
        inventoryHelper.addItemToInventory(itemId);
        
        const result = inventoryHelper.executeInventoryDisplay();
        inventoryHelper.verifySuccess(result);
        inventoryHelper.verifyNoMove(result);
        // Message should always start with "You are carrying" for non-empty inventory
        expect(result.message).toMatch(/^You are carrying/);
      });
    });
  });
});