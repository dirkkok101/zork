# Zork Game Service Interfaces

This directory contains documentation for all service interfaces in the Zork game, designed following SOLID principles with consistent naming conventions.

## Service Architecture Overview

The Zork game uses a layered architecture with services that handle specific game mechanics. All services follow SOLID principles and use dependency injection for loose coupling and testability.

### Architecture Layers

```
Presentation Layer (UI)
       ↓
Command Layer (Game Logic Orchestration)
       ↓
Services Layer (Business Logic)
       ↓
Data Access Layer (Game Data Management)
```

## Service Interface Organization

All service interfaces are located in `/src/services/interfaces/` and follow consistent naming:

- **Interface Naming**: `I{ServiceName}Service` (e.g., `IItemService`)
- **Result Types**: `{Service}Result` (e.g., `ContainerResult`, `CombatResult`)
- **Configuration**: `{Service}Configuration` (e.g., `WeaponConfiguration`)

## Complete Service Coverage

### ✅ All 9 Interaction Commands Covered

Based on analysis of 214 item JSON files from the original Zork data, our services cover **all unique interaction commands**:

| Command | Count | Service Interface | Method |
|---------|-------|-------------------|---------|
| examine | 214 items | `IItemService` | `examineItem()` |
| take | 102 items | `IItemService` | `takeItem()` |
| open | 36 items | `IContainerService` | `openContainer()` |
| close | 36 items | `IContainerService` | `closeContainer()` |
| read | 33 items | `IItemService` | `readItem()` |
| turn on | 11 items | `ILightSourceService` | `lightSource()` |
| turn off | 11 items | `ILightSourceService` | `extinguishSource()` |
| turn | 4 items | `IPhysicalInteractionService` | `turnItem()` |
| search | 2 items | `IPhysicalInteractionService` | `searchItem()` |

## Service Interfaces

### Core Services

#### [IItemService](./IItemService.md)
**Responsibility**: Basic item operations and core interactions
- Primary interactions: take, drop, examine, read
- Secondary interactions: search, turn, push, pull
- State management and property access

#### [IContainerService](./IContainerService.md)  
**Responsibility**: Container operations and item storage
- Container operations: open, close, lock, unlock
- Item management: put items in, take items out
- Capacity and weight constraints

#### [ILightSourceService](./ILightSourceService.md)
**Responsibility**: Light source management and scene illumination
- Lighting operations: light, extinguish, ignition sources
- Scene illumination checking and fuel management
- Light intensity and duration tracking

### Specialized Services

#### [IPhysicalInteractionService](./IPhysicalInteractionService.md)
**Responsibility**: Physical manipulation of items
- Mechanical interactions: turn, push, pull, move
- Environmental interactions: climb, dig, tie
- Object manipulation: lift, wave, rub, touch

#### [IWeaponService](./IWeaponService.md)
**Responsibility**: Combat and weapon mechanics
- Weapon management: wield, unwield, repair
- Combat system: attack, damage calculation
- Combat statistics and weapon durability

#### [IConsumableService](./IConsumableService.md)
**Responsibility**: Food and drink consumption mechanics
- Consumption: eat, drink with nutritional effects
- Nutrition tracking: hunger, thirst, health monitoring
- Spoilage and freshness checking

#### [IFireService](./IFireService.md)
**Responsibility**: Fire, burning, and ignition mechanics
- Fire operations: light, burn, extinguish
- Fire spread simulation and hazard detection
- Ignition sources and safety warnings

#### [IVehicleService](./IVehicleService.md)
**Responsibility**: Transportation and vehicle operations
- Vehicle operations: board, disembark, travel
- Cargo management and route planning
- Vehicle maintenance and fuel consumption

### Service Registry

#### [IServiceRegistry](./IServiceRegistry.md)
**Responsibility**: Dependency injection and service lifecycle
- Service registration and retrieval
- Health monitoring and configuration
- Service lifecycle management

## SOLID Principles Implementation

### Single Responsibility Principle (SRP) ✅
- Each service interface has one clear, focused responsibility
- No overlapping concerns between services
- Clear separation of item operations, combat, consumption, etc.

### Open-Closed Principle (OCP) ✅
- Interfaces are open for extension via inheritance
- New behaviors can be added without modifying existing interfaces
- Plugin architecture for specialized behaviors

### Liskov Substitution Principle (LSP) ✅
- All implementations can be substituted for their interfaces
- Consistent contracts across all service methods
- Mock implementations work seamlessly with real ones

### Interface Segregation Principle (ISP) ✅
- Clients depend only on methods they actually use
- No "fat" interfaces with unrelated methods
- Focused, cohesive interfaces

### Dependency Inversion Principle (DIP) ✅
- High-level modules depend on abstractions (interfaces)
- `IServiceRegistry` provides dependency injection
- Easy mocking and testing support

## Testing Strategy

Each service interface supports comprehensive testing:

### Unit Testing
- Mock all dependencies using interface types
- Test business logic in isolation
- Verify error handling and edge cases

### Integration Testing
- Test service interactions with real implementations
- Validate data flow between services
- Test with actual game data

### Contract Testing
- Verify implementations conform to interface contracts
- Test substitutability of different implementations
- Validate consistent behavior across implementations

## Usage Examples

### Basic Service Usage
```typescript
import { IServiceRegistry, IItemService } from '../services/interfaces';

class GameController {
  constructor(private serviceRegistry: IServiceRegistry) {}
  
  async handleTakeItem(itemName: string) {
    const itemService = this.serviceRegistry.getItemService();
    const result = itemService.takeItem(itemName);
    return result;
  }
}
```

### Service Composition
```typescript
async handleComplexAction(action: string, target: string) {
  const itemService = this.serviceRegistry.getItemService();
  const weaponService = this.serviceRegistry.getWeaponService();
  const fireService = this.serviceRegistry.getFireService();
  
  if (action === 'light') {
    // Try to light target with available ignition sources
    const ignitionSources = fireService.getAvailableIgnitionSources();
    if (ignitionSources.length > 0) {
      return fireService.lightWithFire(target, ignitionSources[0]);
    }
  }
  
  return itemService.interactWithItem(target, action);
}
```

## Development Guidelines

### When to Create a New Service
1. **Single Responsibility**: New functionality doesn't fit existing services
2. **Domain Separation**: Distinct game mechanic (combat vs. consumption)
3. **Complexity**: Sufficient complexity to warrant separate service
4. **Reusability**: Functionality will be used across multiple commands

### Service Design Principles
1. **Stateless**: Services should not maintain game state
2. **Pure Functions**: Methods should be predictable and testable
3. **Error Handling**: Consistent error reporting via result types
4. **Documentation**: All methods must be fully documented

### Adding New Methods
1. **Interface First**: Define interface method before implementation
2. **Result Types**: Use appropriate result types for responses
3. **Validation**: Validate inputs and provide clear error messages
4. **Testing**: Write tests before implementation

## Performance Considerations

### Service Optimization
- Services are designed for single-responsibility, enabling optimization
- Caching strategies can be applied per service
- Lazy loading of expensive operations

### Memory Management
- Services don't hold state, reducing memory footprint
- Game state is managed separately from business logic
- Efficient lookup patterns for item operations

## Future Extensibility

The service architecture is designed for extensibility:

### New Game Mechanics
- Add new service interfaces for new mechanics
- Existing services remain unchanged
- Plugin architecture supports community extensions

### Enhanced Features
- Services can be enhanced with new methods
- Backward compatibility maintained through interface versioning
- Configuration system supports feature toggles

## Related Documentation

- [Item Types Documentation](../data/item-data-analysis.md)
- [Testing Guidelines](../testing/testing-guidelines.md)
- [Data Loader Documentation](../data_loaders/ItemDataLoader.md)
- [Command Layer Documentation](../commands/)

This service architecture provides a solid foundation for implementing the complete Zork game while maintaining clean, testable, and extensible code.