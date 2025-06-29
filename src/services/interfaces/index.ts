/**
 * Service Interfaces Index
 * Exports lean service interfaces following SOLID principles
 * Each interface has a single responsibility and clear boundaries
 */

// Core lean service interfaces
export type { IGameStateService } from './IGameStateService';
export type { ISceneService } from './ISceneService';
export type { IInventoryService } from './IInventoryService';
export type { IItemService, ItemResult } from './IItemService';
export type { ICombatService, CombatResult, InteractionResult } from './ICombatService';
export type { IPersistenceService } from './IPersistenceService';
export type { IOutputService } from './IOutputService';
export type { ICommandService } from './ICommandService';

// Re-export core types needed by commands
export type {
  Item,
  ItemType
} from '../../types/ItemTypes';

export type {
  Scene
} from '../../types/SceneTypes';

export type {
  Monster
} from '../../types/Monster';

// Re-export command types
export type {
  CommandResult
} from '../../types/CommandTypes';
