/**
 * Rules Engine for Chinese Chess
 * 
 * Check detection, checkmate, stalemate, and legal move validation
 */

import { Board, Position, Color, Move, PieceType } from './types';
import { getPieceAt, getPiecesByColor, findGeneral, makeMove } from './board';

// ============================================================================
// Check Detection
// ============================================================================

function isSquareAttacked(board: Board, square: Position, byColor: Color): boolean {
  // Check if any piece of byColor can attack the square
  const pieces = getPiecesByColor(board, byColor);

  for (const piece of pieces) {
    const moves = getValidMoves(board, piece.position);
    if (moves.some((m: Position) => m.file === square.file && m.rank === square.rank)) {
      return true;
    }
  }

  return false;
}

export function isInCheck(board: Board, color: Color): boolean {
  const generalPos = findGeneral(board, color);
  if (!generalPos) return false;

  const opponentColor = color === Color.Red ? Color.Black : Color.Red;
  return isSquareAttacked(board, generalPos, opponentColor);
}

// ============================================================================
// Legal Move Filtering
// ============================================================================

export function getLegalMoves(board: Board, position: Position): Position[] {
  const piece = getPieceAt(board, position);
  if (!piece) return [];

  const pseudoLegalMoves = getValidMoves(board, position);
  const color = piece.color;

  // Filter moves that would leave own general in check
  return pseudoLegalMoves.filter(move => {
    const simulatedBoard = makeMove(board, createMove(position, move, piece.type));
    return !isInCheck(simulatedBoard, color);
  });
}

export function getAllLegalMovesFiltered(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  const pieces = getPiecesByColor(board, color);

  for (const piece of pieces) {
    const legalMoves = getLegalMoves(board, piece.position);
    for (const to of legalMoves) {
      const captured = getPieceAt(board, to);
      moves.push({ from: piece.position, to, piece: piece.type, captured: captured?.type });
    }
  }

  return moves;
}

function hasAnyLegalMoves(board: Board, _color: Color): boolean {
  const pieces = getPiecesByColor(board, Color.Red);
  for (const piece of pieces) {
    const moves = getLegalMoves(board, piece.position);
    if (moves.length > 0) return true;
  }
  return false;
}

// ============================================================================
// Checkmate Detection
// ============================================================================

export function isCheckmate(board: Board, color: Color): boolean {
  // Must be in check AND have no legal moves
  if (!isInCheck(board, color)) return false;
  return !hasAnyLegalMoves(board, color);
}

// ============================================================================
// Stalemate Detection
// ============================================================================

export function isStalemate(board: Board, color: Color): boolean {
  // Not in check BUT have no legal moves
  if (isInCheck(board, color)) return false;
  return !hasAnyLegalMoves(board, color);
}

// ============================================================================
// Draw Detection
// ============================================================================

export function isDraw(board: Board, _color: Color): boolean {
  // Insufficient material detection
  const redPieces = getPiecesByColor(board, Color.Red);
  const blackPieces = getPiecesByColor(board, Color.Black);

  // King vs King
  if (redPieces.length === 1 && blackPieces.length === 1) {
    return true;
  }

  // King + Advisor/Elephant vs King
  if (redPieces.length === 1 && blackPieces.length === 2) {
    const hasMinorPiece = blackPieces.some(
      (p) => p.type === PieceType.Advisor || p.type === PieceType.Elephant
    );
    if (hasMinorPiece) return true;
  }

  if (blackPieces.length === 1 && redPieces.length === 2) {
    const hasMinorPiece = redPieces.some(
      (p) => p.type === PieceType.Advisor || p.type === PieceType.Elephant
    );
    if (hasMinorPiece) return true;
  }

  return false;
}

// ============================================================================
// Game Status Evaluation
// ============================================================================

export const GameStatus = {
  Playing: 'playing' as const,
  Check: 'check' as const,
  Checkmate: 'checkmate' as const,
  Stalemate: 'stalemate' as const,
  Draw: 'draw' as const,
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export function evaluateGameStatus(board: Board): {
  status: GameStatus;
  winner?: Color;
} {
  const currentColor = board.turn;
  const opponentColor = currentColor === Color.Red ? Color.Black : Color.Red;

  // Check for checkmate
  if (isCheckmate(board, currentColor)) {
    return { status: GameStatus.Checkmate, winner: opponentColor };
  }

  // Check for stalemate
  if (isStalemate(board, currentColor)) {
    return { status: GameStatus.Stalemate };
  }

  // Check for draw
  if (isDraw(board, currentColor)) {
    return { status: GameStatus.Draw };
  }

  // Check for check
  if (isInCheck(board, currentColor)) {
    return { status: GameStatus.Check };
  }

  // Normal play
  return { status: GameStatus.Playing };
}

// ============================================================================
// Helper to create a move (needed for makeMove)
// ============================================================================

function createMove(
  from: Position,
  to: Position,
  piece: PieceType,
  captured?: PieceType
): Move {
  return { from, to, piece, captured };
}
