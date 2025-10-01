/**
 * Basic Move Command Tests - South of House Scene
 * Auto-generated tests for movement functionality from south_of_house
 */

import '../setup';
import { SouthOfHouseTestEnvironment, SouthOfHouseIntegrationTestFactory } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - South of House Scene', () => {
  let testEnv: SouthOfHouseTestEnvironment;
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await SouthOfHouseIntegrationTestFactory.createTestEnvironment();

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
    it('should move west to west_of_house', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyMovementSuccess(result, 'west_of_house');
      expect(moveHelper.getCurrentScene()).toBe('west_of_house');
    });

    it('should move east to behind_house', async () => {
      const result = moveHelper.executeMoveDirection('east');

      moveHelper.verifyMovementSuccess(result, 'behind_house');
      expect(moveHelper.getCurrentScene()).toBe('behind_house');
    });

    it('should move south to forest_2', async () => {
      const result = moveHelper.executeMoveDirection('south');

      moveHelper.verifyMovementSuccess(result, 'forest_2');
      expect(moveHelper.getCurrentScene()).toBe('forest_2');
    });

  });

  describe('Blocked Exits', () => {
    it('should always block north exit', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("The windows are all barred.");
      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
    });

  });

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
      const result = moveHelper.executeMoveDirection('west');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, 'west_of_house');
    });

    it('should count as move even on blocked movement', async () => {
      const result = moveHelper.executeMoveDirection('north');

      moveHelper.verifyCountsAsMove(result);
    });
  });

  describe('Command Variations', () => {
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('west');
      moveHelper.verifyMovementSuccess(result, 'west_of_house');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('west');
      moveHelper.verifyMovementSuccess(result, 'west_of_house');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', 'west');
      moveHelper.verifyMovementSuccess(result, 'west_of_house');
    });
  });

  describe('Scene Consistency', () => {
    it('should remain in south_of_house after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('south_of_house');
    });

    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('west');

      expect(moveHelper.getCurrentScene()).toBe('west_of_house');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('west_of_house')).toBe(true);
    });
  });
});
