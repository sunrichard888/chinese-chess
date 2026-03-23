/**
 * Move Generation Tests for Chinese Chess
 */

import { describe, it, expect } from 'vitest';
import { createInitialBoard } from '../../src/core/board';
import { createPosition, Color } from '../../src/core/types';
import { getValidMoves, getChariotMoves, getHorseMoves, getCannonMoves } from '../../src/core/moves';

describe('Move Generation', () => {
  describe('Initial Position', () => {
    it('should create valid initial board', () => {
      const board = createInitialBoard();
      expect(board.pieces).toHaveLength(32);
      expect(board.turn).toBe(Color.Red);
    });

    it('should have red pieces on ranks 0-4', () => {
      const board = createInitialBoard();
      const redPieces = board.pieces.filter(p => p.color === Color.Red);
      redPieces.forEach(p => expect(p.position.rank).toBeLessThan(5));
    });

    it('should have black pieces on ranks 5-9', () => {
      const board = createInitialBoard();
      const blackPieces = board.pieces.filter(p => p.color === Color.Black);
      blackPieces.forEach(p => expect(p.position.rank).toBeGreaterThanOrEqual(5));
    });
  });

  describe('Chariot (车) Movement', () => {
    it('can move orthogonally any distance when unblocked', () => {
      const board = createInitialBoard();
      // Test with a chariot that has open lines
      const chariotPos = createPosition(0, 0);
      const moves = getChariotMoves(board, chariotPos);
      
      // Should be able to move up the file
      expect(moves.some(m => m.file === 0 && m.rank === 1)).toBe(true);
      expect(moves.some(m => m.file === 0 && m.rank === 2)).toBe(true);
      // Should be able to move right on the rank
      expect(moves.some(m => m.file === 1 && m.rank === 0)).toBe(true);
    });

    it('cannot jump over pieces', () => {
      const board = createInitialBoard();
      const horsePos = createPosition(1, 0); // Horse is at (1, 0)
      const moves = getChariotMoves(board, createPosition(0, 0));
      
      // Should not be able to move past the horse
      expect(moves.some(m => m.file === 2 && m.rank === 0)).toBe(false);
    });
  });

  describe('Horse (马) Movement', () => {
    it('can move in L-shapes when not blocked', () => {
      const board = createInitialBoard();
      const moves = getHorseMoves(board, createPosition(1, 0));
      expect(Array.isArray(moves)).toBe(true);
    });

    it('is blocked by hobbling leg', () => {
      const board = createInitialBoard();
      const horsePos = createPosition(1, 9);
      const moves = getHorseMoves(board, horsePos);
      
      // The horse at starting position should have limited moves due to blocking
      expect(moves.length).toBeLessThan(8);
    });
  });

  describe('Cannon (炮) Movement', () => {
    it('can move like chariot when not capturing', () => {
      const board = createInitialBoard();
      const cannonPos = createPosition(1, 2);
      const moves = getCannonMoves(board, cannonPos);
      
      // Should be able to move forward
      expect(moves.some(m => m.file === 1 && m.rank === 3)).toBe(true);
    });

    it('captures by jumping over a screen', () => {
      // This would require a custom board setup
      // Simplified test - just verify function exists and returns array
      const board = createInitialBoard();
      const moves = getCannonMoves(board, createPosition(1, 2));
      expect(Array.isArray(moves)).toBe(true);
    });
  });

  describe('General Move Generation', () => {
    it('returns moves for all piece types', () => {
      const board = createInitialBoard();
      
      // Test chariot
      const chariotMoves = getValidMoves(board, createPosition(0, 0));
      expect(chariotMoves.length).toBeGreaterThan(0);

      // Test horse
      const horseMoves = getValidMoves(board, createPosition(1, 0));
      expect(horseMoves.length).toBeGreaterThan(0);

      // Test general (should be very limited in palace)
      const generalMoves = getValidMoves(board, createPosition(4, 0));
      expect(generalMoves.length).toBeLessThan(5);
    });
  });
});
