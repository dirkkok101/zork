/**
 * Basic Look Command Integration Tests
 * Auto-generated tests for look functionality in Sandy Beach
 */

import '../setup';
import { BeachTestEnvironment, BeachIntegrationTestFactory } from './helpers/integration_test_factory';

describe('Basic Look Command - Sandy Beach Scene', () => {
  let testEnv: BeachTestEnvironment;

  beforeEach(async () => {
    testEnv = await BeachIntegrationTestFactory.createTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Basic Look', () => {

    it('should show scene description on look', async () => {

      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('Sandy Beach');
      testEnv.lookCommandHelper.verifyNoMove(result);
    });

    it('should show scene description with "look around"', async () => {
      const result = testEnv.lookCommandHelper.executeLookAround();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toContain('Sandy Beach');
    });
  });

  describe('Exit Display', () => {
    it('should display available exits in look result', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      testEnv.lookCommandHelper.verifySuccess(result);
      expect(result.message).toMatch(/exits?:/i);
      expect(result.message).toContain('launc');
      expect(result.message).toContain('south');
    });

    it('should verify expected exits are actually available', () => {
      testEnv.beachHelper.verifyExpectedExits();
    });
  });

  describe('Atmospheric Elements', () => {
    it('should verify scene has atmospheric messages', () => {
      testEnv.beachHelper.verifyAtmosphere();
    });

    it('should verify scene lighting is daylight', () => {
      testEnv.beachHelper.verifyLighting();
    });

    it('should include scene title in description', async () => {
      const result = testEnv.lookCommandHelper.executeBasicLook();

      expect(result.message).toContain('Sandy Beach');
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

      expect(lookResult.message).toContain('Sandy Beach');
      expect(lResult.message).toContain('Sandy Beach');
      expect(lookAroundResult.message).toContain('Sandy Beach');
    });
  });
});
