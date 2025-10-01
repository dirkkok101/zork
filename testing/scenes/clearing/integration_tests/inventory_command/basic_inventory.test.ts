/**
 * Inventory Command Tests - Clearing Scene
 * Auto-generated tests for inventory command functionality
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { InventoryCommandHelper } from '@testing/helpers/InventoryCommandHelper';

describe('Inventory Command - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let inventoryHelper: InventoryCommandHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

    inventoryHelper = new InventoryCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.inventory as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Empty Inventory', () => {
    it('should display empty inventory message when carrying nothing', () => {
      // Ensure inventory is empty
      inventoryHelper.clearInventory();

      const result = inventoryHelper.executeInventoryDisplay();

      inventoryHelper.verifySuccess(result);
      expect(result.message).toMatch(/empty|nothing|not carrying/i);
      inventoryHelper.verifyNoMove(result);
    });
  });

  describe('Single Item in Inventory', () => {
    it('should display single item when carrying one item', () => {
      // Setup: Clear inventory and add one item
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('leave');

      const result = inventoryHelper.executeInventoryDisplay();

      inventoryHelper.verifySuccess(result);
      expect(result.message).toMatch(/carrying|have/i);
      expect(result.message.toLowerCase()).toContain('pile of leaves'.toLowerCase());
      inventoryHelper.verifyNoMove(result);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "inventory" command', () => {
      inventoryHelper.clearInventory();

      const result = inventoryHelper.executeInventory('inventory');

      inventoryHelper.verifySuccess(result);
      inventoryHelper.verifyNoMove(result);
    });

    it('should work with "i" shorthand', () => {
      inventoryHelper.clearInventory();

      const result = inventoryHelper.executeInventoryShort();

      inventoryHelper.verifySuccess(result);
      inventoryHelper.verifyNoMove(result);
    });

    it('should work with "inv" abbreviation', () => {
      inventoryHelper.clearInventory();

      const result = inventoryHelper.executeInventoryAbbreviated();

      inventoryHelper.verifySuccess(result);
      inventoryHelper.verifyNoMove(result);
    });

    it('should display same result for all aliases', () => {
      // Setup
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('leave');

      const inventoryResult = inventoryHelper.executeInventory('inventory');
      const iResult = inventoryHelper.executeInventoryShort();
      const invResult = inventoryHelper.executeInventoryAbbreviated();

      // All should show the same item
      expect(inventoryResult.message).toBe(iResult.message);
      expect(inventoryResult.message).toBe(invResult.message);
    });
  });

  describe('Game State Tracking', () => {
    it('should not count inventory as a move', () => {
      const result = inventoryHelper.executeInventoryDisplay();

      inventoryHelper.verifyNoMove(result);
    });

    it('should consistently report inventory state', () => {
      inventoryHelper.clearInventory();

      const result1 = inventoryHelper.executeInventoryDisplay();
      const result2 = inventoryHelper.executeInventoryDisplay();

      // Both should report empty inventory
      expect(result2.message).toBe(result1.message);
    });

    it('should track inventory changes across commands', () => {
      // Start empty
      inventoryHelper.clearInventory();

      const emptyResult = inventoryHelper.executeInventoryDisplay();
      expect(emptyResult.message).toMatch(/empty|nothing/i);

      // Add item
      inventoryHelper.addItemToInventory('leave');

      // Verify inventory reflects change
      const updatedResult = inventoryHelper.executeInventoryDisplay();
      expect(updatedResult.message.toLowerCase()).toContain('pile of leaves'.toLowerCase());
      expect(updatedResult.message).not.toBe(emptyResult.message);
    });
  });

  describe('Inventory Count Verification', () => {
    it('should have zero items when inventory is empty', () => {
      inventoryHelper.clearInventory();

      expect(inventoryHelper.getInventoryCount()).toBe(0);

      const result = inventoryHelper.executeInventoryDisplay();
      expect(result.message).toMatch(/empty|nothing/i);
    });

    it('should have correct count when items are added', () => {
      inventoryHelper.clearInventory();

      expect(inventoryHelper.getInventoryCount()).toBe(0);

      inventoryHelper.addItemToInventory('leave');

      expect(inventoryHelper.getInventoryCount()).toBe(1);
    });

  });

  describe('State Consistency', () => {
    it('should maintain inventory state across multiple checks', () => {
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('leave');

      const result1 = inventoryHelper.executeInventoryDisplay();
      const result2 = inventoryHelper.executeInventoryDisplay();
      const result3 = inventoryHelper.executeInventoryDisplay();

      // All results should be identical
      expect(result2.message).toBe(result1.message);
      expect(result3.message).toBe(result1.message);
    });
  });
});
