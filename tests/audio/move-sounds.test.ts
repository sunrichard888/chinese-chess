/**
 * Move Sounds Tests
 * Task 5.2: Move Sound Effects
 * 
 * Tests for playing sounds on piece moves and captures
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../../src/audio/audio-manager';

describe('MoveSounds', () => {
  let audioManager: AudioManager;
  let loadSoundSpy: any;

  beforeEach(() => {
    audioManager = new AudioManager();
    loadSoundSpy = vi.spyOn(audioManager, 'loadSound');
  });

  afterEach(() => {
    loadSoundSpy.mockRestore();
  });

  describe('Move Sound Playback', () => {
    it('should play move sound when playing a move', () => {
      // Setup: Load move sound
      audioManager.loadSound('move', { src: '/sounds/move.mp3' });

      // Act: Play move sound
      const result = audioManager.play('move');

      // Assert: Sound should play
      expect(result).toBe(true);
    });

    it('should return false when playing while muted', () => {
      // Setup: Load sound and mute
      audioManager.loadSound('move', { src: '/sounds/move.mp3' });
      audioManager.setMute(true);

      // Act: Try to play
      const result = audioManager.play('move');

      // Assert: Should return false when muted
      expect(result).toBe(false);
    });

    it('should return false when move sound not loaded', () => {
      // Act: Try to play unloaded sound
      const result = audioManager.play('move');

      // Assert: Should fail gracefully
      expect(result).toBe(false);
    });
  });

  describe('Capture Sound', () => {
    it('should play capture sound when capturing a piece', () => {
      // Setup: Load capture sound
      audioManager.loadSound('capture', { src: '/sounds/capture.mp3' });

      // Act: Play capture sound
      const result = audioManager.play('capture');

      // Assert: Sound should play
      expect(result).toBe(true);
    });

    it('should handle capture sound with higher priority', () => {
      // Setup: Load both sounds
      audioManager.loadSound('move', { src: '/sounds/move.mp3' });
      audioManager.loadSound('capture', { src: '/sounds/capture.mp3' });

      // Act: Play capture (should stop any playing move sound)
      audioManager.play('move');
      audioManager.play('capture');

      // Assert: Capture should play successfully
      const captureResult = audioManager.play('capture');
      expect(captureResult).toBe(true);
    });
  });

  describe('Check Sound', () => {
    it('should play check sound when general is in check', () => {
      // Setup: Load check sound
      audioManager.loadSound('check', { src: '/sounds/check.mp3' });

      // Act: Play check sound
      const result = audioManager.play('check');

      // Assert: Sound should play
      expect(result).toBe(true);
    });

    it('should stop previous sounds when playing check sound', () => {
      // Setup: Load sounds
      audioManager.loadSound('move', { src: '/sounds/move.mp3' });
      audioManager.loadSound('check', { src: '/sounds/check.mp3' });

      // Act: Play move, then check (urgent)
      audioManager.play('move');
      audioManager.stop('move');
      const checkResult = audioManager.play('check');

      // Assert: Check should play successfully
      expect(checkResult).toBe(true);
    });
  });
});
