import { IItemService, ItemResult } from './interfaces/IItemService';
import { IGameStateService } from './interfaces/IGameStateService';
import { ItemType, ContainerItem, LightSourceItem, LockableItem } from '../types/ItemTypes';
import log from 'loglevel';

/**
 * Item Service
 * Handles item business logic and interactions
 */
export class ItemService implements IItemService {
  private logger: log.Logger;

  constructor(
    private gameState: IGameStateService,
    logger?: log.Logger
  ) {
    this.logger = logger || log.getLogger('ItemService');
  }

  // Basic Operations
  canTake(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return false;
    }
    return item.portable && item.visible;
  }

  takeItem(itemId: string): ItemResult {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: "You don't see that here.",
        stateChanged: false
      };
    }

    if (!this.canTake(itemId)) {
      if (!item.visible) {
        return {
          success: false,
          message: "You don't see that here.",
          stateChanged: false
        };
      }
      
      if (!item.portable) {
        return {
          success: false,
          message: `You can't take the ${item.name}.`,
          stateChanged: false
        };
      }
      
      return {
        success: false,
        message: `You can't take the ${item.name}.`,
        stateChanged: false
      };
    }

    return {
      success: true,
      message: `You take the ${item.name}.`,
      stateChanged: true
    };
  }

  putItem(itemId: string, targetId?: string, preposition?: string): ItemResult {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: "You don't have that item.",
        stateChanged: false
      };
    }

    // If no target specified, just putting down (same as drop)
    if (!targetId) {
      return {
        success: true,
        message: `You put down the ${item.name}.`,
        stateChanged: true
      };
    }

    const target = this.gameState.getItem(targetId);
    if (!target) {
      return {
        success: false,
        message: "You don't see that here.",
        stateChanged: false
      };
    }

    // Handle different prepositions
    switch (preposition) {
      case 'in':
        if (!this.isContainer(targetId)) {
          return {
            success: false,
            message: `You can't put anything in the ${target.name}.`,
            stateChanged: false
          };
        }
        return this.addToContainer(targetId, itemId);

      case 'on':
        // For now, treat 'on' similar to 'in' for containers
        if (this.isContainer(targetId)) {
          return this.addToContainer(targetId, itemId);
        }
        return {
          success: true,
          message: `You put the ${item.name} on the ${target.name}.`,
          stateChanged: true
        };

      case 'under':
        return {
          success: true,
          message: `You put the ${item.name} under the ${target.name}.`,
          stateChanged: true
        };

      default:
        // Default to 'in' behavior for containers
        if (this.isContainer(targetId)) {
          return this.addToContainer(targetId, itemId);
        }
        return {
          success: true,
          message: `You put the ${item.name} near the ${target.name}.`,
          stateChanged: true
        };
    }
  }

  examineItem(itemId: string): string {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      this.logger.warn(`Cannot examine non-existent item: ${itemId}`);
      return "You don't see that here.";
    }

    return item.examineText || item.description || `It's ${item.name}.`;
  }

  readItem(itemId: string): string {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return "You don't see that here.";
    }

    // Check if item has readable content
    if (item.type === ItemType.READABLE || item.properties.readable) {
      return item.properties.readableText || "There's nothing written on it.";
    }

    return "You can't read that.";
  }

  useItem(itemId: string, _targetId?: string): ItemResult {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: "You don't have that item.",
        stateChanged: false
      };
    }

    // Basic use implementation - can be extended
    return {
      success: true,
      message: `You use the ${item.name}.`,
      stateChanged: false
    };
  }

  // Container Operations
  isContainer(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return false;
    }
    return item.type === ItemType.CONTAINER || item.properties.container === true;
  }

  canOpen(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return false;
    }
    return this.isContainer(itemId) || item.properties.openable === true;
  }

  openItem(itemId: string, keyId?: string): ItemResult {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: "You don't see that here.",
        stateChanged: false
      };
    }

    if (!this.canOpen(itemId)) {
      return {
        success: false,
        message: `You can't open the ${item.name}.`,
        stateChanged: false
      };
    }

    // Check if item is already open
    const isAlreadyOpen = item.state?.isOpen || (item as any).isOpen;
    if (isAlreadyOpen) {
      return {
        success: false,
        message: `The ${item.name} is already open.`,
        stateChanged: false
      };
    }

    // Handle locked items
    if (this.isLocked(itemId)) {
      if (!keyId) {
        return {
          success: false,
          message: `The ${item.name} is locked.`,
          stateChanged: false
        };
      }

      // Try to unlock with the provided key
      const unlockResult = this.unlockItem(itemId, keyId);
      if (!unlockResult.success) {
        return unlockResult;
      }

      // If unlock was successful, continue to open
    }

    // Update item state to open - store in state object
    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isOpen: true } 
    });
    
    const keyMessage = keyId ? ` with the ${this.gameState.getItem(keyId)?.name}` : '';
    return {
      success: true,
      message: `You open the ${item.name}${keyMessage}.`,
      stateChanged: true
    };
  }

  closeItem(itemId: string): ItemResult {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: "You don't see that here.",
        stateChanged: false
      };
    }

    if (!this.canOpen(itemId)) {
      return {
        success: false,
        message: `You can't close the ${item.name}.`,
        stateChanged: false
      };
    }

    // Check if item is already closed
    const isAlreadyClosed = !(item.state?.isOpen || (item as any).isOpen);
    if (isAlreadyClosed) {
      return {
        success: false,
        message: `The ${item.name} is already closed.`,
        stateChanged: false
      };
    }

    // Update item state to closed
    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isOpen: false } 
    });
    
    return {
      success: true,
      message: `You close the ${item.name}.`,
      stateChanged: true
    };
  }

  getContainerContents(itemId: string): string[] {
    const item = this.gameState.getItem(itemId) as ContainerItem;
    if (!item || !this.isContainer(itemId)) {
      return [];
    }

    return item.contents || [];
  }

  addToContainer(containerId: string, itemId: string): ItemResult {
    const container = this.gameState.getItem(containerId) as ContainerItem;
    const item = this.gameState.getItem(itemId);
    
    if (!container || !item) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanged: false
      };
    }

    if (!this.isContainer(containerId)) {
      return {
        success: false,
        message: `The ${container.name} is not a container.`,
        stateChanged: false
      };
    }

    if (this.isLocked(containerId)) {
      return {
        success: false,
        message: `The ${container.name} is locked.`,
        stateChanged: false
      };
    }

    const isOpen = container.state?.isOpen || container.isOpen;
    if (!isOpen && this.canOpen(containerId)) {
      return {
        success: false,
        message: `The ${container.name} is closed.`,
        stateChanged: false
      };
    }

    // Add item to container
    const currentContents = container.contents || [];
    const newContents = [...currentContents, itemId];
    
    // Update the container's contents in its properties
    const updatedContainer = { 
      ...container, 
      contents: newContents 
    } as ContainerItem;
    this.gameState.updateItemState(containerId, updatedContainer);
    
    return {
      success: true,
      message: `You put the ${item.name} in the ${container.name}.`,
      stateChanged: true
    };
  }

  removeFromContainer(containerId: string, itemId: string): ItemResult {
    const container = this.gameState.getItem(containerId) as ContainerItem;
    const item = this.gameState.getItem(itemId);
    
    if (!container || !item) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanged: false
      };
    }

    if (!this.isContainer(containerId)) {
      return {
        success: false,
        message: `The ${container.name} is not a container.`,
        stateChanged: false
      };
    }

    if (!container.contents || !container.contents.includes(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is not in the ${container.name}.`,
        stateChanged: false
      };
    }

    // Remove item from container
    const newContents = container.contents.filter(id => id !== itemId);
    
    // Update the container's contents in its properties
    const updatedContainer = { 
      ...container, 
      contents: newContents 
    } as ContainerItem;
    this.gameState.updateItemState(containerId, updatedContainer);
    
    return {
      success: true,
      message: `You take the ${item.name} from the ${container.name}.`,
      stateChanged: true
    };
  }

  // Light Source Operations
  isLightSource(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return false;
    }
    return item.type === ItemType.LIGHT_SOURCE || item.properties.lightSource === true;
  }

  isLit(itemId: string): boolean {
    const item = this.gameState.getItem(itemId) as LightSourceItem;
    if (!item || !this.isLightSource(itemId)) {
      return false;
    }
    return item.state?.isLit || item.isLit || false;
  }

  lightOn(itemId: string): ItemResult {
    const item = this.gameState.getItem(itemId) as LightSourceItem;
    if (!item) {
      return {
        success: false,
        message: "You don't have that item.",
        stateChanged: false
      };
    }

    if (!this.isLightSource(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is not a light source.`,
        stateChanged: false
      };
    }

    if (this.isLit(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is already lit.`,
        stateChanged: false
      };
    }

    // Check if it has fuel
    if (item.remainingFuel !== undefined && item.remainingFuel <= 0) {
      return {
        success: false,
        message: `The ${item.name} is out of fuel.`,
        stateChanged: false
      };
    }

    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isLit: true } 
    });
    
    return {
      success: true,
      message: `The ${item.name} is now lit.`,
      stateChanged: true
    };
  }

  lightOff(itemId: string): ItemResult {
    const item = this.gameState.getItem(itemId) as LightSourceItem;
    if (!item) {
      return {
        success: false,
        message: "You don't have that item.",
        stateChanged: false
      };
    }

    if (!this.isLightSource(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is not a light source.`,
        stateChanged: false
      };
    }

    if (!this.isLit(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is not lit.`,
        stateChanged: false
      };
    }

    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isLit: false } 
    });
    
    return {
      success: true,
      message: `The ${item.name} is now extinguished.`,
      stateChanged: true
    };
  }

  // Lock Operations
  isLockable(itemId: string): boolean {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return false;
    }
    return item.properties.lockable === true || item.properties.requiredKey !== undefined;
  }

  isLocked(itemId: string): boolean {
    const item = this.gameState.getItem(itemId) as LockableItem;
    if (!item || !this.isLockable(itemId)) {
      return false;
    }
    return item.state?.isLocked || item.isLocked || false;
  }

  lockItem(itemId: string, keyId: string): ItemResult {
    const item = this.gameState.getItem(itemId) as LockableItem;
    const key = this.gameState.getItem(keyId);
    
    if (!item || !key) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanged: false
      };
    }

    if (!this.isLockable(itemId)) {
      return {
        success: false,
        message: `The ${item.name} cannot be locked.`,
        stateChanged: false
      };
    }

    if (this.isLocked(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is already locked.`,
        stateChanged: false
      };
    }

    // Check if key matches
    if (item.requiredKey && item.requiredKey !== keyId) {
      return {
        success: false,
        message: `The ${key.name} doesn't fit.`,
        stateChanged: false
      };
    }

    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isLocked: true } 
    });
    
    return {
      success: true,
      message: `You lock the ${item.name} with the ${key.name}.`,
      stateChanged: true
    };
  }

  unlockItem(itemId: string, keyId: string): ItemResult {
    const item = this.gameState.getItem(itemId) as LockableItem;
    const key = this.gameState.getItem(keyId);
    
    if (!item || !key) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanged: false
      };
    }

    if (!this.isLockable(itemId)) {
      return {
        success: false,
        message: `The ${item.name} cannot be unlocked.`,
        stateChanged: false
      };
    }

    if (!this.isLocked(itemId)) {
      return {
        success: false,
        message: `The ${item.name} is not locked.`,
        stateChanged: false
      };
    }

    // Check if key matches
    if (item.requiredKey && item.requiredKey !== keyId) {
      return {
        success: false,
        message: `The ${key.name} doesn't fit.`,
        stateChanged: false
      };
    }

    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, isLocked: false } 
    });
    
    return {
      success: true,
      message: `You unlock the ${item.name} with the ${key.name}.`,
      stateChanged: true
    };
  }
}