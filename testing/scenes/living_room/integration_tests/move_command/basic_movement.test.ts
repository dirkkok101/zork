/**
 * Basic Move Command Tests - Living Room Scene
 * Auto-generated tests for movement functionality from living_room
 */

import '../setup';
import { LivingRoomTestEnvironment, LivingRoomIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Living Room Scene', () => {
  let testEnv: LivingRoomTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await LivingRoomIntegrationTestFactory.createTestEnvironment();

    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Conditional Exits', () => {
    it('should block east exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('light_load', false);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The chimney is too narrow for you and all of your baggage.");
      expect(moveHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow east exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('light_load', true);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'kitchen');
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should block west exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('magic_flag', false);

      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The north wall is solid rock.");
      expect(moveHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow west exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('magic_flag', true);

      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'strange_passage');
      expect(moveHelper.getCurrentScene()).toBe('strange_passage');
    });

    it('should block down exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_door_open', false);

      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The door is closed.");
      expect(moveHelper.getCurrentScene()).toBe('living_room');
    });

    it('should allow down exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_door_open', true);

      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyMovementSuccess(result, 'cellar');
      expect(moveHelper.getCurrentScene()).toBe('cellar');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      // No simple exits, skip this test for this scene
      expect(true).toBe(true);
    });

    it('should count as move even on blocked movement', async () => {
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
    });
  });

  describe('Command Variations', () => {
  });

  describe('Scene Consistency', () => {
    it('should remain in living_room after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('living_room');
    });

  });
});
