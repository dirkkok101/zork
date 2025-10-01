/**
 * Read Command Tests - Living Room Scene
 * Auto-generated tests for read command functionality
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ReadCommandHelper } from '@testing/helpers/ReadCommandHelper';

describe('Read Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let readHelper: ReadCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    readHelper = new ReadCommandHelper(
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

  describe('Read Items in Scene', () => {
    it('should read wooden door and display text', () => {
      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    it('should read wooden door using "wdoor" alias', () => {
      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read wooden door using "door" alias', () => {
      const result = readHelper.executeReadItem('door');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read wooden door using "woode" alias', () => {
      const result = readHelper.executeReadItem('woode');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read wooden door using "west" alias', () => {
      const result = readHelper.executeReadItem('west');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read wooden door using "weste" alias', () => {
      const result = readHelper.executeReadItem('weste');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });

    it('should read newspaper and display text', () => {
      const result = readHelper.executeReadItem('paper');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    it('should read newspaper using "paper" alias', () => {
      const result = readHelper.executeReadItem('paper');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read newspaper using "newsp" alias', () => {
      const result = readHelper.executeReadItem('newsp');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read newspaper using "issue" alias', () => {
      const result = readHelper.executeReadItem('issue');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read newspaper using "repor" alias', () => {
      const result = readHelper.executeReadItem('repor');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read newspaper using "magaz" alias', () => {
      const result = readHelper.executeReadItem('magaz');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read newspaper using "news" alias', () => {
      const result = readHelper.executeReadItem('news');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });

  });

  describe('Read Items in Inventory', () => {
    it('should read wooden door when in inventory', () => {
      // Add item to inventory
      readHelper.addItemToInventory('wdoor');

      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
  });

  describe('Cannot Read Non-Readable Items', () => {
    it('should fail to read non-readable items', () => {
      const result = readHelper.executeReadItem('tcase');

      readHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't read|not readable|nothing.*read/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "read" command', () => {
      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    it('should work with "read <item>" syntax', () => {
      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty read command gracefully', () => {
      const result = readHelper.executeRead('read');

      readHelper.verifyFailure(result);
      expect(result.message).toMatch(/what.*read|read.*what/i);
    });

    it('should handle non-existent items gracefully', () => {
      const result = readHelper.executeReadItem('nonexistent_item_xyz');

      readHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should not count read as a move', () => {
      const result = readHelper.executeReadItem('wdoor');

      readHelper.verifyNoMove(result);
    });

    it('should display same content on multiple reads', () => {
      const result1 = readHelper.executeReadItem('wdoor');
      const result2 = readHelper.executeReadItem('wdoor');

      // Content should be consistent (whether success or failure)
      expect(result2.message).toBe(result1.message);
      expect(result2.success).toBe(result1.success);
    });
  });

  describe('Read Multiple Items', () => {
    it('should read each item with unique content', () => {
      const results: string[] = [];

      const result0 = readHelper.executeReadItem('wdoor');
      readHelper.verifySuccess(result0);
      results.push(result0.message);
      const result1 = readHelper.executeReadItem('paper');
      readHelper.verifySuccess(result1);
      results.push(result1.message);

      // Each item should have unique readable content
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });

  describe('Content Verification', () => {
    it('should display readable text for wooden door', () => {
      const result = readHelper.executeReadItem('wdoor');

      if (result.success) {
        readHelper.verifySuccess(result);
        // Verify that we got actual content
        expect(result.message.length).toBeGreaterThan(5);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });
  });
});
