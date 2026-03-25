/**
 * Fairy-Stockfish WASM Worker Bridge
 *
 * Loads Fairy-Stockfish in a Web Worker and communicates via UCI protocol.
 * This file runs in the MAIN thread and manages the worker lifecycle.
 */

import { Board, Color, Move, Position, PieceType, createMove } from '../core/types';
import { getPieceAt } from '../core/board';

export type EngineStatus = 'loading' | 'ready' | 'thinking' | 'error';

export interface EngineConfig {
  skillLevel: number;
  depth: number;
  moveTimeMs: number;
}

export const DIFFICULTY_CONFIGS: Record<string, EngineConfig> = {
  beginner:  { skillLevel: 0,  depth: 1,  moveTimeMs: 500 },
  easy:      { skillLevel: 3,  depth: 3,  moveTimeMs: 1000 },
  medium:    { skillLevel: 8,  depth: 8,  moveTimeMs: 2000 },
  hard:      { skillLevel: 15, depth: 15, moveTimeMs: 4000 },
  master:    { skillLevel: 20, depth: 20, moveTimeMs: 8000 },
};

/* ── Coordinate conversion helpers ── */

// Our board: file 0-8, rank 0-9  (rank 0 = Red's back rank, rank 9 = Black's back rank)
// UCI Xiangqi: file a-i, rank 0-9  (rank 0 = Red's back rank)
// So the mapping is straightforward: file 0→a, rank 0→0

function uciToPos(uci: string): Position {
  const file = uci.charCodeAt(0) - 97;
  const rank = parseInt(uci[1], 10);
  return { file, rank };
}

function boardToFen(board: Board): string {
  // Build FEN string from board position
  // FEN rank order: rank 9 (top/black back) → rank 0 (bottom/red back)
  const pieceToFenChar = (type: PieceType, color: Color): string => {
    const chars: Record<PieceType, string> = {
      general: 'k',
      advisor: 'a',
      elephant: 'b',  // bishop in FEN convention
      horse: 'n',
      chariot: 'r',
      cannon: 'c',
      soldier: 'p',
    };
    const ch = chars[type];
    return color === Color.Red ? ch.toUpperCase() : ch;
  };

  const rows: string[] = [];
  for (let rank = 9; rank >= 0; rank--) {
    let row = '';
    let empty = 0;
    for (let file = 0; file < 9; file++) {
      const piece = board.pieces.find(
        p => p.position.file === file && p.position.rank === rank
      );
      if (piece) {
        if (empty > 0) { row += empty; empty = 0; }
        row += pieceToFenChar(piece.type, piece.color);
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }

  const turn = board.turn === Color.Red ? 'w' : 'b';
  // Xiangqi FEN: position turn - - 0 1
  return `${rows.join('/')} ${turn} - - 0 1`;
}

/* ── Engine wrapper class ── */

export class FairyStockfishEngine {
  private worker: Worker | null = null;
  private status: EngineStatus = 'loading';
  private messageListeners: ((line: string) => void)[] = [];
  private statusListeners: ((status: EngineStatus) => void)[] = [];
  private resolveReady: (() => void) | null = null;
  private readyPromise: Promise<void>;
  private isInitialized = false;

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.init();
  }

  private async init() {
    try {
      // Load the stockfish.js as a module that spawns its own worker
      // The npm package exposes a factory function
      const wasmUrl = new URL('/stockfish.js', window.location.origin).href;
      
      // Create an inline worker that loads the engine
      const workerCode = `
        importScripts('${wasmUrl}');
        
        let engine = null;
        
        Stockfish().then(sf => {
          engine = sf;
          sf.addMessageListener(line => {
            postMessage({ type: 'uci', data: line });
          });
          postMessage({ type: 'ready' });
        }).catch(err => {
          postMessage({ type: 'error', data: String(err) });
        });
        
        onmessage = function(e) {
          if (engine && e.data.type === 'cmd') {
            engine.postMessage(e.data.cmd);
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'ready') {
          this.setStatus('ready');
          // Configure for xiangqi
          this.sendCommand('uci');
          this.sendCommand('setoption name UCI_Variant value xiangqi');
          this.isInitialized = true;
          if (this.resolveReady) {
            this.resolveReady();
            this.resolveReady = null;
          }
        } else if (msg.type === 'uci') {
          const line = msg.data as string;
          for (const listener of this.messageListeners) {
            listener(line);
          }
        } else if (msg.type === 'error') {
          console.error('Fairy-Stockfish error:', msg.data);
          this.setStatus('error');
        }
      };

      this.worker.onerror = (err) => {
        console.error('Worker error:', err);
        this.setStatus('error');
      };
    } catch (err) {
      console.error('Failed to init Fairy-Stockfish:', err);
      this.setStatus('error');
    }
  }

  private setStatus(s: EngineStatus) {
    this.status = s;
    for (const listener of this.statusListeners) {
      listener(s);
    }
  }

  private sendCommand(cmd: string) {
    this.worker?.postMessage({ type: 'cmd', cmd });
  }

  /** Wait until the engine is ready */
  async waitReady(): Promise<boolean> {
    if ((this.status as string) === 'error') return false;
    if (this.isInitialized) return true;
    await this.readyPromise;
    return (this.status as string) !== 'error';
  }

  /** Subscribe to status changes */
  onStatus(fn: (status: EngineStatus) => void) {
    this.statusListeners.push(fn);
    return () => { this.statusListeners = this.statusListeners.filter(f => f !== fn); };
  }

  /** Get current status */
  getStatus(): EngineStatus { return this.status; }

  /** Configure difficulty */
  setDifficulty(config: EngineConfig) {
    this.sendCommand(`setoption name Skill Level value ${config.skillLevel}`);
    // UCI_LimitStrength works with Skill Level
    if (config.skillLevel < 20) {
      this.sendCommand('setoption name UCI_LimitStrength value true');
      // Map skill level to approximate Elo
      const elo = 500 + config.skillLevel * 125; // 500-3000
      this.sendCommand(`setoption name UCI_Elo value ${elo}`);
    } else {
      this.sendCommand('setoption name UCI_LimitStrength value false');
    }
  }

  /** Get best move for current board position */
  async getBestMove(board: Board, config: EngineConfig): Promise<Move | null> {
    const ready = await this.waitReady();
    if (!ready) return null;

    this.setStatus('thinking');
    this.setDifficulty(config);

    const fen = boardToFen(board);
    this.sendCommand('ucinewgame');
    this.sendCommand(`position fen ${fen}`);

    return new Promise<Move | null>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.sendCommand('stop');
          this.setStatus('ready');
          resolve(null);
        }
      }, config.moveTimeMs + 2000); // extra buffer

      const listener = (line: string) => {
        if (resolved) return;

        if (line.startsWith('bestmove')) {
          resolved = true;
          clearTimeout(timeout);
          this.messageListeners = this.messageListeners.filter(l => l !== listener);
          this.setStatus('ready');

          const parts = line.split(' ');
          const bestMoveStr = parts[1];

          if (!bestMoveStr || bestMoveStr === '(none)') {
            resolve(null);
            return;
          }

          const from = uciToPos(bestMoveStr.substring(0, 2));
          const to = uciToPos(bestMoveStr.substring(2, 4));

          // Look up the piece at the source position to create a proper Move
          const movingPiece = getPieceAt(board, from);
          const capturedPiece = getPieceAt(board, to);

          if (!movingPiece) {
            resolve(null);
            return;
          }

          resolve(createMove(from, to, movingPiece.type, capturedPiece?.type));
        }
      };

      this.messageListeners.push(listener);

      // Send go command with depth and movetime limits
      const goCmd = `go depth ${config.depth} movetime ${config.moveTimeMs}`;
      this.sendCommand(goCmd);
    });
  }

  /** Clean up */
  destroy() {
    if (this.worker) {
      this.sendCommand('quit');
      setTimeout(() => {
        this.worker?.terminate();
        this.worker = null;
      }, 200);
    }
  }
}

/** Singleton engine instance */
let engineInstance: FairyStockfishEngine | null = null;

export function getEngine(): FairyStockfishEngine {
  if (!engineInstance) {
    engineInstance = new FairyStockfishEngine();
  }
  return engineInstance;
}
