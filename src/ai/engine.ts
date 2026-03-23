/**
 * AI Engine for Chinese Chess
 * 
 * Implements Minimax with Alpha-Beta pruning and iterative deepening
 */

import { Board, Color, Move, PieceType } from '../core/types';
import { getPieceAt } from '../core/board';
import { getAllLegalMovesFiltered, isCheckmate } from '../core/rules';

// ============================================================================
// Piece Values for Evaluation
// ============================================================================

export const PIECE_VALUES: Record<PieceType, number> = {
  general: 10000,
  chariot: 90,
  cannon: 45,
  horse: 40,
  advisor: 20,
  elephant: 20,
  soldier: 10,
};

// Position bonuses (simplified)
const CENTER_FILE_BONUS = 3;
const RIVER_CROSSING_BONUS = 5;

// ============================================================================
// Board Evaluation
// ============================================================================

export function evaluateBoard(board: Board): number {
  // Checkmate first (highest priority)
  if (isCheckmate(board, Color.Red)) return -PIECE_VALUES.general;
  if (isCheckmate(board, Color.Black)) return PIECE_VALUES.general;

  let score = 0;

  // Material + position for each piece
  for (const piece of board.pieces) {
    const pieceValue = PIECE_VALUES[piece.type];
    let positionBonus = 0;

    // Center control bonus
    if (piece.position.file >= 3 && piece.position.file <= 5) {
      positionBonus += CENTER_FILE_BONUS;
    }

    // Soldier river crossing bonus
    if (piece.type === PieceType.Soldier) {
      const crossedRiver = piece.color === Color.Red
        ? piece.position.rank >= 5
        : piece.position.rank <= 4;
      if (crossedRiver) {
        positionBonus += RIVER_CROSSING_BONUS;
      }
    }

    if (piece.color === Color.Red) {
      score += pieceValue + positionBonus;
    } else {
      score -= pieceValue + positionBonus;
    }
  }

  return score; // Positive = Red advantage, Negative = Black advantage
}

// ============================================================================
// Minimax with Alpha-Beta Pruning
// ============================================================================

export interface AISearchResult {
  move: Move | null;
  score: number;
  depth: number;
  nodes: number;
}

function alphaBeta(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  nodeCount: { count: number }
): { move: Move | null; score: number } {
  nodeCount.count++;

  if (depth === 0) {
    return { move: null, score: evaluateBoard(board) };
  }

  const moves = getAllLegalMovesFiltered(board, maximizingPlayer ? Color.Red : Color.Black);

  if (moves.length === 0) {
    return { move: null, score: evaluateBoard(board) };
  }

  let bestMove: Move | null = null;
  let bestScore = maximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move);
    const result = alphaBeta(newBoard, depth - 1, alpha, beta, !maximizingPlayer, nodeCount);

    if (maximizingPlayer) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break; // Beta cutoff
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
  }

  return { move: bestMove, score: bestScore };
}

export function minimaxSearch(
  board: Board,
  maxDepth: number,
  color: Color
): AISearchResult {
  const nodeCount = { count: 0 };
  const maximizingPlayer = color === Color.Red;

  const result = alphaBeta(board, maxDepth, -Infinity, Infinity, maximizingPlayer, nodeCount);

  return {
    move: result.move,
    score: result.score,
    depth: maxDepth,
    nodes: nodeCount.count,
  };
}

// ============================================================================
// Iterative Deepening
// ============================================================================

export function iterativeDeepeningSearch(
  board: Board,
  maxTimeMs: number,
  color: Color,
  maxDepth: number = 10
): AISearchResult {
  let bestResult: AISearchResult = { move: null, score: 0, depth: 0, nodes: 0 };
  const startTime = Date.now();

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = minimaxSearch(board, depth, color);
    const elapsed = Date.now() - startTime;

    if (elapsed > maxTimeMs) {
      break; // Time exceeded, return previous depth result
    }

    bestResult = result;
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
      return { maxDepth: 2, errorRate: 0.10, maxTimeMs: 1000 };
    case Difficulty.Medium:
      return { maxDepth: 4, errorRate: 0.02, maxTimeMs: 3000 };
    case Difficulty.Hard:
      return { maxDepth: 6, errorRate: 0.00, maxTimeMs: 5000 };
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
  color: Color
): AIBestMove {
  const config = getDifficultyConfig(difficulty);
  const startTime = Date.now();

  // Sometimes make random move for lower difficulties
  if (Math.random() < config.errorRate) {
    const moves = getAllLegalMovesFiltered(board, color);
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        move: randomMove,
        score: 0,
        depth: 0,
        thinkingTime: Date.now() - startTime,
        nodes: 0,
        error: true,
      };
    }
  }

  const result = iterativeDeepeningSearch(board, config.maxTimeMs, color, config.maxDepth);

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
// Helper to make a move (needed for AI search)
// ============================================================================

function makeMove(board: Board, move: Move): Board {
  const movingPiece = getPieceAt(board, move.from);
  if (!movingPiece) return board;

  const newPieces = board.pieces
    .filter((p) => !(p.position.file === move.to.file && p.position.rank === move.to.rank))
    .map((p) => {
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

export default {
  evaluateBoard,
  getBestMove,
  Difficulty,
  getDifficultyConfig,
};
