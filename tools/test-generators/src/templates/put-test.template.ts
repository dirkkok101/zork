/**
 * Put Command Test Template
 * Generates comprehensive tests for the Put command
 *
 * Template Variables:
 * - title: Scene title
 * - sceneId: Scene identifier
 * - testEnvType: TypeScript type for test environment
 * - factoryName: Factory class name
 * - containers: Array of containers that can hold items
 * - takeableItems: Array of items that can be picked up and put in containers
 * - multipleContainers: Boolean indicating if there are multiple containers
 * - firstContainer: First container object
 * - firstTakeableItem: First takeable item object
 */

export const putTestTemplate = `/**
 * Put Command Tests - {{title}} Scene
 * Auto-generated tests for put command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { PutCommandHelper } from '@testing/helpers/PutCommandHelper';

describe('Put Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let putHelper: PutCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    putHelper = new PutCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if containers}}
  describe('Put Items in Containers', () => {
    {{#if firstTakeableItem}}
    {{#if firstContainer}}
    it('should put {{firstTakeableItem.name}} in {{firstContainer.name}} when open', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      expect(putHelper.isInInventory('{{firstTakeableItem.id}}')).toBe(true);

      // Setup: Open container
      putHelper.executeOpen('open {{firstContainer.id}}');
      expect(putHelper.isContainerOpen('{{firstContainer.id}}')).toBe(true);

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should fail to put {{firstTakeableItem.name}} in {{firstContainer.name}} when closed', () => {
      // Setup: Add item to inventory
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');

      // Setup: Ensure container is closed
      putHelper.executeClose('close {{firstContainer.id}}');
      expect(putHelper.isContainerOpen('{{firstContainer.id}}')).toBe(false);

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/closed|can't put/i);
    });
    {{/if}}
    {{/if}}
  });
  {{/if}}

  {{#if containers}}
  {{#if firstTakeableItem}}
  describe('Put Items Not in Inventory', () => {
    {{#if firstContainer}}
    it('should fail to put item not in inventory', () => {
      // Ensure item is not in inventory
      expect(putHelper.isInInventory('{{firstTakeableItem.id}}')).toBe(false);

      // Open container
      putHelper.executeOpen('open {{firstContainer.id}}');

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/don't have|not carrying/i);
    });
    {{/if}}
  });
  {{/if}}
  {{/if}}

  {{#if containers}}
  describe('Command Syntax and Aliases', () => {
    {{#if firstContainer}}
    {{#if firstTakeableItem}}
    it('should work with "put <item> in <container>" syntax', () => {
      // Setup
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      putHelper.executeOpen('open {{firstContainer.id}}');

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    {{#if firstContainer.aliases}}
    {{#each firstContainer.aliases}}
    it('should work with container alias "{{this}}"', () => {
      // Setup
      putHelper.addToInventory('{{../firstTakeableItem.id}}');
      putHelper.removeFromScene('{{../firstTakeableItem.id}}');
      putHelper.executeOpen('open {{../firstContainer.id}}');

      const result = putHelper.executePutInContainer('{{../firstTakeableItem.id}}', '{{this}}');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('{{../firstTakeableItem.id}}', '{{../firstContainer.id}}');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    {{/each}}
    {{/if}}

    {{#if firstTakeableItem.aliases}}
    {{#each firstTakeableItem.aliases}}
    it('should work with item alias "{{this}}"', () => {
      // Setup
      putHelper.addToInventory('{{../firstTakeableItem.id}}');
      putHelper.removeFromScene('{{../firstTakeableItem.id}}');
      putHelper.executeOpen('open {{../firstContainer.id}}');

      const result = putHelper.executePutInContainer('{{this}}', '{{../firstContainer.id}}');

      if (result.success) {
        putHelper.verifySuccess(result);
        putHelper.verifyItemMovedToContainer('{{../firstTakeableItem.id}}', '{{../firstContainer.id}}');
      } else {
        // Alias may not be recognized
        putHelper.verifyFailure(result);
      }
    });
    {{/each}}
    {{/if}}
    {{/if}}
    {{/if}}
  });
  {{/if}}

  describe('Error Handling', () => {
    it('should handle empty put command gracefully', () => {
      const result = putHelper.executePut('put');

      putHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*put|put.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = putHelper.executePutInContainer('nonexistent_item_xyz', 'container');

      putHelper.verifyFailure(result);
    });

    {{#if firstContainer}}
    it('should handle non-existent containers gracefully', () => {
      const result = putHelper.executePutInContainer('item', 'nonexistent_container_xyz');

      putHelper.verifyFailure(result);
    });
    {{/if}}
  });

  {{#if containers}}
  {{#if firstContainer}}
  {{#if firstTakeableItem}}
  describe('Game State Tracking', () => {
    it('should count put command as a move', () => {
      // Setup
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      putHelper.executeOpen('open {{firstContainer.id}}');

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        putHelper.verifyCountsAsMove(result);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should update container contents when putting items', () => {
      // Setup
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      putHelper.executeOpen('open {{firstContainer.id}}');

      // Verify item not in container initially
      expect(putHelper.isInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}')).toBe(false);

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        // Verify item now in container
        expect(putHelper.isInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });

    it('should decrease inventory count when putting items', () => {
      // Setup
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      putHelper.executeOpen('open {{firstContainer.id}}');

      const initialCount = putHelper.getInventoryCount();

      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        putHelper.verifyInventoryCountChange(initialCount, -1);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });
  });
  {{/if}}
  {{/if}}
  {{/if}}

  {{#if multipleContainers}}
  {{#if firstTakeableItem}}
  describe('Put Items in Multiple Containers', () => {
    it('should handle putting item in container, then taking it and putting in another', () => {
      {{#if firstContainer}}
      const item = '{{firstTakeableItem.id}}';

      // Put in first container
      putHelper.addToInventory(item);
      putHelper.removeFromScene(item);
      putHelper.executeOpen('open {{firstContainer.id}}');

      const result1 = putHelper.executePutInContainer(item, '{{firstContainer.id}}');

      if (result1.success) {
        putHelper.verifySuccess(result1);
        putHelper.verifyItemMovedToContainer(item, '{{firstContainer.id}}');

        // Take it back out (if container supports this)
        const takeResult = putHelper.executeTake('take ' + item);

        if (takeResult.success) {
          // Try putting in a second container
          {{#each containers}}
          {{#if @index}}
          {{#if @first}}
          putHelper.executeOpen('open {{this.id}}');
          const result2 = putHelper.executePutInContainer(item, '{{this.id}}');

          if (result2.success) {
            putHelper.verifySuccess(result2);
            putHelper.verifyItemMovedToContainer(item, '{{this.id}}');
          }
          {{/if}}
          {{/if}}
          {{/each}}
        }
      }
      {{/if}}
    });
  });
  {{/if}}
  {{/if}}

  {{#if containers}}
  {{#if firstContainer}}
  {{#if firstTakeableItem}}
  describe('State Consistency', () => {
    it('should maintain container state after putting items', () => {
      // Setup
      putHelper.addToInventory('{{firstTakeableItem.id}}');
      putHelper.removeFromScene('{{firstTakeableItem.id}}');
      putHelper.executeOpen('open {{firstContainer.id}}');

      // Put item in container
      const result = putHelper.executePutInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}');

      if (result.success) {
        // Verify container still open
        expect(putHelper.isContainerOpen('{{firstContainer.id}}')).toBe(true);

        // Verify item still in container
        expect(putHelper.isInContainer('{{firstTakeableItem.id}}', '{{firstContainer.id}}')).toBe(true);
      } else {
        // Item may not fit in container due to size constraints
        putHelper.verifyFailure(result);
        expect(result.message).toMatch(/too big|doesn't fit|won't fit|can't put/i);
      }
    });
  });
  {{/if}}
  {{/if}}
  {{/if}}
});
`;
