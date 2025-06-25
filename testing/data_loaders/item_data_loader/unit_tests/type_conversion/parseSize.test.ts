/**
 * Unit tests for ItemDataLoader.parseSize() method
 * Tests string to Size enum conversion with validation
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { Size } from '../../../../../src/types/ItemTypes';

describe('ItemDataLoader.parseSize()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Valid enum conversions', () => {
    it('should convert "TINY" string to Size.TINY', () => {
      // Act
      const result = (loader as any).parseSize('TINY');

      // Assert
      expect(result).toBe(Size.TINY);
    });

    it('should convert "SMALL" string to Size.SMALL', () => {
      // Act
      const result = (loader as any).parseSize('SMALL');

      // Assert
      expect(result).toBe(Size.SMALL);
    });

    it('should convert "MEDIUM" string to Size.MEDIUM', () => {
      // Act
      const result = (loader as any).parseSize('MEDIUM');

      // Assert
      expect(result).toBe(Size.MEDIUM);
    });

    it('should convert "LARGE" string to Size.LARGE', () => {
      // Act
      const result = (loader as any).parseSize('LARGE');

      // Assert
      expect(result).toBe(Size.LARGE);
    });

    it('should convert "HUGE" string to Size.HUGE', () => {
      // Act
      const result = (loader as any).parseSize('HUGE');

      // Assert
      expect(result).toBe(Size.HUGE);
    });
  });

  describe('Case sensitivity handling', () => {
    it('should handle lowercase input correctly', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize('tiny')).toThrow('Invalid item size: tiny');
      expect(() => (loader as any).parseSize('small')).toThrow('Invalid item size: small');
      expect(() => (loader as any).parseSize('medium')).toThrow('Invalid item size: medium');
      expect(() => (loader as any).parseSize('large')).toThrow('Invalid item size: large');
      expect(() => (loader as any).parseSize('huge')).toThrow('Invalid item size: huge');
    });

    it('should handle mixed case input correctly', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize('Tiny')).toThrow('Invalid item size: Tiny');
      expect(() => (loader as any).parseSize('Small')).toThrow('Invalid item size: Small');
      expect(() => (loader as any).parseSize('Medium')).toThrow('Invalid item size: Medium');
      expect(() => (loader as any).parseSize('Large')).toThrow('Invalid item size: Large');
      expect(() => (loader as any).parseSize('Huge')).toThrow('Invalid item size: Huge');
    });
  });

  describe('Invalid input handling', () => {
    it('should throw descriptive error for invalid size strings', () => {
      const invalidSizes = [
        'EXTRA_SMALL',
        'EXTRA_LARGE',
        'GIGANTIC',
        'MINUSCULE',
        'ENORMOUS',
        'MICROSCOPIC'
      ];

      invalidSizes.forEach(invalidSize => {
        expect(() => (loader as any).parseSize(invalidSize))
          .toThrow(`Invalid item size: ${invalidSize}`);
      });
    });

    it('should handle empty string input', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize('')).toThrow('Invalid item size: ');
    });

    it('should handle null and undefined input', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize(null)).toThrow('Invalid item size: null');
      expect(() => (loader as any).parseSize(undefined)).toThrow('Invalid item size: undefined');
    });

    it('should handle whitespace input', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize('  ')).toThrow('Invalid item size:   ');
      expect(() => (loader as any).parseSize('\t')).toThrow('Invalid item size: \t');
      expect(() => (loader as any).parseSize('\n')).toThrow('Invalid item size: \n');
    });

    it('should handle numeric input', () => {
      // Act & Assert
      expect(() => (loader as any).parseSize('1')).toThrow('Invalid item size: 1');
      expect(() => (loader as any).parseSize('5')).toThrow('Invalid item size: 5');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'TINY'.repeat(250); // 1000 characters
      
      // Act & Assert
      expect(() => (loader as any).parseSize(longString))
        .toThrow(`Invalid item size: ${longString}`);
    });

    it('should handle special characters', () => {
      const specialChars = ['TINY!', 'SMALL@', 'MEDIUM#', 'LARGE$', 'HUGE%'];
      
      specialChars.forEach(input => {
        expect(() => (loader as any).parseSize(input))
          .toThrow(`Invalid item size: ${input}`);
      });
    });

    it('should handle unicode characters', () => {
      const unicodeInputs = ['TÎNY', 'SMÅLL', 'MÉDIUM'];
      
      unicodeInputs.forEach(input => {
        expect(() => (loader as any).parseSize(input))
          .toThrow(`Invalid item size: ${input}`);
      });
    });
  });

  describe('Authentic Zork size validation', () => {
    it('should accept all valid Zork item sizes', () => {
      // Based on actual Zork data analysis
      const validZorkSizes = [
        'TINY',    // 154 instances
        'SMALL',   // 29 instances
        'MEDIUM',  // 16 instances
        'LARGE',   // 8 instances
        'HUGE'     // 7 instances
      ];

      validZorkSizes.forEach(size => {
        expect(() => (loader as any).parseSize(size)).not.toThrow();
        expect((loader as any).parseSize(size)).toBe(size);
      });
    });

    it('should reject sizes not found in Zork data', () => {
      const nonZorkSizes = [
        'EXTRA_SMALL',
        'XS',
        'S',
        'M',
        'L',
        'XL',
        'EXTRA_LARGE',
        'XXL',
        'GIGANTIC',
        'MINUSCULE',
        'MICROSCOPIC',
        'ENORMOUS'
      ];

      nonZorkSizes.forEach(size => {
        expect(() => (loader as any).parseSize(size))
          .toThrow(`Invalid item size: ${size}`);
      });
    });
  });

  describe('Size distribution validation', () => {
    it('should handle realistic size distribution based on Zork data', () => {
      // Based on actual analysis: TINY is most common (154/214 = 72%)
      const sizeDistribution = {
        'TINY': 154,   // 72% - Most items are tiny
        'SMALL': 29,   // 13.6%
        'MEDIUM': 16,  // 7.5%
        'LARGE': 8,    // 3.7%
        'HUGE': 7      // 3.3%
      };

      // Verify all sizes can be parsed
      Object.keys(sizeDistribution).forEach(size => {
        expect(() => (loader as any).parseSize(size)).not.toThrow();
        expect((loader as any).parseSize(size)).toBe(size);
      });
    });
  });

  describe('Performance requirements', () => {
    it('should convert sizes quickly for performance', () => {
      const startTime = performance.now();
      
      // Perform many conversions
      for (let i = 0; i < 1000; i++) {
        (loader as any).parseSize('TINY');
        (loader as any).parseSize('SMALL');
        (loader as any).parseSize('MEDIUM');
        (loader as any).parseSize('LARGE');
        (loader as any).parseSize('HUGE');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 5000 conversions in under 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});