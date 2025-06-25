/**
 * Unit tests for ItemDataLoader.validateIndexData() method
 * Tests validation for flat item index JSON structure
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';

describe('ItemDataLoader.validateIndexData()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Valid index data scenarios', () => {
    it('should validate complete index data successfully', () => {
      // Arrange
      const validIndex = {
        items: ['coin.json', 'gem.json', 'lamp.json', 'box.json'],
        total: 4,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should validate minimal index data', () => {
      // Arrange
      const minimalIndex = {
        items: [],
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(minimalIndex)).not.toThrow();
    });

    it('should validate single item index', () => {
      // Arrange
      const singleItemIndex = {
        items: ['lamp.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(singleItemIndex)).not.toThrow();
    });

    it('should validate authentic Zork flat structure', () => {
      // Arrange
      const zorkIndex = {
        items: Array.from({ length: 214 }, (_, i) => `item_${i}.json`),
        total: 214,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(zorkIndex)).not.toThrow();
    });
  });

  describe('Missing required fields', () => {
    it('should throw error for missing items field', () => {
      // Arrange
      const invalidIndex = { 
        total: 5,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have items array');
    });

    it('should throw error for missing total field', () => {
      // Arrange
      const invalidIndex = { 
        items: [],
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have total number');
    });

    it('should validate both required fields', () => {
      const requiredFields = ['items', 'total'];

      requiredFields.forEach(field => {
        const validIndex = {
          items: ['test.json'],
          total: 1,
          lastUpdated: '2024-06-25T00:00:00Z'
        };
        delete (validIndex as any)[field];

        expect(() => (loader as any).validateIndexData(validIndex))
          .toThrow(field === 'items' ? 'Index data must have items array' : 'Index data must have total number');
      });
    });
  });

  describe('Field type validation', () => {
    it('should throw error for non-array items', () => {
      // Arrange
      const invalidIndex = {
        items: 'invalid',
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have items array');
    });

    it('should throw error for non-number total', () => {
      // Arrange
      const invalidIndex = {
        items: [],
        total: 'invalid',
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have total number');
    });

    it('should throw error for object items field', () => {
      // Arrange
      const invalidIndex = {
        items: { notAnArray: true },
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have items array');
    });

    it('should throw error for null items', () => {
      // Arrange
      const invalidIndex = {
        items: null,
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(invalidIndex))
        .toThrow('Index data must have items array');
    });
  });

  describe('Items array validation', () => {
    it('should validate array of strings', () => {
      // Arrange
      const validIndex = {
        items: ['lamp.json', 'rope.json', 'coin.json'],
        total: 3,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should validate empty items array', () => {
      // Arrange
      const validIndex = {
        items: [],
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should allow any string in items array', () => {
      // Arrange - File content validation happens during loading, not index validation
      const validIndex = {
        items: ['valid.json', '', 'special-chars_123.json'],
        total: 3,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });
  });

  describe('Total field validation', () => {
    it('should allow zero total', () => {
      // Arrange
      const validIndex = {
        items: [],
        total: 0,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should allow positive total', () => {
      // Arrange
      const validIndex = {
        items: ['lamp.json'],
        total: 1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should allow negative total', () => {
      // Arrange - The implementation only checks if total is a number
      const validIndex = {
        items: [],
        total: -1,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });

    it('should allow large total values', () => {
      // Arrange
      const validIndex = {
        items: Array.from({ length: 1000 }, (_, i) => `item_${i}.json`),
        total: 1000,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      // Act & Assert
      expect(() => (loader as any).validateIndexData(validIndex)).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle null input', () => {
      // Act & Assert
      expect(() => (loader as any).validateIndexData(null))
        .toThrow('Index data must be an object');
    });

    it('should handle undefined input', () => {
      // Act & Assert
      expect(() => (loader as any).validateIndexData(undefined))
        .toThrow('Index data must be an object');
    });

    it('should handle empty object', () => {
      // Act & Assert
      expect(() => (loader as any).validateIndexData({}))
        .toThrow('Index data must have items array');
    });

    it('should handle arrays as input', () => {
      // Act & Assert - Arrays are objects in JavaScript, but don't have items property
      expect(() => (loader as any).validateIndexData([]))
        .toThrow('Index data must have items array');
    });

    it('should handle primitive types as input', () => {
      const primitives = ['string', 123, true, false];

      primitives.forEach(primitive => {
        expect(() => (loader as any).validateIndexData(primitive))
          .toThrow('Index data must be an object');
      });
    });
  });

  describe('Performance requirements', () => {
    it('should validate large dataset efficiently', () => {
      // Arrange
      const largeIndex = {
        items: Array.from({ length: 214 }, (_, i) => `item_${i}.json`),
        total: 214,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const startTime = performance.now();

      // Act
      expect(() => (loader as any).validateIndexData(largeIndex)).not.toThrow();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(50); // Should validate large dataset in under 50ms
    });

    it('should validate index data quickly for performance', () => {
      // Arrange
      const testIndex = {
        items: ['lamp.json', 'rope.json', 'coin.json'],
        total: 3,
        lastUpdated: '2024-06-25T00:00:00Z'
      };

      const startTime = performance.now();

      // Act - Perform many validations
      for (let i = 0; i < 1000; i++) {
        (loader as any).validateIndexData(testIndex);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(100); // Should complete 1000 validations in under 100ms
    });
  });
});