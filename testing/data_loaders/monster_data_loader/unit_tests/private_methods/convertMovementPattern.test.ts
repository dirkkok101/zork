/**
 * Unit tests for MonsterDataLoader.convertMovementPattern() private method
 * Tests movement pattern conversion logic from demon names and explicit patterns
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MovementPattern } from '../../../../../src/types/MonsterTypes';
import { MonsterData } from '../../../../../src/types/MonsterData';

describe('MonsterDataLoader.convertMovementPattern()', () => {
  let loader: MonsterDataLoader;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
  });

  describe('Explicit pattern handling', () => {
    it('should use explicit movement pattern when provided', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementPattern: {
          type: 'patrol',
          data: { patrolRoute: ['room1', 'room2'] }
        }
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('patrol');
    });

    it('should prioritize explicit pattern over movement demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementPattern: {
          type: 'stationary'
        },
        movementDemon: 'FOLLOW-DEMON' // This would normally result in 'follow'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should handle all valid explicit movement pattern types', () => {
      // Arrange
      const validPatterns: MovementPattern[] = ['stationary', 'random', 'patrol', 'follow', 'flee'];

      for (const pattern of validPatterns) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementPattern: { type: pattern }
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe(pattern);
      }
    });
  });

  describe('Movement demon inference', () => {
    it('should return follow for ROBBER demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'thief',
        movementDemon: 'ROBBER-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('follow');
    });

    it('should return follow for FOLLOW demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'FOLLOW-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('follow');
    });

    it('should return flee for FLEE demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'FLEE-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('flee');
    });

    it('should return patrol for PATROL demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'PATROL-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('patrol');
    });

    it('should return random for RANDOM demon', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'RANDOM-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('random');
    });

    it('should handle case-sensitive demon name matching', () => {
      // Arrange - Implementation is case-sensitive
      const testCases = [
        { demon: 'ROBBER-DEMON', expected: 'follow' },
        { demon: 'FOLLOW-DEMON', expected: 'follow' },
        { demon: 'FLEE-DEMON', expected: 'flee' },
        { demon: 'PATROL-DEMON', expected: 'patrol' },
        { demon: 'RANDOM-DEMON', expected: 'random' }
      ];

      for (const testCase of testCases) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: testCase.demon
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });

    it('should return stationary for incorrect case demon names', () => {
      // Arrange - Implementation is case-sensitive, so these should not match
      const testCases = [
        'robber-demon', // lowercase
        'Robber-Demon', // mixed case
        'flee-demon',   // lowercase
        'patrol-demon'  // lowercase
      ];

      for (const testCase of testCases) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: testCase
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe('stationary');
      }
    });

    it('should handle partial matches in demon names', () => {
      // Arrange
      const testCases = [
        { demon: 'THIEF-ROBBER-FUNCTION', expected: 'follow' },
        { demon: 'MONSTER-FOLLOW-PLAYER', expected: 'follow' },
        { demon: 'CREATURE-FLEE-COMBAT', expected: 'flee' },
        { demon: 'GUARD-PATROL-AREA', expected: 'patrol' },
        { demon: 'WANDER-RANDOM-ROOM', expected: 'random' }
      ];

      for (const testCase of testCases) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: testCase.demon
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe('Default behavior', () => {
    it('should return stationary when no pattern or demon is provided', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test'
        // No movementPattern or movementDemon
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should return stationary when movementDemon is empty', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: ''
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should return stationary when movementDemon does not match any pattern', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'UNKNOWN-DEMON'
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should return stationary when movementPattern exists but has no type', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementPattern: {
          data: { validScenes: ['room1'] }
          // No type property
        } as any
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });
  });

  describe('Edge cases', () => {
    it('should handle null movementPattern', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementPattern: null as any
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should handle multiple keywords in demon name', () => {
      // Arrange
      const monsterData: Partial<MonsterData> = {
        id: 'test',
        movementDemon: 'ROBBER-PATROL-FOLLOW-DEMON' // Contains multiple keywords
      };

      // Act
      const result = (loader as any).convertMovementPattern(monsterData);

      // Assert
      // Should match the first pattern in the if-else chain (ROBBER/FOLLOW)
      expect(result).toBe('follow');
    });

    it('should handle complex demon names from real game data', () => {
      // Arrange
      const realWorldCases = [
        { demon: 'THIEF-ROBBER-FUNCTION', expected: 'follow' },
        { demon: 'TROLL-GUARD-BRIDGE', expected: 'stationary' }, // No matching keyword
        { demon: 'BAT-RANDOM-FLIGHT', expected: 'random' },
        { demon: 'GRUE-LURK-DARKNESS', expected: 'stationary' } // No matching keyword
      ];

      for (const testCase of realWorldCases) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: testCase.demon
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe('Priority handling', () => {
    it('should prioritize explicit pattern over any demon inference', () => {
      // Arrange
      const conflictingData: Partial<MonsterData> = {
        id: 'test',
        movementPattern: { type: 'stationary' },
        movementDemon: 'ROBBER-FOLLOW-FLEE-PATROL-RANDOM-DEMON' // All keywords
      };

      // Act
      const result = (loader as any).convertMovementPattern(conflictingData);

      // Assert
      expect(result).toBe('stationary');
    });

    it('should handle precedence in demon name matching', () => {
      // Arrange - Test the order of if-else checks
      const testCases = [
        { demon: 'ROBBER-FLEE', expected: 'follow' }, // ROBBER comes first
        { demon: 'FOLLOW-FLEE', expected: 'follow' }, // FOLLOW comes first
        { demon: 'FLEE-PATROL', expected: 'flee' }, // FLEE comes before PATROL
        { demon: 'PATROL-RANDOM', expected: 'patrol' }, // PATROL comes before RANDOM
      ];

      for (const testCase of testCases) {
        const monsterData: Partial<MonsterData> = {
          id: 'test',
          movementDemon: testCase.demon
        };

        // Act
        const result = (loader as any).convertMovementPattern(monsterData);

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });
  });
});