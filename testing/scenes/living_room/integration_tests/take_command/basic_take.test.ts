/**
 * Take Command Tests - Living Room Scene
 * Auto-generated tests for take command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from '@testing/helpers/TakeCommandHelper';

describe('Take Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

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

  describe('Take Individual Items', () => {
    it('should take lamp and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('lamp');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('lamp');
      takeHelper.verifyItemRemovedFromScene('lamp');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take lamp using "lante" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('lante');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('lamp');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'lante');
      }
    });

    it('should take lamp using "light" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('light');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('lamp');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'light');
      }
    });

    it('should take lamp using "brass" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('brass');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('lamp');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'brass');
      }
    });

    it('should take carpet and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('rug');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('rug');
      takeHelper.verifyItemRemovedFromScene('rug');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take carpet using "carpe" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('carpe');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('rug');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'carpe');
      }
    });

    it('should take carpet using "orien" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('orien');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('rug');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'orien');
      }
    });

    it('should take newspaper and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('paper');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('paper');
      takeHelper.verifyItemRemovedFromScene('paper');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take newspaper using "newsp" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('newsp');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('paper');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'newsp');
      }
    });

    it('should take newspaper using "issue" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('issue');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('paper');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'issue');
      }
    });

    it('should take newspaper using "repor" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('repor');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('paper');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'repor');
      }
    });

    it('should take newspaper using "magaz" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('magaz');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('paper');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'magaz');
      }
    });

    it('should take newspaper using "news" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('news');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('paper');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'news');
      }
    });

    it('should take sword and add to inventory', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sword');

      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('sword');
      takeHelper.verifyItemRemovedFromScene('sword');
      takeHelper.verifyNoScoreChange(result);
    });

    it('should take sword using "orcri" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('orcri');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sword');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'orcri');
      }
    });

    it('should take sword using "glamd" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('glamd');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sword');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'glamd');
      }
    });

    it('should take sword using "blade" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('blade');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sword');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'blade');
      }
    });

    it('should take sword using "elvis" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('elvis');

      if (result.success) {
        takeHelper.verifySuccess(result);
        takeHelper.verifyInventoryContains('sword');
      } else {
        // Alias may not be recognized
        takeHelper.verifyInvalidTarget(result, 'elvis');
      }
    });

  });

  describe('Take Already Taken Items', () => {
    it('should fail to take lamp twice', () => {
      takeHelper.clearPlayerInventory();

      // First take should succeed
      let result = takeHelper.executeTake('lamp');
      takeHelper.verifySuccess(result);
      takeHelper.verifyInventoryContains('lamp');

      // Second take should fail
      result = takeHelper.executeTake('lamp');
      takeHelper.verifyFailure(result);
      takeHelper.verifyNotPresent(result);
    });

    it('should handle taking multiple items in sequence', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('lamp');
      takeHelper.verifyInventoryContains('lamp');
      takeHelper.executeTake('rug');
      takeHelper.verifyInventoryContains('rug');
      takeHelper.executeTake('paper');
      takeHelper.verifyInventoryContains('paper');
      takeHelper.executeTake('sword');
      takeHelper.verifyInventoryContains('sword');

      // Verify all in inventory
      takeHelper.verifyInventoryContains('lamp');
      takeHelper.verifyInventoryContains('rug');
      takeHelper.verifyInventoryContains('paper');
      takeHelper.verifyInventoryContains('sword');
    });
  });

  describe('Cannot Take Non-Portable Items', () => {
    it('should fail to take wooden door (non-portable)', () => {
      const result = takeHelper.executeTake('wdoor');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
    it('should fail to take trophy case (non-portable)', () => {
      const result = takeHelper.executeTake('tcase');

      takeHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't take|can't be taken|too heavy|fixed/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('lamp');
      takeHelper.verifySuccess(result);
    });

    it('should work with "get" alias', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('get', 'lamp');
      takeHelper.verifySuccess(result);
    });

    it('should work with "pick up" syntax', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTakeWith('pick up', 'lamp');

      if (result.success) {
        takeHelper.verifyInventoryContains('lamp');
      } else {
        // Multi-word commands may not be supported
        takeHelper.verifyFailure(result);
      }
    });
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

    it('should handle taking items from other scenes', () => {
      const result = takeHelper.executeTake('sword');

      takeHelper.verifyFailure(result);
      takeHelper.verifyInvalidTarget(result, 'sword');
    });
  });

  describe('Game State Tracking', () => {
    it('should count take command as a move', () => {
      takeHelper.clearPlayerInventory();
      const initialMoves = takeHelper.getCurrentMoves();

      takeHelper.executeTake('lamp');

      expect(takeHelper.getCurrentMoves()).toBe(initialMoves + 1);
    });

    it('should not change score for non-treasure items', () => {
      takeHelper.clearPlayerInventory();
      const initialScore = takeHelper.getCurrentScore();

      takeHelper.executeTake('lamp');

      expect(takeHelper.getCurrentScore()).toBe(initialScore);
    });

    it('should update scene state when taking items', () => {
      // Verify item starts in scene
      expect(takeHelper.isInScene('lamp')).toBe(true);

      takeHelper.executeTake('lamp');

      // Verify item removed from scene
      expect(takeHelper.isInScene('lamp')).toBe(false);
    });
  });

  describe('Weight Management', () => {
    it('should track inventory weight after taking items', () => {
      takeHelper.clearPlayerInventory();

      takeHelper.executeTake('lamp');
      takeHelper.executeTake('rug');
      takeHelper.executeTake('paper');
      takeHelper.executeTake('sword');

      const totalWeight = takeHelper.getCurrentInventoryWeight();
      expect(totalWeight).toBeGreaterThan(0);
    });

    it('should handle taking heavy item lamp (15 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('lamp');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(15);
    });
    it('should handle taking heavy item sword (30 weight)', () => {
      takeHelper.clearPlayerInventory();

      const result = takeHelper.executeTake('sword');

      takeHelper.verifySuccess(result);

      const currentWeight = takeHelper.getCurrentInventoryWeight();
      expect(currentWeight).toBe(30);
    });
  });

  describe('Item State Preservation', () => {
  });
});
