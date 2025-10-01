/**
 * Basic Move Command Tests - Kitchen Scene
 * Auto-generated tests for movement functionality from kitchen
 */

import '../setup';
import { KitchenTestEnvironment, KitchenIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - Kitchen Scene', () => {
  let testEnv: KitchenTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();

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
    it('should move west to living_room', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'living_room');
      expect(moveHelper.getCurrentScene()).toBe('living_room');
    });

    it('should move up to attic', async () => {
      const result = moveHelper.executeMoveDirection('up');

      moveHelper.verifyMovementSuccess(result, 'attic');
      expect(moveHelper.getCurrentScene()).toBe('attic');
    });

  });

  describe('Conditional Exits', () => {
    it('should block east exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The windo is closed.");
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow east exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'behind_house');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should block out exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('door_windo_open', false);

      const result = moveHelper.executeMoveDirection('out');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The windo is closed.");
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should allow out exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('door_windo_open', true);

      const result = moveHelper.executeMoveDirection('out');

      moveHelper.verifyMovementSuccess(result, 'behind_house');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block down exit', async () => {
      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("Only Santa Claus climbs down chimneys.");
      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('down');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('west');
      moveHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('west');
      moveHelper.verifyMovementSuccess(result, 'living_room');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'west');
      moveHelper.verifyMovementSuccess(result, 'living_room');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in kitchen after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('kitchen');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('west');

      expect(moveHelper.getCurrentScene()).toBe('living_room');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('living_room')).toBe(true);
    });
  });
});
