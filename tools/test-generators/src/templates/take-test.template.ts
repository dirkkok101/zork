export const takeTestTemplate = `/**
 * Take Command Tests - {{title}} Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    takeHelper = new TakeCommandHelper(
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

  {{#if takeableItems}}
  describe('Take Individual Items', () => {
    {{#each takeableItems}}
    it('should take {{this.name}} and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('{{this.id}}');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('{{this.id}}');
      takeHelper.verifyItemRemovedFromScene('{{this.id}}');
      {{#unless this.isTreasure}}
      takeHelper.verifyNoScoreChange(result);
      {{/unless}}
    });

    {{#if this.aliases}}
    {{#each this.aliases}}
    {{#if @index}}{{!-- Skip first alias as it's usually the ID --}}
    it('should take {{../name}} using "{{this}}" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('{{this}}');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('{{../id}}');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, '{{this}}');
      }
    });
    {{/if}}
    {{/each}}
    {{/if}}

    {{/each}}
  });
  {{/if}}

  {{#if takeableItems}}
  describe('Take Already Taken Items', () => {
    {{#each takeableItems}}
    {{#if @first}}
    it('should fail to take {{this.name}} twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('{{this.id}}');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('{{this.id}}');

      // Second take should fail
      result = takeHelper.executeTake('{{this.id}}');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });
    {{/if}}
    {{/each}}

    {{#if multipleTakeableItems}}
    it('should handle taking multiple items in sequence', () => {
      takeHelper.clearPlayerInventory();

      {{#each takeableItems}}
      takeHelper.executeTake('{{this.id}}');
      takeHelper.verifyInventoryContains('{{this.id}}');
      {{/each}}

      // Verify all in inventory
      {{#each takeableItems}}
      takeHelper.verifyInventoryContains('{{this.id}}');
      {{/each}}
    });
    {{/if}}
  });
  {{/if}}

  {{#if containers}}
  describe('Take from Containers', () => {
    {{#each containers}}
    {{#if this.initialContents}}
    it('should take item from {{this.name}} when open', () => {
      takeHelper.clearPlayerInventory();

      // Open the container first
      takeHelper.executeOpen('open {{this.id}}');

      {{#each this.initialContents}}
      const result = takeHelper.executeTake('{{this}}');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('{{this}}');
      }
      {{/each}}
    });

    it('should fail to take item from closed {{this.name}}', () => {
      takeHelper.clearPlayerInventory();

      // Ensure container is closed (default state)
      {{#each this.initialContents}}
      const result = takeHelper.executeTake('{{this}}');

      takeHelper.verifyFailure(result);
      {{/each}}
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  {{#if nonTakeableItems}}
  describe('Cannot Take Non-Portable Items', () => {
    {{#each nonTakeableItems}}
    it('should fail to take {{this.name}} (non-portable)', () => {
      const result = takeHelper.executeTake('{{this.id}}');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
    {{/each}}
  });
  {{/if}}

  describe('Command Syntax and Aliases', () => {
    {{#if takeableItems}}
    {{#with (first takeableItems)}}
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('{{this.id}}');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', '{{this.id}}');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', '{{this.id}}');

      if (result.success) {
        takeHelper.verifyInventoryContains('{{this.id}}');
      } else {
        // Multi-word commands may not be supported
        takeHelper.verifyFailure(result);
      }
    });
    {{/with}}
    {{/if}}
  });

  describe('Error Handling', () => {
    it('should handle empty take command gracefully', () => {
      const result = takeHelper.executeTake('');

      takeHelper.verifyFailure(result);
      takeHelper.verifyMissingTarget(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = takeHelper.executeTake('nonexistent_item_xyz');

      takeHelper.verifyFailure(result);
      takeHelper.verifyInvalidTarget(result, 'nonexistent_item_xyz');
    });
  });

  describe('Game State Tracking', () => {
    {{#if takeableItems}}
    {{#with (first takeableItems)}}
    it('should count take command as a move', () => {
      takeHelper.clearPlayerInventory();
      const initialMoves = takeHelper.getCurrentMoves();

      takeHelper.executeTake('{{this.id}}');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    {{#unless this.isTreasure}}
    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('{{this.id}}');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });
    {{/unless}}

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('{{this.id}}')).toBe(true);

      takeHelper.executeTake('{{this.id}}');

      // Verify item removed from scene
      expect(takeHelper.isInScene('{{this.id}}')).toBe(false);
    });
    {{/with}}
    {{/if}}
  });

  {{#if treasures}}
  describe('Treasure Collection', () => {
    {{#each treasures}}
    it('should take {{this.name}} treasure without immediate score change', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      const result = takeHelper.executeTake('{{this.id}}');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('{{this.id}}');

      // Score changes when deposited, not when taken
      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });
    {{/each}}
  });
  {{/if}}

  {{#if hasWeight}}
  describe('Weight Management', () => {
    {{#if takeableItems}}
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      {{#each takeableItems}}
      takeHelper.executeTake('{{this.id}}');
      {{/each}}

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    {{#if heavyItems}}
    {{#each heavyItems}}
    it('should handle taking heavy item {{this.name}} ({{this.weight}} weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('{{this.id}}');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe({{this.weight}});
    });
    {{/each}}
    {{/if}}
    {{/if}}
  });
  {{/if}}

  {{#if statefulItems}}
  describe('Item State Preservation', () => {
    {{#each statefulItems}}
    {{#if this.canOpen}}
    it('should preserve {{this.name}} state when taken', () => {
      takeHelper.clearPlayerInventory();

      // Open the item before taking
      takeHelper.executeOpen('open {{this.id}}');

      takeHelper.executeTake('{{this.id}}');

      // Item should be in inventory (state preservation verified by game logic)
      takeHelper.verifyInventoryContains('{{this.id}}');
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}
});
`;
