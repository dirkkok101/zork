/**
 * Unit tests for MonsterDataLoader.convertMonsterDataToMonster() private method
 * Tests conversion logic from raw JSON data to typed Monster interface
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterState } from '../../../../../src/types/MonsterTypes';
import { MonsterData } from '../../../../../src/types/MonsterData';

describe('MonsterDataLoader.convertMonsterDataToMonster()', () => {
  let loader: MonsterDataLoader;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
  });

  describe('Basic conversion', () => {
    it('should convert minimal monster data correctly', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test_monster',
        name: 'Test Monster',
        type: 'humanoid',
        description: 'A test monster',
        examineText: 'You see a test monster',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      // Act - Access private method using type assertion
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.id).toBe('test_monster');
      expect(result.name).toBe('Test Monster');
      expect(result.type).toBe('humanoid');
      expect(result.description).toBe('A test monster');
      expect(result.examineText).toBe('You see a test monster');
      expect(result.inventory).toEqual([]);
      expect(result.synonyms).toEqual([]);
      expect(result.flags).toEqual({});
      expect(result.properties).toEqual({});
    });

    it('should set default health values when not provided', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'creature',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.health).toBe(100);
      expect(result.maxHealth).toBe(100);
    });

    it('should use provided health values', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'creature',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        health: 75,
        maxHealth: 150
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.health).toBe(75);
      expect(result.maxHealth).toBe(150);
    });

    it('should use maxHealth as health when health is not provided', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'creature',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        maxHealth: 200
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.health).toBe(200);
      expect(result.maxHealth).toBe(200);
    });
  });

  describe('Location handling', () => {
    it('should use currentSceneId when provided', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        currentSceneId: 'current_room',
        startingSceneId: 'starting_room'
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.currentSceneId).toBe('current_room');
      expect(result.startingSceneId).toBe('starting_room');
    });

    it('should use startingSceneId as currentSceneId when currentSceneId is undefined', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        startingSceneId: 'starting_room'
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.currentSceneId).toBe('starting_room');
      expect(result.startingSceneId).toBe('starting_room');
    });

    it('should handle null location values', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'environmental',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.currentSceneId).toBeNull();
      expect(result.startingSceneId).toBeNull();
    });
  });

  describe('MDL properties', () => {
    it('should preserve all MDL properties', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'thief',
        name: 'Thief',
        type: 'humanoid',
        description: 'A sneaky thief',
        examineText: 'The thief looks shifty',
        inventory: ['sword', 'bag'],
        synonyms: ['robber', 'burglar'],
        flags: { VILLAIN: true, OVISON: false },
        properties: { aggressive: true, sneaky: true },
        combatStrength: 15,
        meleeMessages: {
          miss: ['The thief misses'],
          kill: ['The thief kills you']
        },
        behaviorFunction: 'ROBBER-FUNCTION',
        movementDemon: 'FOLLOW-DEMON'
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.combatStrength).toBe(15);
      expect(result.meleeMessages).toEqual({
        miss: ['The thief misses'],
        kill: ['The thief kills you']
      });
      expect(result.behaviorFunction).toBe('ROBBER-FUNCTION');
      expect(result.movementDemon).toBe('FOLLOW-DEMON');
      expect(result.inventory).toEqual(['sword', 'bag']);
      expect(result.synonyms).toEqual(['robber', 'burglar']);
      expect(result.flags).toEqual({ VILLAIN: true, OVISON: false });
      expect(result.properties).toEqual({ aggressive: true, sneaky: true });
    });

    it('should handle undefined optional properties', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'simple',
        name: 'Simple Monster',
        type: 'creature',
        description: 'Simple',
        examineText: 'Simple',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.combatStrength).toBeUndefined();
      expect(result.meleeMessages).toBeUndefined();
      expect(result.behaviorFunction).toBeUndefined();
      expect(result.movementDemon).toBeUndefined();
    });
  });

  describe('State determination', () => {
    it('should call determineInitialState for state', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: { VILLAIN: true },
        properties: {}
      };

      // Spy on the private method
      const determineStateSpy = jest.spyOn(loader as any, 'determineInitialState')
        .mockReturnValue(MonsterState.HOSTILE);

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(determineStateSpy).toHaveBeenCalledWith(monsterData);
      expect(result.state).toBe(MonsterState.HOSTILE);

      determineStateSpy.mockRestore();
    });
  });

  describe('Movement pattern conversion', () => {
    it('should call convertMovementPattern for movement pattern', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        movementDemon: 'FOLLOW-DEMON'
      };

      // Spy on the private method
      const convertPatternSpy = jest.spyOn(loader as any, 'convertMovementPattern')
        .mockReturnValue('follow');

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(convertPatternSpy).toHaveBeenCalledWith(monsterData);
      expect(result.movementPattern).toBe('follow');

      convertPatternSpy.mockRestore();
    });
  });

  describe('Variables initialization', () => {
    it('should call initializeVariables for variables', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'thief',
        name: 'Thief',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      const expectedVariables = { hasStolen: false, stolenItems: [], engagedInCombat: false };

      // Spy on the private method
      const initVariablesSpy = jest.spyOn(loader as any, 'initializeVariables')
        .mockReturnValue(expectedVariables);

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(initVariablesSpy).toHaveBeenCalledWith(monsterData);
      expect(result.variables).toEqual(expectedVariables);

      initVariablesSpy.mockRestore();
    });
  });

  describe('Behavior extraction', () => {
    it('should call extractBehaviors for behaviors', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        behaviorFunction: 'ROBBER-FUNCTION'
      };

      const expectedBehaviors = ['steal'];

      // Spy on the private method
      const extractBehaviorsSpy = jest.spyOn(loader as any, 'extractBehaviors')
        .mockReturnValue(expectedBehaviors);

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(extractBehaviorsSpy).toHaveBeenCalledWith(monsterData);
      expect(result.behaviors).toEqual(expectedBehaviors);

      extractBehaviorsSpy.mockRestore();
    });
  });

  describe('Defeat score handling', () => {
    it('should extract defeat score from onDefeat', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {},
        onDefeat: {
          message: 'Monster defeated',
          grantScore: 50
        }
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.defeatScore).toBe(50);
    });

    it('should handle missing onDefeat', () => {
      // Arrange
      const monsterData: MonsterData = {
        id: 'test',
        name: 'Test',
        type: 'humanoid',
        description: 'Test',
        examineText: 'Test',
        inventory: [],
        synonyms: [],
        flags: {},
        properties: {}
      };

      // Act
      const result = (loader as any).convertMonsterDataToMonster(monsterData);

      // Assert
      expect(result.defeatScore).toBeUndefined();
    });
  });
});