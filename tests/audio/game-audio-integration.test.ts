/**
 * Game Audio Integration Tests
 * Task 5.3: Move Sound Integration
 * 
 * Tests for playing sounds during game moves via game store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('GameAudioIntegration', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      gameState: useGameStore.getState().gameState,
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      inCheck: null,
    });
  });

  describe('Move Sound on Game Move', () => {
    it('should play move sound on normal move', () => {
      // Setup: Initialize audio and spy on play
      const store = useGameStore.getState();
      store.initializeAudio();
      
      const audioManager = useGameStore.getState().audioManager;
      expect(audioManager).toBeDefined();
      
      const playSpy = vi.spyOn(audioManager!, 'play');

      // Act: Make a normal move (red pawn forward)
      const from = { file: 0, rank: 3 };
      const to = { file: 0, rank: 4 };
      const result = useGameStore.getState().makeMove(from, to);

      // Assert: Move should succeed and play move sound
      expect(result).toBe(true);
      expect(playSpy).toHaveBeenCalledWith('move');
      
      playSpy.mockRestore();
    });

    it('should play sounds on game moves', () => {
      // Setup: Initialize audio
      const store = useGameStore.getState();
      store.initializeAudio();
      
      const audioManager = useGameStore.getState().audioManager;
      const playSpy = vi.spyOn(audioManager!, 'play');

      // Act: Make a normal move (red horse from (1,0) to (2,2))
      const from = { file: 1, rank: 0 };
      const to = { file: 2, rank: 2 };
      const result = useGameStore.getState().makeMove(from, to);

      // Assert: Move should succeed and play move sound
      expect(result).toBe(true);
      expect(playSpy).toHaveBeenCalledWith('move');
      
      playSpy.mockRestore();
    });
  });

  describe('Audio Controls in Game', () => {
    it('should initialize audio with default preset', () => {
      // Act: Initialize audio
      useGameStore.getState().initializeAudio();
      
      // Assert: Audio manager should be initialized
      const audioManager = useGameStore.getState().audioManager;
      expect(audioManager).toBeDefined();
      expect(audioManager!.hasSound('move')).toBe(true);
      expect(audioManager!.hasSound('capture')).toBe(true);
    });

    it('should set volume', () => {
      // Setup
      useGameStore.getState().initializeAudio();
      
      // Act
      useGameStore.getState().setVolume(0.8);
      
      // Assert
      const audioManager = useGameStore.getState().audioManager;
      expect(audioManager!.getVolume()).toBe(0.8);
    });

    it('should toggle mute', () => {
      // Setup
      useGameStore.getState().initializeAudio();
      
      // Act & Assert
      expect(useGameStore.getState().audioManager!.isMuted()).toBe(false);
      
      useGameStore.getState().toggleMute();
      expect(useGameStore.getState().audioManager!.isMuted()).toBe(true);
      
      useGameStore.getState().toggleMute();
      expect(useGameStore.getState().audioManager!.isMuted()).toBe(false);
    });
  });
});
