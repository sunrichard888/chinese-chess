/**
 * Audio Manager - Core audio functionality for Chinese Chess
 * 
 * Handles volume control, mute functionality, and audio playback
 */

interface Sound {
  src: string;
}

export class AudioManager {
  private volume: number = 0.5;
  private previousVolume: number = 0.5;
  private muted: boolean = false;
  private sounds: Map<string, Sound> = new Map();
  private playingSounds: Map<string, any> = new Map();

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
   * Play a sound by key
   * @param key - Sound identifier
   * @returns True if playback started, false otherwise
   */
  play(key: string): boolean {
    // Don't play if muted or volume is 0
    if (this.muted || this.volume === 0.0) {
      return false;
    }

    const sound = this.sounds.get(key);
    if (!sound) {
      return false;
    }

    // In real implementation, this would create HTML5 Audio or use Web Audio API
    // For now, we simulate playback
    const mockPlayback = {
      src: sound.src,
      volume: this.volume,
      play: () => Promise.resolve(),
    };

    this.playingSounds.set(key, mockPlayback);
    
    // Simulate async playback
    mockPlayback.play().catch(console.error);
    
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
