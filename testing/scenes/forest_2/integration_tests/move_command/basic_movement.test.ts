/**
 * Basic Move Command Tests - Forest Scene
 * Auto-generated tests for movement functionality from forest_2
 */

import '../setup';
import { Forest2TestEnvironment, Forest2IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Forest Scene', () => {
  let testEnv: Forest2TestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await Forest2IntegrationTestFactory.createTestEnvironment();

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
    it('should move north to south_of_house', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'south_of_house');
      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
    });

    it('should move east to clearing', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'clearing');
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should move south to forest_4', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'forest_4');
      expect(moveHelper.getCurrentScene()).toBe('forest_4');
    });

    it('should move west to forest_1', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'forest_1');
      expect(moveHelper.getCurrentScene()).toBe('forest_1');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block up exit', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("You can't go up from here.");
      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'south_of_house');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('north');
      moveHelper.verifyMovementSuccess(result, 'south_of_house');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('north');
      moveHelper.verifyMovementSuccess(result, 'south_of_house');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'north');
      moveHelper.verifyMovementSuccess(result, 'south_of_house');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in forest_2 after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('north');

      expect(moveHelper.getCurrentScene()).toBe('south_of_house');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('south_of_house')).toBe(true);
    });
  });
});
