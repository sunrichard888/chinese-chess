/**
 * Volume Control Tests
 * Task 5.5: Volume Control Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('VolumeControl', () => {
  beforeEach(() => {
    useGameStore.getState().initializeAudio();
  });

  it('should initialize with audio', () => {
    const state = useGameStore.getState();
    expect(state.audioManager).toBeDefined();
  });

  it('should have default volume of 50%', () => {
    const audioManager = useGameStore.getState().audioManager;
    expect(audioManager?.getVolume()).toBe(0.5);
  });

  it('should set volume via store action', () => {
    useGameStore.getState().setVolume(0.8);
    const audioManager = useGameStore.getState().audioManager;
    expect(audioManager?.getVolume()).toBe(0.8);
  });

  it('should toggle mute via store action', () => {
    const state = useGameStore.getState();
    const initialState = state.audioManager?.isMuted();
    
    state.toggleMute();
    const afterToggle = state.audioManager?.isMuted();
    
    expect(afterToggle).not.toBe(initialState);
  });

  it('should restore volume after unmuting', () => {
    const state = useGameStore.getState();
    
    // Set volume to 0.7
    state.setVolume(0.7);
    expect(state.audioManager?.getVolume()).toBe(0.7);
    
    // Mute
    state.toggleMute();
    expect(state.audioManager?.isMuted()).toBe(true);
    
    // Unmute
    state.toggleMute();
    expect(state.audioManager?.isMuted()).toBe(false);
    expect(state.audioManager?.getVolume()).toBe(0.7);
  });

  it('should have all game sounds loaded', () => {
    const audioManager = useGameStore.getState().audioManager;
    
    expect(audioManager?.hasSound('move')).toBe(true);
    expect(audioManager?.hasSound('capture')).toBe(true);
    expect(audioManager?.hasSound('check')).toBe(true);
    expect(audioManager?.hasSound('gameOver')).toBe(true);
  });
});
