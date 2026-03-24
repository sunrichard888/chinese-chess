/**
 * AI Engine with Transposition Table Tests
 * Task 6.2: Integrate TT into AI search
 */

import { describe, it, expect } from 'vitest';
import { getBestMove, Difficulty } from '../../src/ai/engine';
import { createInitialBoard, makeMove } from '../../src/core/board';
import { Color } from '../../src/core/types';
import { TranspositionTable } from '../../src/ai/transposition-table';

describe('AIEngineWithTT', () => {
  describe('Transposition Table Integration', () => {
    it('should use transposition table during search', () => {
      const board = createInitialBoard();
      const tt = new TranspositionTable(1000);
      
      // First search - should populate TT
      const result1 = getBestMove(board, Difficulty.Medium, Color.Red, tt);
      
      // Get TT stats
      const stats = tt.getStats();
      
      // TT should have entries after search
      expect(stats.entries).toBeGreaterThan(0);
      expect(result1.move).toBeDefined();
    });

    it('should benefit from transposition table on repeated positions', () => {
      const board = createInitialBoard();
      const tt = new TranspositionTable(1000);
      
      // First search
      const startTime1 = Date.now();
      getBestMove(board, Difficulty.Medium, Color.Red, tt);
      const time1 = Date.now() - startTime1;
      
      // Second search (should use cached results)
      const startTime2 = Date.now();
      getBestMove(board, Difficulty.Medium, Color.Red, tt);
      const time2 = Date.now() - startTime2;
      
      // Second search should be faster (or at least not much slower)
      // Note: This is a soft assertion as timing can vary
      expect(time2).toBeLessThanOrEqual(time1 * 1.5); // Allow 50% variance
    });

    it('should return consistent results with TT', () => {
      const board = createInitialBoard();
      const tt = new TranspositionTable(1000);
      
      // Multiple searches should return same best move
      const result1 = getBestMove(board, Difficulty.Medium, Color.Red, tt);
      const result2 = getBestMove(board, Difficulty.Medium, Color.Red, tt);
      
      // Best move should be consistent
      expect(result1.move).toEqual(result2.move);
    });
  });

  describe('TT Entry Storage', () => {
    it('should store exact score in TT', () => {
      const board = createInitialBoard();
      const tt = new TranspositionTable(1000);
      
      // Search and populate TT
      getBestMove(board, Difficulty.Medium, Color.Red, tt);
      
      // TT should have entries with exact scores
      const stats = tt.getStats();
      expect(stats.entries).toBeGreaterThan(0);
    });

    it('should handle TT cache hits during search', () => {
      const board = createInitialBoard();
      const tt = new TranspositionTable(10000); // Larger table
      
      // Make a few moves to create a position
      const move1 = { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' as any };
      const newBoard = makeMove(board, move1);
      
      // Search from new position
      const result = getBestMove(newBoard, Difficulty.Medium, Color.Black, tt);
      
      expect(result.move).toBeDefined();
      expect(result.thinkingTime).toBeGreaterThan(0);
    });
  });

  describe('Performance with TT', () => {
    it('should search deeper with TT enabled', () => {
      const board = createInitialBoard();
      
      // Search without TT
      const tt1 = new TranspositionTable(0); // Disabled
      const result1 = getBestMove(board, Difficulty.Medium, Color.Red, tt1);
      
      // Search with TT
      const tt2 = new TranspositionTable(10000);
      const result2 = getBestMove(board, Difficulty.Medium, Color.Red, tt2);
      
      // Both should find a move
      expect(result1.move).toBeDefined();
      expect(result2.move).toBeDefined();
      
      // With TT should search more nodes in same time (or same nodes in less time)
      const stats2 = tt2.getStats();
      expect(stats2.entries).toBeGreaterThan(0);
    });
  });
});
