/**
 * Commands Index
 * Exports command base classes, interfaces, and implementations
 */

// Base classes and interfaces
export { BaseCommand } from './BaseCommand';
export { ICommand } from './interfaces/ICommand';
export type { CommandResult } from '../types/CommandTypes';

// Command implementations
export { LookCommand } from './LookCommand';
export { ExamineCommand } from './ExamineCommand';
export { ReadCommand } from './ReadCommand';
export { OpenCommand } from './OpenCommand';
export { InventoryCommand } from './InventoryCommand';
export { MoveCommand } from './MoveCommand';