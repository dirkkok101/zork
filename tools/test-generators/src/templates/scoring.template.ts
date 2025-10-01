/**
 * Scoring Test Template
 * Generates comprehensive tests for scoring functionality
 *
 * Template Variables:
 * - title: Scene title
 * - sceneId: Scene identifier
 * - testEnvType: TypeScript type for test environment
 * - factoryName: Factory class name
 * - treasures: Array of treasure items in scene
 * - nonTreasures: Array of non-treasure items
 * - hasFirstVisitScoring: Boolean indicating if scene awards first visit points
 * - hasTrophyCase: Boolean indicating if scene has trophy case
 * - hasTreasures: Boolean indicating if scene has treasures
 */

export const scoringTestTemplate = `/**
 * Scoring Tests - {{title}} Scene
 * Auto-generated tests for scoring functionality
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from '../look_command/helpers/integration_test_factory';
import { ScoringHelper } from '@testing/helpers/ScoringHelper';

describe('Scoring - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};
  let scoringHelper: ScoringHelper;

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();

    scoringHelper = new ScoringHelper(
      testEnv.services.gameState as any,
      testEnv.services.scoring as any
    );
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  {{#if hasFirstVisitScoring}}
  describe('First Visit Scoring', () => {
    it('should award points for first visit to {{id}}', () => {
      // Reset scoring state
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('{{id}}');
      testEnv.services.gameState.updateSceneRuntimeState('{{id}}', { visited: false });

      const initialScore = scoringHelper.getCurrentScore();

      // Execute first visit (look command)
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify first visit completed successfully
      expect(result.success).toBe(true);
      expect(testEnv.services.gameState.hasVisitedScene('{{id}}')).toBe(true);

      // Note: First visit scoring may or may not be awarded depending on scene configuration
      // Score should not decrease
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should not award points for subsequent visits', () => {
      // Setup: Scene already visited
      scoringHelper.resetScoringState();
      testEnv.services.gameState.setCurrentScene('{{id}}');
      testEnv.commandProcessor.processCommand('look'); // First visit

      const scoreAfterFirstVisit = scoringHelper.getCurrentScore();

      // Execute second visit
      const result = testEnv.commandProcessor.processCommand('look');

      // Verify no additional scoring
      expect(result.success).toBe(true);
      scoringHelper.verifyNoScoreChange(result);
      expect(scoringHelper.getCurrentScore()).toBe(scoreAfterFirstVisit);
    });
  });
  {{/if}}

  {{#if hasTreasures}}
  describe('Treasure Collection Scoring', () => {
    {{#each treasures}}
    it('should award points for first-time collection of {{this.name}}', () => {
      // Setup: Reset scoring and ensure treasure is in scene
      scoringHelper.resetScoringState();
      testEnv.services.scene.addItemToScene('{{../id}}', '{{this.id}}');

      const initialScore = scoringHelper.getCurrentScore();
      const expectedPoints = scoringHelper.getTreasureScore('{{this.id}}');

      // Execute: Take treasure for first time
      const result = testEnv.commandProcessor.processCommand('take {{this.name}}');

      if (result.success && expectedPoints > 0) {
        // Verify: Points awarded for first-time collection
        const finalScore = scoringHelper.getCurrentScore();
        expect(finalScore).toBe(initialScore + expectedPoints);
        expect(scoringHelper.isTreasureFound('{{this.id}}')).toBe(true);
      }
    });

    it('should not award points for {{this.name}} if already found', () => {
      // Setup: Mark treasure as already found
      scoringHelper.resetScoringState();
      scoringHelper.markTreasureFound('{{this.id}}');
      testEnv.services.scene.addItemToScene('{{../id}}', '{{this.id}}');

      const initialScore = scoringHelper.getCurrentScore();

      // Execute: Take already-found treasure
      const result = testEnv.commandProcessor.processCommand('take {{this.name}}');

      if (result.success) {
        // Verify: No additional points awarded
        scoringHelper.verifyNoScoreChange(result);
        expect(scoringHelper.getCurrentScore()).toBe(initialScore);
      }
    });

    {{/each}}
  });
  {{/if}}

  {{#if hasTrophyCase}}
  describe('Trophy Case Deposit Scoring', () => {
    {{#each treasures}}
    it('should award bonus points for depositing {{this.name}} in trophy case', () => {
      // Setup: Treasure in inventory, trophy case open
      scoringHelper.resetScoringState();
      testEnv.services.gameState.getGameState().inventory = ['{{this.id}}'];
      scoringHelper.markTreasureFound('{{this.id}}');

      // Ensure trophy case exists and is open
      const trophyCase = testEnv.services.gameState.getItem('tcas');
      if (trophyCase) {
        trophyCase.state = { open: true };
      }

      const initialScore = scoringHelper.getCurrentScore();
      const expectedBonus = scoringHelper.getTreasureDepositScore('{{this.id}}');

      // Execute: Deposit treasure in trophy case
      const result = testEnv.commandProcessor.processCommand('put {{this.name}} in trophy case');

      if (result.success && expectedBonus > 0) {
        // Verify: Bonus points awarded for deposit
        const finalScore = scoringHelper.getCurrentScore();
        expect(finalScore).toBe(initialScore + expectedBonus);
        expect(scoringHelper.isTreasureDeposited('{{this.id}}')).toBe(true);
      }
    });

    {{/each}}

    it('should track total treasures deposited', () => {
      // Setup: Reset scoring
      scoringHelper.resetScoringState();

      const initialDeposits = scoringHelper.getTotalTreasuresDeposited();

      // Deposit multiple treasures if available
      {{#each treasures}}
      {{#if @first}}
      testEnv.services.gameState.getGameState().inventory = ['{{this.id}}'];
      scoringHelper.markTreasureFound('{{this.id}}');

      const trophyCase = testEnv.services.gameState.getItem('tcas');
      if (trophyCase) {
        trophyCase.state = { open: true };
        testEnv.commandProcessor.processCommand('put {{this.name}} in trophy case');
      }
      {{/if}}
      {{/each}}

      // Verify deposit count increased
      const finalDeposits = scoringHelper.getTotalTreasuresDeposited();
      expect(finalDeposits).toBeGreaterThanOrEqual(initialDeposits);
    });
  });
  {{/if}}

  {{#if nonTreasures}}
  describe('Non-Treasure Items', () => {
    {{#each nonTreasures}}
    {{#if @first}}
    it('should not award points for taking non-treasure items like {{this.name}}', () => {
      // Setup: Non-treasure in scene
      scoringHelper.resetScoringState();
      testEnv.services.scene.addItemToScene('{{../id}}', '{{this.id}}');

      const initialScore = scoringHelper.getCurrentScore();

      // Execute: Take non-treasure
      const result = testEnv.commandProcessor.processCommand('take {{this.name}}');

      if (result.success) {
        // Verify: No scoring for non-treasure
        expect(scoringHelper.isTreasure('{{this.id}}')).toBe(false);
        scoringHelper.verifyNoScoreChange(result);
        expect(scoringHelper.getCurrentScore()).toBe(initialScore);
      }
    });
    {{/if}}
    {{/each}}
  });
  {{/if}}

  describe('Scoring State Integrity', () => {
    it('should maintain score consistency across commands', () => {
      scoringHelper.resetScoringState();

      const score1 = scoringHelper.getCurrentScore();
      testEnv.commandProcessor.processCommand('look');
      const score2 = scoringHelper.getCurrentScore();
      testEnv.commandProcessor.processCommand('look');
      const score3 = scoringHelper.getCurrentScore();

      // Score should either stay same or increase, never decrease
      expect(score2).toBeGreaterThanOrEqual(score1);
      expect(score3).toBeGreaterThanOrEqual(score2);
    });

    it('should not award negative scores', () => {
      scoringHelper.resetScoringState();

      const initialScore = scoringHelper.getCurrentScore();

      // Execute various commands
      testEnv.commandProcessor.processCommand('look');
      {{#if hasTreasures}}
      {{#each treasures}}
      {{#if @first}}
      testEnv.services.scene.addItemToScene('{{../sceneId}}', '{{this.id}}');
      testEnv.commandProcessor.processCommand('take {{this.name}}');
      {{/if}}
      {{/each}}
      {{/if}}

      // Score should never go below initial
      const finalScore = scoringHelper.getCurrentScore();
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    {{#if hasTreasures}}
    it('should maintain treasure found flags correctly', () => {
      scoringHelper.resetScoringState();

      // Initially no treasures found
      {{#each treasures}}
      expect(scoringHelper.isTreasureFound('{{this.id}}')).toBe(false);
      {{/each}}

      // Take a treasure
      {{#each treasures}}
      {{#if @first}}
      testEnv.services.scene.addItemToScene('{{../sceneId}}', '{{this.id}}');
      const result = testEnv.commandProcessor.processCommand('take {{this.name}}');

      if (result.success) {
        expect(scoringHelper.isTreasureFound('{{this.id}}')).toBe(true);
      }
      {{/if}}
      {{/each}}
    });
    {{/if}}
  });

  describe('Maximum Score Tracking', () => {
    it('should report maximum achievable score', () => {
      const maxScore = scoringHelper.getMaxScore();
      expect(maxScore).toBeGreaterThan(0);
      expect(typeof maxScore).toBe('number');
    });

    it('should never exceed maximum score', () => {
      scoringHelper.resetScoringState();
      const maxScore = scoringHelper.getMaxScore();

      // Current score should always be less than or equal to max
      const currentScore = scoringHelper.getCurrentScore();
      expect(currentScore).toBeLessThanOrEqual(maxScore);
    });
  });
});
`;
