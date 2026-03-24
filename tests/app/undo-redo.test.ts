/**
 * Undo/Redo Functionality Tests
 * Task 7.1: Game History Management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/app/game-store';

describe('UndoRedo', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.getState().resetGame();
  });

  describe('Basic Undo', () => {
    it('should undo a single move', () => {
      const store = useGameStore.getState();
      store.initializeAudio();
      
      // Make a move (soldier forward)
      const from = { file: 0, rank: 3 };
      const to = { file: 0, rank: 4 };
      const success = store.makeMove(from, to);
      
      // Verify move was made
      expect(success).toBe(true);
      expect(store.gameState.board.moveHistory.length).toBe(1);
      
      // Undo
      const undoSuccess = store.undo();
      
      // Verify undo worked
      expect(undoSuccess).toBe(true);
      expect(store.gameState.board.moveHistory.length).toBe(0);
    });

    it('should undo multiple moves', () => {
      const store = useGameStore.getState();
      
      // Make two moves (soldier forward)
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 }); // Red soldier
      store.makeMove({ file: 0, rank: 6 }, { file: 0, rank: 5 }); // Black soldier
      
      // Verify moves were made
      expect(store.gameState.board.moveHistory.length).toBe(2);
      
      // Undo twice
      store.undo();
      expect(store.gameState.board.moveHistory.length).toBe(1);
      
      store.undo();
      expect(store.gameState.board.moveHistory.length).toBe(0);
    });

    it('should return false when nothing to undo', () => {
      const store = useGameStore.getState();
      const success = store.undo();
      expect(success).toBe(false);
    });

    it('should restore previous board state after undo', () => {
      const store = useGameStore.getState();
      
      // Get initial state
      const initialPieces = store.gameState.board.pieces.length;
      
      // Make a move (capture)
      store.makeMove({ file: 1, rank: 2 }, { file: 1, rank: 7 }); // Cannon captures
      
      // Undo
      store.undo();
      
      // Should be back to initial state
      expect(store.gameState.board.pieces.length).toBe(initialPieces);
    });
  });

  describe('Basic Redo', () => {
    it('should redo an undone move', () => {
      const store = useGameStore.getState();
      
      // Make and undo a move
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.undo();
      
      // Redo
      const success = store.redo();
      
      expect(success).toBe(true);
      expect(store.gameState.board.moveHistory.length).toBe(1);
    });

    it('should redo multiple moves', () => {
      const store = useGameStore.getState();
      
      // Make and undo two moves
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.makeMove({ file: 0, rank: 6 }, { file: 0, rank: 5 });
      store.undo();
      store.undo();
      
      // Redo twice
      store.redo();
      expect(store.gameState.board.moveHistory.length).toBe(1);
      
      store.redo();
      expect(store.gameState.board.moveHistory.length).toBe(2);
    });

    it('should return false when nothing to redo', () => {
      const store = useGameStore.getState();
      const success = store.redo();
      expect(success).toBe(false);
    });

    it('should clear redo stack on new move', () => {
      const store = useGameStore.getState();
      
      // Make and undo a move
      store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      store.undo();
      
      // Make a different move
      store.makeMove({ file: 2, rank: 3 }, { file: 2, rank: 4 });
      
      // Redo should fail (stack cleared)
      const success = store.redo();
      expect(success).toBe(false);
    });
  });

  describe('Undo/Redo with Game State', () => {
    it('should restore turn after undo', () => {
      const store = useGameStore.getState();
      const initialTurn = store.gameState.board.turn;
      
      // Make a move (turn changes)
      const success = store.makeMove({ file: 0, rank: 3 }, { file: 0, rank: 4 });
      expect(success).toBe(true);
      expect(store.gameState.board.turn).not.toBe(initialTurn);
      
      // Undo (turn should be restored)
      store.undo();
      expect(store.gameState.board.turn).toBe(initialTurn);
    });

    it('should clear undo history on reset', () => {
      const store = useGameStore.getState();
      
      // Make some moves
      store.makeMove({ file: 1, rank: 0 }, { file: 2, rank: 2 });
      store.makeMove({ file: 1, rank: 9 }, { file: 2, rank: 7 });
      store.undo();
      
      // Reset
      store.resetGame();
      
      // Both undo and redo should fail
      expect(store.undo()).toBe(false);
      expect(store.redo()).toBe(false);
    });
  });

  describe('History Navigation', () => {
    it('should track history position', () => {
      const store = useGameStore.getState();
      
      // Make moves
      store.makeMove({ file: 1, rank: 0 }, { file: 2, rank: 2 });
      store.makeMove({ file: 1, rank: 9 }, { file: 2, rank: 7 });
      
      // Should be at end of history
      expect(store.getHistoryPosition()).toBe(2);
      
      // Undo
      store.undo();
      expect(store.getHistoryPosition()).toBe(1);
      
      // Redo
      store.redo();
      expect(store.getHistoryPosition()).toBe(2);
    });

    it('should get moves at specific history position', () => {
      const store = useGameStore.getState();
      
      // Make moves
      const move1 = { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 } };
      const move2 = { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 } };
      
      store.makeMove(move1.from, move1.to);
      store.makeMove(move2.from, move2.to);
      
      // Get history
      const history = store.getMoveHistory();
      expect(history.length).toBe(2);
    });
  });
});
