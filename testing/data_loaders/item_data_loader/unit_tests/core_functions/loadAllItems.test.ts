/**
 * Unit tests for ItemDataLoader.loadAllItems() method
 * Tests loading all items from flat structure without caching
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';

// Mock fs/promises for unit tests
jest.mock('fs/promises');
import { readFile } from 'fs/promises';
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('ItemDataLoader.loadAllItems()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
    mockReadFile.mockReset();
  });

  describe('Success scenarios', () => {
    it('should load all items from flat structure successfully', async () => {
      // Arrange
      const mockIndex = {
        items: ['coin.json', 'lamp.json', 'box.json'],
        total: 3,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const mockCoin = {
        id: 'coin',
        name: 'coin',
        description: 'A shiny coin',
        examineText: 'A gold coin.',
        aliases: ['gold'],
        type: 'TREASURE',
        portable: true,
        visible: true,
        weight: 1,
        size: 'TINY',
        initialState: {},
        tags: ['treasure'],
        properties: {},
        interactions: [{ command: 'examine', message: 'A gold coin.' }],
        initialLocation: 'unknown'
      };

      const mockLamp = {
        id: 'lamp',
        name: 'lamp',
        description: 'A brass lamp',
        examineText: 'A brass lamp.',
        aliases: ['lantern'],
        type: 'LIGHT_SOURCE',
        portable: true,
        visible: true,
        weight: 5,
        size: 'SMALL',
        initialState: {},
        tags: ['light_source'],
        properties: {},
        interactions: [{ command: 'examine', message: 'A brass lamp.' }],
        initialLocation: 'unknown'
      };

      const mockBox = {
        id: 'box',
        name: 'box',
        description: 'A wooden box',
        examineText: 'A wooden box.',
        aliases: ['container'],
        type: 'CONTAINER',
        portable: true,
        visible: true,
        weight: 3,
        size: 'SMALL',
        initialState: {},
        tags: ['container'],
        properties: {},
        interactions: [{ command: 'examine', message: 'A wooden box.' }],
        initialLocation: 'unknown'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))      // index.json
        .mockResolvedValueOnce(JSON.stringify(mockCoin))       // coin.json
        .mockResolvedValueOnce(JSON.stringify(mockLamp))       // lamp.json
        .mockResolvedValueOnce(JSON.stringify(mockBox));       // box.json

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('coin');
      expect(result[0]?.type).toBe(ItemType.TREASURE);
      expect(result[1]?.id).toBe('lamp');
      expect(result[1]?.type).toBe(ItemType.LIGHT_SOURCE);
      expect(result[2]?.id).toBe('box');
      expect(result[2]?.type).toBe(ItemType.CONTAINER);

      // Verify file reads happened
      expect(mockReadFile).toHaveBeenCalledTimes(4);
      expect(mockReadFile).toHaveBeenNthCalledWith(1, '/Users/dirkkok/Development/zork/test-path/index.json', 'utf-8');
      expect(mockReadFile).toHaveBeenNthCalledWith(2, '/Users/dirkkok/Development/zork/test-path/coin.json', 'utf-8');
      expect(mockReadFile).toHaveBeenNthCalledWith(3, '/Users/dirkkok/Development/zork/test-path/lamp.json', 'utf-8');
      expect(mockReadFile).toHaveBeenNthCalledWith(4, '/Users/dirkkok/Development/zork/test-path/box.json', 'utf-8');
    });

    it('should handle empty items array', async () => {
      // Arrange
      const mockIndex = {
        items: [],
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockIndex));

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(0);
      expect(mockReadFile).toHaveBeenCalledTimes(1);
      expect(mockReadFile).toHaveBeenCalledWith('/Users/dirkkok/Development/zork/test-path/index.json', 'utf-8');
    });

    it('should load single item successfully', async () => {
      // Arrange
      const mockIndex = {
        items: ['lamp.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const mockLamp = {
        id: 'lamp',
        name: 'lamp',
        description: 'A brass lamp',
        examineText: 'A brass lamp.',
        aliases: ['lantern'],
        type: 'LIGHT_SOURCE',
        portable: true,
        visible: true,
        weight: 5,
        size: 'SMALL',
        initialState: {},
        tags: ['light_source'],
        properties: {},
        interactions: [{ command: 'examine', message: 'A brass lamp.' }],
        initialLocation: 'unknown'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))
        .mockResolvedValueOnce(JSON.stringify(mockLamp));

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('lamp');
      expect(result[0]?.type).toBe(ItemType.LIGHT_SOURCE);
    });
  });

  describe('Error handling', () => {
    it('should throw error when index loading fails', async () => {
      // Arrange
      mockReadFile.mockRejectedValueOnce(new Error('File not found'));

      // Act & Assert
      await expect(loader.loadAllItems()).rejects.toThrow('Failed to load item index');
    });

    it('should continue loading other items if one item fails', async () => {
      // Arrange
      const mockIndex = {
        items: ['good.json', 'bad.json', 'good2.json'],
        total: 3,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const mockGoodItem = {
        id: 'good',
        name: 'good item',
        description: 'A good item',
        examineText: 'A good item.',
        aliases: [],
        type: 'TOOL',
        portable: true,
        visible: true,
        weight: 1,
        size: 'TINY',
        initialState: {},
        tags: [],
        properties: {},
        interactions: [{ command: 'examine', message: 'A good item.' }],
        initialLocation: 'unknown'
      };

      const mockGoodItem2 = {
        id: 'good2',
        name: 'good item 2',
        description: 'Another good item',
        examineText: 'Another good item.',
        aliases: [],
        type: 'TOOL',
        portable: true,
        visible: true,
        weight: 1,
        size: 'TINY',
        initialState: {},
        tags: [],
        properties: {},
        interactions: [{ command: 'examine', message: 'Another good item.' }],
        initialLocation: 'unknown'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))        // index.json
        .mockResolvedValueOnce(JSON.stringify(mockGoodItem))     // good.json
        .mockRejectedValueOnce(new Error('Bad file'))           // bad.json fails
        .mockResolvedValueOnce(JSON.stringify(mockGoodItem2));   // good2.json

      // Act
      const result = await loader.loadAllItems();

      // Assert - Should return 2 items (good ones), skipping the bad one
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('good');
      expect(result[1]?.id).toBe('good2');
    });

    it('should handle invalid JSON in index file', async () => {
      // Arrange
      mockReadFile.mockResolvedValueOnce('invalid json');

      // Act & Assert
      await expect(loader.loadAllItems()).rejects.toThrow('Failed to load item index');
    });

    it('should handle invalid JSON in item file', async () => {
      // Arrange
      const mockIndex = {
        items: ['invalid.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))
        .mockResolvedValueOnce('invalid json');

      // Act
      const result = await loader.loadAllItems();

      // Assert - Should return empty array since the one item failed to load
      expect(result).toHaveLength(0);
    });
  });

  describe('No caching behavior', () => {
    it('should read files every time loadAllItems is called', async () => {
      // Arrange
      const mockIndex = {
        items: ['lamp.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const mockLamp = {
        id: 'lamp',
        name: 'lamp',
        description: 'A brass lamp',
        examineText: 'A brass lamp.',
        aliases: ['lantern'],
        type: 'LIGHT_SOURCE',
        portable: true,
        visible: true,
        weight: 5,
        size: 'SMALL',
        initialState: {},
        tags: ['light_source'],
        properties: {},
        interactions: [{ command: 'examine', message: 'A brass lamp.' }],
        initialLocation: 'unknown'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))   // First call - index
        .mockResolvedValueOnce(JSON.stringify(mockLamp))    // First call - lamp
        .mockResolvedValueOnce(JSON.stringify(mockIndex))   // Second call - index
        .mockResolvedValueOnce(JSON.stringify(mockLamp));   // Second call - lamp

      // Act - Call loadAllItems twice
      const result1 = await loader.loadAllItems();
      const result2 = await loader.loadAllItems();

      // Assert - Both calls should work and read files fresh
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(mockReadFile).toHaveBeenCalledTimes(4); // 2 calls × 2 files each
    });
  });

  describe('Data conversion', () => {
    it('should convert ItemData to Item with proper types', async () => {
      // Arrange
      const mockIndex = {
        items: ['typed-item.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const mockItemData = {
        id: 'typed-item',
        name: 'Typed Item',
        description: 'An item with proper types',
        examineText: 'A properly typed item.',
        aliases: ['typed', 'item'],
        type: 'WEAPON',
        portable: true,
        visible: true,
        weight: 10,
        size: 'MEDIUM',
        initialState: { durability: 100 },
        tags: ['weapon', 'sharp'],
        properties: { material: 'steel' },
        interactions: [
          { command: 'examine', message: 'A sharp weapon.' },
          { command: 'wield', message: 'You wield the weapon.' }
        ],
        initialLocation: 'armory'
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockIndex))
        .mockResolvedValueOnce(JSON.stringify(mockItemData));

      // Act
      const result = await loader.loadAllItems();

      // Assert
      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item).toBeDefined();
      
      expect(item?.id).toBe('typed-item');
      expect(item?.type).toBe(ItemType.WEAPON);
      expect(item?.size).toBe(Size.MEDIUM);
      expect(item?.portable).toBe(true);
      expect(item?.weight).toBe(10);
      expect(item?.aliases).toEqual(['typed', 'item']);
      expect(item?.tags).toEqual(['weapon', 'sharp']);
      expect(item?.state).toEqual({ durability: 100 });
      expect(item?.currentLocation).toBe('armory');
      expect(item?.interactions).toHaveLength(2);
    });
  });
});