/**
 * Sound Theme Tests
 * Task 5.6: Sound Theme Switching
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager, loadSoundPreset, SoundTheme } from '../../src/audio/audio-manager';

describe('SoundTheme', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  describe('Theme Presets', () => {
    it('should load classic theme', () => {
      const result = loadSoundPreset(audioManager, 'classic');
      
      expect(result).toBe(true);
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('capture')).toBe(true);
      expect(audioManager.hasSound('check')).toBe(true);
      expect(audioManager.hasSound('gameOver')).toBe(true);
    });

    it('should load modern theme', () => {
      const result = loadSoundPreset(audioManager, 'modern');
      
      expect(result).toBe(true);
      expect(audioManager.hasSound('move')).toBe(true);
    });

    it('should load default theme', () => {
      const result = loadSoundPreset(audioManager, 'default');
      
      expect(result).toBe(true);
      expect(audioManager.hasSound('move')).toBe(true);
    });

    it('should return false for unknown theme', () => {
      const result = loadSoundPreset(audioManager, 'unknown' as any);
      
      expect(result).toBe(false);
    });
  });

  describe('Theme Switching', () => {
    it('should switch from classic to modern theme', () => {
      // Load classic theme
      loadSoundPreset(audioManager, 'classic');
      const classicMove = audioManager.hasSound('move');
      
      // Switch to modern theme
      loadSoundPreset(audioManager, 'modern');
      const modernMove = audioManager.hasSound('move');
      
      // Both should have move sound
      expect(classicMove).toBe(true);
      expect(modernMove).toBe(true);
    });

    it('should allow custom theme', () => {
      const customTheme: SoundTheme = {
        move: { src: '/custom/move.mp3' },
        capture: { src: '/custom/capture.mp3' },
      };
      
      const result = loadSoundPreset(audioManager, customTheme);
      
      expect(result).toBe(true);
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('capture')).toBe(true);
    });
  });
});
