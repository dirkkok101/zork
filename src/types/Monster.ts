/**
 * Monster Type Definitions
 * Pure data structures for monsters following SOLID principles
 * All behavior is handled by services, not embedded in data types
 */

import { MonsterState, MovementPattern } from './MonsterTypes';
import { MeleeMessages } from './MonsterData';

/**
 * Core Monster interface
 * Represents a monster's data without any behavior methods
 * All actions are performed through services
 */
export interface Monster {
  /** Unique identifier for the monster */
  id: string;

  /** Display name of the monster */
  name: string;

  /** Brief description of the monster */
  description: string;

  /** Detailed description shown when examining the monster */
  examineText: string;

  /** Current health points */
  health: number;

  /** Maximum health points */
  maxHealth: number;

  /** Current behavior state */
  state: MonsterState;

  /** ID of the current scene (null for monsters without fixed locations) */
  currentSceneId: string | null;

  /** Movement pattern */
  movementPattern: MovementPattern;

  /** Scenes this monster can move between (empty = all scenes) */
  allowedScenes: string[];

  /** Items the monster is carrying */
  inventory: string[];

  /** Monster-specific state variables */
  variables: Record<string, any>;

  // Properties from MonsterData
  
  /** Alternative names for the monster */
  synonyms: string[];
  
  /** MDL flags */
  flags: Record<string, boolean>;
  
  /** Combat strength (OSTRENGTH from MDL) */
  combatStrength?: number | undefined;
  
  /** Combat messages for different attack outcomes */
  meleeMessages?: MeleeMessages | undefined;
  
  /** Behavior function name (e.g., ROBBER-FUNCTION) */
  behaviorFunction?: string | undefined;
  
  /** Movement demon name (e.g., ROBBER-DEMON) */
  movementDemon?: string | undefined;
  
  /** Monster-specific properties */
  properties: Record<string, any>;

  /** Monster type category */
  type: 'humanoid' | 'creature' | 'environmental';

  /** Starting scene ID (null for monsters without fixed starting locations) */
  startingSceneId?: string | null;

  /** Score awarded for defeating the monster */
  defeatScore?: number | undefined;

  /** Special behaviors this monster exhibits */
  behaviors?: string[] | undefined;
}