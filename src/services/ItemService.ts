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
  getItem(itemId: string): any {
    return this.gameState.getItem(itemId);
  }

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
        // Spatial placement - always allow putting things "on" objects
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

    // Handle door-type items with state-dependent descriptions
    if (item.tags && item.tags.includes('door')) {
      return this.getDoorExamineText(itemId, item);
    }

    return item.examineText || item.description || `It's ${item.name}.`;
  }

  /**
   * Get state-dependent examine text for door-type items
   */
  private getDoorExamineText(itemId: string, item: any): string {
    // Handle window specifically
    if (itemId === 'windo') {
      const isOpen = this.gameState.getFlag('door_windo_open');
      if (isOpen) {
        return "The window is open, providing access to the kitchen.";
      } else {
        return "The window is a closed door that could be opened.";
      }
    }

    // Handle other door items - use base examine text or generic door description
    if (item.examineText && item.examineText !== `It's ${item.name}.`) {
      return item.examineText;
    }

    // Generic door description
    return `The ${item.name} is a door.`;
  }

  readItem(itemId: string): string {
    const item = this.gameState.getItem(itemId);
    if (!item) {
      return "You don't see that here.";
    }

    // Check if item has readable content
    if (item.type === ItemType.READABLE || item.properties.readable) {
      return item.properties.readText || item.properties.readableText || "There's nothing written on it.";
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
    const isAlreadyOpen = item.state?.open || false;
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
      state: { ...item.state, open: true } 
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
    const isAlreadyClosed = !(item.state?.open || false);
    if (isAlreadyClosed) {
      return {
        success: false,
        message: `The ${item.name} is already closed.`,
        stateChanged: false
      };
    }

    // Update item state to closed
    this.gameState.updateItemState(itemId, { 
      state: { ...item.state, open: false } 
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

    // Check both item.contents and item.state.contents for compatibility
    return item.contents || item.state?.contents || [];
  }

  addToContainer(containerId: string, itemId: string): ItemResult {
    const container = this.gameState.getItem(containerId) as ContainerItem;
    const item = this.gameState.getItem(itemId);
    
    
    if (!container || !item) {
      this.logger.debug(`Missing objects - container: ${!!container}, item: ${!!item}`);
      return {
        success: false,
        message: "Something went wrong.",
        stateChanged: false
      };
    }

    if (!this.isContainer(containerId)) {
      this.logger.debug(`${containerId} is not a container`);
      return {
        success: false,
        message: `The ${container.name} is not a container.`,
        stateChanged: false
      };
    }

    if (this.isLocked(containerId)) {
      this.logger.debug(`${containerId} is locked`);
      return {
        success: false,
        message: `The ${container.name} is locked.`,
        stateChanged: false
      };
    }

    // Critical: Check if container is closed FIRST
    const isOpen = container.state?.open || false;
    if (!isOpen) {
      // Container is closed - this should fail regardless of other checks
      return {
        success: false,
        message: `The ${container.name} is closed.`,
        stateChanged: false
      };
    }

    // Check size constraints (authentic Zork validation)
    const itemSize = item.properties?.size || item.weight || 5; // Fallback to weight or default
    const containerCapacity = container.properties?.capacity || container.capacity || 10; // Fallback to capacity or default
    
    // Check if item is too big for container
    if (itemSize > containerCapacity) {
      return {
        success: false,
        message: `The ${item.name} won't fit in the ${container.name}.`,
        stateChanged: false
      };
    }
    
    // Check total capacity with current contents
    const currentContents = container.contents || [];
    const currentTotalSize = this.calculateContainerCurrentSize(currentContents);
    
    if (currentTotalSize + itemSize > containerCapacity) {
      return {
        success: false,
        message: `There's no room for the ${item.name} in the ${container.name}.`,
        stateChanged: false
      };
    }

    // Add item to container
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

  /**
   * Calculate the total size of items currently in a container
   */
  private calculateContainerCurrentSize(contents: string[]): number {
    let totalSize = 0;
    
    for (const itemId of contents) {
      const item = this.gameState.getItem(itemId);
      if (item) {
        const itemSize = item.properties?.size || item.weight || 5; // Fallback to weight or default
        totalSize += itemSize;
      }
    }
    
    return totalSize;
  }

  // Container Search and State Methods

  /**
   * Check if a container is currently open
   * @param containerId ID of the container to check
   * @returns Whether the container is open
   */
  isContainerOpen(containerId: string): boolean {
    const container = this.gameState.getItem(containerId);
    if (!container || !this.isContainer(containerId)) {
      return false;
    }
    // Check both 'open' and 'isOpen' properties for compatibility
    return container.state?.open || container.state?.isOpen || false;
  }

  /**
   * Find an item by name in open containers
   * @param itemName Name or alias of the item to find
   * @param containerIds Array of container IDs to search in
   * @returns Item ID if found, null otherwise
   */
  findItemInOpenContainers(itemName: string, containerIds: string[]): string | null {
    const lowerName = itemName.toLowerCase();
    
    for (const containerId of containerIds) {
      if (this.isContainer(containerId) && this.isContainerOpen(containerId)) {
        const contents = this.getContainerContents(containerId);
        for (const contentId of contents) {
          const item = this.gameState.getItem(contentId);
          if (item && this.itemMatches(item, lowerName)) {
            return contentId;
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if an item matches a name or alias
   * @param item Item to check
   * @param name Name to match against (should be lowercase)
   * @returns Whether the item matches
   */
  itemMatches(item: any, name: string): boolean {
    const itemName = item.name.toLowerCase();
    // Strip common English articles from the search term
    const searchName = name.toLowerCase().replace(/^(the|a|an)\s+/i, '').trim();
    
    // Exact name match
    if (itemName === searchName) {
      return true;
    }
    
    // Check aliases if they exist
    if (item.aliases && Array.isArray(item.aliases)) {
      // Check for exact alias match
      if (item.aliases.some((alias: string) => alias.toLowerCase() === searchName)) {
        return true;
      }
      
      // Check for multi-word alias matching (e.g., "large coil" matches aliases ["COIL", "LARGE"])
      const searchWords = searchName.split(' ').filter(word => word.length > 0);
      if (searchWords.length > 1) {
        const aliasesLower = item.aliases.map((alias: string) => alias.toLowerCase());
        const matchedWords = searchWords.filter(word => aliasesLower.includes(word));
        
        // For multi-word searches, require at least half the words to match aliases
        // This allows "square brick" (50% = 1 word) and "large coil" (100% = 2 words)
        const requiredMatches = Math.max(1, Math.floor(searchWords.length / 2));
        if (matchedWords.length >= requiredMatches) {
          return true;
        }
        
        // Also check if the item name contains all search words or partial alias matches
        const nameWords = itemName.split(' ');
        const nameWordsMatch = searchWords.every((word: string) => 
          nameWords.some((nameWord: string) => nameWord.includes(word)) ||
          aliasesLower.some((alias: string) => alias.includes(word) || word.startsWith(alias))
        );
        if (nameWordsMatch) {
          return true;
        }
      }
      
      // Check if any search word matches any alias (for single-word partial matches)
      const aliasesLower = item.aliases.map((alias: string) => alias.toLowerCase());
      const hasAliasMatch = searchWords.some((word: string) => {
        return aliasesLower.some((alias: string) => 
          alias === word || // exact match
          word.startsWith(alias) || // "square" starts with "squar"
          alias.startsWith(word) // "squar" starts with some shorter form
        );
      });
      if (hasAliasMatch) {
        return true;
      }
    }
    
    // Check for partial word matches in item name (for cases like "bottle" matching "glass bottle")
    const nameWords = itemName.split(' ');
    if (nameWords.some((word: string) => word === searchName)) {
      return true;
    }
    
    return false;
  }
}