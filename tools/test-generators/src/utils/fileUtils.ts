/**
 * File utility functions for the test generator
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure a directory exists, create it if it doesn't
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write content to a file, creating directories as needed
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Read file content
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Get the test output directory for a scene
 */
export function getSceneTestDir(sceneId: string, baseDir?: string): string {
  if (baseDir) {
    return path.join(baseDir, sceneId);
  }

  // Determine project root based on current working directory
  const cwd = process.cwd();
  let projectRoot: string;

  if (cwd.endsWith('test-generators')) {
    // Running from tools/test-generators
    projectRoot = path.resolve(cwd, '../..');
  } else {
    // Running from project root
    projectRoot = cwd;
  }

  return path.join(projectRoot, 'testing', 'scenes', sceneId);
}

/**
 * Format TypeScript code using basic formatting
 * (In production, this would use Prettier)
 */
export function formatCode(code: string): string {
  // Basic formatting - normalize line endings and indentation
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim() + '\n';
}
