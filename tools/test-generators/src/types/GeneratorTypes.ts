/**
 * Type definitions for the Scene Test Generator
 */

export interface SceneExit {
  direction: string;
  to: string | null;
  condition?: string;
  failureMessage?: string;
  blocked?: boolean;
}

export interface AnalyzedItem {
  id: string;
  type: 'container' | 'treasure' | 'tool' | 'readable' | 'weapon' | 'consumable' | 'generic';
  isTakeable: boolean;
  isContainer: boolean;
  isReadable: boolean;
}

export interface AnalyzedScene {
  // Basic info
  id: string;
  title: string;
  description: string;
  className: string;           // "NorthOfHouse"
  helperName: string;          // "NorthOfHouseHelper"
  testEnvType: string;         // "NorthOfHouseTestEnvironment"
  factoryName: string;         // "NorthOfHouseIntegrationTestFactory"

  // Scene properties
  lighting: 'daylight' | 'lit' | 'dark' | 'pitch_black';
  region: 'above_ground' | 'underground' | 'maze' | 'endgame';
  firstVisitPoints: number | null;
  atmosphere: string[];
  tags: string[];

  // Test requirements
  hasItems: boolean;
  hasMonsters: boolean;
  hasConditionalExits: boolean;
  hasBlockedExits: boolean;
  hasFirstVisitPoints: boolean;
  hasAtmosphere: boolean;

  // Exit analysis
  exits: {
    simple: Array<{direction: string; to: string}>;
    conditional: Array<{direction: string; to: string; condition: string; failureMessage: string}>;
    blocked: Array<{direction: string; failureMessage: string}>;
  };

  // Item analysis
  items: AnalyzedItem[];

  // Monster analysis
  monsters: string[];

  // Test complexity
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface GeneratorOptions {
  outputDir?: string;
  overwrite?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'helper' | 'test' | 'factory';
}

export interface GenerationResult {
  sceneId: string;
  files: GeneratedFile[];
  success: boolean;
  errors: string[];
  warnings: string[];
}
