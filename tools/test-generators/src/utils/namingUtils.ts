/**
 * Utility functions for converting scene IDs to various naming conventions
 */

/**
 * Convert scene_id to PascalCase class name
 * Examples:
 *   west_of_house -> WestOfHouse
 *   north_of_house -> NorthOfHouse
 *   maze_1 -> Maze1
 */
export function toClassName(sceneId: string): string {
  return sceneId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert scene_id to camelCase helper name
 * Examples:
 *   west_of_house -> westOfHouseHelper
 *   north_of_house -> northOfHouseHelper
 */
export function toHelperName(sceneId: string): string {
  const className = toClassName(sceneId);
  return className.charAt(0).toLowerCase() + className.slice(1) + 'Helper';
}

/**
 * Convert scene_id to directory name
 * Examples:
 *   west_of_house -> west_of_house
 *   north_of_house -> north_of_house
 */
export function toDirName(sceneId: string): string {
  return sceneId;
}

/**
 * Convert scene_id to test environment type name
 * Examples:
 *   west_of_house -> WestOfHouseTestEnvironment
 */
export function toTestEnvType(sceneId: string): string {
  return toClassName(sceneId) + 'TestEnvironment';
}

/**
 * Convert scene_id to factory name
 * Examples:
 *   west_of_house -> WestOfHouseIntegrationTestFactory
 */
export function toFactoryName(sceneId: string): string {
  return toClassName(sceneId) + 'IntegrationTestFactory';
}

/**
 * Convert scene title to readable test description
 * Examples:
 *   "West of House" -> "West of House"
 *   "The Troll Room" -> "Troll Room"
 */
export function toTestDescription(title: string): string {
  // Remove "The " prefix if present
  return title.replace(/^The\s+/, '');
}
