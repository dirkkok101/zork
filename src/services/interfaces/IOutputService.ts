import {Scene} from '../../types/SceneTypes';


/**
 * Manages all user interface output and message display.
 * 
 * This service handles:
 * - Formatting and displaying game messages
 * - Rendering scene descriptions and game state
 * - Error message display
 * - Consistent text formatting and presentation
 * 
 * Boundaries:
 * - Does NOT own game content or logic (other services provide content)
 * - Does NOT handle user input processing (commands handle parsing)
 * - Does NOT make game state decisions (only displays results)
 * - Focus is purely on presentation and user interface output
 */
export interface IOutputService {
  /** Display a general game message */
  showMessage(message: string): void;
  
  /** Display an error message */
  showError(error: string): void;
  
  /** Display a scene with formatted description */
  showScene(scene: Scene): void;
  
  /** Display formatted inventory listing */
  showInventory(items: string[]): void;
  
  /** Display current score */
  showScore(score: number): void;
}
