/**
 * Audio Manager - Core audio functionality for Chinese Chess
 * 
 * Handles volume control, mute functionality, and audio playback
 * Uses Web Audio API for synthesized sounds (no external files needed)
 */

export interface Sound {
  src: string;
  frequency?: number;  // For synthesized sounds
  duration?: number;   // Duration in ms
  type?: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

/**
 * Sound preset type - can be a preset name or custom sound map
 */
export type SoundPreset = 'default' | 'classic' | 'modern' | Record<string, Sound>;

/**
 * Sound theme type for theme switching
 */
export type SoundTheme = 'default' | 'classic' | 'modern' | Record<string, Sound>;

/**
 * Default sound preset paths
 */
const DEFAULT_SOUND_PRESET: Record<string, Sound> = {
  move: { src: '/sounds/move.mp3' },
  capture: { src: '/sounds/capture.mp3' },
  check: { src: '/sounds/check.mp3' },
  gameOver: { src: '/sounds/gameover.mp3' },
};

/**
 * Classic theme - traditional Chinese instruments
 */
const CLASSIC_THEME: Record<string, Sound> = {
  move: { src: '/sounds/classic/move.mp3' },
  capture: { src: '/sounds/classic/capture.mp3' },
  check: { src: '/sounds/classic/check.mp3' },
  gameOver: { src: '/sounds/classic/gameover.mp3' },
};

/**
 * Modern theme - electronic/digital sounds
 */
const MODERN_THEME: Record<string, Sound> = {
  move: { src: '/sounds/modern/move.mp3' },
  capture: { src: '/sounds/modern/capture.mp3' },
  check: { src: '/sounds/modern/check.mp3' },
  gameOver: { src: '/sounds/modern/gameover.mp3' },
};

export class AudioManager {
  private volume: number = 0.5;
  private previousVolume: number = 0.5;
  private muted: boolean = false;
  private sounds: Map<string, Sound> = new Map();
  private playingSounds: Map<string, any> = new Map();
  private audioContext: AudioContext | null = null;
  
  // Sound presets for synthesized audio
  private soundPresets: Record<string, { frequency: number; duration: number; type: 'sine' | 'square' | 'triangle' | 'sawtooth' }> = {
    'move': { frequency: 440, duration: 100, type: 'sine' },
    'capture': { frequency: 880, duration: 150, type: 'square' },
    'check': { frequency: 660, duration: 200, type: 'triangle' },
    'gameOver': { frequency: 523, duration: 300, type: 'sine' },
  };

  /**
   * Get current volume (0.0 - 1.0)
   * @returns Current volume level
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Set volume (clamped between 0.0 and 1.0)
   * @param value - Volume level (0.0 to 1.0)
   */
  setVolume(value: number): void {
    // Clamp volume between 0 and 1
    this.volume = Math.max(0.0, Math.min(1.0, value));
    
    // If unmuting, update previous volume
    if (this.muted && this.volume > 0) {
      this.previousVolume = this.volume;
    }
  }

  /**
   * Mute or unmute audio
   * @param muted - Whether to mute (true) or unmute (false)
   */
  setMute(muted: boolean): void {
    if (muted && !this.muted) {
      // Store current volume before muting
      this.previousVolume = this.volume;
      this.volume = 0.0;
    } else if (!muted && this.muted) {
      // Restore previous volume when unmuting
      this.volume = this.previousVolume;
    }
    this.muted = muted;
  }

  /**
   * Check if audio is muted
   * @returns True if muted, false otherwise
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.setMute(!this.muted);
  }

  /**
   * Reset volume to default (50%)
   */
  resetVolume(): void {
    this.volume = 0.5;
    this.previousVolume = 0.5;
    this.muted = false;
  }

  /**
   * Load a sound file by key
   * @param key - Sound identifier
   * @param sound - Sound object with src
   */
  loadSound(key: string, sound: Sound): void {
    this.sounds.set(key, sound);
  }

  /**
   * Check if a sound is loaded
   * @param key - Sound identifier
   * @returns True if sound exists
   */
  hasSound(key: string): boolean {
    return this.sounds.has(key);
  }

  /**
   * Play a sound by key using Web Audio API
   * @param key - Sound identifier
   * @returns True if playback started, false otherwise
   */
  play(key: string): boolean {
    // Don't play if muted or volume is 0
    if (this.muted || this.volume === 0.0) {
      return false;
    }

    // Get sound preset or loaded sound
    const preset = this.soundPresets[key];
    if (!preset) {
      return false;
    }

    // Initialize AudioContext on first user interaction
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
        return false;
      }
    }

    // Create oscillator for synthesized sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.frequency, this.audioContext.currentTime);
    
    // Apply volume
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + preset.duration / 1000);

    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + preset.duration / 1000);

    return true;
  }

  /**
   * Stop a playing sound
   * @param key - Sound identifier
   */
  stop(key: string): void {
    this.playingSounds.delete(key);
  }

  /**
   * Stop all playing sounds
   */
  stopAll(): void {
    this.playingSounds.clear();
  }

  /**
   * Preload all sounds (for better performance)
   * @param soundMap - Map of sound keys to sound objects
   */
  preloadSounds(soundMap: Record<string, Sound>): void {
    Object.entries(soundMap).forEach(([key, sound]) => {
      this.loadSound(key, sound);
    });
  }
}

export default AudioManager;

/**
 * Audio settings interface for persistence
 */
export interface AudioSettings {
  volume: number;
  muted: boolean;
  theme: string;
}

const STORAGE_KEY = 'chinese-chess-audio';

/**
 * Save audio settings to localStorage
 * @param audioManager - The audio manager instance
 * @param theme - Current theme name
 */
export function saveAudioSettings(audioManager: AudioManager, theme: string = 'default'): void {
  const settings: AudioSettings = {
    volume: audioManager.getVolume(),
    muted: audioManager.isMuted(),
    theme,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Load audio settings from localStorage
 * @param audioManager - The audio manager instance
 * @returns True if settings were loaded, false if no settings exist
 */
export function loadAudioSettings(audioManager: AudioManager): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return false;
    }

    const settings: AudioSettings = JSON.parse(saved);
    
    // Apply settings
    audioManager.setVolume(settings.volume);
    audioManager.setMute(settings.muted);
    
    return true;
  } catch (error) {
    // Corrupted data
    console.error('Failed to load audio settings:', error);
    return false;
  }
}

/**
 * Load a sound preset into the audio manager
 * @param audioManager - The audio manager instance
 * @param preset - Preset name ('default', 'classic', 'modern') or custom sound map
 * @returns True if loaded successfully, false otherwise
 */
export function loadSoundPreset(audioManager: AudioManager, preset: SoundPreset): boolean {
  let soundsToLoad: Record<string, Sound>;

  if (preset === 'default') {
    soundsToLoad = DEFAULT_SOUND_PRESET;
  } else if (preset === 'classic') {
    soundsToLoad = CLASSIC_THEME;
  } else if (preset === 'modern') {
    soundsToLoad = MODERN_THEME;
  } else if (typeof preset === 'object' && preset !== null) {
    soundsToLoad = preset;
  } else {
    // Unknown preset
    return false;
  }

  // Load sounds
  Object.entries(soundsToLoad).forEach(([key, sound]) => {
    audioManager.loadSound(key, sound);
  });

  return true;
}
