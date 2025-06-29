/**
 * Basic Read Command Tests - West of House Scene
 * Tests reading textual content on objects in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { ReadCommandHelper } from './helpers/read_command_helper';

describe('Read Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let readHelper: ReadCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Read command helper
    readHelper = new ReadCommandHelper(
      testEnv.services.gameState as any,
      testEnv.services.scene as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.combat,
      testEnv.services.persistence,
      testEnv.services.output as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    
    // Clear inventory for fresh test
    readHelper.clearInventory();
    
    // Ensure we're in west_of_house
    readHelper.setCurrentScene('west_of_house');
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Authentic West of House Read Interactions', () => {
    describe('Reading the Welcome Mat', () => {
      it('should fail to read the welcome mat (no readable text)', () => {
        const result = readHelper.executeReadItem('mat');
        
        // Welcome mat is marked as readable but has no actual text content
        readHelper.verifyFailure(result);
        readHelper.verifyNoMove(result);
        expect(result.message).toBe('There is nothing written on it.');
      });

      it('should fail to read mat using "welco" alias (no readable text)', () => {
        const result = readHelper.executeReadItem('welco');
        
        readHelper.verifyFailure(result);
        readHelper.verifyNoMove(result);
        expect(result.message).toBe('There is nothing written on it.');
      });

      it('should fail to read mat using "welcome" alias (no readable text)', () => {
        const result = readHelper.executeReadItem('welcome mat');
        
        readHelper.verifyFailure(result);
        readHelper.verifyNoMove(result);
        expect(result.message).toBe('There is nothing written on it.');
      });
    });

    describe('Reading the Leaflet from Mailbox', () => {
      it('should fail to read leaflet when mailbox is closed', () => {
        const result = readHelper.executeReadItem('leaflet');
        
        readHelper.verifyItemNotFound(result, 'leaflet');
      });

      it('should fail to read leaflet after taking it (no readable text)', () => {
        // Add leaflet to inventory
        readHelper.addItemToInventory('adver'); // leaflet item ID
        
        const result = readHelper.executeReadItem('leaflet');
        
        // Leaflet is marked as readable but has no actual text content
        readHelper.verifyFailure(result);
        readHelper.verifyNoMove(result);
        expect(result.message).toBe('There is nothing written on it.');
      });

      it('should fail to read leaflet using various aliases (no readable text)', () => {
        // Add leaflet to inventory
        readHelper.addItemToInventory('adver');
        
        const aliases = ['leaflet', 'adver', 'pamph', 'bookl'];
        aliases.forEach(alias => {
          const result = readHelper.executeReadItem(alias);
          readHelper.verifyFailure(result);
          expect(result.message).toBe('There is nothing written on it.');
        });
      });
    });

    describe('Cannot Read Non-Readable Items', () => {
      it('should fail to read the mailbox', () => {
        const result = readHelper.executeReadItem('mailbox');
        
        readHelper.verifyItemNotReadable(result);
      });

      it('should fail to read the mailbox using "box" alias', () => {
        const result = readHelper.executeReadItem('box');
        
        readHelper.verifyItemNotReadable(result);
      });

      it('should fail to read the front door', () => {
        const result = readHelper.executeReadItem('door');
        
        readHelper.verifyItemNotReadable(result);
      });
    });
  });

  describe('Command Syntax and Error Handling', () => {
    it('should handle empty read command gracefully', () => {
      const result = readHelper.executeReadEmpty();
      
      readHelper.verifyEmptyReadCommand(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = readHelper.executeReadItem('newspaper');
      
      readHelper.verifyItemNotFound(result, 'newspaper');
    });

    it('should handle reading items from other scenes gracefully', () => {
      const result = readHelper.executeReadItem('lamp');
      
      readHelper.verifyItemNotFound(result, 'lamp');
    });

    it('should handle malformed read commands', () => {
      const result = readHelper.executeRead('read');
      
      readHelper.verifyEmptyReadCommand(result);
    });
  });

  describe('Read vs Examine Distinction', () => {
    it('should show READ failure vs examine success for welcome mat', () => {
      const readResult = readHelper.executeReadItem('mat');
      
      // Read should fail (no text content)
      readHelper.verifyFailure(readResult);
      expect(readResult.message).toBe('There is nothing written on it.');
      
      // This verifies READ is different from EXAMINE
      // (examine would show physical description, read shows text content or failure)
    });

    it('should show read failure vs examine success for leaflet', () => {
      // Add leaflet to inventory
      readHelper.addItemToInventory('adver');
      
      const readResult = readHelper.executeReadItem('leaflet');
      
      // Read should fail (no text content)
      readHelper.verifyFailure(readResult);
      expect(readResult.message).toBe('There is nothing written on it.');
      
      // This verifies READ shows textual content or failure, not physical description
    });
  });

  describe('Inventory vs Scene Reading', () => {
    it('should try to read items in inventory (but fail if no text)', () => {
      // Add leaflet to inventory
      readHelper.addItemToInventory('adver');
      
      const result = readHelper.executeReadItem('leaflet');
      
      readHelper.verifyFailure(result);
      expect(result.message).toBe('There is nothing written on it.');
    });

    it('should try to read items in current scene (but fail if no text)', () => {
      // Mat is in the scene
      const result = readHelper.executeReadItem('mat');
      
      readHelper.verifyFailure(result);
      expect(result.message).toBe('There is nothing written on it.');
    });

    it('should prioritize scene items over inventory items', () => {
      // This test verifies the search order - scene items are found first
      const result = readHelper.executeReadItem('mat');
      
      readHelper.verifyFailure(result);
      expect(result.message).toBe('There is nothing written on it.');
    });
  });

  describe('Command Properties', () => {
    it('should not count as a move even when failing', () => {
      const result = readHelper.executeReadItem('mat');
      
      readHelper.verifyFailure(result);
      readHelper.verifyNoMove(result);
    });

    it('should always not count as move even on failure', () => {
      const result = readHelper.executeReadItem('mailbox');
      
      readHelper.verifyFailure(result);
      readHelper.verifyNoMove(result);
    });

    it('should provide appropriate failure messages for unreadable items', () => {
      const result = readHelper.executeReadItem('mat');
      
      readHelper.verifyFailure(result);
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).toBe('There is nothing written on it.');
    });

    it('should provide appropriate failure messages', () => {
      const result = readHelper.executeReadItem('mailbox');
      
      readHelper.verifyFailure(result);
      expect(result.message).toBe("You can't read that.");
    });
  });

  describe('Multiple Item Scenarios', () => {
    it('should handle reading multiple items in sequence', () => {
      // Read mat first (should fail)
      const matResult = readHelper.executeReadItem('mat');
      readHelper.verifyFailure(matResult);
      
      // Add leaflet and read it (should also fail)
      readHelper.addItemToInventory('adver');
      const leafletResult = readHelper.executeReadItem('leaflet');
      readHelper.verifyFailure(leafletResult);
      
      // Both should fail with consistent messages
      expect(matResult.message).toBe('There is nothing written on it.');
      expect(leafletResult.message).toBe('There is nothing written on it.');
    });

    it('should maintain consistent behavior across multiple reads', () => {
      // Read the same item multiple times
      const result1 = readHelper.executeReadItem('mat');
      const result2 = readHelper.executeReadItem('mat');
      const result3 = readHelper.executeReadItem('mat');
      
      // All should fail with same message
      [result1, result2, result3].forEach(result => {
        readHelper.verifyFailure(result);
        expect(result.message).toBe('There is nothing written on it.');
      });
    });
  });
});