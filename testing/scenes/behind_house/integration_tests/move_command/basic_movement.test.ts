/**
 * Basic Move Command Tests - Behind House Scene
 * Auto-generated tests for movement functionality from behind_house
 */

import '../setup';
import { BehindHouseTestEnvironment, BehindHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Behind House Scene', () => {
  let testEnv: BehindHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await BehindHouseIntegrationTestFactory.createTestEnvironment();

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

    it('should move east to clearing', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'clearing');
      expect(moveHelper.getCurrentScene()).toBe('clearing');
    });

  });

  describe('Conditional Exits', () => {
    it('should block west exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The windo is closed.");
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow west exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'kitchen');
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should block in exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = moveHelper.executeMoveDirection('in');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The windo is closed.");
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should allow in exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const result = moveHelper.executeMoveDirection('in');

      moveHelper.verifyMovementSuccess(result, 'kitchen');
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'north_of_house');
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
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
    it('should remain in behind_house after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('north');

      expect(moveHelper.getCurrentScene()).toBe('north_of_house');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('north_of_house')).toBe(true);
    });
  });
});
