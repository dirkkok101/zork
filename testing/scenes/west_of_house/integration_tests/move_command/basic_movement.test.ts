/**
 * Basic Move Command Tests - West of House Scene
 * Tests movement functionality from the west_of_house scene
 */

import { IntegrationTestEnvironment, IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from './helpers/move_command_helper';

describe('Move Command - West of House Scene', () => {
  let testEnv: IntegrationTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeAll(async () => {
    testEnv = await IntegrationTestFactory.createTestEnvironment();
    
    // Create Move command helper
    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  beforeEach(() => {
    // Reset to west_of_house for each test
    testEnv.westOfHouseHelper.resetScene();
    moveHelper.setCurrentScene('west_of_house');
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Valid Movement from West of House', () => {
    it('should move north to north_of_house', () => {
      moveHelper.verifyMovementBetweenScenes('west_of_house', 'north_of_house', 'north');
    });

    it('should move south to south_of_house', () => {
      moveHelper.verifyMovementBetweenScenes('west_of_house', 'south_of_house', 'south');
    });

    it('should move west to forest_1', () => {
      moveHelper.verifyMovementBetweenScenes('west_of_house', 'forest_1', 'west');
    });

    it('should move north using abbreviation "n"', () => {
      moveHelper.verifyDirectionAbbreviations('north', 'n', 'north_of_house');
    });

    it('should move south using abbreviation "s"', () => {
      moveHelper.verifyDirectionAbbreviations('south', 's', 'south_of_house');
    });

    it('should move west using abbreviation "w"', () => {
      moveHelper.verifyDirectionAbbreviations('west', 'w', 'forest_1');
    });
  });

  describe('Invalid Movement from West of House', () => {
    it('should fail to move east (blocked)', () => {
      const result = moveHelper.executeMoveDirection('east');
      
      moveHelper.verifyFailure(result);
      moveHelper.verifyCountsAsMove(result); // Failed moves still count as moves
      moveHelper.verifyMessageContains(result, 'Only a mouse could get in there');
      // Should remain in west_of_house
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should fail to move up (no exit)', () => {
      const result = moveHelper.executeMoveDirection('up');
      
      moveHelper.verifyNoExit(result, 'up');
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should fail to move down (no exit)', () => {
      const result = moveHelper.executeMoveDirection('down');
      
      moveHelper.verifyNoExit(result, 'down');
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should fail to move in invalid direction', () => {
      const result = moveHelper.executeMoveDirection('northwest');
      
      moveHelper.verifyNoExit(result, 'northwest');
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });
  });

  describe('Movement Command Aliases', () => {
    it('should work with "go north"', () => {
      const result = moveHelper.executeMoveWithGo('north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should work with "move north"', () => {
      const result = moveHelper.executeMoveWith('move', 'north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should work with "walk north"', () => {
      const result = moveHelper.executeMoveWith('walk', 'north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should work with "travel north"', () => {
      const result = moveHelper.executeMoveWith('travel', 'north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should work with "head north"', () => {
      const result = moveHelper.executeMoveWith('head', 'north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should test all movement aliases for valid direction', () => {
      moveHelper.verifyMovementAliases('north', 'north_of_house');
    });
  });

  describe('Direction Command Syntax', () => {
    it('should work with direct "north" command', () => {
      const result = moveHelper.executeMoveDirection('north');
      
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should work with direct "south" command', () => {
      const result = moveHelper.executeMoveDirection('south');
      
      moveHelper.verifyMovementSuccess(result, 'south_of_house');
    });

    it('should work with all direction abbreviations', () => {
      const directions = [
        { full: 'north', abbrev: 'n', destination: 'north_of_house' },
        { full: 'south', abbrev: 's', destination: 'south_of_house' },
        { full: 'west', abbrev: 'w', destination: 'forest_1' }
      ];

      directions.forEach(({ full, abbrev, destination }) => {
        // Ensure we start from west_of_house for each test
        moveHelper.setCurrentScene('west_of_house');
        expect(moveHelper.getCurrentScene()).toBe('west_of_house');
        
        // Test full direction
        const fullResult = moveHelper.executeMoveDirection(full);
        expect(fullResult.success).toBe(true);
        expect(moveHelper.getCurrentScene()).toBe(destination);
        
        // Reset and test abbreviation
        moveHelper.setCurrentScene('west_of_house');
        expect(moveHelper.getCurrentScene()).toBe('west_of_house');
        
        const abbrevResult = moveHelper.executeMoveDirection(abbrev);
        expect(abbrevResult.success).toBe(true);
        expect(moveHelper.getCurrentScene()).toBe(destination);
      });
    });
  });

  describe('Command Properties', () => {
    it('should count successful movement as a move', () => {
      const result = moveHelper.executeMoveDirection('north');
      
      moveHelper.verifyCountsAsMove(result);
    });

    it('should count failed movement as a move', () => {
      const result = moveHelper.executeMoveDirection('east');
      
      moveHelper.verifyCountsAsMove(result);
    });

    it('should provide scene description on successful movement', () => {
      const result = moveHelper.executeMoveDirection('north');
      
      moveHelper.verifySuccess(result);
      expect(result.message.length).toBeGreaterThan(0);
      // Should contain scene title or description
      expect(result.message).toMatch(/north/i);
    });

    it('should provide appropriate failure message on blocked movement', () => {
      const result = moveHelper.executeMoveDirection('east');
      
      moveHelper.verifyFailure(result);
      moveHelper.verifyMessageContains(result, 'Only a mouse could get in there');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty movement command', () => {
      const result = moveHelper.executeMove('go');
      
      moveHelper.verifyInvalidDirection(result);
    });

    it('should handle malformed movement command', () => {
      const result = moveHelper.executeMove('move');
      
      moveHelper.verifyInvalidDirection(result);
    });

    it('should handle completely invalid input', () => {
      const result = moveHelper.executeMove('xyz');
      
      moveHelper.verifyFailure(result);
    });

    it('should handle empty input gracefully', () => {
      const result = moveHelper.executeMove('');
      
      moveHelper.verifyFailure(result);
    });
  });

  describe('Scene Transitions', () => {
    it('should update current scene after successful movement', () => {
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
      
      const result = moveHelper.executeMoveDirection('north');
      
      moveHelper.verifySuccess(result);
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
    });

    it('should not change scene after failed movement', () => {
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
      
      const result = moveHelper.executeMoveDirection('east');
      
      moveHelper.verifyFailure(result);
      moveHelper.verifyCountsAsMove(result); // Failed moves still count
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should handle multiple movements in sequence', () => {
      // Start at west_of_house
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
      
      // Move north to north_of_house
      let result = moveHelper.executeMoveDirection('north');
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
      
      // Move west back to west_of_house (south is blocked from north_of_house)
      result = moveHelper.executeMoveDirection('west');
      moveHelper.verifyMovementSuccess(result, 'west_of_house');
      
      // Move west to forest_1
      result = moveHelper.executeMoveDirection('west');
      moveHelper.verifyMovementSuccess(result, 'forest_1');
    });
  });

  describe('Command Suggestions', () => {
    it('should provide movement suggestions for empty input', () => {
      moveHelper.verifySuggestionsContain(['go', 'north', 'south', 'west']);
    });

    it('should provide direction suggestions based on available exits', () => {
      const suggestions = moveHelper.getSuggestions();
      
      // West of house has north, south, west exits available
      expect(suggestions).toContain('north');
      expect(suggestions).toContain('south');
      expect(suggestions).toContain('west');
    });

    it('should filter suggestions based on input prefix', () => {
      moveHelper.verifySuggestionsContain(['north']);
      moveHelper.verifySuggestionsContain(['south']);
      moveHelper.verifySuggestionsContain(['west']);
    });

    it('should suggest movement commands', () => {
      moveHelper.verifySuggestionsContain(['go']);
      moveHelper.verifySuggestionsContain(['move']);
    });
  });
});