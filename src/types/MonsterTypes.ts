/**
 * Monster state enumeration
 * Represents the current behavior state of a monster
 */
export enum MonsterState {
    IDLE = 'idle',
    ALERT = 'alert',
    HOSTILE = 'hostile',
    FLEEING = 'fleeing',
    FRIENDLY = 'friendly',
    DEAD = 'dead',
    GUARDING = 'guarding',
    WANDERING = 'wandering',
    LURKING = 'lurking',
    SLEEPING = 'sleeping'
}

/**
 * Movement pattern type
 * Defines how a monster moves through the game world
 */
export type MovementPattern = 'stationary' | 'random' | 'patrol' | 'follow' | 'flee';

/**
 * Re-export Monster interface from Monster.ts
 * This maintains the pure data structure without embedded methods
 */
export type { Monster } from './Monster';

/**
 * Monster type enumeration
 * Categorizes monsters by their nature
 */
export enum MonsterType {
    HUMANOID = 'humanoid',
    CREATURE = 'creature',
    ENVIRONMENTAL = 'environmental'
}
