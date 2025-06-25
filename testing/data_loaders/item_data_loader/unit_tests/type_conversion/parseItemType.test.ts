/**
 * Unit tests for ItemDataLoader.parseItemType() method
 * Tests string to ItemType enum conversion with validation
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType } from '../../../../../src/types/ItemTypes';

describe('ItemDataLoader.parseItemType()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Valid enum conversions', () => {
    it('should convert "TOOL" string to ItemType.TOOL', () => {
      // Act
      const result = (loader as any).parseItemType('TOOL');

      // Assert
      expect(result).toBe(ItemType.TOOL);
    });

    it('should convert "TREASURE" string to ItemType.TREASURE', () => {
      // Act
      const result = (loader as any).parseItemType('TREASURE');

      // Assert
      expect(result).toBe(ItemType.TREASURE);
    });

    it('should convert "CONTAINER" string to ItemType.CONTAINER', () => {
      // Act
      const result = (loader as any).parseItemType('CONTAINER');

      // Assert
      expect(result).toBe(ItemType.CONTAINER);
    });

    it('should convert "WEAPON" string to ItemType.WEAPON', () => {
      // Act
      const result = (loader as any).parseItemType('WEAPON');

      // Assert
      expect(result).toBe(ItemType.WEAPON);
    });
  });

  describe('Case sensitivity handling', () => {
    it('should handle lowercase input correctly', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType('tool')).toThrow('Invalid item type: tool');
      expect(() => (loader as any).parseItemType('treasure')).toThrow('Invalid item type: treasure');
      expect(() => (loader as any).parseItemType('container')).toThrow('Invalid item type: container');
      expect(() => (loader as any).parseItemType('weapon')).toThrow('Invalid item type: weapon');
    });

    it('should handle mixed case input correctly', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType('Tool')).toThrow('Invalid item type: Tool');
      expect(() => (loader as any).parseItemType('Treasure')).toThrow('Invalid item type: Treasure');
      expect(() => (loader as any).parseItemType('Container')).toThrow('Invalid item type: Container');
      expect(() => (loader as any).parseItemType('Weapon')).toThrow('Invalid item type: Weapon');
    });
  });

  describe('Invalid input handling', () => {
    it('should throw descriptive error for invalid type strings', () => {
      const invalidTypes = [
        'INVALID_TYPE',
        'ARMOR',
        'FOOD',
        'POTION',
        'SPELL',
        'UNKNOWN'
      ];

      invalidTypes.forEach(invalidType => {
        expect(() => (loader as any).parseItemType(invalidType))
          .toThrow(`Invalid item type: ${invalidType}`);
      });
    });

    it('should handle empty string input', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType('')).toThrow('Invalid item type: ');
    });

    it('should handle null and undefined input', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType(null)).toThrow('Invalid item type: null');
      expect(() => (loader as any).parseItemType(undefined)).toThrow('Invalid item type: undefined');
    });

    it('should handle whitespace input', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType('  ')).toThrow('Invalid item type:   ');
      expect(() => (loader as any).parseItemType('\t')).toThrow('Invalid item type: \t');
      expect(() => (loader as any).parseItemType('\n')).toThrow('Invalid item type: \n');
    });

    it('should handle numeric input', () => {
      // Act & Assert
      expect(() => (loader as any).parseItemType('1')).toThrow('Invalid item type: 1');
      expect(() => (loader as any).parseItemType('0')).toThrow('Invalid item type: 0');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'A'.repeat(1000);
      
      // Act & Assert
      expect(() => (loader as any).parseItemType(longString))
        .toThrow(`Invalid item type: ${longString}`);
    });

    it('should handle special characters', () => {
      const specialChars = ['TOOL!', 'TOOL@', 'TOOL#', 'TOOL$', 'TOOL%'];
      
      specialChars.forEach(input => {
        expect(() => (loader as any).parseItemType(input))
          .toThrow(`Invalid item type: ${input}`);
      });
    });

    it('should handle unicode characters', () => {
      const unicodeInputs = ['TØØL', 'TRÉASURE', 'CØNTAINER'];
      
      unicodeInputs.forEach(input => {
        expect(() => (loader as any).parseItemType(input))
          .toThrow(`Invalid item type: ${input}`);
      });
    });
  });

  describe('Authentic Zork type validation', () => {
    it('should accept all valid Zork item types', () => {
      // Based on actual Zork data analysis
      const validZorkTypes = [
        'TOOL',      // 115 instances
        'TREASURE',  // 88 instances  
        'CONTAINER', // 9 instances
        'WEAPON'     // 2 instances
      ];

      validZorkTypes.forEach(type => {
        expect(() => (loader as any).parseItemType(type)).not.toThrow();
        expect((loader as any).parseItemType(type)).toBe(type);
      });
    });

    it('should reject types not found in Zork data', () => {
      const nonZorkTypes = [
        'ARMOR',
        'SHIELD',
        'POTION',
        'SCROLL',
        'WAND',
        'RING',
        'AMULET',
        'FOOD',
        'DRINK',
        'BOOK'
      ];

      nonZorkTypes.forEach(type => {
        expect(() => (loader as any).parseItemType(type))
          .toThrow(`Invalid item type: ${type}`);
      });
    });
  });

  describe('Performance requirements', () => {
    it('should convert types quickly for performance', () => {
      const startTime = performance.now();
      
      // Perform many conversions
      for (let i = 0; i < 1000; i++) {
        (loader as any).parseItemType('TOOL');
        (loader as any).parseItemType('TREASURE');
        (loader as any).parseItemType('CONTAINER');
        (loader as any).parseItemType('WEAPON');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 4000 conversions in under 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});