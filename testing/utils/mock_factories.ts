/**
 * Mock factory functions for creating test data
 * Provides consistent, type-safe mock objects for testing
 */

import { ItemData, ItemInteractionData, ItemIndexData } from '../../src/types/ItemData';
import { Item, ItemType, Size } from '../../src/types/ItemTypes';

/**
 * Creates a mock ItemData object with default values and optional overrides
 */
export function createMockItemData(overrides?: Partial<ItemData>): ItemData {
  return {
    id: 'test_item',
    name: 'Test Item',
    description: 'A test item for unit testing',
    examineText: 'You see a test item. It looks like it was made for testing.',
    aliases: ['test', 'item', 'testing'],
    type: 'TOOL',
    portable: true,
    visible: true,
    weight: 10,
    size: 'MEDIUM',
    initialState: {},
    tags: ['test', 'portable'],
    properties: { size: 10 },
    interactions: [
      {
        command: 'examine',
        message: 'You see a test item. It looks like it was made for testing.'
      },
      {
        command: 'take',
        message: 'You take the test item.'
      }
    ],
    initialLocation: 'unknown',
    ...overrides
  };
}

/**
 * Creates a mock Item object (runtime interface) with default values
 */
export function createMockItem(overrides?: Partial<Item>): Item {
  return {
    id: 'test_item',
    name: 'Test Item',
    aliases: ['test', 'item', 'testing'],
    description: 'A test item for unit testing',
    examineText: 'You see a test item. It looks like it was made for testing.',
    type: ItemType.TOOL,
    portable: true,
    visible: true,
    weight: 10,
    size: Size.MEDIUM,
    tags: ['test', 'portable'],
    properties: { size: 10 },
    interactions: [
      {
        command: 'examine',
        message: 'You see a test item. It looks like it was made for testing.'
      },
      {
        command: 'take',
        message: 'You take the test item.'
      }
    ],
    currentLocation: 'unknown',
    state: {},
    flags: {},
    ...overrides
  };
}

/**
 * Creates a mock ItemInteractionData object
 */
export function createMockInteractionData(overrides?: Partial<ItemInteractionData>): ItemInteractionData {
  return {
    command: 'examine',
    message: 'You examine the item.',
    ...overrides
  };
}

/**
 * Creates a mock ItemIndexData object
 */
export function createMockIndexData(overrides?: Partial<ItemIndexData>): ItemIndexData {
  return {
    categories: {
      'treasures': ['treasures/test_treasure.json'],
      'tools': ['tools/test_tool.json'],
      'containers': ['containers/test_container.json'],
      'weapons': ['weapons/test_weapon.json'],
      'consumables': ['consumables/test_consumable.json']
    },
    total: 5,
    lastUpdated: '2024-06-25T00:00:00Z',
    ...overrides
  };
}

/**
 * Factory for creating items of specific types
 */
export const ItemDataFactory = {
  /**
   * Creates a treasure item
   */
  treasure: (overrides?: Partial<ItemData>) => createMockItemData({
    id: 'test_treasure',
    name: 'Golden Coin',
    description: 'A shiny golden coin',
    examineText: 'The coin gleams with an otherworldly light.',
    type: 'TREASURE',
    weight: 5,
    size: 'TINY',
    tags: ['treasure', 'valuable'],
    ...overrides
  }),

  /**
   * Creates a tool item
   */
  tool: (overrides?: Partial<ItemData>) => createMockItemData({
    id: 'test_tool',
    name: 'Magic Lamp',
    description: 'An ornate brass lamp',
    examineText: 'The lamp appears to be made of brass and has intricate engravings.',
    type: 'TOOL',
    weight: 15,
    size: 'MEDIUM',
    tags: ['tool', 'light_source'],
    interactions: [
      {
        command: 'examine',
        message: 'The lamp appears to be made of brass and has intricate engravings.'
      },
      {
        command: 'rub',
        message: 'The lamp grows warm under your touch.'
      }
    ],
    ...overrides
  }),

  /**
   * Creates a container item
   */
  container: (overrides?: Partial<ItemData>) => createMockItemData({
    id: 'test_container',
    name: 'Wooden Box',
    description: 'A sturdy wooden box',
    examineText: 'The box is made of dark wood and has a simple latch.',
    type: 'CONTAINER',
    portable: false,
    weight: 20,
    size: 'LARGE',
    tags: ['container', 'openable'],
    interactions: [
      {
        command: 'examine',
        message: 'The box is made of dark wood and has a simple latch.'
      },
      {
        command: 'open',
        condition: '!state.open',
        effect: 'state.open = true',
        message: 'You open the wooden box.'
      },
      {
        command: 'close',
        condition: 'state.open',
        effect: 'state.open = false',
        message: 'You close the wooden box.'
      }
    ],
    ...overrides
  }),

  /**
   * Creates a weapon item
   */
  weapon: (overrides?: Partial<ItemData>) => createMockItemData({
    id: 'test_weapon',
    name: 'Steel Sword',
    description: 'A sharp steel sword',
    examineText: 'The blade gleams menacingly in the light.',
    type: 'WEAPON',
    weight: 25,
    size: 'LARGE',
    tags: ['weapon', 'sharp'],
    ...overrides
  }),

  /**
   * Creates a consumable item
   */
  consumable: (overrides?: Partial<ItemData>) => createMockItemData({
    id: 'test_consumable',
    name: 'Sandwich',
    description: 'A delicious sandwich',
    examineText: 'The sandwich looks fresh and appetizing.',
    type: 'TOOL', // Based on actual data analysis
    weight: 3,
    size: 'TINY',
    tags: ['food', 'consumable'],
    ...overrides
  })
};

/**
 * Factory for creating edge case test data
 */
export const EdgeCaseFactory = {
  /**
   * Creates item with special characters in ID
   */
  specialCharacters: () => createMockItemData({
    id: '!!!!!',
    name: 'Special Item',
    aliases: ['*special*', '!!!', 'weird-name']
  }),

  /**
   * Creates item with empty arrays and objects
   */
  emptyFields: () => createMockItemData({
    aliases: [],
    tags: [],
    interactions: [],
    properties: {},
    initialState: {}
  }),

  /**
   * Creates item with maximum values
   */
  maximumValues: () => createMockItemData({
    weight: Number.MAX_SAFE_INTEGER,
    size: 'HUGE',
    aliases: Array(100).fill('alias'),
    tags: Array(50).fill('tag')
  }),

  /**
   * Creates item with minimum values
   */
  minimumValues: () => createMockItemData({
    weight: 0,
    size: 'TINY',
    name: 'x',
    description: 'x',
    examineText: 'x'
  }),

  /**
   * Creates item with unicode characters
   */
  unicodeCharacters: () => createMockItemData({
    id: 'tëst_itém_🗡️',
    name: 'Tëst Itém 🗡️',
    description: 'Ä tëst itém wïth ünïcödë',
    examineText: 'Yöü sëë ä tëst itém wïth spëcïäl chäräctërs.'
  }),

  /**
   * Creates item with complex interactions
   */
  complexInteractions: () => createMockItemData({
    interactions: [
      {
        command: 'open',
        condition: '!state.open && !state.locked',
        effect: 'state.open = true',
        message: 'You open the complex item.'
      },
      {
        command: 'close',
        condition: 'state.open',
        effect: 'state.open = false',
        message: 'You close the complex item.'
      },
      {
        command: 'lock',
        condition: '!state.locked && inventory.hasKey',
        effect: 'state.locked = true',
        message: 'You lock the complex item.'
      }
    ]
  })
};

/**
 * Factory for creating invalid data for error testing
 */
export const InvalidDataFactory = {
  /**
   * Creates item data missing required fields
   */
  missingRequiredFields: () => ({
    id: 'incomplete_item',
    name: 'Incomplete Item'
    // Missing many required fields
  }),

  /**
   * Creates item data with wrong types
   */
  wrongTypes: () => ({
    id: 123, // Should be string
    name: true, // Should be string
    aliases: 'not an array', // Should be array
    weight: 'heavy', // Should be number
    portable: 'yes' // Should be boolean
  }),

  /**
   * Creates item data with invalid enum values
   */
  invalidEnums: () => createMockItemData({
    type: 'INVALID_TYPE',
    size: 'INVALID_SIZE'
  }),

  /**
   * Creates malformed JSON string
   */
  malformedJson: () => '{ invalid json content }',

  /**
   * Creates item with circular references
   */
  circularReference: () => {
    const item: any = createMockItemData();
    item.self = item; // Create circular reference
    return item;
  }
};

/**
 * Factory for creating performance test data
 */
export const PerformanceFactory = {
  /**
   * Creates a large number of items for performance testing
   */
  createLargeItemSet: (count: number): ItemData[] => {
    return Array.from({ length: count }, (_, index) => 
      createMockItemData({
        id: `performance_item_${index}`,
        name: `Performance Item ${index}`,
        weight: Math.floor(Math.random() * 100),
        size: ['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE'][Math.floor(Math.random() * 5)] as any
      })
    );
  },

  /**
   * Creates index data with many categories
   */
  createLargeIndexData: (categoriesCount: number, itemsPerCategory: number): ItemIndexData => {
    const categories: Record<string, string[]> = {};
    
    for (let i = 0; i < categoriesCount; i++) {
      const categoryName = `category_${i}`;
      categories[categoryName] = Array.from({ length: itemsPerCategory }, (_, j) => 
        `${categoryName}/item_${j}.json`
      );
    }
    
    return {
      categories,
      total: categoriesCount * itemsPerCategory,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Helper function to create JSON string from object
 */
export function toJsonString(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Helper function to create malformed JSON for error testing
 */
export function createMalformedJson(type: 'syntax' | 'structure' | 'encoding'): string {
  switch (type) {
    case 'syntax':
      return '{ "id": "test", "name": "Test Item", }'; // Extra comma
    case 'structure':
      return '["not", "an", "object"]'; // Array instead of object
    case 'encoding':
      return '\xFF\xFE{"id": "test"}'; // Invalid UTF-8
    default:
      return 'invalid';
  }
}