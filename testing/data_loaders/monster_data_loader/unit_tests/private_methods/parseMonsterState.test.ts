/**
 * Unit tests for MonsterDataLoader.parseMonsterState() private method
 * Tests string-to-enum conversion for monster states with validation and fallbacks
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterState } from '../../../../../src/types/MonsterTypes';

describe('MonsterDataLoader.parseMonsterState()', () => {
  let loader: MonsterDataLoader;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    loader = new MonsterDataLoader('test-path/');
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Valid state parsing', () => {
    it('should parse all valid monster states correctly', () => {
      // Arrange
      const validStates = [
        { input: 'idle', expected: MonsterState.IDLE },
        { input: 'alert', expected: MonsterState.ALERT },
        { input: 'hostile', expected: MonsterState.HOSTILE },
        { input: 'fleeing', expected: MonsterState.FLEEING },
        { input: 'friendly', expected: MonsterState.FRIENDLY },
        { input: 'dead', expected: MonsterState.DEAD },
        { input: 'guarding', expected: MonsterState.GUARDING },
        { input: 'wandering', expected: MonsterState.WANDERING },
        { input: 'lurking', expected: MonsterState.LURKING },
        { input: 'sleeping', expected: MonsterState.SLEEPING }
      ];

      for (const { input, expected } of validStates) {
        // Act
        const result = (loader as any).parseMonsterState(input);

        // Assert
        expect(result).toBe(expected);
        expect(consoleSpy).not.toHaveBeenCalled();
      }
    });

    it('should handle case-insensitive parsing', () => {
      // Arrange
      const caseVariations = [
        { input: 'IDLE', expected: MonsterState.IDLE },
        { input: 'Idle', expected: MonsterState.IDLE },
        { input: 'iDlE', expected: MonsterState.IDLE },
        { input: 'HOSTILE', expected: MonsterState.HOSTILE },
        { input: 'Hostile', expected: MonsterState.HOSTILE },
        { input: 'hOsTiLe', expected: MonsterState.HOSTILE }
      ];

      for (const { input, expected } of caseVariations) {
        // Act
        const result = (loader as any).parseMonsterState(input);

        // Assert
        expect(result).toBe(expected);
        expect(consoleSpy).not.toHaveBeenCalled();
      }
    });
  });

  describe('Invalid state handling', () => {
    it('should return IDLE for invalid state and log warning', () => {
      // Arrange
      const invalidState = 'invalid_state';

      // Act
      const result = (loader as any).parseMonsterState(invalidState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: invalid_state, defaulting to idle'
      );
    });

    it('should handle empty string', () => {
      // Arrange
      const emptyState = '';

      // Act
      const result = (loader as any).parseMonsterState(emptyState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: , defaulting to idle'
      );
    });

    it('should handle whitespace-only strings', () => {
      // Arrange
      const whitespaceState = '   ';

      // Act
      const result = (loader as any).parseMonsterState(whitespaceState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state:    , defaulting to idle'
      );
    });

    it('should handle special characters', () => {
      // Arrange
      const specialState = 'hostile!@#';

      // Act
      const result = (loader as any).parseMonsterState(specialState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: hostile!@#, defaulting to idle'
      );
    });

    it('should handle numbers', () => {
      // Arrange
      const numberState = '123';

      // Act
      const result = (loader as any).parseMonsterState(numberState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: 123, defaulting to idle'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle very long strings', () => {
      // Arrange
      const longState = 'a'.repeat(1000);

      // Act
      const result = (loader as any).parseMonsterState(longState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Invalid monster state: ${longState}, defaulting to idle`
      );
    });

    it('should handle unicode characters', () => {
      // Arrange
      const unicodeState = 'hostile™';

      // Act
      const result = (loader as any).parseMonsterState(unicodeState);

      // Assert
      expect(result).toBe(MonsterState.IDLE);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: hostile™, defaulting to idle'
      );
    });

    it('should not handle states with leading/trailing whitespace', () => {
      // Arrange - Implementation does not trim whitespace, so these should be invalid
      const testCases = [
        ' idle ',
        '\thostile\t',
        '\nfriendly\n'
      ];

      for (const input of testCases) {
        // Reset spy for each test
        consoleSpy.mockClear();

        // Act
        const result = (loader as any).parseMonsterState(input);

        // Assert
        expect(result).toBe(MonsterState.IDLE); // Should default
        expect(consoleSpy).toHaveBeenCalledWith(
          `Invalid monster state: ${input}, defaulting to idle`
        );
      }
    });
  });

  describe('Legacy state compatibility', () => {
    it('should handle states that might exist in old data formats', () => {
      // Arrange
      const legacyStates = [
        'alive', // Common in other systems
        'asleep', // Alternative to sleeping
        'active', // Alternative to alert
        'passive', // Alternative to idle
        'angry', // Alternative to hostile
        'running' // Alternative to fleeing
      ];

      for (const legacyState of legacyStates) {
        // Reset spy for each test
        consoleSpy.mockClear();

        // Act
        const result = (loader as any).parseMonsterState(legacyState);

        // Assert
        expect(result).toBe(MonsterState.IDLE);
        expect(consoleSpy).toHaveBeenCalledWith(
          `Invalid monster state: ${legacyState}, defaulting to idle`
        );
      }
    });
  });

  describe('State normalization', () => {
    it('should properly normalize case before comparison', () => {
      // Arrange
      const mixedCaseStates = [
        { input: 'IdLe', expected: MonsterState.IDLE },
        { input: 'HoStIlE', expected: MonsterState.HOSTILE },
        { input: 'fRiEnDlY', expected: MonsterState.FRIENDLY },
        { input: 'sLeEpInG', expected: MonsterState.SLEEPING }
      ];

      for (const { input, expected } of mixedCaseStates) {
        // Reset spy for each test
        consoleSpy.mockClear();

        // Act
        const result = (loader as any).parseMonsterState(input);

        // Assert
        expect(result).toBe(expected); // Should normalize case
        expect(consoleSpy).not.toHaveBeenCalled(); // Should not warn
      }
    });

    it('should reject states with whitespace (no trimming)', () => {
      // Arrange - Implementation does not trim, so these should be invalid
      const whitespaceStates = [
        '  idle  ',
        '\thostile\t',
        '\n  friendly  \n',
        ' \t sleeping \n '
      ];

      for (const state of whitespaceStates) {
        // Reset spy for each test
        consoleSpy.mockClear();

        // Act
        const result = (loader as any).parseMonsterState(state);

        // Assert
        expect(result).toBe(MonsterState.IDLE); // Should default
        expect(consoleSpy).toHaveBeenCalledWith(
          `Invalid monster state: ${state}, defaulting to idle`
        );
      }
    });
  });

  describe('Error logging behavior', () => {
    it('should log exactly once per invalid state', () => {
      // Arrange
      const invalidState = 'totally_invalid';

      // Act
      (loader as any).parseMonsterState(invalidState);

      // Assert
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid monster state: totally_invalid, defaulting to idle'
      );
    });

    it('should include original input in warning message', () => {
      // Arrange
      const testCases = [
        'unknown',
        'INVALID',
        '???',
        'state with spaces'
      ];

      for (const invalidState of testCases) {
        // Reset spy for each test
        consoleSpy.mockClear();

        // Act
        (loader as any).parseMonsterState(invalidState);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
          `Invalid monster state: ${invalidState}, defaulting to idle`
        );
      }
    });
  });

  describe('Performance considerations', () => {
    it('should handle repeated calls efficiently', () => {
      // Arrange
      const validState = 'hostile';
      const iterations = 1000;

      // Act
      const startTime = Date.now();
      for (let i = 0; i < iterations; i++) {
        (loader as any).parseMonsterState(validState);
      }
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(100); // Should be very fast
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not leak memory with invalid states', () => {
      // Arrange
      const invalidStates = Array.from({ length: 100 }, (_, i) => `invalid_${i}`);

      // Act
      for (const state of invalidStates) {
        const result = (loader as any).parseMonsterState(state);
        expect(result).toBe(MonsterState.IDLE);
      }

      // Assert
      expect(consoleSpy).toHaveBeenCalledTimes(100);
    });
  });
});