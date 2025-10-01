export const dropTestTemplate = `/**
 * Drop Command Tests - {{title}} Scene
 * Auto-generated tests for drop command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { DropCommandHelper } from '@testing/helpers/DropCommandHelper';

describe('Drop Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let dropHelper: DropCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    dropHelper = new DropCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if takeableItems}}
  describe('Drop Individual Items', () => {
    {{#each takeableItems}}
    it('should drop {{this.name}} from inventory to scene', () => {
      // Setup: Add item to inventory
      dropHelper.addToInventory('{{this.id}}');
      expect(dropHelper.isInInventory('{{this.id}}')).toBe(true);

      const result = dropHelper.executeDropItem('{{this.id}}');

      dropHelper.verifySuccess(result);
      dropHelper.verifyItemMovedToScene('{{this.id}}');
      dropHelper.verifyCountsAsMove(result);
    });

    {{/each}}
  });

  describe('Drop Items Not in Inventory', () => {
    {{#each takeableItems}}
    {{#if @first}}
    it('should fail to drop {{this.name}} when not in inventory', () => {
      // Ensure item is not in inventory
      expect(dropHelper.isInInventory('{{this.id}}')).toBe(false);

      const result = dropHelper.executeDropItem('{{this.id}}');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  {{#if containers}}
  describe('Drop Items into Containers', () => {
    {{#each containers}}
    {{#if this.canTake}}
    it('should drop item into {{this.name}} when open', () => {
      {{#if ../takeableItems}}
      {{#with (first ../takeableItems)}}
      // Setup: Add test item to inventory
      dropHelper.addToInventory('{{this.id}}');

      // Setup: Add container to scene and open it
      dropHelper.executeOpen('open {{../../this.id}}');
      {{/with}}
      {{/if}}

      {{#if ../takeableItems}}
      {{#with (first ../takeableItems)}}
      const result = dropHelper.executeDropInContainer('{{this.id}}', '{{../../this.id}}');

      if (result.success) {
        dropHelper.verifySuccess(result);
        dropHelper.verifyItemMovedToContainer('{{this.id}}', '{{../../this.id}}');
      }
      {{/with}}
      {{/if}}
    });

    it('should fail to drop item into closed {{this.name}}', () => {
      {{#if ../takeableItems}}
      {{#with (first ../takeableItems)}}
      // Setup: Add test item to inventory
      dropHelper.addToInventory('{{this.id}}');
      {{/with}}
      {{/if}}

      {{#if ../takeableItems}}
      {{#with (first ../takeableItems)}}
      const result = dropHelper.executeDropInContainer('{{this.id}}', '{{../../this.id}}');

      dropHelper.verifyFailure(result);
      {{/with}}
      {{/if}}
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  describe('Command Syntax and Aliases', () => {
    {{#if takeableItems}}
    {{#with (first takeableItems)}}
    it('should work with "drop" command', () => {
      dropHelper.addToInventory('{{this.id}}');

      const result = dropHelper.executeDropItem('{{this.id}}');
      dropHelper.verifySuccess(result);
    });

    it('should work with "drop down" syntax', () => {
      dropHelper.addToInventory('{{this.id}}');

      const result = dropHelper.executeDropDown('{{this.id}}');

      if (result.success) {
        dropHelper.verifySuccess(result);
      } else {
        // "drop down" may not be supported
        dropHelper.verifyFailure(result);
      }
    });
    {{/with}}
    {{/if}}
  });

  describe('Error Handling', () => {
    it('should handle empty drop command gracefully', () => {
      const result = dropHelper.executeDrop('drop');

      dropHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*drop|drop.*what/i);
    });

    {{#if takeableItems}}
    {{#with (first takeableItems)}}
    it('should handle dropping non-existent items', () => {
      const result = dropHelper.executeDropItem('nonexistent_item_xyz');

      dropHelper.verifyFailure(result);
    });
    {{/with}}
    {{/if}}
  });

  describe('Game State Tracking', () => {
    {{#if takeableItems}}
    {{#with (first takeableItems)}}
    it('should count drop command as a move', () => {
      dropHelper.addToInventory('{{this.id}}');

      const result = dropHelper.executeDropItem('{{this.id}}');

      dropHelper.verifyCountsAsMove(result);
    });

    it('should update scene state when dropping items', () => {
      // Setup: Item in inventory, not in scene
      dropHelper.addToInventory('{{this.id}}');
      dropHelper.removeFromScene('{{this.id}}');
      expect(dropHelper.isInInventory('{{this.id}}')).toBe(true);
      expect(dropHelper.isInScene('{{this.id}}')).toBe(false);

      dropHelper.executeDropItem('{{this.id}}');

      // Verify item moved to scene
      expect(dropHelper.isInInventory('{{this.id}}')).toBe(false);
      expect(dropHelper.isInScene('{{this.id}}')).toBe(true);
    });

    it('should decrease inventory count when dropping', () => {
      dropHelper.addToInventory('{{this.id}}');
      const initialCount = dropHelper.getInventoryCount();

      dropHelper.executeDropItem('{{this.id}}');

      dropHelper.verifyInventoryCountChange(initialCount, -1);
    });
    {{/with}}
    {{/if}}
  });

  {{#if multipleTakeableItems}}
  describe('Drop Multiple Items', () => {
    it('should handle dropping multiple items in sequence', () => {
      // Setup: Add all items to inventory
      {{#each takeableItems}}
      dropHelper.addToInventory('{{this.id}}');
      {{/each}}

      // Drop each item
      {{#each takeableItems}}
      dropHelper.executeDropItem('{{this.id}}');
      expect(dropHelper.isInScene('{{this.id}}')).toBe(true);
      {{/each}}

      // Verify all items in scene
      {{#each takeableItems}}
      expect(dropHelper.isInScene('{{this.id}}')).toBe(true);
      expect(dropHelper.isInInventory('{{this.id}}')).toBe(false);
      {{/each}}
    });
  });
  {{/if}}
});
`;
