/**
 * Service Interfaces Index
 * Exports all service interfaces following SOLID principles
 * Each interface has a single responsibility and is dependency-inverted
 */

// Core service interfaces
export { IItemService } from './IItemService';
export { IContainerService, ContainerResult } from './IContainerService';
export { ILightSourceService } from './ILightSourceService';

// Monster service interfaces
export { IMonsterService } from './IMonsterService';
export { IMonsterCombatService, CombatResult as MonsterCombatResult, MonsterDeathResult } from './IMonsterCombatService';
export { IMonsterMovementService, MovementResult, MovementDecision } from './IMonsterMovementService';
export { IMonsterBehaviorService, BehaviorResult, AbilityResult } from './IMonsterBehaviorService';
export { IMonsterInteractionService, InteractionResult, DialogueEntry } from './IMonsterInteractionService';
export { IMonsterAIService, AIDecision, MonsterAction, ThreatAssessment } from './IMonsterAIService';

// Specialized interaction service interfaces
export { IPhysicalInteractionService } from './IPhysicalInteractionService';
export { IWeaponService, CombatResult } from './IWeaponService';
export { IConsumableService, ConsumptionResult, NutritionStatus } from './IConsumableService';
export { IFireService, FireResult, FireHazard } from './IFireService';
export { IVehicleService, VehicleResult, TravelRoute } from './IVehicleService';

// Scene and navigation services
export { ISceneNavigationService, NavigationResult } from './ISceneNavigationService';
export { ISceneLightingService, LightingEvaluation, LightSource } from './ISceneLightingService';

// Game state management services
export { IGamePersistenceService, SaveSlot, PersistenceResult } from './IGamePersistenceService';
export { IGameFlagService, FlagChangeEvent, VariableChangeEvent, FlagQuery } from './IGameFlagService';

// Command processing services
export { ICommandParserService, ParsedCommand, CommandSuggestion, ParseError, CommandValidation } from './ICommandParserService';
export { IConditionEvaluationService, ConditionResult, ConditionExpression, ConditionContext } from './IConditionEvaluationService';
export { IEffectApplicationService, EffectResult, EffectChange, EffectExpression, EffectContext } from './IEffectApplicationService';

// Game mechanics services
export { IPuzzleService, Puzzle, PuzzleAttemptResult, PuzzleState, PuzzleHint, PuzzleReward } from './IPuzzleService';
export { IAudioService, AudioSource, AudioConfig, AudioEvent, AudioEventType } from './IAudioService';

// Orchestration service
export { IGameOrchestrationService, CommandExecutionResult, GameEvent, TurnResult, OrchestrationContext } from './IGameOrchestrationService';

// Service registry interface
export {
  IServiceRegistry,
  ServiceHealthReport,
  ServiceConfiguration
} from './IServiceRegistry';

// Re-export common types from ItemTypes
export type {
  ItemOperationResult,
  ConsumptionEffects,
  WeaponItem,
  VehicleItem,
  ConsumableItem,
  ContainerItem,
  LightSourceItem,
  OpenableItem,
  LockableItem,
  Item,
  ItemInteraction,
  ItemType,
  Size
} from '../../types/ItemTypes';