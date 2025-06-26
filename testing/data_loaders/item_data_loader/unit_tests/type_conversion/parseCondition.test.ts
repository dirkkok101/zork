/**
 * Unit tests for ItemDataLoader.parseCondition() method
 * Tests flag-based condition parsing for game logic
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';

describe('ItemDataLoader.parseCondition()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Basic condition parsing', () => {
    it('should return condition string as-is for service parsing', () => {
      // Act
      const result = (loader as any).parseCondition('has_key');

      // Assert
      expect(result).toBe('has_key');
    });

    it('should return negative condition string as-is', () => {
      // Act
      const result = (loader as any).parseCondition('!has_key');

      // Assert
      expect(result).toBe('!has_key');
    });

    it('should handle state-based conditions', () => {
      // Act
      const result = (loader as any).parseCondition('state.open');

      // Assert
      expect(result).toBe('state.open');
    });

    it('should handle negated state conditions', () => {
      // Act
      const result = (loader as any).parseCondition('!state.open');

      // Assert
      expect(result).toBe('!state.open');
    });
  });

  describe('Flag-based conditions', () => {
    it('should return item flag conditions as strings', () => {
      // Act
      const result = (loader as any).parseCondition('flags.portable');

      // Assert
      expect(result).toBe('flags.portable');
    });

    it('should return negated flag conditions as strings', () => {
      // Act
      const result = (loader as any).parseCondition('!flags.portable');

      // Assert
      expect(result).toBe('!flags.portable');
    });

    it('should handle player flag conditions', () => {
      // Act
      const result = (loader as any).parseCondition('player.has_light');

      // Assert
      expect(result).toBe('player.has_light');
    });

    it('should handle scene flag conditions', () => {
      // Act
      const result = (loader as any).parseCondition('scene.dark');

      // Assert
      expect(result).toBe('scene.dark');
    });
  });

  describe('Complex condition structures', () => {
    it('should handle nested property conditions', () => {
      // Act
      const result = (loader as any).parseCondition('inventory.item.lamp.state.on');

      // Assert
      expect(result).toBe('inventory.item.lamp.state.on');
    });

    it('should handle negated nested conditions', () => {
      // Act
      const result = (loader as any).parseCondition('!inventory.item.lamp.state.on');

      // Assert
      expect(result).toBe('!inventory.item.lamp.state.on');
    });

    it('should preserve complex flag paths', () => {
      const complexConditions = [
        'game.state.dungeon.level.accessible',
        'monster.troll.state.defeated',
        'treasure.chest.state.unlocked'
      ];

      complexConditions.forEach(condition => {
        const result = (loader as any).parseCondition(condition);
        expect(result).toBe(condition);
      });
    });
  });

  describe('Authentic Zork conditions', () => {
    it('should handle typical Zork game conditions', () => {
      const zorkConditions = [
        'state.open',
        'state.locked',
        'state.lit',
        'state.dark',
        'player.has_lamp',
        'scene.visited',
        'flags.portable',
        'flags.visible'
      ];

      zorkConditions.forEach(condition => {
        const result = (loader as any).parseCondition(condition);
        expect(result).toBe(condition);
        
        // Test negated version
        const negatedResult = (loader as any).parseCondition(`!${condition}`);
        expect(negatedResult).toBe(`!${condition}`);
      });
    });

    it('should handle Zork-specific state conditions', () => {
      const zorkStates = [
        'state.on',     // lamp state
        'state.open',   // container state
        'state.locked', // door/container state
        'state.alive',  // monster state
        'state.empty'   // container state
      ];

      zorkStates.forEach(state => {
        const result = (loader as any).parseCondition(state);
        expect(result).toBe(state);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string condition', () => {
      // Act
      const result = (loader as any).parseCondition('');

      // Assert
      expect(result).toBe('');
    });

    it('should handle single exclamation condition', () => {
      // Act
      const result = (loader as any).parseCondition('!');

      // Assert
      expect(result).toBe('!');
    });

    it('should handle conditions with spaces', () => {
      // Act
      const result = (loader as any).parseCondition('condition with spaces');

      // Assert
      expect(result).toBe('condition with spaces');
    });

    it('should handle special characters in conditions', () => {
      const specialConditions = [
        'state.item-name',
        'flag_with_underscores',
        'condition.with.many.dots',
        'state@special#chars'
      ];

      specialConditions.forEach(condition => {
        const result = (loader as any).parseCondition(condition);
        expect(result).toBe(condition);
      });
    });

    it('should handle numeric conditions', () => {
      const numericConditions = [
        'level.1',
        'room.42',
        'score.100'
      ];

      numericConditions.forEach(condition => {
        const result = (loader as any).parseCondition(condition);
        expect(result).toBe(condition);
      });
    });
  });

  describe('Negation handling', () => {
    it('should preserve double exclamation as-is', () => {
      // Act
      const result = (loader as any).parseCondition('!!double_negative');

      // Assert
      expect(result).toBe('!!double_negative');
    });

    it('should handle exclamation within condition text', () => {
      // Act
      const result = (loader as any).parseCondition('message.hello!world');

      // Assert
      expect(result).toBe('message.hello!world');
    });

    it('should handle exclamation at end of condition', () => {
      // Act
      const result = (loader as any).parseCondition('exclamation!');

      // Assert
      expect(result).toBe('exclamation!');
    });
  });

  describe('Performance requirements', () => {
    it('should parse conditions quickly for performance', () => {
      const startTime = performance.now();
      
      const conditions = [
        'state.open',
        '!state.locked',
        'flags.portable',
        'player.has_light',
        'scene.visited'
      ];
      
      // Perform many parsing operations
      for (let i = 0; i < 1000; i++) {
        conditions.forEach(condition => {
          (loader as any).parseCondition(condition);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 5000 condition parses in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Data structure consistency', () => {
    it('should always return string format', () => {
      const testConditions = [
        'simple',
        '!negated',
        'complex.nested.condition',
        '',
        'with spaces',
        '123numeric'
      ];

      testConditions.forEach(condition => {
        const result = (loader as any).parseCondition(condition);
        expect(typeof result).toBe('string');
        expect(result).toBe(condition);
      });
    });

    it('should maintain consistent string format', () => {
      const conditions = [
        'simple_condition',
        'complex.nested.condition',
        'state.with.many.levels'
      ];

      conditions.forEach(condition => {
        const positiveResult = (loader as any).parseCondition(condition);
        const negativeResult = (loader as any).parseCondition(`!${condition}`);

        expect(positiveResult).toBe(condition);
        expect(negativeResult).toBe(`!${condition}`);
      });
    });
  });
});