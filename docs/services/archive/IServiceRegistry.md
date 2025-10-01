# IServiceRegistry Interface

The `IServiceRegistry` interface serves as the central dependency injection container for the Zork game, providing access to all game services while maintaining loose coupling and supporting the Dependency Inversion Principle.

## Responsibility

Following SOLID principles, `IServiceRegistry` is responsible for:
- Service registration and lifecycle management
- Dependency injection for loose coupling
- Service health monitoring and diagnostics
- Configuration management for all services
- Cross-cutting concerns like logging and performance monitoring

## Architecture Pattern

The Service Registry implements the **Service Locator** and **Dependency Injection** patterns:

```
Game Components
       ↓
IServiceRegistry (Abstraction)
       ↓
Concrete Registry Implementation
       ↓
Service Instances
```

## Interface Methods

### Service Access

#### `getItemService(): IItemService`
Returns the core item service instance.
- **Returns**: Implementation of IItemService
- **Use Case**: Basic item operations across the game

#### `getContainerService(): IContainerService`
Returns the container service instance.
- **Returns**: Implementation of IContainerService
- **Use Case**: Container operations and item storage

#### `getLightSourceService(): ILightSourceService`
Returns the light source service instance.
- **Returns**: Implementation of ILightSourceService
- **Use Case**: Lighting mechanics and scene illumination

#### `getPhysicalInteractionService(): IPhysicalInteractionService`
Returns the physical interaction service instance.
- **Returns**: Implementation of IPhysicalInteractionService
- **Use Case**: Physical item manipulations

#### `getWeaponService(): IWeaponService`
Returns the weapon service instance.
- **Returns**: Implementation of IWeaponService
- **Use Case**: Combat mechanics and weapon management

#### `getConsumableService(): IConsumableService`
Returns the consumable service instance.
- **Returns**: Implementation of IConsumableService
- **Use Case**: Food and drink consumption mechanics

#### `getFireService(): IFireService`
Returns the fire service instance.
- **Returns**: Implementation of IFireService
- **Use Case**: Fire, burning, and ignition mechanics

#### `getVehicleService(): IVehicleService`
Returns the vehicle service instance.
- **Returns**: Implementation of IVehicleService
- **Use Case**: Transportation and vehicle operations

### Service Lifecycle

#### `initializeServices(): Promise<void>`
Initializes all registered services.
- **Returns**: Promise that resolves when initialization is complete
- **Use Case**: Game startup, dependency resolution
- **Side Effects**: May load data, establish connections, validate configuration

#### `shutdownServices(): Promise<void>`
Gracefully shuts down all services.
- **Returns**: Promise that resolves when shutdown is complete
- **Use Case**: Game cleanup, resource disposal
- **Side Effects**: Saves state, closes connections, releases resources

### Health Monitoring

#### `checkServiceHealth(): Promise<ServiceHealthReport>`
Performs health checks on all services.
- **Returns**: Comprehensive health report
- **Use Case**: Diagnostics, monitoring, debugging
- **Performance**: May include response time metrics

### Configuration Management

#### `configureServices(config: ServiceConfiguration): void`
Applies configuration to all services.
- **Parameters**: config - Service configuration object
- **Use Case**: Runtime configuration, feature toggles
- **Side Effects**: Updates service behavior

#### `getServiceConfiguration(): ServiceConfiguration`
Gets current service configuration.
- **Returns**: Current configuration object
- **Use Case**: Configuration inspection, debugging

## Supporting Types

### ServiceHealthReport

```typescript
interface ServiceHealthReport {
  healthy: boolean;                    // Overall health status
  services: {                          // Individual service health
    itemService: boolean;
    containerService: boolean;
    lightSourceService: boolean;
    physicalInteractionService: boolean;
    weaponService: boolean;
    consumableService: boolean;
    fireService: boolean;
    vehicleService: boolean;
  };
  errors: string[];                    // Error messages
  timestamp: Date;                     // Health check timestamp
  performance?: {                      // Optional performance metrics
    averageResponseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}
```

### ServiceConfiguration

```typescript
interface ServiceConfiguration {
  debugMode?: boolean;                 // Enable debug logging
  maxInventorySize?: number;           // Global inventory limit
  autoSave?: boolean;                  // Auto-save after operations
  
  // Custom validation rules
  customValidationRules?: Record<string, (context: any) => boolean>;
  
  // Service-specific configurations
  weaponConfig?: {
    enableCriticalHits?: boolean;
    baseCriticalChance?: number;
    enableDurability?: boolean;
  };
  
  fireConfig?: {
    enableFireSpread?: boolean;
    defaultBurnDuration?: number;
    fireSpreadChance?: number;
  };
  
  vehicleConfig?: {
    enableFuelConsumption?: boolean;
    defaultFuelCapacity?: number;
    enableVehicleDamage?: boolean;
  };
  
  consumableConfig?: {
    enableNutrition?: boolean;
    hungerDecayRate?: number;
    thirstDecayRate?: number;
  };
  
  lightConfig?: {
    enableFuelConsumption?: boolean;
    defaultLightDuration?: number;
    lightFadeWarning?: boolean;
  };
}
```

## Implementation Patterns

### Service Registration

```typescript
class ServiceRegistry implements IServiceRegistry {
  private services: Map<string, any> = new Map();
  private config: ServiceConfiguration = {};
  
  constructor() {
    this.registerServices();
  }
  
  private registerServices(): void {
    // Register services with their dependencies
    this.services.set('itemService', new ItemService(
      this.getDataService(),
      this.getGameStateService()
    ));
    
    this.services.set('containerService', new ContainerService(
      this.getItemService(),
      this.getGameStateService()
    ));
    
    // ... register other services
  }
}
```

### Dependency Injection

```typescript
class GameController {
  private itemService: IItemService;
  private weaponService: IWeaponService;
  
  constructor(private serviceRegistry: IServiceRegistry) {
    // Inject dependencies via service registry
    this.itemService = serviceRegistry.getItemService();
    this.weaponService = serviceRegistry.getWeaponService();
  }
  
  async executeCommand(command: string, target: string) {
    if (command === 'attack') {
      return this.weaponService.attackWith(target);
    }
    
    return this.itemService.interactWithItem(target, command);
  }
}
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Registry only manages service lifecycle and access
- Each service handles its own domain logic
- Clear separation between registration and business logic

### Open-Closed Principle (OCP)
- New services can be added without modifying existing code
- Configuration system supports extending behavior
- Plugin architecture for custom services

### Liskov Substitution Principle (LSP)
- Mock registry can replace real registry for testing
- All service implementations are substitutable
- Consistent interface contracts

### Interface Segregation Principle (ISP)
- Clients only depend on service methods they use
- Registry interface focused on service management
- No unnecessary dependencies

### Dependency Inversion Principle (DIP)
- High-level components depend on service abstractions
- Registry provides abstractions, not concrete implementations
- Easy to swap implementations for testing

## Testing Strategies

### Unit Testing with Mock Registry

```typescript
describe('GameController', () => {
  let mockRegistry: IServiceRegistry;
  let mockItemService: jest.Mocked<IItemService>;
  
  beforeEach(() => {
    mockItemService = createMockItemService();
    mockRegistry = {
      getItemService: () => mockItemService,
      // ... other mock services
    } as IServiceRegistry;
  });
  
  it('should handle take command', () => {
    const controller = new GameController(mockRegistry);
    controller.executeCommand('take', 'lamp');
    
    expect(mockItemService.takeItem).toHaveBeenCalledWith('lamp');
  });
});
```

### Integration Testing

```typescript
describe('ServiceRegistry Integration', () => {
  let registry: IServiceRegistry;
  
  beforeEach(async () => {
    registry = new ServiceRegistry();
    await registry.initializeServices();
  });
  
  afterEach(async () => {
    await registry.shutdownServices();
  });
  
  it('should initialize all services successfully', async () => {
    const healthReport = await registry.checkServiceHealth();
    expect(healthReport.healthy).toBe(true);
  });
});
```

## Configuration Examples

### Development Configuration

```typescript
const devConfig: ServiceConfiguration = {
  debugMode: true,
  autoSave: false,
  weaponConfig: {
    enableCriticalHits: true,
    baseCriticalChance: 0.1
  },
  fireConfig: {
    enableFireSpread: true,
    defaultBurnDuration: 10
  }
};

serviceRegistry.configureServices(devConfig);
```

### Production Configuration

```typescript
const prodConfig: ServiceConfiguration = {
  debugMode: false,
  autoSave: true,
  maxInventorySize: 100,
  consumableConfig: {
    enableNutrition: true,
    hungerDecayRate: 0.1,
    thirstDecayRate: 0.15
  }
};

serviceRegistry.configureServices(prodConfig);
```

## Performance Considerations

### Service Caching
- Services are singletons - created once, reused
- Lazy initialization for expensive services
- Efficient service lookup via Map data structure

### Memory Management
- Services hold no game state - only business logic
- Proper cleanup during shutdown
- Garbage collection friendly patterns

### Monitoring Integration

```typescript
async checkServiceHealth(): Promise<ServiceHealthReport> {
  const startTime = Date.now();
  const services = await Promise.all([
    this.checkItemServiceHealth(),
    this.checkContainerServiceHealth(),
    // ... check other services
  ]);
  
  const responseTime = Date.now() - startTime;
  
  return {
    healthy: services.every(s => s.healthy),
    services: services.reduce((acc, s) => ({ ...acc, ...s }), {}),
    errors: services.flatMap(s => s.errors || []),
    timestamp: new Date(),
    performance: {
      averageResponseTime: responseTime,
      memoryUsage: process.memoryUsage().heapUsed,
      cacheHitRate: this.getCacheHitRate()
    }
  };
}
```

## Error Handling

### Service Unavailable
```typescript
getItemService(): IItemService {
  const service = this.services.get('itemService');
  if (!service) {
    throw new Error('ItemService not registered. Call initializeServices() first.');
  }
  return service;
}
```

### Health Check Failures
```typescript
async checkServiceHealth(): Promise<ServiceHealthReport> {
  const errors: string[] = [];
  
  try {
    const itemService = this.getItemService();
    // Perform health check
  } catch (error) {
    errors.push(`ItemService health check failed: ${error.message}`);
  }
  
  return {
    healthy: errors.length === 0,
    errors,
    timestamp: new Date()
  };
}
```

## Extension Points

### Custom Services
```typescript
interface ICustomService {
  customOperation(): void;
}

// Extend registry for custom services
interface IExtendedServiceRegistry extends IServiceRegistry {
  getCustomService(): ICustomService;
}
```

### Plugin Architecture
```typescript
interface ServicePlugin {
  name: string;
  initialize(registry: IServiceRegistry): void;
  shutdown(): void;
}

// Registry can load plugins dynamically
```

The `IServiceRegistry` interface provides a robust foundation for managing all game services while maintaining clean architecture principles and supporting comprehensive testing and monitoring capabilities.