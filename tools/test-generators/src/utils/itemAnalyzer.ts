/**
 * ItemAnalyzer - Analyzes item JSON to determine test requirements
 *
 * Examines item properties, type, interactions, and state to determine
 * what commands can be applied and what tests should be generated.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AnalyzedItem {
  // Basic info
  id: string;
  name: string;
  description: string;
  examineText: string;
  aliases: string[];

  // Item classification
  type: string;
  portable: boolean;
  visible: boolean;
  weight: number;
  size: string;

  // Capabilities (what commands apply)
  canTake: boolean;
  canDrop: boolean;
  canExamine: boolean;
  canRead: boolean;
  canOpen: boolean;
  canClose: boolean;
  canPutInto: boolean;
  canTurnOn: boolean;
  canTurnOff: boolean;

  // Container properties
  isContainer: boolean;
  capacity?: number;
  initialContents?: string[];

  // Readable properties
  isReadable: boolean;
  readText?: string;

  // Weapon/tool properties
  isWeapon: boolean;
  isTool: boolean;

  // Treasure properties
  isTreasure: boolean;
  treasureValue?: number;

  // State properties
  hasState: boolean;
  initialState: any;
  statefulProperties: string[];

  // Interaction details
  interactions: ItemInteraction[];

  // Tags and properties
  tags: string[];
  properties: any;
}

export interface ItemInteraction {
  command: string;
  condition?: string;
  effect?: string;
  message: string;
}

export class ItemAnalyzer {
  private dataPath: string;

  constructor(dataPath?: string) {
    // Default to project root data directory
    if (dataPath) {
      this.dataPath = dataPath;
    } else {
      // Check if we're in project root or tools subdirectory
      const cwd = process.cwd();
      if (cwd.endsWith('test-generators')) {
        // Running from tools/test-generators
        this.dataPath = path.resolve(cwd, '../../data');
      } else {
        // Running from project root
        this.dataPath = path.join(cwd, 'data');
      }
    }
  }

  /**
   * Analyze an item JSON file and return capabilities
   */
  async analyzeItem(itemId: string): Promise<AnalyzedItem> {
    const itemData = await this.loadItemData(itemId);

    // Determine capabilities
    const canTake = this.canItemBeTaken(itemData);
    const canDrop = canTake; // If takeable, can be dropped
    const canExamine = true; // All items can be examined
    const canRead = this.isItemReadable(itemData);
    const isContainer = this.isItemContainer(itemData);
    const canOpen = isContainer;
    const canClose = isContainer;
    const canPutInto = isContainer;
    const canTurnOn = this.isItemSwitchable(itemData);
    const canTurnOff = canTurnOn;

    // Extract state properties
    const hasState = Object.keys(itemData.initialState || {}).length > 0;
    const statefulProperties = hasState ? Object.keys(itemData.initialState) : [];

    // Determine item categories
    const isWeapon = itemData.type === 'WEAPON';
    const isTool = itemData.type === 'TOOL';
    const isTreasure = itemData.type === 'TREASURE';

    // Extract container properties
    const capacity = itemData.properties?.capacity;
    const initialContents = itemData.initialState?.contents;

    // Extract readable properties
    const readText = itemData.properties?.readText;

    // Extract treasure properties
    const treasureValue = itemData.properties?.treasureValue;

    return {
      // Basic info
      id: itemData.id,
      name: itemData.name,
      description: itemData.description,
      examineText: itemData.examineText,
      aliases: itemData.aliases || [],

      // Classification
      type: itemData.type,
      portable: itemData.portable,
      visible: itemData.visible,
      weight: itemData.weight,
      size: itemData.size,

      // Capabilities
      canTake,
      canDrop,
      canExamine,
      canRead,
      canOpen,
      canClose,
      canPutInto,
      canTurnOn,
      canTurnOff,

      // Container properties
      isContainer,
      capacity,
      initialContents,

      // Readable properties
      isReadable: canRead,
      readText,

      // Weapon/tool properties
      isWeapon,
      isTool,

      // Treasure properties
      isTreasure,
      treasureValue,

      // State properties
      hasState,
      initialState: itemData.initialState,
      statefulProperties,

      // Interactions
      interactions: itemData.interactions || [],

      // Tags and properties
      tags: itemData.tags || [],
      properties: itemData.properties || {}
    };
  }

  /**
   * Analyze all items in a scene
   */
  async analyzeSceneItems(itemIds: string[]): Promise<AnalyzedItem[]> {
    const items: AnalyzedItem[] = [];

    for (const itemId of itemIds) {
      try {
        const item = await this.analyzeItem(itemId);
        items.push(item);
      } catch (error: any) {
        console.warn(`Warning: Could not analyze item ${itemId}: ${error.message}`);
      }
    }

    return items;
  }

  /**
   * Group items by capability for test generation
   */
  groupItemsByCapability(items: AnalyzedItem[]): {
    takeable: AnalyzedItem[];
    droppable: AnalyzedItem[];
    examinable: AnalyzedItem[];
    readable: AnalyzedItem[];
    containers: AnalyzedItem[];
    switchable: AnalyzedItem[];
    weapons: AnalyzedItem[];
    treasures: AnalyzedItem[];
    stateful: AnalyzedItem[];
  } {
    return {
      takeable: items.filter(i => i.canTake),
      droppable: items.filter(i => i.canDrop),
      examinable: items.filter(i => i.canExamine),
      readable: items.filter(i => i.canRead),
      containers: items.filter(i => i.isContainer),
      switchable: items.filter(i => i.canTurnOn),
      weapons: items.filter(i => i.isWeapon),
      treasures: items.filter(i => i.isTreasure),
      stateful: items.filter(i => i.hasState)
    };
  }

  /**
   * Determine test requirements for items
   */
  determineTestRequirements(items: AnalyzedItem[]): {
    needsTakeTests: boolean;
    needsDropTests: boolean;
    needsExamineTests: boolean;
    needsReadTests: boolean;
    needsOpenCloseTests: boolean;
    needsPutTests: boolean;
    needsStateTests: boolean;
    needsScoringTests: boolean;
    estimatedTestCount: number;
  } {
    const grouped = this.groupItemsByCapability(items);

    const needsTakeTests = grouped.takeable.length > 0;
    const needsDropTests = grouped.droppable.length > 0;
    const needsExamineTests = grouped.examinable.length > 0;
    const needsReadTests = grouped.readable.length > 0;
    const needsOpenCloseTests = grouped.containers.length > 0;
    const needsPutTests = grouped.containers.length > 0;
    const needsStateTests = grouped.stateful.length > 0;
    const needsScoringTests = grouped.treasures.length > 0;

    // Estimate test count
    let estimatedTestCount = 0;
    estimatedTestCount += grouped.takeable.length * 5; // Take tests per item
    estimatedTestCount += grouped.droppable.length * 3; // Drop tests per item
    estimatedTestCount += grouped.examinable.length * 3; // Examine tests per item
    estimatedTestCount += grouped.readable.length * 4; // Read tests per item
    estimatedTestCount += grouped.containers.length * 8; // Open/close tests per container
    estimatedTestCount += grouped.containers.length * 5; // Put tests per container
    estimatedTestCount += grouped.stateful.length * 5; // State tests per stateful item
    estimatedTestCount += grouped.treasures.length * 6; // Scoring tests per treasure

    return {
      needsTakeTests,
      needsDropTests,
      needsExamineTests,
      needsReadTests,
      needsOpenCloseTests,
      needsPutTests,
      needsStateTests,
      needsScoringTests,
      estimatedTestCount
    };
  }

  /**
   * Load item JSON data
   */
  private async loadItemData(itemId: string): Promise<any> {
    const itemPath = path.join(this.dataPath, 'items', `${itemId}.json`);

    if (!fs.existsSync(itemPath)) {
      throw new Error(`Item file not found: ${itemPath}`);
    }

    const content = fs.readFileSync(itemPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Check if item can be taken
   */
  private canItemBeTaken(itemData: any): boolean {
    // Item is takeable if it's portable
    return itemData.portable === true;
  }

  /**
   * Check if item is readable
   */
  private isItemReadable(itemData: any): boolean {
    // Check tags
    if (itemData.tags && itemData.tags.includes('readable')) {
      return true;
    }

    // Check properties
    if (itemData.properties && itemData.properties.readable === true) {
      return true;
    }

    // Check for read interaction
    if (itemData.interactions) {
      return itemData.interactions.some((i: any) => i.command === 'read');
    }

    return false;
  }

  /**
   * Check if item is a container
   */
  private isItemContainer(itemData: any): boolean {
    // Check type
    if (itemData.type === 'CONTAINER') {
      return true;
    }

    // Check tags
    if (itemData.tags && itemData.tags.includes('container')) {
      return true;
    }

    // Check properties
    if (itemData.properties && itemData.properties.container === true) {
      return true;
    }

    // Check for open/close interactions
    if (itemData.interactions) {
      const hasOpen = itemData.interactions.some((i: any) => i.command === 'open');
      const hasClose = itemData.interactions.some((i: any) => i.command === 'close');
      if (hasOpen && hasClose) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if item is switchable (can turn on/off)
   */
  private isItemSwitchable(itemData: any): boolean {
    // Check tags
    if (itemData.tags && itemData.tags.includes('switchable')) {
      return true;
    }

    // Check properties
    if (itemData.properties && itemData.properties.switchable === true) {
      return true;
    }

    // Check for turn on/off interactions
    if (itemData.interactions) {
      const hasTurnOn = itemData.interactions.some((i: any) => i.command === 'turn on');
      const hasTurnOff = itemData.interactions.some((i: any) => i.command === 'turn off');
      if (hasTurnOn && hasTurnOff) {
        return true;
      }
    }

    return false;
  }
}
