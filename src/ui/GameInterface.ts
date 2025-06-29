/**
 * Game Interface Component
 * 
 * Manages the main game interface and user interactions.
 * Handles DOM manipulation, command input, and display output.
 */

import { CommandProcessor } from '../services/CommandProcessor';
import { IGameStateService } from '../services/interfaces';
import * as log from 'loglevel';

export class GameInterface {
    private commandProcessor!: CommandProcessor;
    private gameStateService!: IGameStateService;
    private gameInitialized = false;
    private commandHistory: string[] = [];
    private historyIndex = -1;
    private logger: log.Logger;

    // DOM elements
    private outputArea!: HTMLElement;
    private scrollContainer!: HTMLElement;
    private commandInput!: HTMLInputElement;
    private statusElement!: HTMLElement;
    private scoreElement!: HTMLElement;
    private movesElement!: HTMLElement;

    constructor(logger?: log.Logger) {
        this.logger = logger || log.getLogger('GameInterface');
        this.initializeDOM();
    }

    /**
     * Initialize DOM elements and event listeners
     */
    private initializeDOM(): void {
        this.logger.debug('Initializing DOM elements...');
        
        // Get DOM elements
        this.outputArea = document.getElementById('game-text')!;
        this.scrollContainer = document.getElementById('output-area')!;
        this.commandInput = document.getElementById('command-input')! as HTMLInputElement;
        this.statusElement = document.getElementById('status')!;
        this.scoreElement = document.getElementById('score')!;
        this.movesElement = document.getElementById('moves')!;

        if (!this.outputArea || !this.scrollContainer || !this.commandInput || !this.statusElement) {
            this.logger.error('Required DOM elements not found');
            throw new Error('Required DOM elements not found');
        }

        this.logger.debug('DOM elements found, setting up event listeners...');

        // Set up event listeners
        this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.commandInput.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Disable input initially
        this.commandInput.disabled = true;
        
        // Focus on input
        this.commandInput.focus();
        
        this.logger.debug('✅ DOM initialization complete');
    }

    /**
     * Initialize the game interface with services
     */
    initialize(
        commandProcessor: CommandProcessor, 
        gameStateService: IGameStateService
    ): void {
        this.logger.info('Initializing game interface...');
        
        this.commandProcessor = commandProcessor;
        this.gameStateService = gameStateService;
        this.gameInitialized = true;
        this.setStatus('Ready');
        this.commandInput.disabled = false;
        this.commandInput.focus();
        this.displayWelcomeMessage();
        
        this.logger.info('✅ Game interface initialized and ready for input');
    }

    /**
     * Display welcome message and current scene
     */
    private displayWelcomeMessage(): void {
        // Display Zork welcome
        this.displayMessage('ZORK I: The Great Underground Empire', 'success');
        this.displayMessage('Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.');
        this.displayMessage('ZORK is a registered trademark of Infocom, Inc.');
        this.displayMessage('Revision 88 / Serial number 840726\n');
        
        // Execute initial look command to show starting location
        const lookResult = this.commandProcessor.processCommand('look');
        if (lookResult.success) {
            this.displayMessage(lookResult.message);
        }
        
        // Show available commands
        this.displayMessage('\nAvailable commands: look, examine, move (north/south/east/west), take, drop, inventory');
        this.displayMessage('Type "look" for a detailed description of your surroundings.\n');
    }


    /**
     * Handle keyboard input
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.gameInitialized) return;

        switch (event.key) {
            case 'Enter':
                this.processCommand();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateHistory(1);
                break;
        }
    }

    /**
     * Handle key up events
     */
    private handleKeyUp(_event: KeyboardEvent): void {
        // Future: Could add command suggestions here
    }

    /**
     * Process user command
     */
    private processCommand(): void {
        const input = this.commandInput.value.trim();
        if (!input) return;

        this.logger.info(`Processing command: '${input}'`);

        // Display command with prompt
        this.displayMessage(`> ${input}`, 'info');
        
        // Add to history
        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;
        this.logger.debug(`Command added to history. History length: ${this.commandHistory.length}`);
        
        // Clear input
        this.commandInput.value = '';

        // Execute command
        try {
            const result = this.commandProcessor.processCommand(input);
            
            this.logger.debug(`Command result: success=${result.success}, countsAsMove=${result.countsAsMove}`);
            
            if (result.success) {
                this.displayMessage(result.message);
                // Update UI state after successful commands
                this.updateGameStateDisplay();
            } else {
                this.displayMessage(result.message, 'error');
            }
            
            // Note: CommandProcessor handles move counting and score changes automatically
            this.updateGameStateDisplay();
            
        } catch (error) {
            this.logger.error('Command execution error:', error);
            this.displayMessage('Something went wrong with that command.', 'error');
        }
    }

    /**
     * Update UI to reflect current game state
     */
    private updateGameStateDisplay(): void {
        try {
            // Update score and moves from game state
            const gameState = this.gameStateService.getGameState();
            this.scoreElement.textContent = `Score: ${gameState.score}`;
            this.movesElement.textContent = `Moves: ${gameState.moves}`;
        } catch (error) {
            this.logger.error('Failed to update game state display:', error);
        }
    }

    /**
     * Navigate command history
     */
    private navigateHistory(direction: number): void {
        if (this.commandHistory.length === 0) return;

        this.historyIndex = Math.max(0, Math.min(this.commandHistory.length, this.historyIndex + direction));
        
        if (this.historyIndex < this.commandHistory.length) {
            this.commandInput.value = this.commandHistory[this.historyIndex] || '';
        } else {
            this.commandInput.value = '';
        }
    }

    /**
     * Display message in the output area
     */
    displayMessage(message: string, type: string = ''): void {
        const messageElement = document.createElement('div');
        messageElement.className = `game-message ${type}`;
        messageElement.textContent = message;
        
        this.outputArea.appendChild(messageElement);
        
        // Scroll to bottom with delay to ensure DOM update completes
        // Use the correct scroll container and ensure we scroll to the very bottom
        setTimeout(() => {
            this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
        }, 50);
    }

    /**
     * Update status display
     */
    setStatus(status: string): void {
        this.statusElement.textContent = status;
    }


    /**
     * Clear the output area
     */
    clearOutput(): void {
        this.outputArea.innerHTML = '';
    }

    /**
     * Get command history
     */
    getCommandHistory(): string[] {
        return [...this.commandHistory];
    }
}