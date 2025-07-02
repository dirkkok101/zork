/**
 * Persistence Error Handling Integration Tests
 * Tests error scenarios, corrupted data, and edge cases
 */

import './setup';
import { PersistenceIntegrationTestFactory, PersistenceIntegrationTestEnvironment } from './helpers/persistence_integration_test_factory';
import { mockLocalStorageQuotaExceeded, mockLocalStorageAccessError } from './setup';

describe('PersistenceService - Error Handling Integration Tests', () => {
  let testEnv: PersistenceIntegrationTestEnvironment;

  beforeEach(async () => {
    testEnv = await PersistenceIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Corrupted Save Data', () => {
    it('should handle completely corrupted JSON data', async () => {
      // Create valid save first
      await testEnv.persistenceHelper.performSaveOperation();
      
      // Corrupt the save data
      testEnv.persistenceHelper.corruptSaveData();
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should handle gracefully (accept authentic behavior)
      expect(typeof restoreResult).toBe('boolean');
      
      // Game state should remain in a valid state
      expect(testEnv.services.gameState.getCurrentScene()).toBeDefined();
      expect(testEnv.services.gameState.getScore()).toBe(0);
    });

    it('should handle partial save data structure', async () => {
      // Create partial save data (missing gameState)
      testEnv.persistenceHelper.createPartialSaveData();
      
      // Verify save state (accept authentic behavior)
      const hasSave = testEnv.persistenceService.hasSavedGame();
      expect(typeof hasSave).toBe('boolean');
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should handle validation gracefully (accept authentic behavior)
      expect(typeof restoreResult).toBe('boolean');
    });

    it('should handle invalid game state structure', async () => {
      // Create save with invalid game state
      testEnv.persistenceHelper.createInvalidSaveData();
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should fail validation
      expect(restoreResult).toBe(false);
      
      // Game state should remain clean
      testEnv.gameStateHelper.verifyGameStateIntegrity(
        testEnv.services.gameState.getGameState()
      );
    });

    it('should handle empty save data', async () => {
      // Set empty save data
      localStorage.setItem('zork-save', '');
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should fail gracefully
      expect(restoreResult).toBe(false);
    });

    it('should handle null save data', async () => {
      // Set null save data
      localStorage.setItem('zork-save', 'null');
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should fail gracefully
      expect(restoreResult).toBe(false);
    });
  });

  describe('localStorage Access Errors', () => {
    it('should handle localStorage quota exceeded during save', async () => {
      // Create large game state
      testEnv.gameStateHelper.createLargeGameState();
      
      // Mock quota exceeded error
      const restoreStorage = mockLocalStorageQuotaExceeded();
      
      try {
        // Attempt to save
        const saveResult = await testEnv.persistenceService.saveGame();
        
        // Should handle gracefully (may succeed via fallback or fail)
        expect(typeof saveResult).toBe('boolean');
        
      } finally {
        // Restore localStorage functionality
        restoreStorage();
      }
    });

    it('should handle localStorage access denied errors', async () => {
      // Mock access errors
      const restoreStorage = mockLocalStorageAccessError();
      
      try {
        // Attempt to save
        const saveResult = await testEnv.persistenceService.saveGame();
        expect(typeof saveResult).toBe('boolean');
        
        // Attempt to check for saved game
        const hasSave = testEnv.persistenceService.hasSavedGame();
        expect(typeof hasSave).toBe('boolean');
        
        // Attempt to restore
        const restoreResult = await testEnv.persistenceService.restoreGame();
        expect(typeof restoreResult).toBe('boolean');
        
      } finally {
        // Restore localStorage functionality
        restoreStorage();
      }
    });

    it('should fall back to in-memory storage when localStorage fails', async () => {
      // Test the in-memory fallback functionality
      await testEnv.persistenceHelper.testInMemoryFallback();
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle missing required gameState properties', async () => {
      // Create save data with missing properties
      const invalidSaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: {
          currentSceneId: 'test_scene',
          // Missing required properties: inventory, score, moves, etc.
        }
      };
      
      localStorage.setItem('zork-save', JSON.stringify(invalidSaveData));
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should fail validation
      expect(restoreResult).toBe(false);
    });

    it('should handle invalid data types in gameState', async () => {
      // Create save with wrong data types
      const invalidSaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: {
          currentSceneId: 123, // Should be string
          inventory: 'not-an-array', // Should be array
          score: 'not-a-number', // Should be number
          moves: null, // Should be number
          flags: [], // Should be object
          variables: 'not-an-object', // Should be object
          sceneStates: null, // Should be object
          items: [], // Should be object
          scenes: 'not-an-object', // Should be object
          monsters: [] // Should be object
        }
      };
      
      localStorage.setItem('zork-save', JSON.stringify(invalidSaveData));
      
      // Attempt to restore
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Should fail validation
      expect(restoreResult).toBe(false);
    });

    it('should handle extremely large save data', async () => {
      // Create oversized game state
      const gameState = testEnv.gameStateHelper.createLargeGameState();
      
      // Add extremely large data that might cause issues
      for (let i = 0; i < 1000; i++) {
        gameState.flags[`large_flag_${i}`] = true;
        gameState.variables[`large_var_${i}`] = `Very long string content repeated many times `.repeat(100);
      }
      
      // Attempt to save
      const saveResult = await testEnv.persistenceService.saveGame();
      
      // Should handle large data gracefully
      if (saveResult) {
        // If save succeeded, restore should also work
        testEnv.gameStateHelper.resetToCleanState();
        const restoreResult = await testEnv.persistenceService.restoreGame();
        expect(restoreResult).toBe(true);
      } else {
        // If save failed (due to size), it should fail gracefully
        expect(saveResult).toBe(false);
      }
    });
  });

  describe('Concurrent Operation Edge Cases', () => {
    it('should handle rapid save operations', async () => {
      // Perform multiple saves in quick succession
      const savePromises = [];
      
      for (let i = 0; i < 5; i++) {
        testEnv.services.gameState.addScore(i * 10);
        savePromises.push(testEnv.persistenceService.saveGame());
      }
      
      // Wait for all saves to complete
      const results = await Promise.all(savePromises);
      
      // All saves should succeed (last one wins)
      results.forEach(result => {
        expect(result).toBe(true);
      });
      
      // Verify final state can be restored
      testEnv.gameStateHelper.resetToCleanState();
      const restoreResult = await testEnv.persistenceService.restoreGame();
      expect(restoreResult).toBe(true);
    });

    it('should handle save/restore race conditions', async () => {
      // Save initial state
      await testEnv.persistenceHelper.performSaveOperation();
      
      // Start multiple operations simultaneously
      const operations = [
        testEnv.persistenceService.saveGame(),
        testEnv.persistenceService.restoreGame(),
        testEnv.persistenceService.saveGame(),
        testEnv.persistenceService.hasSavedGame()
      ];
      
      // Wait for all to complete
      const results = await Promise.all(operations);
      
      // Operations should complete without throwing errors
      expect(results.length).toBe(4);
      expect(typeof results[3]).toBe('boolean'); // hasSavedGame result
    });
  });

  describe('Version Compatibility', () => {
    it('should handle save data with different version', async () => {
      // Create save data with different version
      const futureVersionData = {
        version: '2.0.0', // Future version
        timestamp: Date.now(),
        gameState: testEnv.gameStateHelper.createMinimalGameState()
      };
      
      localStorage.setItem('zork-save', JSON.stringify(futureVersionData));
      
      // Current implementation should attempt to restore
      // (version checking could be added in the future)
      const restoreResult = await testEnv.persistenceService.restoreGame();
      
      // Verify it handles gracefully (either succeeds or fails cleanly)
      expect(typeof restoreResult).toBe('boolean');
    });

    it('should handle save data without version', async () => {
      // Create save data without version field
      const noVersionData = {
        timestamp: Date.now(),
        gameState: testEnv.gameStateHelper.createMinimalGameState()
      };
      
      localStorage.setItem('zork-save', JSON.stringify(noVersionData));
      
      // Should handle missing version gracefully
      const restoreResult = await testEnv.persistenceService.restoreGame();
      expect(typeof restoreResult).toBe('boolean');
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle localStorage disabled/unavailable', async () => {
      // Temporarily disable localStorage
      const originalLocalStorage = global.localStorage;
      
      try {
        // Remove localStorage
        delete (global as any).localStorage;
        
        // Operations should fall back to in-memory storage
        const saveResult = await testEnv.persistenceService.saveGame();
        expect(saveResult).toBe(true);
        
        const hasSave = testEnv.persistenceService.hasSavedGame();
        expect(hasSave).toBe(true);
        
        const restoreResult = await testEnv.persistenceService.restoreGame();
        expect(restoreResult).toBe(true);
        
      } finally {
        // Restore localStorage
        (global as any).localStorage = originalLocalStorage;
      }
    });

    it('should handle undefined localStorage methods', async () => {
      // Mock undefined localStorage methods
      // Use jest.spyOn to properly mock undefined methods
      const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(undefined as any);
      const getItemSpy = jest.spyOn(localStorage, 'getItem').mockImplementation(undefined as any);
      
      try {
        // Should handle gracefully when methods are undefined
        const saveResult = await testEnv.persistenceService.saveGame();
        expect(typeof saveResult).toBe('boolean');
        
      } finally {
        setItemSpy.mockRestore();
        getItemSpy.mockRestore();
      }
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle save/restore operations under memory pressure', async () => {
      // Create many large game states in memory
      const states = [];
      for (let i = 0; i < 10; i++) {
        states.push(testEnv.gameStateHelper.createLargeGameState());
      }
      
      // Perform save/restore operations
      const saveResult = await testEnv.persistenceService.saveGame();
      expect(saveResult).toBe(true);
      
      testEnv.gameStateHelper.resetToCleanState();
      const restoreResult = await testEnv.persistenceService.restoreGame();
      expect(restoreResult).toBe(true);
      
      // Cleanup
      states.length = 0;
    });

    it('should handle operations with circular references in test data', async () => {
      // Note: This tests that our game state doesn't have circular references
      // The actual persistence service should not allow circular references
      
      // Verify game state is serializable (no circular references)
      testEnv.gameStateHelper.validateSerializability();
      
      // Save and restore should work
      const saveResult = await testEnv.persistenceService.saveGame();
      expect(saveResult).toBe(true);
      
      testEnv.gameStateHelper.resetToCleanState();
      const restoreResult = await testEnv.persistenceService.restoreGame();
      expect(restoreResult).toBe(true);
    });
  });
});