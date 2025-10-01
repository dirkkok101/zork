# Service Interface Index

This document provides a quick reference to all service interfaces in the Zork game.

## Service Interface Files

All service interfaces are located in `/src/services/interfaces/` with documentation in `/docs/services/`.

| Interface | File | Documentation | Responsibility |
|-----------|------|---------------|----------------|
| `IItemService` | `IItemService.ts` | [IItemService.md](./IItemService.md) | Core item operations and basic interactions |
| `IContainerService` | `IContainerService.ts` | [IContainerService.md](./IContainerService.md) | Container operations and item storage |
| `ILightSourceService` | `ILightSourceService.ts` | [ILightSourceService.md](./ILightSourceService.md) | Light source management and scene illumination |
| `IPhysicalInteractionService` | `IPhysicalInteractionService.ts` | [IPhysicalInteractionService.md](./IPhysicalInteractionService.md) | Physical manipulation of items |
| `IWeaponService` | `IWeaponService.ts` | [IWeaponService.md](./IWeaponService.md) | Combat and weapon mechanics |
| `IConsumableService` | `IConsumableService.ts` | [IConsumableService.md](./IConsumableService.md) | Food and drink consumption mechanics |
| `IFireService` | `IFireService.ts` | [IFireService.md](./IFireService.md) | Fire, burning, and ignition mechanics |
| `IVehicleService` | `IVehicleService.ts` | [IVehicleService.md](./IVehicleService.md) | Transportation and vehicle operations |
| `IServiceRegistry` | `IServiceRegistry.ts` | [IServiceRegistry.md](./IServiceRegistry.md) | Dependency injection and service lifecycle |

## Quick Reference

### Interaction Command Coverage

| Command | Count | Service | Method |
|---------|-------|---------|---------|
| examine | 214 | `IItemService` | `examineItem()` |
| take | 102 | `IItemService` | `takeItem()` |
| open | 36 | `IContainerService` | `openContainer()` |
| close | 36 | `IContainerService` | `closeContainer()` |
| read | 33 | `IItemService` | `readItem()` |
| turn on | 11 | `ILightSourceService` | `lightSource()` |
| turn off | 11 | `ILightSourceService` | `extinguishSource()` |
| turn | 4 | `IPhysicalInteractionService` | `turnItem()` |
| search | 2 | `IPhysicalInteractionService` | `searchItem()` |

### Service Dependencies

```
IServiceRegistry
├── IItemService
├── IContainerService
├── ILightSourceService
├── IPhysicalInteractionService
├── IWeaponService
├── IConsumableService
├── IFireService
└── IVehicleService
```

### Common Result Types

| Type | Description | Used By |
|------|-------------|---------|
| `ItemOperationResult` | Base result for all item operations | All services |
| `ContainerResult` | Container-specific operations | `IContainerService` |
| `CombatResult` | Combat operations with damage/experience | `IWeaponService` |
| `ConsumptionResult` | Food/drink consumption with nutrition | `IConsumableService` |
| `FireResult` | Fire operations with spread/ignition | `IFireService` |
| `VehicleResult` | Transportation with location changes | `IVehicleService` |

## Usage Patterns

### Service Access Pattern
```typescript
// Get service from registry
const itemService = serviceRegistry.getItemService();

// Perform operation
const result = itemService.takeItem('lamp');

// Handle result
if (result.success) {
  console.log(result.message);
}
```

### Service Composition Pattern
```typescript
// Multiple services working together
const handleComplexAction = (action: string, target: string) => {
  const itemService = serviceRegistry.getItemService();
  const fireService = serviceRegistry.getFireService();
  
  if (action === 'light') {
    return fireService.lightWithFire(target, 'match');
  }
  
  return itemService.interactWithItem(target, action);
};
```

### Error Handling Pattern
```typescript
const result = service.performOperation(target);

if (!result.success) {
  throw new Error(`Operation failed: ${result.message}`);
}

// Apply any score changes
if (result.scoreChange) {
  gameState.score += result.scoreChange;
}

// Apply any state updates
if (result.stateUpdates) {
  gameStateService.updateState(result.stateUpdates);
}
```

## Implementation Status

### ✅ Completed
- Interface definitions and documentation
- Type system with ItemTypes.ts enhancements
- SOLID principles compliance
- Testing strategy definition

### 🚧 In Progress
- Concrete service implementations
- Service registry implementation
- Integration testing setup

### 📋 Planned
- Performance optimization
- Monitoring and logging integration
- Plugin architecture for extensibility

## Related Documentation

- [Main Services README](./README.md) - Comprehensive service architecture overview
- [Item Data Analysis](../data/item-data-analysis.md) - Understanding item structure
- [Testing Guidelines](../testing/testing-guidelines.md) - Service testing strategies
- [Architecture Documentation](../README.md) - Overall game architecture

For detailed information about each service interface, see the individual documentation files linked in the table above.