/**
 * Basic Move Command Tests - West of House Scene
 * Auto-generated tests for movement functionality from west_of_house
 */

import '../setup';
import { WestOfHouseTestEnvironment, WestOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - West of House Scene', () => {
  let testEnv: WestOfHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await WestOfHouseIntegrationTestFactory.createTestEnvironment();

    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Simple Movement', () => {
    it('should move north to north_of_house', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'north_of_house');
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
    });

    it('should move south to south_of_house', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'south_of_house');
      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
    });

    it('should move west to forest_1', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'forest_1');
      expect(moveHelper.getCurrentScene()).toBe('forest_1');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block east exit', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The door is locked, and there is evidently no key.");
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('north');
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('north');
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'north');
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in west_of_house after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('north');

      expect(moveHelper.getCurrentScene()).toBe('north_of_house');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('north_of_house')).toBe(true);
    });
  });
});
