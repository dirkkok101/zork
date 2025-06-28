/**
 * Monster Interaction Service Interface
 * 
 * Responsible for handling player-monster interactions including
 * dialogue, trading, combat initiation, and examination.
 * 
 * @interface IMonsterInteractionService
 */

export interface InteractionResult {
  /** Whether the interaction was successful */
  success: boolean;
  /** Message to display to the player */
  message: string;
  /** Whether monster state changed */
  stateChanged: boolean;
  /** Score change from interaction */
  scoreChange?: number;
  /** Items gained from interaction */
  itemsGained?: string[];
  /** Items lost in interaction */
  itemsLost?: string[];
  /** Flags set by interaction */
  flagsSet?: Record<string, boolean>;
}

export interface DialogueEntry {
  /** Trigger word or phrase */
  trigger: string;
  /** Response text */
  response: string;
  /** Condition for this dialogue */
  condition?: string;
  /** Effect when triggered */
  effect?: string;
  /** Score change for this dialogue */
  scoreChange?: number;
}

export interface IMonsterInteractionService {
  /**
   * Talk to a monster
   * @param monsterId Target monster
   * @param topic Optional conversation topic
   * @returns Interaction result
   */
  talk(monsterId: string, topic?: string): InteractionResult;

  /**
   * Give an item to a monster
   * @param monsterId Target monster
   * @param itemId Item to give
   * @returns Interaction result
   */
  give(monsterId: string, itemId: string): InteractionResult;

  /**
   * Attack a monster
   * @param monsterId Target monster
   * @param weaponId Optional weapon to use
   * @returns Interaction result
   */
  attack(monsterId: string, weaponId?: string): InteractionResult;

  /**
   * Examine a monster
   * @param monsterId Target monster
   * @returns Interaction result with detailed description
   */
  examine(monsterId: string): InteractionResult;

  /**
   * Throw an item at a monster
   * @param monsterId Target monster
   * @param itemId Item to throw
   * @returns Interaction result
   */
  throwAt(monsterId: string, itemId: string): InteractionResult;

  /**
   * Get dialogue options for a monster
   * @param monsterId Monster ID
   * @returns Array of dialogue entries
   */
  getDialogueOptions(monsterId: string): DialogueEntry[];

  /**
   * Process a specific dialogue entry
   * @param monsterId Monster ID
   * @param dialogueEntry Dialogue to process
   * @returns Interaction result
   */
  processDialogue(monsterId: string, dialogueEntry: DialogueEntry): InteractionResult;

  /**
   * Check if monster will accept an item
   * @param monsterId Monster ID
   * @param itemId Item ID
   * @returns true if monster will accept the item
   */
  willAcceptItem(monsterId: string, itemId: string): boolean;

  /**
   * Get monster's reaction to player presence
   * @param monsterId Monster ID
   * @returns Reaction message or null
   */
  getPresenceReaction(monsterId: string): string | null;

  /**
   * Handle monster greeting
   * @param monsterId Monster ID
   * @returns Greeting message
   */
  greet(monsterId: string): InteractionResult;

  /**
   * Attempt to trade with a monster
   * @param monsterId Monster ID
   * @param offeredItemId Item player offers
   * @param requestedItemId Item player wants
   * @returns Trade result
   */
  trade(monsterId: string, offeredItemId: string, requestedItemId: string): InteractionResult;

  /**
   * Check if interaction is possible
   * @param monsterId Monster ID
   * @param interactionType Type of interaction
   * @returns true if interaction can proceed
   */
  canInteract(monsterId: string, interactionType: string): boolean;
}