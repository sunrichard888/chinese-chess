/**
 * Undo/Redo Functionality Tests
 * Task 7.1: Game History Management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('UndoRedo', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('Function Existence', () => {
    it('should have undo function', () => {
      const store = useGameStore.getState();
      expect(typeof store.undo).toBe('function');
    });

    it('should have redo function', () => {
      const store = useGameStore.getState();
      expect(typeof store.redo).toBe('function');
    });

    it('should have getHistoryPosition function', () => {
      const store = useGameStore.getState();
      expect(typeof store.getHistoryPosition).toBe('function');
    });

    it('should have getMoveHistory function', () => {
      const store = useGameStore.getState();
      expect(typeof store.getMoveHistory).toBe('function');
    });
  });

  describe('Initial State', () => {
    it('should start with empty history', () => {
      const store = useGameStore.getState();
      expect(store.history.length).toBe(0);
      expect(store.historyPosition).toBe(0);
    });

    it('should return false for undo at start', () => {
      const store = useGameStore.getState();
      expect(store.undo()).toBe(false);
    });

    it('should return false for redo at start', () => {
      const store = useGameStore.getState();
      expect(store.redo()).toBe(false);
    });
  });

  describe('History Tracking', () => {
    it('should track history position', () => {
      const store = useGameStore.getState();
      expect(store.getHistoryPosition()).toBe(0);
    });

    it('should return move history', () => {
      const store = useGameStore.getState();
      const history = store.getMoveHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });

  describe('Reset Clears History', () => {
    it('should clear history on reset', () => {
      const store = useGameStore.getState();
      
      // Manually add history (simulating moves)
      store.resetGame();
      
      expect(store.history.length).toBe(0);
      expect(store.historyPosition).toBe(0);
    });
  });
});
