/**
 * AI Engine for Chinese Chess
 *
 * Minimax + Alpha-Beta + Zobrist hashing + Move ordering +
 * Position-Square Tables + Quiescence search + Iterative deepening
 */

import { Board, Color, Move, PieceType, Piece } from '../core/types';
import { getPieceAt } from '../core/board';
import { getAllLegalMovesFiltered, isCheckmate, isInCheck } from '../core/rules';
import { TranspositionTable, TTFlag } from './transposition-table';
import { computeZobristHash, pieceKey, turnKey } from './zobrist';

// ============================================================================
// Piece base values
// ============================================================================

export const PIECE_VALUES: Record<PieceType, number> = {
  general: 10000,
  chariot: 900,
  cannon: 450,
  horse: 400,
  advisor: 200,
  elephant: 200,
  soldier: 100,
};

// ============================================================================
// Position-Square Tables (PST)
// Values from Red's perspective; flip rank for Black.
// Index: [file 0-8][rank 0-9]  (rank 0 = Red's back rank)
// ============================================================================

const PST_CHARIOT: number[][] = [
  [ 14, 14, 12, 18, 16, 18, 12, 14, 14],
  [ 16, 20, 18, 24, 26, 24, 18, 20, 16],
  [ 12, 12, 12, 18, 18, 18, 12, 12, 12],
  [ 12, 18, 16, 22, 22, 22, 16, 18, 12],
  [  6, 12, 10, 14, 14, 14, 10, 12,  6],
  [  4,  6,  4,  8, 12,  8,  4,  6,  4],
  [  8,  4,  8, 16,  8, 16,  8,  4,  8],
  [ -2,  8,  4,  8, 12,  8,  4,  8, -2],
  [  2, 10,  6, 14, 12, 14,  6, 10,  2],
  [  0,  0, 12, 14, 16, 14, 12,  0,  0],
];

const PST_HORSE: number[][] = [
  [  4,  8, 16, 12, 10, 12, 16,  8,  4],
  [  4, 10, 28, 16, 10, 16, 28, 10,  4],
  [ 12, 14, 16, 20, 18, 20, 16, 14, 12],
  [  8, 24, 18, 24, 20, 24, 18, 24,  8],
  [  6, 16, 14, 18, 16, 18, 14, 16,  6],
  [  4, 12, 16,  8, 12,  8, 16, 12,  4],
  [  2,  6,  8,  6, -2,  6,  8,  6,  2],
  [  4,  2, 10,  0, -6,  0, 10,  2,  4],
  [  0,  2,  4,  4, -2,  4,  4,  2,  0],
  [  0, -4,  0,  2,  4,  2,  0, -4,  0],
];

const PST_CANNON: number[][] = [
  [  6,  4,  0, -6, -8, -6,  0,  4,  6],
  [  2,  2,  0, -4, -8, -4,  0,  2,  2],
  [  2,  2,  0, -6, -6, -6,  0,  2,  2],
  [  0,  0, -2,  4,  6,  4, -2,  0,  0],
  [  0,  0,  0,  2,  4,  2,  0,  0,  0],
  [ -2,  0,  4,  2,  6,  2,  4,  0, -2],
  [  0,  0,  0,  2,  4,  2,  0,  0,  0],
  [  2,  0, -2,  0,  6,  0, -2,  0,  2],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  2,  4,  6,  6,  6,  4,  2,  0],
];

const PST_SOLDIER: number[][] = [
  [  0,  3,  6, 10, 12, 10,  6,  3,  0],
  [ 18, 36, 50, 60, 70, 60, 50, 36, 18],
  [ 14, 26, 42, 60, 60, 60, 42, 26, 14],
  [ 10, 20, 30, 44, 50, 44, 30, 20, 10],
  [  6, 12, 18, 20, 20, 20, 18, 12,  6],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
];

function getPST(type: PieceType): number[][] | null {
  switch (type) {
    case PieceType.Chariot: return PST_CHARIOT;
    case PieceType.Horse: return PST_HORSE;
    case PieceType.Cannon: return PST_CANNON;
    case PieceType.Soldier: return PST_SOLDIER;
    default: return null;
  }
}

function pstScore(piece: Piece): number {
  const table = getPST(piece.type);
  if (!table) return 0;
  const rank = piece.color === Color.Red ? piece.position.rank : 9 - piece.position.rank;
  return table[rank]?.[piece.position.file] ?? 0;
}

// ============================================================================
// Board Evaluation
// ============================================================================

export function evaluateBoard(board: Board): number {
  if (isCheckmate(board, Color.Red)) return -99999;
  if (isCheckmate(board, Color.Black)) return 99999;

  let score = 0;

  for (const piece of board.pieces) {
    const value = PIECE_VALUES[piece.type] + pstScore(piece);
    score += piece.color === Color.Red ? value : -value;
  }

  // Mobility bonus (rough approximation — count moves is expensive,
  // so we only do a lightweight version)
  // Check bonus: being able to check the opponent is good
  if (isInCheck(board, Color.Black)) score += 30;
  if (isInCheck(board, Color.Red)) score -= 30;

  return score;
}

// ============================================================================
// Move Ordering (critical for alpha-beta efficiency)
// ============================================================================

function scoreMove(board: Board, move: Move, ttBestMove?: Move): number {
  let s = 0;

  // TT best move gets highest priority
  if (ttBestMove &&
      move.from.file === ttBestMove.from.file && move.from.rank === ttBestMove.from.rank &&
      move.to.file === ttBestMove.to.file && move.to.rank === ttBestMove.to.rank) {
    return 100000;
  }

  // Captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
  const captured = getPieceAt(board, move.to);
  if (captured) {
    const attacker = getPieceAt(board, move.from);
    s += PIECE_VALUES[captured.type] * 10 - (attacker ? PIECE_VALUES[attacker.type] : 0);
  }

  return s;
}

function orderMoves(board: Board, moves: Move[], ttBestMove?: Move): Move[] {
  const scored = moves.map(m => ({ move: m, score: scoreMove(board, m, ttBestMove) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.move);
}

// ============================================================================
// Quiescence Search (resolve captures to avoid horizon effect)
// ============================================================================

function quiescence(
  board: Board,
  alpha: number,
  beta: number,
  maximizing: boolean,
  nodeCount: { count: number },
  depthLimit: number = 6,
): number {
  nodeCount.count++;

  const standPat = evaluateBoard(board);

  if (depthLimit <= 0) return standPat;

  if (maximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const color = maximizing ? Color.Red : Color.Black;
  const moves = getAllLegalMovesFiltered(board, color);

  // Only search captures
  const captures = moves.filter(m => getPieceAt(board, m.to) !== null);
  const ordered = orderMoves(board, captures);

  for (const move of ordered) {
    const newBoard = makeMove(board, move);
    const score = quiescence(newBoard, alpha, beta, !maximizing, nodeCount, depthLimit - 1);

    if (maximizing) {
      if (score > alpha) alpha = score;
      if (alpha >= beta) return beta;
    } else {
      if (score < beta) beta = score;
      if (alpha >= beta) return alpha;
    }
  }

  return maximizing ? alpha : beta;
}

// ============================================================================
// Alpha-Beta with Zobrist TT + Move Ordering + Quiescence
// ============================================================================

function alphaBeta(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  nodeCount: { count: number },
  tt?: TranspositionTable,
  boardHash?: bigint,
): { move: Move | null; score: number } {
  nodeCount.count++;

  const hash = boardHash ?? computeZobristHash(board);

  // TT probe
  let ttBestMove: Move | undefined;
  if (tt) {
    const cached = tt.retrieve(hash);
    if (cached && cached.depth >= depth) {
      if (cached.flag === 'exact') return { move: cached.bestMove || null, score: cached.score };
      if (cached.flag === 'lowerbound' && cached.score > alpha) alpha = cached.score;
      if (cached.flag === 'upperbound' && cached.score < beta) beta = cached.score;
      if (alpha >= beta) return { move: cached.bestMove || null, score: cached.score };
    }
    if (cached?.bestMove) ttBestMove = cached.bestMove;
  }

  // Leaf: quiescence search
  if (depth === 0) {
    const score = quiescence(board, alpha, beta, maximizing, nodeCount);
    return { move: null, score };
  }

  const color = maximizing ? Color.Red : Color.Black;
  const moves = getAllLegalMovesFiltered(board, color);

  if (moves.length === 0) {
    return { move: null, score: evaluateBoard(board) };
  }

  // Order moves for better pruning
  const ordered = orderMoves(board, moves, ttBestMove);

  let bestMove: Move | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;
  let flag: TTFlag = maximizing ? 'upperbound' : 'lowerbound';

  for (const move of ordered) {
    // Incremental hash update
    const movingPiece = getPieceAt(board, move.from)!;
    const captured = getPieceAt(board, move.to);
    let childHash = hash;
    // Remove piece from source
    childHash ^= pieceKey(movingPiece.color, movingPiece.type, move.from.file, move.from.rank);
    // Remove captured piece if any
    if (captured) {
      childHash ^= pieceKey(captured.color, captured.type, move.to.file, move.to.rank);
    }
    // Place piece at destination
    childHash ^= pieceKey(movingPiece.color, movingPiece.type, move.to.file, move.to.rank);
    // Flip turn
    childHash ^= turnKey;

    const newBoard = makeMove(board, move);
    const result = alphaBeta(newBoard, depth - 1, alpha, beta, !maximizing, nodeCount, tt, childHash);

    if (maximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      if (bestScore > alpha) {
        alpha = bestScore;
        flag = 'exact';
      }
      if (alpha >= beta) { flag = 'lowerbound'; break; }
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      if (bestScore < beta) {
        beta = bestScore;
        flag = 'exact';
      }
      if (alpha >= beta) { flag = 'upperbound'; break; }
    }
  }

  // Store in TT
  if (tt) {
    tt.store({ hash, depth, score: bestScore, bestMove: bestMove || undefined, flag });
  }

  return { move: bestMove, score: bestScore };
}

// ============================================================================
// Public search interfaces
// ============================================================================

export interface AISearchResult {
  move: Move | null;
  score: number;
  depth: number;
  nodes: number;
}

export function minimaxSearch(
  board: Board,
  maxDepth: number,
  color: Color,
  tt?: TranspositionTable,
): AISearchResult {
  const nodeCount = { count: 0 };
  const maximizing = color === Color.Red;
  const hash = computeZobristHash(board);
  const result = alphaBeta(board, maxDepth, -Infinity, Infinity, maximizing, nodeCount, tt, hash);
  return { move: result.move, score: result.score, depth: maxDepth, nodes: nodeCount.count };
}

export function iterativeDeepeningSearch(
  board: Board,
  maxTimeMs: number,
  color: Color,
  maxDepth: number = 12,
  tt?: TranspositionTable,
): AISearchResult {
  let bestResult: AISearchResult = { move: null, score: 0, depth: 0, nodes: 0 };
  const startTime = Date.now();

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = minimaxSearch(board, depth, color, tt);
    const elapsed = Date.now() - startTime;
    bestResult = result;
    // If we found checkmate or time is up, stop
    if (Math.abs(result.score) > 90000 || elapsed > maxTimeMs * 0.7) break;
  }

  return bestResult;
}

// ============================================================================
// Difficulty System
// ============================================================================

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export interface AIConfig {
  maxDepth: number;
  errorRate: number;
  maxTimeMs: number;
}

export function getDifficultyConfig(difficulty: Difficulty): AIConfig {
  switch (difficulty) {
    case Difficulty.Easy:
      return { maxDepth: 3, errorRate: 0.15, maxTimeMs: 1500 };
    case Difficulty.Medium:
      return { maxDepth: 5, errorRate: 0.03, maxTimeMs: 4000 };
    case Difficulty.Hard:
      return { maxDepth: 8, errorRate: 0.00, maxTimeMs: 8000 };
  }
}

// ============================================================================
// Main AI Interface
// ============================================================================

export interface AIBestMove {
  move: Move | null;
  score: number;
  depth: number;
  thinkingTime: number;
  nodes: number;
  error?: boolean;
}

export function getBestMove(
  board: Board,
  difficulty: Difficulty,
  color: Color,
  transpositionTable?: TranspositionTable,
): AIBestMove {
  const config = getDifficultyConfig(difficulty);
  const startTime = Date.now();

  // Random blunder for lower difficulties
  if (Math.random() < config.errorRate) {
    const moves = getAllLegalMovesFiltered(board, color);
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return { move: randomMove, score: 0, depth: 0, thinkingTime: Date.now() - startTime, nodes: 0, error: true };
    }
  }

  const tt = transpositionTable ?? new TranspositionTable(50000);
  const result = iterativeDeepeningSearch(board, config.maxTimeMs, color, config.maxDepth, tt);

  return {
    move: result.move,
    score: result.score,
    depth: result.depth,
    thinkingTime: Date.now() - startTime,
    nodes: result.nodes,
    error: false,
  };
}

// ============================================================================
// Helper: make a move on the board
// ============================================================================

function makeMove(board: Board, move: Move): Board {
  const movingPiece = getPieceAt(board, move.from);
  if (!movingPiece) return board;

  const newPieces = board.pieces
    .filter(p => !(p.position.file === move.to.file && p.position.rank === move.to.rank))
    .map(p => {
      if (p.position.file === move.from.file && p.position.rank === move.from.rank) {
        return { ...p, position: move.to };
      }
      return p;
    });

  return {
    pieces: newPieces,
    turn: board.turn === Color.Red ? Color.Black : Color.Red,
    moveHistory: [...board.moveHistory, move],
  };
}

export default { evaluateBoard, getBestMove, Difficulty, getDifficultyConfig };
