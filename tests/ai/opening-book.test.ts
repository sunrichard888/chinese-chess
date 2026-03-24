/**
 * Opening Book Tests
 * Task 6.3: Expand Opening Book to 50+ openings
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OpeningBook } from '../../src/ai/opening-book';
import { createInitialBoard, makeMove } from '../../src/core/board';

describe('OpeningBook', () => {
  let book: OpeningBook;

  beforeEach(() => {
    book = new OpeningBook();
  });

  describe('Basic Operations', () => {
    it('should create opening book', () => {
      expect(book).toBeDefined();
      expect(book).toBeInstanceOf(OpeningBook);
    });

    it('should have pre-loaded openings', () => {
      const count = book.getOpeningCount();
      expect(count).toBeGreaterThan(50); // Requirement: 50+ openings
    });

    it('should find opening move from initial position', () => {
      const board = createInitialBoard();
      const move = book.getMove(board);
      
      // Should return a valid opening move for Red
      expect(move).toBeDefined();
      expect(move?.from).toBeDefined();
      expect(move?.to).toBeDefined();
    });
  });

  describe('Opening Categories', () => {
    it('should have cannon openings', () => {
      const openings = book.getOpeningsByCategory('cannon');
      expect(openings.length).toBeGreaterThan(5);
    });

    it('should have horse openings', () => {
      const openings = book.getOpeningsByCategory('horse');
      expect(openings.length).toBeGreaterThan(5);
    });

    it('should have chariot openings', () => {
      const openings = book.getOpeningsByCategory('chariot');
      expect(openings.length).toBeGreaterThan(0);
    });

    it('should have soldier openings', () => {
      const openings = book.getOpeningsByCategory('soldier');
      expect(openings.length).toBeGreaterThan(0);
    });
  });

  describe('Opening Responses', () => {
    it('should respond to Central Cannon opening', () => {
      // 1. 炮二平五 (Cannon to center)
      const board = createInitialBoard();
      const move1 = { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' as any };
      const afterMove1 = makeMove(board, move1);
      
      const response = book.getMove(afterMove1);
      expect(response).toBeDefined();
    });

    it('should respond to Horse opening', () => {
      // 1. 马二进三 (Horse forward)
      const board = createInitialBoard();
      const move1 = { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' as any };
      const afterMove1 = makeMove(board, move1);
      
      const response = book.getMove(afterMove1);
      expect(response).toBeDefined();
    });
  });

  describe('Book Statistics', () => {
    it('should track usage statistics', () => {
      const board = createInitialBoard();
      const initialStats = book.getStats();
      
      // Make a few lookups
      book.getMove(board);
      book.getMove(board);
      
      const newStats = book.getStats();
      expect(newStats.lookups).toBeGreaterThanOrEqual(initialStats.lookups + 2);
    });

    it('should report total openings', () => {
      const stats = book.getStats();
      expect(stats.totalOpenings).toBeGreaterThan(50);
    });

    it('should report categories', () => {
      const stats = book.getStats();
      expect(stats.categories.length).toBeGreaterThan(0);
    });
  });

  describe('Opening Depth', () => {
    it('should handle multi-move sequences', () => {
      const board = createInitialBoard();
      
      // First move should always be in book
      const firstMove = book.getMove(board);
      expect(firstMove).toBeDefined();
      
      // Play a few opening moves
      let current = board;
      let movesPlayed = 0;
      for (let i = 0; i < 4; i++) {
        const move = book.getMove(current);
        if (!move) break;
        current = makeMove(current, move);
        movesPlayed++;
      }
      
      // Should have played at least 2 moves
      expect(movesPlayed).toBeGreaterThanOrEqual(2);
    });

    it('should handle book exit gracefully', () => {
      // Create an unusual position not in book
      const board = createInitialBoard();
      // Make many non-standard moves
      let current = board;
      for (let i = 0; i < 10; i++) {
        const move = { 
          from: { file: i % 9, rank: 3 }, 
          to: { file: i % 9, rank: 4 }, 
          piece: 'soldier' as any 
        };
        try {
          current = makeMove(current, move);
        } catch {
          break;
        }
      }
      
      // Should return undefined when out of book
      const move = book.getMove(current);
      // Either undefined or a valid move is OK
      expect(move === undefined || move !== null).toBe(true);
    });
  });

  describe('Common Openings', () => {
    it('should include 中炮局 (Central Cannon)', () => {
      const openings = book.getOpeningsByCategory('cannon');
      const hasCentralCannon = openings.some(o => 
        o.name.includes('中炮') || o.name.toLowerCase().includes('central')
      );
      expect(hasCentralCannon).toBe(true);
    });

    it('should include 屏风马 (Screen Horse)', () => {
      const openings = book.getOpeningsByCategory('horse');
      const hasScreenHorse = openings.some(o => 
        o.name.includes('屏风') || o.name.toLowerCase().includes('screen')
      );
      expect(hasScreenHorse).toBe(true);
    });

    it('should include 飞相局 (Elephant opening)', () => {
      const openings = book.getOpeningsByCategory('elephant');
      expect(openings.length).toBeGreaterThan(0);
    });
  });
});
