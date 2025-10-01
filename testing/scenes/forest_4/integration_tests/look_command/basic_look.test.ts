/**
 * Basic Look Command Integration Tests
 * Auto-generated tests for look functionality in Forest
 */

import '../setup';
import { Forest4TestEnvironment, Forest4IntegrationTestFactory } from './helpers/integration_test_factory';

describe('Basic Look Command - Forest Scene', () => {
  let testEnv: Forest4TestEnvironment;

  beforeEach(async () => {
    testEnv = await Forest4IntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look', () => {

    it('should show scene description on look', async () => {

      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('Forest');
      testEnv.lookCommandHelper.verifyNoMove(result);
    });

    it('should show scene description with "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('Forest');
    });
  });

  describe('Exit Display', () => {
    it('should display available exits in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toMatch(/exits?:/i);
      expect(result.message).toContain('east');
      expect(result.message).toContain('north');
      expect(result.message).toContain('south');
      expect(result.message).toContain('west');
    });

    it('should verify expected exits are actually available', () => {
      testEnv.forest4Helper.verifyExpectedExits();
    });
  });

  describe('Atmospheric Elements', () => {
    it('should verify scene has atmospheric messages', () => {
      testEnv.forest4Helper.verifyAtmosphere();
    });

    it('should verify scene lighting is dark', () => {
      testEnv.forest4Helper.verifyLighting();
    });

    it('should include scene title in description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      expect(result.message).toContain('Forest');
    });
  });

  describe('State Tracking', () => {
    it('should not increment move counter', async () => {
      const initialMoves = testEnv.lookCommandHelper.getCurrentMoves();

      testEnv.lookCommandHelper.executeBasicLook();

      const finalMoves = testEnv.lookCommandHelper.getCurrentMoves();
      expect(finalMoves).toBe(initialMoves);
    });

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

      const lookResult = testEnv.lookCommandHelper.executeLook('look');
      const lResult = testEnv.lookCommandHelper.executeLook('l');
      const lookAroundResult = testEnv.lookCommandHelper.executeLook('look around');

      testEnv.lookCommandHelper.verifySuccess(lookResult);
      testEnv.lookCommandHelper.verifySuccess(lResult);
      testEnv.lookCommandHelper.verifySuccess(lookAroundResult);

      expect(lookResult.message).toContain('Forest');
      expect(lResult.message).toContain('Forest');
      expect(lookAroundResult.message).toContain('Forest');
    });
  });
});
