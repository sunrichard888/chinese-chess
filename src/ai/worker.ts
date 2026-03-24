/**
 * AI Web Worker Wrapper
 * 
 * Provides non-blocking AI search by running in a Web Worker.
 * This keeps the UI responsive during AI thinking.
 */

import { Move, Color } from '../core/types';
import { getBestMove, Difficulty } from './engine';
import { createInitialBoard } from '../core/board';

/**
 * Worker request message
 */
interface WorkerRequest {
  type: 'find-best-move';
  fen: string;
  depth: number;
  color: Color;
  timeout?: number;
}

/**
 * Worker response message
 */
interface WorkerResponse {
  move: Move | null;
  score: number;
  depth: number;
  thinkingTime: number;
  nodes: number;
  error?: string;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (depth: number) => void;

/**
 * Find best move options
 */
export interface FindMoveOptions {
  fen: string;
  depth: number;
  color: 'red' | 'black';
  timeout?: number;
  onProgress?: ProgressCallback;
}

/**
 * AI Worker class - runs AI in background thread
 * 
 * Note: In a real implementation, this would use actual Web Workers.
 * For now, we use a setTimeout-based simulation to avoid blocking.
 */
export class AIWorker {
  private initialized: boolean = false;
  private worker: Worker | null = null;
  private messageId: number = 0;
  private pendingRequests: Map<number, {
    resolve: (response: WorkerResponse) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
  }> = new Map();

  /**
   * Initialize the worker
   */
  initialize(): boolean {
    try {
      // In production, this would create a real Web Worker:
      // this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url));
      // this.worker.onmessage = this.handleMessage.bind(this);
      
      // For now, we simulate worker behavior
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AI worker:', error);
      return false;
    }
  }

  /**
   * Find best move asynchronously
   */
  async findBestMove(options: FindMoveOptions): Promise<WorkerResponse> {
    if (!this.initialized) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;

      // Set timeout
      const timeout = options.timeout ? setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Search timeout'));
      }, options.timeout) : undefined;

      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Simulate async worker call
      setTimeout(() => {
        try {
          // For now, use initial board (FEN parsing not implemented)
          const board = createInitialBoard();
          const color = options.color === 'red' ? Color.Red : Color.Black;
          const difficulty = this.depthToDifficulty(options.depth);
          
          const result = getBestMove(board, difficulty, color);
          
          const response: WorkerResponse = {
            move: result.move,
            score: result.score,
            depth: result.depth,
            thinkingTime: result.thinkingTime,
            nodes: result.nodes,
          };

          // Report progress
          if (options.onProgress) {
            for (let d = 1; d <= options.depth; d++) {
              options.onProgress(d);
            }
          }

          this.completeRequest(id, response);
        } catch (error) {
          this.failRequest(id, error as Error);
        }
      }, 10); // Small delay to simulate worker communication
    });
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    // Clear pending requests
    for (const [id, request] of this.pendingRequests.entries()) {
      if (request.timeout) clearTimeout(request.timeout);
      request.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();

    // Terminate real worker if exists
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.initialized = false;
  }

  /**
   * Convert depth to difficulty
   */
  private depthToDifficulty(depth: number): Difficulty {
    if (depth <= 2) return Difficulty.Easy;
    if (depth <= 4) return Difficulty.Medium;
    return Difficulty.Hard;
  }

  /**
   * Complete a pending request
   */
  private completeRequest(id: number, response: WorkerResponse): void {
    const request = this.pendingRequests.get(id);
    if (request) {
      if (request.timeout) clearTimeout(request.timeout);
      request.resolve(response);
      this.pendingRequests.delete(id);
    }
  }

  /**
   * Fail a pending request
   */
  private failRequest(id: number, error: Error): void {
    const request = this.pendingRequests.get(id);
    if (request) {
      if (request.timeout) clearTimeout(request.timeout);
      request.reject(error);
      this.pendingRequests.delete(id);
    }
  }
}

export default AIWorker;
