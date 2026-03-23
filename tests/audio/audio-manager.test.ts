/**
 * Audio Manager Tests
 * Task 5.1: Audio Manager Core
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../src/audio/audio-manager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  describe('Initialization', () => {
    it('should create audio manager instance', () => {
      expect(audioManager).toBeDefined();
      expect(audioManager).toBeInstanceOf(AudioManager);
    });

    it('should have default volume of 50%', () => {
      expect(audioManager.getVolume()).toBe(0.5);
    });
  });

  describe('Volume Control', () => {
    it('should allow setting volume', () => {
      audioManager.setVolume(0.8);
      expect(audioManager.getVolume()).toBe(0.8);
    });

    it('should clamp volume between 0 and 1', () => {
      audioManager.setVolume(1.5);
      expect(audioManager.getVolume()).toBe(1.0);

      audioManager.setVolume(-0.5);
      expect(audioManager.getVolume()).toBe(0.0);
    });

    it('should accept volume at boundaries', () => {
      audioManager.setVolume(0.0);
      expect(audioManager.getVolume()).toBe(0.0);

      audioManager.setVolume(1.0);
      expect(audioManager.getVolume()).toBe(1.0);
    });
  });

  describe('Mute Functionality', () => {
    it('should be muted when setMute(true)', () => {
      audioManager.setMute(true);
      expect(audioManager.isMuted()).toBe(true);
    });

    it('should not be muted by default', () => {
      expect(audioManager.isMuted()).toBe(false);
    });

    it('should restore volume after unmuting', () => {
      audioManager.setVolume(0.7);
      audioManager.setMute(true);
      expect(audioManager.isMuted()).toBe(true);
      expect(audioManager.getVolume()).toBe(0.0);

      audioManager.setMute(false);
      expect(audioManager.isMuted()).toBe(false);
      expect(audioManager.getVolume()).toBe(0.7);
    });

    it('should toggle mute state', () => {
      expect(audioManager.isMuted()).toBe(false);

      audioManager.toggleMute();
      expect(audioManager.isMuted()).toBe(true);

      audioManager.toggleMute();
      expect(audioManager.isMuted()).toBe(false);
    });
  });
});
