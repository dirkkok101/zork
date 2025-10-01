/**
 * Game Interface Component
 *
 * Manages the main game interface and user interactions.
 * Handles DOM manipulation, command input, and display output.
 */

import { CommandProcessor } from '../services/CommandProcessor';
import { IGameStateService } from '../services/interfaces';
import { AutocompleteDropdown, Suggestion } from './AutocompleteDropdown';
import { ContextPanel } from './ContextPanel';
import { TypewriterEffect } from './TypewriterEffect';
import { HelpSystem } from './HelpSystem';
import * as log from 'loglevel';

export class GameInterface {
    private commandProcessor!: CommandProcessor;
    private gameStateService!: IGameStateService;
    private gameInitialized = false;
    private commandHistory: string[] = [];
    private historyIndex = -1;
    private logger: log.Logger;
    private autocomplete!: AutocompleteDropdown;
    private contextPanel!: ContextPanel;
    private typewriterEffect: TypewriterEffect;
    private helpSystem!: HelpSystem;
    private typewriterEnabled = true; // Can be toggled in settings later

    // DOM elements
    private outputArea!: HTMLElement;
    private scrollContainer!: HTMLElement;
    private commandInput!: HTMLInputElement;
    private scoreElement!: HTMLElement;
    private movesElement!: HTMLElement;
    private locationElement!: HTMLElement;
    private rankElement!: HTMLElement;

    constructor(logger?: log.Logger) {
        this.logger = logger || log.getLogger('GameInterface');
        this.typewriterEffect = new TypewriterEffect(this.logger);
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
        this.scoreElement = document.getElementById('score')!;
        this.movesElement = document.getElementById('moves')!;
        this.locationElement = document.getElementById('location')!;
        this.rankElement = document.getElementById('rank')!;

        if (!this.outputArea || !this.scrollContainer || !this.commandInput) {
            this.logger.error('Required DOM elements not found');
            throw new Error('Required DOM elements not found');
        }

        this.logger.debug('DOM elements found, setting up event listeners...');

        // Set up event listeners
        this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.commandInput.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Initialize autocomplete
        this.autocomplete = new AutocompleteDropdown(
            this.commandInput,
            (suggestion) => this.handleAutocompleteSuggestion(suggestion),
            this.logger
        );

        // Initialize context panel
        this.contextPanel = new ContextPanel(
            (text) => this.handleContextPanelClick(text),
            this.logger
        );

        // Initialize help system
        this.helpSystem = new HelpSystem(this.logger);

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

        // Initialize context panel with game state
        const gameContent = document.getElementById('game-content');
        if (gameContent) {
            this.contextPanel.initialize(this.gameStateService, gameContent);
        }

        // Initialize help system with game state
        this.helpSystem.initialize(this.gameStateService);

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
            
            // Display score change if any points were awarded
            if (lookResult.scoreChange && lookResult.scoreChange > 0) {
                this.displayScoreChange(lookResult.scoreChange);
            }
        }
        
        // Ensure UI is updated with current game state after initial look
        this.updateGameStateDisplay();
        
        // Show available commands
        this.displayMessage('\nAvailable commands: look, examine, move (north/south/east/west), take, drop, inventory');
        this.displayMessage('Type "look" for a detailed description of your surroundings.\n');
    }


    /**
     * Get context-aware suggestions for autocomplete
     * Now delegates to CommandProcessor which queries individual commands
     */
    private getSuggestions(input: string): Suggestion[] {
        const suggestions: Suggestion[] = [];

        try {
            // Get command suggestions from CommandProcessor
            // Commands now provide their own context-aware suggestions with metadata
            const commandSuggestions = this.commandProcessor.getSuggestions(input);

            // Convert to Suggestion objects with metadata parsing
            commandSuggestions.forEach(cmdSuggestion => {
                // Parse metadata format: "command|key:value|key:value"
                const parts = cmdSuggestion.split('|');
                const commandText = parts[0];

                // Parse metadata key-value pairs
                const metadata: { itemType?: string; itemState?: string; portable?: boolean; destination?: string } = {};
                for (let i = 1; i < parts.length; i++) {
                    const [key, value] = parts[i].split(':');
                    if (key === 'itemType') {
                        metadata.itemType = value;
                    } else if (key === 'itemState') {
                        metadata.itemState = value;
                    } else if (key === 'portable') {
                        metadata.portable = value === 'true';
                    } else if (key === 'destination') {
                        metadata.destination = value;
                    }
                }

                // Determine type based on suggestion content
                let type: 'command' | 'item' | 'exit' | 'inventory' = 'command';

                // Simple heuristic: if it contains common verbs + objects, it's likely context-aware
                if (commandText.match(/^(take|get|drop|put|open|close|read|examine|x|look)\s+\w+/i)) {
                    // Contextual item suggestion
                    if (commandText.match(/^(drop|put)\s+/i)) {
                        type = 'inventory';
                    } else {
                        type = 'item';
                    }
                } else if (commandText.match(/^(go|move|walk)\s+/i) || commandText.match(/^(north|south|east|west|up|down|ne|nw|se|sw)(\s+-\s+)?/i)) {
                    type = 'exit';
                }

                suggestions.push({
                    text: commandText,
                    type: type,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
                });
            });

        } catch (error) {
            this.logger.error('Error getting suggestions:', error);
        }

        // Remove duplicates and limit
        const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
            index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
        );

        return uniqueSuggestions.slice(0, 10);
    }

    /**
     * Handle autocomplete suggestion selection
     */
    private handleAutocompleteSuggestion(suggestion: string): void {
        // Suggestion text is already clean (metadata is separate)
        this.commandInput.value = suggestion;
        this.commandInput.focus();

        // Move cursor to end of input
        this.commandInput.setSelectionRange(suggestion.length, suggestion.length);

        this.logger.debug(`Autocomplete selected: ${suggestion}`);
    }

    /**
     * Handle context panel item click
     */
    private handleContextPanelClick(text: string): void {
        this.commandInput.value = text;
        this.commandInput.focus();

        // Move cursor to end of input
        this.commandInput.setSelectionRange(text.length, text.length);

        this.logger.debug(`Context panel clicked: ${text}`);
    }

    /**
     * Handle keyboard input
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.gameInitialized) return;

        // Handle ? key or Ctrl+H for help
        if ((event.key === '?' || (event.ctrlKey && event.key === 'h')) && !this.helpSystem.visible) {
            event.preventDefault();
            this.helpSystem.show();
            return;
        }

        // Handle autocomplete navigation if dropdown is visible
        if (this.autocomplete.visible) {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.autocomplete.selectNext();
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    this.autocomplete.selectPrevious();
                    return;
                case 'Tab':
                    // Tab always accepts suggestion
                    event.preventDefault();
                    this.autocomplete.selectCurrent();
                    return;
                case 'Enter':
                    // Enter accepts the currently selected suggestion
                    event.preventDefault();
                    this.autocomplete.selectCurrent();
                    return;
                case 'Escape':
                    event.preventDefault();
                    this.autocomplete.hide();
                    return;
            }
        }

        // Normal key handling when autocomplete is not visible
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
            case 'Escape':
                // Clear input on escape
                this.commandInput.value = '';
                break;
        }
    }

    /**
     * Handle key up events - show autocomplete suggestions
     */
    private handleKeyUp(event: KeyboardEvent): void {
        if (!this.gameInitialized) return;

        // Don't trigger autocomplete on navigation keys
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Escape'];
        if (navigationKeys.includes(event.key)) {
            return;
        }

        const input = this.commandInput.value;
        const trimmedInput = input.trim();

        // Hide autocomplete if input is too short
        if (trimmedInput.length < 2) {
            this.autocomplete.hide();
            return;
        }

        // Get suggestions and show autocomplete (pass original input to detect trailing spaces)
        const suggestions = this.getSuggestions(input);

        // Show autocomplete if we have suggestions
        // Context-aware suggestions (item, exit, inventory) take priority
        // Only hide if input exactly matches AND there are no context-aware suggestions
        const hasContextSuggestions = suggestions.some(s =>
            s.type === 'item' || s.type === 'exit' || s.type === 'inventory'
        );
        const exactMatch = suggestions.some(s => s.text.toLowerCase() === trimmedInput.toLowerCase());

        if (suggestions.length > 0 && (hasContextSuggestions || !exactMatch)) {
            this.autocomplete.show(suggestions);
        } else {
            this.autocomplete.hide();
        }
    }

    /**
     * Process user command
     */
    private processCommand(): void {
        const input = this.commandInput.value.trim();
        if (!input) return;

        // Skip any active typing animations
        TypewriterEffect.skipAll();

        // Hide autocomplete
        this.autocomplete.hide();

        this.logger.info(`Processing command: '${input}'`);

        // Display command with prompt
        this.displayMessage(`> ${input}`, 'command-echo');

        // Add to history
        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;
        this.logger.debug(`Command added to history. History length: ${this.commandHistory.length}`);

        // Clear input
        this.commandInput.value = '';

        // Handle help command
        if (input.toLowerCase() === 'help' || input.toLowerCase() === '?') {
            this.helpSystem.show();
            return;
        }

        // Execute command
        try {
            const result = this.commandProcessor.processCommand(input);
            
            this.logger.debug(`Command result: success=${result.success}, countsAsMove=${result.countsAsMove}`);
            
            if (result.success) {
                this.displayMessage(result.message);
                
                // Display score change if any
                if (result.scoreChange && result.scoreChange > 0) {
                    this.displayScoreChange(result.scoreChange);
                }
                
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

        // Update context panel after command execution
        this.contextPanel.update();
    }

    /**
     * Update UI to reflect current game state
     */
    private updateGameStateDisplay(): void {
        try {
            // Update score and moves from game state
            const gameState = this.gameStateService.getGameState();
            this.logger.debug(`Updating UI display - Score: ${gameState.score}, Moves: ${gameState.moves}`);

            // Update score with max
            const maxScore = 350; // Zork 1 max score
            this.scoreElement.textContent = `Score: ${gameState.score}/${maxScore}`;

            // Update moves
            this.movesElement.textContent = `Moves: ${gameState.moves}`;

            // Update location
            const currentScene = gameState.scenes[gameState.currentSceneId];
            if (currentScene) {
                this.locationElement.textContent = `Location: ${currentScene.title}`;
            }

            // Update rank
            const rank = this.calculateRank(gameState.score, maxScore);
            this.rankElement.textContent = rank.stars;
            this.rankElement.title = rank.title; // Tooltip

        } catch (error) {
            this.logger.error('Failed to update game state display:', error);
        }
    }

    /**
     * Calculate rank based on score
     */
    private calculateRank(score: number, maxScore: number): { stars: string; title: string } {
        const percentage = (score / maxScore) * 100;

        if (percentage >= 90) {
            return { stars: '★★★★★', title: 'Master Adventurer' };
        } else if (percentage >= 70) {
            return { stars: '★★★★☆', title: 'Expert Adventurer' };
        } else if (percentage >= 50) {
            return { stars: '★★★☆☆', title: 'Skilled Adventurer' };
        } else if (percentage >= 25) {
            return { stars: '★★☆☆☆', title: 'Novice Adventurer' };
        } else if (percentage > 0) {
            return { stars: '★☆☆☆☆', title: 'Beginning Adventurer' };
        } else {
            return { stars: '☆☆☆☆☆', title: 'Beginner' };
        }
    }

    /**
     * Display score change notification
     */
    private displayScoreChange(points: number): void {
        const scoreMessage = `[+${points} points]`;
        this.displayMessage(scoreMessage, 'score-change');
        
        // Add visual emphasis to score element
        this.scoreElement.classList.add('score-updated');
        setTimeout(() => {
            this.scoreElement.classList.remove('score-updated');
        }, 1000);
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

        this.outputArea.appendChild(messageElement);

        // Apply color highlighting to message
        const highlightedHtml = this.highlightMessage(message, type);
        const hasHighlighting = highlightedHtml !== message;

        // Determine if we should use typewriter effect
        const shouldAnimate = this.typewriterEnabled && this.shouldAnimateMessageType(type);

        if (shouldAnimate && !hasHighlighting) {
            // Use typewriter effect for plain text
            const speed = TypewriterEffect.getSpeedForType(type);
            this.typewriterEffect.type({
                element: messageElement,
                text: message,
                speed: speed,
                skippable: true,
                onComplete: () => {
                    this.scrollToBottom();
                }
            });
        } else {
            // Display immediately (with or without highlighting)
            if (hasHighlighting) {
                messageElement.innerHTML = highlightedHtml;
            } else {
                messageElement.textContent = message;
            }
            this.scrollToBottom();
        }
    }

    /**
     * Highlight keywords in message (directions, items, etc.)
     */
    private highlightMessage(message: string, type: string): string {
        // Don't highlight certain message types
        if (['info', 'error', 'score-change', 'command-echo'].includes(type)) {
            return message;
        }

        let highlighted = this.escapeHtml(message);

        // Highlight directions (case-insensitive word boundaries)
        const directions = ['north', 'south', 'east', 'west', 'up', 'down', 'northeast', 'northwest', 'southeast', 'southwest'];
        directions.forEach(dir => {
            const regex = new RegExp(`\\b(${dir})\\b`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="exit-name">$1</span>');
        });

        return highlighted;
    }

    /**
     * Display rich HTML message with formatting
     */
    displayRichMessage(html: string, type: string = ''): void {
        const messageElement = document.createElement('div');
        messageElement.className = `game-message ${type}`;
        messageElement.innerHTML = html;

        this.outputArea.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Format room description with colors
     */
    formatRoomDescription(title: string, description: string, exits: string[], items: string[]): string {
        let html = '';

        // Room title
        html += `<div class="room-title">${this.escapeHtml(title)}</div>`;

        // Room description
        html += `<div class="room-description">${this.escapeHtml(description)}</div>`;

        // Exits
        if (exits.length > 0) {
            html += '<div class="room-description">';
            html += 'Exits: ';
            html += exits.map(exit => `<span class="exit-name">${this.escapeHtml(exit)}</span>`).join(', ');
            html += '</div>';
        }

        // Visible items
        if (items.length > 0) {
            html += '<div class="room-description">';
            html += 'You can see: ';
            html += items.map(item => `<span class="item-name">${this.escapeHtml(item)}</span>`).join(', ');
            html += '</div>';
        }

        return html;
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Determine if message type should be animated
     */
    private shouldAnimateMessageType(type: string): boolean {
        // Don't animate user input echo or certain fast messages
        const noAnimationTypes = ['info', 'score-change', 'command-echo'];
        return !noAnimationTypes.includes(type);
    }

    /**
     * Scroll to bottom of output area
     */
    private scrollToBottom(): void {
        setTimeout(() => {
            this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
        }, 50);
    }

    /**
     * Update status display (deprecated - now shown in status bar)
     */
    setStatus(status: string): void {
        // Status is now shown in the status bar via updateGameStateDisplay
        this.logger.debug(`Status: ${status}`);
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