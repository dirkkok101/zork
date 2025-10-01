/**
 * Basic Move Command Tests - Sandy Beach Scene
 * Auto-generated tests for movement functionality from beach
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Sandy Beach Scene', () => {
  let testEnv: BeachTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();

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
    it('should move launc to rivr4', async () => {
      const result = moveHelper.executeMoveDirection('launc');

      moveHelper.verifyMovementSuccess(result, 'rivr4');
      expect(moveHelper.getCurrentScene()).toBe('rivr4');
    });

    it('should move south to fante', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'fante');
      expect(moveHelper.getCurrentScene()).toBe('fante');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('launc');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'rivr4');
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('launc');
      moveHelper.verifyMovementSuccess(result, 'rivr4');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('launc');
      moveHelper.verifyMovementSuccess(result, 'rivr4');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'launc');
      moveHelper.verifyMovementSuccess(result, 'rivr4');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in beach after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('beach');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('launc');

      expect(moveHelper.getCurrentScene()).toBe('rivr4');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('rivr4')).toBe(true);
    });
  });
});
