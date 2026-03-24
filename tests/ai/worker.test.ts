/**
 * AI Web Worker Tests
 * Task 6.2: Non-blocking AI with Web Workers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AIWorker } from '../../src/ai/worker';

describe('AIWorker', () => {
  let worker: AIWorker;

  beforeEach(() => {
    worker = new AIWorker();
  });

  afterEach(() => {
    worker.terminate();
  });

  describe('Worker Lifecycle', () => {
    it('should create worker instance', () => {
      expect(worker).toBeDefined();
      expect(worker).toBeInstanceOf(AIWorker);
    });

    it('should initialize worker', () => {
      const initialized = worker.initialize();
      expect(initialized).toBe(true);
    });

    it('should terminate worker', () => {
      worker.initialize();
      worker.terminate();
      // Should not throw
      expect(() => worker.terminate()).not.toThrow();
    });
  });

  describe('Move Calculation', () => {
    it('should find best move asynchronously', async () => {
      worker.initialize();
      
      const result = await worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 2,
        color: 'red',
      });

      expect(result).toBeDefined();
      expect(result.move).toBeDefined();
      expect(result.score).toBeDefined();
    });

    it('should respect depth parameter', async () => {
      worker.initialize();
      
      const shallow = await worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 1,
        color: 'red',
      });

      const deep = await worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 3,
        color: 'red',
      });

      // Deeper search should take longer (but may find better move)
      expect(deep.thinkingTime).toBeGreaterThanOrEqual(shallow.thinkingTime);
    });

    it('should handle timeout', async () => {
      worker.initialize();
      
      const result = await worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 2,
        color: 'red',
        timeout: 1000,
      });

      expect(result.thinkingTime).toBeLessThan(1500); // Allow some overhead
    });
  });

  describe('Progress Reporting', () => {
    it('should report search progress', async () => {
      worker.initialize();
      
      const progressUpdates: number[] = [];
      
      const result = await worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 3,
        color: 'red',
        onProgress: (depth) => {
          progressUpdates.push(depth);
        },
      });

      // Should have some progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid FEN', async () => {
      worker.initialize();
      
      await expect(worker.findBestMove({
        fen: 'invalid-fen',
        depth: 2,
        color: 'red',
      })).rejects.toThrow();
    });

    it('should handle worker termination during search', async () => {
      worker.initialize();
      
      const promise = worker.findBestMove({
        fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        depth: 5,
        color: 'red',
      });

      // Terminate during search
      setTimeout(() => worker.terminate(), 10);

      await expect(promise).rejects.toThrow();
    });
  });
});
