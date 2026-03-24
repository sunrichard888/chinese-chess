/**
 * Transposition Table Tests
 * Task 6.1: AI Performance Optimization
 * 
 * Tests for caching board positions to avoid re-computation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TranspositionTable, TTEntry } from '../../src/ai/transposition-table';

describe('TranspositionTable', () => {
  let tt: TranspositionTable;

  beforeEach(() => {
    tt = new TranspositionTable(1000); // 1000 entries
  });

  describe('Basic Operations', () => {
    it('should create transposition table', () => {
      expect(tt).toBeDefined();
      expect(tt).toBeInstanceOf(TranspositionTable);
    });

    it('should store and retrieve entries', () => {
      const hash = BigInt(12345); // Simulated hash
      const entry: TTEntry = {
        hash,
        depth: 3,
        score: 150,
        bestMove: { from: { file: 0, rank: 3 }, to: { file: 0, rank: 4 }, piece: 'soldier' as any },
        flag: 'exact' as const,
      };

      // Act: Store entry
      tt.store(entry);

      // Assert: Retrieve entry
      const retrieved = tt.retrieve(hash);
      expect(retrieved).toBeDefined();
      expect(retrieved?.score).toBe(150);
      expect(retrieved?.depth).toBe(3);
    });

    it('should return undefined for missing entries', () => {
      const retrieved = tt.retrieve(BigInt(99999));
      expect(retrieved).toBeUndefined();
    });

    it('should overwrite entries with same hash', () => {
      const hash = BigInt(12345);
      
      // Store first entry
      tt.store({
        hash,
        depth: 2,
        score: 100,
        bestMove: undefined,
        flag: 'exact' as const,
      });

      // Store second entry with same hash
      tt.store({
        hash,
        depth: 4,
        score: 200,
        bestMove: undefined,
        flag: 'exact' as const,
      });

      // Should retrieve the latest
      const retrieved = tt.retrieve(hash);
      expect(retrieved?.score).toBe(200);
      expect(retrieved?.depth).toBe(4);
    });
  });

  describe('Table Capacity', () => {
    it('should handle table full scenario', () => {
      // Fill the table
      for (let i = 0; i < 1000; i++) {
        tt.store({
          hash: BigInt(i),
          depth: 2,
          score: i,
          bestMove: undefined,
          flag: 'exact' as const,
        });
      }

      // Add one more entry
      tt.store({
        hash: BigInt(99999),
        depth: 3,
        score: 999,
        bestMove: undefined,
        flag: 'exact' as const,
      });

      // Should still work (may overwrite old entries)
      const retrieved = tt.retrieve(BigInt(99999));
      expect(retrieved).toBeDefined();
      expect(retrieved?.score).toBe(999);
    });
  });

  describe('Search Depth Priority', () => {
    it('should prefer deeper search results', () => {
      const hash = BigInt(12345);
      
      // Store shallow search result
      tt.store({
        hash,
        depth: 2,
        score: 100,
        bestMove: undefined,
        flag: 'exact' as const,
      });

      // Store deeper search result
      tt.store({
        hash,
        depth: 5,
        score: 150,
        bestMove: undefined,
        flag: 'exact' as const,
      });

      // Should retrieve the deeper result
      const retrieved = tt.retrieve(hash);
      expect(retrieved?.depth).toBe(5);
      expect(retrieved?.score).toBe(150);
    });
  });

  describe('Clear Operation', () => {
    it('should clear all entries', () => {
      // Store some entries
      for (let i = 0; i < 10; i++) {
        tt.store({
          hash: BigInt(i),
          depth: 2,
          score: i,
          bestMove: undefined,
          flag: 'exact' as const,
        });
      }

      // Clear table
      tt.clear();

      // All entries should be gone
      const retrieved = tt.retrieve(BigInt(5));
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    it('should track table statistics', () => {
      // Store some entries
      for (let i = 0; i < 100; i++) {
        tt.store({
          hash: BigInt(i),
          depth: 2,
          score: i,
          bestMove: undefined,
          flag: 'exact' as const,
        });
      }

      const stats = tt.getStats();
      expect(stats.entries).toBe(100);
      expect(stats.capacity).toBe(1000);
    });
  });
});
