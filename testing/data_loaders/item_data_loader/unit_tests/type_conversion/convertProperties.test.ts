/**
 * Unit tests for ItemDataLoader.convertProperties() method
 * Tests conversion of raw properties to structured ItemProperties interface
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';

describe('ItemDataLoader.convertProperties()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Known property mapping', () => {
    it('should map size property correctly', () => {
      const rawProperties = { size: 15 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ size: 15 });
    });

    it('should map value property correctly', () => {
      const rawProperties = { value: 100 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ value: 100 });
    });

    it('should map treasurePoints property correctly', () => {
      const rawProperties = { treasurePoints: 8 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ treasurePoints: 8 });
    });

    it('should map capacity property correctly', () => {
      const rawProperties = { capacity: 10 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ capacity: 10 });
    });

    it('should map readText property correctly', () => {
      const rawProperties = { readText: 'ZORK I: The Great Underground Empire' };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ readText: 'ZORK I: The Great Underground Empire' });
    });

    it('should map lightTimer property correctly', () => {
      const rawProperties = { lightTimer: 350 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ lightTimer: 350 });
    });

    it('should map matchCount property correctly', () => {
      const rawProperties = { matchCount: 3 };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({ matchCount: 3 });
    });
  });

  describe('Multiple known properties', () => {
    it('should map all known properties when present', () => {
      const rawProperties = {
        size: 15,
        value: 100,
        treasurePoints: 8,
        capacity: 10,
        readText: 'Sample text',
        lightTimer: 350,
        matchCount: 3
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 15,
        value: 100,
        treasurePoints: 8,
        capacity: 10,
        readText: 'Sample text',
        lightTimer: 350,
        matchCount: 3
      });
    });

    it('should map subset of known properties', () => {
      const rawProperties = {
        value: 15,
        treasurePoints: 8,
        lightTimer: 350
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        value: 15,
        treasurePoints: 8,
        lightTimer: 350
      });
    });
  });

  describe('Unknown property preservation', () => {
    it('should preserve unknown properties using index signature', () => {
      const rawProperties = {
        customProperty: 'custom value',
        anotherProp: 42,
        booleanProp: true
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        customProperty: 'custom value',
        anotherProp: 42,
        booleanProp: true
      });
    });

    it('should preserve complex unknown properties', () => {
      const rawProperties = {
        metadata: { created: '2023-01-01', version: 1 },
        tags: ['special', 'rare'],
        coordinates: { x: 10, y: 20 }
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        metadata: { created: '2023-01-01', version: 1 },
        tags: ['special', 'rare'],
        coordinates: { x: 10, y: 20 }
      });
    });
  });

  describe('Mixed known and unknown properties', () => {
    it('should map known properties and preserve unknown ones', () => {
      const rawProperties = {
        size: 15,
        value: 100,
        customFlag: true,
        metadata: { type: 'special' },
        lightTimer: 350,
        description: 'A special item'
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 15,
        value: 100,
        lightTimer: 350,
        customFlag: true,
        metadata: { type: 'special' },
        description: 'A special item'
      });
    });

    it('should not duplicate properties', () => {
      const rawProperties = {
        size: 15,
        value: 100,
        size_backup: 15 // different property name
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 15,
        value: 100,
        size_backup: 15
      });
      
      // Ensure no duplication
      const keys = Object.keys(result);
      expect(keys.filter(k => k === 'size')).toHaveLength(1);
    });
  });

  describe('Authentic Zork properties', () => {
    it('should handle lamp properties from Zork data', () => {
      const rawProperties = {
        size: 15,
        lightTimer: 350
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 15,
        lightTimer: 350
      });
    });

    it('should handle treasure properties from Zork data', () => {
      const rawProperties = {
        value: 15,
        treasurePoints: 8
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        value: 15,
        treasurePoints: 8
      });
    });

    it('should handle container properties', () => {
      const rawProperties = {
        capacity: 20,
        size: 25,
        isContainer: true
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        capacity: 20,
        size: 25,
        isContainer: true
      });
    });

    it('should handle weapon properties', () => {
      const rawProperties = {
        size: 10,
        damage: 5,
        weaponType: 'SWORD'
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 10,
        damage: 5,
        weaponType: 'SWORD'
      });
    });

    it('should handle consumable properties', () => {
      const rawProperties = {
        size: 2,
        nutritionValue: 10,
        consumable: true
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 2,
        nutritionValue: 10,
        consumable: true
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty properties object', () => {
      const rawProperties = {};

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({});
    });

    it('should handle properties with undefined values', () => {
      const rawProperties = {
        size: undefined,
        value: 100,
        customProp: undefined
      };

      const result = (loader as any).convertProperties(rawProperties);

      // undefined values should still be included
      expect(result).toEqual({
        size: undefined,
        value: 100,
        customProp: undefined
      });
    });

    it('should handle properties with null values', () => {
      const rawProperties = {
        size: null,
        value: 100,
        customProp: null
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: null,
        value: 100,
        customProp: null
      });
    });

    it('should handle properties with zero values', () => {
      const rawProperties = {
        size: 0,
        value: 0,
        treasurePoints: 0,
        capacity: 0,
        lightTimer: 0,
        matchCount: 0
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        size: 0,
        value: 0,
        treasurePoints: 0,
        capacity: 0,
        lightTimer: 0,
        matchCount: 0
      });
    });

    it('should handle properties with empty string values', () => {
      const rawProperties = {
        readText: '',
        customString: ''
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(result).toEqual({
        readText: '',
        customString: ''
      });
    });
  });

  describe('Property type preservation', () => {
    it('should preserve number types', () => {
      const rawProperties = {
        size: 15,
        customNumber: 42.5
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(typeof result.size).toBe('number');
      expect(typeof result.customNumber).toBe('number');
      expect(result.size).toBe(15);
      expect(result.customNumber).toBe(42.5);
    });

    it('should preserve string types', () => {
      const rawProperties = {
        readText: 'sample text',
        customString: 'another string'
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(typeof result.readText).toBe('string');
      expect(typeof result.customString).toBe('string');
      expect(result.readText).toBe('sample text');
      expect(result.customString).toBe('another string');
    });

    it('should preserve boolean types', () => {
      const rawProperties = {
        isSpecial: true,
        isHidden: false
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(typeof result.isSpecial).toBe('boolean');
      expect(typeof result.isHidden).toBe('boolean');
      expect(result.isSpecial).toBe(true);
      expect(result.isHidden).toBe(false);
    });

    it('should preserve object types', () => {
      const rawProperties = {
        metadata: { version: 1, author: 'zork' },
        stats: { durability: 100, power: 50 }
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(typeof result.metadata).toBe('object');
      expect(typeof result.stats).toBe('object');
      expect(result.metadata).toEqual({ version: 1, author: 'zork' });
      expect(result.stats).toEqual({ durability: 100, power: 50 });
    });

    it('should preserve array types', () => {
      const rawProperties = {
        effects: ['glow', 'levitate'],
        numbers: [1, 2, 3]
      };

      const result = (loader as any).convertProperties(rawProperties);

      expect(Array.isArray(result.effects)).toBe(true);
      expect(Array.isArray(result.numbers)).toBe(true);
      expect(result.effects).toEqual(['glow', 'levitate']);
      expect(result.numbers).toEqual([1, 2, 3]);
    });
  });

  describe('Performance and consistency', () => {
    it('should handle large property objects efficiently', () => {
      const largeProperties: Record<string, any> = {};
      
      // Create object with many properties
      for (let i = 0; i < 100; i++) {
        largeProperties[`prop${i}`] = `value${i}`;
      }
      
      // Add some known properties
      largeProperties.size = 15;
      largeProperties.value = 100;
      largeProperties.treasurePoints = 8;

      const startTime = performance.now();
      const result = (loader as any).convertProperties(largeProperties);
      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(10);
      
      // Should have all properties
      expect(Object.keys(result)).toHaveLength(103);
      expect(result.size).toBe(15);
      expect(result.value).toBe(100);
      expect(result.treasurePoints).toBe(8);
    });

    it('should return a new object (not modify original)', () => {
      const rawProperties = {
        size: 15,
        value: 100,
        customProp: 'test'
      };

      const result = (loader as any).convertProperties(rawProperties);

      // Should be different objects
      expect(result).not.toBe(rawProperties);
      
      // Modifying result should not affect original
      result.newProp = 'added';
      expect(rawProperties).not.toHaveProperty('newProp');
    });
  });
});