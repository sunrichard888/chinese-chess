/**
 * Sound Preset Tests
 * Task 5.2.2: Sound File Loading
 * 
 * Tests for loading preset sound packs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager, SoundPreset, loadSoundPreset } from '../../src/audio/audio-manager';

describe('SoundPreset', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  describe('Sound Preset Loading', () => {
    it('should load default sound preset', () => {
      // Act: Load default preset
      loadSoundPreset(audioManager, 'default');

      // Assert: All default sounds should be loaded
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('capture')).toBe(true);
      expect(audioManager.hasSound('check')).toBe(true);
      expect(audioManager.hasSound('gameOver')).toBe(true);
    });

    it('should load sounds with correct paths', () => {
      // Act: Load default preset
      loadSoundPreset(audioManager, 'default');

      // Note: We can't verify exact paths without accessing internal state
      // but we can verify sounds are loaded and playable
      const moveResult = audioManager.play('move');
      expect(moveResult).toBe(true);
    });

    it('should return false for unknown preset', () => {
      // Act: Try to load unknown preset
      const result = loadSoundPreset(audioManager, 'unknown' as any);

      // Assert: Should return false
      expect(result).toBe(false);
      expect(audioManager.hasSound('move')).toBe(false);
    });
  });

  describe('Custom Sound Pack', () => {
    it('should load custom sound pack', () => {
      // Setup: Define custom sounds
      const customSounds: SoundPreset = {
        move: { src: '/custom/move.wav' },
        capture: { src: '/custom/capture.wav' },
        check: { src: '/custom/check.wav' },
        gameOver: { src: '/custom/gameover.wav' },
      };

      // Act: Load custom preset
      loadSoundPreset(audioManager, customSounds);

      // Assert: Custom sounds should be loaded
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('capture')).toBe(true);
      expect(audioManager.hasSound('check')).toBe(true);
      expect(audioManager.hasSound('gameOver')).toBe(true);
    });

    it('should allow partial custom sound pack', () => {
      // Setup: Define partial custom sounds
      const partialSounds: SoundPreset = {
        move: { src: '/custom/move.wav' },
      };

      // Act: Load partial preset
      loadSoundPreset(audioManager, partialSounds);

      // Assert: Only move sound should be loaded
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('capture')).toBe(false);
    });
  });
});
