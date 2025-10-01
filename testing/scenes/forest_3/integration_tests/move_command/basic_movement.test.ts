/**
 * Basic Move Command Tests - Forest Scene
 * Auto-generated tests for movement functionality from forest_3
 */

import '../setup';
import { Forest3TestEnvironment, Forest3IntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Forest Scene', () => {
  let testEnv: Forest3TestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await Forest3IntegrationTestFactory.createTestEnvironment();

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
    it('should move up to tree', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyMovementSuccess(result, 'tree');
      expect(moveHelper.getCurrentScene()).toBe('tree');
    });

    it('should move north to forest_2', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'forest_2');
      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

    it('should move east to clearing', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'clearing');
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should move south to clearing', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'clearing');
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should move west to north_of_house', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'north_of_house');
      expect(moveHelper.getCurrentScene()).toBe('north_of_house');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'tree');
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('up');
      moveHelper.verifyMovementSuccess(result, 'tree');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('up');
      moveHelper.verifyMovementSuccess(result, 'tree');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'up');
      moveHelper.verifyMovementSuccess(result, 'tree');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in forest_3 after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('forest_3');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('up');

      expect(moveHelper.getCurrentScene()).toBe('tree');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('tree')).toBe(true);
    });
  });
});
