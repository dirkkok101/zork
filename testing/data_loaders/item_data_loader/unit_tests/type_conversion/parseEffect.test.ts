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
    it('should return effect string as-is for service parsing', () => {
      // Act
      const result = (loader as any).parseEffect('set_visible');

      // Assert
      expect(result).toBe('set_visible');
    });

    it('should return state change effects as strings', () => {
      // Act
      const result = (loader as any).parseEffect('state.open=true');

      // Assert
      expect(result).toBe('state.open=true');
    });

    it('should return flag setting effects as strings', () => {
      // Act
      const result = (loader as any).parseEffect('flags.portable=false');

      // Assert
      expect(result).toBe('flags.portable=false');
    });

    it('should return player state effects as strings', () => {
      // Act
      const result = (loader as any).parseEffect('player.has_key=true');

      // Assert
      expect(result).toBe('player.has_key=true');
    });
  });

  describe('State modification effects', () => {
    it('should handle boolean state changes', () => {
      const booleanEffects = [
        'state.open=true',
        'state.locked=false',
        'state.lit=true',
        'state.visible=false'
      ];

      booleanEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });

    it('should handle numeric state changes', () => {
      const numericEffects = [
        'state.count=5',
        'state.level=1',
        'player.score=100',
        'item.weight=15'
      ];

      numericEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });

    it('should handle string state changes', () => {
      const stringEffects = [
        'state.description="opened chest"',
        'player.location="kitchen"',
        'item.name="magic lamp"'
      ];

      stringEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('Flag-based effects', () => {
    it('should return flag modification effects as strings', () => {
      const flagEffects = [
        'flags.portable=true',
        'flags.visible=false',
        'flags.takeable=true',
        'flags.consumable=false'
      ];

      flagEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });

    it('should handle complex flag paths', () => {
      const complexFlagEffects = [
        'game.flags.dungeon_accessible=true',
        'monster.troll.flags.defeated=true',
        'treasure.chest.flags.unlocked=true'
      ];

      complexFlagEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('Action-based effects', () => {
    it('should return action effects without parameters as strings', () => {
      const actionEffects = [
        'show_message',
        'update_score',
        'trigger_event',
        'move_to_inventory'
      ];

      actionEffects.forEach(effect => {
        const result = (loader as any).parseEffect(effect);
        expect(result).toBe(effect);
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
        expect(result).toBe(effect);
      });
    });
  });

  describe('Authentic Zork effects', () => {
    it('should handle typical Zork game effects', () => {
      const zorkEffects = [
        'state.open=true',
        'state.lit=true',
        'flags.portable=false',
        'player.has_light=true',
        'scene.visited=true',
        'show_description',
        'update_inventory'
      ];

      zorkEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });

    it('should handle Zork item state changes', () => {
      const itemStateEffects = [
        'state.on=true',      // lamp turning on
        'state.empty=true',   // container emptied
        'state.broken=true',  // item damaged
        'state.used=true',    // consumable used
        'state.hidden=false'  // item revealed
      ];

      itemStateEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });

    it('should handle Zork location effects', () => {
      const locationEffects = [
        'player.location="kitchen"',
        'item.location="inventory"',
        'move_to("living_room")',
        'reveal_exit("north")'
      ];

      locationEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string effect', () => {
      // Act
      const result = (loader as any).parseEffect('');

      // Assert
      expect(result).toBe('');
    });

    it('should handle effects with spaces', () => {
      // Act
      const result = (loader as any).parseEffect('effect with spaces');

      // Assert
      expect(result).toBe('effect with spaces');
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
        expect(result).toBe(effect);
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
        expect(result).toBe(effect);
      });
    });

    it('should handle quoted string values', () => {
      const quotedEffects = [
        'state.message="Hello World"',
        "state.name='single quotes'",
        'show_message("You found a treasure!")'
      ];

      quotedEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('Multiple effects handling', () => {
    it('should handle single effect consistently', () => {
      // Effects are parsed individually, not as comma-separated lists
      const singleEffect = 'state.open=true';
      
      const result = (loader as any).parseEffect(singleEffect);
      expect(result).toBe(singleEffect);
    });

    it('should preserve complex effect syntax', () => {
      const complexEffect = 'trigger_event("chest_opened", { item: "treasure", location: "dungeon" })';
      
      const result = (loader as any).parseEffect(complexEffect);
      expect(result).toBe(complexEffect);
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
    it('should always return string format', () => {
      const testEffects = [
        'simple',
        'state.change=true',
        'complex.nested.effect=value',
        '',
        'with spaces',
        'action(parameters)'
      ];

      testEffects.forEach(input => {
        const result = (loader as any).parseEffect(input);
        expect(typeof result).toBe('string');
        expect(result).toBe(input);
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
        expect(result).toBe(effect);
      });
    });
  });
});