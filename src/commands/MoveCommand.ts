import { BaseCommand } from './BaseCommand';
import { CommandResult } from '../types/CommandTypes';
import {
  IGameStateService,
  ISceneService,
  IInventoryService,
  IItemService,
  ICombatService,
  IPersistenceService,
  IOutputService,
  IScoringService
} from '../services/interfaces';
import log from 'loglevel';

/**
 * Move Command
 * 
 * Handles player movement throughout the game world:
 * - "go <direction>" / "move <direction>" - Move in specified direction
 * - Direct directions: "north", "south", "east", "west", "up", "down"
 * - Short directions: "n", "s", "e", "w", "u", "d"
 * - Entry/exit: "enter", "exit", "in", "out"
 * - Validates exits, handles conditions, locks, and scene transitions
 * - Counts as a move for gameplay mechanics
 * 
 * This is the core navigation command from original Zork.
 */
export class MoveCommand extends BaseCommand {
  constructor(
    gameState: IGameStateService,
    scene: ISceneService,
    inventory: IInventoryService,
    items: IItemService,
    combat: ICombatService,
    persistence: IPersistenceService,
    output: IOutputService,
    scoring: IScoringService,
    logger?: log.Logger
  ) {
    super(
      'move',
      [
        'go', 'walk', 'travel', 'head',
        'north', 'n', 'south', 's', 'east', 'e', 'west', 'w',
        'up', 'u', 'down', 'd', 'enter', 'exit', 'in', 'out',
        'northeast', 'ne', 'northwest', 'nw', 'southeast', 'se', 'southwest', 'sw'
      ],
      'move <direction>',
      'Move in the specified direction or to another location.',
      gameState,
      scene,
      inventory,
      items,
      combat,
      persistence,
      output,
      scoring,
      logger
    );
  }

  /**
   * Execute the move command
   */
  execute(input: string): CommandResult {
    this.logger.debug(`Executing move command: "${input}"`);

    // 1. Parse direction from input
    const direction = this.parseDirection(input);
    if (!direction) {
      return this.failure('Go where?', false); // Invalid input doesn't count as move
    }

    // 2. Get current scene for validation
    const currentSceneId = this.gameState.getCurrentScene();
    
    // 3. Check if movement is valid using SceneService
    if (!this.scene.canMoveTo(currentSceneId, direction)) {
      // Get specific failure message for this direction
      const failureMessage = this.getMovementFailureMessage(currentSceneId, direction);
      return this.failure(failureMessage, true); // Failed moves count as moves in Zork
    }

    try {
      // 4. Handle scene exit logic
      this.scene.exitScene(currentSceneId);

      // 5. Execute movement using SceneService
      const newSceneId = this.scene.moveTo(direction);

      // 6. Handle scene entry logic
      this.scene.enterScene(newSceneId);

      // 7. Get description of new scene
      const sceneDescription = this.scene.getSceneDescription(newSceneId);

      // 8. Return success with scene description
      // Movement counts as a move in Zork gameplay
      return this.success(sceneDescription, true, 0);

    } catch (error) {
      // Handle any movement errors (locked exits, etc.)
      const errorMessage = error instanceof Error ? error.message : 'You cannot go that way.';
      return this.failure(errorMessage, true); // Failed moves count as moves in Zork
    }
  }

  /**
   * Parse direction from input, handling both "go north" and "north" syntax
   */
  private parseDirection(input: string): string | null {
    const args = this.getArgs(input);
    const baseCommand = this.getBaseCommand(input);

    // Handle direct direction commands (north, south, etc.)
    if (this.isDirectionCommand(baseCommand)) {
      return this.expandDirection(baseCommand);
    }

    // Handle "go <direction>" format
    if (args.length === 0) {
      return null;
    }

    // Take first argument as direction
    const direction = args[0];
    
    // Check if this looks like a compound direction that we don't support
    if (direction && (direction.includes('north') || direction.includes('south') || 
        direction.includes('east') || direction.includes('west')) && 
        !this.isValidDirection(direction)) {
      return direction; // Return it as-is, it will fail in canMoveTo
    }
    
    return direction ? this.expandDirection(direction) : null;
  }

  /**
   * Check if a direction is valid
   */
  private isValidDirection(direction: string): boolean {
    const validDirections = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 
                           'up', 'u', 'down', 'd', 'enter', 'exit', 'in', 'out'];
    return validDirections.includes(direction.toLowerCase());
  }

  /**
   * Check if the base command is a direct direction
   */
  private isDirectionCommand(command: string): boolean {
    const directions = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd', 'enter', 'exit', 'in', 'out',
                       'northeast', 'ne', 'northwest', 'nw', 'southeast', 'se', 'southwest', 'sw'];
    return directions.includes(command.toLowerCase());
  }

  /**
   * Expand abbreviated directions to full names
   */
  private expandDirection(direction: string): string {
    const expansions: Record<string, string> = {
      'n': 'north',
      's': 'south', 
      'e': 'east',
      'w': 'west',
      'u': 'up',
      'd': 'down',
      'ne': 'northeast',
      'nw': 'northwest',
      'se': 'southeast',
      'sw': 'southwest'
    };

    const lower = direction.toLowerCase();
    return expansions[lower] || lower;
  }

  /**
   * Get specific failure message for movement attempt
   */
  private getMovementFailureMessage(sceneId: string, direction: string): string {
    // Get ALL exits (including blocked ones) to check for failure messages
    const allExits = this.scene.getAllExits(sceneId);
    const exit = allExits.find(e => 
      e.direction.toLowerCase() === direction.toLowerCase() ||
      (direction.toLowerCase().length <= e.direction.toLowerCase().length && 
       e.direction.toLowerCase().startsWith(direction.toLowerCase()))
    );

    if (exit) {
      // Check if exit is locked
      if (exit.locked) {
        return exit.failureMessage || `The ${direction} exit is locked.`;
      }

      // Check if exit has a condition that's not met
      if (exit.condition && exit.failureMessage) {
        // Check if the condition is not met
        const availableExits = this.scene.getAvailableExits(sceneId);
        const isAvailable = availableExits.some(e => e.direction === exit.direction);
        if (!isAvailable) {
          return exit.failureMessage;
        }
      }
    }

    // Check original scene data for blocked exits
    const blockedMessage = this.getBlockedExitMessage(sceneId, direction);
    if (blockedMessage) {
      return blockedMessage;
    }

    // No exit in that direction
    return `You cannot go ${direction}.`;
  }

  /**
   * Get failure message for blocked exits from original scene data
   */
  private getBlockedExitMessage(sceneId: string, direction: string): string | null {
    // Check all exits for failure messages
    const allExits = this.scene.getAllExits(sceneId);
    const exit = allExits.find(e => 
      e.direction.toLowerCase() === direction.toLowerCase()
    );

    return exit?.failureMessage || null;
  }

  /**
   * Get suggestions for movement completion
   */
  override getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase().trim();
    const words = lowerInput.split(/\s+/);
    const firstWord = words[0] || '';
    const restOfInput = words.slice(1).join(' ');

    // Get available exits from current scene
    const currentSceneId = this.gameState.getCurrentScene();
    const availableExits = this.scene.getAvailableExits(currentSceneId);

    // Movement verbs
    const moveVerbs = ['go', 'move', 'walk', 'travel'];

    // Check if user is typing a movement verb
    if (moveVerbs.includes(firstWord)) {
      // User typed "go" or "go " - suggest "go <direction>" with destination info
      availableExits.forEach(exit => {
        const dirLower = exit.direction.toLowerCase();
        if (!restOfInput || dirLower.includes(restOfInput)) {
          // Build metadata string for parsing in GameInterface
          const metadata: string[] = [];

          // Get destination scene title for context
          const destScene = this.gameState.getScene(exit.to);
          if (destScene) {
            metadata.push(`destination:${destScene.title}`);
          }

          // Format: "command|metadata1|metadata2"
          const suggestionText = metadata.length > 0
            ? `${firstWord} ${exit.direction}|${metadata.join('|')}`
            : `${firstWord} ${exit.direction}`;

          suggestions.push(suggestionText);
        }
      });
    } else {
      // User is typing a direction directly (e.g., "nor" for "north")
      // Suggest matching directions with destination info
      availableExits.forEach(exit => {
        if (exit.direction.toLowerCase().startsWith(lowerInput) || lowerInput === '') {
          // Build metadata string for parsing in GameInterface
          const metadata: string[] = [];

          const destScene = this.gameState.getScene(exit.to);
          if (destScene) {
            metadata.push(`destination:${destScene.title}`);
          }

          // Format: "command|metadata1|metadata2"
          const suggestionText = metadata.length > 0
            ? `${exit.direction}|${metadata.join('|')}`
            : exit.direction;

          suggestions.push(suggestionText);
        }
      });
    }

    return suggestions;
  }
}