/**
 * Test helper utilities for DataLoader testing
 * Provides common testing functionality and utilities for Item and Monster data loaders
 */

import { readFile } from 'fs/promises';
import { PathLike } from 'fs';
import { ItemData, ItemIndexData } from '../../src/types/ItemData';
import { MonsterData, MonsterIndex } from '../../src/types/MonsterData';
import { Scene, LightingCondition } from '../../src/types/SceneTypes';
import { toJsonString } from './mock_factories';

// Type for mocked readFile function
type MockedReadFile = jest.MockedFunction<typeof readFile>;

/**
 * Test helper class for ItemDataLoader testing
 */
export class ItemDataLoaderTestHelper {
  private mockReadFile: MockedReadFile;

  constructor() {
    this.mockReadFile = readFile as MockedReadFile;
  }

  /**
   * Mock successful file reading with provided data
   */
  mockFileRead(filePath: string, data: any): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      // More flexible path matching - check if any part of the expected path matches
      if (pathStr.includes(filePath) || pathStr.endsWith(filePath) || filePath.includes(pathStr.split('/').pop() || '')) {
        return toJsonString(data);
      }
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock multiple file reads with different data
   */
  mockMultipleFileReads(fileDataMap: Record<string, any>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        // More flexible path matching for multiple files
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      // Debug: log the attempted path and available paths
      const availablePaths = Object.keys(fileDataMap);
      throw new Error(`No mock data found for path: ${pathStr}. Available paths: ${availablePaths.join(', ')}`);
    });
  }

  /**
   * Mock file read error
   */
  mockFileReadError(filePath: string, error: Error): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      const fileName = filePath.split('/').pop() || '';
      const requestedFileName = pathStr.split('/').pop() || '';
      
      // Throw error if this specific file is requested
      if (pathStr.includes(filePath) || 
          pathStr.endsWith(filePath) || 
          requestedFileName === fileName ||
          (fileName && pathStr.includes(fileName))) {
        throw error;
      }
      
      // For unmatched paths, throw a different error
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock index.json file read
   */
  mockIndexRead(indexData: ItemIndexData): void {
    this.mockFileRead('index.json', indexData);
  }

  /**
   * Clear all file mocks
   */
  clearMocks(): void {
    this.mockReadFile.mockClear();
  }

  /**
   * Get number of file read calls
   */
  getFileReadCallCount(): number {
    return this.mockReadFile.mock.calls.length;
  }

  /**
   * Get file paths that were read
   */
  getReadFilePaths(): string[] {
    return this.mockReadFile.mock.calls.map(call => String(call[0]));
  }

  /**
   * Mock mixed file reads and errors for complex scenarios
   */
  mockMixedFileReads(fileDataMap: Record<string, any>, errorFiles: Record<string, Error>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      // Check for error files first
      for (const [errorFilePath, error] of Object.entries(errorFiles)) {
        const fileName = errorFilePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(errorFilePath) || 
            pathStr.endsWith(errorFilePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          throw error;
        }
      }
      
      // Then check for data files
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      throw new Error(`No mock data found for path: ${pathStr}`);
    });
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestHelper {
  /**
   * Measure execution time of an async function
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Measure memory usage of an async function
   */
  static async measureMemory<T>(fn: () => Promise<T>): Promise<{ result: T; memoryDelta: number }> {
    const initialMemory = process.memoryUsage().heapUsed;
    const result = await fn();
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = finalMemory - initialMemory;
    return { result, memoryDelta };
  }

  /**
   * Run a function multiple times and get average performance
   */
  static async benchmarkFunction<T>(
    fn: () => Promise<T>, 
    iterations: number = 10
  ): Promise<{ averageTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureTime(fn);
      times.push(duration);
    }
    
    return {
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  }
}

/**
 * Cache testing utilities
 */
export class CacheTestHelper {
  /**
   * Test cache hit/miss behavior
   */
  static async testCacheBehavior<T>(
    operation: () => Promise<T>
  ): Promise<void> {
    const helper = new ItemDataLoaderTestHelper();
    
    // First call - should hit file system
    await operation();
    const firstCallCount = helper.getFileReadCallCount();
    
    // Second call - should hit cache
    await operation();
    const secondCallCount = helper.getFileReadCallCount();
    
    expect(secondCallCount).toBe(firstCallCount);
  }

  /**
   * Test cache independence between different operations
   */
  static async testCacheIndependence<T, U>(
    operation1: () => Promise<T>,
    operation2: () => Promise<U>
  ): Promise<void> {
    const helper = new ItemDataLoaderTestHelper();
    
    // Run first operation
    await operation1();
    
    // Run second operation
    await operation2();
    const secondCallCount = helper.getFileReadCallCount();
    
    // Run first operation again - should still hit cache
    await operation1();
    const thirdCallCount = helper.getFileReadCallCount();
    
    expect(thirdCallCount).toBe(secondCallCount);
  }
}

/**
 * Validation testing utilities
 */
export class ValidationTestHelper {
  /**
   * Test that an item has all required fields
   */
  static validateItemStructure(item: any): void {
    const requiredFields = [
      'id', 'name', 'aliases', 'description', 'examineText',
      'type', 'portable', 'visible', 'weight', 'size',
      'tags', 'properties', 'interactions', 'currentLocation',
      'state', 'flags'
    ];
    
    for (const field of requiredFields) {
      expect(item).toHaveProperty(field);
    }
  }

  /**
   * Test that item data has all required fields
   */
  static validateItemDataStructure(itemData: any): void {
    const requiredFields = [
      'id', 'name', 'description', 'examineText', 'aliases',
      'type', 'portable', 'visible', 'weight', 'size',
      'initialState', 'tags', 'properties', 'interactions', 'initialLocation'
    ];
    
    for (const field of requiredFields) {
      expect(itemData).toHaveProperty(field);
    }
  }

  /**
   * Test that index data has correct structure
   */
  static validateIndexDataStructure(indexData: any): void {
    expect(indexData).toHaveProperty('categories');
    expect(indexData).toHaveProperty('total');
    expect(indexData).toHaveProperty('lastUpdated');
    expect(typeof indexData.categories).toBe('object');
    expect(typeof indexData.total).toBe('number');
    expect(typeof indexData.lastUpdated).toBe('string');
  }
}

/**
 * Error testing utilities
 */
export class ErrorTestHelper {
  /**
   * Test that an async function throws a specific error
   */
  static async expectAsyncError(
    fn: () => Promise<any>,
    expectedMessage?: string | RegExp
  ): Promise<Error> {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      const err = error as Error;
      if (expectedMessage) {
        if (typeof expectedMessage === 'string') {
          expect(err.message).toContain(expectedMessage);
        } else {
          expect(err.message).toMatch(expectedMessage);
        }
      }
      return err;
    }
  }

  /**
   * Create common file system errors for testing
   */
  static createFileSystemError(type: 'ENOENT' | 'EACCES' | 'EISDIR' | 'EMFILE' | 'ENOSPC'): Error {
    const errors = {
      ENOENT: new Error('ENOENT: no such file or directory'),
      EACCES: new Error('EACCES: permission denied'),
      EISDIR: new Error('EISDIR: illegal operation on a directory'),
      EMFILE: new Error('EMFILE: too many open files'),
      ENOSPC: new Error('ENOSPC: no space left on device')
    };
    return errors[type];
  }

  /**
   * Create common network errors for testing
   */
  static createNetworkError(type: 'ETIMEDOUT' | 'ECONNREFUSED' | 'ENOTFOUND'): Error {
    const errors = {
      ETIMEDOUT: new Error('ETIMEDOUT: connection timed out'),
      ECONNREFUSED: new Error('ECONNREFUSED: connection refused'),
      ENOTFOUND: new Error('ENOTFOUND: host not found')
    };
    return errors[type];
  }
}

/**
 * Data integrity testing utilities
 */
export class DataIntegrityHelper {
  /**
   * Verify that loaded item matches source data exactly
   */
  static verifyItemDataIntegrity(itemData: ItemData, loadedItem: any): void {
    expect(loadedItem.id).toBe(itemData.id);
    expect(loadedItem.name).toBe(itemData.name);
    expect(loadedItem.description).toBe(itemData.description);
    expect(loadedItem.examineText).toBe(itemData.examineText);
    expect(loadedItem.aliases).toEqual(itemData.aliases);
    expect(loadedItem.portable).toBe(itemData.portable);
    expect(loadedItem.visible).toBe(itemData.visible);
    expect(loadedItem.weight).toBe(itemData.weight);
    expect(loadedItem.tags).toEqual(itemData.tags);
    expect(loadedItem.properties).toEqual(itemData.properties);
    expect(loadedItem.currentLocation).toBe(itemData.initialLocation);
  }

  /**
   * Verify type conversions are correct
   */
  static verifyTypeConversions(itemData: ItemData, loadedItem: any): void {
    // Type should be converted to enum
    expect(typeof loadedItem.type).toBe('string');
    expect(loadedItem.type).toBe(itemData.type);
    
    // Size should be converted to enum
    expect(typeof loadedItem.size).toBe('string');
    expect(loadedItem.size).toBe(itemData.size);
    
    // State should be initialized
    expect(typeof loadedItem.state).toBe('object');
    expect(typeof loadedItem.flags).toBe('object');
  }
}

/**
 * Test helper class for MonsterDataLoader testing
 */
export class MonsterDataLoaderTestHelper {
  private mockReadFile: MockedReadFile;

  constructor() {
    this.mockReadFile = readFile as MockedReadFile;
  }

  /**
   * Mock successful file reading with provided data
   */
  mockFileRead(filePath: string, data: any): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      // More flexible path matching - check if any part of the expected path matches
      if (pathStr.includes(filePath) || pathStr.endsWith(filePath) || filePath.includes(pathStr.split('/').pop() || '')) {
        return toJsonString(data);
      }
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock multiple file reads with different data
   */
  mockMultipleFileReads(fileDataMap: Record<string, any>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        // More flexible path matching for multiple files
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      // Debug: log the attempted path and available paths
      const availablePaths = Object.keys(fileDataMap);
      throw new Error(`No mock data found for path: ${pathStr}. Available paths: ${availablePaths.join(', ')}`);
    });
  }

  /**
   * Mock file read error
   */
  mockFileReadError(filePath: string, error: Error): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      const fileName = filePath.split('/').pop() || '';
      const requestedFileName = pathStr.split('/').pop() || '';
      
      // Throw error if this specific file is requested
      if (pathStr.includes(filePath) || 
          pathStr.endsWith(filePath) || 
          requestedFileName === fileName ||
          (fileName && pathStr.includes(fileName))) {
        throw error;
      }
      
      // For unmatched paths, throw a different error
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock index.json file read
   */
  mockIndexRead(indexData: MonsterIndex): void {
    this.mockFileRead('index.json', indexData);
  }

  /**
   * Clear all file mocks
   */
  clearMocks(): void {
    this.mockReadFile.mockClear();
  }

  /**
   * Get number of file read calls
   */
  getFileReadCallCount(): number {
    return this.mockReadFile.mock.calls.length;
  }

  /**
   * Get file paths that were read
   */
  getReadFilePaths(): string[] {
    return this.mockReadFile.mock.calls.map(call => String(call[0]));
  }

  /**
   * Mock mixed file reads and errors for complex scenarios
   */
  mockMixedFileReads(fileDataMap: Record<string, any>, errorFiles: Record<string, Error>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      // Check for error files first
      for (const [errorFilePath, error] of Object.entries(errorFiles)) {
        const fileName = errorFilePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(errorFilePath) || 
            pathStr.endsWith(errorFilePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          throw error;
        }
      }
      
      // Then check for data files
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      throw new Error(`No mock data found for path: ${pathStr}`);
    });
  }
}

/**
 * Monster validation testing utilities
 */
export class MonsterValidationTestHelper {
  /**
   * Test that a monster has all required fields
   */
  static validateMonsterStructure(monster: any): void {
    const requiredFields = [
      'id', 'name', 'description', 'examineText',
      'health', 'maxHealth', 'state', 'currentSceneId',
      'movementPattern', 'allowedScenes', 'inventory',
      'variables', 'synonyms', 'flags', 'properties', 'type'
    ];
    
    for (const field of requiredFields) {
      expect(monster).toHaveProperty(field);
    }
  }

  /**
   * Test that monster data has all required fields
   */
  static validateMonsterDataStructure(monsterData: any): void {
    const requiredFields = [
      'id', 'name', 'type', 'description', 'examineText',
      'startingSceneId', 'inventory', 'synonyms', 'flags', 'properties'
    ];
    
    for (const field of requiredFields) {
      expect(monsterData).toHaveProperty(field);
    }
  }

  /**
   * Test that index data has correct structure
   */
  static validateMonsterIndexStructure(indexData: any): void {
    expect(indexData).toHaveProperty('monsters');
    expect(indexData).toHaveProperty('total');
    expect(indexData).toHaveProperty('types');
    expect(Array.isArray(indexData.monsters)).toBe(true);
    expect(typeof indexData.total).toBe('number');
    expect(typeof indexData.types).toBe('object');
  }
}

/**
 * Monster data integrity testing utilities
 */
export class MonsterDataIntegrityHelper {
  /**
   * Verify that loaded monster matches source data exactly
   */
  static verifyMonsterDataIntegrity(monsterData: MonsterData, loadedMonster: any): void {
    expect(loadedMonster.id).toBe(monsterData.id);
    expect(loadedMonster.name).toBe(monsterData.name);
    expect(loadedMonster.description).toBe(monsterData.description);
    expect(loadedMonster.examineText).toBe(monsterData.examineText);
    expect(loadedMonster.synonyms).toEqual(monsterData.synonyms);
    expect(loadedMonster.flags).toEqual(monsterData.flags);
    expect(loadedMonster.inventory).toEqual(monsterData.inventory);
    expect(loadedMonster.properties).toEqual(monsterData.properties);
    expect(loadedMonster.type).toBe(monsterData.type);
    
    // Optional MDL properties
    if (monsterData.combatStrength !== undefined) {
      expect(loadedMonster.combatStrength).toBe(monsterData.combatStrength);
    }
    if (monsterData.meleeMessages !== undefined) {
      expect(loadedMonster.meleeMessages).toEqual(monsterData.meleeMessages);
    }
    if (monsterData.behaviorFunction !== undefined) {
      expect(loadedMonster.behaviorFunction).toBe(monsterData.behaviorFunction);
    }
    if (monsterData.movementDemon !== undefined) {
      expect(loadedMonster.movementDemon).toBe(monsterData.movementDemon);
    }
  }

  /**
   * Verify type conversions are correct
   */
  static verifyMonsterTypeConversions(monsterData: MonsterData, loadedMonster: any): void {
    // State should be initialized based on data
    expect(typeof loadedMonster.state).toBe('string');
    
    // Movement pattern should be derived
    expect(typeof loadedMonster.movementPattern).toBe('string');
    
    // Variables should be initialized
    expect(typeof loadedMonster.variables).toBe('object');
    
    // Current scene should match starting scene
    expect(loadedMonster.currentSceneId).toBe(
      monsterData.currentSceneId || monsterData.startingSceneId
    );
    
    // Health should be initialized
    expect(typeof loadedMonster.health).toBe('number');
    expect(typeof loadedMonster.maxHealth).toBe('number');
  }
}

/**
 * Common test data sets for consistent testing
 */
export const TestDataSets = {
  /**
   * Valid enum values for testing
   */
  validTypes: ['TOOL', 'WEAPON', 'CONTAINER', 'TREASURE'],
  validSizes: ['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE'],
  
  /**
   * Invalid enum values for error testing
   */
  invalidTypes: ['INVALID_TYPE', 'MAGIC', 'FOOD', ''],
  invalidSizes: ['INVALID_SIZE', 'ENORMOUS', 'MICROSCOPIC', ''],
  
  /**
   * Special character test cases
   */
  specialCharacterIds: ['!!!!!', '*bun*', 'test-item', 'test_item_123', 'item.with.dots'],
  
  /**
   * Edge case file paths
   */
  edgeCaseFilePaths: [
    'category/item.json',
    'category/sub/item.json',
    'very-long-category-name/very-long-item-name.json'
  ],
  
  /**
   * Monster type enum values
   */
  validMonsterTypes: ['humanoid', 'creature', 'environmental'],
  invalidMonsterTypes: ['INVALID_TYPE', 'monster', 'beast', ''],
  
  /**
   * Monster states
   */
  validMonsterStates: ['idle', 'alert', 'hostile', 'fleeing', 'friendly', 'dead', 'guarding', 'wandering', 'lurking', 'sleeping'],
  
  /**
   * Movement patterns
   */
  validMovementPatterns: ['stationary', 'random', 'patrol', 'follow', 'flee'],
  
  /**
   * Scene lighting conditions
   */
  validLightingConditions: ['daylight', 'lit', 'dark', 'pitchBlack'],
  invalidLightingConditions: ['INVALID_LIGHTING', 'bright', 'dim', '', 'pitch_black'],
  
  /**
   * Scene regions
   */
  validRegions: ['above_ground', 'underground', 'house', 'maze', 'forest', 'canyon', 'river'],
  
  /**
   * Scene directions
   */
  validDirections: ['north', 'south', 'east', 'west', 'up', 'down', 'in', 'out', 'northeast', 'northwest', 'southeast', 'southwest']
};

// Import Scene types for test helpers
import { SceneData } from '../../src/types/SceneData';
import { SceneIndexData } from '../../src/data_loaders/SceneDataLoader';

/**
 * Test helper class for SceneDataLoader testing
 */
export class SceneDataLoaderTestHelper {
  private mockReadFile: MockedReadFile;

  constructor() {
    this.mockReadFile = readFile as MockedReadFile;
  }

  /**
   * Mock successful file reading with provided data
   */
  mockFileRead(filePath: string, data: any): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      // More flexible path matching - check if any part of the expected path matches
      if (pathStr.includes(filePath) || pathStr.endsWith(filePath) || filePath.includes(pathStr.split('/').pop() || '')) {
        return toJsonString(data);
      }
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock multiple file reads with different data
   */
  mockMultipleFileReads(fileDataMap: Record<string, any>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        // More flexible path matching for multiple files
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      // Debug: log the attempted path and available paths
      const availablePaths = Object.keys(fileDataMap);
      throw new Error(`No mock data found for path: ${pathStr}. Available paths: ${availablePaths.join(', ')}`);
    });
  }

  /**
   * Mock file read error
   */
  mockFileReadError(filePath: string, error: Error): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      const fileName = filePath.split('/').pop() || '';
      const requestedFileName = pathStr.split('/').pop() || '';
      
      // Throw error if this specific file is requested
      if (pathStr.includes(filePath) || 
          pathStr.endsWith(filePath) || 
          requestedFileName === fileName ||
          (fileName && pathStr.includes(fileName))) {
        throw error;
      }
      
      // For unmatched paths, throw a different error
      throw new Error(`Unexpected file path: ${pathStr}`);
    });
  }

  /**
   * Mock index.json file read
   */
  mockIndexRead(indexData: SceneIndexData): void {
    this.mockFileRead('index.json', indexData);
  }

  /**
   * Clear all file mocks
   */
  clearMocks(): void {
    this.mockReadFile.mockClear();
  }

  /**
   * Get number of file read calls
   */
  getFileReadCallCount(): number {
    return this.mockReadFile.mock.calls.length;
  }

  /**
   * Get file paths that were read
   */
  getReadFilePaths(): string[] {
    return this.mockReadFile.mock.calls.map(call => String(call[0]));
  }

  /**
   * Mock mixed file reads and errors for complex scenarios
   */
  mockMixedFileReads(fileDataMap: Record<string, any>, errorFiles: Record<string, Error>): void {
    this.mockReadFile.mockImplementation(async (path: PathLike | any) => {
      const pathStr = String(path);
      
      // Check for error files first
      for (const [errorFilePath, error] of Object.entries(errorFiles)) {
        const fileName = errorFilePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(errorFilePath) || 
            pathStr.endsWith(errorFilePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          throw error;
        }
      }
      
      // Then check for data files
      for (const [filePath, data] of Object.entries(fileDataMap)) {
        const fileName = filePath.split('/').pop() || '';
        const requestedFileName = pathStr.split('/').pop() || '';
        
        if (pathStr.includes(filePath) || 
            pathStr.endsWith(filePath) || 
            requestedFileName === fileName ||
            (fileName && pathStr.includes(fileName))) {
          return toJsonString(data);
        }
      }
      
      throw new Error(`No mock data found for path: ${pathStr}`);
    });
  }
}

/**
 * Scene validation testing utilities
 */
export class SceneValidationTestHelper {
  /**
   * Test that a scene has all required fields (pure data structure, no methods)
   */
  static validateSceneStructure(scene: any): void {
    const requiredFields = [
      'id', 'title', 'description', 'exits', 'items', 'monsters',
      'lighting', 'state', 'tags'
      // Note: 'visited' removed - now tracked in GameState.sceneStates
      // Note: methods removed - behavior handled by SceneService
    ];
    
    for (const field of requiredFields) {
      expect(scene).toHaveProperty(field);
    }
    
    // Ensure no methods exist on the Scene object (pure data structure)
    const forbiddenMethods = [
      'getDescription', 'getAvailableExits', 'getVisibleItems',
      'canEnter', 'onEnter', 'onExit', 'onLook', 'updateState'
    ];
    
    for (const method of forbiddenMethods) {
      expect(scene).not.toHaveProperty(method);
    }
  }

  /**
   * Test that scene data has all required fields
   */
  static validateSceneDataStructure(sceneData: any): void {
    const requiredFields = [
      'id', 'title', 'description', 'exits', 'items', 'monsters',
      'state', 'lighting', 'tags'
    ];
    
    for (const field of requiredFields) {
      expect(sceneData).toHaveProperty(field);
    }
  }

  /**
   * Test that index data has correct structure
   */
  static validateSceneIndexStructure(indexData: any): void {
    expect(indexData).toHaveProperty('scenes');
    expect(indexData).toHaveProperty('total');
    expect(indexData).toHaveProperty('regions');
    expect(indexData).toHaveProperty('lastUpdated');
    expect(Array.isArray(indexData.scenes)).toBe(true);
    expect(typeof indexData.total).toBe('number');
    expect(typeof indexData.regions).toBe('object');
    expect(typeof indexData.lastUpdated).toBe('string');
  }
}

/**
 * Scene data integrity testing utilities
 */
export class SceneDataIntegrityHelper {
  /**
   * Verify that loaded scene matches source data exactly
   */
  static verifySceneDataIntegrity(sceneData: SceneData, loadedScene: any): void {
    expect(loadedScene.id).toBe(sceneData.id);
    expect(loadedScene.title).toBe(sceneData.title);
    expect(loadedScene.description).toBe(sceneData.description);
    
    if (sceneData.firstVisitDescription) {
      expect(loadedScene.firstVisitDescription).toBe(sceneData.firstVisitDescription);
    }
    
    expect(loadedScene.tags).toEqual(sceneData.tags);
    expect(loadedScene.state).toEqual(sceneData.state);
    
    if (sceneData.region) {
      expect(loadedScene.region).toBe(sceneData.region);
    }
    
    if (sceneData.atmosphere) {
      expect(loadedScene.atmosphere).toEqual(sceneData.atmosphere);
    }
  }

  /**
   * Verify exit conversions are correct
   */
  static verifyExitConversions(sceneData: SceneData, loadedScene: any): void {
    // Count the number of exits
    const expectedExitCount = Object.keys(sceneData.exits).length;
    expect(loadedScene.exits).toHaveLength(expectedExitCount);
    
    // Verify each exit was converted correctly
    for (const [direction, exitData] of Object.entries(sceneData.exits)) {
      const convertedExit = loadedScene.exits.find((e: any) => e.direction === direction);
      expect(convertedExit).toBeDefined();
      
      if (typeof exitData === 'string') {
        expect(convertedExit.to).toBe(exitData);
      } else {
        expect(convertedExit.to).toBe(exitData.to);
        if (exitData.description) expect(convertedExit.description).toBe(exitData.description);
        if (exitData.condition) expect(convertedExit.condition).toEqual(exitData.condition);
        if (exitData.locked !== undefined) expect(convertedExit.locked).toBe(exitData.locked);
        if (exitData.keyId) expect(convertedExit.keyId).toBe(exitData.keyId);
        if (exitData.hidden !== undefined) expect(convertedExit.hidden).toBe(exitData.hidden);
        if (exitData.oneWay !== undefined) expect(convertedExit.oneWay).toBe(exitData.oneWay);
      }
    }
  }

  /**
   * Verify item conversions are correct
   */
  static verifyItemConversions(sceneData: SceneData, loadedScene: any): void {
    expect(loadedScene.items).toHaveLength(sceneData.items.length);
    
    sceneData.items.forEach((item, index) => {
      const convertedItem = loadedScene.items[index];
      
      if (typeof item === 'string') {
        expect(convertedItem.itemId).toBe(item);
        expect(convertedItem.visible).toBe(true); // Default
      } else {
        expect(convertedItem.itemId).toBe(item.itemId);
        expect(convertedItem.visible).toBe(item.visible ?? true);
        if (item.condition) {
          expect(convertedItem.condition).toBe(item.condition);
        }
      }
    });
  }

  /**
   * Verify type conversions are correct
   */
  static verifySceneTypeConversions(sceneData: SceneData, loadedScene: any): void {
    // Lighting should be converted to enum
    expect(typeof loadedScene.lighting).toBe('string');
    expect(loadedScene.lighting).toBe(sceneData.lighting);
    
    // Visited should be initialized to false
    expect(loadedScene.visited).toBe(false);
    
    // Runtime methods should exist
    expect(typeof loadedScene.getDescription).toBe('function');
    expect(typeof loadedScene.getAvailableExits).toBe('function');
    expect(typeof loadedScene.getVisibleItems).toBe('function');
    expect(typeof loadedScene.canEnter).toBe('function');
    expect(typeof loadedScene.onEnter).toBe('function');
    expect(typeof loadedScene.onExit).toBe('function');
    expect(typeof loadedScene.onLook).toBe('function');
    expect(typeof loadedScene.updateState).toBe('function');
  }
};

/**
 * Scene filtering helper utilities for tests
 * Provides filtering functions that game logic would typically use
 */
export class SceneFilterHelper {
  /**
   * Filter scenes by region
   */
  static filterByRegion(scenes: Scene[], region: string): Scene[] {
    return scenes.filter(scene => scene.region === region);
  }

  /**
   * Filter scenes by lighting condition
   */
  static filterByLighting(scenes: Scene[], lighting: LightingCondition): Scene[] {
    return scenes.filter(scene => scene.lighting === lighting);
  }

  /**
   * Filter scenes that contain monsters
   */
  static filterWithMonsters(scenes: Scene[]): Scene[] {
    return scenes.filter(scene => scene.monsters && scene.monsters.length > 0);
  }

  /**
   * Filter scenes that contain items
   */
  static filterWithItems(scenes: Scene[]): Scene[] {
    return scenes.filter(scene => scene.items && scene.items.length > 0);
  }

  /**
   * Filter scenes that have exits connecting to the target scene
   */
  static filterConnectedTo(scenes: Scene[], targetSceneId: string): Scene[] {
    return scenes.filter(scene => 
      scene.exits.some(exit => exit.to === targetSceneId)
    );
  }

  /**
   * Filter scenes by tag
   */
  static filterByTag(scenes: Scene[], tag: string): Scene[] {
    return scenes.filter(scene => scene.tags.includes(tag));
  }

  /**
   * Check if a scene exists by ID
   */
  static sceneExists(scenes: Scene[], sceneId: string): boolean {
    return scenes.some(scene => scene.id === sceneId);
  }

  /**
   * Get scene by ID
   */
  static getSceneById(scenes: Scene[], sceneId: string): Scene | undefined {
    return scenes.find(scene => scene.id === sceneId);
  }

  /**
   * Get total count of scenes
   */
  static getTotalCount(scenes: Scene[]): number {
    return scenes.length;
  }

  /**
   * Get regional distribution statistics
   */
  static getRegionalDistribution(scenes: Scene[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    scenes.forEach(scene => {
      const region = scene.region || 'unknown';
      distribution[region] = (distribution[region] || 0) + 1;
    });
    
    return distribution;
  }
}