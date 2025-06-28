/**
 * Service Interfaces Index
 * Exports lean service interfaces following SOLID principles
 * Each interface has a single responsibility and clear boundaries
 */

// Core lean service interfaces
export { IGameStateService } from './IGameStateService';
export { ISceneService } from './ISceneService';
export { IInventoryService } from './IInventoryService';
export { IItemService, ItemResult } from './IItemService';
export { ICombatService, CombatResult, InteractionResult } from './ICombatService';
export { IPersistenceService } from './IPersistenceService';
export { IOutputService } from './IOutputService';
export { ICommandService } from './ICommandService';

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
