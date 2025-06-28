/**
 * Unit tests for MonsterDataLoader.initializeVariables() private method
 * Tests monster-specific variable initialization logic
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterData } from '../../../../../src/types/MonsterData';

describe('MonsterDataLoader.initializeVariables()', () => {
  let loader: MonsterDataLoader;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
  });

  describe('Thief-specific variables', () => {
    it('should initialize thief variables correctly', () => {
      // Arrange
      const thiefData: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid'
      };

      // Act
      const result = (loader as any).initializeVariables(thiefData);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });
    });

    it('should initialize thief variables even with existing properties', () => {
      // Arrange
      const thiefData: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        properties: {
          existingProperty: 'value'
        }
      };

      // Act
      const result = (loader as any).initializeVariables(thiefData);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });
    });
  });

  describe('Troll-specific variables', () => {
    it('should initialize troll variables correctly', () => {
      // Arrange
      const trollData: Partial<MonsterData> = {
        id: 'troll',
        type: 'humanoid'
      };

      // Act
      const result = (loader as any).initializeVariables(trollData);

      // Assert
      expect(result).toEqual({
        hasBeenPaid: false,
        isGuarding: true
      });
    });
  });

  describe('Cyclops-specific variables', () => {
    it('should initialize cyclops variables correctly', () => {
      // Arrange
      const cyclopsData: Partial<MonsterData> = {
        id: 'cyclops',
        type: 'humanoid'
      };

      // Act
      const result = (loader as any).initializeVariables(cyclopsData);

      // Assert
      expect(result).toEqual({
        isAsleep: true,
        hasBeenAwakened: false
      });
    });
  });

  describe('Generic monsters', () => {
    it('should return empty object for unknown monster', () => {
      // Arrange
      const unknownData: Partial<MonsterData> = {
        id: 'unknown_monster',
        type: 'creature'
      };

      // Act
      const result = (loader as any).initializeVariables(unknownData);

      // Assert
      expect(result).toEqual({});
    });

    it('should return empty object for generic humanoid', () => {
      // Arrange
      const genericData: Partial<MonsterData> = {
        id: 'generic_humanoid',
        type: 'humanoid'
      };

      // Act
      const result = (loader as any).initializeVariables(genericData);

      // Assert
      expect(result).toEqual({});
    });

    it('should return empty object for creature', () => {
      // Arrange
      const creatureData: Partial<MonsterData> = {
        id: 'grue',
        type: 'creature'
      };

      // Act
      const result = (loader as any).initializeVariables(creatureData);

      // Assert
      expect(result).toEqual({});
    });

    it('should return empty object for environmental', () => {
      // Arrange
      const environmentalData: Partial<MonsterData> = {
        id: 'ghost',
        type: 'environmental'
      };

      // Act
      const result = (loader as any).initializeVariables(environmentalData);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('Properties.variables handling', () => {
    it('should merge variables from properties when present', () => {
      // Arrange
      const dataWithVariables: Partial<MonsterData> = {
        id: 'generic',
        type: 'humanoid',
        properties: {
          variables: {
            customVar1: 'value1',
            customVar2: 42,
            customVar3: true
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithVariables);

      // Assert
      expect(result).toEqual({
        customVar1: 'value1',
        customVar2: 42,
        customVar3: true
      });
    });

    it('should merge thief variables with properties variables', () => {
      // Arrange
      const thiefDataWithExtra: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        properties: {
          variables: {
            customThiefVar: 'special',
            experienceLevel: 5
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(thiefDataWithExtra);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false,
        customThiefVar: 'special',
        experienceLevel: 5
      });
    });

    it('should merge troll variables with properties variables', () => {
      // Arrange
      const trollDataWithExtra: Partial<MonsterData> = {
        id: 'troll',
        type: 'humanoid',
        properties: {
          variables: {
            bridgeLocation: 'north_bridge',
            tollAmount: 10
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(trollDataWithExtra);

      // Assert
      expect(result).toEqual({
        hasBeenPaid: false,
        isGuarding: true,
        bridgeLocation: 'north_bridge',
        tollAmount: 10
      });
    });

    it('should merge cyclops variables with properties variables', () => {
      // Arrange
      const cyclopsDataWithExtra: Partial<MonsterData> = {
        id: 'cyclops',
        type: 'humanoid',
        properties: {
          variables: {
            caveName: 'treasure_cave',
            treasureCount: 3
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(cyclopsDataWithExtra);

      // Assert
      expect(result).toEqual({
        isAsleep: true,
        hasBeenAwakened: false,
        caveName: 'treasure_cave',
        treasureCount: 3
      });
    });

    it('should allow properties variables to override monster-specific variables', () => {
      // Arrange
      const thiefDataWithOverride: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        properties: {
          variables: {
            hasStolen: true, // Override default
            stolenItems: ['lamp', 'sword'], // Override default
            customVar: 'extra'
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(thiefDataWithOverride);

      // Assert
      expect(result).toEqual({
        hasStolen: true, // Overridden
        stolenItems: ['lamp', 'sword'], // Overridden
        engagedInCombat: false, // Not overridden
        customVar: 'extra'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing properties object', () => {
      // Arrange
      const dataWithoutProperties: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid'
        // No properties
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithoutProperties);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });
    });

    it('should handle properties object without variables', () => {
      // Arrange
      const dataWithoutVariables: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        properties: {
          someOtherProperty: 'value'
          // No variables
        }
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithoutVariables);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });
    });

    it('should handle null properties', () => {
      // Arrange
      const dataWithNullProperties: Partial<MonsterData> = {
        id: 'troll',
        type: 'humanoid',
        properties: null as any
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithNullProperties);

      // Assert
      expect(result).toEqual({
        hasBeenPaid: false,
        isGuarding: true
      });
    });

    it('should handle null variables in properties', () => {
      // Arrange
      const dataWithNullVariables: Partial<MonsterData> = {
        id: 'cyclops',
        type: 'humanoid',
        properties: {
          variables: null as any
        }
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithNullVariables);

      // Assert
      expect(result).toEqual({
        isAsleep: true,
        hasBeenAwakened: false
      });
    });

    it('should handle empty variables object in properties', () => {
      // Arrange
      const dataWithEmptyVariables: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        properties: {
          variables: {}
        }
      };

      // Act
      const result = (loader as any).initializeVariables(dataWithEmptyVariables);

      // Assert
      expect(result).toEqual({
        hasStolen: false,
        stolenItems: [],
        engagedInCombat: false
      });
    });

    it('should handle case sensitivity in monster IDs', () => {
      // Arrange
      const cases = [
        { id: 'THIEF', expectedVars: {} }, // Case sensitive, should not match
        { id: 'Thief', expectedVars: {} }, // Case sensitive, should not match
        { id: 'TROLL', expectedVars: {} }, // Case sensitive, should not match
        { id: 'Cyclops', expectedVars: {} } // Case sensitive, should not match
      ];

      for (const testCase of cases) {
        const data: Partial<MonsterData> = {
          id: testCase.id,
          type: 'humanoid'
        };

        // Act
        const result = (loader as any).initializeVariables(data);

        // Assert
        expect(result).toEqual(testCase.expectedVars);
      }
    });
  });

  describe('Complex variable types', () => {
    it('should handle complex variable types from properties', () => {
      // Arrange
      const complexData: Partial<MonsterData> = {
        id: 'complex',
        type: 'humanoid',
        properties: {
          variables: {
            stringVar: 'text',
            numberVar: 42,
            booleanVar: true,
            arrayVar: [1, 2, 3],
            objectVar: { nested: 'value' },
            nullVar: null,
            undefinedVar: undefined
          }
        }
      };

      // Act
      const result = (loader as any).initializeVariables(complexData);

      // Assert
      expect(result).toEqual({
        stringVar: 'text',
        numberVar: 42,
        booleanVar: true,
        arrayVar: [1, 2, 3],
        objectVar: { nested: 'value' },
        nullVar: null,
        undefinedVar: undefined
      });
    });
  });
});