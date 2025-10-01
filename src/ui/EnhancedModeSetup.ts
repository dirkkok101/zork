/**
 * Enhanced Mode Setup Dialog
 * Collects player name and narrative style for AI-enhanced mode
 */

import * as log from 'loglevel';
import { GameStyle } from '../types/GameState';

export interface EnhancedModeSetupResult {
  playerName: string;
  gameStyle: GameStyle;
}

/**
 * Enhanced Mode Setup Dialog Component
 */
export class EnhancedModeSetup {
  private logger: log.Logger;
  private dialogElement: HTMLElement | null = null;
  private resolve: ((result: EnhancedModeSetupResult) => void) | null = null;
  private currentStep: 'name' | 'style' = 'name';
  private playerName: string = '';

  constructor(logger?: log.Logger) {
    this.logger = logger || log.getLogger('EnhancedModeSetup');
  }

  /**
   * Show the setup dialog and wait for user input
   * @returns Promise that resolves with player name and style
   */
  public async show(): Promise<EnhancedModeSetupResult> {
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
    this.dialogElement.className = 'enhanced-mode-setup';

    this.renderStep();

    // Append to body
    document.body.appendChild(this.dialogElement);
  }

  /**
   * Render the current step
   */
  private renderStep(): void {
    if (!this.dialogElement) return;

    if (this.currentStep === 'name') {
      this.dialogElement.innerHTML = `
        <div class="setup-overlay"></div>
        <div class="setup-content">
          <div class="setup-header">
            <h1>Enhanced Mode Setup</h1>
          </div>

          <div class="setup-body">
            <p class="setup-prompt">Enter your name:</p>
            <input
              type="text"
              id="player-name-input"
              class="setup-input"
              placeholder="Your adventurer name..."
              maxlength="30"
              autocomplete="off"
            />
            <p class="setup-hint">This name will be woven into your personalized adventure</p>
          </div>

          <div class="setup-footer">
            <button class="setup-button" id="name-continue">Continue</button>
          </div>
        </div>
      `;

      // Add event listeners - query from dialogElement, not document
      const input = this.dialogElement.querySelector('#player-name-input') as HTMLInputElement;
      const button = this.dialogElement.querySelector('#name-continue') as HTMLButtonElement;

      this.logger.info(`Input element found: ${!!input}, Button element found: ${!!button}`);

      if (input) {
        // Focus after a short delay to ensure dialog is visible
        setTimeout(() => input.focus(), 100);
        input.addEventListener('keypress', (e) => {
          this.logger.info(`Key pressed: ${e.key}, Input value: "${input.value}"`);
          if (e.key === 'Enter' && input.value.trim()) {
            this.handleNameSubmit(input.value.trim());
          }
        });
      } else {
        this.logger.error('Input element not found!');
      }

      if (button) {
        this.logger.info('Adding click listener to button');
        button.addEventListener('click', (e) => {
          this.logger.info('Continue button clicked');
          this.logger.info(`Input value: "${input?.value}"`);
          if (input && input.value.trim()) {
            this.logger.info(`Submitting name: ${input.value.trim()}`);
            this.handleNameSubmit(input.value.trim());
          } else {
            this.logger.warn('Name input is empty, not submitting');
          }
        });
      } else {
        this.logger.error('Button element not found!');
      }

    } else if (this.currentStep === 'style') {
      this.dialogElement.innerHTML = `
        <div class="setup-overlay"></div>
        <div class="setup-content">
          <div class="setup-header">
            <h1>Enhanced Mode Setup</h1>
          </div>

          <div class="setup-body">
            <p class="setup-prompt">Choose your narrative style:</p>

            <div class="style-option" data-style="fantasy">
              <div class="style-number">1.</div>
              <div class="style-details">
                <h3>Fantasy</h3>
                <p>Tolkien-esque high fantasy with epic prose and ancient magic.</p>
              </div>
            </div>

            <div class="style-option" data-style="scifi">
              <div class="style-number">2.</div>
              <div class="style-details">
                <h3>Scifi</h3>
                <p>Cyberpunk noir with technology, megacorps, and urban decay.</p>
              </div>
            </div>

            <div class="style-option" data-style="modern">
              <div class="style-number">3.</div>
              <div class="style-details">
                <h3>Modern</h3>
                <p>Contemporary mystery/thriller with realistic 21st-century setting.</p>
              </div>
            </div>
          </div>

          <div class="setup-footer">
            <p>Press 1, 2, or 3, or click to select</p>
          </div>
        </div>
      `;

      // Add event listeners
      const styleOptions = this.dialogElement.querySelectorAll('.style-option');
      styleOptions.forEach(option => {
        option.addEventListener('click', () => {
          const style = option.getAttribute('data-style') as GameStyle;
          this.handleStyleSelect(style);
        });
      });

      // Add keyboard listener
      document.addEventListener('keydown', this.handleStyleKeyPress.bind(this));
    }
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
   * Handle name submission
   */
  private handleNameSubmit(name: string): void {
    this.logger.info(`Player name entered: ${name}`);
    this.playerName = name;
    this.currentStep = 'style';
    this.renderStep();
    this.showDialog();
  }

  /**
   * Handle style keyboard input
   */
  private handleStyleKeyPress(event: KeyboardEvent): void {
    if (event.key === '1') {
      this.handleStyleSelect('fantasy');
    } else if (event.key === '2') {
      this.handleStyleSelect('scifi');
    } else if (event.key === '3') {
      this.handleStyleSelect('modern');
    }
  }

  /**
   * Handle style selection
   */
  private handleStyleSelect(style: GameStyle): void {
    this.logger.info(`Style selected: ${style}`);

    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleStyleKeyPress.bind(this));

    // Show loading message
    this.showLoadingMessage(style);

    // Wait a moment for the loading message to display
    setTimeout(() => {
      // Close dialog
      this.closeDialog();

      // Resolve promise
      if (this.resolve) {
        this.resolve({
          playerName: this.playerName,
          gameStyle: style
        });
        this.resolve = null;
      }
    }, 1000);
  }

  /**
   * Show loading message
   */
  private showLoadingMessage(style: GameStyle): void {
    if (!this.dialogElement) return;

    const styleNames = {
      fantasy: 'fantasy',
      scifi: 'scifi',
      modern: 'modern',
      classic: 'classic'
    };

    this.dialogElement.innerHTML = `
      <div class="setup-overlay"></div>
      <div class="setup-content">
        <div class="setup-body setup-loading">
          <p class="loading-message">Initializing your ${styleNames[style]} adventure...</p>
          <p class="loading-message">Preparing the world for ${this.playerName}...</p>
          <div class="loading-spinner"></div>
          <p class="loading-hint">Press ENTER to begin...</p>
        </div>
      </div>
    `;
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
    }
  }
}
