/**
 * Test helper utilities for ItemDataLoader testing
 * Provides common testing functionality and utilities
 */

import { readFile } from 'fs/promises';
import { PathLike } from 'fs';
import { ItemData, ItemIndexData } from '../../src/types/ItemData';
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
  ]
};