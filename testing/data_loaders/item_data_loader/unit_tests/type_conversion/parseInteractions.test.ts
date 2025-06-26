/**
 * Unit tests for ItemDataLoader.parseInteractions() method
 * Tests interaction parsing including scoreChange and success handling
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemInteractionData } from '../../../../../src/types/ItemData';

describe('ItemDataLoader.parseInteractions()', () => {
  let loader: ItemDataLoader;

  beforeEach(() => {
    loader = new ItemDataLoader('test-path/');
  });

  describe('Basic interaction parsing', () => {
    it('should parse simple interaction correctly', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'examine',
        message: 'You see a lamp.'
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'examine',
        message: 'You see a lamp.'
      });
    });

    it('should parse interaction with condition', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'turn on',
        condition: '!state.lit',
        message: 'The lamp is now on.'
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'turn on',
        condition: '!state.lit',
        message: 'The lamp is now on.'
      });
    });

    it('should parse interaction with effect', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'turn on',
        effect: 'state.lit = true',
        message: 'The lamp is now on.'
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'turn on',
        effect: 'state.lit = true',
        message: 'The lamp is now on.'
      });
    });
  });

  describe('Score change handling', () => {
    it('should include scoreChange when present in data', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'take',
        message: 'You take the treasure.',
        scoreChange: 10
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'take',
        message: 'You take the treasure.',
        scoreChange: 10
      });
    });

    it('should handle zero scoreChange', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'examine',
        message: 'You examine the item.',
        scoreChange: 0
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'examine',
        message: 'You examine the item.',
        scoreChange: 0
      });
    });

    it('should handle negative scoreChange', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'break',
        message: 'You break the valuable item.',
        scoreChange: -5
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'break',
        message: 'You break the valuable item.',
        scoreChange: -5
      });
    });

    it('should omit scoreChange when not present', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'look',
        message: 'You look at the item.'
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'look',
        message: 'You look at the item.'
      });
      expect(result[0]).not.toHaveProperty('scoreChange');
    });
  });

  describe('Success flag handling', () => {
    it('should include success when explicitly true', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'unlock',
        message: 'You successfully unlock the chest.',
        success: true
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'unlock',
        message: 'You successfully unlock the chest.',
        success: true
      });
    });

    it('should include success when explicitly false', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'unlock',
        message: 'The chest remains locked.',
        success: false
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'unlock',
        message: 'The chest remains locked.',
        success: false
      });
    });

    it('should omit success when not present', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'examine',
        message: 'You examine the item.'
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'examine',
        message: 'You examine the item.'
      });
      expect(result[0]).not.toHaveProperty('success');
    });
  });

  describe('Complex interactions', () => {
    it('should parse interaction with all optional properties', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'use key',
        condition: 'player.has_key',
        effect: 'state.unlocked = true',
        message: 'You unlock the chest with the key.',
        scoreChange: 5,
        success: true
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'use key',
        condition: 'player.has_key',
        effect: 'state.unlocked = true',
        message: 'You unlock the chest with the key.',
        scoreChange: 5,
        success: true
      });
    });

    it('should handle multiple interactions', () => {
      const interactionData: ItemInteractionData[] = [
        {
          command: 'examine',
          message: 'A brass lamp.'
        },
        {
          command: 'take',
          message: 'You take the lamp.',
          scoreChange: 2
        },
        {
          command: 'turn on',
          condition: '!state.lit',
          effect: 'state.lit = true',
          message: 'The lamp lights up.',
          success: true
        }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        command: 'examine',
        message: 'A brass lamp.'
      });
      expect(result[1]).toEqual({
        command: 'take',
        message: 'You take the lamp.',
        scoreChange: 2
      });
      expect(result[2]).toEqual({
        command: 'turn on',
        condition: '!state.lit',
        effect: 'state.lit = true',
        message: 'The lamp lights up.',
        success: true
      });
    });
  });

  describe('Authentic Zork interactions', () => {
    it('should handle lamp interactions from Zork data', () => {
      const interactionData: ItemInteractionData[] = [
        {
          command: 'examine',
          message: 'There is a brass lantern (battery-powered) here.'
        },
        {
          command: 'take',
          message: 'You take the lamp.'
        },
        {
          command: 'turn on',
          condition: '!state.lit',
          effect: 'state.lit = true',
          message: 'The LAMP is now on.'
        },
        {
          command: 'turn off',
          condition: 'state.lit',
          effect: 'state.lit = false',
          message: 'The LAMP is now off.'
        }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(4);
      result.forEach((interaction: any, index: number) => {
        const sourceInteraction = interactionData[index];
        if (sourceInteraction) {
          expect(interaction.command).toBe(sourceInteraction.command);
          expect(interaction.message).toBe(sourceInteraction.message);
          if (sourceInteraction.condition) {
            expect(interaction.condition).toBe(sourceInteraction.condition);
          }
          if (sourceInteraction.effect) {
            expect(interaction.effect).toBe(sourceInteraction.effect);
          }
        }
      });
    });

    it('should handle treasure interactions with scoring', () => {
      const interactionData: ItemInteractionData[] = [
        {
          command: 'examine',
          message: 'There is a moby ruby lying here.'
        },
        {
          command: 'take',
          message: 'You take the ruby.',
          scoreChange: 8,
          success: true
        }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        command: 'examine',
        message: 'There is a moby ruby lying here.'
      });
      expect(result[1]).toEqual({
        command: 'take',
        message: 'You take the ruby.',
        scoreChange: 8,
        success: true
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty interactions array', () => {
      const interactionData: ItemInteractionData[] = [];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toEqual([]);
    });

    it('should handle interaction with empty strings', () => {
      const interactionData: ItemInteractionData[] = [{
        command: '',
        message: ''
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: '',
        message: ''
      });
    });

    it('should preserve undefined vs missing properties', () => {
      const interactionData: ItemInteractionData[] = [{
        command: 'test',
        message: 'test message'
        // Don't include undefined properties - they should be omitted
      }];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: 'test',
        message: 'test message'
      });
      // Properties with undefined values should not be included
      expect(result[0]).not.toHaveProperty('scoreChange');
      expect(result[0]).not.toHaveProperty('success');
    });
  });

  describe('Data validation', () => {
    it('should preserve interaction order', () => {
      const interactionData: ItemInteractionData[] = [
        { command: 'first', message: 'First interaction' },
        { command: 'second', message: 'Second interaction' },
        { command: 'third', message: 'Third interaction' }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(3);
      expect(result[0].command).toBe('first');
      expect(result[1].command).toBe('second');
      expect(result[2].command).toBe('third');
    });

    it('should handle various scoreChange types', () => {
      const interactionData: ItemInteractionData[] = [
        { command: 'positive', message: 'msg', scoreChange: 10 },
        { command: 'zero', message: 'msg', scoreChange: 0 },
        { command: 'negative', message: 'msg', scoreChange: -5 },
        { command: 'large', message: 'msg', scoreChange: 1000 }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(4);
      expect(result[0].scoreChange).toBe(10);
      expect(result[1].scoreChange).toBe(0);
      expect(result[2].scoreChange).toBe(-5);
      expect(result[3].scoreChange).toBe(1000);
    });

    it('should handle various success values', () => {
      const interactionData: ItemInteractionData[] = [
        { command: 'succeed', message: 'msg', success: true },
        { command: 'fail', message: 'msg', success: false }
      ];

      const result = (loader as any).parseInteractions(interactionData);

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(false);
    });
  });
});