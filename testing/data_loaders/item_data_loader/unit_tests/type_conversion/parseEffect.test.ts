/**
 * Unit tests for ItemDataLoader.parseEffect() method
 * Tests flag-based effect parsing for game logic
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';

describe('ItemDataLoader.parseEffect()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Basic effect parsing', () => {
    it('should parse simple effect correctly', () => {
      // Act
      const result = (loader as any).parseEffect('set_visible');

      // Assert
      expect(result).toEqual(['set_visible']);
    });

    it('should parse state change effects', () => {
      // Act
      const result = (loader as any).parseEffect('state.open=true');

      // Assert
      expect(result).toEqual(['set', 'state.open', 'true']);
    });

    it('should parse flag setting effects', () => {
      // Act
      const result = (loader as any).parseEffect('flags.portable=false');

      // Assert
      expect(result).toEqual(['set', 'flags.portable', 'false']);
    });

    it('should parse player state effects', () => {
      // Act
      const result = (loader as any).parseEffect('player.has_key=true');

      // Assert
      expect(result).toEqual(['set', 'player.has_key', 'true']);
    });
  });

  describe('State modification effects', () => {
    it('should handle boolean state changes', () => {
      const booleanEffects = [
        { input: 'state.open=true', expected: ['set', 'state.open', 'true'] },
        { input: 'state.locked=false', expected: ['set', 'state.locked', 'false'] },
        { input: 'state.lit=true', expected: ['set', 'state.lit', 'true'] },
        { input: 'state.visible=false', expected: ['set', 'state.visible', 'false'] }
      ];

      booleanEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });

    it('should handle numeric state changes', () => {
      const numericEffects = [
        { input: 'state.count=5', expected: ['set', 'state.count', '5'] },
        { input: 'state.level=1', expected: ['set', 'state.level', '1'] },
        { input: 'player.score=100', expected: ['set', 'player.score', '100'] },
        { input: 'item.weight=15', expected: ['set', 'item.weight', '15'] }
      ];

      numericEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });

    it('should handle string state changes', () => {
      const stringEffects = [
        { input: 'state.description="opened chest"', expected: ['set', 'state.description', '"opened chest"'] },
        { input: 'player.location="kitchen"', expected: ['set', 'player.location', '"kitchen"'] },
        { input: 'item.name="magic lamp"', expected: ['set', 'item.name', '"magic lamp"'] }
      ];

      stringEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Flag-based effects', () => {
    it('should parse flag modification effects', () => {
      const flagEffects = [
        { input: 'flags.portable=true', expected: ['set', 'flags.portable', 'true'] },
        { input: 'flags.visible=false', expected: ['set', 'flags.visible', 'false'] },
        { input: 'flags.takeable=true', expected: ['set', 'flags.takeable', 'true'] },
        { input: 'flags.consumable=false', expected: ['set', 'flags.consumable', 'false'] }
      ];

      flagEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });

    it('should handle complex flag paths', () => {
      const complexFlagEffects = [
        { input: 'game.flags.dungeon_accessible=true', expected: ['set', 'game.flags.dungeon_accessible', 'true'] },
        { input: 'monster.troll.flags.defeated=true', expected: ['set', 'monster.troll.flags.defeated', 'true'] },
        { input: 'treasure.chest.flags.unlocked=true', expected: ['set', 'treasure.chest.flags.unlocked', 'true'] }
      ];

      complexFlagEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Action-based effects', () => {
    it('should parse action effects without parameters', () => {
      const actionEffects = [
        'show_message',
        'update_score',
        'trigger_event',
        'move_to_inventory'
      ];

      actionEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result).toEqual([effect]);
      });
    });

    it('should handle action effects with parameters', () => {
      const parameterizedEffects = [
        'show_message("You opened the chest")',
        'update_score(10)',
        'move_item("lamp", "inventory")',
        'trigger_event("door_opened")'
      ];

      parameterizedEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result).toEqual([effect]);
      });
    });
  });

  describe('Authentic Zork effects', () => {
    it('should handle typical Zork game effects', () => {
      const zorkEffects = [
        { input: 'state.open=true', expected: ['set', 'state.open', 'true'] },
        { input: 'state.lit=true', expected: ['set', 'state.lit', 'true'] },
        { input: 'flags.portable=false', expected: ['set', 'flags.portable', 'false'] },
        { input: 'player.has_light=true', expected: ['set', 'player.has_light', 'true'] },
        { input: 'scene.visited=true', expected: ['set', 'scene.visited', 'true'] },
        { input: 'show_description', expected: ['show_description'] },
        { input: 'update_inventory', expected: ['update_inventory'] }
      ];

      zorkEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });

    it('should handle Zork item state changes', () => {
      const itemStateEffects = [
        { input: 'state.on=true', expected: ['set', 'state.on', 'true'] },      // lamp turning on
        { input: 'state.empty=true', expected: ['set', 'state.empty', 'true'] },   // container emptied
        { input: 'state.broken=true', expected: ['set', 'state.broken', 'true'] },  // item damaged
        { input: 'state.used=true', expected: ['set', 'state.used', 'true'] },    // consumable used
        { input: 'state.hidden=false', expected: ['set', 'state.hidden', 'false'] }  // item revealed
      ];

      itemStateEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });

    it('should handle Zork location effects', () => {
      const locationEffects = [
        { input: 'player.location="kitchen"', expected: ['set', 'player.location', '"kitchen"'] },
        { input: 'item.location="inventory"', expected: ['set', 'item.location', '"inventory"'] },
        { input: 'move_to("living_room")', expected: ['move_to("living_room")'] },
        { input: 'reveal_exit("north")', expected: ['reveal_exit("north")'] }
      ];

      locationEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string effect', () => {
      // Act
      const result = (loader as any).parseEffect('');

      // Assert
      expect(result).toEqual(['']);
    });

    it('should handle effects with spaces', () => {
      // Act
      const result = (loader as any).parseEffect('effect with spaces');

      // Assert
      expect(result).toEqual(['effect with spaces']);
    });

    it('should handle special characters in effects', () => {
      const specialEffects = [
        'effect-with-dashes',
        'effect_with_underscores',
        'effect.with.dots',
        'effect@with#special$chars'
      ];

      specialEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result).toEqual([effect]);
      });
    });

    it('should handle complex assignment expressions', () => {
      const complexEffects = [
        'state.count+=1',
        'player.score-=5',
        'item.weight*=2',
        'state.level/=2'
      ];

      complexEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result).toEqual([effect]);
      });
    });

    it('should handle quoted string values', () => {
      const quotedEffects = [
        { input: 'state.message="Hello World"', expected: ['set', 'state.message', '"Hello World"'] },
        { input: "state.name='single quotes'", expected: ['set', 'state.name', "'single quotes'"] },
        { input: 'show_message("You found a treasure!")', expected: ['show_message("You found a treasure!")'] }
      ];

      quotedEffects.forEach(({ input, expected }) => {
        const result = (loader as any).parseEffect(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Multiple effects handling', () => {
    it('should handle single effect consistently', () => {
      // Effects are parsed individually, not as comma-separated lists
      const singleEffect = 'state.open=true';
      
      const result = (loader as any).parseEffect(singleEffect);
      expect(result).toEqual(['set', 'state.open', 'true']);
    });

    it('should preserve complex effect syntax', () => {
      const complexEffect = 'trigger_event("chest_opened", { item: "treasure", location: "dungeon" })';
      
      const result = (loader as any).parseEffect(complexEffect);
      expect(result).toEqual([complexEffect]);
    });
  });

  describe('Performance requirements', () => {
    it('should parse effects quickly for performance', () => {
      const startTime = performance.now();
      
      const effects = [
        'state.open=true',
        'flags.portable=false',
        'player.has_key=true',
        'show_message("test")',
        'update_score(10)'
      ];
      
      // Perform many parsing operations
      for (let i = 0; i < 1000; i++) {
        effects.forEach(effect => {
          (loader as any).parseEffect(effect);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 5000 effect parses in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Data structure consistency', () => {
    it('should always return array format', () => {
      const testEffects = [
        { input: 'simple', expectedLength: 1 },
        { input: 'state.change=true', expectedLength: 3 },
        { input: 'complex.nested.effect=value', expectedLength: 3 },
        { input: '', expectedLength: 1 },
        { input: 'with spaces', expectedLength: 1 },
        { input: 'action(parameters)', expectedLength: 1 }
      ];

      testEffects.forEach(({ input, expectedLength }) => {
        const result = (loader as any).parseEffect(input);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(expectedLength);
      });
    });

    it('should preserve exact effect syntax', () => {
      const preciseEffects = [
        'state.count += 1',
        'player.score -= 5',
        'show_message("Exact text with spaces")',
        'trigger_event("event_name", { data: "value" })'
      ];

      preciseEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result[0]).toBe(effect);
      });
    });
  });
});