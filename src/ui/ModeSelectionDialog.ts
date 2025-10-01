/**
 * Mode Selection Dialog
 * Allows players to choose between Classic and Enhanced game modes
 */

import * as log from 'loglevel';

export type GameMode = 'classic' | 'enhanced';

export interface ModeSelectionResult {
  mode: GameMode;
}

/**
 * Mode Selection Dialog Component
 */
export class ModeSelectionDialog {
  private logger: log.Logger;
  private dialogElement: HTMLElement | null = null;
  private resolve: ((result: ModeSelectionResult) => void) | null = null;

  constructor(logger?: log.Logger) {
    this.logger = logger || log.getLogger('ModeSelectionDialog');
  }

  /**
   * Show the mode selection dialog and wait for user choice
   * @returns Promise that resolves with the selected mode
   */
  public async show(): Promise<ModeSelectionResult> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.createDialog();
      this.showDialog();
    });
  }

  /**
   * Create the dialog DOM structure
   */
  private createDialog(): void {
    // Create dialog container
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = 'mode-selection-dialog';
    this.dialogElement.innerHTML = `
      <div class="mode-selection-overlay"></div>
      <div class="mode-selection-content">
        <div class="mode-selection-header">
          <h1>ZORK: The Great Underground Empire</h1>
          <p class="subtitle">A Classic Text Adventure</p>
        </div>

        <div class="mode-selection-body">
          <p class="mode-selection-prompt">Choose your adventure:</p>

          <div class="mode-option" data-mode="classic">
            <div class="mode-number">1.</div>
            <div class="mode-details">
              <h3>Classic Mode</h3>
              <p>Experience the original 1980s Zork exactly as it was written.</p>
            </div>
          </div>

          <div class="mode-option" data-mode="enhanced">
            <div class="mode-number">2.</div>
            <div class="mode-details">
              <h3>Enhanced Mode</h3>
              <p>AI-powered narrative adaptation with personalized storytelling.</p>
            </div>
          </div>
        </div>

        <div class="mode-selection-footer">
          <p>Press 1 or 2, or click to select</p>
        </div>
      </div>
    `;

    // Add event listeners
    const modeOptions = this.dialogElement.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const mode = option.getAttribute('data-mode') as GameMode;
        this.selectMode(mode);
      });
    });

    // Add keyboard listener
    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    // Append to body
    document.body.appendChild(this.dialogElement);
  }

  /**
   * Show the dialog
   */
  private showDialog(): void {
    if (this.dialogElement) {
      this.dialogElement.style.display = 'block';
      // Trigger reflow to enable CSS transition
      void this.dialogElement.offsetHeight;
      this.dialogElement.classList.add('visible');
    }
  }

  /**
   * Handle keyboard input
   */
  private handleKeyPress(event: KeyboardEvent): void {
    if (event.key === '1') {
      this.selectMode('classic');
    } else if (event.key === '2') {
      this.selectMode('enhanced');
    }
  }

  /**
   * Select a mode and close dialog
   */
  private selectMode(mode: GameMode): void {
    this.logger.info(`Mode selected: ${mode}`);

    // Close dialog
    this.closeDialog();

    // Resolve promise
    if (this.resolve) {
      this.resolve({ mode });
      this.resolve = null;
    }
  }

  /**
   * Close and cleanup dialog
   */
  private closeDialog(): void {
    if (this.dialogElement) {
      this.dialogElement.classList.remove('visible');

      // Remove after transition
      setTimeout(() => {
        if (this.dialogElement && this.dialogElement.parentNode) {
          this.dialogElement.parentNode.removeChild(this.dialogElement);
        }
        this.dialogElement = null;
      }, 300);

      // Remove keyboard listener
      document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }
  }
}
