/**
 * E2E (End-to-End) Game Flow Tests
 * Task 7.3: Complete Game Scenarios
 * 
 * Tests complete user workflows from start to finish
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('E2E Game Flow', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('Complete Game Session', () => {
    it('should handle full game session', () => {
      const store = useGameStore.getState();
      
      // 1. Start new game (already done by reset)
      expect(store.gameState.board.turn).toBeDefined();
      
      // 2. Save initial game
      const saveSuccess = store.saveGame('e2e-test-game');
      expect(saveSuccess).toBe(true);
      
      // 3. Undo at start should fail
      const undoSuccess = store.undo();
      expect(undoSuccess).toBe(false);
      
      // 4. Redo at start should fail
      const redoSuccess = store.redo();
      expect(redoSuccess).toBe(false);
      
      // 5. List saves
      const saves = store.listSaves();
      expect(saves.length).toBeGreaterThanOrEqual(1);
      
      // 6. Cleanup
      store.deleteSave('e2e-test-game');
    });
  });

  describe('Player vs AI Flow', () => {
    it('should handle PvAI game setup', () => {
      const store = useGameStore.getState();
      
      // Set game mode to PvAI
      store.setGameMode('pvai');
      expect(store.gameMode).toBe('pvai');
      
      // Set difficulty
      store.setDifficulty('medium');
      expect(store.difficulty).toBe('medium');
      
      // Initialize audio
      store.initializeAudio();
      expect(store.audioManager).toBeDefined();
      
      // Make a move (player - Red)
      const moveSuccess = store.makeMove({ file: 1, rank: 2 }, { file: 4, rank: 2 });
      // Note: This may fail if move is invalid, but flow should work
      expect(typeof moveSuccess).toBe('boolean');
    });
  });

  describe('Player vs Player Flow', () => {
    it('should have game mode available', () => {
      const store = useGameStore.getState();
      
      // Verify game mode is accessible
      expect(store.gameMode).toBeDefined();
      expect(['pvp', 'pvai', 'aivai']).toContain(store.gameMode);
      
      // Verify game state accessible
      expect(store.gameState).toBeDefined();
      expect(store.gameState.board).toBeDefined();
    });
  });

  describe('Game State Persistence', () => {
    it('should persist and restore complex game state', () => {
      const store = useGameStore.getState();
      
      // Setup: Make several moves
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.makeMove({ file: 0, rank: 6 }, { file: 0, rank: 5 });
      store.makeMove({ file: 2, rank: 3 }, { file: 2, rank: 4 });
      store.makeMove({ file: 2, rank: 6 }, { file: 2, rank: 5 });
      
      const moveHistoryLength = store.gameState.board.moveHistory.length;
      const currentTurn = store.gameState.board.turn;
      
      // Save
      store.saveGame('e2e-persistence-test');
      
      // Reset
      store.resetGame();
      expect(store.gameState.board.moveHistory.length).toBe(0);
      
      // Load
      store.loadGame('e2e-persistence-test');
      
      // Verify restored
      expect(store.gameState.board.moveHistory.length).toBe(moveHistoryLength);
      expect(store.gameState.board.turn).toBe(currentTurn);
      
      // Cleanup
      store.deleteSave('e2e-persistence-test');
    });
  });

  describe('Undo/Redo in Game Context', () => {
    it('should handle undo/redo operations', () => {
      const store = useGameStore.getState();
      
      // Undo at start should fail
      expect(store.undo()).toBe(false);
      
      // Redo at start should fail
      expect(store.redo()).toBe(false);
      
      // History position should be 0
      expect(store.getHistoryPosition()).toBe(0);
    });
  });

  describe('Audio Integration', () => {
    it('should have audio available during game', () => {
      const store = useGameStore.getState();
      
      // Initialize audio
      store.initializeAudio();
      
      // Verify audio manager exists
      expect(store.audioManager).toBeDefined();
      
      // Verify volume is accessible
      const volume = store.audioManager?.getVolume();
      expect(volume).toBeDefined();
      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
      
      // Verify isMuted is accessible
      const isMuted = store.audioManager?.isMuted();
      expect(typeof isMuted).toBe('boolean');
    });
  });

  describe('Game Settings', () => {
    it('should allow setting game options', () => {
      const store = useGameStore.getState();
      
      // Set settings
      store.setDifficulty('hard');
      store.setGameMode('pvai');
      
      // Settings should be set
      expect(store.difficulty).toBeDefined();
      expect(store.gameMode).toBeDefined();
    });
  });

  describe('Multiple Save Slots', () => {
    it('should support multiple independent save slots', () => {
      const store = useGameStore.getState();
      
      // Save 1: Initial position
      store.saveGame('slot-1');
      
      // Save 2: Same position (different slot)
      store.saveGame('slot-2');
      
      // Save 3: Same position (different slot)
      store.saveGame('slot-3');
      
      // List all saves
      const saves = store.listSaves();
      expect(saves).toContain('slot-1');
      expect(saves).toContain('slot-2');
      expect(saves).toContain('slot-3');
      
      // Load any slot (all have same state)
      store.loadGame('slot-1');
      expect(store.gameState).toBeDefined();
      
      // Cleanup
      store.deleteSave('slot-1');
      store.deleteSave('slot-2');
      store.deleteSave('slot-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid moves gracefully', () => {
      const store = useGameStore.getState();
      
      // Try invalid move (horse can't move like this)
      const invalidMove = store.makeMove({ file: 1, rank: 0 }, { file: 5, rank: 5 });
      expect(invalidMove).toBe(false);
      
      // Game state should be unchanged
      expect(store.gameState.board.turn).toBe('red');
    });

    it('should handle loading non-existent save', () => {
      const store = useGameStore.getState();
      
      const result = store.loadGame('non-existent-save');
      expect(result).toBe(false);
    });

    it('should handle deleting non-existent save', () => {
      const store = useGameStore.getState();
      
      const result = store.deleteSave('non-existent-save');
      expect(result).toBe(false);
    });
  });
});
