/**
 * Mock factory functions for creating test data
 * Provides consistent, type-safe mock objects for testing
 */

import { ItemData, ItemInteractionData, ItemIndexData } from '../../src/types/ItemData';
import { Item, ItemType, Size } from '../../src/types/ItemTypes';
import { MonsterData, MonsterIndex, MeleeMessages } from '../../src/types/MonsterData';
import { Monster } from '../../src/types/Monster';
import { MonsterState, MonsterType } from '../../src/types/MonsterTypes';

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
    items: [
      'test_treasure.json',
      'test_tool.json', 
      'test_container.json',
      'test_weapon.json',
      'test_consumable.json'
    ],
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
   * Creates index data with many items
   */
  createLargeIndexData: (itemCount: number): ItemIndexData => {
    const items = Array.from({ length: itemCount }, (_, i) => `item_${i}.json`);
    
    return {
      items,
      total: itemCount,
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

/**
 * Creates a mock MonsterData object with default values and optional overrides
 */
export function createMockMonsterData(overrides?: Partial<MonsterData>): MonsterData {
  return {
    id: 'test_monster',
    name: 'Test Monster',
    type: 'humanoid',
    description: 'A test monster for unit testing',
    examineText: 'You see a test monster. It looks menacing but harmless.',
    startingSceneId: 'test_room',
    currentSceneId: 'test_room',
    health: 100,
    maxHealth: 100,
    inventory: [],
    synonyms: ['test', 'monster', 'creature'],
    flags: {},
    properties: {},
    ...overrides
  };
}

/**
 * Creates a mock Monster object (runtime interface) with default values
 */
export function createMockMonster(overrides?: Partial<Monster>): Monster {
  return {
    id: 'test_monster',
    name: 'Test Monster',
    description: 'A test monster for unit testing',
    examineText: 'You see a test monster. It looks menacing but harmless.',
    health: 100,
    maxHealth: 100,
    state: MonsterState.IDLE,
    currentSceneId: 'test_room',
    startingSceneId: 'test_room',
    movementPattern: 'stationary',
    allowedScenes: [],
    inventory: [],
    variables: {},
    synonyms: ['test', 'monster', 'creature'],
    flags: {},
    properties: {},
    type: 'humanoid',
    ...overrides
  };
}

/**
 * Creates a mock MeleeMessages object
 */
export function createMockMeleeMessages(overrides?: Partial<MeleeMessages>): MeleeMessages {
  return {
    miss: ['The monster swings and misses.'],
    unconscious: ['The monster knocks you unconscious.'],
    kill: ['The monster delivers a fatal blow.'],
    light_wound: ['The monster scratches you.'],
    severe_wound: ['The monster wounds you severely.'],
    stagger: ['The monster staggers you.'],
    disarm: ['The monster disarms you.'],
    ...overrides
  };
}

/**
 * Creates a mock MonsterIndex object
 */
export function createMockMonsterIndex(overrides?: Partial<MonsterIndex>): MonsterIndex {
  return {
    monsters: ['thief', 'troll', 'cyclops'],
    total: 3,
    types: {
      humanoid: ['thief', 'troll', 'cyclops'],
      creature: [],
      environmental: []
    },
    ...overrides
  };
}

/**
 * Factory for creating monsters of specific types
 */
export const MonsterDataFactory = {
  /**
   * Creates a humanoid monster (thief-like)
   */
  humanoid: (overrides?: Partial<MonsterData>) => createMockMonsterData({
    id: 'test_thief',
    name: 'thief',
    type: 'humanoid',
    description: 'A suspicious-looking individual holding a bag.',
    examineText: 'A shifty character with nimble fingers and a large sack.',
    synonyms: ['thief', 'robber', 'bandit'],
    flags: {
      VILLAIN: true,
      OVISON: true
    },
    inventory: ['stiletto'],
    combatStrength: 5,
    meleeMessages: createMockMeleeMessages({
      miss: ['The thief stabs nonchalantly with his stiletto and misses.'],
      kill: ['The stiletto severs your jugular. It looks like the end.'],
      light_wound: ['A quick thrust pinks your left arm, and blood starts to trickle down.']
    }),
    behaviorFunction: 'ROBBER-FUNCTION',
    movementDemon: 'ROBBER-DEMON',
    properties: {
      canSteal: true,
      hasLoot: true
    },
    ...overrides
  }),

  /**
   * Creates a creature monster (grue-like)
   */
  creature: (overrides?: Partial<MonsterData>) => createMockMonsterData({
    id: 'test_grue',
    name: 'grue',
    type: 'environmental',
    description: 'It is pitch black. You are likely to be eaten by a grue.',
    examineText: 'The grue is a sinister, lurking presence in the dark places of the earth.',
    synonyms: ['grue', 'darkness', 'monster'],
    flags: {
      INVISIBLE: true,
      NDESCBIT: true
    },
    inventory: [],
    combatStrength: 10,
    meleeMessages: createMockMeleeMessages({
      kill: ['The grue lunges from the darkness and devours you whole!']
    }),
    behaviorFunction: 'GRUE-FUNCTION',
    properties: {
      onlyInDarkness: true
    },
    ...overrides
  }),

  /**
   * Creates an environmental monster (ghost-like)
   */
  environmental: (overrides?: Partial<MonsterData>) => createMockMonsterData({
    id: 'test_ghost',
    name: 'ghost',
    type: 'creature',
    description: 'A ghostly figure floats before you.',
    examineText: 'The ghost appears to be the spirit of an ancient adventurer.',
    synonyms: ['ghost', 'spirit', 'phantom'],
    flags: {
      INVISIBLE: true,
      TAKEBIT: false
    },
    inventory: [],
    behaviorFunction: 'GHOST-FUNCTION',
    properties: {
      incorporeal: true
    },
    ...overrides
  }),

  /**
   * Creates a guardian monster (troll-like)
   */
  guardian: (overrides?: Partial<MonsterData>) => createMockMonsterData({
    id: 'test_troll',
    name: 'troll',
    type: 'humanoid',
    description: 'A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.',
    examineText: 'The troll is massive and threatening, clearly not interested in conversation.',
    synonyms: ['troll', 'guardian'],
    flags: {
      VILLAIN: true,
      TRYTAKEBIT: true
    },
    inventory: ['axe'],
    combatStrength: 9,
    meleeMessages: createMockMeleeMessages({
      miss: ['The troll swings his axe but misses.'],
      kill: ['The axe crashes down on your head.']
    }),
    behaviorFunction: 'TROLL-FUNCTION',
    properties: {
      isGuarding: true,
      wantsToll: true
    },
    ...overrides
  })
};

/**
 * Factory for creating edge case monster test data
 */
export const MonsterEdgeCaseFactory = {
  /**
   * Creates monster with no inventory
   */
  emptyInventory: () => createMockMonsterData({
    inventory: []
  }),

  /**
   * Creates monster with complex melee messages
   */
  fullMeleeMessages: () => createMockMonsterData({
    meleeMessages: {
      miss: ['Miss 1', 'Miss 2', 'Miss 3'],
      unconscious: ['Unconscious 1', 'Unconscious 2'],
      kill: ['Kill 1', 'Kill 2', 'Kill 3', 'Kill 4'],
      light_wound: ['Light 1', 'Light 2'],
      severe_wound: ['Severe 1', 'Severe 2', 'Severe 3'],
      stagger: ['Stagger 1'],
      disarm: ['Disarm 1', 'Disarm 2']
    }
  }),

  /**
   * Creates monster with no MDL properties
   */
  noMdlProperties: () => {
    const data = createMockMonsterData();
    // Remove optional MDL properties
    delete (data as any).combatStrength;
    delete (data as any).meleeMessages;
    delete (data as any).behaviorFunction;
    delete (data as any).movementDemon;
    return data;
  },

  /**
   * Creates monster with maximum values
   */
  maximumValues: () => createMockMonsterData({
    health: Number.MAX_SAFE_INTEGER,
    maxHealth: Number.MAX_SAFE_INTEGER,
    combatStrength: 100,
    synonyms: Array(50).fill('synonym'),
    inventory: Array(20).fill('item')
  }),

  /**
   * Creates monster with state inference flags
   */
  stateInferenceFlags: () => createMockMonsterData({
    flags: {
      INVISIBLE: true,  // Should infer LURKING state
      VILLAIN: true     // Should infer HOSTILE tendencies
    }
  })
};

/**
 * Factory for creating invalid monster data for error testing
 */
export const InvalidMonsterDataFactory = {
  /**
   * Creates monster data missing required fields
   */
  missingRequiredFields: () => ({
    id: 'incomplete_monster',
    name: 'Incomplete Monster'
    // Missing many required fields
  }),

  /**
   * Creates monster data with wrong types
   */
  wrongTypes: () => ({
    id: 123, // Should be string
    name: true, // Should be string
    type: 'humanoid', // Valid type
    description: 'Valid description', // Valid
    examineText: 'Valid examine text', // Valid
    startingSceneId: 'valid_scene', // Valid
    inventory: 'not an array', // Should be array - this will fail validation
    synonyms: [], // Valid
    flags: {}, // Valid
    properties: {} // Valid
  }),

  /**
   * Creates monster data with invalid enum values
   */
  invalidEnums: () => createMockMonsterData({
    type: 'INVALID_TYPE' as any
  }),

  /**
   * Creates monster without required arrays
   */
  missingArrays: () => ({
    id: 'bad_monster',
    name: 'Bad Monster',
    type: 'humanoid',
    description: 'Bad',
    examineText: 'Bad',
    startingSceneId: 'room',
    // Missing inventory, synonyms
    flags: {},
    properties: {}
  })
};

/**
 * Factory for creating performance test monster data
 */
export const MonsterPerformanceFactory = {
  /**
   * Creates a large set of monsters for performance testing
   */
  createLargeMonsterSet: (count: number): MonsterData[] => {
    const types: MonsterType[] = [MonsterType.HUMANOID, MonsterType.CREATURE, MonsterType.ENVIRONMENTAL];
    
    return Array.from({ length: count }, (_, index) => {
      const type = types[index % 3];
      return createMockMonsterData({
        id: `performance_monster_${index}`,
        name: `Performance Monster ${index}`,
        type: type!,
        health: Math.floor(Math.random() * 200) + 50,
        combatStrength: Math.floor(Math.random() * 10) + 1
      });
    });
  },

  /**
   * Creates index data with many monsters
   */
  createLargeMonsterIndex: (monsterCount: number): MonsterIndex => {
    const monsters = Array.from({ length: monsterCount }, (_, i) => `performance_monster_${i}`);
    
    // Distribute monsters across types
    const humanoidCount = Math.floor(monsterCount * 0.5);
    const creatureCount = Math.floor(monsterCount * 0.3);
    
    return {
      monsters,
      total: monsterCount,
      types: {
        humanoid: monsters.slice(0, humanoidCount),
        creature: monsters.slice(humanoidCount, humanoidCount + creatureCount),
        environmental: monsters.slice(humanoidCount + creatureCount)
      }
    };
  }
};

// Import Scene types
import { SceneData } from '../../src/types/SceneData';
import { Scene } from '../../src/types/SceneTypes';

/**
 * Creates a mock SceneData object with default values and optional overrides
 */
export function createMockSceneData(overrides?: Partial<SceneData>): SceneData {
  return {
    id: 'test_scene',
    title: 'Test Scene',
    description: 'A test scene for unit testing',
    exits: {},
    items: [],
    monsters: [],
    state: {},
    lighting: 'daylight',
    tags: [],
    ...overrides
  };
}

/**
 * Creates a mock Scene object (runtime interface) with default values
 */
export function createMockScene(overrides?: Partial<Scene>): Scene {
  const baseScene = {
    id: 'test_scene',
    title: 'Test Scene',
    description: 'A test scene for unit testing',
    exits: [],
    items: [],
    monsters: [],
    lighting: 'daylight' as any,
    visited: false,
    region: 'test_region',
    atmosphere: [],
    entryActions: [],
    state: {},
    tags: [],
    getDescription: jest.fn().mockReturnValue('A test scene for unit testing'),
    getAvailableExits: jest.fn().mockReturnValue([]),
    getVisibleItems: jest.fn().mockReturnValue([]),
    canEnter: jest.fn().mockReturnValue(true),
    onEnter: jest.fn(),
    onExit: jest.fn(),
    onLook: jest.fn().mockReturnValue('A test scene for unit testing'),
    updateState: jest.fn(),
    ...overrides
  };
  return baseScene;
}

/**
 * Creates a mock scene index structure
 */
export function createMockSceneIndex(overrides?: Partial<any>): any {
  return {
    scenes: [
      'test_outdoor.json',
      'test_indoor.json',
      'test_underground.json',
      'test_maze.json'
    ],
    total: 4,
    regions: {
      above_ground: ['test_outdoor.json', 'test_indoor.json'],
      underground: ['test_underground.json'],
      maze: ['test_maze.json']
    },
    lastUpdated: '2024-06-25T00:00:00Z',
    ...overrides
  };
}

/**
 * Factory for creating scenes of specific types
 */
export const SceneDataFactory = {
  /**
   * Creates an outdoor scene
   */
  outdoor: (overrides?: Partial<SceneData>) => createMockSceneData({
    id: 'test_outdoor',
    title: 'Forest Clearing',
    description: 'A peaceful clearing in the forest',
    lighting: 'daylight',
    region: 'above_ground',
    atmosphere: ['Birds chirp in the distance', 'A gentle breeze rustles the leaves'],
    exits: {
      'north': 'forest_path',
      'south': 'meadow'
    },
    tags: ['outdoor', 'peaceful'],
    ...overrides
  }),

  /**
   * Creates an indoor scene
   */
  indoor: (overrides?: Partial<SceneData>) => createMockSceneData({
    id: 'test_indoor',
    title: 'Cozy Room',
    description: 'A comfortable indoor room',
    lighting: 'lit',
    region: 'above_ground',
    exits: {
      'out': 'courtyard'
    },
    items: ['chair', 'table'],
    tags: ['indoor', 'safe'],
    ...overrides
  }),

  /**
   * Creates an underground scene
   */
  underground: (overrides?: Partial<SceneData>) => createMockSceneData({
    id: 'test_underground',
    title: 'Dark Cave',
    description: 'A dark underground cavern',
    lighting: 'dark',
    region: 'underground',
    exits: {
      'up': 'cave_entrance'
    },
    atmosphere: ['Water drips from the ceiling', 'Your footsteps echo'],
    tags: ['underground', 'dark'],
    ...overrides
  }),

  /**
   * Creates a maze scene
   */
  maze: (overrides?: Partial<SceneData>) => createMockSceneData({
    id: 'test_maze',
    title: 'Maze Passage',
    description: 'A confusing maze passage',
    lighting: 'pitchBlack',
    region: 'maze',
    exits: {
      'north': 'maze_center',
      'south': 'maze_entrance',
      'east': 'maze_dead_end',
      'west': 'maze_passage_2'
    },
    tags: ['maze', 'confusing'],
    ...overrides
  }),

  /**
   * Creates a scene with complex exits
   */
  complexExits: (overrides?: Partial<SceneData>) => createMockSceneData({
    id: 'test_complex_exits',
    title: 'Guardian Chamber',
    description: 'A chamber guarded by complex mechanisms',
    lighting: 'lit',
    exits: {
      'north': {
        to: 'treasure_vault',
        locked: true,
        keyId: 'skeleton_key',
        description: 'A heavy door blocks the way north'
      },
      'south': 'entrance_hall',
      'east': {
        to: 'secret_room',
        hidden: true,
        condition: 'lever_pulled'
      },
      'west': {
        to: 'exit_chamber',
        oneWay: true,
        description: 'A one-way passage to the west'
      }
    },
    tags: ['complex', 'guarded'],
    ...overrides
  })
};

/**
 * Factory for creating edge case scene test data
 */
export const SceneEdgeCaseFactory = {
  /**
   * Creates scene with all optional fields populated
   */
  allOptionalFields: () => createMockSceneData({
    id: 'optional_fields_scene',
    title: 'Optional Fields Scene',
    description: 'A scene with all optional fields',
    firstVisitDescription: 'First time here!',
    region: 'special_region',
    atmosphere: [
      'Special atmosphere message 1',
      'Special atmosphere message 2',
      'Special atmosphere message 3'
    ],
    entryActions: [
      {
        action: 'display_message',
        condition: 'first_visit',
        message: 'Welcome to the special area!',
        once: true
      }
    ]
  }),

  /**
   * Creates scene with empty arrays and objects
   */
  emptyFields: () => createMockSceneData({
    id: 'empty_fields_scene',
    exits: {},
    items: [],
    monsters: [],
    atmosphere: [],
    entryActions: [],
    tags: [],
    state: {}
  }),

  /**
   * Creates scene with special characters
   */
  specialCharacters: () => createMockSceneData({
    id: 'scène-with_spéciàl.chars',
    title: 'Spëcïäl Chäräctërs Scëne 🏰',
    description: 'Ä scëne wïth ünïcödë änd spëcïäl chäräctërs'
  }),

  /**
   * Creates scene with complex conditions
   */
  complexConditions: () => createMockSceneData({
    id: 'complex_conditions_scene',
    exits: {
      'north': {
        to: 'conditional_room',
        condition: ['has_key', 'is_day', 'quest_complete']
      }
    },
    items: [
      {
        itemId: 'conditional_item',
        visible: true,
        condition: 'item_revealed'
      }
    ],
    monsters: [
      {
        monsterId: 'conditional_monster',
        condition: 'monster_awakened'
      }
    ]
  }),

  /**
   * Creates scene with maximum complexity
   */
  maximumComplexity: () => createMockSceneData({
    id: 'max_complex',
    title: 'Maximum Complexity Scene',
    description: 'A scene with maximum complexity for testing',
    exits: Object.fromEntries(
      ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'up', 'down', 'in', 'out']
        .map(dir => [dir, `${dir}_destination`])
    ),
    items: Array.from({ length: 20 }, (_, i) => `item_${i}`),
    monsters: Array.from({ length: 10 }, (_, i) => `monster_${i}`),
    atmosphere: Array.from({ length: 15 }, (_, i) => `Atmosphere message ${i + 1}`),
    tags: Array.from({ length: 30 }, (_, i) => `tag_${i}`),
    state: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`property_${i}`, `value_${i}`])
    )
  })
};

/**
 * Factory for creating invalid scene data for error testing
 */
export const InvalidSceneDataFactory = {
  /**
   * Creates scene data missing required fields
   */
  missingRequiredFields: () => ({
    id: 'incomplete_scene',
    title: 'Incomplete Scene'
    // Missing description, exits, items, monsters, state, lighting, tags
  }),

  /**
   * Creates scene data with wrong types
   */
  wrongTypes: () => ({
    id: 123, // Should be string
    title: true, // Should be string
    description: [], // Should be string
    exits: 'not an object', // Should be object
    items: 'not an array', // Should be array
    monsters: 'not an array', // Should be array
    state: 'not an object', // Should be object
    lighting: 123, // Should be string
    tags: 'not an array' // Should be array
  }),

  /**
   * Creates scene data with invalid lighting values
   */
  invalidLighting: () => createMockSceneData({
    lighting: 'INVALID_LIGHTING'
  }),

  /**
   * Creates scene without required arrays
   */
  missingArrays: () => ({
    id: 'bad_scene',
    title: 'Bad Scene',
    description: 'Bad',
    exits: {},
    lighting: 'daylight'
    // Missing items, monsters, tags arrays
  })
};

/**
 * Factory for creating performance test scene data
 */
export const ScenePerformanceFactory = {
  /**
   * Creates a large set of scenes for performance testing
   */
  createLargeSceneSet: (count: number): SceneData[] => {
    const lightingTypes = ['daylight', 'lit', 'dark', 'pitchBlack'];
    const regions = ['above_ground', 'underground', 'maze', 'endgame'];
    
    return Array.from({ length: count }, (_, index) => {
      const lighting = lightingTypes[index % 4];
      const region = regions[index % 4];
      
      return createMockSceneData({
        id: `performance_scene_${index.toString().padStart(3, '0')}`,
        title: `Performance Scene ${index}`,
        description: `A performance test scene number ${index}`,
        lighting: lighting!,
        region: region!,
        exits: {
          'north': `performance_scene_${(index + 1).toString().padStart(3, '0')}`,
          'south': `performance_scene_${Math.max(0, index - 1).toString().padStart(3, '0')}`
        },
        items: index % 3 === 0 ? [`item_${index}`] : [],
        monsters: index % 5 === 0 ? [`monster_${index}`] : [],
        tags: [`performance`, `scene_${index}`]
      });
    });
  },

  /**
   * Creates index data with many scenes
   */
  createLargeSceneIndex: (sceneCount: number): any => {
    const scenes = Array.from({ length: sceneCount }, (_, i) => 
      `performance_scene_${i.toString().padStart(3, '0')}.json`
    );
    
    // Distribute scenes across regions
    const aboveGroundCount = Math.floor(sceneCount * 0.1);
    const undergroundCount = Math.floor(sceneCount * 0.8);
    const mazeCount = Math.floor(sceneCount * 0.08);
    
    return {
      scenes,
      total: sceneCount,
      regions: {
        above_ground: scenes.slice(0, aboveGroundCount),
        underground: scenes.slice(aboveGroundCount, aboveGroundCount + undergroundCount),
        maze: scenes.slice(aboveGroundCount + undergroundCount, aboveGroundCount + undergroundCount + mazeCount),
        endgame: scenes.slice(aboveGroundCount + undergroundCount + mazeCount)
      },
      lastUpdated: new Date().toISOString()
    };
  }
};
