/**
 * Inventory Command Tests - Forest Scene
 * Auto-generated tests for inventory command functionality
 */

import '../setup';
import { Forest3TestEnvironment, Forest3IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { InventoryCommandHelper } from '@testing/helpers/InventoryCommandHelper';

describe('Inventory Command - Forest Scene', () => {
  let testEnv: Forest3TestEnvironment;
  let inventoryHelper: InventoryCommandHelper;

  beforeEach(async () => {
    testEnv = await Forest3IntegrationTestFactory.createTestEnvironment();

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

  });

});
