/**
 * Basic Move Command Tests - Reservoir Scene
 * Auto-generated tests for movement functionality from reservoir
 */

import '../setup';
import { ReservoirTestEnvironment, ReservoirIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Reservoir Scene', () => {
  let testEnv: ReservoirTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await ReservoirIntegrationTestFactory.createTestEnvironment();

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
    it('should move north to resen', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'resen');
      expect(moveHelper.getCurrentScene()).toBe('resen');
    });

    it('should move up to instr', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyMovementSuccess(result, 'instr');
      expect(moveHelper.getCurrentScene()).toBe('instr');
    });

  });

  describe('Conditional Exits', () => {
    it('should block south exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('egypt_flag', false);

      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The passage is too steep for carrying the coffin.");
      expect(moveHelper.getCurrentScene()).toBe('reservoir');
    });

    it('should allow south exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('egypt_flag', true);

      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'reses');
      expect(moveHelper.getCurrentScene()).toBe('reses');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block down exit', async () => {
      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The dam blocks your way.");
      expect(moveHelper.getCurrentScene()).toBe('reservoir');
    });

    it('should always block land exit', async () => {
      const result = moveHelper.executeMoveDirection('land');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("You can't go land from here.");
      expect(moveHelper.getCurrentScene()).toBe('reservoir');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'resen');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('north');
      moveHelper.verifyMovementSuccess(result, 'resen');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('north');
      moveHelper.verifyMovementSuccess(result, 'resen');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'north');
      moveHelper.verifyMovementSuccess(result, 'resen');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in reservoir after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('reservoir');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('north');

      expect(moveHelper.getCurrentScene()).toBe('resen');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('resen')).toBe(true);
    });
  });
});
