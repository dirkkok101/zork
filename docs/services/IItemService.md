# IItemService Interface

The `IItemService` interface handles core item operations and basic interactions in the Zork game. It serves as the foundation for all item-related functionality.

## Responsibility

Following the Single Responsibility Principle, `IItemService` is responsible for:
- Basic item lifecycle operations (take, drop, examine)
- Core item interactions (read, search, turn, push, pull)
- Item state management and property access
- Generic interaction handling

## Coverage

This service covers **5 of 9** interaction commands from the extracted game data:
- `examine` (214 items) - Most common interaction
- `take` (102 items) - Pick up portable items
- `read` (33 items) - Read text on items
- `turn` (4 items) - Turn dials, switches, mechanisms
- `search` (2 items) - Search for hidden contents

## Interface Methods

### Core Operations

#### `getItem(itemId: string): Item | undefined`
Retrieves an item by its unique identifier.
- **Parameters**: itemId - Unique item identifier
- **Returns**: Item object or undefined if not found
- **Use Case**: Foundation method for all other operations

#### `findItem(nameOrId: string, inventoryOnly?: boolean): Item | undefined`
Finds an item by name or ID in inventory or current scene.
- **Parameters**: 
  - nameOrId - Item name or ID to search for
  - inventoryOnly - Optional flag to search only inventory
- **Returns**: Found item or undefined
- **Use Case**: Player command parsing and item lookup

#### `itemMatches(item: Item, nameOrId: string): boolean`
Checks if an item matches a given name or ID.
- **Parameters**: 
  - item - Item to check
  - nameOrId - Name or ID to match against
- **Returns**: Whether the item matches
- **Use Case**: Flexible item identification with aliases

### Basic Interactions

#### `takeItem(itemNameOrId: string): ItemOperationResult`
Takes an item from the current scene and adds to inventory.
- **Parameters**: itemNameOrId - Name or ID of item to take
- **Returns**: Result with success status and message
- **Validation**: Checks if item is portable and available
- **Side Effects**: Removes from scene, adds to inventory

#### `dropItem(itemNameOrId: string): ItemOperationResult`
Drops an item from inventory to the current scene.
- **Parameters**: itemNameOrId - Name or ID of item to drop
- **Returns**: Result with success status and message
- **Validation**: Checks if item is in inventory
- **Side Effects**: Removes from inventory, adds to scene

#### `examineItem(itemNameOrId: string): ItemOperationResult`
Examines an item to get detailed description.
- **Parameters**: itemNameOrId - Name or ID of item to examine
- **Returns**: Result with examination text
- **Use Case**: Most common player action for exploration

#### `readItem(itemNameOrId: string): ItemOperationResult`
Reads text content from readable items (books, signs, labels).
- **Parameters**: itemNameOrId - Name or ID of item to read
- **Returns**: Result with readable text content
- **Validation**: Checks if item has readable content

### Physical Interactions

#### `searchItem(itemNameOrId: string): ItemOperationResult`
Searches an item for hidden contents or information.
- **Parameters**: itemNameOrId - Name or ID of item to search
- **Returns**: Result with discovered items or information
- **Use Case**: Finding hidden compartments, secret items

#### `turnItem(itemNameOrId: string, direction?: string): ItemOperationResult`
Turns an item like dials, switches, or mechanisms.
- **Parameters**: 
  - itemNameOrId - Name or ID of item to turn
  - direction - Optional direction (clockwise, counterclockwise)
- **Returns**: Result of turn operation
- **Use Case**: Operating machinery, adjusting settings

#### `pushItem(itemNameOrId: string): ItemOperationResult`
Pushes an item (buttons, movable objects).
- **Parameters**: itemNameOrId - Name or ID of item to push
- **Returns**: Result of push operation
- **Use Case**: Activating mechanisms, moving furniture

#### `pullItem(itemNameOrId: string): ItemOperationResult`
Pulls an item (levers, ropes, movable objects).
- **Parameters**: itemNameOrId - Name or ID of item to pull
- **Returns**: Result of pull operation
- **Use Case**: Operating levers, moving obstacles

### Generic Interaction

#### `interactWithItem(itemNameOrId: string, action: string, target?: string): ItemOperationResult`
Handles any item interaction via the item's interactions array.
- **Parameters**: 
  - itemNameOrId - Name or ID of item
  - action - Action to perform
  - target - Optional target for the action
- **Returns**: Result of the interaction
- **Use Case**: Fallback for custom item behaviors

#### `canInteractWith(itemNameOrId: string, action: string): boolean`
Checks if an interaction is possible with an item.
- **Parameters**: 
  - itemNameOrId - Name or ID of item
  - action - Action to check
- **Returns**: Whether interaction is possible
- **Use Case**: Command validation and suggestion

#### `getAvailableInteractions(itemNameOrId: string): string[]`
Gets all possible interactions for an item.
- **Parameters**: itemNameOrId - Name or ID of item
- **Returns**: Array of available interaction commands
- **Use Case**: Help system, command suggestions

### State Management

#### `getItemProperty(itemId: string, property: string): any`
Gets a current state property of an item.
- **Parameters**: 
  - itemId - ID of the item
  - property - Property name to get
- **Returns**: Property value
- **Use Case**: Checking item states (open, lit, etc.)

#### `setItemProperty(itemId: string, property: string, value: any): void`
Sets a state property of an item.
- **Parameters**: 
  - itemId - ID of the item
  - property - Property name to set
  - value - Value to set
- **Use Case**: Updating item states during interactions

#### `updateItemState(itemId: string, updates: Record<string, any>): void`
Updates multiple properties of an item's state.
- **Parameters**: 
  - itemId - ID of the item
  - updates - Object with property updates
- **Use Case**: Bulk state updates for complex interactions

## Integration with Other Services

### Container Service
```typescript
// IItemService handles basic operations
const takeResult = itemService.takeItem("key");

// IContainerService handles container-specific operations
const openResult = containerService.openContainer("chest");
```

### Physical Interaction Service
```typescript
// IItemService handles basic physical interactions
const pushResult = itemService.pushItem("button");

// IPhysicalInteractionService handles complex physical operations
const climbResult = physicalService.climbItem("tree");
```

## Error Handling

All methods return `ItemOperationResult` with consistent error handling:

```typescript
interface ItemOperationResult {
  success: boolean;
  message: string;
  scoreChange?: number;
  stateUpdates?: any;
}
```

### Common Error Scenarios
- **Item not found**: "You don't see any {item} here."
- **Not portable**: "You can't take the {item}."
- **Not in inventory**: "You aren't carrying a {item}."
- **Invalid interaction**: "You can't {action} the {item}."

## Testing Strategies

### Unit Testing
```typescript
describe('IItemService', () => {
  let itemService: IItemService;
  let mockGameState: GameState;
  
  beforeEach(() => {
    // Setup mocks
  });
  
  it('should take portable items successfully', () => {
    const result = itemService.takeItem('lamp');
    expect(result.success).toBe(true);
    expect(result.message).toContain('You take the lamp');
  });
});
```

### Integration Testing
- Test with real item data from JSON files
- Verify state changes persist correctly
- Test interaction combinations

## Performance Considerations

### Optimization Strategies
- **Item Lookup Caching**: Cache frequently accessed items
- **State Batching**: Batch multiple state updates
- **Lazy Loading**: Load item details only when needed

### Memory Management
- Services are stateless - game state managed separately
- Efficient item matching algorithms
- Minimal object creation during operations

## Usage Examples

### Basic Item Operations
```typescript
class TakeCommand {
  constructor(private itemService: IItemService) {}
  
  execute(itemName: string): ItemOperationResult {
    return this.itemService.takeItem(itemName);
  }
}
```

### Complex Interactions
```typescript
class ExamineCommand {
  constructor(private itemService: IItemService) {}
  
  execute(itemName: string): ItemOperationResult {
    const result = this.itemService.examineItem(itemName);
    
    if (result.success) {
      // Check for additional interactions
      const interactions = this.itemService.getAvailableInteractions(itemName);
      if (interactions.length > 1) {
        result.message += `\n\nYou can ${interactions.slice(1).join(', ')} the ${itemName}.`;
      }
    }
    
    return result;
  }
}
```

## Extension Points

The interface can be extended for game-specific behaviors:

### Custom Item Types
```typescript
interface IEnhancedItemService extends IItemService {
  // Add game-specific methods
  repairItem(itemNameOrId: string): ItemOperationResult;
  upgradeItem(itemNameOrId: string, material: string): ItemOperationResult;
}
```

### Event Integration
```typescript
// Services can emit events for UI updates
interface IEventAwareItemService extends IItemService {
  onItemTaken: (item: Item) => void;
  onItemDropped: (item: Item) => void;
}
```

The `IItemService` interface provides a solid foundation for all item operations while maintaining clean separation of concerns and supporting the full complexity of the Zork game system.