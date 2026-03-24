/**
 * Audio Settings Persistence Tests
 * Task 5.7: Settings Persistence to localStorage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioManager, loadSoundPreset, saveAudioSettings, loadAudioSettings } from '../../src/audio/audio-manager';

describe('AudioSettingsPersistence', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
    loadSoundPreset(audioManager, 'default');
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveAudioSettings', () => {
    it('should save volume to localStorage', () => {
      audioManager.setVolume(0.8);
      saveAudioSettings(audioManager);

      const saved = localStorage.getItem('chinese-chess-audio');
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.volume).toBe(0.8);
    });

    it('should save muted state to localStorage', () => {
      audioManager.setMute(true);
      saveAudioSettings(audioManager);

      const saved = localStorage.getItem('chinese-chess-audio');
      const parsed = JSON.parse(saved!);
      expect(parsed.muted).toBe(true);
    });

    it('should save theme to localStorage', () => {
      saveAudioSettings(audioManager, 'classic');

      const saved = localStorage.getItem('chinese-chess-audio');
      const parsed = JSON.parse(saved!);
      expect(parsed.theme).toBe('classic');
    });
  });

  describe('loadAudioSettings', () => {
    it('should load volume from localStorage', () => {
      // Setup: Save settings
      localStorage.setItem('chinese-chess-audio', JSON.stringify({
        volume: 0.7,
        muted: false,
        theme: 'default',
      }));

      // Act: Load settings
      const loaded = loadAudioSettings(audioManager);

      // Assert
      expect(loaded).toBe(true);
      expect(audioManager.getVolume()).toBe(0.7);
    });

    it('should load muted state from localStorage', () => {
      // Setup
      localStorage.setItem('chinese-chess-audio', JSON.stringify({
        volume: 0.5,
        muted: true,
        theme: 'default',
      }));

      // Act
      loadAudioSettings(audioManager);

      // Assert
      expect(audioManager.isMuted()).toBe(true);
    });

    it('should return false if no settings in localStorage', () => {
      const result = loadAudioSettings(audioManager);
      expect(result).toBe(false);
    });

    it('should handle corrupted localStorage data', () => {
      // Setup: Invalid JSON
      localStorage.setItem('chinese-chess-audio', 'invalid-json');

      // Act: Should not throw
      const result = loadAudioSettings(audioManager);

      // Assert: Should return false
      expect(result).toBe(false);
    });
  });

  describe('Full Persistence Cycle', () => {
    it('should save and load volume correctly', () => {
      // Setup: Configure audio (don't mute, as mute sets volume to 0)
      audioManager.setVolume(0.9);

      // Save
      saveAudioSettings(audioManager, 'classic');

      // Create new audio manager (simulating page reload)
      const newAudioManager = new AudioManager();
      
      // Load settings
      loadAudioSettings(newAudioManager);

      // Assert: Volume restored
      expect(newAudioManager.getVolume()).toBe(0.9);
    });

    it('should save and load mute state correctly', () => {
      // Setup: Mute audio
      audioManager.setMute(true);

      // Save
      saveAudioSettings(audioManager, 'default');

      // Create new audio manager
      const newAudioManager = new AudioManager();
      
      // Load settings
      loadAudioSettings(newAudioManager);

      // Assert: Mute state restored
      expect(newAudioManager.isMuted()).toBe(true);
    });
  });
});
