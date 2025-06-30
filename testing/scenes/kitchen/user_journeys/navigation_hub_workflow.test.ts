/**
 * Kitchen Scene - Navigation Hub User Journey Tests
 * Tests the kitchen's role as a central navigation hub between different areas
 */

import '../integration_tests/look_command/setup';
import { KitchenIntegrationTestFactory, KitchenTestEnvironment } from '../integration_tests/look_command/helpers/integration_test_factory';

describe('Kitchen Scene - Navigation Hub User Journey', () => {
  let testEnv: KitchenTestEnvironment;

  beforeEach(async () => {
    testEnv = await KitchenIntegrationTestFactory.createTestEnvironment();
    testEnv.kitchenHelper.resetScene();
    testEnv.kitchenHelper.clearTestItems();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Kitchen as Central Hub', () => {
    it('player uses kitchen to access all connected areas', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Start in kitchen
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 1. Access living room (west)
      testEnv.moveCommandHelper.executeMoveDirection('west');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('living_room');
      
      // Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 2. Access attic (up)
      testEnv.moveCommandHelper.executeMoveDirection('up');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('attic');
      
      // Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('down');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 3. Open window and access behind house (east)
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
      
      // Return to kitchen through window
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // Verify total moves
      const expectedMoves = initialMoves + 1 + 6; // 1 open + 6 movements
      expect(testEnv.moveCommandHelper.getCurrentMoves()).toBe(expectedMoves);
    });

    it('player discovers window creates new navigation route', () => {
      // 1. Initially, only west and up exits available
      let lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(lookResult, false);
      
      // 2. Try east movement - should fail
      const failedEast = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(failedEast);
      
      // 3. Player discovers and opens window
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // 4. Look again - now shows east exit
      lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyExitInformation(lookResult, true);
      
      // 5. East movement now succeeds
      const successEast = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(successEast, 'behind_house');
    });

    it('player uses kitchen for round-trip journeys', () => {
      // Open window for full access
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Round trip 1: Kitchen -> Living Room -> Kitchen
      testEnv.moveCommandHelper.verifyRoundTrip('west', 'living_room', 'east', 'kitchen');
      
      // Round trip 2: Kitchen -> Attic -> Kitchen
      testEnv.moveCommandHelper.verifyRoundTrip('up', 'attic', 'down', 'kitchen');
      
      // Round trip 3: Kitchen -> Behind House -> Kitchen
      testEnv.moveCommandHelper.verifyRoundTrip('east', 'behind_house', 'west', 'kitchen');
      
      // Alternative route: Kitchen -> Behind House (via out) -> Kitchen
      testEnv.moveCommandHelper.verifyRoundTrip('out', 'behind_house', 'west', 'kitchen');
    });
  });

  describe('Multi-Step Navigation Workflows', () => {
    it('player navigates complex route through multiple rooms', () => {
      // Open window for full access
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Complex navigation: Kitchen -> Living Room -> Kitchen -> Attic -> Kitchen -> Behind House -> Kitchen
      const route = [
        { direction: 'west', expectedScene: 'living_room' },
        { direction: 'east', expectedScene: 'kitchen' },
        { direction: 'up', expectedScene: 'attic' },
        { direction: 'down', expectedScene: 'kitchen' },
        { direction: 'east', expectedScene: 'behind_house' },
        { direction: 'west', expectedScene: 'kitchen' }
      ];
      
      route.forEach(({ direction, expectedScene }) => {
        testEnv.moveCommandHelper.executeMoveDirection(direction);
        expect(testEnv.moveCommandHelper.getCurrentScene()).toBe(expectedScene);
      });
    });

    it('player explores all rooms systematically from kitchen', () => {
      const initialMoves = testEnv.moveCommandHelper.getCurrentMoves();
      
      // Prepare kitchen for full exploration
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.lookCommandHelper.executeBasicLook();
      
      const visitedRooms = new Set(['kitchen']);
      
      // Visit living room
      testEnv.moveCommandHelper.executeMoveDirection('west');
      visitedRooms.add('living_room');
      testEnv.moveCommandHelper.executeMoveDirection('east'); // Back to kitchen
      
      // Visit attic
      testEnv.moveCommandHelper.executeMoveDirection('up');
      visitedRooms.add('attic');
      testEnv.moveCommandHelper.executeMoveDirection('down'); // Back to kitchen
      
      // Visit behind house
      testEnv.moveCommandHelper.executeMoveDirection('east');
      visitedRooms.add('behind_house');
      testEnv.moveCommandHelper.executeMoveDirection('west'); // Back to kitchen
      
      // Verify all rooms visited
      expect(visitedRooms).toContain('kitchen');
      expect(visitedRooms).toContain('living_room');
      expect(visitedRooms).toContain('attic');
      expect(visitedRooms).toContain('behind_house');
      
      // Verify proper move counting
      const expectedMoves = initialMoves + 1 + 6; // 1 open + 6 movements
      expect(testEnv.moveCommandHelper.getCurrentMoves()).toBe(expectedMoves);
    });
  });

  describe('Window State Navigation Management', () => {
    it('player manages window state for different navigation needs', () => {
      // 1. Start with window closed - limited navigation
      testEnv.kitchenHelper.setWindowState(false);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
      
      // 2. Open window to enable full navigation
      testEnv.openCommandHelper.executeOpenTarget('window');
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      // 3. Use the new route
      testEnv.moveCommandHelper.executeMoveDirection('east');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('behind_house');
      
      // 4. Return to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 5. Close window to restrict navigation
      testEnv.closeCommandHelper.executeCloseTarget('window');
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(false);
      
      // 6. Verify east movement now blocked
      const blockedEast = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(blockedEast);
    });

    it('player navigates with different window states', () => {
      // Test navigation with window closed
      testEnv.kitchenHelper.setWindowState(false);
      
      // Available routes: west (living room), up (attic)
      const availableExits1 = testEnv.moveCommandHelper.getAvailableExits();
      const directions1 = availableExits1.map(exit => exit.direction);
      expect(directions1).toContain('west');
      expect(directions1).toContain('up');
      expect(directions1).not.toContain('east');
      
      // Open window
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // Available routes: west, up, east/out
      const availableExits2 = testEnv.moveCommandHelper.getAvailableExits();
      const directions2 = availableExits2.map(exit => exit.direction);
      expect(directions2).toContain('west');
      expect(directions2).toContain('up');
      expect(directions2).toContain('east');
    });
  });

  describe('Navigation Error Recovery', () => {
    it('player recovers from blocked movement attempts', () => {
      // 1. Try blocked directions
      const blockedDirections = ['north', 'south', 'in'];
      
      blockedDirections.forEach(direction => {
        const result = testEnv.moveCommandHelper.executeMoveDirection(direction);
        testEnv.moveCommandHelper.verifyFailure(result);
        // Player should still be in kitchen
        testEnv.kitchenHelper.verifyPlayerInScene();
      });
      
      // 2. Try special blocked direction (down - chimney)
      const downResult = testEnv.moveCommandHelper.executeMoveDirection('down');
      testEnv.moveCommandHelper.verifyBlockedExit(downResult, 'Only Santa Claus climbs down chimneys');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // 3. Player recovers by using valid directions
      testEnv.moveCommandHelper.executeMoveDirection('west');
      expect(testEnv.moveCommandHelper.getCurrentScene()).toBe('living_room');
      
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.kitchenHelper.verifyPlayerInScene();
    });

    it('player learns window mechanics through trial and error', () => {
      // 1. Player tries east without opening window
      const failedEast = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyWindowClosed(failedEast);
      
      // 2. Player examines window (if examine implemented)
      // Result should hint that window can be opened
      
      // 3. Player opens window
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // 4. Player successfully goes east
      const successEast = testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.verifyMovementSuccess(successEast, 'behind_house');
      
      // 5. Player can return through window
      const returnWest = testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.verifyMovementSuccess(returnWest, 'kitchen');
    });
  });

  describe('Navigation State Persistence', () => {
    it('navigation state persists across complex journeys', () => {
      // 1. Set up initial state
      testEnv.openCommandHelper.executeOpenTarget('window');
      testEnv.openCommandHelper.executeOpenTarget('sack');
      
      // 2. Perform complex navigation
      testEnv.moveCommandHelper.executeMoveDirection('west');  // to living room
      testEnv.moveCommandHelper.executeMoveDirection('east');  // back to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('up');    // to attic
      testEnv.moveCommandHelper.executeMoveDirection('down');  // back to kitchen
      testEnv.moveCommandHelper.executeMoveDirection('east');  // to behind house
      testEnv.moveCommandHelper.executeMoveDirection('west');  // back to kitchen
      
      // 3. Verify all states persisted
      testEnv.kitchenHelper.verifyWindowState(true);
      testEnv.kitchenHelper.verifySackState(true);
      expect(testEnv.kitchenHelper.isEastExitAvailable()).toBe(true);
      
      // 4. Verify kitchen items still accessible
      const lookResult = testEnv.lookCommandHelper.executeBasicLook();
      testEnv.lookCommandHelper.verifyKitchenItems(lookResult, true, false);
    });

    it('player can return to kitchen from any connected room', () => {
      testEnv.openCommandHelper.executeOpenTarget('window');
      
      // From living room
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // From attic
      testEnv.moveCommandHelper.executeMoveDirection('up');
      testEnv.moveCommandHelper.executeMoveDirection('down');
      testEnv.kitchenHelper.verifyPlayerInScene();
      
      // From behind house
      testEnv.moveCommandHelper.executeMoveDirection('east');
      testEnv.moveCommandHelper.executeMoveDirection('west');
      testEnv.kitchenHelper.verifyPlayerInScene();
    });
  });
});