/**
 * Basic Move Command Tests - Forest Scene
 * Auto-generated tests for movement functionality from forest_4
 */

import '../setup';
import { Forest4TestEnvironment, Forest4IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Forest Scene', () => {
  let testEnv: Forest4TestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await Forest4IntegrationTestFactory.createTestEnvironment();

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
    it('should move east to cltop', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'cltop');
      expect(moveHelper.getCurrentScene()).toBe('cltop');
    });

    it('should move north to fore5', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'fore5');
      expect(moveHelper.getCurrentScene()).toBe('fore5');
    });

    it('should move south to forest_4', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'forest_4');
      expect(moveHelper.getCurrentScene()).toBe('forest_4');
    });

    it('should move west to forest_2', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'forest_2');
      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block up exit', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("You can't go up from here.");
      expect(moveHelper.getCurrentScene()).toBe('forest_4');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'cltop');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('east');
      moveHelper.verifyMovementSuccess(result, 'cltop');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('east');
      moveHelper.verifyMovementSuccess(result, 'cltop');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'east');
      moveHelper.verifyMovementSuccess(result, 'cltop');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in forest_4 after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('forest_4');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('east');

      expect(moveHelper.getCurrentScene()).toBe('cltop');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('cltop')).toBe(true);
    });
  });
});
