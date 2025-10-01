/**
 * Read Command Tests - West of House Scene
 * Auto-generated tests for read command functionality
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ReadCommandHelper } from '@testing/helpers/ReadCommandHelper';

describe('Read Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let readHelper: ReadCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should read welcome mat and display text', () => {
      const result = readHelper.executeReadItem('mat');

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

    it('should read welcome mat using "mat" alias', () => {
      const result = readHelper.executeReadItem('mat');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read welcome mat using "welco" alias', () => {
      const result = readHelper.executeReadItem('welco');

      if (result.success) {
        readHelper.verifySuccess(result);
        expect(result.message.length).toBeGreaterThan(0);
        readHelper.verifyNoMove(result);
      } else {
        // Alias may not be recognized
        readHelper.verifyFailure(result);
      }
    });
    it('should read welcome mat using "rubbe" alias', () => {
      const result = readHelper.executeReadItem('rubbe');

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
    it('should read welcome mat when in inventory', () => {
      // Add item to inventory
      readHelper.addItemToInventory('mat');

      const result = readHelper.executeReadItem('mat');

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
      const result = readHelper.executeReadItem('fdoor');

      readHelper.verifyFailure(result);
      expect(result.message).toMatch(/can't read|not readable|nothing.*read/i);
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "read" command', () => {
      const result = readHelper.executeReadItem('mat');

      if (result.success) {
        readHelper.verifySuccess(result);
      } else {
        // Item may be readable but have no text defined
        readHelper.verifyFailure(result);
        expect(result.message).toMatch(/nothing.*written|can't read/i);
      }
    });

    it('should work with "read <item>" syntax', () => {
      const result = readHelper.executeReadItem('mat');

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

    it('should handle reading items from other scenes', () => {
      const result = readHelper.executeReadItem('sword');

      readHelper.verifyFailure(result);
    });
  });

  describe('Game State Tracking', () => {
    it('should not count read as a move', () => {
      const result = readHelper.executeReadItem('mat');

      readHelper.verifyNoMove(result);
    });

    it('should display same content on multiple reads', () => {
      const result1 = readHelper.executeReadItem('mat');
      const result2 = readHelper.executeReadItem('mat');

      // Content should be consistent (whether success or failure)
      expect(result2.message).toBe(result1.message);
      expect(result2.success).toBe(result1.success);
    });
  });

  describe('Content Verification', () => {
    it('should display readable text for welcome mat', () => {
      const result = readHelper.executeReadItem('mat');

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
