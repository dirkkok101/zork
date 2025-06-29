/**
 * Basic Open Command Integration Tests
 * Tests core functionality of opening containers and doors
 */

import { OpenCommand } from '@/commands/OpenCommand';
import { GameInitializer } from '@/initializers/GameInitializer';
import { ServiceInitializer } from '@/initializers/ServiceInitializer';
import { LoggingService } from '@/services/LoggingService';
import { ItemType } from '@/types/ItemTypes';
import log from 'loglevel';

describe('Open Command - Basic Integration', () => {
  let openCommand: OpenCommand;
  let services: any;

  beforeEach(async () => {
    // Set up logging
    const loggingService = new LoggingService();
    loggingService.setDefaultLevel(log.levels.WARN);

    // Load game data
    const gameData = await GameInitializer.initialize(loggingService);

    // Initialize services
    services = ServiceInitializer.initialize(gameData, loggingService);

    // Mock services we don't need
    services.combat = {
      getMonstersInScene: jest.fn().mockReturnValue([]),
      canAttack: jest.fn().mockReturnValue(false),
      attack: jest.fn().mockReturnValue({ success: false, message: 'Mock combat' }),
      giveToMonster: jest.fn().mockReturnValue({ success: false, message: 'Mock give' }),
      sayToMonster: jest.fn().mockReturnValue({ success: false, message: 'Mock say' })
    };

    services.persistence = {
      saveGame: jest.fn().mockResolvedValue(true),
      restoreGame: jest.fn().mockResolvedValue(true),
      hasSavedGame: jest.fn().mockReturnValue(false)
    };

    // Create Open command
    openCommand = new OpenCommand(
      services.gameState,
      services.scene,
      services.inventory,
      services.items,
      services.combat,
      services.persistence,
      services.output
    );

    // Set up in west_of_house
    services.gameState.setCurrentScene('west_of_house');
  });

  describe('Basic Opening', () => {
    beforeEach(() => {
      // Add a test container to the scene
      const containerId = 'test_box';
      const containerItem = {
        id: containerId,
        name: 'wooden box',
        aliases: ['box'],
        description: 'A simple wooden box.',
        examineText: 'It looks like a wooden box with a hinged lid.',
        type: ItemType.CONTAINER,
        portable: true,
        visible: true,
        weight: 5,
        size: 'MEDIUM' as any,
        tags: ['container'],
        properties: {
          container: true,
          openable: true
        },
        interactions: [],
        currentLocation: 'west_of_house',
        state: { isOpen: false },
        flags: {}
      };

      // Add to game state
      const gameState = services.gameState.getGameState();
      gameState.items[containerId] = containerItem;
      services.scene.addItemToScene('west_of_house', containerId);
    });

    it('should open a closed container', () => {
      const result = openCommand.execute('open box');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('You open the wooden box');
      expect(result.countsAsMove).toBe(true);
      
      // Verify item state changed
      const item = services.gameState.getItem('test_box');
      expect(item.state.isOpen).toBe(true);
    });

    it('should handle "open wooden box" with multi-word target', () => {
      const result = openCommand.execute('open wooden box');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('You open the wooden box');
    });

    it('should fail if container is already open', () => {
      // First open it
      openCommand.execute('open box');
      
      // Try to open again
      const result = openCommand.execute('open box');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already open');
      expect(result.countsAsMove).toBe(false);
    });

    it('should fail if item does not exist', () => {
      const result = openCommand.execute('open nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't see");
      expect(result.countsAsMove).toBe(false);
    });

    it('should fail if no target is specified', () => {
      const result = openCommand.execute('open');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('What do you want to open');
      expect(result.countsAsMove).toBe(false);
    });
  });

  describe('Non-Openable Items', () => {
    beforeEach(() => {
      // Add a non-openable item
      const itemId = 'test_rock';
      const rockItem = {
        id: itemId,
        name: 'rock',
        aliases: ['stone'],
        description: 'A simple rock.',
        examineText: 'Just a rock.',
        type: ItemType.TOOL,
        portable: true,
        visible: true,
        weight: 2,
        size: 'SMALL' as any,
        tags: [],
        properties: {},
        interactions: [],
        currentLocation: 'west_of_house',
        state: {},
        flags: {}
      };

      const gameState = services.gameState.getGameState();
      gameState.items[itemId] = rockItem;
      services.scene.addItemToScene('west_of_house', itemId);
    });

    it('should fail to open non-openable items', () => {
      const result = openCommand.execute('open rock');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("can't open");
      expect(result.countsAsMove).toBe(false);
    });
  });

  describe('Locked Containers', () => {
    beforeEach(() => {
      // Add a locked container
      const containerId = 'test_chest';
      const chestItem = {
        id: containerId,
        name: 'treasure chest',
        aliases: ['chest'],
        description: 'A locked treasure chest.',
        examineText: 'A sturdy chest with a keyhole.',
        type: ItemType.CONTAINER,
        portable: false,
        visible: true,
        weight: 50,
        size: 'LARGE' as any,
        tags: ['container', 'lockable'],
        properties: {
          container: true,
          openable: true,
          lockable: true
        },
        interactions: [],
        currentLocation: 'west_of_house',
        state: { isOpen: false, isLocked: true },
        flags: {},
        requiredKey: 'test_key'
      };

      // Add a key
      const keyId = 'test_key';
      const keyItem = {
        id: keyId,
        name: 'brass key',
        aliases: ['key'],
        description: 'A small brass key.',
        examineText: 'A key that looks like it fits something.',
        type: ItemType.TOOL,
        portable: true,
        visible: true,
        weight: 1,
        size: 'TINY' as any,
        tags: ['key'],
        properties: {},
        interactions: [],
        currentLocation: 'player_inventory',
        state: {},
        flags: {}
      };

      const gameState = services.gameState.getGameState();
      gameState.items[containerId] = chestItem;
      gameState.items[keyId] = keyItem;
      
      services.scene.addItemToScene('west_of_house', containerId);
      services.inventory.addItem(keyId);
    });

    it('should fail to open locked container without key', () => {
      const result = openCommand.execute('open chest');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
      expect(result.countsAsMove).toBe(false);
    });

    it('should open locked container with correct key', () => {
      const result = openCommand.execute('open chest with key');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('You open the treasure chest with the brass key');
      expect(result.countsAsMove).toBe(true);
      
      // Verify both unlocked and opened
      const item = services.gameState.getItem('test_chest');
      expect(item.state.isLocked).toBe(false);
      expect(item.state.isOpen).toBe(true);
    });

    it('should fail with wrong key', () => {
      // Add a wrong key
      const wrongKeyId = 'wrong_key';
      const wrongKeyItem = {
        id: wrongKeyId,
        name: 'iron key',
        aliases: ['iron'],
        description: 'An iron key.',
        examineText: 'A different key.',
        type: ItemType.TOOL,
        portable: true,
        visible: true,
        weight: 1,
        size: 'TINY' as any,
        tags: ['key'],
        properties: {},
        interactions: [],
        currentLocation: 'player_inventory',
        state: {},
        flags: {}
      };

      const gameState = services.gameState.getGameState();
      gameState.items[wrongKeyId] = wrongKeyItem;
      services.inventory.addItem(wrongKeyId);

      const result = openCommand.execute('open chest with iron key');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("doesn't fit");
      expect(result.countsAsMove).toBe(false);
    });

    it('should fail if key is not in inventory', () => {
      // Remove key from inventory
      services.inventory.removeItem('test_key');
      
      const result = openCommand.execute('open chest with key');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't have");
      expect(result.countsAsMove).toBe(false);
    });
  });

  describe('Command Parsing', () => {
    beforeEach(() => {
      // Add test items for parsing tests
      const boxItem = {
        id: 'magic_box',
        name: 'magic jewelry box',
        aliases: ['magic', 'jewelry', 'box'],
        description: 'A magical jewelry box.',
        examineText: 'It sparkles with magic.',
        type: ItemType.CONTAINER,
        portable: true,
        visible: true,
        weight: 3,
        size: 'SMALL' as any,
        tags: ['container'],
        properties: { container: true, openable: true },
        interactions: [],
        currentLocation: 'west_of_house',
        state: { isOpen: false },
        flags: {}
      };

      const gameState = services.gameState.getGameState();
      gameState.items['magic_box'] = boxItem;
      services.scene.addItemToScene('west_of_house', 'magic_box');
    });

    it('should handle multi-word object names', () => {
      const result = openCommand.execute('open magic jewelry box');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('You open the magic jewelry box');
    });

    it('should handle alias matching', () => {
      const result = openCommand.execute('open jewelry');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('magic jewelry box');
    });

    it('should handle malformed "with" syntax', () => {
      const result = openCommand.execute('open box with');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('With what');
      expect(result.countsAsMove).toBe(false);
    });

    it('should handle invalid "with" at start', () => {
      const result = openCommand.execute('open with box');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't understand");
      expect(result.countsAsMove).toBe(false);
    });
  });

  describe('Inventory Items', () => {
    beforeEach(() => {
      // Add container to inventory
      const pouchId = 'leather_pouch';
      const pouchItem = {
        id: pouchId,
        name: 'leather pouch',
        aliases: ['pouch'],
        description: 'A small leather pouch.',
        examineText: 'A worn leather pouch with a drawstring.',
        type: ItemType.CONTAINER,
        portable: true,
        visible: true,
        weight: 1,
        size: 'SMALL' as any,
        tags: ['container'],
        properties: { container: true, openable: true },
        interactions: [],
        currentLocation: 'player_inventory',
        state: { isOpen: false },
        flags: {}
      };

      const gameState = services.gameState.getGameState();
      gameState.items[pouchId] = pouchItem;
      services.inventory.addItem(pouchId);
    });

    it('should open items in inventory', () => {
      const result = openCommand.execute('open pouch');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('You open the leather pouch');
      expect(result.countsAsMove).toBe(true);
    });
  });
});