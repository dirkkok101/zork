/**
 * Autocomplete Dropdown Component
 *
 * Provides intelligent command suggestions as the user types.
 * Shows context-aware suggestions for commands, items, exits, and inventory.
 */

import * as log from 'loglevel';

export interface Suggestion {
    text: string;
    type: 'command' | 'item' | 'exit' | 'inventory';
    description?: string;
    metadata?: {
        itemType?: string;      // weapon, container, treasure, etc.
        itemState?: string;     // open, closed, lit, unlit
        portable?: boolean;
        destination?: string;   // destination scene for movement
    };
}

export class AutocompleteDropdown {
    private dropdownElement: HTMLElement;
    private suggestions: Suggestion[] = [];
    private selectedIndex = -1;
    private isVisible = false;
    private logger: log.Logger;
    private inputElement: HTMLInputElement;
    private onSelect: (suggestion: string) => void;

    constructor(
        inputElement: HTMLInputElement,
        onSelect: (suggestion: string) => void,
        logger?: log.Logger
    ) {
        this.inputElement = inputElement;
        this.onSelect = onSelect;
        this.logger = logger || log.getLogger('AutocompleteDropdown');
        this.dropdownElement = this.createDropdownElement();
        this.setupEventListeners();
    }

    /**
     * Create the dropdown DOM element
     */
    private createDropdownElement(): HTMLElement {
        const dropdown = document.createElement('div');
        dropdown.id = 'autocomplete-dropdown';
        dropdown.className = 'autocomplete-dropdown hidden';

        // Position it relative to the input
        const inputArea = this.inputElement.parentElement;
        if (inputArea) {
            inputArea.appendChild(dropdown);
        }

        return dropdown;
    }

    /**
     * Setup event listeners for mouse interactions
     */
    private setupEventListeners(): void {
        // Handle mouse hover
        this.dropdownElement.addEventListener('mousemove', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('suggestion-item')) {
                const index = Array.from(this.dropdownElement.children).indexOf(target);
                this.setSelectedIndex(index);
            }
        });

        // Handle mouse click
        this.dropdownElement.addEventListener('mousedown', (e) => {
            // Use mousedown instead of click to prevent blur from hiding dropdown first
            e.preventDefault(); // Prevent input from losing focus
            e.stopPropagation(); // Stop event from bubbling

            const target = e.target as HTMLElement;
            // Find the suggestion-item element (could be the target or a parent)
            const suggestionItem = target.closest('.suggestion-item') as HTMLElement;
            if (suggestionItem) {
                const suggestion = suggestionItem.dataset.suggestion;
                if (suggestion) {
                    this.selectSuggestion(suggestion);
                }
            }
        });
    }

    /**
     * Update suggestions and show dropdown
     */
    show(suggestions: Suggestion[], preserveSelection: boolean = false): void {
        if (suggestions.length === 0) {
            this.hide();
            return;
        }

        // Sort suggestions by type priority to match visual render order
        // This ensures selectedIndex matches visual order
        const sortedSuggestions = this.sortSuggestionsByDisplayOrder(suggestions);
        this.suggestions = sortedSuggestions.slice(0, 10); // Max 10 suggestions

        // Only reset selection if not preserving or if previously hidden
        if (!preserveSelection || !this.isVisible) {
            this.selectedIndex = 0; // Auto-select first suggestion
        } else {
            // Preserve selection but ensure it's within bounds
            this.selectedIndex = Math.min(this.selectedIndex, this.suggestions.length - 1);
        }

        this.isVisible = true;

        this.render();
        this.dropdownElement.classList.remove('hidden');
        this.updateSelection(); // Highlight current item

        this.logger.debug(`Showing ${this.suggestions.length} suggestions, selectedIndex: ${this.selectedIndex}`);
    }

    /**
     * Sort suggestions to match display order (items, inventory, exits, commands)
     */
    private sortSuggestionsByDisplayOrder(suggestions: Suggestion[]): Suggestion[] {
        const typeOrder: Record<string, number> = {
            'item': 0,
            'inventory': 1,
            'exit': 2,
            'command': 3
        };

        return [...suggestions].sort((a, b) => {
            const orderA = typeOrder[a.type] ?? 999;
            const orderB = typeOrder[b.type] ?? 999;
            return orderA - orderB;
        });
    }

    /**
     * Hide the dropdown
     */
    hide(): void {
        this.isVisible = false;
        this.dropdownElement.classList.add('hidden');
        this.suggestions = [];
        this.selectedIndex = -1;
    }

    /**
     * Check if dropdown is currently visible
     */
    get visible(): boolean {
        return this.isVisible;
    }

    /**
     * Navigate to next suggestion
     */
    selectNext(): void {
        if (this.suggestions.length === 0) return;

        const oldIndex = this.selectedIndex;
        this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
        this.logger.debug(`Navigation: Down (${oldIndex} → ${this.selectedIndex})`);
        this.updateSelection();
    }

    /**
     * Navigate to previous suggestion
     */
    selectPrevious(): void {
        if (this.suggestions.length === 0) return;

        const oldIndex = this.selectedIndex;
        this.selectedIndex = this.selectedIndex <= 0
            ? this.suggestions.length - 1
            : this.selectedIndex - 1;
        this.logger.debug(`Navigation: Up (${oldIndex} → ${this.selectedIndex})`);
        this.updateSelection();
    }

    /**
     * Select the current suggestion
     */
    selectCurrent(): void {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
            const suggestion = this.suggestions[this.selectedIndex];
            if (suggestion) {
                this.logger.debug(`Selecting current: index=${this.selectedIndex}, text="${suggestion.text}"`);
                this.selectSuggestion(suggestion.text);
            } else {
                this.logger.warn(`Invalid selection: index=${this.selectedIndex} has no suggestion`);
            }
        } else {
            this.logger.warn(`Cannot select: index=${this.selectedIndex} out of bounds (0-${this.suggestions.length - 1})`);
        }
    }

    /**
     * Update the visual selection
     */
    private updateSelection(): void {
        const items = this.dropdownElement.querySelectorAll('.suggestion-item');

        // Defensive check: ensure selectedIndex is within bounds
        if (this.selectedIndex < 0 || this.selectedIndex >= items.length) {
            this.logger.warn(`updateSelection: index ${this.selectedIndex} out of bounds (0-${items.length - 1})`);
            this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, items.length - 1));
        }

        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                // Scroll into view if needed
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

                // Debug log
                const suggestionText = item.getAttribute('data-suggestion');
                this.logger.debug(`Visual selection updated: index=${index}, text="${suggestionText}"`);
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Set selected index directly
     */
    private setSelectedIndex(index: number): void {
        this.selectedIndex = index;
        this.updateSelection();
    }

    /**
     * Select a suggestion and trigger callback
     */
    private selectSuggestion(text: string): void {
        this.logger.debug(`Suggestion selected: ${text}`);
        this.hide();
        this.onSelect(text);
    }

    /**
     * Render the dropdown content
     */
    private render(): void {
        this.dropdownElement.innerHTML = '';

        // Group suggestions by type for category separators
        const groupedSuggestions = this.groupSuggestionsByType();

        // Render each group with separators
        groupedSuggestions.forEach((group, groupIndex) => {
            // Add category separator
            if (group.suggestions.length > 0) {
                const separator = document.createElement('div');
                separator.className = 'suggestion-separator';
                separator.textContent = `─── ${this.getCategoryLabel(group.type)} ───`;
                this.dropdownElement.appendChild(separator);
            }

            // Render suggestions in this group
            group.suggestions.forEach((suggestion) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.dataset.suggestion = suggestion.text;

                // Add type indicator with state awareness
                const typeIndicator = document.createElement('span');
                typeIndicator.className = `suggestion-type suggestion-type-${suggestion.type}`;
                typeIndicator.textContent = this.getTypeIcon(suggestion.type, suggestion.metadata?.itemState);

                // Add suggestion text
                const textSpan = document.createElement('span');
                textSpan.className = 'suggestion-text';
                textSpan.textContent = suggestion.text;

                item.appendChild(typeIndicator);
                item.appendChild(textSpan);

                // Add metadata badges
                if (suggestion.metadata) {
                    const badgesContainer = document.createElement('span');
                    badgesContainer.className = 'suggestion-badges';

                    // Add item type badge
                    if (suggestion.metadata.itemType) {
                        const typeBadge = document.createElement('span');
                        typeBadge.className = 'suggestion-badge';
                        typeBadge.textContent = `(${suggestion.metadata.itemType})`;
                        badgesContainer.appendChild(typeBadge);
                    }

                    // Add destination badge for movement
                    if (suggestion.metadata.destination) {
                        const destBadge = document.createElement('span');
                        destBadge.className = 'suggestion-badge suggestion-badge-destination';
                        destBadge.textContent = `→ ${suggestion.metadata.destination}`;
                        badgesContainer.appendChild(destBadge);
                    }

                    item.appendChild(badgesContainer);
                }

                // Add description if available
                if (suggestion.description) {
                    const descSpan = document.createElement('span');
                    descSpan.className = 'suggestion-description';
                    descSpan.textContent = suggestion.description;
                    item.appendChild(descSpan);
                }

                this.dropdownElement.appendChild(item);
            });
        });
    }

    /**
     * Group suggestions by type for category separators
     */
    private groupSuggestionsByType(): Array<{ type: string; suggestions: Suggestion[] }> {
        const groups: Map<string, Suggestion[]> = new Map();

        // Define order of categories
        const categoryOrder = ['item', 'inventory', 'exit', 'command'];

        this.suggestions.forEach(suggestion => {
            const type = suggestion.type;
            if (!groups.has(type)) {
                groups.set(type, []);
            }
            groups.get(type)!.push(suggestion);
        });

        // Convert to ordered array
        const result: Array<{ type: string; suggestions: Suggestion[] }> = [];
        categoryOrder.forEach(type => {
            if (groups.has(type)) {
                result.push({ type, suggestions: groups.get(type)! });
            }
        });

        return result;
    }

    /**
     * Get category label for separators
     */
    private getCategoryLabel(type: string): string {
        switch (type) {
            case 'item':
                return 'ITEMS';
            case 'inventory':
                return 'INVENTORY';
            case 'exit':
                return 'EXITS';
            case 'command':
                return 'COMMANDS';
            default:
                return type.toUpperCase();
        }
    }

    /**
     * Get icon for suggestion type with state awareness
     */
    private getTypeIcon(type: Suggestion['type'], itemState?: string): string {
        switch (type) {
            case 'command':
                return '>';
            case 'item':
                // Use different icons based on item state
                if (itemState === 'open') {
                    return '◉'; // Open container
                } else if (itemState === 'closed') {
                    return '○'; // Closed container
                } else {
                    return '○'; // Default item
                }
            case 'exit':
                return '→';
            case 'inventory':
                return '◆';
            default:
                return '•';
        }
    }

    /**
     * Destroy the dropdown and clean up
     */
    destroy(): void {
        this.dropdownElement.remove();
    }
}
