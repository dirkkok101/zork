/**
 * Unit tests for MonsterDataLoader.determineInitialState() private method
 * Tests state determination logic based on flags, behavior functions, and type
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterState } from '../../../../../src/types/MonsterTypes';
import { MonsterData } from '../../../../../src/types/MonsterData';

describe('MonsterDataLoader.determineInitialState()', () => {
  let loader: MonsterDataLoader;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
  });

  describe('Explicit state handling', () => {
    it('should use explicit state when provided', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        state: 'hostile',
        flags: {}
      };

      // Spy on parseMonsterState to verify it's called
      const parseStateSpy = jest.spyOn(loader as any, 'parseMonsterState')
        .mockReturnValue(MonsterState.HOSTILE);

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(parseStateSpy).toHaveBeenCalledWith('hostile');
      expect(result).toBe(MonsterState.HOSTILE);

      parseStateSpy.mockRestore();
    });

    it('should prioritize explicit state over flags', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        state: 'friendly',
        flags: { VILLAIN: true } // This would normally make it hostile
      };

      // Spy on parseMonsterState
      const parseStateSpy = jest.spyOn(loader as any, 'parseMonsterState')
        .mockReturnValue(MonsterState.FRIENDLY);

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(parseStateSpy).toHaveBeenCalledWith('friendly');
      expect(result).toBe(MonsterState.FRIENDLY);

      parseStateSpy.mockRestore();
    });
  });

  describe('Flag-based state inference', () => {
    it('should return HOSTILE for VILLAIN flag', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: true }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE);
    });

    it('should return LURKING for INVISIBLE flag', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { INVISIBLE: true }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.LURKING);
    });

    it('should return LURKING for OVISON flag', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { OVISON: true }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.LURKING);
    });

    it('should prioritize VILLAIN over INVISIBLE', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: true, INVISIBLE: true }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE);
    });

    it('should prioritize VILLAIN over OVISON', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: true, OVISON: true }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE);
    });
  });

  describe('Behavior function-based inference', () => {
    it('should return GUARDING for GUARD behavior function', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: {},
        behaviorFunction: 'GUARD-FUNCTION'
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.GUARDING);
    });

    it('should return GUARDING for behavior function containing GUARD', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: {},
        behaviorFunction: 'TROLL-GUARD-BRIDGE'
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.GUARDING);
    });

    it('should prioritize flags over behavior function', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: true },
        behaviorFunction: 'GUARD-FUNCTION'
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE);
    });
  });

  describe('Type-based defaults', () => {
    it('should return IDLE for humanoid type by default', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: {}
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });

    it('should return WANDERING for creature type by default', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'creature',
        flags: {}
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.WANDERING);
    });

    it('should return LURKING for environmental type by default', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'environmental',
        flags: {}
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.LURKING);
    });

    it('should return IDLE for unknown type', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'unknown' as any,
        flags: {}
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing flags object', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid'
        // No flags property
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });

    it('should handle empty flags object', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'creature',
        flags: {}
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.WANDERING);
    });

    it('should handle false flag values', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: { VILLAIN: false, INVISIBLE: false }
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });

    it('should handle missing behaviorFunction', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: {}
        // No behaviorFunction
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });

    it('should handle empty behaviorFunction', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        type: 'humanoid',
        flags: {},
        behaviorFunction: ''
      };

      // Act
      const result = (loader as any).determineInitialState(monsterData);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle real thief-like monster data', () => {
      // Arrange
      const thiefData: Partial<MonsterData> = {
        id: 'thief',
        type: 'humanoid',
        flags: { VILLAIN: true },
        behaviorFunction: 'ROBBER-FUNCTION'
      };

      // Act
      const result = (loader as any).determineInitialState(thiefData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE);
    });

    it('should handle real troll-like monster data', () => {
      // Arrange
      const trollData: Partial<MonsterData> = {
        id: 'troll',
        type: 'humanoid',
        flags: { VILLAIN: true },
        behaviorFunction: 'TROLL-GUARD-FUNCTION'
      };

      // Act
      const result = (loader as any).determineInitialState(trollData);

      // Assert
      expect(result).toBe(MonsterState.HOSTILE); // VILLAIN takes precedence
    });

    it('should handle real grue-like monster data', () => {
      // Arrange
      const grueData: Partial<MonsterData> = {
        id: 'grue',
        type: 'environmental',
        flags: { INVISIBLE: true },
        behaviorFunction: 'GRUE-FUNCTION'
      };

      // Act
      const result = (loader as any).determineInitialState(grueData);

      // Assert
      expect(result).toBe(MonsterState.LURKING);
    });
  });
});