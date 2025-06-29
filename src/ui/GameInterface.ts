/**
 * Game Interface Component
 * 
 * Manages the main game interface and user interactions.
 * Handles DOM manipulation, command input, and display output.
 */

import { CommandService } from '../services/CommandService';
import { GameStateService } from '../services/GameStateService';
import { SceneService } from '../services/SceneService';
import { InventoryService } from '../services/InventoryService';
import * as log from 'loglevel';

export class GameInterface {
    private commandService!: CommandService;
    private gameStateService!: GameStateService;
    private sceneService!: SceneService;
    private inventoryService!: InventoryService;
    private gameInitialized = false;
    private commandHistory: string[] = [];
    private historyIndex = -1;
    private logger: log.Logger;

    // DOM elements
    private outputArea!: HTMLElement;
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
        this.commandInput = document.getElementById('command-input')! as HTMLInputElement;
        this.statusElement = document.getElementById('status')!;
        this.scoreElement = document.getElementById('score')!;
        this.movesElement = document.getElementById('moves')!;

        if (!this.outputArea || !this.commandInput || !this.statusElement) {
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
        commandService: CommandService, 
        gameStateService: GameStateService, 
        sceneService: SceneService, 
        inventoryService: InventoryService
    ): void {
        this.logger.info('Initializing game interface...');
        
        this.commandService = commandService;
        this.gameStateService = gameStateService;
        this.sceneService = sceneService;
        this.inventoryService = inventoryService;
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
        this.executeCommand('look');
        
        // Show available commands
        this.displayMessage('\nAvailable commands: look, examine, move (north/south/east/west), take, drop, inventory');
        this.displayMessage('Type "look" for a detailed description of your surroundings.\n');
    }

    /**
     * Display the current scene description and contents
     */
    private displayCurrentScene(): void {
        try {
            const currentSceneId = this.gameStateService.getCurrentSceneId();
            const sceneDescription = this.sceneService.getSceneDescription(currentSceneId);
            
            this.displayMessage(sceneDescription.description);
            
            // Display visible items in the scene
            if (sceneDescription.visibleItems && sceneDescription.visibleItems.length > 0) {
                for (const item of sceneDescription.visibleItems) {
                    this.displayMessage(item);
                }
            }
            
            // Display exits
            if (sceneDescription.exits && sceneDescription.exits.length > 0) {
                this.displayMessage('\nExits: ' + sceneDescription.exits.join(', '));
            }
            
        } catch (error) {
            this.logger.error('Failed to display current scene:', error);
            this.displayMessage('You find yourself in a mysterious location.');
        }
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
            const result = this.commandService.executeCommand(input);
            
            this.logger.debug(`Command result: success=${result.success}, countsAsMove=${result.countsAsMove}`);
            
            if (result.success) {
                this.displayMessage(result.message);
                if (result.scoreChange) {
                    this.logger.debug(`Score change: ${result.scoreChange}`);
                    this.updateScore(result.scoreChange);
                }
                
                // Update UI state after successful commands
                this.updateGameStateDisplay();
            } else {
                this.displayMessage(result.message, 'error');
            }
            
            if (result.countsAsMove) {
                this.logger.debug('Command counts as a move, incrementing move counter');
                this.incrementMoves();
            }
            
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
        
        // Scroll to bottom
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }

    /**
     * Update status display
     */
    setStatus(status: string): void {
        this.statusElement.textContent = status;
    }

    /**
     * Update score display
     */
    private updateScore(change: number): void {
        const currentScore = parseInt(this.scoreElement.textContent?.replace('Score: ', '') || '0');
        const newScore = currentScore + change;
        this.scoreElement.textContent = `Score: ${newScore}`;
    }

    /**
     * Increment moves counter
     */
    private incrementMoves(): void {
        const currentMoves = parseInt(this.movesElement.textContent?.replace('Moves: ', '') || '0');
        this.movesElement.textContent = `Moves: ${currentMoves + 1}`;
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