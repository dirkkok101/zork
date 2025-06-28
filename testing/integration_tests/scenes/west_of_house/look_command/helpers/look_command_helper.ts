/**
 * Look Command Test Helper
 * Provides utilities for executing and validating look command behavior
 */

import { LookCommand } from '@/commands/LookCommand';
import { CommandResult } from '@/types/CommandTypes';
import { GameStateService } from '@/services/GameStateService';
import { SceneService } from '@/services/SceneService';
import { InventoryService } from '@/services/InventoryService';
import { ItemService } from '@/services/ItemService';
import { OutputService } from '@/services/OutputService';
import { ICombatService, IPersistenceService } from '@/services/interfaces';

export class LookCommandHelper {
  private lookCommand: LookCommand;
  private gameState: GameStateService;
  
  constructor(
    gameState: GameStateService,
    sceneService: SceneService,
    inventoryService: InventoryService,
    itemService: ItemService,
    combatService: ICombatService,
    persistenceService: IPersistenceService,
    outputService: OutputService
  ) {
    this.gameState = gameState;
    this.lookCommand = new LookCommand(
      gameState,
      sceneService,
      inventoryService,
      itemService,
      combatService,
      persistenceService,
      outputService
    );
  }

  /**
   * Execute a look command and return the result
   */
  executeLook(input: string): CommandResult {
    return this.lookCommand.execute(input);
  }

  /**
   * Execute basic "look" command
   */
  executeBasicLook(): CommandResult {
    return this.executeLook('look');
  }

  /**
   * Execute "look around" command
   */
  executeLookAround(): CommandResult {
    return this.executeLook('look around');
  }

  /**
   * Execute "look at <target>" command
   */
  executeLookAt(target: string): CommandResult {
    return this.executeLook(`look at ${target}`);
  }

  /**
   * Execute "look in <target>" command
   */
  executeLookIn(target: string): CommandResult {
    return this.executeLook(`look in ${target}`);
  }

  /**
   * Verify command was successful
   */
  verifySuccess(result: CommandResult): void {
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }

  /**
   * Verify command failed with expected message
   */
  verifyFailure(result: CommandResult, expectedMessagePattern?: string | RegExp): void {
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    
    if (expectedMessagePattern) {
      if (typeof expectedMessagePattern === 'string') {
        expect(result.message).toContain(expectedMessagePattern);
      } else {
        expect(result.message).toMatch(expectedMessagePattern);
      }
    }
  }

  /**
   * Verify the result contains scene title and description
   */
  verifySceneDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('West of House');
    expect(result.message).toContain('white house');
    expect(result.message).toContain('boarded front door');
  }

  /**
   * Verify the result contains first visit description
   */
  verifyFirstVisitDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('You are standing in an open field');
  }

  /**
   * Verify the result contains regular description (not first visit)
   */
  verifyRegularDescription(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toContain('This is an open field');
  }

  /**
   * Verify the result contains exit information
   */
  verifyExitInformation(result: CommandResult): void {
    this.verifySuccess(result);
    expect(result.message).toMatch(/exits?:/i);
    expect(result.message).toContain('north');
    expect(result.message).toContain('south');
    expect(result.message).toContain('west');
  }

  /**
   * Verify the result contains item information
   */
  verifyItemInformation(result: CommandResult, expectedItems: string[]): void {
    this.verifySuccess(result);
    
    if (expectedItems.length === 0) {
      // Should not contain item listing
      expect(result.message).not.toMatch(/you can see/i);
    } else {
      expect(result.message).toMatch(/you can see/i);
      expectedItems.forEach(item => {
        expect(result.message).toContain(item);
      });
    }
  }

  /**
   * Verify the command doesn't count as a move
   */
  verifyNoMove(result: CommandResult): void {
    expect(result.countsAsMove).toBe(false);
  }

  /**
   * Verify no score change occurred
   */
  verifyNoScoreChange(result: CommandResult): void {
    expect(result.scoreChange).toBeFalsy();
  }

  /**
   * Verify game state was marked as visited after look
   */
  verifySceneMarkedVisited(): void {
    expect(this.gameState.hasVisitedScene('west_of_house')).toBe(true);
  }

  /**
   * Verify specific exit description
   */
  verifyExitDescription(result: CommandResult, direction: string, expectedContent?: string): void {
    this.verifySuccess(result);
    
    if (expectedContent) {
      expect(result.message).toContain(expectedContent);
    } else {
      // Default expectation for exit descriptions
      expect(result.message).toMatch(new RegExp(`exit.*${direction}`, 'i'));
    }
  }

  /**
   * Verify item description
   */
  verifyItemDescription(result: CommandResult, itemName: string, expectedDescription?: string): void {
    this.verifySuccess(result);
    
    if (expectedDescription) {
      expect(result.message).toContain(expectedDescription);
    } else {
      // Should contain the item name
      expect(result.message).toContain(itemName);
    }
  }

  /**
   * Verify container contents description
   */
  verifyContainerContents(result: CommandResult, containerName: string, expectedContents: string[]): void {
    this.verifySuccess(result);
    
    if (expectedContents.length === 0) {
      expect(result.message).toMatch(new RegExp(`${containerName}.*empty`, 'i'));
    } else {
      expect(result.message).toMatch(new RegExp(`${containerName}.*contains`, 'i'));
      expectedContents.forEach(item => {
        expect(result.message).toContain(item);
      });
    }
  }

  /**
   * Verify error message for invalid target
   */
  verifyInvalidTarget(result: CommandResult, target: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`don't see.*${target}`, 'i'));
  }

  /**
   * Verify error message for closed container
   */
  verifyClosedContainer(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*closed`, 'i'));
  }

  /**
   * Verify error message for locked container
   */
  verifyLockedContainer(result: CommandResult, containerName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`${containerName}.*locked`, 'i'));
  }

  /**
   * Verify error message for non-container
   */
  verifyNonContainer(result: CommandResult, itemName: string): void {
    this.verifyFailure(result);
    expect(result.message).toMatch(new RegExp(`can't look inside.*${itemName}`, 'i'));
  }

  /**
   * Get current moves count for comparison
   */
  getCurrentMoves(): number {
    return this.gameState.getGameState().moves;
  }

  /**
   * Get current score for comparison
   */
  getCurrentScore(): number {
    return this.gameState.getScore();
  }
}