/**
 * Typewriter Effect Component
 *
 * Creates a retro terminal typing effect for text display.
 * Can be skipped by pressing any key.
 */

import * as log from 'loglevel';

export interface TypewriterOptions {
    /** Speed in milliseconds per character */
    speed?: number;
    /** Element to append characters to */
    element: HTMLElement;
    /** Text to type out */
    text: string;
    /** Whether typing can be skipped */
    skippable?: boolean;
    /** Callback when typing is complete */
    onComplete?: () => void;
    /** Callback when typing is skipped */
    onSkip?: () => void;
}

export class TypewriterEffect {
    private static activeAnimations: Set<TypewriterEffect> = new Set();
    private logger: log.Logger;
    private isActive = false;
    private isSkipped = false;
    private currentTimeout?: number;
    private skipHandler?: (e: KeyboardEvent) => void;

    constructor(logger?: log.Logger) {
        this.logger = logger || log.getLogger('TypewriterEffect');
    }

    /**
     * Type out text with animation
     */
    async type(options: TypewriterOptions): Promise<void> {
        const {
            speed = 20,
            element,
            text,
            skippable = true,
            onComplete,
            onSkip
        } = options;

        // Add to active animations
        TypewriterEffect.activeAnimations.add(this);
        this.isActive = true;
        this.isSkipped = false;

        // Setup skip handler with a small delay to avoid the Enter key that triggered the command
        if (skippable) {
            // Wait 100ms before activating skip handler to avoid the command submission key
            await this.delay(100);

            if (this.isSkipped) {
                // Already skipped during delay
                element.textContent = text;
                return;
            }

            this.skipHandler = (e: KeyboardEvent) => {
                // Allow certain keys through (like F5 for refresh)
                // Don't skip on Enter key (used for command submission)
                if (['F5', 'F12', 'Enter'].includes(e.key)) {
                    return;
                }

                this.skip();
                if (onSkip) {
                    onSkip();
                }
            };
            document.addEventListener('keydown', this.skipHandler, { once: false });
        }

        try {
            // Add typing class for cursor effect
            element.classList.add('typing');

            // If skipped immediately, just show all text
            if (this.isSkipped) {
                element.textContent = text;
                element.classList.remove('typing');
                return;
            }

            // Type character by character
            let currentText = '';
            for (let i = 0; i < text.length; i++) {
                if (this.isSkipped) {
                    // Show remaining text immediately
                    element.textContent = text;
                    element.classList.remove('typing');
                    break;
                }

                currentText += text[i];
                element.textContent = currentText;

                // Wait before next character
                if (i < text.length - 1) {
                    await this.delay(speed);
                }
            }

            // Remove typing class when done
            element.classList.remove('typing');

            if (onComplete && !this.isSkipped) {
                onComplete();
            }
        } finally {
            this.cleanup();
        }
    }

    /**
     * Skip the current animation
     */
    skip(): void {
        if (!this.isActive) return;

        this.isSkipped = true;

        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = undefined;
        }

        this.logger.debug('Typewriter animation skipped');
    }

    /**
     * Skip all active animations
     */
    static skipAll(): void {
        TypewriterEffect.activeAnimations.forEach(animation => {
            animation.skip();
        });
    }

    /**
     * Check if any animations are active
     */
    static hasActiveAnimations(): boolean {
        return TypewriterEffect.activeAnimations.size > 0;
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.currentTimeout = window.setTimeout(() => {
                this.currentTimeout = undefined;
                resolve();
            }, ms);
        });
    }

    /**
     * Cleanup resources
     */
    private cleanup(): void {
        this.isActive = false;
        TypewriterEffect.activeAnimations.delete(this);

        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = undefined;
        }

        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = undefined;
        }
    }

    /**
     * Get typing speed for message type
     */
    static getSpeedForType(type: string): number {
        const speeds: Record<string, number> = {
            'loading': 30,
            'error': 15,      // Faster for errors
            'info': 20,       // Fast for commands
            'success': 25,    // Medium for success
            'default': 20     // Default speed
        };

        return speeds[type] || speeds['default'];
    }
}
