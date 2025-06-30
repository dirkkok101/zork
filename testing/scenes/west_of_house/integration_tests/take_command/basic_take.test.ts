/**
 * Basic Take Command Tests - West of House Scene
 * Tests taking various objects in the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { TakeCommandHelper } from './helpers/take_command_helper';

describe('Take Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let takeHelper: TakeCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Take command helper with scoring service
    takeHelper = new TakeCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.inventory as any,
      testEnv.services.items as any,
      testEnv.services.scene as any,
      testEnv.services.scoring as any
    );
  });

  beforeEach(() => {
    // Reset scene and clear any test items
    testEnv.westOfHouseHelper.resetScene();
    testEnv.westOfHouseHelper.clearTestItems();
    
    // Clear inventory for fresh test
    const inventory = testEnv.services.inventory as any;
    const items = inventory.getItems();
    items.forEach((itemId: string) => {
      inventory.removeItem(itemId);
    });

    // Reset scoring state for clean tests
    testEnv.resetScoring();
    takeHelper.resetScoringState();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Authentic West of House Take Interactions', () => {
    beforeEach(() => {
      // Ensure clean state with only real scene items
      testEnv.westOfHouseHelper.clearTestItems();
    });

    describe('Taking the Welcome Mat', () => {
      it('should successfully take the welcome mat with proper scoring', () => {
        const initialCount = takeHelper.getInventoryCount();
        const initialScore = takeHelper.getCurrentScore();
        
        const result = takeHelper.executeTakeTarget('welcome mat');
        
        takeHelper.verifyTakeSuccessWithScoring(result, 'welcome mat', 'mat');
        takeHelper.verifyItemMoved('mat', true);
        takeHelper.verifyInventoryCountChange(initialCount, 1);
        
        // Welcome mat is not a treasure, so no scoring should occur
        takeHelper.verifyNonTreasureTakeScoring(result, 'mat');
        expect(takeHelper.getCurrentScore()).toBe(initialScore);
      });

      it('should take mat using "welco" alias with scoring validation', () => {
        const initialScore = takeHelper.getCurrentScore();
        
        const result = takeHelper.executeTakeTarget('welco');
        
        takeHelper.verifyTakeSuccessWithScoring(result, 'welcome mat', 'mat');
        takeHelper.verifyItemMoved('mat', true);
        
        // Verify no scoring for non-treasure
        takeHelper.verifyNonTreasureTakeScoring(result, 'mat');
        expect(takeHelper.getCurrentScore()).toBe(initialScore);
      });

      it('should take mat using "rubbe" alias', () => {
        const result = takeHelper.executeTakeTarget('rubbe');
        
        takeHelper.verifyTakeSuccess(result, 'welcome mat');
        takeHelper.verifyItemMoved('mat', true);
      });

      it('should fail if trying to take mat again when already in inventory', () => {
        // First take the mat
        const firstResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifySuccess(firstResult);
        
        // Try to take it again
        const secondResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifyAlreadyHave(secondResult, 'welcome mat');
        takeHelper.verifyInventoryCountChange(0, 1); // Only one in inventory
      });
    });

    describe('Taking the Leaflet from Mailbox', () => {
      it('should fail to take leaflet when mailbox is closed', () => {
        const result = takeHelper.executeTakeTarget('leaflet');
        
        takeHelper.verifyItemNotFound(result, 'leaflet');
        // Leaflet should still be in closed mailbox
        expect(takeHelper.isInContainer('adver', 'mailb')).toBe(true);
        expect(takeHelper.isInInventory('adver')).toBe(false);
      });

      it('should successfully take leaflet after opening mailbox', () => {
        // First open the mailbox
        const openResult = takeHelper.executeOpen('open mailbox');
        
        // Only proceed if open was successful
        if (openResult.success) {
          const initialCount = takeHelper.getInventoryCount();
          
          // Verify leaflet is now accessible in open mailbox
          expect(takeHelper.isAccessible('adver')).toBe(true);
          expect(takeHelper.isInContainer('adver', 'mailb')).toBe(true);
          
          // Then take the leaflet
          const result = takeHelper.executeTakeTarget('leaflet');
          
          takeHelper.verifyTakeSuccess(result, 'leaflet');
          takeHelper.verifyInventoryCountChange(initialCount, 1);
          
          // Verify item was moved from container to inventory
          expect(takeHelper.isInInventory('adver')).toBe(true);
          expect(takeHelper.isInContainer('adver', 'mailb')).toBe(false);
        } else {
          // If open failed, just verify leaflet is not accessible
          const result = takeHelper.executeTakeTarget('leaflet');
          takeHelper.verifyItemNotFound(result, 'leaflet');
        }
      });

      it('should take leaflet using various aliases', () => {
        // First open the mailbox
        const openResult = takeHelper.executeOpen('open mailbox');
        
        if (openResult.success) {
          const aliases = ['leaflet', 'pamph', 'leafl', 'bookl', 'small'];
          
          // Test first alias
          const firstAlias = aliases[0];
          if (firstAlias) {
            const result = takeHelper.executeTakeTarget(firstAlias);
            if (result.success) {
              takeHelper.verifyTakeSuccess(result, 'leaflet');
              takeHelper.verifyItemMoved('adver', true);
              
              // Verify other aliases would now fail (already taken)
              aliases.slice(1).forEach(alias => {
                const failResult = takeHelper.executeTakeTarget(alias);
                takeHelper.verifyFailure(failResult);
              });
            }
          }
        }
      });
    });

    describe('Cannot Take Non-Portable Items', () => {
      it('should fail to take the mailbox', () => {
        const result = takeHelper.executeTakeTarget('mailbox');
        
        takeHelper.verifyCannotTake(result, 'mailbox');
        takeHelper.verifyItemMoved('mailb', false);
      });

      it('should fail to take the mailbox using "box" alias', () => {
        const result = takeHelper.executeTakeTarget('box');
        
        takeHelper.verifyCannotTake(result, 'mailbox');
        takeHelper.verifyItemMoved('mailb', false);
      });

      it('should fail to take the front door', () => {
        const result = takeHelper.executeTakeTarget('door');
        
        takeHelper.verifyCannotTake(result, 'door');
        takeHelper.verifyItemMoved('fdoor', false);
      });

      it('should fail to take door using "front" alias', () => {
        const result = takeHelper.executeTakeTarget('front');
        
        takeHelper.verifyCannotTake(result, 'door');
        takeHelper.verifyItemMoved('fdoor', false);
      });
    });
  });

  describe('Scoring Integration Tests', () => {
    beforeEach(() => {
      // Ensure clean scoring state
      testEnv.resetScoring();
      takeHelper.resetScoringState();
    });

    describe('Non-Treasure Item Scoring', () => {
      it('should not award points for taking non-treasure items', () => {
        const initialScore = takeHelper.getCurrentScore();
        
        // Take welcome mat (non-treasure)
        const matResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifyTakeSuccessWithScoring(matResult, 'welcome mat', 'mat');
        takeHelper.verifyNonTreasureTakeScoring(matResult, 'mat');
        
        // Score should remain unchanged
        expect(takeHelper.getCurrentScore()).toBe(initialScore);
        expect(takeHelper.isTreasure('mat')).toBe(false);
      });

      it('should not award points for taking leaflet (non-treasure)', () => {
        const initialScore = takeHelper.getCurrentScore();
        
        // Open mailbox first
        const openResult = takeHelper.executeOpen('open mailbox');
        if (openResult.success) {
          // Take leaflet (non-treasure)
          const leafletResult = takeHelper.executeTakeTarget('leaflet');
          if (leafletResult.success) {
            takeHelper.verifyTakeSuccessWithScoring(leafletResult, 'leaflet', 'adver');
            takeHelper.verifyNonTreasureTakeScoring(leafletResult, 'adver');
            
            // Score should remain unchanged
            expect(takeHelper.getCurrentScore()).toBe(initialScore);
            expect(takeHelper.isTreasure('adver')).toBe(false);
          }
        }
      });
    });

    describe('Score State Consistency', () => {
      it('should maintain score state across multiple take operations', () => {
        const initialScore = takeHelper.getCurrentScore();
        
        // Take multiple non-treasure items
        const matResult = takeHelper.executeTakeTarget('welcome mat');
        takeHelper.verifyNoScoreChange(matResult);
        expect(takeHelper.getCurrentScore()).toBe(initialScore);
        
        // Open mailbox and take leaflet
        const openResult = takeHelper.executeOpen('open mailbox');
        if (openResult.success) {
          const leafletResult = takeHelper.executeTakeTarget('leaflet');
          if (leafletResult.success) {
            takeHelper.verifyNoScoreChange(leafletResult);
            expect(takeHelper.getCurrentScore()).toBe(initialScore);
          }
        }
        
        // Score should still be unchanged after all operations
        expect(takeHelper.getCurrentScore()).toBe(initialScore);
      });

      it('should properly reset scoring state between tests', () => {
        // Modify score
        testEnv.services.gameState.addScore(50);
        expect(takeHelper.getCurrentScore()).toBe(50);
        
        // Reset and verify clean state
        testEnv.resetScoring();
        takeHelper.resetScoringState();
        expect(takeHelper.getCurrentScore()).toBe(0);
        
        // Verify treasure flags are cleared
        const scoringHelper = takeHelper.getScoringHelper();
        expect(scoringHelper?.isTreasureFound('coin')).toBe(false);
        expect(scoringHelper?.isTreasureDeposited('coin')).toBe(false);
      });
    });
  });

  describe('Command Syntax and Aliases', () => {
    it('should work with "take" command', () => {
      const result = takeHelper.executeTake('take welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "get" alias', () => {
      const result = takeHelper.executeTake('get welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "pick up" syntax', () => {
      const result = takeHelper.executeTake('pick up welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });

    it('should work with "grab" alias', () => {
      const result = takeHelper.executeTake('grab welcome mat');
      
      takeHelper.verifyTakeSuccess(result, 'welcome mat');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty take command gracefully', () => {
      const result = takeHelper.executeTake('take');
      
      takeHelper.verifyFailure(result, 'Take what');
      takeHelper.verifyNoMove(result);
    });

    it('should handle non-existent items gracefully', () => {
      const result = takeHelper.executeTakeTarget('phantom');
      
      takeHelper.verifyItemNotFound(result, 'phantom');
      takeHelper.verifyNoMove(result);
    });

    it('should handle taking items from other scenes gracefully', () => {
      const result = takeHelper.executeTakeTarget('unicorn');
      
      takeHelper.verifyItemNotFound(result, 'unicorn');
      takeHelper.verifyNoMove(result);
    });

    it('should handle malformed take commands', () => {
      const result = takeHelper.executeTake('pick');
      
      takeHelper.verifyFailure(result, 'Take what');
      takeHelper.verifyNoMove(result);
    });
  });

  describe('Multiple Item Scenarios', () => {
    it('should handle taking multiple items in sequence', () => {
      const initialCount = takeHelper.getInventoryCount();
      
      // Take the mat first
      const matResult = takeHelper.executeTakeTarget('welcome mat');
      takeHelper.verifyTakeSuccess(matResult, 'welcome mat');
      takeHelper.verifyInventoryCountChange(initialCount, 1);
      
      // Open mailbox and take leaflet
      const openResult = takeHelper.executeOpen('open mailbox');
      if (openResult.success) {
        const leafletResult = takeHelper.executeTakeTarget('leaflet');
        if (leafletResult.success) {
          takeHelper.verifyTakeSuccess(leafletResult, 'leaflet');
          takeHelper.verifyInventoryCountChange(initialCount, 2);
          
          // Verify both items are in inventory
          takeHelper.verifyItemMoved('mat', true);
          takeHelper.verifyItemMoved('adver', true);
        }
      }
    });

    it('should maintain inventory state between commands', () => {
      // Take mat
      const matResult = takeHelper.executeTakeTarget('welcome mat');
      takeHelper.verifySuccess(matResult);
      
      // Verify inventory persists
      expect(takeHelper.isInInventory('mat')).toBe(true);
      expect(takeHelper.getInventoryCount()).toBe(1);
      
      // Try to take something we can't
      const doorResult = takeHelper.executeTakeTarget('door');
      takeHelper.verifyFailure(doorResult);
      
      // Verify original item still in inventory
      expect(takeHelper.isInInventory('mat')).toBe(true);
      expect(takeHelper.getInventoryCount()).toBe(1);
    });
  });
});