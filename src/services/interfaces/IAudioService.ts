import { GameState } from '../../types/GameState';

/**
 * Audio event types supported by the system
 */
export enum AudioEventType {
    AMBIENT = 'ambient',
    EFFECT = 'effect',
    MUSIC = 'music',
    VOICE = 'voice',
    NOTIFICATION = 'notification'
}

/**
 * Audio source information
 */
export interface AudioSource {
    /** Unique identifier for the audio source */
    id: string;
    
    /** Display name */
    name: string;
    
    /** Type of audio */
    type: AudioEventType;
    
    /** Audio file path or identifier */
    source: string;
    
    /** Volume level (0-1) */
    volume: number;
    
    /** Whether this audio loops */
    loop: boolean;
    
    /** Duration in seconds (-1 for unknown) */
    duration: number;
    
    /** Whether the audio is currently playing */
    playing: boolean;
    
    /** Position in the audio (seconds) */
    position: number;
}

/**
 * Audio configuration settings
 */
export interface AudioConfig {
    /** Master volume (0-1) */
    masterVolume: number;
    
    /** Ambient sound volume (0-1) */
    ambientVolume: number;
    
    /** Sound effects volume (0-1) */
    effectVolume: number;
    
    /** Music volume (0-1) */
    musicVolume: number;
    
    /** Voice volume (0-1) */
    voiceVolume: number;
    
    /** Whether audio is enabled */
    enabled: boolean;
    
    /** Whether to use spatial audio */
    spatialAudio: boolean;
    
    /** Audio quality setting */
    quality: 'low' | 'medium' | 'high';
}

/**
 * Audio event information
 */
export interface AudioEvent {
    /** Event identifier */
    id: string;
    
    /** Audio source to play */
    audioId: string;
    
    /** Trigger condition */
    trigger: string;
    
    /** Scene where this event is active */
    sceneId?: string;
    
    /** Whether this event should only play once */
    once: boolean;
    
    /** Whether this event has been triggered */
    triggered: boolean;
    
    /** Priority level (higher = more important) */
    priority: number;
    
    /** Fade in duration (seconds) */
    fadeIn?: number;
    
    /** Fade out duration (seconds) */
    fadeOut?: number;
}

/**
 * Audio Service Interface
 * 
 * Manages all audio functionality including ambient sounds, sound effects,
 * music, and voice narration. Supports the "listen" command and environmental audio.
 * 
 * Responsibilities:
 * - Audio playback and control
 * - Environmental sound management
 * - Music and ambient track handling
 * - Audio event triggering
 * - Volume and configuration management
 * 
 * Dependencies:
 * - Game state for context-aware audio
 * - Scene service for location-based audio
 * - Condition service for audio triggers
 * - Browser audio APIs or audio library
 */
export interface IAudioService {
    /**
     * Play an audio source
     * @param audioId Audio source identifier
     * @param volume Optional volume override (0-1)
     * @param loop Optional loop override
     * @returns Whether playback started successfully
     */
    play(audioId: string, volume?: number, loop?: boolean): Promise<boolean>;
    
    /**
     * Stop playing an audio source
     * @param audioId Audio source identifier
     * @param fadeOut Optional fade out duration (seconds)
     * @returns Whether the audio was stopped
     */
    stop(audioId: string, fadeOut?: number): Promise<boolean>;
    
    /**
     * Pause an audio source
     * @param audioId Audio source identifier
     * @returns Whether the audio was paused
     */
    pause(audioId: string): Promise<boolean>;
    
    /**
     * Resume a paused audio source
     * @param audioId Audio source identifier
     * @returns Whether the audio was resumed
     */
    resume(audioId: string): Promise<boolean>;
    
    /**
     * Set the volume of an audio source
     * @param audioId Audio source identifier
     * @param volume Volume level (0-1)
     * @returns Whether the volume was set
     */
    setVolume(audioId: string, volume: number): Promise<boolean>;
    
    /**
     * Get information about an audio source
     * @param audioId Audio source identifier
     * @returns Audio source information or null if not found
     */
    getAudioSource(audioId: string): Promise<AudioSource | null>;
    
    /**
     * Get all currently playing audio sources
     * @returns Array of playing audio sources
     */
    getPlayingAudio(): Promise<AudioSource[]>;
    
    /**
     * Stop all audio playback
     * @param fadeOut Optional fade out duration (seconds)
     * @returns Whether all audio was stopped
     */
    stopAll(fadeOut?: number): Promise<boolean>;
    
    /**
     * Get environmental audio for a scene
     * @param sceneId Scene identifier
     * @param gameState Current game state
     * @returns Array of ambient audio IDs for the scene
     */
    getSceneAudio(sceneId: string, gameState: GameState): Promise<string[]>;
    
    /**
     * Start ambient audio for a scene
     * @param sceneId Scene identifier
     * @param gameState Current game state
     * @returns Whether ambient audio was started
     */
    startSceneAmbient(sceneId: string, gameState: GameState): Promise<boolean>;
    
    /**
     * Stop ambient audio for a scene
     * @param sceneId Scene identifier
     * @param fadeOut Optional fade out duration
     * @returns Whether ambient audio was stopped
     */
    stopSceneAmbient(sceneId: string, fadeOut?: number): Promise<boolean>;
    
    /**
     * Handle the "listen" command
     * @param gameState Current game state
     * @returns Description of what the player hears
     */
    listen(gameState: GameState): Promise<string>;
    
    /**
     * Get audio events that should trigger in current context
     * @param gameState Current game state
     * @returns Array of audio events to trigger
     */
    getTriggeredEvents(gameState: GameState): Promise<AudioEvent[]>;
    
    /**
     * Process audio events for the current game state
     * @param gameState Current game state
     * @returns Updated game state with triggered events
     */
    processAudioEvents(gameState: GameState): Promise<GameState>;
    
    /**
     * Register a new audio source
     * @param audioSource Audio source configuration
     * @returns Whether the source was registered
     */
    registerAudioSource(audioSource: Omit<AudioSource, 'playing' | 'position'>): Promise<boolean>;
    
    /**
     * Unregister an audio source
     * @param audioId Audio source identifier
     * @returns Whether the source was unregistered
     */
    unregisterAudioSource(audioId: string): Promise<boolean>;
    
    /**
     * Get current audio configuration
     * @returns Current audio settings
     */
    getAudioConfig(): Promise<AudioConfig>;
    
    /**
     * Update audio configuration
     * @param config New audio configuration
     * @returns Whether the configuration was updated
     */
    setAudioConfig(config: Partial<AudioConfig>): Promise<boolean>;
    
    /**
     * Create a new audio event
     * @param event Audio event configuration
     * @returns Whether the event was created
     */
    createAudioEvent(event: Omit<AudioEvent, 'triggered'>): Promise<boolean>;
    
    /**
     * Remove an audio event
     * @param eventId Event identifier
     * @returns Whether the event was removed
     */
    removeAudioEvent(eventId: string): Promise<boolean>;
    
    /**
     * Get all audio events for a scene
     * @param sceneId Scene identifier
     * @returns Array of audio events
     */
    getSceneAudioEvents(sceneId: string): Promise<AudioEvent[]>;
    
    /**
     * Play a sound effect
     * @param effectId Sound effect identifier
     * @param volume Optional volume override
     * @returns Whether the effect played
     */
    playEffect(effectId: string, volume?: number): Promise<boolean>;
    
    /**
     * Start background music
     * @param musicId Music track identifier
     * @param fadeIn Optional fade in duration
     * @returns Whether the music started
     */
    playMusic(musicId: string, fadeIn?: number): Promise<boolean>;
    
    /**
     * Stop background music
     * @param fadeOut Optional fade out duration
     * @returns Whether the music stopped
     */
    stopMusic(fadeOut?: number): Promise<boolean>;
    
    /**
     * Check if audio is supported in the current environment
     * @returns Whether audio playback is available
     */
    isAudioSupported(): Promise<boolean>;
    
    /**
     * Get supported audio formats
     * @returns Array of supported format strings
     */
    getSupportedFormats(): Promise<string[]>;
    
    /**
     * Preload audio sources for better performance
     * @param audioIds Array of audio source identifiers
     * @returns Number of sources successfully preloaded
     */
    preloadAudio(audioIds: string[]): Promise<number>;
    
    /**
     * Unload audio sources to free memory
     * @param audioIds Array of audio source identifiers
     * @returns Number of sources successfully unloaded
     */
    unloadAudio(audioIds: string[]): Promise<number>;
    
    /**
     * Get audio loading progress
     * @param audioId Audio source identifier
     * @returns Loading progress (0-1) or -1 if not loading
     */
    getLoadingProgress(audioId: string): Promise<number>;
    
    /**
     * Set the global audio context (for web audio)
     * @param context Audio context to use
     * @returns Whether the context was set
     */
    setAudioContext(context: any): Promise<boolean>;
    
    /**
     * Get the current audio context
     * @returns Current audio context or null
     */
    getAudioContext(): Promise<any>;
    
    /**
     * Handle browser audio policy restrictions
     * @returns Whether audio was unlocked
     */
    unlockAudio(): Promise<boolean>;
    
    /**
     * Get audio latency information
     * @returns Audio latency in milliseconds
     */
    getLatency(): Promise<number>;
    
    /**
     * Enable or disable spatial audio
     * @param enabled Whether spatial audio should be enabled
     * @returns Whether the setting was applied
     */
    setSpatialAudio(enabled: boolean): Promise<boolean>;
    
    /**
     * Set the listener position for spatial audio
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     * @returns Whether the position was set
     */
    setListenerPosition(x: number, y: number, z: number): Promise<boolean>;
    
    /**
     * Set the position of an audio source for spatial audio
     * @param audioId Audio source identifier
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     * @returns Whether the position was set
     */
    setAudioPosition(audioId: string, x: number, y: number, z: number): Promise<boolean>;
}