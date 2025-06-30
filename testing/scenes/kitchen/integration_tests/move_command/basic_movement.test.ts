/**
 * Kitchen Scene - Move Command Integration Tests
 * Tests all aspects of movement in the kitchen scene
 */

import '../look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Move Command Integration', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Valid Movement Directions', () => {
    it('west movement from kitchen to living room succeeds', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('west');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('w (west abbreviation) movement works', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('w');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('up movement from kitchen to attic succeeds', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('up');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'attic');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('u (up abbreviation) movement works', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('u');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'attic');
    });
  });

  describe('Window-Dependent Movement', () => {
    it('east movement fails when window is closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('east');
      
      testEnv.moveCommandHelper.verifyWindowClosed(result);
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1); // Failed moves still count
    });

    it('out movement fails when window is closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('out');
      
      testEnv.moveCommandHelper.verifyWindowClosed(result);
    });

    it('east movement succeeds when window is open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('east');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'behind_house');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
    });

    it('out movement succeeds when window is open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('out');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'behind_house');
    });

    it('e (east abbreviation) works when window is open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const result = testEnv.moveCommandHelper.executeMoveDirection('e');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'behind_house');
    });
  });

  describe('Blocked Movement Directions', () => {
    it('north movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('north');
      
      testEnv.moveCommandHelper.verifyFailure(result);
      testEnv.moveCommandHelper.verifyCountsAsMove(result);
    });

    it('south movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('south');
      
      testEnv.moveCommandHelper.verifyFailure(result);
      testEnv.moveCommandHelper.verifyCountsAsMove(result);
    });

    it('in movement is blocked', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('in');
      
      testEnv.moveCommandHelper.verifyFailure(result);
      testEnv.moveCommandHelper.verifyCountsAsMove(result);
    });

    it('down movement blocked with chimney message', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('down');
      
      testEnv.moveCommandHelper.verifyBlockedExit(result, 'Only Santa Claus climbs down chimneys');
    });

    it('d (down abbreviation) blocked with chimney message', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('d');
      
      testEnv.moveCommandHelper.verifyBlockedExit(result, 'Only Santa Claus climbs down chimneys');
    });
  });

  describe('Movement Command Variations', () => {
    it('go west command works', () => {
      const result = testEnv.moveCommandHelper.executeMoveWithGo('west');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('move west command works', () => {
      const result = testEnv.moveCommandHelper.executeMoveWith('move', 'west');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('walk west command works', () => {
      const result = testEnv.moveCommandHelper.executeMoveWith('walk', 'west');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('travel west command works', () => {
      const result = testEnv.moveCommandHelper.executeMoveWith('travel', 'west');
      
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('all movement aliases work for up direction', () => {
      testEnv.moveCommandHelper.verifyMovementAliases('up', 'attic');
    });
  });

  describe('Direction Abbreviations', () => {
    it('west and w abbreviation both work', () => {
      testEnv.moveCommandHelper.verifyDirectionAbbreviations('west', 'w', 'living_room');
    });

    it('up and u abbreviation both work', () => {
      testEnv.moveCommandHelper.verifyDirectionAbbreviations('up', 'u', 'attic');
    });

    it('east and e abbreviation both work when window open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.moveCommandHelper.verifyDirectionAbbreviations('east', 'e', 'behind_house');
    });
  });

  describe('Round Trip Movement', () => {
    it('kitchen to living room and back', () => {
      testEnv.moveCommandHelper.verifyRoundTrip('west', 'living_room', 'east', 'kitchen');
    });

    it('kitchen to attic and back', () => {
      testEnv.moveCommandHelper.verifyRoundTrip('up', 'attic', 'down', 'kitchen');
    });

    it('kitchen to behind house and back when window open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.moveCommandHelper.verifyRoundTrip('east', 'behind_house', 'west', 'kitchen');
    });

    it('kitchen to behind house via out and back via west when window open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.moveCommandHelper.verifyRoundTrip('out', 'behind_house', 'west', 'kitchen');
    });
  });

  describe('Move Counter Tracking', () => {
    it('successful moves increment counter', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Move west
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Move back east
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
    });

    it('failed moves still increment counter', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Try blocked direction
      testEnv.moveCommandHelper.executeMoveDirection('north');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 1);
      
      // Try blocked window movement
      testEnv.kitchenHelper.setWindowState(false);
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 2);
    });

    it('multiple movements accumulate counter correctly', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Sequence of movements
      testEnv.moveCommandHelper.executeMoveDirection('west');    // +1
      testEnv.moveCommandHelper.executeMoveDirection('east');    // +2
      testEnv.moveCommandHelper.executeMoveDirection('up');      // +3
      testEnv.moveCommandHelper.executeMoveDirection('down');    // +4
      
      testEnv.moveCommandHelper.verifyMoveCountIncreased(initialMoves, 4);
    });
  });

  describe('Invalid Movement Commands', () => {
    it('empty go command fails', () => {
      const result = testEnv.moveCommandHelper.executeMove('go');
      
      testEnv.moveCommandHelper.verifyInvalidDirection(result);
    });

    it('invalid direction fails', () => {
      const result = testEnv.moveCommandHelper.executeMoveDirection('nowhere');
      
      testEnv.moveCommandHelper.verifyFailure(result);
      testEnv.moveCommandHelper.verifyCountsAsMove(result);
    });

    it('nonsensical movement command fails', () => {
      const result = testEnv.moveCommandHelper.executeMove('go backwards');
      
      testEnv.moveCommandHelper.verifyFailure(result);
    });
  });

  describe('Scene State After Movement', () => {
    it('player starts in kitchen', () => {
      testEnv.kitchenHelper.verifyPlayerInScene();
    });

    it('movement to living room changes current scene', () => {
      testEnv.moveCommandHelper.executeMoveDirection('west');
      
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('living_room');
    });

    it('movement to attic changes current scene', () => {
      testEnv.moveCommandHelper.executeMoveDirection('up');
      
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
    });

    it('movement to behind house changes current scene when window open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
    });

    it('failed movement keeps player in kitchen', () => {
      testEnv.moveCommandHelper.executeMoveDirection('north');
      
      testEnv.kitchenHelper.verifyPlayerInScene();
    });
  });

  describe('Movement Integration with Window State', () => {
    it('window state persists across movements', () => {
      // Open window
      testEnv.kitchenHelper.setWindowState(true);
      testEnv.kitchenHelper.verifyWindowState(true);
      
      // Move to living room and back
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      
      // Window should still be open
      testEnv.kitchenHelper.verifyWindowState(true);
      
      // East exit should work
      const result = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'behind_house');
    });

    it('window state affects available exits consistently', () => {
      // Initially closed - east should fail
      testEnv.kitchenHelper.setWindowState(false);
      let result = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(result);
      
      // Open window - east should work
      testEnv.kitchenHelper.setWindowState(true);
      result = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(result, 'behind_house');
      
      // Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('west');
      
      // Close window - east should fail again
      testEnv.kitchenHelper.setWindowState(false);
      result = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(result);
    });
  });

  describe('Available Exits Query', () => {
    it('available exits includes west and up always', () => {
      const exits = testEnv.moveCommandHelper.getAvailableExits();
      const directions = exits.map(exit => exit.direction);
      
      expect(directions).toContain('west');
      expect(directions).toContain('up');
    });

    it('available exits includes east when window is open', () => {
      testEnv.kitchenHelper.setWindowState(true);
      
      const exits = testEnv.moveCommandHelper.getAvailableExits();
      const directions = exits.map(exit => exit.direction);
      
      expect(directions).toContain('east');
    });

    it('available exits excludes east when window is closed', () => {
      testEnv.kitchenHelper.setWindowState(false);
      
      const exits = testEnv.moveCommandHelper.getAvailableExits();
      const directions = exits.map(exit => exit.direction);
      
      expect(directions).not.toContain('east');
    });

    it('direction availability check works correctly', () => {
      expect(testEnv.moveCommandHelper.isDirectionAvailable('west')).toBe(true);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('up')).toBe(true);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('north')).toBe(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('south')).toBe(false);
      
      // East depends on window state
      testEnv.kitchenHelper.setWindowState(false);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('east')).toBe(false);
      
      testEnv.kitchenHelper.setWindowState(true);
      expect(testEnv.moveCommandHelper.isDirectionAvailable('east')).toBe(true);
    });
  });
});