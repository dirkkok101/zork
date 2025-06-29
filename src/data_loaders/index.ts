/**
 * Data Loaders Index
 * Exports all data loader interfaces and implementations
 * Following single responsibility principle - each loader handles one data type
 */

// Item data loading
export type { IItemDataLoader } from './interfaces/IItemDataLoader';
export { ItemDataLoader } from './ItemDataLoader';

// Monster data loading
export type { IMonsterDataLoader } from './interfaces/IMonsterDataLoader';
export { MonsterDataLoader } from './MonsterDataLoader';

// Scene data loading
export type { ISceneDataLoader } from './interfaces/ISceneDataLoader';
export { SceneDataLoader } from './SceneDataLoader';

// Re-export data types for convenience
export type {
    ItemData,
    ItemInteractionData,
    ItemIndexData,
    ItemProperties
} from '../types/ItemData';

export type {
    MonsterData,
    MonsterIndex,
    MeleeMessages,
    MovementPatternData,
    MonsterBehavior,
    MonsterDialogue,
    MonsterDefeat
} from '../types/MonsterData';

export type {
    SceneData
} from '../types/SceneData';
