export const lookTestTemplate = `/**
 * Basic Look Command Integration Tests
 * Auto-generated tests for look functionality in {{title}}
 */

import '../setup';
import { {{testEnvType}}, {{factoryName}} } from './helpers/integration_test_factory';

describe('Basic Look Command - {{title}} Scene', () => {
  let testEnv: {{testEnvType}};

  beforeEach(async () => {
    testEnv = await {{factoryName}}.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

{{#if hasFirstVisitPoints}}
  describe('First Visit Look', () => {
    it('should show first visit description on initial look and award {{firstVisitPoints}} {{pluralize firstVisitPoints "point" "points"}}', async () => {
      // Verify this is the first visit
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(true);

      // Get initial score
      const initialScore = testEnv.lookCommandHelper.getCurrentScore();

      // Execute look command
      const result = testEnv.lookCommandHelper.executeBasicLook();

      // Verify first visit description
      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyNoMove(result);

      // Verify first visit scoring
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, {{firstVisitPoints}});

      // Verify scene is now marked as visited
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });

    it('should show first visit description with "look around" and award {{firstVisitPoints}} {{pluralize firstVisitPoints "point" "points"}}', async () => {
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(true);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifyFirstVisitDescription(result);
      testEnv.lookCommandHelper.verifySceneDescription(result);
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
      testEnv.lookCommandHelper.verifyScoreIncrease(initialScore, {{firstVisitPoints}});
      testEnv.lookCommandHelper.verifySceneMarkedVisited();
    });
  });
{{/if}}

  describe('{{#if hasFirstVisitPoints}}Subsequent Visit Look{{else}}Basic Look{{/if}}', () => {
{{#if hasFirstVisitPoints}}
    beforeEach(() => {
      // Mark scene as visited first
      testEnv.{{helperName}}.markAsVisited();
    });
{{/if}}

    it('should show {{#if hasFirstVisitPoints}}regular{{else}}scene{{/if}} description on look', async () => {
{{#if hasFirstVisitPoints}}
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(false);
{{/if}}

      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('{{title}}');
      testEnv.lookCommandHelper.verifyNoMove(result);
{{#if hasFirstVisitPoints}}
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
{{/if}}
    });

    it('should show {{#if hasFirstVisitPoints}}regular{{else}}scene{{/if}} description with "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('{{title}}');
    });
  });

  describe('Exit Display', () => {
    it('should display available exits in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toMatch(/exits?:/i);
{{#each exits.simple}}
      expect(result.message).toContain('{{this.direction}}');
{{/each}}
    });

{{#if exits.simple}}
    it('should verify expected exits are actually available', () => {
      testEnv.{{helperName}}.verifyExpectedExits();
    });
{{/if}}
  });

{{#if hasAtmosphere}}
  describe('Atmospheric Elements', () => {
    it('should verify scene has atmospheric messages', () => {
      testEnv.{{helperName}}.verifyAtmosphere();
    });

    it('should verify scene lighting is {{lighting}}', () => {
      testEnv.{{helperName}}.verifyLighting();
    });

    it('should include scene title in description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      expect(result.message).toContain('{{title}}');
    });
  });
{{/if}}

  describe('State Tracking', () => {
    it('should not increment move counter', async () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();

      testEnv.lookCommandHelper.executeBasicLook();

      const finalMoves = testEnv.lookCommandHelper.getCurrentMoves();
      expect(finalMoves).toBe(initialMoves);
    });

{{#if hasFirstVisitPoints}}
    it('should change score by {{firstVisitPoints}} on first visit', async () => {
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(true);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeBasicLook();

      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore + {{firstVisitPoints}});
      testEnv.lookCommandHelper.verifyFirstVisitScoring(result);
    });

    it('should set visited flag after first look', async () => {
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(true);

      testEnv.lookCommandHelper.executeBasicLook();

      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(false);
    });

    it('should not award points on subsequent looks', async () => {
      testEnv.{{helperName}}.markAsVisited();
      expect(testEnv.{{helperName}}.isFirstVisit()).toBe(false);

      const initialScore = testEnv.lookCommandHelper.getCurrentScore();
      const result = testEnv.lookCommandHelper.executeBasicLook();

      const finalScore = testEnv.lookCommandHelper.getCurrentScore();
      expect(finalScore).toBe(initialScore);
      testEnv.lookCommandHelper.verifyNoScoreChange(result);
    });
{{/if}}
  });

  describe('Command Variations', () => {
    it('should accept "look" command', async () => {
      const result = testEnv.lookCommandHelper.executeLook('look');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should accept "l" shorthand', async () => {
      const result = testEnv.lookCommandHelper.executeLook('l');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should accept "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLook('look around');
      testEnv.lookCommandHelper.verifySuccess(result);
    });

    it('should produce same result for all basic look variations', async () => {
{{#if hasFirstVisitPoints}}
      // Mark as visited first to avoid first-visit differences
      testEnv.{{helperName}}.markAsVisited();
{{/if}}

      const lookResult = testEnv.lookCommandHelper.executeLook('look');
      const lResult = testEnv.lookCommandHelper.executeLook('l');
      const lookAroundResult = testEnv.lookCommandHelper.executeLook('look around');

      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySuccess(lResult);
      testEnv.lookCommandHelper.verifySuccess(lookAroundResult);

      expect(lookResult.message).toContain('{{title}}');
      expect(lResult.message).toContain('{{title}}');
      expect(lookAroundResult.message).toContain('{{title}}');
    });
  });
});
`;
