/**
 * Save/Load Game Tests
 * Task 7.2: Game Persistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('SaveLoadGame', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Save Game', () => {
    it('should have saveGame function', () => {
      const store = useGameStore.getState();
      expect(typeof store.saveGame).toBe('function');
    });

    it('should save game state to localStorage', () => {
      const store = useGameStore.getState();
      
      // Make a move
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      
      // Save
      const success = store.saveGame('test-save-1');
      expect(success).toBe(true);
      
      // Verify saved to localStorage
      const saved = localStorage.getItem('chinese-chess-save-test-save-1');
      expect(saved).toBeDefined();
    });

    it('should save complete game state', () => {
      const store = useGameStore.getState();
      
      // Make some moves
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.makeMove({ file: 0, rank: 6 }, { file: 0, rank: 5 });
      
      // Save
      store.saveGame('test-save-2');
      
      // Verify state saved
      const saved = localStorage.getItem('chinese-chess-save-test-save-2');
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.gameState).toBeDefined();
      expect(parsed.gameState.board.moveHistory.length).toBe(2);
    });
  });

  describe('Load Game', () => {
    it('should have loadGame function', () => {
      const store = useGameStore.getState();
      expect(typeof store.loadGame).toBe('function');
    });

    it('should load game state from localStorage', () => {
      const store = useGameStore.getState();
      
      // Setup: Save a game
      const success = store.saveGame('test-load-1');
      expect(success).toBe(true);
      
      // Reset
      store.resetGame();
      
      // Load
      const loadSuccess = store.loadGame('test-load-1');
      expect(loadSuccess).toBe(true);
      expect(store.gameState.board.moveHistory.length).toBe(0); // Initial state
    });

    it('should return false if save not found', () => {
      const store = useGameStore.getState();
      const success = store.loadGame('non-existent-save');
      expect(success).toBe(false);
    });

    it('should restore complete game state', () => {
      const store = useGameStore.getState();
      
      // Setup: Save initial state
      const initialTurn = store.gameState.board.turn;
      store.saveGame('test-load-2');
      
      // Reset
      store.resetGame();
      
      // Load
      store.loadGame('test-load-2');
      
      // Verify state restored
      expect(store.gameState.board.moveHistory.length).toBe(0);
      expect(store.gameState.board.turn).toBe(initialTurn);
    });
  });

  describe('List Saves', () => {
    it('should have listSaves function', () => {
      const store = useGameStore.getState();
      expect(typeof store.listSaves).toBe('function');
    });

    it('should list saved games', () => {
      const store = useGameStore.getState();
      
      // Create some saves
      store.saveGame('save-1');
      store.saveGame('save-2');
      
      // List
      const saves = store.listSaves();
      expect(saves.length).toBeGreaterThan(0);
      expect(saves).toContain('save-1');
      expect(saves).toContain('save-2');
    });
  });

  describe('Delete Save', () => {
    it('should have deleteSave function', () => {
      const store = useGameStore.getState();
      expect(typeof store.deleteSave).toBe('function');
    });

    it('should delete a saved game', () => {
      const store = useGameStore.getState();
      
      // Create save
      store.saveGame('save-to-delete');
      
      // Delete
      const success = store.deleteSave('save-to-delete');
      expect(success).toBe(true);
      
      // Verify deleted
      const saves = store.listSaves();
      expect(saves).not.toContain('save-to-delete');
    });

    it('should return false if save not found', () => {
      const store = useGameStore.getState();
      const success = store.deleteSave('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('Save Metadata', () => {
    it('should save timestamp', () => {
      const store = useGameStore.getState();
      store.saveGame('test-meta-1');
      
      const saved = localStorage.getItem('chinese-chess-save-test-meta-1');
      const parsed = JSON.parse(saved!);
      
      expect(parsed.timestamp).toBeDefined();
      expect(Date.parse(parsed.timestamp)).toBeGreaterThan(0);
    });

    it('should save move count', () => {
      const store = useGameStore.getState();
      
      // Make moves
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.makeMove({ file: 0, rank: 6 }, { file: 0, rank: 5 });
      store.saveGame('test-meta-2');
      
      const saved = localStorage.getItem('chinese-chess-save-test-meta-2');
      const parsed = JSON.parse(saved!);
      
      expect(parsed.moveCount).toBe(2);
    });
  });
});
