import { IOutputService } from './interfaces/IOutputService';
import { Scene } from '../types/SceneTypes';
import log from 'loglevel';

/**
 * Output Service
 * Handles displaying messages and formatted output to the user interface
 */
export class OutputService implements IOutputService {
  private logger: log.Logger;

  constructor(logger?: log.Logger) {
    this.logger = logger || log.getLogger('OutputService');
  }

  /**
   * Display a general message to the user
   */
  showMessage(message: string): void {
    this.logger.debug(`Showing message: ${message}`);
    // For now, just log to console - in a full implementation this would
    // send to the UI layer
    console.log(message);
  }

  /**
   * Display an error message to the user
   */
  showError(error: string): void {
    this.logger.debug(`Showing error: ${error}`);
    // In a full implementation, this might format errors differently
    console.error(`Error: ${error}`);
  }

  /**
   * Display a formatted scene description
   */
  showScene(scene: Scene): void {
    this.logger.debug(`Showing scene: ${scene.id}`);
    
    let output = `\n${scene.title}\n`;
    output += scene.description;
    
    // Add atmospheric details if any
    if (scene.atmosphere && scene.atmosphere.length > 0) {
      const randomAtmosphere = scene.atmosphere[Math.floor(Math.random() * scene.atmosphere.length)];
      output += `\n${randomAtmosphere}`;
    }
    
    this.showMessage(output);
  }

  /**
   * Display formatted inventory
   */
  showInventory(items: string[]): void {
    this.logger.debug(`Showing inventory with ${items.length} items`);
    
    if (items.length === 0) {
      this.showMessage("You are empty-handed.");
      return;
    }

    let output = "You are carrying:\n";
    for (const itemName of items) {
      output += `  ${itemName}\n`;
    }
    
    this.showMessage(output.trim());
  }

  /**
   * Display current score
   */
  showScore(score: number): void {
    this.logger.debug(`Showing score: ${score}`);
    this.showMessage(`Your score is ${score} points.`);
  }

  /**
   * Clear the display (if supported by the UI)
   */
  clear(): void {
    this.logger.debug('Clearing display');
    // In a console environment, this might clear the screen
    // In a web environment, this might clear a div
    console.clear();
  }

  /**
   * Display a prompt for user input
   */
  showPrompt(prompt: string = ">"): void {
    this.logger.debug(`Showing prompt: ${prompt}`);
    // In a full implementation, this would show an input prompt
    process.stdout.write(prompt + " ");
  }

  /**
   * Display a formatted list of items
   */
  showItemList(items: string[], title?: string): void {
    if (title) {
      this.showMessage(title);
    }
    
    if (items.length === 0) {
      this.showMessage("None.");
      return;
    }

    for (const item of items) {
      this.showMessage(`  ${item}`);
    }
  }

  /**
   * Display help text or instructions
   */
  showHelp(helpText: string): void {
    this.logger.debug('Showing help text');
    this.showMessage(`\nHelp:\n${helpText}\n`);
  }

  /**
   * Display a formatted status message
   */
  showStatus(status: string): void {
    this.logger.debug(`Showing status: ${status}`);
    this.showMessage(`[${status}]`);
  }
}