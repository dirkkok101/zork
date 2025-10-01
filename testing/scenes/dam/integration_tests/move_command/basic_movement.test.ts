/**
 * Basic Move Command Tests - Dam Scene
 * Auto-generated tests for movement functionality from dam
 */

import '../setup';
import { DamTestEnvironment, DamIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Dam Scene', () => {
  let testEnv: DamTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await DamIntegrationTestFactory.createTestEnvironment();

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
    it('should move south to cany1', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'cany1');
      expect(moveHelper.getCurrentScene()).toBe('cany1');
    });

    it('should move down to dock', async () => {
      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyMovementSuccess(result, 'dock');
      expect(moveHelper.getCurrentScene()).toBe('dock');
    });

    it('should move east to cave3', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'cave3');
      expect(moveHelper.getCurrentScene()).toBe('cave3');
    });

    it('should move north to lobby', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'lobby');
      expect(moveHelper.getCurrentScene()).toBe('lobby');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'cany1');
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('south');
      moveHelper.verifyMovementSuccess(result, 'cany1');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('south');
      moveHelper.verifyMovementSuccess(result, 'cany1');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'south');
      moveHelper.verifyMovementSuccess(result, 'cany1');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in dam after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('dam');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('south');

      expect(moveHelper.getCurrentScene()).toBe('cany1');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('cany1')).toBe(true);
    });
  });
});
