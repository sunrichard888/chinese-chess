/**
 * Audio Playback Tests
 * Task 5.1: Audio Manager Core - Playback functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../src/audio/audio-manager';

describe('AudioManager - Playback', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  describe('Sound Loading', () => {
    it('should load sound file by key', () => {
      const mockSound = { src: '/sounds/move.mp3' };
      audioManager.loadSound('move', mockSound);
      
      expect(audioManager.hasSound('move')).toBe(true);
    });

    it('should return false for non-existent sound', () => {
      expect(audioManager.hasSound('nonexistent')).toBe(false);
    });

    it('should load multiple sounds', () => {
      audioManager.loadSound('move', { src: '/sounds/move.mp3' });
      audioManager.loadSound('check', { src: '/sounds/check.mp3' });
      audioManager.loadSound('win', { src: '/sounds/win.mp3' });
      
      expect(audioManager.hasSound('move')).toBe(true);
      expect(audioManager.hasSound('check')).toBe(true);
      expect(audioManager.hasSound('win')).toBe(true);
    });
  });

  describe('Sound Playback', () => {
    beforeEach(() => {
      // Load a mock sound
      audioManager.loadSound('test', { src: '/sounds/test.mp3' });
    });

    it('should play loaded sound', () => {
      const result = audioManager.play('test');
      expect(result).toBe(true);
    });

    it('should not play non-existent sound', () => {
      const result = audioManager.play('nonexistent');
      expect(result).toBe(false);
    });

    it('should not play when muted', () => {
      audioManager.setMute(true);
      const result = audioManager.play('test');
      expect(result).toBe(false);
    });

    it('should not play when volume is 0', () => {
      audioManager.setVolume(0.0);
      const result = audioManager.play('test');
      expect(result).toBe(false);
    });

    it('should play when unmuted after being muted', () => {
      audioManager.setMute(true);
      let result = audioManager.play('test');
      expect(result).toBe(false);

      audioManager.setMute(false);
      result = audioManager.play('test');
      expect(result).toBe(true);
    });
  });

  describe('Volume Affects Playback', () => {
    beforeEach(() => {
      audioManager.loadSound('test', { src: '/sounds/test.mp3' });
    });

    it('should play at full volume when volume is 1.0', () => {
      audioManager.setVolume(1.0);
      const playResult = audioManager.play('test');
      expect(playResult).toBe(true);
    });

    it('should play at reduced volume when volume is 0.5', () => {
      audioManager.setVolume(0.5);
      const playResult = audioManager.play('test');
      expect(playResult).toBe(true);
    });
  });
});
