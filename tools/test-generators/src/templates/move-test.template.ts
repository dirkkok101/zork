export const moveTestTemplate = `/**
 * Basic Move Command Tests - {{title}} Scene
 * Auto-generated tests for movement functionality from {{id}}
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { MoveCommandHelper } from '@testing/helpers/MoveCommandHelper';

describe('Move Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let moveHelper: MoveCommandHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    moveHelper = new MoveCommandHelper(
      testEnv.commandProcessor,
      testEnv.services.gameState as any,
      testEnv.services.scene as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

{{#if exits.simple}}
  describe('Simple Movement', () => {
{{#each exits.simple}}
    it('should move {{this.direction}} to {{this.to}}', async () => {
      const result = moveHelper.executeMoveDirection('{{this.direction}}');

      moveHelper.verifyMovementSuccess(result, '{{this.to}}');
      expect(moveHelper.getCurrentScene()).toBe('{{this.to}}');
    });

{{/each}}
  });
{{/if}}

{{#if exits.conditional}}
  describe('Conditional Exits', () => {
{{#each exits.conditional}}
    it('should block {{this.direction}} exit when condition not met', async () => {
      // Ensure condition flag is not set
      testEnv.services.gameState.setFlag('{{this.condition}}', false);

      const result = moveHelper.executeMoveDirection('{{this.direction}}');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("{{{this.failureMessage}}}");
      expect(moveHelper.getCurrentScene()).toBe('{{../id}}');
    });

    it('should allow {{this.direction}} exit when condition is met', async () => {
      // Set the condition flag
      testEnv.services.gameState.setFlag('{{this.condition}}', true);

      const result = moveHelper.executeMoveDirection('{{this.direction}}');

      moveHelper.verifyMovementSuccess(result, '{{this.to}}');
      expect(moveHelper.getCurrentScene()).toBe('{{this.to}}');
    });

{{/each}}
  });
{{/if}}

{{#if exits.blocked}}
  describe('Blocked Exits', () => {
{{#each exits.blocked}}
    it('should always block {{this.direction}} exit', async () => {
      const result = moveHelper.executeMoveDirection('{{this.direction}}');

      moveHelper.verifyBlockedExit(result);
      expect(result.message).toContain("{{{this.failureMessage}}}");
      expect(moveHelper.getCurrentScene()).toBe('{{../id}}');
    });

{{/each}}
  });
{{/if}}

  describe('Movement Mechanics', () => {
    it('should count as move on successful movement', async () => {
{{#if exits.simple}}
{{#if (gt exits.simple.length 0)}}
      const result = moveHelper.executeMoveDirection('{{exits.simple.[0].direction}}');

      moveHelper.verifyCountsAsMove(result);
      moveHelper.verifyMovementSuccess(result, '{{exits.simple.[0].to}}');
{{else}}
      // No simple exits, skip this test for this scene
      expect(true).toBe(true);
{{/if}}
{{else}}
      // No simple exits, skip this test for this scene
      expect(true).toBe(true);
{{/if}}
    });

    it('should count as move even on blocked movement', async () => {
{{#if exits.blocked}}
      const result = moveHelper.executeMoveDirection('{{exits.blocked.[0].direction}}');

      moveHelper.verifyCountsAsMove(result);
{{else}}
      // No blocked exits, skip this test for this scene
      expect(true).toBe(true);
{{/if}}
    });
  });

  describe('Command Variations', () => {
{{#if exits.simple}}
{{#if (gt exits.simple.length 0)}}
    it('should accept directional command', async () => {
      const result = moveHelper.executeMoveDirection('{{exits.simple.[0].direction}}');
      moveHelper.verifyMovementSuccess(result, '{{exits.simple.[0].to}}');
    });

    it('should accept "go {direction}" command', async () => {
      const result = moveHelper.executeMoveWithGo('{{exits.simple.[0].direction}}');
      moveHelper.verifyMovementSuccess(result, '{{exits.simple.[0].to}}');
    });

    it('should accept "move {direction}" command', async () => {
      const result = moveHelper.executeMoveWith('move', '{{exits.simple.[0].direction}}');
      moveHelper.verifyMovementSuccess(result, '{{exits.simple.[0].to}}');
    });
{{/if}}
{{/if}}
  });

  describe('Scene Consistency', () => {
    it('should remain in {{id}} after invalid movement', async () => {
      // Try to move in a direction with no exit
      moveHelper.executeMoveDirection('invalid');

      expect(moveHelper.getCurrentScene()).toBe('{{id}}');
    });

{{#if exits.simple}}
{{#if (gt exits.simple.length 0)}}
    it('should properly update scene after successful movement', async () => {
      moveHelper.executeMoveDirection('{{exits.simple.[0].direction}}');

      expect(moveHelper.getCurrentScene()).toBe('{{exits.simple.[0].to}}');

      // Scene should be marked as visited
      expect(moveHelper.hasVisitedScene('{{exits.simple.[0].to}}')).toBe(true);
    });
{{/if}}
{{/if}}
  });
});
`;
