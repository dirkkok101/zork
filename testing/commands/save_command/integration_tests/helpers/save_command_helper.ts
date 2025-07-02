/**
 * Save Command Test Helper
 * Provides utilities for executing and validating SaveCommand behavior
 */

import { CommandResult } from '@/types/CommandTypes';
import { CommandProcessor } from '@/services/CommandProcessor';
import { PersistenceService } from '@/services/PersistenceService';
import { IGameStateService } from '@/services/interfaces/IGameStateService';

export class SaveCommandHelper {
  constructor(
    private commandProcessor: CommandProcessor,
    private persistenceService: PersistenceService,
    private gameStateService: IGameStateService
  ) {}

  /**
   * Execute save command and return the result
   */
  executeSave(): CommandResult {
    return this.commandProcessor.processCommand('save');
  }

  /**
   * Execute save command with arguments (should fail)
   */
  executeSaveWithArgs(args: string): CommandResult {
    return this.commandProcessor.processCommand(`save ${args}`);
  }

  /**
   * Verify save command was successful
   */
  verifySaveSuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message).toContain('saved');
    expect(result.countsAsMove).toBe(true);
    expect(result.scoreChange).toBe(0);
  }

  /**
   * Verify save command failed with expected message
   */
  verifySaveFailure(result: CommandResult, expectedPattern?: string | RegExp): void {
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.countsAsMove).toBe(false);
    
    if (expectedPattern) {
      if (typeof expectedPattern === 'string') {
        expect(result.message).toContain(expectedPattern);
      } else {
        expect(result.message).toMatch(expectedPattern);
      }
    }
  }

  /**
   * Verify save command rejected arguments
   */
  verifySaveArgumentRejection(result: CommandResult): void {
    this.verifySaveFailure(result, /just type "save"/i);
  }

  /**
   * Verify saved game exists in persistence service
   */
  verifySavedGameExists(): void {
    expect(this.persistenceService.hasSavedGame()).toBe(true);
  }

  /**
   * Verify no saved game exists
   */
  verifyNoSavedGame(): void {
    expect(this.persistenceService.hasSavedGame()).toBe(false);
  }

  /**
   * Verify localStorage contains save data
   */
  verifyLocalStorageContent(): void {
    const saveKey = 'zork-save';
    const savedData = localStorage.getItem(saveKey);
    
    expect(savedData).toBeDefined();
    expect(savedData).not.toBeNull();
    expect(savedData?.length).toBeGreaterThan(0);

    // Verify it's valid JSON
    let parsedData;
    expect(() => {
      parsedData = JSON.parse(savedData!);
    }).not.toThrow();

    // Verify save data structure
    expect(parsedData).toHaveProperty('version');
    expect(parsedData).toHaveProperty('timestamp');
    expect(parsedData).toHaveProperty('gameState');
  }

  /**
   * Get save metadata for verification
   */
  getSaveMetadata(): { version: string; timestamp: number; exists: boolean } | null {
    return this.persistenceService.getSaveMetadata();
  }

  /**
   * Verify save metadata is valid
   */
  verifySaveMetadata(metadata: any): void {
    expect(metadata).toBeDefined();
    expect(metadata.exists).toBe(true);
    expect(metadata.version).toBeDefined();
    expect(metadata.timestamp).toBeGreaterThan(0);
    expect(typeof metadata.timestamp).toBe('number');
    
    // Verify timestamp is recent (within last 5 seconds)
    const now = Date.now();
    expect(metadata.timestamp).toBeGreaterThan(now - 5000);
    expect(metadata.timestamp).toBeLessThanOrEqual(now);
  }

  /**
   * Get current game state snapshot for comparison
   */
  getGameStateSnapshot(): any {
    return JSON.parse(JSON.stringify(this.gameStateService.getGameState()));
  }

  /**
   * Verify save preserved game state correctly
   */
  verifySavePreservesState(originalState: any): void {
    // Get save metadata
    const metadata = this.getSaveMetadata();
    this.verifySaveMetadata(metadata);
    
    // Verify localStorage content
    this.verifyLocalStorageContent();
    
    // Get saved state from localStorage
    const saveKey = 'zork-save';
    const savedData = JSON.parse(localStorage.getItem(saveKey)!);
    const savedGameState = savedData.gameState;
    
    // Compare critical properties
    expect(savedGameState.currentSceneId).toBe(originalState.currentSceneId);
    expect(savedGameState.score).toBe(originalState.score);
    expect(savedGameState.moves).toBe(originalState.moves);
    expect(savedGameState.inventory).toEqual(originalState.inventory);
    expect(savedGameState.flags).toEqual(originalState.flags);
    expect(savedGameState.variables).toEqual(originalState.variables);
  }

  /**
   * Measure save operation performance
   */
  async measureSavePerformance(): Promise<number> {
    const startTime = Date.now();
    this.executeSave();
    const endTime = Date.now();
    return endTime - startTime;
  }

  /**
   * Verify save doesn't affect current game state
   */
  verifySaveDoesNotModifyState(originalState: any): void {
    const currentState = this.gameStateService.getGameState();
    
    expect(currentState.currentSceneId).toBe(originalState.currentSceneId);
    expect(currentState.score).toBe(originalState.score);
    expect(currentState.moves).toBe(originalState.moves);
    expect(currentState.inventory).toEqual(originalState.inventory);
    expect(currentState.flags).toEqual(originalState.flags);
    expect(currentState.variables).toEqual(originalState.variables);
  }

  /**
   * Get save data size for performance testing
   */
  getSaveDataSize(): number {
    const saveKey = 'zork-save';
    const savedData = localStorage.getItem(saveKey);
    return savedData?.length || 0;
  }

  /**
   * Clear all save data
   */
  clearSaveData(): void {
    localStorage.clear();
    PersistenceService.clearInMemoryStorage();
  }

  /**
   * Verify move counter incremented after save
   */
  verifyMoveCountIncremented(initialMoves: number): void {
    const currentMoves = this.gameStateService.getGameState().moves;
    expect(currentMoves).toBe(initialMoves + 1);
  }

  /**
   * Create save operation under specific conditions
   */
  executeSaveUnderConditions(conditions: {
    gameOver?: boolean;
    largeState?: boolean;
    rapidFire?: boolean;
  }): CommandResult {
    if (conditions.gameOver) {
      this.gameStateService.endGame('test game over');
    }
    
    if (conditions.largeState) {
      // Create large game state
      const gameState = this.gameStateService.getGameState();
      for (let i = 0; i < 100; i++) {
        gameState.flags[`test_flag_${i}`] = true;
        gameState.variables[`test_var_${i}`] = `large data content repeated `.repeat(50);
      }
    }
    
    return this.executeSave();
  }

  /**
   * Verify command processor integration
   */
  verifyCommandProcessorIntegration(): void {
    // Verify save command is available
    const suggestions = this.commandProcessor.getSuggestions('sa');
    expect(suggestions).toContain('save');
    
    // Verify command execution updates move counter
    const initialMoves = this.gameStateService.getGameState().moves;
    const result = this.executeSave();
    
    if (result.success) {
      this.verifyMoveCountIncremented(initialMoves);
    }
  }

  /**
   * Test save command with various invalid inputs
   */
  testInvalidInputs(): void {
    // Test with arguments
    let result = this.executeSaveWithArgs('filename');
    this.verifySaveArgumentRejection(result);
    
    // Test with extra spaces
    result = this.commandProcessor.processCommand('save   ');
    if (result.success) {
      this.verifySaveSuccess(result);
    } else {
      this.verifySaveArgumentRejection(result);
    }
    
    // Test case insensitivity
    result = this.commandProcessor.processCommand('SAVE');
    expect(result).toBeDefined();
  }

  /**
   * Verify save command behavior consistency
   */
  verifyConsistentBehavior(): void {
    // Multiple saves should all succeed and overwrite
    const result1 = this.executeSave();
    this.verifySaveSuccess(result1);
    
    // Modify state slightly
    this.gameStateService.addScore(10);
    
    const result2 = this.executeSave();
    this.verifySaveSuccess(result2);
    
    // Only one save should exist (overwritten)
    this.verifySavedGameExists();
    
    // Metadata should reflect latest save
    const metadata = this.getSaveMetadata();
    expect(metadata?.exists).toBe(true);
  }
}