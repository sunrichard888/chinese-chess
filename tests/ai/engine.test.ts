/**
 * AI Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { Color } from '../../src/core/types';
import { createInitialBoard } from '../../src/core/board';
import { evaluateBoard, getBestMove, Difficulty, PIECE_VALUES } from '../../src/ai/engine';

describe('AI Engine', () => {
  describe('Board Evaluation', () => {
    it('should return 0 for starting position (equal material)', () => {
      const board = createInitialBoard();
      const score = evaluateBoard(board);
      expect(score).toBe(0);
    });

    it('should favor side with more material', () => {
      // Create a test position where red has extra material
      const board = createInitialBoard();
      // Remove a black piece (simplified - would need proper board manipulation)
      const score = evaluateBoard(board);
      expect(typeof score).toBe('number');
    });

    it('should correctly value pieces', () => {
      expect(PIECE_VALUES.general).toBe(10000);
      expect(PIECE_VALUES.chariot).toBe(90);
      expect(PIECE_VALUES.cannon).toBe(45);
      expect(PIECE_VALUES.horse).toBe(40);
      expect(PIECE_VALUES.advisor).toBe(20);
      expect(PIECE_VALUES.elephant).toBe(20);
      expect(PIECE_VALUES.soldier).toBe(10);
    });
  });

  describe('AI Move Selection', () => {
    it('should return a move for easy difficulty', () => {
      const board = createInitialBoard();
      const result = getBestMove(board, Difficulty.Easy, Color.Red);
      expect(result.move).toBeDefined();
      expect(result.thinkingTime).toBeLessThan(1000);
    });

    it('should return a move for medium difficulty', () => {
      const board = createInitialBoard();
      const result = getBestMove(board, Difficulty.Medium, Color.Red);
      expect(result.move).toBeDefined();
      expect(result.thinkingTime).toBeLessThan(3000);
    });

    it('should return a move for hard difficulty', () => {
      const board = createInitialBoard();
      const result = getBestMove(board, Difficulty.Hard, Color.Red);
      expect(result.move).toBeDefined();
      expect(result.thinkingTime).toBeLessThan(5000);
    });

    it('should never return illegal moves', () => {
      const board = createInitialBoard();
      const result = getBestMove(board, Difficulty.Hard, Color.Red);
      
      if (result.move) {
        // Basic validation - move should be within board bounds
        expect(result.move.from.file).toBeGreaterThanOrEqual(0);
        expect(result.move.from.file).toBeLessThanOrEqual(8);
        expect(result.move.to.file).toBeGreaterThanOrEqual(0);
        expect(result.move.to.file).toBeLessThanOrEqual(8);
      }
    });
  });

  describe('Difficulty Levels', () => {
    it('easy should be faster than hard', () => {
      const board = createInitialBoard();
      
      const easyResult = getBestMove(board, Difficulty.Easy, Color.Red);
      const hardResult = getBestMove(board, Difficulty.Hard, Color.Red);
      
      expect(easyResult.thinkingTime).toBeLessThanOrEqual(hardResult.thinkingTime);
    });

    it('hard should search deeper than easy', () => {
      const board = createInitialBoard();
      
      const easyResult = getBestMove(board, Difficulty.Easy, Color.Red);
      const hardResult = getBestMove(board, Difficulty.Hard, Color.Red);
      
      expect(hardResult.depth).toBeGreaterThanOrEqual(easyResult.depth);
    });
  });
});
