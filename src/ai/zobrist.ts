/**
 * Zobrist Hashing for Chinese Chess
 *
 * Generates a unique 64-bit hash for each board position using XOR of
 * random values. This gives O(1) incremental hash updates when making moves.
 *
 * We use two 32-bit numbers (hi, lo) combined into a bigint since JS
 * doesn't have native u64.
 */

import { Board, Color, PieceType } from '../core/types';

// ── Random table generation ──
// 7 piece types × 2 colors × 9 files × 10 ranks = 1260 entries + 1 for turn
const PIECE_TYPES: PieceType[] = [
  PieceType.General, PieceType.Advisor, PieceType.Elephant,
  PieceType.Horse, PieceType.Chariot, PieceType.Cannon, PieceType.Soldier,
];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0);
  };
}

const rng = mulberry32(0xDEADBEEF);

// pieceTable[colorIdx][typeIdx][file][rank] → bigint
const pieceTable: bigint[][][][] = [];
for (let c = 0; c < 2; c++) {
  pieceTable[c] = [];
  for (let t = 0; t < 7; t++) {
    pieceTable[c][t] = [];
    for (let f = 0; f < 9; f++) {
      pieceTable[c][t][f] = [];
      for (let r = 0; r < 10; r++) {
        const hi = BigInt(rng()) << 32n;
        const lo = BigInt(rng());
        pieceTable[c][t][f][r] = hi | lo;
      }
    }
  }
}

const TURN_KEY = (BigInt(rng()) << 32n) | BigInt(rng());

const colorIdx = (c: Color) => c === Color.Red ? 0 : 1;
const typeIdx = (t: PieceType) => PIECE_TYPES.indexOf(t);

/** Compute full Zobrist hash from scratch */
export function computeZobristHash(board: Board): bigint {
  let h = 0n;
  for (const p of board.pieces) {
    h ^= pieceTable[colorIdx(p.color)][typeIdx(p.type)][p.position.file][p.position.rank];
  }
  if (board.turn === Color.Black) h ^= TURN_KEY;
  return h;
}

/** XOR key for a single piece placement (add or remove) */
export function pieceKey(color: Color, type: PieceType, file: number, rank: number): bigint {
  return pieceTable[colorIdx(color)][typeIdx(type)][file][rank];
}

/** XOR this to flip the side to move */
export const turnKey = TURN_KEY;
