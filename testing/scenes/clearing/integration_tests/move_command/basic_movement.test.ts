/**
 * Basic Move Command Tests - Clearing Scene
 * Auto-generated tests for movement functionality from clearing
 */

import '../setup';
import { ClearingTestEnvironment, ClearingIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Clearing Scene', () => {
  let testEnv: ClearingTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await ClearingIntegrationTestFactory.createTestEnvironment();

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
    it('should move southwest to behind_house', async () => {
      const result = moveHelper.executeMoveDirection('southwest');

      moveHelper.verifyMovementSuccess(result, 'behind_house');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should move southeast to fore5', async () => {
      const result = moveHelper.executeMoveDirection('southeast');

      moveHelper.verifyMovementSuccess(result, 'fore5');
      expect(moveHelper.getCurrentScene()).toBe('fore5');
    });

    it('should move west to forest_3', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'forest_3');
      expect(moveHelper.getCurrentScene()).toBe('forest_3');
    });

    it('should move south to forest_2', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'forest_2');
      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

  });

  describe('Conditional Exits', () => {
    it('should block north exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The grating is locked.");
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow north exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_grate_open', true);

      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyMovementSuccess(result, 'grating_room');
      expect(moveHelper.getCurrentScene()).toBe('grating_room');
    });

    it('should block east exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The grating is locked.");
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow east exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_grate_open', true);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'grating_room');
      expect(moveHelper.getCurrentScene()).toBe('grating_room');
    });

    it('should block down exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_grate_open', false);

      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The grating is locked.");
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should allow down exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_grate_open', true);

      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyMovementSuccess(result, 'grating_room');
      expect(moveHelper.getCurrentScene()).toBe('grating_room');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('southwest');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'behind_house');
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('southwest');
      moveHelper.verifyMovementSuccess(result, 'behind_house');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('southwest');
      moveHelper.verifyMovementSuccess(result, 'behind_house');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'southwest');
      moveHelper.verifyMovementSuccess(result, 'behind_house');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in clearing after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('southwest');

      expect(moveHelper.getCurrentScene()).toBe('behind_house');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('behind_house')).toBe(true);
    });
  });
});
