/**
 * Monster Behavior Service Interface
 * 
 * Responsible for executing monster behaviors, special abilities,
 * and behavior functions from MDL.
 * 
 * @interface IMonsterBehaviorService
 */

export interface BehaviorResult {
  /** Whether the behavior executed successfully */
  success: boolean;
  /** Message describing the behavior outcome */
  message: string;
  /** State changes to apply */
  stateChanges?: Record<string, any>;
  /** Score change from behavior */
  scoreChange?: number;
  /** Items to transfer */
  itemTransfers?: Array<{
    itemId: string;
    from: string;
    to: string;
  }>;
}

export interface AbilityResult {
  /** Whether the ability was used successfully */
  success: boolean;
  /** Message describing the ability use */
  message: string;
  /** Targets affected by the ability */
  affectedTargets?: string[];
  /** Duration of ability effect in turns */
  duration?: number;
}

export interface IMonsterBehaviorService {
  /**
   * Execute a behavior function (from MDL behaviorFunction)
   * @param monsterId Monster executing the behavior
   * @param behaviorFunction Function name (e.g., ROBBER-FUNCTION)
   * @returns Behavior execution result
   */
  executeBehavior(monsterId: string, behaviorFunction: string): BehaviorResult;

  /**
   * Evaluate a condition string
   * @param monsterId Monster context
   * @param condition Condition string to evaluate
   * @returns true if condition is met
   */
  evaluateCondition(monsterId: string, condition: string): boolean;

  /**
   * Apply an effect string
   * @param monsterId Monster context
   * @param effect Effect string to apply
   * @returns Result of applying the effect
   */
  applyEffect(monsterId: string, effect: string): BehaviorResult;

  /**
   * Handle a special ability
   * @param monsterId Monster using the ability
   * @param ability Ability name (e.g., "steal", "vanish")
   * @param targetId Optional target for the ability
   * @returns Ability result
   */
  handleSpecialAbility(monsterId: string, ability: string, targetId?: string): AbilityResult;

  /**
   * Execute thief stealing behavior
   * @param thiefId Thief monster ID
   * @returns Behavior result with stolen item details
   */
  executeThiefStealing(thiefId: string): BehaviorResult;

  /**
   * Execute troll guarding behavior
   * @param trollId Troll monster ID
   * @returns Behavior result
   */
  executeTrollGuarding(trollId: string): BehaviorResult;

  /**
   * Execute cyclops hunger behavior
   * @param cyclopsId Cyclops monster ID
   * @returns Behavior result
   */
  executeCyclopsHunger(cyclopsId: string): BehaviorResult;

  /**
   * Execute grue darkness behavior
   * @param grueId Grue monster ID
   * @returns Behavior result
   */
  executeGrueDarkness(grueId: string): BehaviorResult;

  /**
   * Check if a behavior can be executed
   * @param monsterId Monster ID
   * @param behaviorFunction Behavior function name
   * @returns true if behavior can be executed
   */
  canExecuteBehavior(monsterId: string, behaviorFunction: string): boolean;

  /**
   * Get available behaviors for a monster
   * @param monsterId Monster ID
   * @returns Array of available behavior names
   */
  getAvailableBehaviors(monsterId: string): string[];

  /**
   * Process behavior triggers based on game events
   * @param monsterId Monster ID
   * @param trigger Event trigger (e.g., "player_enter", "item_thrown")
   * @param context Additional context data
   * @returns Array of behavior results
   */
  processBehaviorTriggers(
    monsterId: string, 
    trigger: string, 
    context?: Record<string, any>
  ): BehaviorResult[];
}