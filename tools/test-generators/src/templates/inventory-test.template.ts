/**
 * Inventory Command Test Template
 * Generates comprehensive tests for the Inventory command
 *
 * Template Variables:
 * - title: Scene title
 * - sceneId: Scene identifier
 * - testEnvType: TypeScript type for test environment
 * - factoryName: Factory class name
 * - takeableItems: Array of items that can be added to inventory
 * - firstTakeableItem: First takeable item object
 * - secondTakeableItem: Second takeable item object (if available)
 * - hasMultipleTakeableItems: Boolean indicating if there are multiple takeable items
 */

export const inventoryTestTemplate = `/**
 * Inventory Command Tests - {{title}} Scene
 * Auto-generated tests for inventory command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { InventoryCommandHelper } from '@testing/helpers/InventoryCommandHelper';

describe('Inventory Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let inventoryHelper: InventoryCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

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

  {{#if firstTakeableItem}}
  describe('Single Item in Inventory', () => {
    it('should display single item when carrying one item', () => {
      // Setup: Clear inventory and add one item
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      const result = inventoryHelper.executeInventoryDisplay();

      inventoryHelper.verifySuccess(result);
      expect(result.message).toMatch(/carrying|have/i);
      expect(result.message.toLowerCase()).toContain('{{firstTakeableItem.name}}'.toLowerCase());
      inventoryHelper.verifyNoMove(result);
    });
  });
  {{/if}}

  {{#if hasMultipleTakeableItems}}
  describe('Multiple Items in Inventory', () => {
    it('should display multiple items when carrying several items', () => {
      // Setup: Clear inventory and add multiple items
      inventoryHelper.clearInventory();
      {{#each takeableItems}}
      inventoryHelper.addItemToInventory('{{this.id}}');
      {{/each}}

      const result = inventoryHelper.executeInventoryDisplay();

      inventoryHelper.verifySuccess(result);
      expect(result.message).toMatch(/carrying|have/i);

      // Verify all items appear in the message
      {{#each takeableItems}}
      expect(result.message.toLowerCase()).toContain('{{this.name}}'.toLowerCase());
      {{/each}}

      inventoryHelper.verifyNoMove(result);
    });

    {{#if secondTakeableItem}}
    it('should update inventory display when items are added', () => {
      // Start with empty inventory
      inventoryHelper.clearInventory();

      const emptyResult = inventoryHelper.executeInventoryDisplay();
      expect(emptyResult.message).toMatch(/empty|nothing/i);

      // Add first item
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      const oneItemResult = inventoryHelper.executeInventoryDisplay();
      expect(oneItemResult.message.toLowerCase()).toContain('{{firstTakeableItem.name}}'.toLowerCase());

      // Add second item
      inventoryHelper.addItemToInventory('{{secondTakeableItem.id}}');

      const twoItemsResult = inventoryHelper.executeInventoryDisplay();
      expect(twoItemsResult.message.toLowerCase()).toContain('{{firstTakeableItem.name}}'.toLowerCase());
      expect(twoItemsResult.message.toLowerCase()).toContain('{{secondTakeableItem.name}}'.toLowerCase());
    });

    it('should update inventory display when items are removed', () => {
      // Setup: Add multiple items
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');
      inventoryHelper.addItemToInventory('{{secondTakeableItem.id}}');

      const twoItemsResult = inventoryHelper.executeInventoryDisplay();
      expect(twoItemsResult.message.toLowerCase()).toContain('{{firstTakeableItem.name}}'.toLowerCase());
      expect(twoItemsResult.message.toLowerCase()).toContain('{{secondTakeableItem.name}}'.toLowerCase());

      // Remove one item
      inventoryHelper.removeItemFromInventory('{{firstTakeableItem.id}}');

      const oneItemResult = inventoryHelper.executeInventoryDisplay();
      expect(oneItemResult.message.toLowerCase()).toContain('{{secondTakeableItem.name}}'.toLowerCase());
      expect(oneItemResult.message.toLowerCase()).not.toContain('{{firstTakeableItem.name}}'.toLowerCase());
    });
    {{/if}}
  });
  {{/if}}

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

    {{#if firstTakeableItem}}
    it('should display same result for all aliases', () => {
      // Setup
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      const inventoryResult = inventoryHelper.executeInventory('inventory');
      const iResult = inventoryHelper.executeInventoryShort();
      const invResult = inventoryHelper.executeInventoryAbbreviated();

      // All should show the same item
      expect(inventoryResult.message).toBe(iResult.message);
      expect(inventoryResult.message).toBe(invResult.message);
    });
    {{/if}}
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

    {{#if firstTakeableItem}}
    it('should track inventory changes across commands', () => {
      // Start empty
      inventoryHelper.clearInventory();

      const emptyResult = inventoryHelper.executeInventoryDisplay();
      expect(emptyResult.message).toMatch(/empty|nothing/i);

      // Add item
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      // Verify inventory reflects change
      const updatedResult = inventoryHelper.executeInventoryDisplay();
      expect(updatedResult.message.toLowerCase()).toContain('{{firstTakeableItem.name}}'.toLowerCase());
      expect(updatedResult.message).not.toBe(emptyResult.message);
    });
    {{/if}}
  });

  {{#if firstTakeableItem}}
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

      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      expect(inventoryHelper.getInventoryCount()).toBe(1);
    });

    {{#if hasMultipleTakeableItems}}
    it('should have correct count with multiple items', () => {
      inventoryHelper.clearInventory();

      {{#each takeableItems}}
      inventoryHelper.addItemToInventory('{{this.id}}');
      {{/each}}

      expect(inventoryHelper.getInventoryCount()).toBe({{takeableItems.length}});

      const result = inventoryHelper.executeInventoryDisplay();
      inventoryHelper.verifySuccess(result);
    });
    {{/if}}
  });
  {{/if}}

  {{#if firstTakeableItem}}
  describe('State Consistency', () => {
    it('should maintain inventory state across multiple checks', () => {
      inventoryHelper.clearInventory();
      inventoryHelper.addItemToInventory('{{firstTakeableItem.id}}');

      const result1 = inventoryHelper.executeInventoryDisplay();
      const result2 = inventoryHelper.executeInventoryDisplay();
      const result3 = inventoryHelper.executeInventoryDisplay();

      // All results should be identical
      expect(result2.message).toBe(result1.message);
      expect(result3.message).toBe(result1.message);
    });
  });
  {{/if}}
});
`;
